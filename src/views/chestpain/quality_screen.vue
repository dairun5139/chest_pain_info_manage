<template>
  <div class="screen-board">
    <!-- 头部 -->
    <div class="screen-head">
      <div>
        <p>Quality Statistics Screen</p>
        <h2>质控统计分析可视化大屏</h2>
      </div>
      <div class="screen-time">
        <span>实时监测</span>
        <strong>{{ currentTime }}</strong>
      </div>
    </div>

    <!-- 区域筛选 -->
    <div class="screen-filter">
      <label>
        展示范围
        <el-select v-model="selectedRegion" size="small" style="width:150px">
          <el-option label="全国" value="全国" />
          <el-option label="江苏省" value="江苏" />
          <el-option label="苏州市" value="苏州" />
        </el-select>
      </label>
      <span>当前展示{{ selectedRegion }}质控统计分析结果</span>
    </div>

    <!-- 汇总指标卡片 -->
    <div class="screen-summary">
      <article v-for="(card, i) in summaryCards" :key="i">
        <span>{{ card.label }}</span>
        <strong :class="card.danger ? 'danger' : ''">{{ card.value }}</strong>
        <small>{{ card.desc }}</small>
      </article>
    </div>

    <!-- 双趋势图区域 -->
    <div class="screen-analysis-grid">
      <section>
        <div class="screen-panel-title">
          <h3>时间效率趋势</h3>
          <span>D2CCU / D2u / D2B / 心电图</span>
        </div>
        <div ref="timeChart" style="width:100%;height:260px" />
      </section>
      <section>
        <div class="screen-panel-title">
          <h3>治疗与疾病结构</h3>
          <span>TPE / STEMI / NSTEMI / UA</span>
        </div>
        <div ref="diseaseChart" style="width:100%;height:260px" />
      </section>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

const QUALITY_SEEDS = {
  '全国': { hospitals: 1869, cases: 128642, d2b: 68, tpe: 91, trend: { d2ccu: [36, 34, 32, 31, 30, 29], d2u: [24, 22, 21, 20, 19, 18], d2b: [76, 74, 72, 70, 69, 68], ecg: [8.8, 8.4, 8.1, 7.8, 7.5, 7.2], tpe: [85, 86, 88, 89, 90, 91], stemi: [39, 40, 41, 41, 42, 42], nstemi: [32, 32, 31, 31, 31, 31], ua: [20, 20, 19, 19, 19, 19] } },
  '江苏': { hospitals: 126, cases: 8642, d2b: 61, tpe: 94, trend: { d2ccu: [31, 30, 28, 27, 26, 25], d2u: [20, 19, 18, 17, 16, 15], d2b: [69, 67, 66, 64, 62, 61], ecg: [7.5, 7.2, 6.9, 6.7, 6.5, 6.4], tpe: [89, 90, 91, 92, 93, 94], stemi: [42, 43, 44, 44, 45, 45], nstemi: [31, 31, 30, 30, 30, 30], ua: [19, 19, 18, 18, 18, 18] } },
  '苏州': { hospitals: 12, cases: 1326, d2b: 57, tpe: 96, trend: { d2ccu: [29, 27, 25, 24, 23, 22], d2u: [18, 17, 16, 15, 14, 13], d2b: [65, 63, 61, 60, 58, 57], ecg: [7.0, 6.8, 6.4, 6.2, 6.0, 5.8], tpe: [91, 92, 93, 94, 95, 96], stemi: [44, 45, 45, 46, 46, 47], nstemi: [30, 30, 30, 29, 29, 29], ua: [18, 18, 17, 17, 17, 17] } }
}

const MONTHS = ['2月', '3月', '4月', '5月', '6月', '7月']

export default {
  name: 'ChestpainQualityScreen',
  data() {
    return {
      selectedRegion: '全国',
      currentTime: '',
      timer: null
    }
  },
  computed: {
    stats() {
      return QUALITY_SEEDS[this.selectedRegion] || QUALITY_SEEDS['全国']
    },
    summaryCards() {
      return [
        { label: '接入医院', value: this.stats.hospitals, desc: '接入系统数量' },
        { label: '累计病例', value: this.stats.cases.toLocaleString('zh-CN'), desc: '胸痛中心病例' },
        { label: '平均D2B', value: `${this.stats.d2b}分`, desc: '近六个月趋势' },
        { label: 'TPE', value: `${this.stats.tpe}%`, desc: '治疗达标率' }
      ]
    }
  },
  watch: {
    selectedRegion() { this.renderCharts() }
  },
  mounted() {
    this.updateClock()
    this.timer = setInterval(() => { this.updateClock() }, 1000)
    this.$nextTick(() => { this.renderCharts() })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
    if (this.timeChart) this.timeChart.dispose()
    if (this.diseaseChart) this.diseaseChart.dispose()
  },
  methods: {
    updateClock() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('zh-CN', { hour12: false })
    },
    handleResize() {
      if (this.timeChart) this.timeChart.resize()
      if (this.diseaseChart) this.diseaseChart.resize()
    },
    renderCharts() {
      this.renderTimeCurve()
      this.renderDiseaseCurve()
    },
    makeLineOption(seriesConfig, yMax) {
      return {
        grid: { left: 50, right: 100, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: MONTHS, axisLine: { lineStyle: { color: 'rgba(184,212,233,0.22)' } }, axisLabel: { color: '#8abbd1' } },
        yAxis: { type: 'value', max: yMax, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(184,212,233,0.22)' } }, axisLabel: { color: '#8abbd1' } },
        legend: { right: 10, top: 0, textStyle: { color: '#8abbd1' } },
        series: seriesConfig.map(s => ({
          name: s.name,
          type: 'line',
          data: s.values,
          smooth: true,
          lineStyle: { color: s.color, width: 3 },
          itemStyle: { color: s.color },
          symbol: 'circle',
          symbolSize: 6
        }))
      }
    },
    renderTimeCurve() {
      if (!this.$refs.timeChart) return
      if (!this.timeChart) this.timeChart = echarts.init(this.$refs.timeChart)
      const t = this.stats.trend
      this.timeChart.setOption(this.makeLineOption([
        { name: 'D2CCU', values: t.d2ccu, color: '#61d5f0' },
        { name: 'D2u', values: t.d2u, color: '#50db97' },
        { name: 'D2B', values: t.d2b, color: '#ffbe5b' },
        { name: '心电图', values: t.ecg.map(v => v * 10), color: '#ff6969' }
      ], 85))
    },
    renderDiseaseCurve() {
      if (!this.$refs.diseaseChart) return
      if (!this.diseaseChart) this.diseaseChart = echarts.init(this.$refs.diseaseChart)
      const t = this.stats.trend
      this.diseaseChart.setOption(this.makeLineOption([
        { name: 'TPE', values: t.tpe, color: '#50db97' },
        { name: 'STEMI', values: t.stemi, color: '#61d5f0' },
        { name: 'NSTEMI', values: t.nstemi, color: '#ffbe5b' },
        { name: 'UA', values: t.ua, color: '#ff6969' }
      ], 100))
    }
  }
}
</script>

<style lang="scss" scoped>
.screen-board {
  min-height: 100vh;
  padding: 20px;
  border: 1px solid rgba(25, 167, 199, 0.35);
  border-radius: $chestRadiusMd;
  color: $chestScreenText;
  background:
    linear-gradient(90deg, rgba(25, 167, 199, 0.12) 1px, transparent 1px),
    linear-gradient(0deg, rgba(25, 167, 199, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 18% 12%, rgba(25, 167, 199, 0.18), transparent 26%),
    $chestScreenBg;
  background-size: 34px 34px, 34px 34px, auto, auto;
  box-shadow: 0 22px 48px rgba(5, 30, 55, 0.28);
}

.screen-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
  p { margin: 0; color: $chestScreenAccent; font-size: 12px; }
  h2 { margin: 6px 0 0; color: #ffffff; font-size: 26px; }
}

.screen-time {
  min-width: 170px;
  padding: 10px 14px;
  border: 1px solid rgba(97, 213, 240, 0.35);
  border-radius: $chestRadiusMd;
  text-align: right;
  background: rgba(4, 26, 48, 0.72);
  span { display: block; color: $chestScreenMuted; font-size: 12px; }
  strong { display: block; margin-top: 4px; color: #ffffff; font-size: 24px; }
}

.screen-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(97, 213, 240, 0.24);
  border-radius: $chestRadiusMd;
  background: rgba(5, 30, 55, 0.76);
  label { display: flex; align-items: center; gap: 10px; color: $chestScreenMuted; font-weight: 700; }
  span { color: $chestScreenText; }
}

.screen-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
  article {
    min-height: 96px;
    padding: 14px;
    border: 1px solid $chestScreenBorder;
    border-radius: $chestRadiusMd;
    background: $chestScreenPanelBg;
    span, small { display: block; color: $chestScreenMuted; }
    strong { display: block; margin: 6px 0 3px; color: #ffffff; font-size: 32px; }
    .danger { color: $chestScreenRed; }
  }
}

.screen-analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  section {
    padding: 16px;
    border: 1px solid $chestScreenBorder;
    border-radius: $chestRadiusMd;
    background: $chestScreenPanelBg;
  }
}

.screen-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  h3 { margin: 0; color: #ffffff; font-size: 17px; }
  span { color: $chestScreenMuted; font-size: 12px; }
}

@media (max-width: 900px) {
  .screen-summary, .screen-analysis-grid { grid-template-columns: 1fr; }
}
</style>
