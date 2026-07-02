<template>
  <div class="container">
    <div class="header">
      <h3>患者信息</h3>
      <button class="switch-btn" @click="openSwitchDialog">切换</button>
    </div>

    <div class="info-container">
      <div class="info-item" :style="patient.isWarning ? 'background:#f56c6c; color:#fff;' : ''">
        <p>门诊ID信息: <strong>{{ patient.outPatientId }}</strong></p>
        <p>姓名: <strong>{{ patient.patientName }}</strong>
          <span v-if="patient.isWarning" class="warning-badge" :title="patient.warningReason">⚠ 预警</span>
        </p>
      </div>
      <div class="info-item">
        <p>性别: <strong>{{ patient.gender }}</strong></p>
        <p>年龄: <strong>{{ patient.age }}</strong></p>
      </div>
      <div class="info-item">
        <p>诊断结果</p>
        <p><strong>{{ patient.diagnosis }}</strong></p>
      </div>
      <div class="info-item" @click="viewMedicalRecord">
        <p>电子病历</p>
        <p><strong>点击显示</strong></p>
      </div>
    </div>

    <div class="card-container">
      <div class="card">
        <div class="header-controls">
          <h4>心电图</h4>
          <div class="controls">
            <select v-model="selectedEcg" @change="updateEcg">
              <option v-for="record in patient.ecgRecords" :key="record.time" :value="record">{{ record.time }}</option>
            </select>
            <button @click="analyze('心电图', selectedEcg)">分析</button>
          </div>
        </div>
        <p>检查问题: <strong>{{ selectedEcg.diagnosis }}</strong></p>
        <img :src="selectedEcg.image" alt="心电图" class="image">
      </div>

      <div class="card">
        <div class="header-controls">
          <h4>CT</h4>
          <div class="controls">
            <select v-model="selectedCt" @change="updateCt">
              <option v-for="record in patient.ctRecords" :key="record.time" :value="record">{{ record.time }}</option>
            </select>
            <button @click="analyze('CT', selectedCt)">分析</button>
          </div>
        </div>
        <p>检查问题: <strong>{{ selectedCt.diagnosis }}</strong></p>
        <div class="image-container">
          <img :src="selectedCt.image" alt="CT图像" class="image" style="width: 85%;">
        </div>
      </div>

      <div class="card">
        <div class="header-controls">
          <h4>心脏超声</h4>
          <div class="controls">
            <select v-model="selectedEcho" @change="updateEcho">
              <option v-for="record in patient.echoRecords" :key="record.time" :value="record">{{ record.time }}</option>
            </select>
            <button @click="analyze('心脏超声', selectedEcho)">分析</button>
          </div>
        </div>
        <p>检查问题: <strong>{{ selectedEcho.diagnosis }}</strong></p>
        <img :src="selectedEcho.image" alt="心脏超声" class="image">
      </div>
    </div>

    <!-- 行医记录和行医质控区域已隐藏（需求6） -->
    <!-- <div class="record-container"> ... </div> -->

    <!-- 智能问诊（原"智能诊断"独立页面合并而来） -->
    <div class="ai-checkbox-all">
      <h3>智能问诊</h3>

      <h4>患者主诉:</h4>
      <div class="ai-checkbox-group">
        <label v-for="(item, index) in complaints" :key="'complaint'+index" class="ai-checkbox-item">
          <input v-model="item.checked" type="checkbox" @click="$nextTick(checkDiagnosis)"> {{ item.label }}
          <span v-if="item.label === '其他'">
            <input v-model="otherComplaint" type="text" placeholder="请填写其他主诉" @change="checkDiagnosis">
          </span>
        </label>
      </div>

      <h4>既往病史:</h4>
      <div class="ai-checkbox-group">
        <label v-for="(item, index) in pastHistory" :key="'history'+index" class="ai-checkbox-item">
          <input v-model="item.checked" type="checkbox" @click="$nextTick(checkDiagnosis)"> {{ item.label }}
          <span v-if="item.label === '其他'">
            <input v-model="otherHistory" type="text" placeholder="请填写其他病史" @change="checkDiagnosis">
          </span>
        </label>
      </div>

      <h4>已完成检查结果或报告:</h4>
      <div class="ai-checkbox-group">
        <label v-for="(item, index) in exams" :key="'exam'+index" class="ai-checkbox-item">
          <input v-model="item.checked" type="checkbox" @click="$nextTick(checkDiagnosis)"> {{ item.label }}
          <span v-if="item.label === '其他'">
            <input v-model="otherExam" type="text" placeholder="请填写其他检查" @change="checkDiagnosis">
          </span>
        </label>
      </div>

      <textarea
        v-model="aiDiagnosisDraft"
        class="ai-text-area"
        placeholder="大模型辅助智能疾病诊断..."
        rows="12"
        style="min-height: 220px;"
        @focus="handleDiagnosisFocus"
        @blur="handleDiagnosisBlur"
        @input="handleDiagnosisInput"
      ></textarea>
      <button class="ai-diagnosis-button" @click="submitDiagnosis">一键诊断</button>
    </div>

    <div class="ai-card-container">
      <div class="ai-card">
        <div class="ai-card-header">诊断结果</div>
        <div class="ai-card-content">{{ patRecordsDTO.aiDiagnosis }}</div>
      </div>
      <div class="ai-card">
        <div class="ai-card-header">治疗方案</div>
        <div class="ai-card-content">{{ patRecordsDTO.aiTreatmentProposal }}</div>
      </div>
      <div class="ai-card">
        <div class="ai-card-header">护理方案</div>
        <div class="ai-card-content">{{ patRecordsDTO.aiCareProposal }}</div>
      </div>
    </div>

    <div v-if="uiLoading" class="ai-waiting-overlay">
      <div class="ai-spinner"></div>
      <div class="ai-waiting-text">正在生成，请稍候…</div>
    </div>

    <div v-if="analysisResult" class="analysis-popup">
      <h4>医生诊断结果</h4>
      <p>{{ analysisResult }}</p>
      <button @click="analysisResult = null">关闭</button>
    </div>

  <!-- 切换患者弹窗（自动注入） -->
  <div v-if="switchDialog.visible" class="modal-backdrop" @click.self="closeSwitchDialog">
    <div class="modal">
      <div class="modal-header">
        <div class="title">切换患者</div>
        <div class="search-bar">
          <input
            v-model.trim="switchDialog.keyword"
            type="text"
            placeholder="搜索姓名或住院号"
            @keyup.enter="doSearch"
          />
          <button @click="doSearch">搜索</button>
        </div>
      </div>
      <div class="modal-body">
        <div v-if="switchDialog.loading" class="hint">加载中…</div>
        <div v-else-if="switchDialog.error" class="error">{{ switchDialog.error }}</div>
        <table v-else class="list-table" style="width: 100%;text-align: center;">
          <thead>
            <tr>
              <th style="width: 12%;">姓名</th>
              <th style="width: 12%;">住院号</th>
              <th style="width: 8%;">性别</th>
              <th style="width: 8%;">年龄</th>
              <th style="width: 18%;">首次医疗接触时间</th>
              <th style="width: 18%;">发病时间</th>
              <th style="width: 14%;">诊断</th>
              <th style="width: 10%;">主治医生</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in switchDialog.filtered" :key="p.id" @click="switchDialog.selectedId = p.id; confirmSwitch()" :style="{backgroundColor:switchDialog.selectedId === p.id?'#e6f7ff':'',cursor:'pointer'}">
              <td>{{ p.patientName }}</td>
              <td>{{ p.outpatientId }}</td>
              <td>{{ p.gender || "" }}</td>
              <td>{{ p.age != null ? p.age : "" }}</td>
              <td>{{ formatDate(p.firstMedicalTime) }}</td>
              <td>{{ formatDate(p.onsetTime) }}</td>
              <td>{{ p.diagnosis || "" }}</td>
              <td>{{formatDoctors( p.doctors) }}</td>
            </tr>
            <tr v-if="!switchDialog.filtered.length && !switchDialog.loading">
              <td colspan="8" class="hint">没有匹配的患者</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="ghost" @click="closeSwitchDialog">取消</button>
      </div>
    </div>
  </div>
</div></template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL, sendOpenAIRequest } from '@/api/constants'
import { buildVitalsWarning } from '@/utils/vitalsWarning'


// [CACHE-BEGIN] 患者列表简单缓存（10分钟）
const PAT_LIST_CACHE_KEY = 'PAT_FRONT_LIST_CACHE_V1';
const PAT_LIST_CACHE_TTL = 10 * 60 * 1000 * 6; // 10分钟

function _readPatListCache() {
  try {
    // 优先读取首页写入的 sessionStorage 过滤结果
    const rawS = sessionStorage.getItem('filteredPatients');
    const tsS  = Number(sessionStorage.getItem('filteredPatientsUpdatedAt') || 0);
    if (rawS && tsS && (Date.now() - tsS) < (10 * 60 * 1000)) { // 10分钟保鲜
      const arr = JSON.parse(rawS);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (_) {}

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
  data() {
    return {
      switchDialog: {
        visible: false,
        loading: false,
        error: "",
        keyword: "",
        rawList: [],
        filtered: [],
        selectedId: null,
      },

      patient: {
        id: '2',
        patientName: '张勇',
        gender: '男',
        age: 65,
        diagnosis: '心脏病',
        medicalHistory: '无',
        complaint: '胸痛、气短',
        physicalExam: '心率正常，血压稳定。',
        assistExam: '心电图正常，CT显示无异常。',
        treatment: '建议住院观察，控制心率。',
        medication: '阿莫西林，一天三次。',
        surgery: '无',
        nursing: '定期监测生命体征。',
        followUp: '一周后复查。',
        pastHistory: '糖尿病',
        ecgRecords: [],
        ctRecords: [],
        echoRecords: [],
        medicalRecords: [


        ],
        qualitycontrol: [
          { item: '入院检查', result: '合格' },
          { item: '心电图', result: '合格' },
          { item: 'CT', result: '合格' },
          { item: '心脏彩超', result: '合格' }
        ]
      },
      selectedEcg: {diagnosis: null,image:null},
      selectedCt: {diagnosis: null,image:null},
      selectedEcho: {diagnosis: null,image:null},
      analysisResult: null,

      // ===== 智能问诊（原 diagnosis.vue 合并而来） =====
      complaints: [
        { label: '呼吸困难', checked: false },
        { label: '胸痛', checked: false },
        { label: '背痛', checked: false },
        { label: '不明原因的疼痛', checked: false },
        { label: '其他', checked: false }
      ],
      pastHistory: [
        { label: '高血压', checked: false },
        { label: '高血脂', checked: false },
        { label: '糖尿病', checked: false },
        { label: '脑卒中', checked: false },
        { label: '心律失常', checked: false },
        { label: '其他', checked: false }
      ],
      exams: [
        { label: '首份心电图', checked: false },
        { label: '血液检查', checked: false },
        { label: '心脏彩超', checked: false },
        { label: 'CT影像报告', checked: false },
        { label: '其他', checked: false }
      ],
      patRecordsDTO: {
        aiCareProposal: '',
        aiCareTime: '',
        aiDiagnosis: '',
        aiDiagnosisTime: '',
        aiTreatmentProposal: '',
        aiTreatmentTime: '',
        patientId: 0
      },
      aiDiagnosisDraft: '',
      otherComplaint: '',
      otherHistory: '',
      otherExam: '',
      supplementNote: '',
      uiLoading: false
    }
  },
  watch: {
    aiDiagnosisDraft() { this.syncSupplementFromDiagnosis() },
    complaints: { deep: true, handler() { this.checkDiagnosis() } },
    pastHistory: { deep: true, handler() { this.checkDiagnosis() } },
    exams: { deep: true, handler() { this.checkDiagnosis() } },
    supplementNote() { this.checkDiagnosis() }
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时（同一组件切换患者）重新加载数据
    next()
    this.$nextTick(() => {
      let eff = null
      try {
        const qid = to.query && (to.query.id || to.query.patientId)
        if (qid) eff = Number(qid) || null
      } catch (_) {}
      if (!eff && this.$store && this.$store.getters) eff = Number(this.$store.getters.patientId) || null
      if (eff) {
        this.syncIdToAll(eff)
        // 强制更新 patient.id 确保 getPatientData 用新 id 发请求
        if (this.patient) this.patient.id = eff
      }
      if (this.patient && this.patient.id && typeof this.getPatientData === 'function') {
        try { this.getPatientData() } catch (_) {}
      }
    })
  },
  activated() {
    // keep-alive 激活时清空上次AI诊断结果，避免残留内容显示
    this.patRecordsDTO.aiDiagnosis = ''
    this.patRecordsDTO.aiTreatmentProposal = ''
    this.patRecordsDTO.aiCareProposal = ''
    // 如果 store 里的 patientId 和当前不一致则重新加载
    try {
      const storeId = Number(this.$store.getters.patientId) || null
      if (storeId && storeId !== this.patient.id) {
        this.syncIdToAll(storeId)
        if (typeof this.getPatientData === 'function') this.getPatientData()
      }
    } catch (_) {}
  },
  created() {
    // 优先级：route.query.id > URL(hash前) > store > localStorage > 默认值
    let eff = null;
    try {
      const qid = this.$route && this.$route.query && (this.$route.query.id || this.$route.query.patientId);
      if (qid) eff = Number(qid) || null;
    } catch (_) {}
    if (!eff) { try { eff = this.getIdFromUrlBeforeHash && this.getIdFromUrlBeforeHash(); } catch (_) {} }
    if (!eff && this.$store && this.$store.getters) eff = Number(this.$store.getters.patientId) || null;
    if (!eff) {
      try { eff = Number(localStorage.getItem('patientId') || '') || null; } catch (_) {}
    }
    eff = eff || (this.patient && this.patient.id) || null;
    if (eff) this.syncIdToAll(eff);

    if (this.patient && this.patient.id && typeof this.getPatientData === 'function') {
      try { this.getPatientData(); } catch (_) {}
    }
  },
  mounted() {
    // 默认选择最新的检查记录

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
    // 统一时间格式化：YYYY-MM-DD hh:mm:ss
    formatDate(val) {
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

    // ======= ID 工具（统一更新入口） =======
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
    syncIdToAll(id) {
      // 同步到组件状态 / store / localStorage
      if (id == null) return;
      const num = Number(id);
      if (!Number.isFinite(num) || num <= 0) return;
      try { this.patient && (this.patient.id = num); } catch (_) {}
      try {
        if (this.$store && this.$store.dispatch) {
          this.$store.dispatch('user/Set_PatientID', num).catch(() => {});
        }
      } catch (_) {}
      try { localStorage.setItem('patientId', String(num)); } catch (_) {}
    },
    setEffectivePatientId(id, { updateUrl = false, reload = false } = {}) {
      // 统一对外设置 ID 的方法
      this.syncIdToAll(id);
      if (updateUrl) {
        try {
          const href  = window.location.href;
          const parts = href.split('#');
          const base  = parts[0] || href;
          const hash  = parts[1] ? ('#' + parts[1]) : '';
          const url   = new URL(base);
          url.searchParams.set('id', String(id));
          const target = url.toString() + hash;
          if (reload) {
            window.location.href = target;
          } else {
            // 不刷新只改地址（可选备份）
            window.history.replaceState(null, '', target);
          }
        } catch (_) {
          if (reload) window.location.reload();
        }
      }
    },

    // === 切换患者弹窗逻辑（自动注入） ===
    async openSwitchDialog() {
      this.switchDialog.visible = true;
      this.switchDialog.error = "";
      this.switchDialog.keyword = "";
      this.switchDialog.selectedId = null;
      await this.fetchAllPatients();
      this.applyFilter();
    },
    closeSwitchDialog() {
      this.switchDialog.visible = false;
    },
    doSearch() {
      this.applyFilter();
    },
    applyFilter() {
      const kw = (this.switchDialog.keyword || "").toLowerCase();
      if (!kw) {
        this.switchDialog.filtered = this.switchDialog.rawList.slice(0, 2000);
        return;
      }
      this.switchDialog.filtered = this.switchDialog.rawList.filter(p => {
        const name = (p.patientName || "").toLowerCase();
        const opId = (p.outpatientId || "").toLowerCase();
        return name.includes(kw) || opId.includes(kw);
      });
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
    async confirmSwitch() {
      const id = this.switchDialog && this.switchDialog.selectedId;
      if (!id) return;
      try {
        this.closeSwitchDialog && this.closeSwitchDialog();
        // 先通过 Vuex dispatch 正确更新 store 中的 patientId
        if (this.$store && this.$store.dispatch) {
          try { await this.$store.dispatch('user/Set_PatientID', id); } catch (_) {}
        }
        // 再同步到 localStorage
        try { localStorage.setItem('patientId', String(id)); } catch (_) {}
        // 跳转时携带新的 id 参数，让 created() 钩子读到正确的 id
        this.$router.push({ path: '/patient/patientinfo', query: { id: String(id) } });
      } catch (e) {
        // 兜底：强制刷新页面
        try { localStorage.setItem('patientId', String(id)); } catch (_) {}
        window.location.href = window.location.pathname + '#/patient/patientinfo?id=' + id;
        window.location.reload();
      }
    },

    async getPatientData() {
      // 每次加载新患者数据时清空上次AI诊断结果，避免残留
      this.patRecordsDTO.aiDiagnosis = ''
      this.patRecordsDTO.aiTreatmentProposal = ''
      this.patRecordsDTO.aiCareProposal = ''
      const id = this.patient.id
      console.log('id:' + id)
      console.log('id:' + typeof id)
      this.token = getToken()
      console.log('token:' + this.token)
      const response = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/infoone', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response')
      console.log(response)
      // const patientData = response.data.find(person => person.id === id); //
      // console.log("patientData")
      // 使用 Object.assign 合并对象
      // Object.assign(this.patient, patientData);

      // 处理响应
      if (response.data.code === 200) {
        const patientData = response.data.data
        console.log(patientData)
        Object.assign(this.patient, patientData)

        // 预警判断：infoone 有数据就直接用，没有从 Vuex store 兜底
        let vitalsSource = this.patient
        if (!vitalsSource.pulse && !vitalsSource.bloodPressure) {
          const storeList = this.$store.getters.patientList
          const matched = storeList && storeList.find(p => String(p.id) === String(id))
          if (matched) vitalsSource = matched
        }
        const warning = buildVitalsWarning(vitalsSource)
        this.$set(this.patient, 'isWarning', warning.isWarning)
        this.$set(this.patient, 'warningReason', warning.warningReason)

        console.log(this.patient)
      } else {
        this.loading = false
      }

      const response0 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/frontDiagnosisInfo', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response0')
      console.log(response0)
      // const patientData = response.data.find(person => person.id === id); //
      // console.log("patientData")
      // 使用 Object.assign 合并对象
      // Object.assign(this.patient, patientData);

      // 处理响应
      if (response0.data.code === 200) {
        const patientData = response0.data.data
        this.patient.diagnosis = patientData.dischargeDiagnosis
        this.patient.complaint = patientData.chiefComplaint || this.patient.complaint
        this.patient.treatment = patientData.treatmentPlan || this.patient.treatment
        this.patient.medication = patientData.dischargeMedications || this.patient.medication
        this.patient.pastHistory = patientData.pastHistory || this.patient.pastHistory
        this.patient.nursing = patientData.specialNursing || this.patient.nursing
        this.patient.followUp = patientData.followUpPlan || this.patient.followUp

        // 智能问诊：根据病史/主诉文本，自动勾选对应的选项
        this.pastHistory.forEach(item => {
          item.checked = !!(this.patient.pastHistory && String(this.patient.pastHistory).includes(item.label))
        })
        this.complaints.forEach(item => {
          item.checked = !!(this.patient.complaint && String(this.patient.complaint).includes(item.label))
        })
        this.updateComplaintsByMinTwoChars(this.exams, this.patient.treatment || '')
      } else {
        this.loading = false
      }

      const response1 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/frontEcgInfo', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response1')
      console.log(response1)

      if (response1.data.code === 200) {
        const ecgRecord = {
          time: new Date(response1.data.data.checkTime).toISOString().split('T')[0],
          diagnosis: response1.data.data.ecgDiagnosis,
          filePath: response1.data.data.filePath,
          analysis: '无',
          image: null
        }
        this.$set(this.patient, 'ecgRecords', [ecgRecord])
        console.log(this.patient.ecgRecords)
      }
      this.selectedEcg = this.patient.ecgRecords[0]
      this.updateEcg()

      const response2 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/frontCtInfo', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response2')
      console.log(response2)


      if (response2.data.code === 200) {
        const ctRecord = {
          time: new Date(response2.data.data.checkTime).toISOString().split('T')[0],
          diagnosis: response2.data.data.ctDiagnosis,
          filePath: response2.data.data.filePath,
          analysis: '无',
          image: null
        }
        this.$set(this.patient, 'ctRecords', [ctRecord])
        console.log(this.patient.ctRecords)
      }

      this.selectedCt = this.patient.ctRecords[0]
      await this.updateCt()

      const response3 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/frontEchoInfo', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response3')
      console.log(response3)

      if (response3.data.code === 200) {
        const echoRecord = {
          time: new Date(response3.data.data.checkTime).toISOString().split('T')[0],
          diagnosis: response3.data.data.echoDiagnosis,
          filePath: response3.data.data.filePath,
          analysis: '无',
          image: null
        }
        this.$set(this.patient, 'echoRecords', [echoRecord])
        console.log(this.patient.echoRecords)
      }


      this.selectedEcho = this.patient.echoRecords[0]

      await this.updateEcho()

      const response4 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/timenode', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response4')
      console.log(response4)

      if (response4.data.code === 200) {
        const raw = response4.data.data
        // 接口返回全量数组，用id字段匹配当前患者；若返回单个对象直接用
        const patientData = Array.isArray(raw)
          ? (raw.find(item => Number(item.id) === Number(id)) || null)
          : raw
        if (patientData) {
          this.patient.medicalRecords = [
            { No: 1, item: '发病时间',         time: patientData.onsetTime },
            { No: 2, item: '首次医疗时间',     time: patientData.firstMedicalTime },
            { No: 3, item: '心电图完成时间',   time: patientData.ecgTime },
            { No: 4, item: '肌钙蛋白报告时间', time: patientData.troponinTime },
            { No: 5, item: '球囊扩张时间',     time: patientData.dilationTime },
            { No: 6, item: '溶栓开始时间',     time: patientData.thrombolysisTime },
            { No: 7, item: '绿色通道启动时间', time: patientData.greenChannelTime }
          ]
        } else {
          console.warn('timenode 返回数据为空，id:', id)
        }
      }

      const response5 = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(API_URL + 'pat/singletimemanagement', null, {
        params: { patientId: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response5')
      console.log(response5)

      if (response5.data.code === 200) {
        // singletimemanagement 返回单个对象，直接取 data，不能用 data[id-1] 数组方式
        const patientData = response5.data.data
        // 合规判断：与行医轨迹一致，用时字段为空/无数据时默认合格，有值才比对阈值
        const qualify = (v, limit) => {
          if (v === null || v === undefined || v === '' || v === '/') return true
          const n = Number(v)
          return !Number.isFinite(n) || n <= limit
        }
        this.patient.qualitycontrol = [
          { item: '入院检查', result: '合格' },
          { item: '心电图', result: qualify(patientData.fmcToEcgInterval, 10) ? '合格' : '不合格' },
          { item: 'CT', result: qualify(patientData.doorToCtInterval, 60) ? '合格' : '不合格' },
          { item: '心脏彩超', result: qualify(patientData.doorToEchoInterval, 10) ? '合格' : '不合格' }
        ]

        console.log(this.ecgRecords)
      } else {
        //this.loading = false
      }

      // 智能问诊：根据上面已获取到的病历信息自动生成问诊文本
      try {
        await this.checkDiagnosis()
        this.syncSupplementFromDiagnosis()
      } catch (e) {
        console.warn('智能问诊初始化失败', e)
      }
    },
    viewMedicalRecord() {
      try {
        const ecgDiag = (this.selectedEcg && this.selectedEcg.diagnosis) || ''
        const ctDiag = (this.selectedCt && this.selectedCt.diagnosis) || ''
        const echoDiag = (this.selectedEcho && this.selectedEcho.diagnosis) || ''
        const assistExam = [ecgDiag, ctDiag, echoDiag].join(',')
        const diagnosisArray = assistExam.split(',')
        const uniqueDiagnoses = [...new Set(diagnosisArray)].filter(d => d && d !== 'null' && d !== '无')
        const filteredAssistExam = uniqueDiagnoses.join(',')
        this.$router.push({
          path: '/patient/erecord',
          query: { assistExam: filteredAssistExam }
        })
      } catch (e) {
        // 即使辅助检查信息获取失败，也正常跳转
        this.$router.push({ path: '/patient/erecord', query: {} })
      }
    },
    analyze(type, record) {
      // 把当前患者ID写入全局store，供viewImages兜底读取
      if (this.$store && this.$store.commit) {
        try { this.$store.commit('setPatientId', this.patient.outPatientId) } catch (e) {}
      }

      // 显示具体分析结果
      // this.analysisResult = `${type} 的分析结果：${record.analysis}`;
      this.$router.push({
        path: '/patient/viewImages',
        query: {
          imageType: type,
          imageDate: record.time,
          patientId: this.patient.outPatientId
        }
      })
    },
    async updateEcg() {
      // 更新心电图（可以根据选择的记录实现）
      console.log(`更新心电图为时间: ${this.selectedEcg.time}`)
      try {
        const response = await axios.get(API_URL + this.selectedEcg.filePath, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
          responseType: 'arraybuffer' // 设置响应类型为 arraybuffer
        })
        console.log('心电图')
        console.log(response)
        // 处理响应
        if (response.status === 200) {
          // 创建一个 Blob 对象
          const blob = new Blob([response.data], { type: response.headers['content-type'] })
          const reader = new FileReader()

          reader.onloadend = () => {
            // 将 Blob 转换为 Data URL 后赋值给 selectedEcg.image
            this.selectedEcg.image = reader.result
          }

          // 读取 Blob 对象为 Data URL
          reader.readAsDataURL(blob)
        } else {
          // 请求不成功的处理
          console.error(`请求失败: ${response.status}`)
          this.loading = false
        }
      } catch (error) {
        // 捕获并处理任何错误
        console.error('请求出错:', error)
        this.loading = false
      }
    },
    async updateCt() {
      // 更新 CT 图像（可以根据选择的记录实现）
      console.log(`更新 CT 图像为时间: ${this.selectedCt.time}`)
      const imageFiles = Array.isArray(this.selectedCt.filePath) ? this.selectedCt.filePath : [this.selectedCt.filePath]

      try {
        const response = await axios.get(API_URL + imageFiles[0], {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
          responseType: 'arraybuffer' // 设置响应类型为 arraybuffer
        })

        // 处理响应
        if (response.status === 200) {
          // 创建一个 Blob 对象
          const blob = new Blob([response.data], { type: response.headers['content-type'] })
          const reader = new FileReader()

          reader.onloadend = () => {
            // 将 Blob 转换为 Data URL 后赋值给 selectedEcg.image
            this.selectedCt.image = reader.result
          }

          // 读取 Blob 对象为 Data URL
          reader.readAsDataURL(blob)
        } else {
          // 请求不成功的处理
          console.error(`请求失败: ${response.status}`)
          this.loading = false
        }
      } catch (error) {
        // 捕获并处理任何错误
        console.error('请求出错:', error)
        this.loading = false
      }
    },
    async updateEcho() {
      // 更新心脏超声图像（可以根据选择的记录实现）
      const imageFiles = Array.isArray(this.selectedEcho.filePath) ? this.selectedEcho.filePath : [this.selectedEcho.filePath]
      try {
        const response = await axios.get(API_URL + imageFiles[0], {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
          responseType: 'arraybuffer' // 设置响应类型为 arraybuffer
        })

        // 处理响应
        if (response.status === 200) {
          // 创建一个 Blob 对象
          const blob = new Blob([response.data], { type: response.headers['content-type'] })
          const reader = new FileReader()

          reader.onloadend = () => {
            // 将 Blob 转换为 Data URL 后赋值给 selectedEcg.image
            this.selectedEcho.image = reader.result
          }

          // 读取 Blob 对象为 Data URL
          reader.readAsDataURL(blob)
        } else {
          // 请求不成功的处理
          console.error(`请求失败: ${response.status}`)
          this.loading = false
        }
      } catch (error) {
        // 捕获并处理任何错误
        console.error('请求出错:', error)
        this.loading = false
      }
    },

    // ===== 智能问诊（原 diagnosis.vue 合并而来） =====
    updateComplaintsByMinTwoChars(list, targetString) {
      const target = targetString || ''
      list.forEach(item => {
        const labelChars = [...item.label]
        let matchCount = 0
        for (const char of labelChars) {
          if (target.includes(char)) {
            matchCount++
            if (matchCount >= 2) break
          }
        }
        if (matchCount >= 2) {
          item.checked = true
        }
      })
    },
    async checkDiagnosis() {
      const selectedComplaints = this.complaints
        .filter(item => item.checked)
        .map(item => item.label)
      if (this.otherComplaint) selectedComplaints.push(this.otherComplaint)

      const selectedHistory = this.pastHistory
        .filter(item => item.checked)
        .map(item => item.label)
      if (this.otherHistory) selectedHistory.push(this.otherHistory)

      const selectedExams = this.exams
        .filter(item => item.checked)
        .map(item => item.label)
      if (this.otherExam) selectedExams.push(this.otherExam)

      const ecgText = (this.selectedEcg && this.selectedEcg.diagnosis) || ''
      const ctText = (this.selectedCt && this.selectedCt.diagnosis) || ''
      const echoText = (this.selectedEcho && this.selectedEcho.diagnosis) || ''

      this.aiDiagnosisDraft = `
患者主诉: ${selectedComplaints.join(', ') || '无'}
既往病史: ${selectedHistory.join(', ') || '无'}
已完成检查: ${selectedExams.join(', ') || '无'}
诊断结果： ${this.patient.diagnosis}
心电图结果：${ecgText || '无'}
CT结果：${ctText || '无'}
ECHO结果：${echoText || '无'}
补充说明：${this.supplementNote && this.supplementNote.trim() ? this.supplementNote.trim() : '(可编辑)'}

      `.trim()
    },
    async getAIDiagnosis() {
      const id = this.patient.id
      const token = getToken()
      const response = await axios.post(API_URL + 'hospital/records', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      if (response.data.code === 200 && response.data.data && response.data.data[0]) {
        const diagnosis = response.data.data[0]
        const { aiCareProposal, aiCareTime, aiDiagnosis, aiDiagnosisTime, aiTreatmentProposal, aiTreatmentTime } = diagnosis
        this.patRecordsDTO.aiDiagnosis = this.processTreatmentText(aiDiagnosis).trim()
        this.patRecordsDTO.aiDiagnosisTime = aiDiagnosisTime
        this.patRecordsDTO.aiCareProposal = this.processTreatmentText(aiCareProposal).trim()
        this.patRecordsDTO.aiCareTime = aiCareTime
        this.patRecordsDTO.aiTreatmentProposal = this.processTreatmentText(aiTreatmentProposal).trim()
        this.patRecordsDTO.aiTreatmentTime = aiTreatmentTime
      }
    },
    async submitAIDiagnosis() {
      const token = getToken()
      this.patRecordsDTO.patientId = this.patient.id
      await axios.post(API_URL + 'hospital/records/add', this.patRecordsDTO, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
    },
    async submitDiagnosis() {
      this.uiLoading = true
      try {
        await this.fetchDiagnosis()
        await this.fetchTreatment()
        await this.fetchCare()
        await this.submitAIDiagnosis()
        await this.$nextTick()
        await this.waitUntil(() => !!(this.patRecordsDTO.aiDiagnosis && this.patRecordsDTO.aiTreatmentProposal && this.patRecordsDTO.aiCareProposal), 30000, 120)
      } finally {
        this.uiLoading = false
      }
    },
    async fetchDiagnosis() {
      const prompt = this.buildAiPrompt('请你根据以上胸痛患者的具体信息，给出专业的诊断结果。分成两部分进行回答，第一段是根据给出的患者信息进行思考推断（用文字整理清楚，并回答出来），第二段给出的病历诊断结果（详细丰富专业，150字左右），不要字体格式，不要写第一段第二段，仅返回第二段内容', '你是一名具有30年主治经验的胸痛中心主治医生，')
      this.syncSupplementFromDiagnosis()
      const response = await sendOpenAIRequest(prompt)
      this.patRecordsDTO.aiDiagnosis = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiDiagnosisTime = new Date()
    },
    async fetchTreatment() {
      const prompt = this.buildAiPrompt('请你根据以上胸痛患者的信息，并结合上面给出的诊断结果，给出专业的治疗方案，治疗方案需要专业，多维度考虑。（200字左右），不要字体格式，不显示*号', '你是具有30年主治经验的胸痛中心主治医生，')
      this.syncSupplementFromDiagnosis()
      const response = await sendOpenAIRequest(prompt)
      this.patRecordsDTO.aiTreatmentProposal = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiTreatmentTime = new Date()
    },
    async fetchCare() {
      const prompt = this.buildAiPrompt('请你在前面给出的患者信息、诊断结果、治疗方案的基础上，针对该患者给出专业的护理方案。不要字体格式，分点作答（200字左右）', '你是具有30年护理经验的胸痛中心护理主任，')
      this.syncSupplementFromDiagnosis()
      const response = await sendOpenAIRequest(prompt)
      this.patRecordsDTO.aiCareProposal = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiCareTime = new Date()
    },
    buildAiPrompt(instruction, role) {
      const draftInfo = (this.aiDiagnosisDraft || '').trim()
      return '以下是患者的基本信息：\n' + draftInfo +
        '\n\n' + role + instruction
    },
    processTreatmentText(text) {
      if (!text) return ''
      const separatorRegex = /(?<=[:：。；])/g
      let segments = text.split(separatorRegex)
      segments = segments.map(segment => segment.trim()).filter(segment => segment !== '')
      if (!segments.length) return ''

      const hasExistingNumbering = segments.some(seg => /^\s*\d+[.、]\s+/.test(seg))
      if (hasExistingNumbering) {
        segments = segments.map(seg => seg.replace(/^\s*\d+\.\s*(\d+[.、]\s+)/, '$1'))
        return segments.join('\n')
      } else {
        const firstSegmentHasColon = segments.length > 0 && (segments[0].endsWith('：') || segments[0].endsWith(':'))
        if (firstSegmentHasColon && segments.length > 1) {
          const firstSegment = segments[0]
          const numberedSegments = segments.slice(1).map((segment, index) => `${index + 1}. ${segment}`)
          return [firstSegment, ...numberedSegments].join('\n')
        } else {
          return segments.map((segment, index) => `${index + 1}. ${segment}`).join('\n')
        }
      }
    },
    handleDiagnosisInput() {
      try {
        if (!this.aiDiagnosisDraft) return
        this.aiDiagnosisDraft = this.aiDiagnosisDraft.replace(/(补\s*充\s*说\s*明\s*[:：])\s*[（(]可编辑[）)]/g, '$1 ')
      } catch (e) {}
    },
    handleDiagnosisBlur() {
      try {
        if (!this.aiDiagnosisDraft) return
        const noContent = /(补\s*充\s*说\s*明\s*[:：])\s*(?:\n|$)/
        if (noContent.test(this.aiDiagnosisDraft)) {
          this.aiDiagnosisDraft = this.aiDiagnosisDraft.replace(noContent, '$1（可编辑）\n')
        }
      } catch (e) {}
    },
    handleDiagnosisFocus() {
      try {
        if (!this.aiDiagnosisDraft) return
        this.aiDiagnosisDraft = this.aiDiagnosisDraft.replace(/(补\s*充\s*说\s*明\s*[:：])\s*[（(]可编辑[）)]/g, '$1 ')
      } catch (e) {}
    },
    syncSupplementFromDiagnosis() {
      try {
        const txt = (this.aiDiagnosisDraft || '').toString()
        const m = txt.match(/补\s*充\s*说\s*明\s*[:：]\s*([^\n]*)/)
        const v = m && m[1] ? m[1].trim() : ''
        this.supplementNote = v || ''
      } catch (e) {
        this.supplementNote = ''
      }
    },
    show(value) {
      if (typeof value === 'string') { const t = value.trim(); return t ? t : '无' }
      return value ? String(value) : '无'
    },
    async waitUntil(cond, timeout = 30000, interval = 120) {
      const start = Date.now()
      return await new Promise((resolve) => {
        const timer = setInterval(() => {
          try {
            if (cond()) { clearInterval(timer); resolve() }
            else if (Date.now() - start > timeout) { clearInterval(timer); resolve() }
          } catch (e) {
            if (Date.now() - start > timeout) { clearInterval(timer); resolve() }
          }
        }, interval)
      })
    }
  }
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
  margin: 5px 10px 10px 10px;
  padding: 10px;
  border-radius: 8px;
  h3{
    margin: 2px;

  display: flex;
  align-items: center;
  justify-content: space-between;}
}

.warning-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  background: #f56c6c;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  vertical-align: middle;
}

.info-container, .card-container, .record-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item, .card {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px; /* 圆角 */
  padding: 5px;
  flex: 1; /* 平均分配宽度 */
  margin: 0 10px; /* 左右间距 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.info-item {
  text-align: center; /* 内容居中 */
}

.card h4 {
  margin-bottom: 10px;
  margin-top: 10px;
}

.header-controls {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: space-between; /* 适当分配空间 */
  margin-bottom: 10px; /* 底部间距 */

}
.image-container {
  display: flex;           /* 使用 Flexbox */
  justify-content: center; /* 水平居中 */
  width: 100%;            /* 容器占满父元素的宽度 */
}

.controls {
  display: flex; /* 水平排列 */
  align-items: center; /* 垂直居中对齐 */
}

.image {
  width: 100%; /* 图片宽度100% */
  height: auto; /* 自适应高度 */
  border-radius: 10px; /* 圆角 */
}

select {
  margin-left: 10px;
  margin-right: 10px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.analysis-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.analysis-popup h4 {
  margin-top: 0;
}

.analysis-popup button {
  background-color: #dc3545; /* 红色关闭按钮 */
}
.table-controll{
  max-height: 30vh;
  overflow-y: auto; /* 允许垂直滚动 */
}

table {
  width: 100%;
  border-collapse: collapse;

}
th{
  position: sticky;
  top: 0; /* 在滚动时保持顶部 */
  background-color: #fff; /* 表头背景颜色 */
  z-index: 1; /* 确保表头在其他内容之上 */
  border-bottom: 2px solid #ddd; /* 底部边框以便于区分 */
}
th, td {

  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.text-green {
  color: green; /* 合格时的字体颜色 */
}

.text-red {
  color: red; /* 不合格时的字体颜色 */
}

th {
  background-color: #f2f2f2;
}

/* === 切换患者弹窗样式（自动注入） === */
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
.modal-footer .primary{background:#409eff;border:1px solid #409eff;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;}
.modal-footer .primary:disabled{opacity:.5;cursor:not-allowed;}
.switch-btn{padding:4px 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;line-height:22px;margin-left:8px;}
.switch-btn:hover{background:#f6f6f6;}
.header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ===== 智能问诊样式（原 diagnosis.vue 合并而来，统一加 ai- 前缀避免与上面的卡片样式冲突） ===== */
.ai-checkbox-all {
  background-color: white;
  margin: 0 10px 10px 10px;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.ai-checkbox-all h4 {
  margin-bottom: 10px;
}
.ai-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  margin-left: 2%;
}
.ai-checkbox-item {
  margin-right: 20px;
  display: flex;
  align-items: center;
}
.ai-text-area {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  resize: vertical;
}
.ai-diagnosis-button {
  margin-top: 10px;
}
.ai-card-container {
  display: flex;
  justify-content: space-between;
  margin: 0 10px 10px 10px;
}
.ai-card {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
}
.ai-card-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}
.ai-card-content {
  white-space: pre-wrap;
  line-height: 1.5;
  letter-spacing: 0.05em;
  flex-grow: 1;
}
.ai-card-editable {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: #fafafa;
  color: #222;
  outline: none;
  transition: border-color 0.2s;
}
.ai-card-editable:focus {
  border-color: #409eff;
  background: #fff;
}
.ai-waiting-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  flex-direction: column;
}
.ai-spinner {
  width: 64px;
  height: 64px;
  border: 6px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ai-spin 1s linear infinite;
}
.ai-waiting-text {
  margin-top: 12px;
  color: #fff;
  font-size: 14px;
}
@keyframes ai-spin { to { transform: rotate(360deg); } }
</style>
