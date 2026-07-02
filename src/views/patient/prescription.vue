<template>
  <div class="container">

    <!-- Waiting Overlay -->
    <div v-if="uiLoading" class="waiting-overlay">
      <div class="spinner"></div>
      <div class="waiting-text">正在生成，请稍候…</div>
    </div>


    <div class="info-section">
      <div class="info-row">
        <h2 style="margin-right: 5%">患者信息</h2>

        <span> {{ patient.name }} </span> |
        <span> {{ patient.gender }} </span> |
        <span> {{ patient.age }}岁 </span> |
        <!--
         <span>记录ID: {{ patient.recordId }} </span> |
        <span>患者类型: {{ patient.type }}</span> |
        <span>发病时间: {{ patient.onsetTime }}</span> |
         -->
        <span>入院时间: {{ formatDate(patient.admissionTime) }}</span> |
        <span>出院时间 : {{ formatDate(patient.dischargeTime) }}</span>
        <button class="switch-btn" @click="openSwitchDialog">切换</button>
      </div>
    </div>

    <div class="checkbox-all">
      <!--<input v-model="diagnosis" type="text" placeholder="大模型辅助智能...">-->
      <textarea v-model="diagnosis" class="text-area" placeholder="大模型辅助智能疾病诊断..." rows="12" style="min-height:220px;" @focus="handleDiagnosisFocus" @input="handleDiagnosisInput" @blur="handleDiagnosisBlur"></textarea>
      <button class="diagnosis-button" @click="submitDiagnosis">智能处方</button>
      <button class="diagnosis-button send-button" :disabled="!hasSmartPrescription || sendingPrescription" @click="sendPrescriptionToPatient">
        {{ sendingPrescription ? '发送中...' : '发送给病人' }}
      </button>
    </div>


<div class="card-container">
  <div class="card">
    <div class="header"><button @click="">运动处方</button></div>
    <textarea class="content" v-model="patRecordsDTO.rxExercise" placeholder="暂无内容"></textarea>
  </div>
  <div class="card">
    <div class="header"><button @click="">营养处方</button></div>
    <textarea class="content" v-model="patRecordsDTO.rxNutrition" placeholder="暂无内容"></textarea>
  </div>
  <div class="card">
    <div class="header"><button @click="">生活方式处方</button></div>
    <textarea class="content" v-model="patRecordsDTO.rxLifestyle" placeholder="暂无内容"></textarea>
  </div>
  <div class="card">
    <div class="header"><button @click="">药物处方</button></div>
    <textarea class="content" v-model="patRecordsDTO.rxMedication" placeholder="暂无内容"></textarea>
  </div>
  <div class="card">
    <div class="header"><button @click="">心理处方</button></div>
    <textarea class="content" v-model="patRecordsDTO.rxPsychology" placeholder="暂无内容"></textarea>
  </div>
</div>


  <!-- 切换患者弹窗（prescription 注入） -->
  <div v-if="switchDialog.visible" class="modal-backdrop" @click.self="closeSwitchDialog">
    <div class="modal">
      <div class="modal-header">
        <div class="title">切换患者</div>
        <div class="search-bar">
          <input
            v-model.trim="switchDialog.keyword"
            type="text"
            placeholder="搜索姓名或住院号"
            @keyup.enter="applyFilter()"
          />
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
            <td>{{ formatDate(p.firstMedicalTime) }}</td>
            <td>{{ formatDate(p.onsetTime) }}</td>
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
import { API_URL, sendOpenAIRequest } from '@/api/constants'
import {date} from "jszip/lib/defaults";

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
  data() {
    return {
      supplementNote: '',uiLoading: false,

      switchDialog: { visible:false, loading:false, error:'', keyword:'', rawList:[], filtered:[], selectedId:null },
      patient: {
        id: '',
        age: 46,
        gender: '男',
        name: '张勇',
        admissionTime: '2025-04-01 12:30',
        dischargeTime: '已出院',
        doctor: '李智兴',
        complaint: '胸痛、气短',
        physicalExam: '心率正常，血压稳定。',
        assistExam: '心电图正常，CT显示无异常。',
        diagnosis: '心脏病',
        treatment: '建议住院观察，控制心率。',
        medication: '阿莫西林，一天三次。',
        surgery: '无',
        nursing: '定期监测生命体征。',
        followUp: '一周后复查。'

      },
      patRecordsDTO: {
        rxExercise: "",
        rxNutrition: "",
        rxLifestyle: "",
        rxMedication: "",
        rxPsychology: "",
        rxGeneratedAt: "",
        aiCareProposal: "",
        aiCareTime: "",
        aiDiagnosis: "",
        aiDiagnosisTime: "",
        aiTreatmentProposal: "",
        aiTreatmentTime: "",
        patientId: 0
      },
      diagnosis: "",
      sendingPrescription: false,
      otherComplaint: '',
      otherHistory: '',
      otherExam: ''

    }
  },
  created() {
    try {
      const eff = this.getEffectivePatientId && this.getEffectivePatientId();
      if (eff) this.syncIdToAll(eff);
    } catch (_) {}
    try {
      if (this.patient && this.patient.id && typeof this.getPatientData === 'function') {
        this.getPatientData();
      }
    } catch (_) {}
  },

  activated() {
    const qid = this.$route && (this.$route.query.patientId || (this.$route.params && this.$route.params.patientId));
    if (qid && String(qid) !== String(this.patient.id)) {
      this.patient.id = String(qid);
      this.getPatientData();
      this.getDiagnosis && this.getDiagnosis();
      this.getAIDiagnosis && this.getAIDiagnosis();
    }
  },
  computed: {
    hasSmartPrescription() {
      const r = this.patRecordsDTO || {}
      return !!(r.rxExercise || r.rxNutrition || r.rxLifestyle || r.rxMedication || r.rxPsychology)
    }
  },
  watch: {
      diagnosis() { this.syncSupplementFromDiagnosis() },
    '$route.query.patientId'(val) {
      if (val && String(val) !== String(this.patient.id)) {
        this.patient.id = String(val);
        this.getPatientData();
        this.getDiagnosis && this.getDiagnosis();
        this.getAIDiagnosis && this.getAIDiagnosis();
      }
    }
  },

  methods: {

      show(value) {
        if (typeof value === 'string') {
          const t = value.trim();
          return t ? t : '无';
        }
        return value ? String(value) : '无';
      },
      syncSupplementFromDiagnosis() {
        try {
          const txt = (this.diagnosis || '').toString();
          const m = txt.match(/补\s*充\s*说\s*明\s*[:：]\s*([^\n]*)/);
          const v = m && m[1] ? m[1].trim() : '';
          this.supplementNote = v || '';
        } catch (e) {
          this.supplementNote = '';
        }
      },
      handleDiagnosisFocus() {
        try {
          if (!this.diagnosis) return;
          this.diagnosis = this.diagnosis.replace(/(补\s*充\s*说\s*明\s*[:：])\s*[（(]可编辑[）)]/g, '$1 ');
        } catch (e) {}
      },
      handleDiagnosisInput() {
        try {
          if (!this.diagnosis) return;
          this.diagnosis = this.diagnosis.replace(/(补\s*充\s*说\s*明\s*[:：])\s*[（(]可编辑[）)]/g, '$1 ');
        } catch (e) {}
      },
      handleDiagnosisBlur() {
        try {
          if (!this.diagnosis) return;
          const noContent = /(补\s*充\s*说\s*明\s*[:：])\s*(?:\n|$)/;
          if (noContent.test(this.diagnosis)) {
            this.diagnosis = this.diagnosis.replace(noContent, '$1（可编辑）\n');
          }
        } catch (e) {}
      },

    async waitUntil(cond, timeout = 30000, interval = 120) {
      const start = Date.now();
      return await new Promise((resolve) => {
        const timer = setInterval(() => {
          try {
            if (cond()) { clearInterval(timer); resolve(); }
            else if (Date.now() - start > timeout) { clearInterval(timer); resolve(); } // fail-safe
          } catch (e) {
            if (Date.now() - start > timeout) { clearInterval(timer); resolve(); }
          }
        }, interval);
      });
    },

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
    // ======= 切换患者弹窗（标准逻辑） =======
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
    getEffectivePatientId() {
      const b = this.getIdFromUrlBeforeHash(); if (b) return b;
      const h = this.getIdFromHashQuery(); if (h) return h;
      try {
        const q = this.$route && this.$route.query && (Number(this.$route.query.id) || Number(this.$route.query.patientId));
        if (q) return q;
      } catch (_) {}
      try {
        const s = this.$store && this.$store.getters && Number(this.$store.getters.patientId);
        if (s) return s;
      } catch (_) {}
      try {
        const l = Number(localStorage.getItem('patientId') || '');
        if (l) return l;
      } catch (_) {}
      const self = this.patient && Number(this.patient.id);
      return self || null;
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
    setEffectivePatientId(id, { updateUrl = false, reload = false } = {}) {
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
    openSwitchDialog() {
      this.switchDialog.visible = true;
      this.switchDialog.error = '';
      this.switchDialog.keyword = '';
      this.switchDialog.selectedId = null;
      this.fetchAllPatients().then(() => this.applyFilter());
    },
    closeSwitchDialog() { this.switchDialog.visible = false; },
    applyFilter() {
      const kw = (this.switchDialog.keyword || '').toLowerCase();
      if (!kw) { this.switchDialog.filtered = this.switchDialog.rawList.slice(0, 2000); return; }
      this.switchDialog.filtered = this.switchDialog.rawList.filter(p => {
        const name = (p.patientName || '').toLowerCase();
        const opId = (p.outpatientId || '').toLowerCase();
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
      const id = this.switchDialog.selectedId;
      if (!id) return;
      try {
        this.setEffectivePatientId(id, { updateUrl: true, reload: true });
      } catch (e) {
        this.syncIdToAll(id);
        window.location.reload();
      } finally {
        this.closeSwitchDialog();
      }
    },

    // 智能规整列表：若文本已带序号/项目符号，则仅换行清洗；否则补充为 1./2./3. 编号
    formatSmartList(raw) {
      if (!raw) return '';
      try {
        let text = String(raw).replace(/\r/g, '').trim();
        if (!text) return '';

        // 首先切行；若只有一行再按常见分隔符分割
        let parts = text.split(/\n+/).map(t => t.trim()).filter(Boolean);
        if (parts.length <= 1) {
          parts = text.split(/[；;。•·]|\s+-\s+/).map(t => t.trim()).filter(Boolean);
        }
        if (parts.length === 0) return '';

        // 判断是否“已编号/带项目符号”的行
        const numRe = /^\s*(?:\d+[\.|、\)]|[（(]?\d+[）)]|[一二三四五六七八九十]+[、\.)]|[（(][一二三四五六七八九十]+[）)])\s*/;
        const bulletRe = /^\s*[-–—•·]\s+/;
        const alreadyNumberedCount = parts.reduce((acc, t) => acc + (numRe.test(t) || bulletRe.test(t) ? 1 : 0), 0);
        const alreadyNumbered = alreadyNumberedCount >= Math.ceil(parts.length * 0.5);

        if (alreadyNumbered) {
          return parts.map(t => t.replace(/\s+/g, ' ').trim()).join('\n');
        } else {
          return parts.map((t, i) => `${i + 1}. ${t}`).join('\n');
        }
      } catch (e) {
        return String(raw);
      }
    },


    async getPatientData() {
      const id = this.patient.id || (this.$route && (this.$route.query.patientId || (this.$route.params && this.$route.params.patientId))) || ''
      //console.log('id:' + id)
      //console.log('id:' + typeof id)
      this.token = getToken()
      //console.log('token:' + this.token)
      const response = await axios.post(API_URL + 'pat/infoone', null, {
        params: { id: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      //console.log('response')
      //console.log(response)
      // const patientData = response.data.find(person => person.id === id); //
      // console.log("patientData")
      // 使用 Object.assign 合并对象
      // Object.assign(this.patient, patientData);

      // 处理响应
      if (response.data.code === 200) {
        const patientData = response.data.data
        //console.log(patientData)
        this.patient.age = patientData.age
        this.patient.name = patientData.patientName
        this.patient.gender = patientData.gender
        this.patient.phone = patientData.phone || patientData.phoneNo || patientData.mobile || ''
        //console.log(this.patient)
      } else {
        this.loading = false
      }

      const response1 = await axios.post(API_URL + 'pat/frontAnalysis', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      //console.log('response1')
      //console.log(response1)
      // 处理响应
      if (response1.data.code === 200) {
        const patient = response1.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段
        const { userName, patientName, firstMedicalTime, dischargeTime, ...rest } = patient // 排除 userName
        // 更新 this.patient，直接合并新的字段
        // Object.assign(this.patient, rest); // 合并其他字段
        // 单独赋值
        this.patient.admissionTime = firstMedicalTime // 更新 admissionTime
        // 出院时间显示逻辑：为空→暂未出院；大于当前→住院中；否则原值
        const now = new Date()
        let dischargeDisplay
        if (!dischargeTime) {
          dischargeDisplay = '暂未出院'
        } else {
          const dischargeDate = new Date(String(dischargeTime).replace(/\//g, '-'))
          dischargeDisplay = dischargeDate > now ? '住院中' : dischargeTime
        }
        this.patient.dischargeTime = dischargeDisplay // 更新出院时间

        this.patient.doctor = userName // 更新医生信息
        this.fetchSmartPrescription && await this.fetchSmartPrescription();

        //console.log(this.patient)
      } else {
        this.loading = false
      }
      const response2 = await axios.post(API_URL + 'pat/frontDiagnosisInfo', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      //console.log(response2)
      // 处理响应
      if (response2.data.code === 200) {
        const patient = response2.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段

        this.patient.complaint = patient.chiefComplaint
        this.patient.diagnosis = patient.dischargeDiagnosis || patient.dishcargeDiagnosis
        this.patient.treatment = patient.treatmentPlan
        this.patient.medication = patient.dischargeMedications
        this.patient.surgery = patient.surgery
        this.patient.nursing = patient.specialNursing
        this.patient.followUp = patient.followUpPlan
        // 动态填充一键诊断上方文本框内容（仅修改该文本框的内容）
        this.diagnosis = `出院诊断：${patient.dishcargeDiagnosis || patient.dischargeDiagnosis || ''}
出院用药：${patient.dischargeMedications || ''}
特殊护理：${patient.specialNursing || ''}
随访计划：${patient.followUpPlan || ''}
补充说明：${this.supplementNote && this.supplementNote.trim() ? this.supplementNote.trim() : '（可编辑）'}`
        this.complaints.forEach(item=>{
          if(this.patient.complaint.includes(item.label))
            item.checked = true
        })
        this.updateComplaintsByMinTwoChars(this.exams,this.patient.treatment)
        await this.checkDiagnosis()
        console.log('主诉： ' + this.complaints)

        //console.log(this.patient)
      } else {
        this.loading = false
      }
      //this.fetchDiagnosis()
      //this.fetchTreatment()
      //this.fetchCare()
    },
    updateComplaintsByMinTwoChars(complaints, targetString) {
      complaints.forEach(item => {
        // 将label拆分为字符数组
        const labelChars = [...item.label];
        // 统计匹配的字符数量
        let matchCount = 0;

        // 遍历每个字符检查是否在目标字符串中
        for (const char of labelChars) {
          if (targetString.includes(char)) {
            matchCount++;
            // 一旦达到2个匹配，可以提前退出循环
            if (matchCount >= 2) {
              break;
            }
          }
        }
        // 至少匹配2个字符才更新状态
        if (matchCount >= 2) {
          item.checked = true;
        }
      });
    },
    async getAIDiagnosis() {
      const id = this.patient.id
      const token = getToken()
      //console.log('token:' + token)
      const response = await axios.post(API_URL + 'hospital/records', null,
        {
          params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      if (response.data.code === 200) {
        const diagnosis = response.data.data[0]
        const { aiCareProposal, aiCareTime, aiDiagnosis, aiDiagnosisTime, aiTreatmentProposal, aiTreatmentTime, diagnosisProposal, patientId } = diagnosis
        this.patRecordsDTO.aiDiagnosis = this.processTreatmentText(aiDiagnosis).trim()
        this.patRecordsDTO.aiDiagnosisTime = aiDiagnosisTime
        this.patRecordsDTO.aiCareProposal = this.processTreatmentText(aiCareProposal).trim()
        this.patRecordsDTO.aiCareTime = aiCareTime
        this.patRecordsDTO.aiTreatmentProposal  = this.processTreatmentText(aiTreatmentProposal).trim()
        this.patRecordsDTO.aiTreatmentTime = aiTreatmentTime

      }
    },

    async submitAIDiagnosis() {

      const id = this.patient.id
      const token = getToken()
      //.log('token:' + token)
      this.patRecordsDTO.patientId = this.patient.id

      this.patRecordsDTO.aiCareProposal.replace(/\\/g, '\\\\') // 先转义反斜杠
        .replace(/\n/g, '\\n')  // 转义换行符
        .replace(/\r/g, '\\r')  // 转义回车符
        .replace(/"/g, '\\"')  // 转义双引号,
        .trim()

      this.patRecordsDTO.aiTreatmentProposal.replace(/\\/g, '\\\\') // 先转义反斜杠
        .replace(/\n/g, '\\n')  // 转义换行符
        .replace(/\r/g, '\\r')  // 转义回车符
        .replace(/"/g, '\\"')  // 转义双引号,
        .trim()

      this.patRecordsDTO.aiDiagnosis.replace(/\\/g, '\\\\') // 先转义反斜杠
        .replace(/\n/g, '\\n')  // 转义换行符
        .replace(/\r/g, '\\r')  // 转义回车符
        .replace(/"/g, '\\"')  // 转义双引号,
        .trim()

      this.diagnosis.replace(/\\/g, '\\\\') // 先转义反斜杠
        .replace(/\n/g, '\\n')  // 转义换行符
        .replace(/\r/g, '\\r')  // 转义回车符
        .replace(/"/g, '\\"')  // 转义双引号,

      const response = await axios.post(API_URL + 'hospital/records/add', this.patRecordsDTO,
        {

          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

    },
    async checkDiagnosis(){
      const selectedComplaints = this.complaints
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherComplaint) {
        selectedComplaints.push(this.otherComplaint)
      }

      const selectedHistory = this.pastMedicalHistory
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherHistory) {
        selectedHistory.push(this.otherHistory)
      }

      const selectedExams = this.exams
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherExam) {
        selectedExams.push(this.otherExam)
      }
      this.diagnosis = `
        患者主诉: ${selectedComplaints.join(', ') || '无'}
既往病史: ${selectedHistory.join(', ') || '无'}
已完成检查: ${selectedExams.join(', ') || '无'}
诊断结果： ${this.patient.diagnosis}
补充说明：${this.supplementNote && this.supplementNote.trim() ? this.supplementNote.trim() : '（可编辑）'}
      `.trim()
      //console.log('诊断信息:', this.diagnosis)
    },
    async getDiagnosis(){
      const selectedComplaints = this.complaints
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherComplaint) {
        selectedComplaints.push(this.otherComplaint)
      }

      const selectedHistory = this.pastMedicalHistory
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherHistory) {
        selectedHistory.push(this.otherHistory)
      }

      const selectedExams = this.exams
        .filter(item => item.checked)
        .map(item => item.label)

      if (this.otherExam) {
        selectedExams.push(this.otherExam)
      }

      // 这里可以添加逻辑来处理诊断信息的提交
      const response0 = await axios.post(API_URL + 'pat/frontDiagnosisInfo', null, {
        params: { id: this.patient.id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      //console.log('response0')
      //console.log(response0)
      // const patientData = response.data.find(person => person.id === id); //
      // console.log("patientData")
      // 使用 Object.assign 合并对象
      // Object.assign(this.patient, patientData);

      // 处理响应
      if (response0.data.code === 200) {
        const patientData = response0.data.data
        this.patient.diagnosis = patientData.dischargeDiagnosis
        this.diagnosis += this.patient.diagnosis
        this.diagnosis = `
        患者主诉: ${selectedComplaints.join(', ') || '无'}
既往病史: ${selectedHistory.join(', ') || '无'}
已完成检查: ${selectedExams.join(', ') || '无'}
诊断结果： ${this.patient.diagnosis}
补充说明：${this.supplementNote && this.supplementNote.trim() ? this.supplementNote.trim() : '（可编辑）'}
      `.trim()
      } else {
        this.loading = false
      }
      // 提交诊断的方法
      //console.log('诊断信息:', this.diagnosis)
    },

    async  submitDiagnosis() {
      this.uiLoading = true;
      try {

      await this.generateFivePrescriptions();
      await this.saveSmartPrescription();

        await this.$nextTick();
        await this.waitUntil(() => !!(this.patRecordsDTO.rxExercise && this.patRecordsDTO.rxNutrition && this.patRecordsDTO.rxLifestyle && this.patRecordsDTO.rxMedication && this.patRecordsDTO.rxPsychology), 30000, 120);
      } finally {
        this.uiLoading = false;
      }
    },

    async generateFivePrescriptions() {
      const base = '患者信息，患者' + this.patient.name + '，' + this.patient.age + '岁，' +
        this.patient.gender + '性，因' + this.patient.complaint + '入院，体格检查结果：' + this.patient.physicalExam +
        '，完成心电图、ct等辅助检查，结果为' + this.patient.assistExam + '，临床诊断结果为：' + (this.patient.diagnosis || '') +
        '，治疗建议：' + (this.patient.treatment || '') + '，用药记录：' + (this.patient.medication || '') + '，手术记录：' + (this.patient.surgery || '') +
        '，护理记录：' + (this.patient.nursing || '') + '，随访计划：' + (this.patient.followUp || '') + '；补充说明：' + this.show(this.supplementNote) + '。';

      const prompt = base + ' 现在请基于上述信息，为该患者生成“**五大处方建议**”：' +
        '1) 运动处方（频次、强度、时间、类型；含注意事项）；' +
        '2) 营养处方（总热量、结构、限制与忌口）；' +
        '3) 生活方式处方（日常作息、戒烟限酒、压力管理等）；' +
        '4) 药物处方（用药类别、剂量区间、监测与不良反应警示——仅建议，不代替医嘱）；' +
        '5) 心理处方（心理调适、家属支持与复诊提醒）。' +
        '务必**只输出JSON**，键为 exercise, nutrition, lifestyle, medication, psychology，值为中文建议（分点，200字内）。不得输出多余文本。';

      this.syncSupplementFromDiagnosis();
      const resp = await sendOpenAIRequest(prompt);
      const raw = (resp && resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content) || '';
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); } catch(e2) { parsed = null; }
        }
      }
      if (!parsed || typeof parsed !== 'object') {
        this.patRecordsDTO.rxExercise = '';
        this.patRecordsDTO.rxNutrition = '';
        this.patRecordsDTO.rxLifestyle = this.formatSmartList(raw.trim());
        this.patRecordsDTO.rxMedication = '';
        this.patRecordsDTO.rxPsychology = '';
      } else {
        this.patRecordsDTO.rxExercise = this.formatSmartList((parsed.exercise || '').toString().trim());
        this.patRecordsDTO.rxNutrition = this.formatSmartList((parsed.nutrition || '').toString().trim());
        this.patRecordsDTO.rxLifestyle = this.formatSmartList((parsed.lifestyle || '').toString().trim());
        this.patRecordsDTO.rxMedication = this.formatSmartList((parsed.medication || '').toString().trim());
        this.patRecordsDTO.rxPsychology = this.formatSmartList((parsed.psychology || '').toString().trim());
      }
      this.patRecordsDTO.rxGeneratedAt = new Date();
    },
    async saveSmartPrescription() {
      try {
        const dto = {
          patientId: Number(this.patient.id),
          aiSport: this.patRecordsDTO.rxExercise || '',
          aiNutrition: this.patRecordsDTO.rxNutrition || '',
          aiLifestyle: this.patRecordsDTO.rxLifestyle || '',
          aiPrescription: this.patRecordsDTO.rxMedication || '',
          aiPsycho: this.patRecordsDTO.rxPsychology || '',
          updateTime: new Date()
        };
        const res = await axios.post(API_URL + 'hospital/aiprescription/add', dto, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        });
        if (res && res.data && res.data.code === 200) {
          this.patRecordsDTO.rxGeneratedAt = dto.updateTime;
        } else {
          console.warn('saveSmartPrescription failed:', res && res.data);
        }
      } catch (e) {
        console.error('saveSmartPrescription error:', e);
      }
    },

    buildPrescriptionMessage() {
      const p = this.patient || {}
      const r = this.patRecordsDTO || {}
      return [
        '【胸痛中心智能处方】',
        `患者：${p.name || ''}`,
        `生成时间：${this.formatDate(r.rxGeneratedAt || new Date())}`,
        '',
        '一、运动处方',
        r.rxExercise || '无',
        '',
        '二、营养处方',
        r.rxNutrition || '无',
        '',
        '三、生活方式处方',
        r.rxLifestyle || '无',
        '',
        '四、药物处方',
        r.rxMedication || '无',
        '',
        '五、心理处方',
        r.rxPsychology || '无',
        '',
        '提示：以上内容为医生审核后的康复建议，请遵医嘱执行。'
      ].join('\n')
    },

    copyPrescriptionText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
      }
      window.prompt('复制智能处方内容', text)
      return Promise.resolve()
    },

    async sendPrescriptionToPatient() {
      if (!this.hasSmartPrescription) {
        this.$message && this.$message.warning ? this.$message.warning('请先生成智能处方') : alert('请先生成智能处方')
        return
      }
      this.sendingPrescription = true
      const token = getToken()
      const dto = {
        patientId: Number(this.patient.id),
        patientName: this.patient.name || '',
        phone: this.patient.phone || '',
        content: this.buildPrescriptionMessage(),
        aiSport: this.patRecordsDTO.rxExercise || '',
        aiNutrition: this.patRecordsDTO.rxNutrition || '',
        aiLifestyle: this.patRecordsDTO.rxLifestyle || '',
        aiPrescription: this.patRecordsDTO.rxMedication || '',
        aiPsycho: this.patRecordsDTO.rxPsychology || '',
        updateTime: new Date()
      }
      try {
        const res = await axios.post(API_URL + 'hospital/aiprescription/push', dto, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
        if (res && res.data && res.data.code === 200) {
          this.$message && this.$message.success ? this.$message.success('智能处方已发送给病人') : alert('智能处方已发送给病人')
        } else {
          throw new Error((res && res.data && (res.data.msg || res.data.message)) || '发送接口暂未开通')
        }
      } catch (e) {
        try {
          await this.copyPrescriptionText(dto.content)
          this.$message && this.$message.warning ? this.$message.warning('发送接口暂未开通，已生成可复制的智能处方内容') : alert('发送接口暂未开通，已生成可复制的智能处方内容')
        } catch (_) {
          window.prompt('复制智能处方内容', dto.content)
        }
      } finally {
        this.sendingPrescription = false
      }
    },


    async fetchSmartPrescription() {
      try {
        const id = this.patient.id || (this.$route && (this.$route.query.patientId || (this.$route.params && this.$route.params.patientId))) || '';
        const res = await axios.post(API_URL + 'hospital/aiprescription', null, {
          params: { patientId: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        });
        if (res && res.data && res.data.code === 200 && Array.isArray(res.data.data) && res.data.data.length) {
          const list = res.data.data.slice().sort((a,b) => new Date(a.updateTime||0) - new Date(b.updateTime||0));
          const last = list[list.length - 1];
          this.patRecordsDTO.rxExercise = this.formatSmartList((last.aiSport ||  '').toString());
          this.patRecordsDTO.rxNutrition = this.formatSmartList((last.aiNutrition || '').toString());
          this.patRecordsDTO.rxLifestyle = this.formatSmartList((last.aiLifestyle || '').toString());
          this.patRecordsDTO.rxMedication = this.formatSmartList((last.aiPrescription || '').toString());
          this.patRecordsDTO.rxPsychology = this.formatSmartList((last.aiPsycho || '').toString());
          this.patRecordsDTO.rxGeneratedAt = last.updateTime || '';
        }
      } catch (e) {
        console.error('fetchSmartPrescription error:', e);
      }
    },

    async fetchDiagnosis() {
      // 模拟从数据库获取数据
      // 实际应用中应替换为API请求
      const prompt = '患者信息，患者' + this.patient.name + '，' + this.patient.age + '岁，' +
        this.patient.gender + '性，因' + this.patient.complaint + '入院，体格检查结果：' + this.patient.physicalExam +
        '，完成心电图、ct等辅助检查，结果为' + this.patient.assistExam + '，临床诊断结果为：' + this.patient.diagnosis +
        '，治疗建议：' + this.patient.treatment + '，用药记录：' + this.patient.medication + '，手术记录：' + this.patient.surgery +
        ',护理记录：' + this.patient.nursing + ',随访记录：' + this.patient.followUp + '。你是一名具有30年主治经验的胸痛中心主治医生，请你根据以上胸痛患者的具体信息，给出专业的诊断结果。分成两部分进行回答，第一段是根据给出的患者信息进行思考推断（用文字整理清楚，并回答出来），第二段给出的病历诊断结果（详细丰富专业，150字左右），不要字体格式，不要写第一段第二段，仅返回第二段内容'
      //console.log(prompt)
      const response = await sendOpenAIRequest(prompt)
      //console.log(response.choices[0].message.content)
      this.patRecordsDTO.aiDiagnosis = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiDiagnosisTime = new Date()
    },
    async fetchTreatment() {
      const prompt = '患者信息，患者' + this.patient.name + '，' + this.patient.age + '岁，' +
        this.patient.gender + '性，因' + this.patient.complaint + '入院，体格检查结果：' + this.patient.physicalExam +
        '，完成心电图、ct等辅助检查，结果为' + this.patient.assistExam + '，临床诊断结果为：' + this.patient.diagnosis +
        '，治疗建议：' + this.patient.treatment + '，用药记录：' + this.patient.medication + '，手术记录：' + this.patient.surgery +
        ',护理记录：' + this.patient.nursing + ',随访记录：' + this.patient.followUp + '。你是具有30年主治经验的胸痛中心主治医生，请你根据以上胸痛患者的信息，并结合上面给出的诊断结果，给出专业的治疗方案，治疗方案需要专业，多维度考虑。（200字左右），不要字体格式，不显示*号'
      const response = await sendOpenAIRequest(prompt)
      //console.log(response.choices[0].message.content)
      this.patRecordsDTO.aiTreatmentProposal = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiTreatmentTime = new Date()
    },
    async fetchCare() {
      const prompt = '患者信息，患者' + this.patient.name + '，' + this.patient.age + '岁，' +
        this.patient.gender + '性，因' + this.patient.complaint + '入院，体格检查结果：' + this.patient.physicalExam +
        '，完成心电图、ct等辅助检查，结果为' + this.patient.assistExam + '，临床诊断结果为：' + this.patient.diagnosis +
        '，治疗建议：' + this.patient.treatment + '，用药记录：' + this.patient.medication + '，手术记录：' + this.patient.surgery +
        ',护理记录：' + this.patient.nursing + ',随访记录：' + this.patient.followUp + '。你是具有30年护理经验的胸痛中心护理主任，请你在前面给出的患者信息、诊断结果、治疗方案的基础上，针对该患者给出专业的护理方案。不要字体格式，分点作答（200字左右）'
      const response = await sendOpenAIRequest(prompt)
      //console.log(response.choices[0].message.content)
      this.patRecordsDTO.aiCareProposal  = this.processTreatmentText(response.choices[0].message.content).trim()
      this.patRecordsDTO.aiCareTime = new Date()
      // this.careResult = await this.mockFetch('护理方案示例');
    },
    processTreatmentText(text) {

      const separatorRegex = /(?<=[:：。；])/g;
      let segments = text.split(separatorRegex);
      segments = segments.filter(segment => segment.trim() !== "").map(segment => segment.trim());
      const hasExistingNumbering = /^\s*\d+\.\s+/.test(segments);

      if (hasExistingNumbering) {
        // 已有标号，仅添加换行
        return `${segments.join("\n")}`;
      } else {
        // 检查第一句末尾是否包含冒号
        const firstSegmentHasColon = segments.length > 0 && (segments[0].endsWith('：')||segments[0].endsWith(':'));
        //console.log('标号：' + firstSegmentHasColon)
        let processedAfter;
        if (firstSegmentHasColon && segments.length > 1) {
          // 第一句有冒号且有后续句子：第一句不加标号，从第二句开始加
          const firstSegment = segments[0];
          const numberedSegments = segments.slice(1)
            .map((segment, index) => `${index + 1}. ${segment}`);

          processedAfter = [firstSegment, ...numberedSegments].join("\n");
        } else {
          // 第一句没有冒号，或只有一句：全部从1开始加标号
          processedAfter = segments.map((segment, index) => `${index + 1}. ${segment}`).join("\n");
        }

        return `${processedAfter}`;
      }
    },
    mockFetch(result) {
      return new Promise(resolve => {
        // 模拟延迟
        setTimeout(() => {
          resolve(result)
        }, 1000)
      })
    }
  }}

</script>

<style scoped>
.container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
  margin-bottom: 20px;
}

.info-section {
  line-height: 2;
}

.info-row {
  display: flex;
  background-color: white;
  align-items: center;
  margin: 5px 30px 0px 30px;
  border-radius: 8px;
  padding-left: 3%;

  span {
    margin-left: 10px;
    margin-right: 10px;
  }
}

.checkbox-all {
  background-color: white;
  margin: 10px 30px 0px 30px;
  border-radius: 8px;
  padding: 10px;
  padding-left: 3%;

  h3 {
    margin-bottom: 10px;
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  margin-left: 10%;
}

.checkbox-item {
  margin-right: 20px;
  display: flex;
  /* 使单选框和标签在同一行 */
  align-items: center;
  /* 垂直居中对齐 */
}

.diagnosis-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.diagnosis-button:hover {
  background-color: #0056b3;
}

.send-button {
  margin-left: 10px;
  background-color: #13a167;
}

.send-button:hover {
  background-color: #0f8655;
}

.diagnosis-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.text-area {
  width: 100%;
  height: 100px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  resize: none;
  /* 禁止用户改变文本框大小 */
}

.card-container {
  display: flex;
  justify-content: space-between;
  margin: 20px;

  .card {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 10px;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button {
    background-color: blue;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }

  .content {
    text-indent: 0.00em;
    margin-top: 20px;
    min-height: 420px;
    height: 420px;
    padding: 10px;
    border-radius: 4px;
    line-height: 1.6;
    letter-spacing: 0.05em;
    white-space: pre-wrap;
    flex-grow: 1;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #e0e0e0;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    background: #fafafa;
    color: #222;
    outline: none;
    transition: border-color 0.2s;
    overflow-y: auto;
  }
  .content:focus {
    border-color: #409eff;
    background: #fff;
  }
}

/* 切换按钮：与第一页面一致，放锚点右侧，适中大小 */
.switch-btn{padding:4px 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;line-height:22px;margin-left:8px;}
.switch-btn:hover{background:#f6f6f6;}

/* 切换患者弹窗样式（标准注入） */
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

.waiting-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  flex-direction: column;
}
.spinner {
  width: 64px;
  height: 64px;
  border: 6px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.waiting-text {
  margin-top: 12px;
  color: #fff;
  font-size: 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

</style>


<style scoped>
.content { white-space: pre-wrap; }
</style>
