<template>
  <div class="dashboard">
    <div style="display: flex; width: 100%;background-color: #ffffff">
      <h2 style="width: 20%;">统计分析</h2>


      <div style="flex: 1; display: flex; align-items: center; gap: 10px; justify-content: flex-end; padding: 0 20px;">
        <label for="startDate"><strong>开始时间:</strong></label>
        <input id="startDate" v-model="startDate" type="date" style="padding:4px 6px; font-size:14px;">
        <label for="endDate"><strong>结束时间:</strong></label>
        <input id="endDate" v-model="endDate" type="date" style="padding:4px 6px; font-size:14px;">
        <button @click="getPatientData()" style="background-color:#1890ff; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">搜索</button>
      </div>
    </div>

    <!-- 月度疾病分类统计（柱状堆叠 + 总数折线） -->
    <div class="chart-container" style="display:block;width:100%;">
      <div class="chart-box full-row">
        <div ref="monthlyDiseaseChart" class="chart">
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-box">
        <!--        <h3>疾病分类</h3>-->
        <div ref="pieChart" class="chart" ></div>
      </div>
      <div class="chart-box text-panel">
  <h3 style="margin:0 0 8px;">按月疾病分类文字分析</h3>
  <div class="text-analysis">
  <div v-for="block in monthlyDiseaseSummary" :key="block.month" class="month-box">
    <strong>{{ block.month }}（总计：{{ block.total }}人）</strong>：
    <span v-for="(item, idx) in block.items" :key="item.name" :style="{color: diseaseColor[item.name] || '#333'}">
      {{ item.name }} {{ item.count }}人<span v-if="idx < block.items.length-1">；</span>
    </span>
  </div>
      </div>

</div>
      <div class="chart-box">
        <!--        -->
        <div ref="fmcToEcgDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.fmcToEcg">
        {{ complianceSummary.fmcToEcg }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.fmcToEcg.length">
        <div v-for="item in warningsVerbose.fmcToEcg" :key="'ECG-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>

      <div class="chart-box">

        <!--        -->
        <div ref="fmcToTroponinDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.fmcToTroponin">
        {{ complianceSummary.fmcToTroponin }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.fmcToTroponin.length">
        <div v-for="item in warningsVerbose.fmcToTroponin" :key="'TN-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>
      <div class="chart-box">

        <!--        -->
        <div ref="doorToBalloonDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.doorToBalloon">
        {{ complianceSummary.doorToBalloon }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.doorToBalloon.length">
        <div v-for="item in warningsVerbose.doorToBalloon" :key="'D2B-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>
            <div class="chart-box">

        <!--        -->
        <div ref="doorToCcuDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.doorToCcu">
        {{ complianceSummary.doorToCcu }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.doorToCcu.length">
        <div v-for="item in warningsVerbose.doorToCcu" :key="'D2CCU-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>
      <div class="chart-box">

        <!--        -->
        <div ref="doorToEchoDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.doorToEcho">
        {{ complianceSummary.doorToEcho }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.doorToEcho.length">
        <div v-for="item in warningsVerbose.doorToEcho" :key="'D2U-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>
      <div class="chart-box">

        <!--        -->
        <div ref="fmcToThrombolysisDataboxPlot" class="chart" ></div>
            <div class="compliance-summary" v-if="complianceSummary.fmcToThrombolysis">
        {{ complianceSummary.fmcToThrombolysis }}
      </div>
      <div class="compliance-warning" v-if="warningsVerbose.fmcToThrombolysis.length">
        <div v-for="item in warningsVerbose.fmcToThrombolysis" :key="'TPE-'+item.month">
          {{ item.month }}月的平均值 {{ item.value }} 分钟不符合参考值（≤{{ item.limit }}）
        </div>
      </div>
      </div>
      </div>



<transition name="fade">
  <div v-if="loadingCount > 0" class="loading-overlay">
    <div class="loading-spinner"></div>
    <div class="loading-text">加载中...</div>
  </div>
</transition>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
import * as d3 from 'd3'

export default {
  data() {
    return {
      loadingCount: 0,
fmcToEcgMean: [], fmcToTroponinMean: [], doorToBalloonMean: [], doorToEchoMean: [], doorToCcuMean: [], fmcToThrombolysisMean: [],
      fmcToEcgMedian: [], fmcToTroponinMedian: [], doorToBalloonMedian: [], doorToEchoMedian: [], doorToCcuMedian: [], fmcToThrombolysisMedian: [],
      diseaseColor: {'诊断中':'#4A90E2','STEMI':'#D0021B','NSTEMI':'#7ED321','UA':'#F5A623','主动脉夹层':'#9013FE','肺动脉栓塞':'#C0392B','非ACS心源性胸痛':'#50E3C2','其它非心源性胸痛':'#9B9B9B','放弃诊疗':'#8B0000','病因未明':'#B0B0B0','其他':'#FF69B4','未诉':'#696969'},

      currentTime: new Date().toLocaleDateString(),
      monthlyDiseaseSummary: [],
      // token:'BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWFueXciLCJjcmVhdGVkIjoxNzQzMzkxNDk1NzA0LCJleHAiOjE3NDM5OTYyOTV9.3y5oiSrUVvqTvtru9yjBB2zupTcsiqW4sEcbOMaiTBIayLGCpElgXL-XOFq8LuFY-YEEypyfIHIY5H-8JaKRlQ',
      startDate: '',
      endDate: '',
      // 定义七个变量
      fmcToEcgData: [], // Ecg
      fmcToTroponinData: [], // TN
      doorToBalloonData: [], // D2B
      fmcToBalloonData: [], // 导管激活
      doorToCcuData: [], // D2CCU
      doorToEchoData: [], // D2超声
      fmcToThrombolysisData: [], // 溶栓
      Months: [],
      NoOfMonths: 5,
      patients: [],
      BoxPlotData: {
        name: ['ECG检查', 'TN', 'D2B', '导管激活', 'D2CCU', 'D2超声', '溶栓', 'CT'],
        data: [
          [10, 12, 15, 20, 25],
          [15, 18, 20, 25, 30],
          [10, 12, 15, 20, 25],
          [15, 18, 20, 25, 30],
          [10, 12, 15, 20, 25],
          [10, 12, 15, 20, 25],
          [15, 18, 20, 25, 30],
          [10, 12, 15, 20, 25]
        ]
      },
      // ReferenceData:[10, 20, 90, 30, 30, 60, 30, 60],
      ReferenceData: [],
      TrendData: {
        name: ['患者1', '患者2', '患者3'],
        data: [
          [10, 12, 15, 20, 25, 31],
          [15, 18, 20, 25, 30, 35],
          [13, 15, 17, 22, 28, 32]
        ]
      },
      PieData: {
        data: [
          { value: 3, name: 'STEMI' },
          { value: 2, name: 'NSTEMI' },
          { value: 7, name: 'UA' },
          { value: 23, name: '非ACS心源性胸痛' },
          { value: 2, name: '肺动脉栓塞' },
          {value: 2,name:'主动脉夹层'},
          {value: 32,name:'其他非心源性胸痛'}
        ]
      },
      DoughnutData: {
        data: [
          { value: 30, name: '成功' },
          { value: 12, name: '失败' },
          { value: 8, name: '未明确' }
        ]
      }

    }
  },
  computed: {
    TrendDataSeries() {
      // 使用 map 方法来遍历 TrendData，并生成 series 数组
      return this.TrendData.name.map((name, index) => ({
        name: name, // 设置医院名称
        type: 'line', // 设置图表类型
        data: this.TrendData.data[index], // 使用对应的数据
        smooth: true // 可以设置平滑曲线
      }))
    }
    ,complianceSummary() {
      const months = Array.isArray(this.Months) ? this.Months : [];
      const normalizeMonth = (lab) => {
        if (lab == null) return '';
        const s = String(lab);
        let m = s.match(/(\d{1,2})(?:月)?$/);
        if (!m) m = s.match(/-(\d{2})$/);
        if (m) return String(parseInt(m[1], 10));
        return s;
      };
      const buildText = (arr, limit) => {
        if (!Array.isArray(arr) || arr.length === 0) return '';
        const segs = [];
        for (let i=0;i<arr.length;i++){
          const v = arr[i];
          if (v == null || isNaN(v)) continue;
          if (Number(v) <= Number(limit)) {
            const monthLabel = normalizeMonth(months[i]);
            const valText = (Math.round(Number(v) * 10) / 10).toFixed(1);
            segs.push(`${monthLabel}月平均值：${valText}`);
          }
        }
        if (segs.length === 0) return '';
        return segs.join('，') + `均已在参考值内（<${limit}）`;
      };
      return {
        fmcToEcg: buildText(this.fmcToEcgMean, 10),
        fmcToTroponin: buildText(this.fmcToTroponinMean, 20),
        doorToBalloon: buildText(this.doorToBalloonMean, 120),
        doorToCcu: buildText(this.doorToCcuMean, 30),
        doorToEcho: buildText(this.doorToEchoMean, 30),
        fmcToThrombolysis: buildText(this.fmcToThrombolysisMean, 30),
      };
    }

    ,warningsVerbose() {
      const months = Array.isArray(this.Months) ? this.Months : [];
      const normalizeMonth = (lab) => {
        if (lab == null) return '';
        const s = String(lab);
        let m = s.match(/(\d{1,2})(?:月)?$/);
        if (!m) m = s.match(/-(\d{2})$/);
        if (m) return String(parseInt(m[1], 10));
        return s;
      };
      const toNum = (x) => {
        const v = Number(x);
        return Number.isFinite(v) ? v : null;
      };
      const build = (arr, limit) => {
        const a = Array.isArray(arr) ? arr : [];
        const out = [];
        for (let i = 0; i < months.length; i++) {
          const v = toNum(a[i]);
          if (v == null) continue;
          if (v > limit) {
            out.push({
              month: normalizeMonth(months[i]),
              value: (Math.round(v * 10) / 10).toFixed(1),
              limit
            });
          }
        }
        return out;
      };
      return {
        fmcToEcg: build(this.fmcToEcgMean, 10),
        fmcToTroponin: build(this.fmcToTroponinMean, 20),
        doorToBalloon: build(this.doorToBalloonMean, 120),
        doorToCcu: build(this.doorToCcuMean, 30),
        doorToEcho: build(this.doorToEchoMean, 30),
        fmcToThrombolysis: build(this.fmcToThrombolysisMean, 30),
      };
    }

  },
  created() {
    // 优先读 route.query.id，确保从列表跳转时显示正确患者
    try {
      const qid = this.$route && this.$route.query && (this.$route.query.id || this.$route.query.patientId);
      if (qid) {
        const num = Number(qid);
        if (num > 0) {
          try { localStorage.setItem('patientId', String(num)); } catch (_) {}
        }
      }
    } catch (_) {}

    const today = new Date()
    const lastYear = new Date()
    lastYear.setMonth(today.getMonth() - 6)
    this.startDate = lastYear.toISOString().split('T')[0]
    this.endDate = today.toISOString().split('T')[0]
    this.getPatientData()
    this.getPatientListData()
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    calculateBoxChart(jsonData) {
      const fields = [
        'fmcToEcgInterval',
        'fmcToTroponinInterval',
        'doorToBalloonInterval',
        'fmc_to_balloon_interval',
        'doorToCcuInterval',
        'doorToEchoInterval',
        'fmcToThrombolysisInterval',
        'doorToCtInterval'
      ]

      const dataByField = {}
      fields.forEach(field => {
        dataByField[field] = jsonData
          .map(item => Number(item[field]))
          // 过滤掉 NaN、0（无效间隔）、负数
          .filter(value => Number.isFinite(value) && value > 0)
      })

      const statsByField = {}
      fields.forEach(field => {
        // const data = dataByField[field].sort((a, b) => a - b);
        const data = dataByField[field]

        // 将数据平均分成 5 组
        const partSize = Math.ceil(data.length / this.NoOfMonths)
        const parts = []

        for (let i = 0; i < this.NoOfMonths; i++) {
          parts.push(data.slice(i * partSize, (i + 1) * partSize))
        }

        // 计算每组的统计值
        statsByField[field] = parts.map(part => {
          if (part.length === 0) return null // 处理空部分

          const q1 = d3.quantile(part, 0.25)
          const median = d3.quantile(part, 0.5)
          const q3 = d3.quantile(part, 0.75)
          const iqr = q3 - q1
          const min = d3.min(part.filter(d => d >= q1 - 1.5 * iqr))
          const max = d3.max(part.filter(d => d <= q3 + 1.5 * iqr))

          return { q1, median, q3, min, max }
        })
      })

      return statsByField
    }
    ,
    calculateMeansByField(jsonData) {
      const fields = [
        'fmcToEcgInterval',
        'fmcToTroponinInterval',
        'doorToBalloonInterval',
        'fmc_to_balloon_interval',
        'doorToCcuInterval',
        'doorToEchoInterval',
        'fmcToThrombolysisInterval',
        'doorToCtInterval'
      ]
      const meansByField = {}
      fields.forEach(field => {
        const data = jsonData.map(item => Number(item[field])).filter(v => Number.isFinite(v) && v > 0)
        if (data.length === 0) { meansByField[field] = []; return }
        const partSize = Math.ceil(data.length / (this.NoOfMonths || 1))
        const parts = []
        for (let i = 0; i < this.NoOfMonths; i++) {
          const chunk = data.slice(i * partSize, (i + 1) * partSize).filter(v => Number.isFinite(v) && v > 0)
          parts.push(chunk)
        }
        meansByField[field] = parts.map(arr => {
          if (!arr || arr.length === 0) return null
          const sum = arr.reduce((a,b)=>a+b,0)
          return +(sum / arr.length).toFixed(2)
        })
      })
      return meansByField
    }
,
    async getPatientListData() {
      try { this.loadingCount++; } catch (_) { this.loadingCount = (this.loadingCount||0)+1; }

      try {
      const id = this.$store.getters.id
      const token = getToken()
      //console.log('token:' + token)
      const response = await axios.post(API_URL + 'pat/frontPatInfo', null,
        {
          // params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      // 处理响应
      if (response.data.code === 200) {
        const mergedPatients = response.data.data
        this.patients = Object.values(
          mergedPatients.reduce((acc, patient) => {
            const { id, outpatientId, patientName, gender, age, firstMedicalTime, onsetTime, diagnosis, userName, status, fillFlag } = patient

            // 过滤掉没有名字的患者
            if (!patientName) {
              return acc // 如果没有名字，直接返回累加器
            }

            // 使用 id 作为唯一标识符
            if (!acc[id]) {
              // 创建新的患者对象并初始化医生名数组
              acc[id] = { id, outpatientId, patientName, gender, age, firstMedicalTime, diagnosis,doctors: []}
            }

            // 添加医生到医生数组中（避免重复）
            if (!acc[id].doctors.includes(userName)) {
              acc[id].doctors.push(userName)
            }

            return acc
          }, {})
        )
        this.PieData = this.generatePieData(this.patients)
        this.buildMonthlyDiseaseSummary()
        this.$nextTick(()=>{ this.initMonthlyDiseaseChart() })
      } else {
        this.loading = false
      }
      } catch (e) {
        console.error('统计分析患者列表加载失败:', e)
      } finally {
        try { this.loadingCount = Math.max(0, (this.loadingCount||1) - 1); } catch (_) {}
      }
},
    generatePieData(diseaseList) {
      // 1. 统计每类疾病的数量
      const countMap = {};
      for (const disease of diseaseList) {
        // 处理空值、空格，统一规范化疾病名称

        const normalizedName = (disease.diagnosis?.trim() || '未知疾病');
        //console.log('disease:' + disease)
        countMap[normalizedName] = (countMap[normalizedName] || 0) + 1;
      }
      //console.log(countMap)
      // 2. 转换为饼图所需格式：{ value: 数量, name: 疾病名称 }
      const pieData = {
        data: Object.entries(countMap).map(([name, value]) => ({
          name,
          value
        }))
      };
      console.log('Data:' + pieData.data)
      return pieData
    },
    /* calculateBoxChart(jsonData) {
      const fields = ['fmcToEcgInterval', 'fmcToTroponinInterval', 'doorToBalloonInterval', 'fmc_to_balloon_interval', 'doorToCcuInterval', 'doorToEchoInterval', 'fmcToThrombolysisInterval', 'doorToCtInterval']
      // const fields = Object.keys(data.data[0])
      // console.log(jsonData)
      const dataByField = {}
      fields.forEach(field => {
        dataByField[field] = jsonData
          .map(item => item[field])
          .filter(value => value !== null && value !== 'N/A')
      })
      const statsByField = {}
      fields.forEach(field => {
        const data = dataByField[field].sort((a, b) => a - b)
        const q1 = d3.quantile(data, 0.25)
        const median = d3.quantile(data, 0.5)
        const q3 = d3.quantile(data, 0.75)
        const iqr = q3 - q1
        const min = d3.min(data.filter(d => d >= q1 - 1.5 * iqr))
        const max = d3.max(data.filter(d => d <= q3 + 1.5 * iqr))
        statsByField[field] = { min, q1, median, q3, max }
      })
      return statsByField
    }, */


    buildMonthlyDiseaseSeries() {
      // 准备月份（使用页面起止日期）
      const months = this.getMonthsBetween(this.startDate, this.endDate)
      const categories = [
        '诊断中','STEMI','NSTEMI','UA','主动脉夹层','肺动脉栓塞',
        '非ACS心源性胸痛','其它非心源性胸痛','放弃诊疗','病因未明','其他','未述'
      ]

      // 初始化 table: month -> category -> count
      const table = {}
      months.forEach(m => { table[m] = {}; categories.forEach(c => (table[m][c] = 0)) })

      // 只以 firstMedicalTime 归属月份
      const toMonth = (ts) => {
        if (!ts) return null
        const d = new Date(ts)
        if (isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        return `${y}-${m}`
      }

      this.patients.forEach(p => {
        const month = toMonth(p.firstMedicalTime)
        if (!month || !table[month]) return
        const diag = (p.diagnosis && String(p.diagnosis).trim()) || '未述'
        const name = categories.includes(diag) ? diag : '未述'
        table[month][name]++
      })

      const colorMap = {
        '诊断中':'#4A90E2','STEMI':'#D0021B','NSTEMI':'#7ED321','UA':'#F5A623','主动脉夹层':'#9013FE',
        '肺动脉栓塞':'#C0392B','非ACS心源性胸痛':'#50E3C2','其它非心源性胸痛':'#9B9B9B','放弃诊疗':'#8B0000',
        '病因未明':'#B0B0B0','其他':'#FF69B4','未述':'#2C3E50'
      }

      const barSeries = categories.map(cat => ({
        name: cat,
        type: 'bar',
        data: months.map(m => table[m][cat] || 0),
        itemStyle: { color: colorMap[cat] || '#ccc' },
        barMaxWidth: 24,
        barCategoryGap: '20%',
        barGap: '0%'
      }))

      const total = months.map(m => Object.values(table[m]).reduce((a, b) => a + b, 0))
      const lineSeries = {
        name: '每月总数',
        type: 'line',
        lineStyle: { color: '#000', width: 2 },
        itemStyle: { color: '#000' },
        label: { show: true, position: 'top', color: '#000' },
        yAxisIndex: 1,
        data: total
      }

      return { months, categories, barSeries, lineSeries, total }
    }

,
    buildMonthlyDiseaseSummary() {
      const months = this.getMonthsBetween(this.startDate, this.endDate)
      const categories = [
        '诊断中','STEMI','NSTEMI','UA','主动脉夹层','肺动脉栓塞',
        '非ACS心源性胸痛','其它非心源性胸痛','放弃诊疗','病因未明','其他','未述'
      ]
      const toMonth = (ts) => {
        if (!ts) return null
        const d = new Date(ts)
        if (isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        return `${y}-${m}`
      }
      const monthMap = {}
      months.forEach(m => { monthMap[m] = {}; categories.forEach(c => (monthMap[m][c] = 0)) })
      this.patients.forEach(p => {
        const month = toMonth(p.firstMedicalTime)
        if (!month || !monthMap[month]) return
        const diag = (p.diagnosis && String(p.diagnosis).trim()) || '未述'
        const name = categories.includes(diag) ? diag : '未述'
        monthMap[month][name]++
      })
      this.monthlyDiseaseSummary = months.map(m => {
        const total = Object.values(monthMap[m]).reduce((a, b) => a + b, 0)
        const items = Object.entries(monthMap[m])
          .filter(([_, v]) => v > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({
            name,
            count,
            percent: total ? (Math.round((count / total) * 1000) / 10).toFixed(1) : '0.0'
          }))
        return { month: m, total, items }
      })
    }
,

    initMonthlyDiseaseChart() {
      const dom = this.$refs.monthlyDiseaseChart
      if (!dom) return
      if (dom.chart && dom.chart.dispose) dom.chart.dispose()
      const myChart = echarts.init(dom)
      dom.chart = myChart

      const { months, categories, barSeries, lineSeries } = this.buildMonthlyDiseaseSeries()

      myChart.setOption({
        title: { text: '疾病分类（按月统计）', left: 'center' ,top: 8},
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { type: 'scroll', bottom:0, left: 10, right: 10, data: [...categories, '每月总数'] },
        grid: { left: 40, right: 40, top: 60, bottom: 60 },
        xAxis: { type: 'category', data: months, axisLabel: { rotate: 0 }, axisTick: { alignWithLabel: true } },
        yAxis: [
          { type: 'value', name: '病例数(人)' },
          { type: 'value', name: '总数', minInterval: 1 }
        ],
        series: [...barSeries, lineSeries]
      })
    },
formatDate(dateString) {
      // 将字符串分割为年份、月份和日期
      const [year, month, day] = dateString.split('-')

      // 返回去掉前导零的格式
      return `${year}/${parseInt(month)}/${parseInt(day)}`
    },
    async getPatientData() {
      try { this.loadingCount++; } catch (_) { this.loadingCount = (this.loadingCount||0)+1; }

      try {
      this.Months = this.getMonthsBetween(this.startDate, this.endDate);
      this.NoOfMonths = this.Months.length || 1;

      // 重新生成按月汇总与柱状+折线图（基于当前起止日期）
        this.buildMonthlyDiseaseSummary();
        this.$nextTick(()=>{ this.initMonthlyDiseaseChart() });
        // console.log("id:"+ typeof id);
      const token = getToken()
      // const token = 'BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWFueXciLCJjcmVhdGVkIjoxNzQzMzkxNDk1NzA0LCJleHAiOjE3NDM5OTYyOTV9.3y5oiSrUVvqTvtru9yjBB2zupTcsiqW4sEcbOMaiTBIayLGCpElgXL-XOFq8LuFY-YEEypyfIHIY5H-8JaKRlQ'

      const response1 = await axios.post(API_URL + 'pat/timemanagement', null,
        {
          params: {
            startTime: this.formatDate(this.startDate),
            endTime: this.formatDate(this.endDate)
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      // console.log("response : " , response)
      // 处理响应
      if (response1.data.code === 200) {
        const jsData = response1.data.data
        jsData.forEach(item => {
          const { userName, ...rest } = item
          const fields = [
            'fmcToEcgInterval',
            'fmcToTroponinInterval',
            'doorToBalloonInterval',
            'fmc_to_balloon_interval',
            'fmcToBalloonInterval',
            'doorToCcuInterval',
            'doorToEchoInterval',
            'fmcToThrombolysisInterval',
            'doorToCtInterval'
          ]
          fields.forEach(f => { if (Object.prototype.hasOwnProperty.call(item, f)) item[f] = Number(item[f]) })
        })
        // 使用解构赋值和剩余运算符排除 userName 字段

        this.getMonthsBetween(this.startDate, this.endDate)
        this.NoOfMonths = this.Months.length
        //console.log(this.startDate + ' , ' + this.endDate + ' , ' + this.NoOfMonths)
        const boxChartData = this.calculateBoxChart(jsData)
        //console.log('boxChartData ')
        //console.log(boxChartData)
        const filteredBoxChartData = {}
        for (const [key, value] of Object.entries(boxChartData)) {
          if (value) {
            filteredBoxChartData[key] = value
          }
          //console.log('key : ', key)
        }
        /* const filteredBoxChartData = {}
        for (const [key, value] of Object.entries(boxChartData)) {
          if (value) {
            filteredBoxChartData[key] = value
          }
          console.log('key : ', key)
        } */

        // this.BoxPlotData.name = Object.keys(filteredBoxChartData).filter(key => boxChartData[key]);
        // this.BoxPlotData.data = Object.values(filteredBoxChartData).map(item => [item.min, item.q1, item.median, item.q3, item.max])
        // console.log('this.BoxPlotData.data')
        // console.log(this.BoxPlotData.data)
        // 分配数据到对应变量，添加条件检查
        this.fmcToEcgData = filteredBoxChartData['fmcToEcgInterval']
          ? filteredBoxChartData['fmcToEcgInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []

        this.fmcToTroponinData = filteredBoxChartData['fmcToTroponinInterval']
          ? filteredBoxChartData['fmcToTroponinInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []

        this.doorToBalloonData = filteredBoxChartData['doorToBalloonInterval']
          ? filteredBoxChartData['doorToBalloonInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []

        /* this.fmcToBalloonData = filteredBoxChartData['fmc_to_balloon_interval']
          ? filteredBoxChartData['fmc_to_balloon_interval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []; */

        this.doorToCcuData = filteredBoxChartData['doorToCcuInterval']
          ? filteredBoxChartData['doorToCcuInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []

        this.doorToEchoData = filteredBoxChartData['doorToEchoInterval']
          ? filteredBoxChartData['doorToEchoInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []

        this.fmcToThrombolysisData = filteredBoxChartData['fmcToThrombolysisInterval']
          ? filteredBoxChartData['fmcToThrombolysisInterval'].map(item => [
            item.min !== undefined ? item.min : null,
            item.q1 !== undefined ? item.q1 : null,
            item.median !== undefined ? item.median : null,
            item.q3 !== undefined ? item.q3 : null,
            item.max !== undefined ? item.max : null
          ])
          : []
        const means = this.calculateMeansByField(jsData)
      this.fmcToEcgMean = means['fmcToEcgInterval']
      this.fmcToTroponinMean = means['fmcToTroponinInterval']
      this.doorToBalloonMean = means['doorToBalloonInterval']
      this.doorToEchoMean = means['doorToEchoInterval']

      this.doorToCcuMean = means['doorToCcuInterval']
      this.fmcToThrombolysisMean = means['fmcToThrombolysisInterval']
      this.initCharts()
      } else {
        // this.loading = false
      }

      } catch (e) {
        console.error('统计分析数据加载失败:', e)
      } finally {
        try { this.loadingCount = Math.max(0, (this.loadingCount||1) - 1); } catch (_) {}
      }
},
// 工具函数：获取两个日期之间的所有月份
    getMonthsBetween(startDateStr, endDateStr) {
      const months = [];
      let startDate = new Date(startDateStr);
      let endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return [];
      }
      if (startDate > endDate) {
        const tmp = startDate;
        startDate = endDate;
        endDate = tmp;
      }

      let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const monthStr = month.toString().padStart(2, '0');
        months.push(`${year}-${monthStr}`);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return months;
    },

    initCharts() {
      this.Months = this.getMonthsBetween(this.startDate, this.endDate)
      this.NoOfMonths = this.Months.length
      this.initfmcToEcgDataBoxPlot()
      this.initfmcToTroponinDataBoxPlot()
      this.initdoorToBalloonDataBoxPlot()
      // this.initfmcToBalloonDataBoxPlot()
      this.initdoorToCcuDataBoxPlot()
      this.initdoorToEchoDataBoxPlot()
      this.initfmcToThrombolysisDataBoxPlot()

      this.initPieChart()
          },

    onResize() {
      const refs = [
        'pieChart', 'monthlyDiseaseChart',
        'fmcToEcgDataboxPlot', 'fmcToTroponinDataboxPlot',
        'doorToBalloonDataboxPlot', 'fmcToBalloonDataboxPlot',
        'doorToCcuDataboxPlot', 'doorToEchoDataboxPlot',
        'fmcToThrombolysisDataboxPlot'
      ];
      refs.forEach(r => {
        const el = this.$refs[r];
        if (el && el.chart && typeof el.chart.resize === 'function') {
          el.chart.resize();
        }
      });
    },
    initfmcToEcgDataBoxPlot() {
      const el = this.$refs.fmcToEcgDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: 'ECG检查时间', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0}
      },
        yAxis: { type: 'value'},
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.fmcToEcgMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          { type: 'boxplot',
            data: this.fmcToEcgData,
            z:1,
            itemStyle:{opacity:0.75}
          },
          { type: 'line',
            name: '平均值',
            data: this.fmcToEcgMean,
            symbolSize:10,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3},
            itemStyle:{color:'blue'},
            z:10,
            xAxisIndex: 0,
            zlevel: 1,
            clip:false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 8),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },

    initfmcToTroponinDataBoxPlot() {
      const el = this.$refs.fmcToTroponinDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: '肌钙蛋白检查时间（TN）', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0,
        }
      },
        yAxis: { type: 'value' },
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.fmcToTroponinMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          { type: 'boxplot',
            data: this.fmcToTroponinData ,
            z:1,
            itemStyle:{opacity: 0.75}
          },
          {
            type: 'line',
            name: '平均值',
            data: this.fmcToTroponinMean,
            symbolSize:10,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3 },
            itemStyle:{color:'blue'} ,
            xAxisIndex: 0,
            z:10,
            zlevel:1,
            clip:false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 16),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },

    initdoorToBalloonDataBoxPlot() {
      const el = this.$refs.doorToBalloonDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: '入院至球囊扩张检查时间（D2B）', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0,
        }
      },
        yAxis: { type: 'value'},
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.doorToBalloonMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          {
            type: 'boxplot',
            data: this.doorToBalloonData ,
            z:1,
            itemStyle:{ opacity:0.75}
          },
          {
            type: 'line',
            name: '平均值',
            data: this.doorToBalloonMean,
            symbolSize:10,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3 },
            itemStyle:{color:'blue'} ,
            xAxisIndex: 0,
            z:10,
            zlevel:1,
            clip: false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 90),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },
    initfmcToBalloonDataBoxPlot() {
      const chartDom = this.$refs.fmcToBalloonDataboxPlot
      const myChart = echarts.init(chartDom)
      this.$refs.fmcToBalloonDataboxPlot.chart = myChart
      const option = {
        title: { text: '导管激活时间' },
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.fmcToEcgMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        xAxis: {
          type: 'category',
          data: this.Months,
          axisLabel: {
            rotate: 0,
            show: true
          }
        },
        yAxis: {
          name: '分钟'
        },
        series: [{
          type: 'boxplot',
          data: this.fmcToBalloonData
        }
          /* {
            type: 'scatter',
            data: this.ReferenceData,
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: {
              color: 'red',
            }
          } */
        ]
      }
      myChart.setOption(option)
    },
    initdoorToCcuDataBoxPlot() {
      const el = this.$refs.doorToCcuDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: '门诊到监护室时间（D2CCU）', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0
        }
      },
        yAxis: { type: 'value' },
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.doorToCcuMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          {
            type: 'boxplot',
            data: this.doorToCcuData ,
            z:1,
            itemStyle:{opacity:0.75}
          },
          {
            type: 'line',
            name: '平均值',
            data: this.doorToCcuMean,
            symbolSize:10,
            connectNulls: true,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3 },
            itemStyle:{color:'blue'},
            xAxisIndex: 0,
            z:10,
            zlevel:1,
            clip:false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 24),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },
    initdoorToEchoDataBoxPlot() {
      const el = this.$refs.doorToEchoDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: '门诊到超声检查时间（D2U）', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0,
        }
      },
        yAxis: { type: 'value' },
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.doorToEchoMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          {
            type: 'boxplot',
            data: this.doorToEchoData,
            z:1,
            itemStyle:{opacity:0.75}
          },
          {
            type: 'line',
            name: '平均值',
            data: this.doorToEchoMean,
            symbolSize:10,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3 },
            itemStyle:{color:'blue'},
            xAxidIndex: 0,
            z:10,
            zlevel:1,
            clip:false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 24),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },

    initfmcToThrombolysisDataBoxPlot() {
      const el = this.$refs.fmcToThrombolysisDataboxPlot
      if (!el) return
      if (el.chart && el.chart.dispose) el.chart.dispose()
      const myChart = echarts.init(el)
      el.chart = myChart

      const option = {
    title: { text: '溶栓检查时间（TPE）', left: 'center' },
        grid: { left: 40, right: 20, top: 30, bottom: 60 },
        xAxis: {
        type: 'category',
        data: this.Months,
        axisLabel: {
          interval: 0,
        }
      },
        yAxis: { type: 'value'},
        tooltip: {
          trigger: 'item',
          formatter: ({ data ,dataIndex}) => {
            const mean =(this.fmcToThrombolysisMean || [])[dataIndex]
            const meanText =(mean ==null ? '-': mean)
            return  `
        <div>
          最小值: ${data[0]}<br/>
          第一四分位数: ${data[1]}<br/>
          中位数: ${data[2]}<br/>
          第三四分位数: ${data[3]}<br/>
          最大值: ${data[4]}<br/>
          均值：${meanText}
        </div>
      `
          }
        },
        series: [
          {
            type: 'boxplot',
            data: this.fmcToThrombolysisData,
            z:1,
            itemStyle:{opacity:0.75}
          },
          {
            type: 'line',
            name: '平均值',
            data: this.fmcToThrombolysisMean,
            symbolSize:10,
            connectNulls: true,
            symbol: 'circle',
            label:{ show:true, position:'top', distance:6, formatter:(p)=> (p && p.value!=null && !isNaN(p.value) ? (Math.round(p.value*10)/10).toString() : '') },
            lineStyle: { width: 3 },
            itemStyle:{color:'blue'},
            xAxidIndex:0,
            z:10,
            zlevel:1,
            clip:false
          },
          { type: 'line',
            name: '全院平均水平',
            data: this.Months.map(() => 24),
            symbolSize: 6,
            symbol: 'diamond',
            lineStyle: { width: 2, type: 'dashed', color: '#ff7c00' },
            itemStyle: { color: '#ff7c00' },
            label: { show: false },
            z: 9,
            clip: false
          }
          ]
      }
      myChart.setOption(option)
    },



    initPieChart() {
      const chartDom = this.$refs.pieChart
      const myChart = echarts.init(chartDom)
      this.$refs.pieChart.chart = myChart
      const option = {
        title: { text: '疾病分类' },
        series: [{
          type: 'pie',
          data: this.PieData.data,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c}例',
            fontSize: 12,
            color: '#333'
          }
        }]
      }
      myChart.setOption(option)
    }
}
}
</script>

<style scoped>.chart.large{height:380px;}
.chart-box.full-row{width:100%;}

.dashboard {
  padding: 20px;
  background-color: #f9f9f9;
}

.info-item {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 在主轴方向拉开空间 */

}

.info-row {
  display: flex;
  flex-direction: column; /* 垂直排列标题和内容 */
  flex: 1 1 calc(20% - 20px); /* 每个信息项占据相同宽度，减去左右间距 */
  margin: 10px; /* 顶部和底部间距，左右间距会因宽度计算而减少 */
  min-width: 120px; /* 设置一个最小宽度防止过小 */
}

.chart-container{display:flex;flex-wrap:wrap;gap:20px;}

.chart-box{background:#fff;padding:10px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.1);width:calc(50% - 20px);}

.chart {
  width: 100%; /* 图表宽度自适应 */
  height: 40vh;
}

.text-analysis { line-height: 1.7;overflow-y: auto; }
.month-block { margin-bottom: 14px; padding: 10px 12px; background:#fafafa; border-radius:8px; }
.month-title { font-weight: 600; margin-bottom: 6px; }
.month-list { margin: 0; padding-left: 18px; }
.month-list li { margin: 2px 0; }

.month-box{
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  padding: 8px;
  margin-bottom: 10px;
  height:auto;
  overflow-y: visible;
  line-height: 1.6;

}


/* 固定“按月疾病分类文字分析”板块高度，并为内容区加滚动条以适配溢出 */
.chart-box.text-panel{
  height: 420px;           /* 固定整个板块的高度，可按需调整 */
  display: flex;
  flex-direction: column;
}
.chart-box.text-panel h3{
  flex: 0 0 auto;
}
.chart-box.text-panel .text-analysis{
  flex: 1 1 auto;
  overflow-y: auto;        /* 垂直方向滚动 */
  overflow-x: hidden;      /* 避免横向滚动条 */
  padding-right: 8px;      /* 给滚动条留一些空间，避免遮挡文字 */
}

/* 可选：每个月份卡片内部保持自动高度 */
.chart-box.text-panel .month-box{
  height: auto;
  overflow: visible;
}

.compliance-warning{color:#e02424;margin-top:6px;font-size:12px;line-height:1.5;}

.compliance-summary{
  color: #000;
  font-size: 12px;
  margin-top: 4px;
  white-space: normal;
}


.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(1px);
}
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #ddd;
  border-top-color: #409EFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }

</style>
