<template>
  <div class="container" :key="String(($route && $route.query && ($route.query.id || $route.query.patientId)) || (patient && patient.id))">
    <div class="header">
      <h3>行医记录分析</h3>
      <button class="switch-btn" @click="openSwitchDialog">切换</button>
    </div>

    <div class="patient-info">
      <div class="info-item">
        <div class="info-row">
          <p><strong>门诊ID信息:</strong></p>
          <p>{{ patient.outpatientId }}</p>
        </div>
        <div class="info-row">
          <p><strong>姓名:</strong></p>
          <p>{{ patient.name }}</p>
        </div>
        <div class="info-row">
          <p><strong>入院时间:</strong></p>
          <p>{{  formatDate_new(patient.admissionTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>出院时间:</strong></p>
          <p>{{ formatDate_new(patient.dischargeTime)}}</p>
        </div>
        <div class="info-row">
          <p><strong>主治医生 :</strong></p>
          <p>{{ patient.doctor }}</p>
        </div>
      </div>
    </div>

    <table class="analysis-table">
      <thead>
        <tr>
          <th>临床诊断分析</th>
          <th>时间点</th>
          <th>用  时</th>
          <th>是否符合指南</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in analysis" :key="index">
          <td>{{ item.analysis }}</td>
          <td>{{ item.time }}</td>
          <td>{{ item.interval }}</td>
          <td>
            <span :class="{'status-yes': item.guideline === '符合', 'status-no': item.guideline !== '符合'}">
              {{ item.guideline === '符合' ? '符合' : '不符合' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
 <h3>胸痛急救时间轴</h3>
    <!-- 时间轴核心区域（中间虚线 + 箭头） -->
    <div class="timeline-axis">
      <!-- 蓝色虚线 -->
      <div class="axis-dash"></div>
      <!-- 每个节点的箭头与时间 -->
      <div
        v-for="(node, index) in analysis"
        :key="index"
        class="axis-node"
      >
        <div class="arrow-up"></div>
        <div class="node-name">{{ node.name }}</div> <!-- 新增名称显示 -->
        <div class="node-time">{{ node.time }}</div>

      <div
        v-if="node.interval !== undefined && node.interval !== null && node.interval !== '' && node.interval !== '/'"
        class="node-interval"
      >
        {{ typeof node.interval === 'number' ? (node.interval + ' 分钟') : node.interval }}
      </div></div>
    </div>
    <!-- 实际时长区域（下半部分红线 + 时长） -->
    <div class="timeline-duration">
      <!-- 红色实线 -->
      <div class="duration-line"></div>
      <!-- 每个节点的时长 -->
      <div
        v-for="(node, index) in interval"
        :key="index"
        class="duration-item"
      >
        <div class="duration-text">{{ node.interval }}</div>
      </div>
    </div>
    <div class="content">

    <!-- 新增：关键流程用时对标与全院平均（柱状+折线） -->
    <section id="combo-chart-section" class="full-row">
      <div class="section-title">关键流程用时对标与全院平均</div>
      <div ref="comboChartRef" class="combo-chart"></div>
      <div class="chart-note">
        注：<span class="legend-dot actual"></span>用时（当前患者）
        <span class="legend-dot standard"></span>标准（阈值，半透明）
        <span class="legend-dot avg"></span>全院平均（折线）
      </div>
    </section>
    <!-- 新增：改进与建议（科研扩展与建议下方） -->
    <section id="improvement-suggestions" v-if="improvementList.length" class="full-row">
      <div class="section-title">改进与建议</div>
      <ul class="suggest-list">
        <li v-for="(item, i) in improvementList" :key="i">
          <strong>{{ item.name }}：</strong>{{ item.suggestion }}
        </li>
      </ul>
    </section>

<h3>关键时间窗的临床依据</h3>
      <ol>
        <li>D2B ≤90分钟
          <ul>
            <li>依据：ACC/AHA指南指出，每延迟15分钟，STEMI患者死亡率增加1%</li>
            <li>例外：若首诊医院无PCI能力，需在30分钟内启动转运（DIDO时间）</li>
          </ul>
        </li>
        <li>肌钙蛋白（TN）快速检测
          <ul>
            <li>高敏肌钙蛋白（hs-cTn）可在1小时内完成0/1h或0/2h算法，加速NSTEMI诊断</li>
          </ul>
        </li>
        <li>溶栓时间窗
          <ul>
            <li>黄金时间：发病后3小时内（每延迟1小时，死亡率增加1.6%）</li>
            <li>补救PCI：溶栓失败后需在60-120分钟内转运</li>
          </ul>
        </li>
      </ol>
      <hr>
      <h3>影响时效的常见因素</h3>
      <ul>
        <li>流程瓶颈：
          <ul>
            <li>心电图传输延迟（建议：预检分诊时即完成心电图）</li>
            <li>肌钙蛋白检测周转时间（TAT）过长（需优化检验科快速通道）</li>
          </ul>
        </li>
        <li>系统问题：
          <ul>
            <li>导管室激活机制不明确（建议：建立一键激活系统）</li>
            <li>多科室协作不畅（需定期演练胸痛流程）</li>
          </ul>
        </li>
      </ul>
      <hr>
      <h3>质量改进方向</h3>
      <ol>
        <li>信息化建设
          <ul>
            <li>电子胸痛时间轴自动记录（避免人工记录误差）</li>
            <li>移动端心电图传输（救护车→医院）</li>
          </ul>
        </li>
        <li>标准化培训
          <ul>
            <li>非心内科医师的STEMI识别能力（如急诊科、全科医生）</li>
            <li>导管团队7×24小时待命制度</li>
          </ul>
        </li>
        <li>区域协同网络
          <ul>
            <li>建立院前-院内数据共享平台</li>
            <li>明确转运指征（如PCI中心D2B时间优于溶栓时优先转运）</li>
          </ul>
        </li>
      </ol>
      <hr>
      <h3>科研扩展建议</h3>
      <ul>
        <li>时间依赖性分析：研究各环节时间缩短对30天死亡率的影响（如D2B每减少15分钟对预后的改善）</li>
        <li>特殊人群差异：女性、老年人、糖尿病患者是否存在时间延迟倾向</li>
        <li>如需具体医院的基准数据或流程优化方案，可进一步提供机构类型（三级医院/基层医院）和现有痛点。</li>
      </ul>
    </div>

  <!-- 切换患者弹窗（analysis 正式版） -->
  <div v-if="switchDialog.visible" class="modal-backdrop" @click.self="closeSwitchDialog">
    <div class="modal">
      <div class="modal-header">
        <div class="title">切换患者</div>
        <div class="search-bar">
          <input v-model.trim="switchDialog.keyword" type="text" placeholder="搜索姓名或住院号" @keyup.enter="applyFilter()" />
          <button @click="applyFilter()">搜索</button>
        </div>
      </div>
      <div class="modal-body">
        <div v-if="switchDialog.loading" class="hint">加载中…</div>
        <div v-else-if="switchDialog.error" class="error">{{ switchDialog.error }}</div>
        <table v-else class="list-table" style="width: 100%;text-align: center;">
          <thead>
            <tr><th style="width: 12%;">姓名</th>
              <th style="width: 12%;">住院号</th>
              <th style="width: 8%;">性别</th>
              <th style="width: 8%;">年龄</th>
              <th style="width: 18%;">首次医疗接触时间</th>
              <th style="width: 18%;">发病时间</th>
              <th style="width: 14%;">诊断</th>
              <th style="width: 10%;">主治医生</th></tr>
          </thead>
          <tbody>
          <tr v-for="p in switchDialog.filtered" :key="p.id" @click="switchDialog.selectedId = p.id; confirmSwitch()" :style="{backgroundColor:switchDialog.selectedId === p.id?'#e6f7ff':'',cursor:'pointer'}">
            <td>{{ p.patientName }}</td>
            <td>{{ p.outpatientId }}</td>
            <td>{{ p.gender || "" }}</td>
            <td>{{ p.age != null ? p.age : "" }}</td>
            <td>{{ formatDate_new(p.firstMedicalTime) }}</td>
            <td>{{ formatDate_new(p.onsetTime) }}</td>
            <td>{{ p.diagnosis || "" }}</td>
            <td>{{formatDoctors( p.doctors) }}</td>
            </tr>
            <tr v-if="!switchDialog.filtered.length && !switchDialog.loading"><td colspan="2" class="hint">没有匹配的患者</td></tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="ghost" @click="closeSwitchDialog">取消</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
import * as echarts from 'echarts'
// [CACHE-BEGIN] 患者列表简单缓存（10分钟）
const PAT_LIST_CACHE_KEY = 'PAT_FRONT_LIST_CACHE_V1';
const PAT_LIST_CACHE_TTL =  10 * 60 * 1000; // 10分钟

function _readPatListCache() {
  try {
    // 优先读取首页写入的 sessionStorage 过滤结果（10分钟保鲜）
    const rawS = sessionStorage.getItem('filteredPatients');
    const tsS  = Number(sessionStorage.getItem('filteredPatientsUpdatedAt') || 0);
    if (rawS && tsS && (Date.now() - tsS) < (10 * 60 * 1000)) {
      const arr = JSON.parse(rawS);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (_) {}

  // 兜底：再读本页写入的 localStorage 缓存
  try {
    const raw = localStorage.getItem(PAT_LIST_CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return null;
    const { ts, data } = obj;
    if (!Array.isArray(data)) return null;
    if (typeof ts !== 'number') return null;
    if (Date.now() - ts > PAT_LIST_CACHE_TTL) return null; // 过期
    return data;
  } catch (_) { return null; }
}

function _writePatListCache(list) {
  try {
    if (Array.isArray(list)) {
      localStorage.setItem(PAT_LIST_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list }));
    }
  } catch (_) {}
}
// [CACHE-END]

export default {
  watch: {
    'patient.id'(id) {
      if (!id) return;
      this.disposeChart && this.disposeChart();
      this.$nextTick(() => {
        this.initChart && this.initChart();
        this.renderOrUpdateChart && this.renderOrUpdateChart();
        this.chart && this.chart.resize && this.chart.resize();
        setTimeout(() => { this.chart && this.chart.resize && this.chart.resize(); }, 50);
      });
    },
'$route.query.id': {
      immediate: false,
      handler(nv, ov) {
        const id = Number(nv || (this.$route && this.$route.query && this.$route.query.patientId));
        if (!Number.isFinite(id) || id <= 0) return;
        if (String(id) === String(this.patient && this.patient.id)) return;
        this.setEffectivePatientId && this.setEffectivePatientId(id, { updateUrl: false, reload: false });
        this.getPatientData && this.getPatientData();
        this.getPatientTrae && this.getPatientTrae();
      }
    },
    analysis: { deep: true, handler() { this.parseDurationsFromAnalysis(); this.$nextTick(() => { this.renderOrUpdateChart(); this.generateImprovementSuggestions(); }) } }
  },
  beforeDestroy() {
    try { if (this.chartResizeObserver) { this.chartResizeObserver.disconnect(); this.chartResizeObserver = null } } catch(_) {}
    try { if (this._onWinResize) { window.removeEventListener('resize', this._onWinResize); this._onWinResize = null } } catch(_) {}
  },
  data() {
    return {
      chartResizeObserver: null,
      _onWinResize: null,

      switchDialog: { visible:false, loading:false, error:'', keyword:'', rawList:[], filtered:[], selectedId:null },
      improvementList: [],

      // —— 组合图数据 ——
      categories: [
        { key: 'ecg',        label: '心电图采集时间' },
        { key: 'troponin',   label: '肌钙蛋白时间' },
        { key: 'thrombolysis', label: '溶栓时间' },
        { key: 'd2b',        label: 'D2B时间' },
        { key: 'ccu',        label: '转至CCU时间' },
        { key: 'ct',         label: 'CT时间' },
        { key: 'echo',       label: '心脏彩超时间' }
      ],
      currentDurations: { ecg: 0, troponin: 0, thrombolysis: 0, d2b: 0, ccu: 0, ct: 0, echo: 0 },
      standardDurations: { ecg: 10, troponin: 30, thrombolysis: 30, d2b: 90, ccu: 30, ct: 60, echo: 10 },
      avgDurationsAllPatients: {},
      startDate: '',
      endDate: '',
      chart: null,

      patient: {
        id: '2',
        name: '张勇',
        admissionTime: '2025-02-23 12:30',
        dischargeTime: '已出院',
        doctor: '李智兴'
      },
      standardGuide: {
        onsetTime: {
          analysis: '患者发病，症状发作',
          Interval: 30
        },
        firstMedicalTime: {
          analysis: '首次医疗接触（FMC），启动医疗干预',
          Interval: 40,
        },
        greenChannelTime:{
          analysis: '医护人员根据患者症状（典型胸痛），初步评估，立即启动救治绿色通道',
          Interval: 40
        },
        ecgTime:{
          analysis: '医护人员立即为患者完成床旁12导联心电图（无需等待，绿色通道优先）',
          Interval: 10
        },
        troponinTime:{
          analysis: '心肌标志物检测，肌钙蛋白采样，确认心肌损伤',
          Interval: 30
        },
        thrombolysisTime:{
          analysis: '选择急诊PCI/溶栓',
          Interval: 30
        },
        dilationTime:{
          analysis: '转运至导管室，急诊 PCI：球囊扩张，恢复心肌血流，PCI核心终点（D2B）',
          Interval: 90
        },
        doorToEcho:{
          analysis: '患者合并心功能不全，则补充急诊或心脏超声（评估心功能）',
          Interval: 10
        },
        doorToCt:{
          analysis: '患者合并肺栓塞，则补充急诊CT',
          Interval: 60
        },
        doorToCCU:{
          analysis: 'PCI 术后，患者生命体征平稳，转运至 CCU（心脏重症监护室）',
          Interval: 30
        }
      },

      timelineData: [
        { name: '发病时间', time: '20日 20:00', duration: 10 },
        { name: '到达医院大门', time: '21日 13:19', duration: 30 },
        { name: '首次医疗接触', time: '21日 13:20', duration: 1 },
        { name: '首诊医师接诊', time: '21日 13:21', duration: 1 },
        { name: '首份心电图', time: '21日 13:22', duration: 21 },
        { name: '心电图诊断', time: '21日 13:23', duration: 91 },
        { name: '抽血时间', time: '21日 13:38', duration: 15 },
        { name: '报告时间', time: '21日 13:54', duration: 16 },
        { name: '初步诊断', time: '21日 14:30', duration: 36 },
      ],
      analysis: [
        {
          time: '12:35',
          analysis: 'STEMI“绿色中心”诊断，及时进行ESC和PCSI的咨询。',
          guideline: '符合'
        },
        {
          time: '12:58 - 12:58',
          analysis: '进行心电图检查。',
          guideline: '符合'
        },
        {
          time: '12:59',
          analysis: '发生STEMI，建议D2B < 90min。',
          guideline: '不符合'
        },
        {
          time: '14:15 - 15:00',
          analysis: 'PCI手术实施。',
          guideline: '符合'
        },
        {
          time: '14:30',
          analysis: '进行CCU监护。',
          guideline: '符合'
        },
        {
          time: '15:00',
          analysis: '进行心脏超声检查。',
          guideline: '不符合'
        }
      ]
    }
  },

  created() {
    const eid = (typeof this.getEffectivePatientId === 'function' && this.getEffectivePatientId()) || 2;
    this.setEffectivePatientId && this.setEffectivePatientId(eid, { updateUrl: false, reload: false });
    this.getPatientData();
    this.getPatientTrae();
  },
  mounted() {
// —— 组合图：初始化与数据接入 ——
    this.$nextTick(() => {
      // 初始化空图，避免空白
      this.initChart()
      this.renderOrUpdateChart()
      this.$nextTick(() => { this.chart && this.chart.resize() })
      setTimeout(() => { this.chart && this.chart.resize() }, 50)
      // 从 this.analysis 解析当前患者用时/标准
      this.parseDurationsFromAnalysis()
      this.$nextTick(() => { this.renderOrUpdateChart()
      this.$nextTick(() => { this.chart && this.chart.resize() })
      setTimeout(() => { this.chart && this.chart.resize() }, 50); this.generateImprovementSuggestions(); })
      // 拉取全院平均
      const { start, end } = this.getDateRangeFromPage()
      this.startDate = start; this.endDate = end
      this.fetchTimemanagementAverage().then(() => this.$nextTick(() => { this.renderOrUpdateChart()
      this.$nextTick(() => { this.chart && this.chart.resize() })
      setTimeout(() => { this.chart && this.chart.resize() }, 50); this.generateImprovementSuggestions(); }))
    });




      // 监听容器尺寸变化，保证第一次可见/布局完成后自适应
      try {
        const el = this.$refs && this.$refs.comboChartRef
        if (window && 'ResizeObserver' in window && el) {
          this.chartResizeObserver = new ResizeObserver(() => { this.chart && this.chart.resize() })
          this.chartResizeObserver.observe(el)
        }
      } catch(_) {}
      // 监听窗口resize
      this._onWinResize = () => { this.chart && this.chart.resize() }
      window.addEventListener('resize', this._onWinResize)

  },
  methods: {
    formatDoctors(doctors) {
      if (!doctors || !Array.isArray(doctors) || doctors.length === 0) {
        return ''
      }

      // 如果doctors数组只有一个元素，直接返回
      if (doctors.length === 1) {
        return doctors[0]
      }

      // 假设前半部分是医生类型，后半部分是医生姓名
      const halfLength = Math.floor(doctors.length / 2)
      const doctorTypes = doctors.slice(0, halfLength)
      const doctorNames = doctors.slice(halfLength)

      // 配对显示：医生类型：医生姓名
      let pairedDoctors = []
      for (let i = 0; i < Math.min(doctorTypes.length, doctorNames.length); i++) {
        const doctorType = doctorTypes[i]
        const doctorName = doctorNames[i]
        // 只有当医生类型和医生姓名都有有效值时才显示
        if (doctorType && doctorType.trim() !== '' && doctorName && doctorName.trim() !== '') {
          pairedDoctors.push(`${doctorName}（${doctorType}）`)
        }
      }
      pairedDoctors = pairedDoctors.filter(str => str !== '门诊医生：医技医生');

      return pairedDoctors.join('，')
    },
    formatDate_new(val) {
      if (val === null || val === undefined || val === '') return '';
      // 兼容时间戳（秒/毫秒）、ISO 字符串、'YYYY-MM-DD' 简写
      let d;
      if (typeof val === 'number') {
        // 猜测单位：大于1e12视为毫秒，否则可能是秒
        d = new Date(val > 1e12 ? val : val * 1000);
      } else if (typeof val === 'string') {
        // 将 'YYYY-MM-DD hh:mm:ss' / 'YYYY/MM/DD' 等都尝试转换
        // Safari 对 'YYYY-MM-DD hh:mm:ss' 不友好，替换为 'YYYY-MM-DDThh:mm:ss'
        const s = val.trim().replace(' ', 'T').replace(/\//g, '-');
        const tryNum = Number(s);
        if (!Number.isNaN(tryNum) && s.length >= 10 && s.length <= 13) {
          d = new Date(tryNum > 1e12 ? tryNum : tryNum * 1000);
        } else {
          const tmp = new Date(s);
          if (!isNaN(tmp.getTime())) d = tmp;
        }
      } else if (val instanceof Date) {
        d = val;
      }
      if (!d || isNaN(d.getTime())) return String(val);
      const pad = n => String(n).padStart(2,'0');
      const Y = d.getFullYear();
      const M = pad(d.getMonth()+1);
      const D = pad(d.getDate());
      const h = pad(d.getHours());
      const m = pad(d.getMinutes());
      const s = pad(d.getSeconds());
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    },


    // ======= 全通道 ID 工具（与第一个页面一致） =======
    _setCookie(name, value, days = 7) {
      try {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
      } catch (_) {}
    },
    _getCookie(name) {
      try {
        const n = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i].trim();
          if (c.indexOf(n) === 0) return decodeURIComponent(c.substring(n.length));
        }
      } catch (_) {}
      return null;
    },


    getEffectivePatientId() {
      const b = this.getIdFromUrlBeforeHash(); if (b) return b;
      const h = this.getIdFromHashQuery(); if (h) return h;
      try {
        const rq = this.$route && this.$route.query && (Number(this.$route.query.id) || Number(this.$route.query.patientId));
        if (rq) return rq;
      } catch (_) {}
      try {
        const rp = this.$route && this.$route.params && (Number(this.$route.params.id) || Number(this.$route.params.patientId));
        if (rp) return rp;
      } catch (_) {}
      try {
        const s = this.$store && this.$store.getters && Number(this.$store.getters.patientId);
        if (s) return s;
      } catch (_) {}
      try {
        const l = Number(localStorage.getItem('patientId') || localStorage.getItem('id') || '');
        if (l) return l;
      } catch (_) {}
      try {
        const ss = Number(sessionStorage.getItem('patientId') || sessionStorage.getItem('id') || '');
        if (ss) return ss;
      } catch (_) {}
      try {
        const ck = Number(this._getCookie('patientId') || this._getCookie('id') || '');
        if (ck) return ck;
      } catch (_) {}
      const self = this.patient && Number(this.patient.id);
      return self || null;
    },

async confirmSwitch() {
      const id = this.switchDialog.selectedId;
      if (!id) return;
      // 只更新URL与本地状态，不整页刷新
      this.setEffectivePatientId && this.setEffectivePatientId(id, { updateUrl: true, reload: false });
      // 立即刷新页面数据（即使路由watch也会兜底）
      this.getPatientData && this.getPatientData();
      this.getPatientTrae && this.getPatientTrae();
      this.closeSwitchDialog && this.closeSwitchDialog();
    },


    async setEffectivePatientId(id, { updateUrl = false, reload = false } = {}) {
      this.syncIdToAll(id);
      if (!updateUrl) return;
      const num = Number(id);
      try {
        const href  = window.location.href;
        const parts = href.split('#');
        const base  = parts[0] || href;
        const hash  = parts[1] ? ('#' + parts[1]) : '';
        const url   = new URL(base);
        url.searchParams.set('id', String(num));
        url.searchParams.set('patientId', String(num));
        let newHash = hash;
        if (hash.includes('?')) {
          const idx = hash.indexOf('?');
          const hashPath  = hash.slice(0, idx);
          const hashQuery = hash.slice(idx + 1);
          const usp = new URLSearchParams(hashQuery);
          usp.set('id', String(num));
          usp.set('patientId', String(num));
          newHash = hashPath + '?' + usp.toString();
        }
        const target = url.toString() + newHash;
        if (reload) window.location.assign(target);
        else window.history.replaceState(null, '', target);
      } catch (e) {
        if (reload) window.location.reload();
      }
    },

syncIdToAll(id) {
      const num = Number(id);
      if (!Number.isFinite(num) || num <= 0) return;
      try { if (this.patient) this.patient.id = num; } catch (_) {}
      try {
        if (this.$store) {
          if (this.$store.commit && this.$store._mutations && this.$store._mutations['SET_PATIENT_ID']) {
            this.$store.commit('SET_PATIENT_ID', num);
          } else if (this.$store.dispatch && this.$store._actions && this.$store._actions['setPatientId']) {
            this.$store.dispatch('setPatientId', num);
          } else if (this.$store.state) {
            this.$store.state.patientId = num;
          }
        }
      } catch (_) {}
      try { localStorage.setItem('patientId', String(num)); } catch (_) {}
    },

getIdFromHashQuery() {
      try {
        const href = window.location.href;
        if (!href.includes('#')) return null;
        const hash = href.slice(href.indexOf('#') + 1);
        const qIdx = hash.indexOf('?');
        if (qIdx === -1) return null;
        const query = hash.slice(qIdx + 1);
        const usp = new URLSearchParams(query);
        const v = usp.get('id') || usp.get('patientId');
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
      } catch (e) { return null; }
    },

getIdFromUrlBeforeHash() {
      try {
        const href = window.location.href;
        const parts = href.split('#');
        const base = parts[0] || href;
        const url  = new URL(base);
        const v    = url.searchParams.get('id') || url.searchParams.get('patientId');
        const n    = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
      } catch (e) { return null; }
    },

    async fetchAllPatients() {
      this.switchDialog.loading = true;
      this.switchDialog.error = "";
      try {
        // 先尝试缓存命中（命中就直接渲染并返回）
        const _cached = _readPatListCache();
        if (_cached && _cached.length) {
          this.switchDialog.rawList = _cached;
          this.switchDialog.filtered = _cached.slice(0, 2000);
          this.switchDialog.loading = false;
          this.switchDialog.error = "";
          return;
        }

        this.token = getToken && getToken() || this.token;
        const response = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/frontPatInfo', null, {
          // 如果接口需要分页或其它参数，可在此补充 params
          params: { },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        });
        // 统一按你项目的接口规范解析
        if (response && response.data && response.data.code === 200) {
          const list = Array.isArray(response.data.data) ? response.data.data : [];
          this.switchDialog.rawList = list;
          _writePatListCache && _writePatListCache(list);
        } else {
          this.switchDialog.error = (response && response.data && (response.data.msg || response.data.message)) || '加载失败';
          this.switchDialog.rawList = [];
        }
      } catch (e) {
        this.switchDialog.error = (e && e.message) || '加载失败';
        this.switchDialog.rawList = [];
      } finally {
        this.switchDialog.loading = false;
      }
    },
applyFilter() {
      const kw = (this.switchDialog.keyword || '').toLowerCase();
      if (!kw) { this.switchDialog.filtered = this.switchDialog.rawList.slice(0, 2000); return; }
      this.switchDialog.filtered = this.switchDialog.rawList.filter(p => {
        const name = (p.patientName || '').toLowerCase();
        const opId = (p.outpatientId || '').toLowerCase();
        return name.includes(kw) || opId.includes(kw);
      });
    },

closeSwitchDialog() { this.switchDialog.visible = false; },

openSwitchDialog() {
      this.switchDialog.visible = true;
      this.switchDialog.error = '';
      this.switchDialog.keyword = '';
      this.switchDialog.selectedId = null;
      this.fetchAllPatients().then(() => this.applyFilter());
    },

    async getPatientData() {
      const id = this.patient.id
      // console.log("id:"+ typeof id);
      const token = getToken()
      // console.log("token:"+token)
      const response = await axios.post(API_URL + 'pat/frontAnalysis', null,
        {
          params: {id: id},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      // 处理响应
      if (response.data.code === 200) {
        const patient = response.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段
        const {userName, patientName, firstMedicalTime, dischargeTime, ...rest} = patient // 排除 userName
        // 获取当前时间
        const now = new Date();

        // 判断出院时间
        let dischargeDisplay;
        if (!dischargeTime) {
          dischargeDisplay = '暂未出院';
        } else {
          const dischargeDate = new Date(dischargeTime);
          // 如果出院时间在当前时间之后，则视为住院中
          if (dischargeDate > now) {
            dischargeDisplay = '住院中';
          } else {
            dischargeDisplay = dischargeTime;
          }
        }

        this.patient = {
          ...rest,
          admissionTime: firstMedicalTime,
          dischargeTime: dischargeDisplay,
          name: patientName,
          doctor: userName
        };


        console.log(this.patient)
      } else {
        this.loading = false
      }
    },
    async getPatientTrae() {
      const id = this.patient.id
      const token = getToken()
      const response = await axios.post(API_URL + 'pat/singletimemanagement', null,
        {
          params: {patientId: id},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      // 处理响应
      if (response.data.code === 200) {
        const patient = response.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段
        const {
          id, fmcToEcgInterval, fmcToTroponinInterval,
          doorToBalloonInterval, fmcToBalloonInterval, fmcToThrombolysisInterval,
          doorToCcuInterval, doorToCtInterval, doorToEchoInterval,
          onsetTime, firstMedicalTime, ecgTime,
          troponinTime, dilationTime, thrombolysisTime, greenChannelTime
        } = patient // 排除 userName



const arr = [];

// ---------- 以 firstMedicalTime 为锚点反推缺失时间点（只影响时间点，不改变用时来源） ----------
const anchor = firstMedicalTime ? new Date(firstMedicalTime) : null;
const addMinutes = (d, mins) => {
  if (!d || mins === null || mins === undefined || isNaN(mins)) return null;
  return new Date(d.getTime() + Number(mins) * 60000);
};

let _onsetTime = onsetTime || null;
let _firstMedicalTime = firstMedicalTime || null;
let _greenChannelTime = greenChannelTime || null;

let _ecgTime = ecgTime || (anchor && addMinutes(anchor, fmcToEcgInterval));
let _troponinTime = troponinTime || (anchor && addMinutes(anchor, fmcToTroponinInterval));
let _thrombolysisTime = thrombolysisTime || (anchor && addMinutes(anchor, fmcToThrombolysisInterval));
let _dilationTime = dilationTime || (anchor && addMinutes(anchor, (fmcToBalloonInterval || doorToBalloonInterval)));

let _ccuTime = (anchor && doorToCcuInterval != null) ? addMinutes(anchor, doorToCcuInterval) : null;
let _ctTime = (anchor && doorToCtInterval != null) ? addMinutes(anchor, doorToCtInterval) : null;
let _echoTime = (anchor && doorToEchoInterval != null) ? addMinutes(anchor, doorToEchoInterval) : null;

// 统一格式化
const fmt = (d) => d ? this.formatTimeToYMDHM(
  (typeof d === 'string') ? d : (new Date(d.getTime() - d.getTimezoneOffset()*60000)).toISOString().slice(0,16).replace('T',' ')
) : '';

// 合规判定（保持原逻辑）
const ok = (v, guide) => Number(v) <= Number(guide);

// 小工具：拼接“X 分钟 / 标准：Y分钟”，当 interval 为空或为'/'则返回'/'
const withStd = (val, std) => {
  if (val === undefined || val === null || val === '' || val === '/') return '/';
  return `${val} 分钟 / 标准：${std}分钟`;
};

// 1) 发病时间 —— 不显示用时
arr.push({
  time: fmt(_onsetTime),
  analysis: this.standardGuide.onsetTime.analysis,
  guideline: '符合',
  name: '发病时间'
});

// 2) 首次医疗接触 —— 不显示用时
arr.push({
  time: fmt(_firstMedicalTime),
  analysis: this.standardGuide.firstMedicalTime.analysis,
  guideline: '符合',
  name: '首次医疗接触时间'
});

// 3) 绿色通道 —— 不显示用时
arr.push({
  time: fmt(_greenChannelTime),
  analysis: this.standardGuide.greenChannelTime.analysis,
  guideline: '符合',
  name: '绿色通道时间'
});

// 4) 心电图 —— 用时来自后端 fmcToEcgInterval
arr.push({
  time: fmt(_ecgTime),
  interval: withStd(fmcToEcgInterval, this.standardGuide.ecgTime.Interval),
  analysis: this.standardGuide.ecgTime.analysis,
  guideline: ok(fmcToEcgInterval, this.standardGuide.ecgTime.Interval) ? '符合' : '不符合',
  name: '心电图采集时间'
});

// 5) 肌钙蛋白 —— 用时来自后端 fmcToTroponinInterval
arr.push({
  time: fmt(_troponinTime),
  interval: withStd(fmcToTroponinInterval, this.standardGuide.troponinTime.Interval),
  analysis: this.standardGuide.troponinTime.analysis,
  guideline: ok(fmcToTroponinInterval, this.standardGuide.troponinTime.Interval) ? '符合' : '不符合',
  name: '肌钙蛋白时间'
});

// 6) 溶栓 —— 用时来自后端 fmcToThrombolysisInterval
arr.push({
  time: fmt(_thrombolysisTime),
  interval: withStd(fmcToThrombolysisInterval, this.standardGuide.thrombolysisTime.Interval),
  analysis: this.standardGuide.thrombolysisTime.analysis,
  guideline: ok(fmcToThrombolysisInterval, this.standardGuide.thrombolysisTime.Interval) ? '符合' : '不符合',
  name: '溶栓时间'
});

// 7) D2B —— 用时优先 fmcToBalloonInterval，否则 doorToBalloonInterval
const d2bInterval = (fmcToBalloonInterval != null && fmcToBalloonInterval !== '') ? fmcToBalloonInterval : doorToBalloonInterval;
arr.push({
  time: fmt(_dilationTime),
  interval: withStd(d2bInterval, this.standardGuide.dilationTime.Interval),
  analysis: this.standardGuide.dilationTime.analysis,
  guideline: ok(d2bInterval, this.standardGuide.dilationTime.Interval) ? '符合' : '不符合',
  name: 'D2B时间'
});

// 8) 转至 CCU —— 用时来自后端 doorToCcuInterval
arr.push({
  time: fmt(_ccuTime),
  interval: withStd(doorToCcuInterval, this.standardGuide.doorToCCU.Interval),
  analysis: this.standardGuide.doorToCCU.analysis,
  guideline: ok(doorToCcuInterval, this.standardGuide.doorToCCU.Interval) ? '符合' : '不符合',
  name: '转至CCU时间'
});

// 9) CT —— 用时来自后端 doorToCtInterval
arr.push({
  time: fmt(_ctTime),
  interval: withStd(doorToCtInterval, this.standardGuide.doorToCt.Interval),
  analysis: this.standardGuide.doorToCt.analysis,
  guideline: ok(doorToCtInterval, this.standardGuide.doorToCt.Interval) ? '符合' : '不符合',
  name: 'CT检查时间'
});

// 10) 超声 —— 用时来自后端 doorToEchoInterval
arr.push({
  time: fmt(_echoTime),
  interval: withStd(doorToEchoInterval, this.standardGuide.doorToEcho.Interval),
  analysis: this.standardGuide.doorToEcho.analysis,
  guideline: ok(doorToEchoInterval, this.standardGuide.doorToEcho.Interval) ? '符合' : '不符合',
  name: '心脏彩超时间'
});

this.analysis = arr




      } else {
        this.loading = false
      }
    },
    getComplianceState(Interval, guideInterval) {
      return Interval <= guideInterval ? '符合' : '不符合';
    },
    /**
     * 时间戳格式化函数：统一转为 "YYYY-MM-DD HH:mm" 格式
     * @param {string} timeStr - 原始时间字符串（支持 "2025/1/10 17:03" 或 "2025-01-10 17:38:00"）
     * @returns {string} 格式化后的时间（如 "2025-01-10 17:03"）
     */
    formatTimeToYMDHM(timeStr) {
      ///if (!timeStr || timeStr === null || timeStr === undefined)
      //  return timeStr;

      const normalizedTimeStr = timeStr.replace(/\//g, '-');
      // 2. 解析为 Date 对象
      const date = new Date(normalizedTimeStr);
      if(isNaN(date))
        return timeStr;

      // 3. 提取年月日时分（补零确保两位数格式，如 1月→01，3分→03）
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');

      // 4. 拼接为目标格式
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },


    // —— 从“分析列表(this.analysis)”直接读取当前患者的用时/标准 ——
    parseDurationsFromAnalysis() {
      const list = Array.isArray(this.analysis) ? this.analysis : []
      if (!list.length) return
      const nameMap = {
        ecg:  ['心电图采集时间','首份心电图','ECG'],
        troponin: ['肌钙蛋白时间','肌钙蛋白'],
        thrombolysis: ['溶栓时间','溶栓'],
        d2b:  ['D2B时间','D2B','球囊扩张','球囊开通'],
        ccu:  ['转至CCU时间','转入CCU'],
        ct:   ['CT时间','CT检查时间','CT'],
        echo: ['心脏彩超时间','彩超','超声','ECHO']
      }
      const pickNum = (txt) => {
        if (typeof txt === 'number') return txt
        if (txt == null) return null
        const m = String(txt).match(/-?\d+(\.\d+)?/)
        return m ? Number(m[0]) : null
      }
      const use = { ...this.currentDurations }
      const std = { ...this.standardDurations }
      list.forEach(row => {
        const name = row?.name || row?.analysis || row?.title || ''
        if (!name) return
        for (const key of Object.keys(nameMap)) {
          if (nameMap[key].some(alias => name.includes(alias))) {
            // interval 字段形如 "25 分钟 / 标准：30分钟"
            const v = row.interval
            if (v != null) {
              if (typeof v === 'number') { use[key] = v }
              else {
                const s = String(v)
                if (s.includes('/')) {
                  const [left, right] = s.split('/')
                  const nL = pickNum(left); if (Number.isFinite(nL)) use[key] = nL
                  const nR = pickNum(right); if (Number.isFinite(nR)) std[key] = nR
                } else {
                  const n = pickNum(s); if (Number.isFinite(n)) use[key] = n
                }
              }
            }
            break
          }
        }
      })
      this.currentDurations = use
      this.standardDurations = std
      this.generateImprovementSuggestions()
    },

    // —— timemanagement 平均（与 statisticalanalysis.vue 一致） ——
    async fetchTimemanagementAverage() {
      const token = getToken()
      const resp = await axios.post(API_URL + 'pat/timemanagement', null, {
        params: {
          startTime: this.formatDate(this.startDate),
          endTime: this.formatDate(this.endDate)
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      if (resp?.data?.code === 200) {
        const rows = resp.data.data || []
        const toNum = v => Number.isFinite(Number(v)) ? Number(v) : null
        const mean = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : null
        const arr = f => rows.map(r => toNum(r[f])).filter(v => v!=null)
        const d2bArr = rows.map(r => toNum(r['doorToBalloonInterval'])
          ?? toNum(r['fmc_to_balloon_interval']) ?? toNum(r['fmcToBalloonInterval'])).filter(v => v!=null)
        this.avgDurationsAllPatients = {
          // 更新平均后也刷新建议


          ecg: mean(arr('fmcToEcgInterval')),
          troponin: mean(arr('fmcToTroponinInterval')),
          thrombolysis: mean(arr('fmcToThrombolysisInterval')),
          d2b: mean(d2bArr),
          ccu: mean(arr('doorToCcuInterval')),
          ct:  mean(arr('doorToCtInterval')),
          echo:mean(arr('doorToEchoInterval'))
        }
      } else {
        this.avgDurationsAllPatients = {
          // 更新平均后也刷新建议

}
      }
    },

    // —— 图表 ——
    initChart() {
    const el = this.$refs && this.$refs.comboChartRef;
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
    }
      if (!el) return
      if (!this.chart) {
        try { this.chart = (this.$echarts || echarts).init(el) }
        catch(e) { this.chart = echarts.init(el) }
      }
    },
    renderOrUpdateChart() {
      this.initChart()
      if (!this.chart) return
      const x = this.categories.map(c => c.label)
      const actual = this.categories.map(c => this._nn(this.currentDurations[c.key]))
      const std    = this.categories.map(c => this._nn(this.standardDurations[c.key]))
      const avg    = this.categories.map(c => {
        const v = Number(this.avgDurationsAllPatients?.[c.key])
        return Number.isFinite(v) ? Math.max(0, Math.round(v)) : null

      this.chart && this.chart.setOption(option, true)
})
      this.chart.setOption({
        grid: { left: 40, right: 20, top: 40, bottom: 60 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
          formatter: ps => {
            const lines = [ps[0].axisValue]
            ps.forEach(p => lines.push(`${p.marker}${p.seriesName}: ${p.data ?? '-'} min`))
            return lines.join('<br/>')
          }
        },
        legend: { bottom: 10, itemWidth: 14, itemHeight: 10, data: ['用时（当前）','标准（阈值）','全院平均'] },
        xAxis: { type: 'category', data: x, axisLabel: { interval: 0 } },
        yAxis: { type: 'value', name: '分钟(min)' },
        series: [
          { name: '用时（当前）', type: 'bar', barGap: '15%', data: actual,
            label: { show: true, position: 'top', formatter: ({value}) => (value ?? '-') + ' min' },
            labelLayout: { hideOverlap: true }, itemStyle: { color: '#3b82f6' } },
          { name: '标准（阈值）', type: 'bar', data: std,
            label: { show: true, position: 'top', formatter: ({value}) => (value ?? '-') + ' min' },
            labelLayout: { hideOverlap: true }, itemStyle: { color: 'rgba(59,130,246,0.25)' } },
          { name: '全院平均', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: avg, itemStyle: { color: '#ef4444' }, lineStyle: { width: 2 } }
        ]
      })
    },

    // —— 日期 ——
    getDateRangeFromPage() {
      const pad2 = n => String(n).padStart(2,'0')
      const toDateStr = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
      const today = new Date(); const d30 = new Date(today.getTime() - 29*24*3600*1000)
      return { start: toDateStr(d30), end: toDateStr(today) }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const [y,m,d] = String(dateString).split('-')
      return `${y}/${parseInt(m)}/${parseInt(d)}`
    },

    // —— 小工具 ——
    _nn(v) {
      const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0
    }
,
    // —— 改进与建议（基于当前患者是否超时） ——
    generateImprovementSuggestions() {
      const mapping = {
        ecg: '心电图采集',
        troponin: '肌钙蛋白检测',
        thrombolysis: '溶栓启动',
        d2b: 'D2B流程',
        ccu: '转入CCU',
        ct: 'CT检查',
        echo: '心脏彩超'
      };
      const suggestions = {
        ecg: '定期对相关医护人员进行心电图操作及绿色通道流程的培训与考核，确保每位人员都能熟练、快速地为患者完成心电图检查，巩固现有成果。',
        troponin: '可定期对检测流程进行复盘，分析是否还存在进一步优化的空间，比如采样后标本传递的时效性等，确保始终符合标准要求。',
        thrombolysis: '提前完成禁忌评估，药物与设备预备到位,存在流程或决策方面的可优化点，应组织相关科室进行讨论，完善决策机制，确保在后续遇到类似情况时，能更高效、准确地做出选择。',
        d2b: '加强急诊科与导管室之间的沟通协作，建立更高效的信息传递机制，确保患者能以最快速度转运至导管室进行 PCI 手术。同时，定期对相关医护人员进行应急转运演练，提升团队的协作效率和应急处理能力。',
        ccu: '优化术后转运流程，明确术后转运的启动条件、人员配备及路线规划。提前与 CCU 进行沟通，确保 CCU 准备好接收患者的床位、设备等。对参与术后转运的医护人员进行培训，使其熟悉转运过程中的注意事项及应急处理方法，减少转运过程中的时间延误。',
        ct: '建立肺栓塞患者补充急诊 CT 的快速响应机制。当患者合并肺栓塞需要补充急诊 CT 时，急诊科应第一时间与放射科沟通，优先安排 CT 检查。优化 CT 检查前的准备流程，如患者的准备、检查申请单的开具等，减少不必要的时间消耗。同时，放射科应确保设备处于良好的运行状态，提高检查效率。',
        echo: '安排床旁超声或快速通道，避免排队等待。'
      };
      const result = [];
      for (const key of Object.keys(this.currentDurations)) {
        const actual = Number(this.currentDurations[key]);
        const std = Number(this.standardDurations[key]);
        if (Number.isFinite(actual) && Number.isFinite(std) && actual > std) {
          result.push({ name: mapping[key], suggestion: suggestions[key] });
        }
      }
      this.improvementList = result;
    },

    disposeChart() {
      try {
        if (this.chart && this.chart.dispose) {
          this.chart.dispose();
        }
      } catch (e) {}
      this.chart = null;
    }}
}
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5; /* 页面背景颜色偏灰 */
}

.header {
  background-color: #ffffff;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
}

.patient-info {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}

.info-row {
  display: flex;
  flex-direction: column; /* 垂直排列标题和内容 */
  flex: 1; /* 每个信息项占据相同宽度 */
  margin: 0 10px; /* 左右间距 */
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.analysis-table th, .analysis-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.analysis-table th {
  background-color: #f1f1f1;
}

.status-yes {
  color: green;
}

.status-no {
  color: red;
}

.content {
  margin-top: 10px;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  line-height: 1.5;
  background-color: #ffffff;
}

h3 {
  margin-top: 10px;
}

ol {
  margin-left: 20px;


}

ul {
  margin-left: 20px;
  margin-right: 20px;
}

.content p {
  padding: 20px;
  font-size: 16px;
  line-height: 1.5;
  background-color: #ffffff;
}
h2, h3 {
  margin-top: 20px;
}
ol {
  margin-left: 20px;
}
ul {
  margin-left: 20px;
}

/* 容器：控制整体布局 */
.timeline-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 时间节点标签区域（上半部分） */
.timeline-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.chart-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
}

.chart-container {
  width: 100%;
  height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-sizing: border-box;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container {
    height: 500px;
  }
}

/* 时间轴核心区域（中间虚线 + 箭头） */
.timeline-axis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative; /* 用于虚线定位 */
  margin-bottom: 10px;
}
/* 蓝色虚线 */
.axis-dash {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #99ccff; /* 浅蓝色虚线 */
  z-index: 1;
}
.axis-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2; /* 确保箭头和时间在虚线上方 */
}
/* 向上箭头（橙色） */
.arrow-up {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid #ff9900; /* 橙色箭头 */
  margin-bottom: 15px;
}
.node-time {
  font-size: 16px;
  color: #ff9900; /* 橙色时间文字 */
}
.node-name {
  font-size: 15px;
  color: #333; /* 名称文字颜色 */
  margin-bottom: 15px; /* 与时间保持间距 */
  text-align: center;
}
/* 实际时长区域（下半部分红线 + 时长） */
.timeline-duration {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative; /* 用于红线定位 */
}
/* 红色实线 */
.duration-line {
  position: absolute;
  top: 80%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ff6666; /* 红色实线 */
  z-index: 1;
}
.duration-item {
  text-align: center;
  position: relative;
  z-index: 5; /* 确保时长文字在红线上方 */
}
.duration-text {
  font-size: 16px;
  color: #ff6666; /* 红色时长文字 */
}



.node-interval {
  font-size: 14px;
  color: #0066ff; /* 蓝色 */
  margin-top: 4px;
}


/* 组合图样式（占满一行） */
.full-row { width: 100%; background: #fff; border-radius: 12px; padding: 16px 16px 6px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-top: 12px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #111827; }
.combo-chart { width: 100%; height: 360px; }
.chart-note { margin-top: 8px; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; vertical-align: middle; margin: 0 4px 0 0; }
.legend-dot.actual { background: #3b82f6; }
.legend-dot.standard { background: rgba(59,130,246,0.25); border: 1px solid rgba(59,130,246,0.35); }
.legend-dot.avg { background: #ef4444; }

.suggest-list { list-style: none; padding: 0; margin: 0; }
.suggest-list li { font-size: 14px; line-height: 1.6; margin-bottom: 4px; color: #374151; }
.suggest-list strong { color: #111827; }

/* 切换按钮：与第一页面一致，放“主治医生”右侧，适中大小 */
.switch-btn{padding:4px 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;line-height:22px;margin-left:8px;}
.switch-btn:hover{background:#f6f6f6;}

/* 切换患者弹窗样式（analysis 正式版） */
.modal-backdrop{position:fixed;inset:0;background:rgba(18,18,18,.45);display:flex;align-items:center;justify-content:center;z-index:2050;}
.modal{width:760px;max-height:76vh;background:#fff;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 28px rgba(0,0,0,.2);}
.modal-header{padding:14px 16px;border-bottom:1px solid #eee;display:grid;grid-template-columns:1fr;gap:10px;}
.modal-header .title{font-weight:600;font-size:16px;}
.search-bar{display:flex;gap:8px;}
.search-bar input{flex:1;height:34px;padding:0 10px;border:1px solid #ddd;border-radius:6px;}
.search-bar button{height:34px;padding:0 14px;border:1px solid #409eff;background:#409eff;color:#fff;border-radius:6px;cursor:pointer;}
.modal-body{padding:12px 16px;overflow:auto;}
.list-table{width:100%;border-collapse:collapse;}
.list-table th,.list-table td{padding:10px 8px;border-bottom:1px solid #f1f1f1;font-size:14px;}
.center{text-align:center;}
.hint{color:#888;text-align:center;padding:20px 0;}
.error{color:#d93025;text-align:center;padding:12px 0;}
.modal-footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #eee;}
.modal-footer .ghost{background:#fff;border:1px solid #ddd;color:#333;padding:6px 14px;border-radius:6px;cursor:pointer;}
.modal-footer .primary{background:#409eff; border:1px solid #409eff; color:#fff; padding:6px 14px; border-radius:6px; cursor:pointer;}
.modal-footer .primary:disabled{opacity:.5;cursor:not-allowed;}
.header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
