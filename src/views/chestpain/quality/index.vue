<template>
  <div class="app-container">
    <!-- 顶部指标卡片 -->
    <section class="metrics">
      <article v-for="(card, i) in metricCards" :key="i">
        <span>{{ card.label }}</span>
        <strong v-html="card.displayValue" />
        <small>{{ card.desc }}</small>
      </article>
    </section>

    <!-- 工作区 -->
    <section class="workspace">
      <div class="panel active" style="display:block; padding:18px;">
        <div class="panel-head">
          <div>
            <h2>质控管理</h2>
            <p>统计全国接入医院质控信息，支持全国、省、市三级实时下钻。</p>
          </div>
        </div>

        <!-- 地图 + 侧边栏布局 -->
        <div class="quality-control-layout">
          <!-- 左侧：地图面板 -->
          <section class="map-panel">
            <div class="map-toolbar">
              <div>
                <strong>{{ mapTitle }}</strong>
                <span>{{ mapSub }}</span>
              </div>
              <el-button
                size="small"
                :disabled="scopeLevel === 'country'"
                @click="goBack"
              >返回上级</el-button>
            </div>
            <div class="quality-map" :class="{ 'province-map': scopeLevel !== 'country' }">
              <button
                v-for="region in displayRegions"
                :key="region.name"
                class="map-region"
                :class="{ active: region.name === scopeName }"
                :style="{ left: region.x + '%', top: region.y + '%' }"
                type="button"
                @click="drillDown(region.name)"
              >
                <span>{{ region.name }}</span>
                <small>{{ regionStats(region.name).hospitals }}家接入</small>
              </button>
            </div>
          </section>

          <!-- 右侧：质控数据面板 -->
          <aside class="quality-stat-panel">
            <div class="stat-heading">
              <div>
                <span>实时质控数据</span>
                <h3>{{ scopeName }}</h3>
              </div>
              <small>{{ updateTime }} 更新</small>
            </div>
            <div class="quality-text-stats">
              <article><span>接入系统医院</span><strong>{{ currentStats.hospitals }} 家</strong></article>
              <article><span>累计病例</span><strong>{{ currentStats.cases.toLocaleString('zh-CN') }} 例</strong></article>
              <article><span>疾病类型</span><strong>{{ currentStats.diseases }}</strong></article>
              <article><span>D2CCU</span><strong>{{ currentStats.d2ccu }} 分钟</strong></article>
              <article><span>D2u</span><strong>{{ currentStats.d2u }} 分钟</strong></article>
              <article><span>TPE</span><strong>{{ currentStats.tpe }}%</strong></article>
              <article><span>平均D2B时间</span><strong>{{ currentStats.d2b }} 分钟</strong></article>
              <article><span>首次心电图时间</span><strong>{{ currentStats.ecg }} 分钟</strong></article>
            </div>
          </aside>
        </div>

        <!-- 趋势曲线区域 -->
        <section class="quality-curve-section">
          <div class="panel-head compact">
            <div>
              <h2>近六个月质控趋势</h2>
              <p>每个指标单独展示，一行两个曲线。</p>
            </div>
          </div>
          <div class="quality-single-curves">
            <article v-for="item in curveItems" :key="item.key" class="single-curve-card">
              <div class="curve-title">
                <strong>{{ item.name }}</strong>
                <span>最新 {{ currentStats.trend[item.key].slice(-1)[0] }}{{ item.unit }}</span>
              </div>
              <div :ref="'curve-' + item.key" :style="{ width: '100%', height: '140px' }" />
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
import echarts from 'echarts'

const QUALITY_SEEDS = {
  '全国': { cases: 128642, hospitals: 1869, warnings: 312, d2ccu: 29, d2u: 18, tpe: 91, d2b: 68, ecg: 7.2, diseases: 'STEMI 42% / NSTEMI 31% / UA 19% / 其他 8%', trend: { d2ccu: [36, 34, 32, 31, 30, 29], d2u: [24, 22, 21, 20, 19, 18], d2b: [76, 74, 72, 70, 69, 68], ecg: [8.8, 8.4, 8.1, 7.8, 7.5, 7.2], tpe: [85, 86, 88, 89, 90, 91], stemi: [39, 40, 41, 41, 42, 42], nstemi: [32, 32, 31, 31, 31, 31], ua: [20, 20, 19, 19, 19, 19] } },
  '江苏': { cases: 8642, hospitals: 126, warnings: 28, d2ccu: 25, d2u: 15, tpe: 94, d2b: 61, ecg: 6.4, diseases: 'STEMI 45% / NSTEMI 30% / UA 18% / 其他 7%', trend: { d2ccu: [31, 30, 28, 27, 26, 25], d2u: [20, 19, 18, 17, 16, 15], d2b: [69, 67, 66, 64, 62, 61], ecg: [7.5, 7.2, 6.9, 6.7, 6.5, 6.4], tpe: [89, 90, 91, 92, 93, 94], stemi: [42, 43, 44, 44, 45, 45], nstemi: [31, 31, 30, 30, 30, 30], ua: [19, 19, 18, 18, 18, 18] } },
  '苏州': { cases: 1326, hospitals: 12, warnings: 6, d2ccu: 22, d2u: 13, tpe: 96, d2b: 57, ecg: 5.8, diseases: 'STEMI 47% / NSTEMI 29% / UA 17% / 其他 7%', trend: { d2ccu: [29, 27, 25, 24, 23, 22], d2u: [18, 17, 16, 15, 14, 13], d2b: [65, 63, 61, 60, 58, 57], ecg: [7.0, 6.8, 6.4, 6.2, 6.0, 5.8], tpe: [91, 92, 93, 94, 95, 96], stemi: [44, 45, 45, 46, 46, 47], nstemi: [30, 30, 30, 29, 29, 29], ua: [18, 18, 17, 17, 17, 17] } }
}

const CHINA_PROVINCES = [
  ['新疆', 7, 21], ['西藏', 15, 54], ['青海', 27, 45], ['甘肃', 33, 34], ['宁夏', 43, 38], ['内蒙古', 48, 22],
  ['黑龙江', 78, 10], ['吉林', 77, 19], ['辽宁', 73, 27], ['北京', 63, 31], ['天津', 66, 35], ['河北', 61, 38],
  ['山西', 54, 41], ['陕西', 47, 48], ['四川', 39, 61], ['重庆', 50, 64], ['云南', 37, 78], ['贵州', 49, 75],
  ['广西', 55, 86], ['广东', 65, 88], ['海南', 62, 96], ['河南', 58, 51], ['山东', 67, 45], ['江苏', 72, 55],
  ['安徽', 66, 60], ['上海', 78, 61], ['湖北', 58, 64], ['湖南', 58, 75], ['江西', 66, 73], ['浙江', 75, 69],
  ['福建', 74, 79], ['台湾', 83, 83], ['香港', 68, 94], ['澳门', 65, 94]
].map(([name, x, y]) => ({ name, x, y }))

const JIANGSU_CITIES = [
  ['徐州', 37, 15], ['连云港', 62, 16], ['宿迁', 43, 28], ['淮安', 54, 33], ['盐城', 69, 37], ['扬州', 55, 52],
  ['泰州', 66, 54], ['南京', 34, 61], ['镇江', 48, 63], ['常州', 58, 70], ['无锡', 67, 75], ['苏州', 76, 78], ['南通', 81, 62]
].map(([name, x, y]) => ({ name, x, y }))

const MONTHS = ['2月', '3月', '4月', '5月', '6月', '7月']

const CURVE_DEFS = [
  { key: 'd2ccu', name: 'D2CCU', unit: '分钟', color: '#176fc1', min: 10, max: 85 },
  { key: 'd2u', name: 'D2u', unit: '分钟', color: '#19a7c7', min: 10, max: 85 },
  { key: 'd2b', name: '平均D2B时间', unit: '分钟', color: '#d98b12', min: 10, max: 85 },
  { key: 'ecg', name: '首次心电图时间', unit: '分钟', color: '#d74747', min: 4, max: 10 },
  { key: 'tpe', name: 'TPE', unit: '%', color: '#19a66a', min: 0, max: 100 },
  { key: 'stemi', name: 'STEMI', unit: '%', color: '#176fc1', min: 0, max: 100 },
  { key: 'nstemi', name: 'NSTEMI', unit: '%', color: '#19a7c7', min: 0, max: 100 },
  { key: 'ua', name: 'UA', unit: '%', color: '#d98b12', min: 0, max: 100 }
]

export default {
  name: 'ChestpainQuality',
  data() {
    return {
      metricCards: [
        { label: '全国接入医院', value: '1869', displayValue: '1869', desc: '覆盖 31 个省级区域' },
        { label: '质控预警', value: '312', displayValue: '312', desc: '实时滚动更新' },
        { label: '平均D2B时间', value: '68分', displayValue: '68<em>分</em>', desc: '近六个月下降 8 分' },
        { label: 'TPE', value: '91%', displayValue: '91<em>%</em>', desc: '持续改善' }
      ],
      scopeLevel: 'country',
      scopeName: '全国',
      scopeParent: null,
      curveItems: CURVE_DEFS,
      chartInstances: {}
    }
  },
  computed: {
    currentStats() {
      return this.regionStats(this.scopeName)
    },
    displayRegions() {
      if (this.scopeLevel === 'country') return CHINA_PROVINCES
      if (this.scopeLevel === 'province') {
        if (this.scopeParent === '江苏' || this.scopeName === '江苏') return JIANGSU_CITIES
        const name = this.scopeName
        return [
          { name: `${name}省会`, x: 42, y: 35 }, { name: `${name}东部市`, x: 62, y: 42 },
          { name: `${name}南部市`, x: 54, y: 64 }, { name: `${name}西部市`, x: 32, y: 58 },
          { name: `${name}北部市`, x: 48, y: 20 }
        ]
      }
      return [{ name: this.scopeName, x: 50, y: 50 }]
    },
    mapTitle() {
      return this.scopeLevel === 'country' ? '全国接入医院质控地图' : `${this.scopeName}质控地图`
    },
    mapSub() {
      return this.scopeLevel === 'country' ? '点击省份查看省级统计' : '点击城市查看市级统计，苏州为完整示例'
    },
    updateTime() {
      return new Date().toLocaleTimeString('zh-CN', { hour12: false }) + ' 更新'
    }
  },
  mounted() {
    this.$nextTick(() => { this.renderAllCurves() })
  },
  beforeDestroy() {
    Object.values(this.chartInstances).forEach(chart => chart.dispose())
  },
  methods: {
    regionStats(name) {
      if (QUALITY_SEEDS[name]) return QUALITY_SEEDS[name]
      const code = Array.from(name).reduce((sum, c) => sum + c.charCodeAt(0), 0)
      const d2b = 58 + (code % 18)
      const ecg = +(5.5 + (code % 26) / 10).toFixed(1)
      const tpe = 86 + (code % 11)
      return {
        cases: 700 + (code % 6200), hospitals: 8 + (code % 88), warnings: code % 21,
        d2ccu: 21 + (code % 15), d2u: 12 + (code % 11), tpe, d2b, ecg,
        diseases: 'STEMI 43% / NSTEMI 30% / UA 19% / 其他 8%',
        trend: {
          d2ccu: [d2b - 25, d2b - 27, d2b - 28, d2b - 30, d2b - 32, d2b - 34].map(v => Math.max(18, v)),
          d2u: [d2b - 40, d2b - 42, d2b - 43, d2b - 44, d2b - 45, d2b - 46].map(v => Math.max(10, v)),
          d2b: [d2b + 7, d2b + 5, d2b + 4, d2b + 2, d2b + 1, d2b],
          ecg: [ecg + 1.1, ecg + 0.9, ecg + 0.7, ecg + 0.4, ecg + 0.2, ecg].map(v => +v.toFixed(1)),
          tpe: [tpe - 5, tpe - 4, tpe - 3, tpe - 2, tpe - 1, tpe],
          stemi: [39, 40, 41, 42, 42, 43 + (code % 5)],
          nstemi: [32, 31, 31, 30, 30, 29 + (code % 3)],
          ua: [20, 20, 19, 19, 18, 17 + (code % 3)]
        }
      }
    },
    drillDown(name) {
      if (this.scopeLevel === 'country') {
        this.scopeParent = '全国'
        this.scopeLevel = 'province'
        this.scopeName = name
      } else if (this.scopeLevel === 'province') {
        this.scopeParent = this.scopeName
        this.scopeLevel = 'city'
        this.scopeName = name
      }
      this.$nextTick(() => { this.renderAllCurves() })
    },
    goBack() {
      if (this.scopeLevel === 'city') {
        this.scopeLevel = 'province'
        this.scopeName = this.scopeParent
        this.scopeParent = '全国'
      } else if (this.scopeLevel === 'province') {
        this.scopeLevel = 'country'
        this.scopeName = '全国'
        this.scopeParent = null
      }
      this.$nextTick(() => { this.renderAllCurves() })
    },
    renderAllCurves() {
      const trend = this.currentStats.trend
      this.curveItems.forEach(item => {
        const refKey = 'curve-' + item.key
        const el = this.$refs[refKey]
        if (!el || !el[0]) return
        const key = item.key + '-' + this.scopeName
        let chart = this.chartInstances[key]
        if (!chart) {
          chart = echarts.init(el[0])
          this.chartInstances[key] = chart
        }
        chart.setOption(this.makeCurveOption(item, trend[item.key]))
      })
    },
    makeCurveOption(item, values) {
      return {
        grid: { left: 36, right: 36, top: 16, bottom: 24 },
        xAxis: { type: 'category', data: MONTHS, axisLabel: { fontSize: 10, color: '#68788b' }, axisLine: { lineStyle: { color: '#dce6ef' } } },
        yAxis: { type: 'value', min: item.min, max: item.max, splitLine: { lineStyle: { color: '#dce6ef' } }, axisLabel: { fontSize: 10, color: '#68788b' } },
        series: [{
          type: 'line', data: values, smooth: true,
          lineStyle: { color: item.color, width: 3 },
          itemStyle: { color: item.color },
          symbol: 'circle', symbolSize: 5
        }]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
  article {
    min-height: 108px;
    padding: 18px;
    border: 1px solid $chestLine;
    border-radius: $chestRadiusMd;
    background: $chestSurface;
    box-shadow: $chestShadow;
    span, small { display: block; color: $chestMuted; }
    strong { display: block; margin: 8px 0 4px; color: $chestPrimaryDark; font-size: 32px; }
  }
}

.workspace {
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: $chestSurface;
  box-shadow: $chestShadow;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  &.compact { align-items: flex-start; }
  h2 { margin: 0 0 5px; font-size: 20px; }
  p { margin: 0; color: $chestMuted; font-size: 13px; }
}

.quality-control-layout {
  display: grid;
  grid-template-columns: minmax(640px, 1.2fr) minmax(420px, 0.8fr);
  gap: 18px;
}

.map-panel, .quality-stat-panel {
  min-height: 560px;
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
}

.map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  strong { color: $chestInk; font-size: 20px; }
  span { display: block; margin-top: 4px; color: $chestMuted; font-size: 12px; }
}

.quality-map {
  position: relative;
  min-height: 590px;
  overflow: hidden;
  border: 1px solid #c9ddec;
  border-radius: $chestRadiusMd;
  background:
    linear-gradient(90deg, rgba(23, 111, 193, 0.08) 1px, transparent 1px),
    linear-gradient(0deg, rgba(23, 111, 193, 0.08) 1px, transparent 1px),
    linear-gradient(135deg, #eef7ff, #f8fdff);
  background-size: 34px 34px, 34px 34px, auto;

  &::before {
    content: "";
    position: absolute;
    inset: 54px 78px 48px 64px;
    border-radius: 46% 54% 44% 56% / 38% 42% 58% 62%;
    background: linear-gradient(135deg, rgba(23, 111, 193, 0.12), rgba(25, 167, 199, 0.16));
    box-shadow: inset 0 0 0 1px rgba(23, 111, 193, 0.2);
  }
  &.province-map::before {
    inset: 64px 142px 62px 142px;
    border-radius: 42% 58% 50% 50% / 22% 40% 60% 78%;
    transform: rotate(12deg);
  }
}

.map-region {
  position: absolute;
  z-index: 1;
  display: grid;
  gap: 2px;
  min-width: 62px;
  padding: 6px 8px;
  border: 1px solid rgba(23, 111, 193, 0.22);
  border-radius: $chestRadiusMd;
  color: $chestPrimaryDark;
  background: rgba(255, 255, 255, 0.88);
  text-align: center;
  transform: translate(-50%, -50%);
  box-shadow: 0 10px 22px rgba(23, 72, 114, 0.1);
  cursor: pointer;
  &:hover, &.active {
    color: #ffffff;
    border-color: $chestPrimary;
    background: linear-gradient(135deg, $chestPrimary, $chestCyan);
  }
  span { font-size: 12px; font-weight: 700; }
  small { font-size: 11px; }
}

.quality-stat-panel {
  .stat-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    h3 { color: $chestInk; font-size: 20px; margin: 4px 0 0; }
    span { color: $chestMuted; font-size: 12px; }
    small { color: $chestMuted; font-size: 12px; }
  }
}

.quality-text-stats {
  display: grid;
  gap: 10px;
  article {
    padding: 12px;
    border: 1px solid $chestLine;
    border-radius: $chestRadiusMd;
    background: #ffffff;
    span, strong { display: block; }
    span { margin-bottom: 6px; color: $chestMuted; font-size: 12px; }
    strong { color: $chestPrimaryDark; font-size: 17px; line-height: 1.45; }
  }
}

.quality-curve-section {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
}

.quality-single-curves {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.single-curve-card {
  padding: 14px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #ffffff;
}

.curve-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  strong { font-size: 14px; }
  span { color: $chestMuted; font-size: 12px; }
}

@media (max-width: 900px) {
  .quality-control-layout, .quality-single-curves { grid-template-columns: 1fr; }
}
</style>
