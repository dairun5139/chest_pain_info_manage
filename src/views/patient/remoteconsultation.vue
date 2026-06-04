<template>
  <div class="container">
    <div class="patient-info">
  <div class="info-item">
    <div class="info-row info-inline">
      <h2 style="margin-right: 5%">患者信息</h2>
      <span v-if="patient.outpatientId">门诊ID信息: {{ patient.outpatientId }}</span> |
      <span>{{ patient.name }}</span> |
      <span>入院时间: {{ formatDate(patient.admissionTime) }}</span> |
      <span>出院时间: {{ formatDate(patient.dischargeTime) }}</span> |
      <span>主治医生: {{ patient.doctor }}</span>
      <button class="switch-btn" @click="openSwitchDialog">切换</button>
    </div>
  </div>
</div>

    <div class="consultation-unit">
      <label for="consultation-select">会诊单位</label>
      <select id="consultation-select" v-model="selectedHospital" @change="filterDoctors">
        <option value="全部医院" disabled>选择医院</option>
        <option value="全部医院">全部医院</option>
        <option v-for="hospital in uniqueHospitals" :key="hospital" :value="hospital">{{ hospital }}</option>
      </select>
      <div class="buttons">
        <button class="star-button" @click="confirm">确认</button>
        <button class="start-button" @click="startConsultation">开始会诊</button>
      </div>
    </div>



    <div class="doctor-list">
      <div v-for="doctor in filteredDoctors " :key="doctor.name" class="doctor-item">


        <div class="doctor-info">
          <span class="doctor-name">
            <i v-if="!doctor.added" class="icon-plus" @click="addDoctor(doctor)" />
            <i v-if="doctor.added && !doctor.confirmed" class="icon-check" />
            {{ doctor.name }}
          </span>
          <div class="doctor-meta">
            <span>{{ displayedDept(doctor) }} | {{ displayedHospital(doctor) }} | {{ displayedRank(doctor) }}</span>
          </div>
        </div>
        <div class="doctor-buttons">

          <button
            :class="['confirm-button', { 'disabled': (!doctor.added || doctor.confirmed) }]"
            :disabled="!doctor.added"
            @click="confirmDoctor(doctor)"
          >确认</button>
          <button
            :class="['close-button', { 'disabled': !doctor.confirmed }]"
            :disabled="!doctor.confirmed"
            @click="cancelDoctor(doctor)"
          >取消</button>
        </div>
      </div>
    </div>


  <!-- 切换患者弹窗（remoteconsultation 注入） -->
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
import { API_URL } from '@/api/constants'

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
      patDoctorInfo: null,
      switchDialog: { visible:false, loading:false, error:'', keyword:'', rawList:[], filtered:[], selectedId:null },
      patient: {
        id: '2',
        name: '王志',
        admissionTime: '2025-07-03 12:30',
        dischargeTime: '2025-07-19 13:30',
        doctor: '丁志永'

      },
      selectedHospital: '全部医院', // 当前选择的医院
      doctors: [ { id: 1, name: '郭伟', hospital: '解放军301医院', dept: '胸外科', registrationRank: '主治医师', added: false, confirmed: false },
        { id: 2, name: '刘宇', hospital: '解放军301医院', dept: '心内科', registrationRank: '副主任医师', added: false, confirmed: false },
        { id: 3, name: '王寒', hospital: '南京大学医学院附属苏州医院', dept: '呼吸与危重症医学科', registrationRank: '副主任医师', added: false, confirmed: false },
        { id: 4, name: '吴伟', hospital: '解放军301医院', dept: '心内科', registrationRank: '副主任医师', added: false, confirmed: false },
        { id: 5, name: '朱海峰', hospital: '华西医院', dept: '胸外科', registrationRank: '主任医师', added: false, confirmed: false }],
      filteredDoctors: []
    }
  },
  computed: {
    uniqueHospitals() {
      // 提取唯一的医院名称
      return Array.from(new Set(this.doctors.map(doctor => doctor.hospital)))
    },
    filterDoctors() {
      if (this.selectedHospital === '全部医院') {
        this.filteredDoctors = this.doctors // 显示所有医生
      } else {
        this.filteredDoctors = this.doctors.filter(doctor =>
          doctor.hospital === this.selectedHospital
        )
      }
    }
  },
  watch: {
    selectedHospital() { this.applyFilter(); }
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
    // 初始显示默认医生
    this.filteredDoctors = this.doctors;
    this.loadPatDoctorInfo();
    // this.filterDoctors(); // 组件挂载时过滤医生列表，默认显示所有医生
  },
  methods: {
    isDefaultDoctor(doctor) {
      try {
        const name = (doctor && doctor.name || "").trim();
        const defName = (this.patDoctorInfo && this.patDoctorInfo.doctorName || "").trim();
        return name && defName && name === defName;
      } catch (_) { return false; }
    },
    displayedDept(doctor) {
      return this.isDefaultDoctor(doctor) && this.patDoctorInfo && this.patDoctorInfo.dept
        ? this.patDoctorInfo.dept
        : (doctor.dept || "");
    },
    displayedHospital(doctor) {
      return this.isDefaultDoctor(doctor) && this.patDoctorInfo && this.patDoctorInfo.hospital
        ? this.patDoctorInfo.hospital
        : (doctor.hospital || "");
    },
    displayedRank(doctor) {
      return this.isDefaultDoctor(doctor) && this.patDoctorInfo && this.patDoctorInfo.registrationRank
        ? this.patDoctorInfo.registrationRank
        : (doctor.registrationRank || "");
    },

    async loadPatDoctorInfo() {
      try {
        this.token = (getToken && getToken()) || this.token;
        const res = await (this.$axios && this.$axios.post ? this.$axios.post : axios.post)(
          API_URL + 'pat/patDoctorInfo',
          null,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            },
            params: {
              patientId: (this.patient && this.patient.id) ? this.patient.id : ''
            }
          }
        );
        if (res && res.data && res.data.code === 200) {
          this.patDoctorInfo = res.data.data || null;
        } else {
          this.patDoctorInfo = null;
          console.warn('patDoctorInfo 加载失败：', (res && res.data && (res.data.msg || res.data.message)) || res);
        }
      } catch (e) {
        this.patDoctorInfo = null;
        console.error('patDoctorInfo 调用异常：', e);
      }
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
    // ======= 切换患者弹窗（remoteconsultation 注入，按第一个页面标准） =======
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

      const response1 = await axios.post(API_URL + 'pat/frontConsult', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      // 处理响应
      console.log(response1)
      if (response1.data.code === 200) {
        const patient = response1.data.data.doctorList

        // 接口返回的医生
const apiDoctors = patient.map(({ doctorId, userName, hospital, ...rest }) => ({
  ...rest,
  id: doctorId,
  name: userName,
  hospital: hospital === null ? '无' : hospital,
  added: false,
  confirmed: false
}))
// 默认医生（与 data 中保持一致）
const defaultDoctors = [
  { id: 1, name: '郭伟', hospital: '解放军301医院', dept: '胸外科', registrationRank: '主治医师', added: false, confirmed: false },
  { id: 2, name: '刘宇', hospital: '解放军301医院', dept: '心内科', registrationRank: '副主任医师', added: false, confirmed: false },
  { id: 3, name: '王寒', hospital: '南京大学医学院附属苏州医院', dept: '呼吸与危重症医学科', registrationRank: '副主任医师', added: false, confirmed: false },
  { id: 4, name: '吴伟', hospital: '解放军301医院', dept: '心内科', registrationRank: '副主任医师', added: false, confirmed: false },
  { id: 5, name: '朱海峰', hospital: '华西医院', dept: '胸外科', registrationRank: '主任医师', added: false, confirmed: false }
]
// 合并并去重（按 name + hospital 去重）
const merged = [...apiDoctors]
for (const d of defaultDoctors) {
  if (!merged.some(m => m.name === d.name && m.hospital === d.hospital)) {
    merged.push(d)
  }
}
this.doctors = merged
this.filteredDoctors = merged
console.log(this.doctors)
      } else {
        this.loading = false
      }
    },

    addDoctor(doctor) {
      doctor.added = true // 添加医生后标记为已添加
    },
    confirmDoctor(doctor) {
      console.log(`确认医生: ${doctor.name}`)
      doctor.confirmed = true // 确认医生后标记为已确认
    },
    cancelDoctor(doctor) {
      console.log(`取消医生: ${doctor.name}`)
      // 取消后重置状态
      doctor.added = false // 重置为未添加
      doctor.confirmed = false // 重置为未确认
    },
    confirm() {
      console.log('已确认。')
    },
    startConsultation() {
      const confirmedDoctors = this.filteredDoctors.filter(doctor => doctor.confirmed)
      if (confirmedDoctors.length > 0) {
        console.log('开始会诊的医生:', confirmedDoctors.map(doctor => doctor.name).join(', '))
        // 提取选中的医生的 id
        const doctorIds = confirmedDoctors.map(doctor => doctor.id)
        this.$router.push({
          path: '/patient/conference',
          query: {
            doctorIds: JSON.stringify(doctorIds) // 将 id 数组转换为 JSON 字符串
          }
        })
      } else {
        alert('请选择医生')
      }
    }

  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.patient-info {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
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

.consultation-unit {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.consultation-unit label {
  margin-left: 10%;
  margin-right: 10px;
}

.consultation-unit select {
  width: 20%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.buttons {
  display: flex;
  margin-left: 10%;
  align-items: center;
}

.star-button, .start-button {
  margin-right: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.star-button {
  background-color: #007bff;
}

.start-button {
  background-color: #28a745;
}

.doctor-list {
  display: flex;
  flex-wrap: wrap;
}

.doctor-item {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin: 5px;
  width: calc(50% - 10px); /* 每行两个医生 */
  display: flex;
  justify-content: space-between; /* 对齐两个部分 */
  align-items: center;
}

.doctor-info {
  display: flex;
  align-items: center;
}

.doctor-name {
  flex-grow: 1; /* 医生名称自适应空间 */
}

.doctor-buttons {
  display: flex;
  justify-content: space-between; /* 确保按钮分布在两侧 */
  margin-top: 10px; /* 增加顶部间距 */
}

.confirm-button,
.close-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px; /* 按钮之间的间距 */
}

.confirm-button {
  background-color: #007bff;
  color: white;
}

.close-button {
  background-color: #dc3545;
  color: white;
}

/* 禁用按钮样式 */
.confirm-button.disabled, .close-button.disabled {
  background-color: #ccc; /* 灰色背景 */
  cursor: not-allowed;
  pointer-events: none; /* 禁止点击 */
}

.icon-plus::before {
  content: '+';
  margin-right: 5px; /* 加号与文字的间距 */
}


/* 切换按钮：与第一页面一致，放“主治医生”右侧，适中大小 */
.switch-btn{height:28px;line-height:26px;padding:0 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;margin-left:8px;vertical-align:middle;font-size:13px;}
.switch-btn:hover{background:#f6f6f6;}

/* 切换患者弹窗样式（remoteconsultation 注入） */
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

/* 仅“患者信息”横条使用的横向行布局，避免影响其他 .info-row */
.info-row.info-inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.info-row.info-inline > span { display: inline-block; }

.tag{margin-left:6px;display:inline-block;padding:0 6px;border:1px solid #409eff;border-radius:10px;font-size:12px;height:18px;line-height:16px;}
.doctor-meta{font-size:12px;color:#666;margin-top:4px;}
</style>
