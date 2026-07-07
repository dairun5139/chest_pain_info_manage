<template>
  <div class="container">

    <div style="display: flex;width: 100%">
      <h2 style="margin-right: 5%; margin-bottom: 30px">患者信息</h2>
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
          <p>{{formatDate( patient.admissionTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>出院时间:</strong></p>
          <p>{{ formatDate(patient.dischargeTime) }}</p>
        </div>
        <div class="info-row doctor-row">
          <div class="doctor-left">
          <p><strong>主治医生 :</strong></p>
          <p>{{ patient.doctor }}</p>
        </div>
        <button class="switch-btn" @click="openSwitchDialog">切换</button>
        </div>
      </div>
    </div>

    <div class="patient-qr-card">
      <div class="qr-main">
        <h3>病人端随访问卷</h3>
        <p>固定问卷星随访入口，可直接复制链接或让病人扫码填写。</p>
        <div class="qr-link">{{ followUpLink }}</div>
        <button class="button-search" @click="copyFollowUpLink">复制链接</button>
        <button class="button-search secondary" @click="openFollowUpLink">打开问卷</button>
      </div>
      <div class="qr-box">
        <img :src="followUpQrUrl" alt="随访问卷二维码">
      </div>
    </div>

    <div class="form-row">
      <label>是否随访：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="isVisited" type="radio" value="已随访"> 已随访
        </div>
        <div class="radio-item">
          <input v-model="isVisited" type="radio" value="未随访"> 未随访
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>信息接收途径：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="infoSource" type="radio" value="门诊"> 门诊
        </div>
        <div class="radio-item">
          <input v-model="infoSource" type="radio" value="电话"> 电话
        </div>
        <div class="radio-item">
          <input v-model="infoSource" type="radio" value="其他"> 其他
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>随访状态：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="surveyStatus" type="radio" value="存活"> 存活
        </div>
        <div class="radio-item">
          <input v-model="surveyStatus" type="radio" value="死亡"> 死亡
        </div>
        <div class="radio-item">
          <input v-model="surveyStatus" type="radio" value="失访"> 失访
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>目前状况：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="currentStatus" type="radio" value="正常生活工作"> 正常生活工作
        </div>
        <div class="radio-item">
          <input v-model="currentStatus" type="radio" value="日常生活轻度受限"> 日常生活轻度受限
        </div>
        <div class="radio-item">
          <input v-model="currentStatus" type="radio" value="卧床为主"> 卧床为主
        </div>
      </div>
    </div>

    <!-- 保持 data 中的 badevent: [] 不变，修改模板 -->
    <div class="form-row">
      <label>出院后主要心血管不良事件：</label>
      <div class="checkbox-group">
        <div class="radio-item">
          <input v-model="badevent" type="checkbox" value="非致命性心肌梗死"> 非致命性心肌梗死
        </div>
        <div class="radio-item">
          <input v-model="badevent" type="checkbox" value="缺血性卒中"> 缺血性卒中
        </div>
<div class="radio-item">
          <input v-model="badevent" type="checkbox" value="因心力衰竭再次入院"> 因心力衰竭再次入院
        </div>
        <div class="radio-item">
          <input v-model="badevent" type="checkbox" value="出血"> 出血
        </div>
        <div class="radio-item">
          <input v-model="badevent" type="checkbox" value="无"> 无
        </div>
      </div>
    </div>

    <h3>危险因素控制：</h3>
    <div class="form-row">
      <label>血压监测：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="riskFactors.bloodPressureMonitor" type="radio" value="否"> 否
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.bloodPressureMonitor" type="radio" value="是,获得准确数据"> 是,获得准确数据
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.bloodPressureMonitor" type="radio" value="是,未获得准确数据"> 是,未获得准确数据
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>血脂四项：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="riskFactors.tetrapolipidemia" type="radio" value="否"> 否
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.tetrapolipidemia" type="radio" value="是,获得准确数据"> 是,获得准确数据
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.tetrapolipidemia" type="radio" value="是,未获得准确数据"> 是,未获得准确数据
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>脂蛋白（LPa）：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="riskFactors.lpa" type="radio" value="否"> 否
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.lpa" type="radio" value="是,获得准确数据"> 是,获得准确数据
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.lpa" type="radio" value="是,未获得准确数据"> 是,未获得准确数据
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>空腹血糖：</label>
      <div class="radio-group">
        <div class="radio-item">
          <input v-model="riskFactors.fastingBloodGlucose" type="radio" value="否"> 否
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.fastingBloodGlucose" type="radio" value="是,获得准确数据"> 是,获得准确数据
        </div>
        <div class="radio-item">
          <input v-model="riskFactors.fastingBloodGlucose" type="radio" value="是,未获得准确数据"> 是,未获得准确数据
        </div>
      </div>
    </div>

    <div class="form-row">
      <label>其它访谈事宜：</label>
      <textarea v-model="additionalNotes" placeholder="请填写..." rows="4" style="width: 50%" />
    </div>

    <div style="text-align: right;margin-right: 100px;"><button class="button-search" :disabled="saveLoading" @click="save">确认保存</button></div>

<div class="records-wrapper">
  <h3 class="records-title">随访记录</h3>
  <div class="record-table" v-if="visibleFollowList && visibleFollowList.length">
    <table class="record-table-wrap">
    <thead>
      <tr>
        <th>门诊ID信息</th>
        <th>姓名</th>
        <th>入院时间</th>
        <th>出院时间</th>
        <th>主治医生</th>
        <th>随访状态</th>
        <th>目前状态</th>
        <th>随访记录时间</th>
        <th>查看</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, idx) in visibleFollowList" :key="idx">
        <td>{{ patient.outpatientId }}</td>
        <td>{{ patient.name }}</td>
        <td>{{ formatDate(patient.admissionTime )}}</td>
        <td>{{ formatDate(patient.dischargeTime) }}</td>
        <td>{{ patient.doctor }}</td>
        <td>{{ item.surveyStatus }}</td>
        <td>{{ item.currentStatus }}</td>
        <td>{{ new Date(item.submitTime).toLocaleString('zh-CN', { hour12: false }) }}</td>
        <td>
          <button class="button-small" @click="loadFollowRecord(item)">查看</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
  <div class="no-records" v-else>暂无随访记录</div>
</div>


  <!-- 切换患者弹窗（survey 注入） -->
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
// 图表相关已移除
import { verifySettle } from '@/api/dayreport'
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
const FIXED_FOLLOW_UP_FORM_URL = 'https://v.wjx.cn/vm/eu69rd3.aspx#'
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
      switchDialog: { visible:false, loading:false, error:'', keyword:'', rawList:[], filtered:[], selectedId:null },
      followList: [],
      viewLoading: false,
      saveLoading: false,
      patient: {
        id: '2',
        name: '张勇',
        admissionTime: '2025-04-01 12:30',
        dischargeTime: '未出院',
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
      patientId:'',//患者ID
      isVisited: '', // 是否随访
      infoSource: '', // 信息接收途径
      surveyStatus: '', // 随访状态
      currentStatus: '', // 目前状况
      badevent: [], // 出院后主要心血管不良事件
      riskFactors: {
        bloodPressureMonitor: '', // 血压监测
        tetrapolipidemia: '', // 血脂四项
        lpa: '', // 脂蛋白
        fastingBloodGlucose: '' // 空腹血糖
      },
      additionalNotes: ''// 其它访谈事宜

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

  mounted() {
    this.getPatientData && this.getPatientData();
    this.checkFollowUp && this.checkFollowUp();
  },

  beforeDestroy() {
    },
  computed: {
    urlPatientId() { return String(this.$route && (this.$route.query.patientId || (this.$route.params && this.$route.params.patientId)) || ''); },
    followUpLink() {
      return FIXED_FOLLOW_UP_FORM_URL
    },
    followUpQrUrl() {
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(this.followUpLink)}`
    },

    // 仅显示提交时间不晚于“此刻”的随访记录；无法解析时间的记录保留显示
    visibleFollowList() {
      const now = Date.now();
      return (this.followList || []).filter(it => {
        const t = new Date(it && it.submitTime).getTime();
        if (Number.isNaN(t)) return true;
        return t <= now;
      });
    },
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
    copyFollowUpLink() {
      this.copyText(this.followUpLink, '链接已复制')
    },
    openFollowUpLink() {
      window.open(this.followUpLink, '_blank')
    },
    copyText(text, successText) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message && this.$message.success ? this.$message.success(successText) : alert(successText)
        }).catch(() => {
          window.prompt('复制链接', text)
        })
      } else {
        window.prompt('复制链接', text)
      }
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

    loadFollowRecord(d) {
      if (!d) return
      this.hasFollowData = true // this.patientId = d.patientId // 禁止覆盖：以URL为准this.isVisited = d.isVisited || ''
      this.infoSource = d.infoSource || ''
      this.surveyStatus = d.surveyStatus || ''
      this.currentStatus = d.currentStatus || ''
      try {
        this.badevent = d.badEventJson ? JSON.parse(d.badEventJson) : []
      } catch (e) {
        this.badevent = []
      }
      if (!this.riskFactors) this.riskFactors = {}
      this.riskFactors.bloodPressureMonitor = d.riskBpMonitor || ''
      this.riskFactors.tetrapolipidemia     = d.riskTetrapolipidemia || ''
      this.riskFactors.lpa                  = d.riskLpa || ''
      this.riskFactors.fastingBloodGlucose  = d.riskFbg || ''
      this.additionalNotes = d.additionalNotes || ''
    },


    async checkFollowUp() {
      this.viewLoading = true
      try {
        const token = getToken()
        const id = Number(this.patientId || (this.patient && this.patient.id) || 0)
        if (!id) {

          this.hasFollowData = false
          this.followList = []
          return
        }
        const res = await axios.post(API_URL + 'pat/patFollowUp/select', null, {
          params: { patientId: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
        const raw = res && res.data && res.data.data
        const list = Array.isArray(raw) ? raw : ( raw ? [raw] : [] )
        this.followList =list
        if ( list.length > 0) {
          const d = list[0]
          this.hasFollowData = true
          // 将返回值渲染到页面表单 // this.patientId = d.patientId // 禁止覆盖：以URL为准this.isVisited = d.isVisited || ''
          this.infoSource = d.infoSource || ''
          this.surveyStatus = d.surveyStatus || ''
          this.currentStatus = d.currentStatus || ''
          try {
            this.badevent = d.badEventJson ? JSON.parse(d.badEventJson) : []
          } catch (e) {
            console.warn('badEventJson 解析失败:', e)
            this.badevent = []
          }
          if (this.riskFactors == null) this.riskFactors = {}
          this.riskFactors.bloodPressureMonitor = d.riskBpMonitor || ''
          this.riskFactors.tetrapolipidemia = d.riskTetrapolipidemia || ''
          this.riskFactors.lpa = d.riskLpa || ''
          this.riskFactors.fastingBloodGlucose = d.riskFbg || ''
          this.additionalNotes = d.additionalNotes || ''
          this.$message && this.$message.success ? this.$message.success('随访信息已加载') : alert('随访信息已加载')
        } else {
          this.hasFollowData = false
          const msg = (res && res.data && (res.data.message || res.data.msg)) || '没有患者随访信息'
          this.$message && this.$message.warning ? this.$message.warning('没有患者随访信息') : alert('没有患者随访信息')
        }
      } catch (e) {
        console.error(e)
        this.hasFollowData = false
        this.$message && this.$message.warning ? this.$message.warning('没有患者随访信息') : alert('没有患者随访信息')
      }
       finally { this.viewLoading = false }
    },

    async getPatientData() {
      const id = this.patient.id
      // console.log("id:"+ typeof id);
      const token = getToken()
      // console.log("token:"+token)
      const response = await axios.post(API_URL + 'pat/frontAnalysis', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      // 处理响应
      if (response.data.code === 200) {
        const patient = response.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段
        const { userName, patientName, firstMedicalTime, dischargeTime, ...rest } = patient // 排除 userName
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
          ...rest, // 保留其他字段
          admissionTime: firstMedicalTime,
          dischargeTime: dischargeDisplay,
          name: patientName,
          doctor: userName // 将 userName 赋给 doctor
        }
        console.log(this.patient)
      } else {
        this.loading = false
      }
    },


    async save() {
      this.saveLoading = true
      try {
        const token = getToken()
        const payload = {
          additionalNotes: this.additionalNotes || '',
          badEventJson: this.badevent && this.badevent.length ? JSON.stringify(this.badevent) : '',
          currentStatus: this.currentStatus || '',
          infoSource: this.infoSource || '',
          isVisited: this.isVisited || '',
          patientId: Number(this.patientId || this.patient.id || (this.$route && (this.$route.query.patientId || (this.$route.params && this.$route.params.patientId))) || 0),
          riskBpMonitor: this.riskFactors && this.riskFactors.bloodPressureMonitor ? this.riskFactors.bloodPressureMonitor : '',
          riskFbg: this.riskFactors && this.riskFactors.fastingBloodGlucose ? this.riskFactors.fastingBloodGlucose : '',
          riskLpa: this.riskFactors && this.riskFactors.lpa ? this.riskFactors.lpa : '',
          riskTetrapolipidemia: this.riskFactors && this.riskFactors.tetrapolipidemia ? this.riskFactors.tetrapolipidemia : '',
          surveyStatus: this.surveyStatus || '',
          submitTime: new Date().toISOString()
        }
        if (!payload.patientId) {
          this.$message && this.$message.error ? this.$message.error('缺少患者ID') : alert('缺少患者ID')
          return
        }
        const res = await axios.post(API_URL + 'pat/patFollowUp', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
        if (res && res.data && res.data.code === 200) {
          this.$message && this.$message.success ? this.$message.success('保存成功') : alert('保存成功')
        } else {
          const msg = (res && res.data && (res.data.message || res.data.msg)) || '保存失败'
          this.$message && this.$message.error ? this.$message.error(msg) : alert(msg)
        }
      } catch (e) {
        console.error(e)
        this.$message && this.$message.error ? this.$message.error('网络错误或服务器异常') : alert('网络错误或服务器异常')
      } finally {
        this.saveLoading = false
      }
    },


initCharts() {},
    onResize() {},
    initLungChart() {}

}}
</script>

<style scoped>
.container {

  height: 100vh;
  padding: 20px;
  background-color: white;
  //overflow-y: auto; /* 允许垂直滚动 */
}

.info-item {
  display: flex;
  flex-wrap: wrap;
  /* 允许换行 */
  justify-content: space-between;
  /* 在主轴方向拉开空间 */

}

.patient-qr-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.qr-main {
  flex: 1;
  min-width: 0;
}

.patient-qr-card h3 {
  margin: 0 0 8px;
}

.patient-qr-card p {
  margin: 0 0 10px;
  color: #606266;
}

.qr-config {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.qr-config input {
  flex: 1;
  min-width: 260px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.qr-box {
  width: 150px;
  height: 150px;
  flex: 0 0 150px;
  background: #fff;
  padding: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-box img {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-link {
  margin-bottom: 10px;
  color: #409eff;
  word-break: break-all;
}

.qr-link.empty,
.qr-placeholder {
  color: #909399;
}

.qr-placeholder {
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
}

.button-search.secondary {
  margin-left: 8px;
}

.button-search:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.info-row {
  display: flex;
  flex-direction: column;
  /* 垂直排列标题和内容 */
  flex: 1 1 calc(20% - 20px);
  /* 每个信息项占据相同宽度，减去左右间距 */
  margin: 10px;
  /* 顶部和底部间距，左右间距会因宽度计算而减少 */
  min-width: 140px;

  /* 设置一个最小宽度防止过小 */
  p {
    margin: 2px;
  }
}

.form-row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  /* 调整每行之间的间距 */
}

label {
  width: 300px;
  /* 设置label的固定宽度 */
  margin-right: 20px;
  /* 增加label与输入框之间的间距 */
  font-weight: bold;
  text-align: right;
  /* 将label文本向右对齐 */
}

.radio-group,
.checkbox-group {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  /* 允许换行 */

}

.radio-item {

  display: flex;
  flex-wrap: wrap;
  /* 允许换行 */
  margin-right: 15px;
  /* 增加选项之间的间距 */
}


.button-search {
  margin-bottom: 20px;
}




.records-wrapper { margin-top: 16px; }
.records-title { margin: 12px 0; font-size: 16px; }
.record-table { width: 100%; border-collapse: collapse; min-width: 1000px;}
.record-table th, .record-table td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; font-size: 13px; }
.record-table thead th { background: #f8fafc; font-weight: 600; }
.no-records { color: #6b7280; padding: 8px 0; }

.button-small {
  padding: 2px 8px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #374151;
  cursor: pointer;
}
.button-small:hover {
  background-color: #e2e8f0;
}


.record-table-wrap {
  max-height: 500px;      /* 需要更高或更低可以改这个值 */
  overflow-y: auto;       /* 垂直滚动 */
  overflow-x: auto;       /* 如果列多，可以横向滚动 */
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 100%;
}

/* 让表头在纵向滚动时固定在顶部，体验更好 */
.record-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}


/* 切换按钮：与第一页面一致，放锚点右侧，适中大小 */
.switch-btn{height:28px;line-height:26px;padding:0 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;margin-left:8px;vertical-align:middle;font-size:13px;}
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
.doctor-row{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>
