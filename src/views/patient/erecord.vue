<template>
  <div class="container">
    <div class="header">
      <h3>电子病历</h3>
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
          <p>{{ formatDate(patient.admissionTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>出院时间:</strong></p>
          <p>{{formatDate( patient.dischargeTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>主治医生:</strong></p>
          <p>{{ patient.doctor }}</p>
        </div>
      </div>
    </div>

    <div :class="patient.isWarning ? 'warning-card danger' : 'warning-card normal'">
      <div class="warning-title">{{ patient.isWarning ? '当前预警' : '当前无预警' }}</div>
      <div class="warning-content">
        {{ patient.isWarning ? patient.warningReason : '未同时满足收缩压<90mmHg、胸痛持续>30分钟、心率>110次/分三项条件，未触发预警' }}
      </div>
    </div>


    <div class="record-section">
      <div v-for="record in recordGroups" :key="record.title" class="record-item">
        <h4>{{ record.title }}</h4>
        <div class="divider" />
        <p>{{ record.value || '无' }}</p>
      </div>
    </div>

    <div class="upload-section">
      <div class="section-title">拍照上传与报告附件</div>
      <div class="upload-actions">
        <label class="upload-btn">
          上传检查照片/报告
          <input type="file" accept="image/*,.pdf,.doc,.docx" multiple @change="handleAttachmentChange($event, '检查报告')">
        </label>
        <label class="upload-btn">
          拍照上传
          <input type="file" accept="image/*" capture="environment" multiple @change="handleAttachmentChange($event, '现场拍照')">
        </label>
      </div>
      <div v-if="attachments.length" class="attachment-list">
        <div v-for="(file, index) in attachments" :key="file.uid || index" class="attachment-item">
          <img v-if="file.preview" :src="file.preview" alt="附件预览">
          <div v-else class="file-icon">{{ getFileExt(file.name) }}</div>
          <div class="attachment-meta">
            <strong>{{ file.name }}</strong>
            <span>{{ file.type }} · {{ file.status }}</span>
            <small v-if="file.url">{{ file.url }}</small>
            <div class="attachment-actions">
              <button v-if="file.url" class="mini-btn" @click="openAttachment(file)">查看</button>
              <button class="mini-btn danger" @click="removeAttachment(index)">删除</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-upload">暂无上传附件</div>
      <div class="save-actions">
        <button class="save-btn" :disabled="savingAttachments || !hasPendingAttachments" @click="saveAllAttachments">
          {{ savingAttachments ? '保存中...' : '确定保存附件' }}
        </button>
        <span class="save-tip">上传后先进入待保存列表，确认无误后点击保存；未保存前可直接删除。</span>
      </div>
    </div>

  <!-- 切换患者弹窗（erecord 注入） -->
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
        <div v-else-if="switchDialog.error" class="error">{ switchDialog.error }</div>
        <table v-else class="list-table" style="width: 100%;text-align: center;">
          <thead>
            <tr> <th style="width: 12%;">姓名</th>
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
import { buildVitalsWarning } from '@/utils/vitalsWarning'

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
      attachments: [],
      savingAttachments: false,
      patient: {
        id: null,
        name: '',
        admissionTime: '',
        dischargeTime: '',
        doctor: '',
        complaint: '',
        physicalExam: '',
        assistExam: '',
        diagnosis: '',
        treatment: '',
        medication: '',
        surgery: '',
        nursing: '',
        followUp: '',
        isWarning: false,
        warningReason: ''
      }
    }
  },
  computed: {
    hasPendingAttachments() {
      return this.attachments.some(item => item && item.uploaded && !item.saved)
    },
    recordGroups() {
      const all = [
        { title: '主诉病史', value: this.patient.complaint },
        { title: '体格检查', value: this.patient.physicalExam },
        { title: '辅助检查', value: this.patient.assistExam },
        { title: '诊断结果', value: this.patient.diagnosis },
        { title: '治疗方案', value: this.patient.treatment },
        { title: '用药记录', value: this.patient.medication },
        { title: '手术记录', value: this.patient.surgery },
        { title: '护理记录', value: this.patient.nursing },
        { title: '随访记录', value: this.patient.followUp }
      ]
      return all.filter(item => item.value && item.value.trim() !== '' && item.value.trim() !== '无')
    }
  },
  created() {
    this.initErecordPage()
  },
  activated() {
    // keep-alive / 标签页切回来时重新拉取附件
    this.initErecordPage()
  },
  watch: {
    '$route.query.id'() {
      this.initErecordPage()
    },
    '$route.query.patientId'() {
      this.initErecordPage()
    }
  },
  methods: {
    async initErecordPage() {
      // 切换页面时先清空，不显示旧数据/缓存，等接口返回再渲染
      this.patient = {
        id: null,
        name: '',
        admissionTime: '',
        dischargeTime: '',
        doctor: '',
        complaint: '',
        physicalExam: '',
        assistExam: '',
        diagnosis: '',
        treatment: '',
        medication: '',
        surgery: '',
        nursing: '',
        followUp: '',
        isWarning: false,
        warningReason: ''
      }
      try {
        const eff = this.getEffectivePatientId && this.getEffectivePatientId()
        if (eff) this.syncIdToAll(eff)
      } catch (_) {}
      try {
        if (this.patient && this.patient.id && typeof this.getPatientData === 'function') {
          await this.getPatientData()
        }
      } catch (e) {
        console.error('电子病历基础信息加载失败：', e)
      }
      try {
        await this.loadSavedAttachments()
      } catch (e) {
        console.error('电子病历附件加载失败：', e)
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
    // ======= 切换患者弹窗（erecord 注入，按第一个页面标准） =======
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
      const PINNED_NAMES = ['黄浩', '李莹', '高淑华', '马秀珍', '唐丹丹'];
      const kw = (this.switchDialog.keyword || '').toLowerCase();
      const source = kw
        ? this.switchDialog.rawList.filter(p => {
            const name = (p.patientName || '').toLowerCase();
            const opId = (p.outpatientId || '').toLowerCase();
            return name.includes(kw) || opId.includes(kw);
          })
        : this.switchDialog.rawList.slice(0, 2000);

      // 五人按 PINNED_NAMES 顺序置顶，其余按 onsetTime 从近到远排序
      const pinned = PINNED_NAMES
        .map(name => source.find(p => p.patientName === name))
        .filter(Boolean);
      const rest = source
        .filter(p => !PINNED_NAMES.includes(p.patientName))
        .sort((a, b) => {
          const ta = a.onsetTime ? new Date(a.onsetTime).getTime() : 0;
          const tb = b.onsetTime ? new Date(b.onsetTime).getTime() : 0;
          return tb - ta;
        });
      this.switchDialog.filtered = [...pinned, ...rest];
    },
    async fetchAllPatients() {
      this.switchDialog.loading = true;
      this.switchDialog.error = "";
      try {
        const token = getToken && getToken() || this.token;
        this.token = token;
        const headers = { 'Content-Type': 'application/json', 'Authorization': token };
        const axiosPost = this.$axios && this.$axios.post ? this.$axios.post.bind(this.$axios) : axios.post;

        // 同时拉两个接口
        const [res1, res2] = await Promise.allSettled([
          axiosPost(API_URL + 'pat/frontPatInfo', null, { params: {}, headers }),
          axiosPost(API_URL + 'pat/patFollowInfo', null, { headers })
        ]);

        const list1 = (res1.status === 'fulfilled' && res1.value?.data?.code === 200)
          ? (Array.isArray(res1.value.data.data) ? res1.value.data.data : [])
          : [];

        const list2 = (res2.status === 'fulfilled' && res2.value?.data?.code === 200)
          ? (Array.isArray(res2.value.data.data) ? res2.value.data.data : [])
          : [];

        // 用 patientName 做最终去重，确保有名字的人不会被 id 冲突覆盖
        const byName = new Map();

        // frontPatInfo 先入（过滤掉没有名字的）
        for (const p of list1) {
          const name = (p && p.patientName || '').trim();
          if (name) byName.set(name, p);
        }

        // patFollowInfo 补充：名字不在 map 里才加入
        for (const p of list2) {
          const name = (p && p.patientName || '').trim();
          if (!name) continue;
          if (!byName.has(name)) {
            byName.set(name, {
              id: p.id || p.patientId,
              patientName: name,
              outpatientId: p.outpatientId,
              gender: p.gender,
              age: p.age,
              onsetTime: p.onsetTime,
              firstMedicalTime: p.firstMedicalTime,
              dischargeTime: p.dischargeTime,
              diagnosis: p.diagnosis,
              doctors: p.doctors || []
            });
          }
        }

        const list = Array.from(byName.values());
        this.switchDialog.rawList = list;

        if (!list.length) {
          this.switchDialog.error = '暂无患者数据';
        } else {
          _writePatListCache && _writePatListCache(list);
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

    applyWarningInfo(source) {
      const warning = buildVitalsWarning(source || {})
      this.patient.isWarning = warning.isWarning
      this.patient.warningReason = warning.warningReason
    },
    applyWarningFromCache(id) {
      try {
        const raw = sessionStorage.getItem('filteredPatients')
        if (!raw) return false
        const list = JSON.parse(raw)
        const matched = Array.isArray(list) ? list.find(p => String(p.id) === String(id)) : null
        if (!matched) return false
        this.applyWarningInfo(matched)
        return true
      } catch (e) {
        return false
      }
    },
    getFileExt(name) {
      const n = String(name || '')
      const ext = n.includes('.') ? n.split('.').pop().toUpperCase() : 'FILE'
      return ext.length > 5 ? 'FILE' : ext
    },
    openAttachment(file) {
      const url = file && file.url
      if (!url) return
      window.open(url, '_blank')
    },
    removeAttachment(index) {
      const item = this.attachments[index]
      const msg = item && item.saved
        ? '该附件已经保存到数据库。当前后端没有提供删除接口，只能先从页面列表移除；如需数据库也删除，需要后端增加 /pic/recordPicUrl/delete 接口。确定移除显示吗？'
        : '确定删除这个待保存附件吗？'
      if (!window.confirm(msg)) return
      try {
        if (item && item.preview && item.preview.indexOf('blob:') === 0) URL.revokeObjectURL(item.preview)
      } catch (_) {}
      this.attachments.splice(index, 1)
    },
    async handleAttachmentChange(event, type) {
      const files = Array.from(event.target.files || [])
      event.target.value = ''
      for (const rawFile of files) {
        const item = {
          uid: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          name: rawFile.name,
          type,
          status: '待上传',
          url: '',
          filePath: '',
          preview: rawFile.type && rawFile.type.startsWith('image/') ? URL.createObjectURL(rawFile) : '',
          uploaded: false,
          saved: false,
          rawFile
        }
        this.attachments.unshift(item)
        await this.uploadAttachment(rawFile, item)
      }
    },
    getApiHeaders(contentType) {
      const token = getToken()
      const headers = {
        'Authorization': token
      }
      if (contentType) headers['Content-Type'] = contentType
      return headers
    },
    normalizeApiData(res) {
      const body = res && res.data ? res.data : {}
      if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
        return body.data
      }
      return body
    },
    extractUploadedFileInfo(res) {
      const data = this.normalizeApiData(res)
      const info = Array.isArray(data) ? data[0] : data
      if (typeof info === 'string') {
        return { url: info, filePath: info }
      }
      if (!info || typeof info !== 'object') {
        return { url: '', filePath: '' }
      }
      const url = info.url || info.fileUrl || info.fileURL || info.path || info.filePath || info.filepath || info.data || ''
      const filePath = info.filePath || info.filepath || info.path || info.url || info.fileUrl || ''
      return { url, filePath }
    },
    buildRecordPicPayload(rawFile, item, uploaded) {
      const patientId = this.getEffectivePatientId ? this.getEffectivePatientId() : this.patient.id
      const filePath = (uploaded && (uploaded.filePath || uploaded.url)) || item.filePath || item.url || ''
      const fileUrl = (uploaded && (uploaded.url || uploaded.filePath)) || item.url || item.filePath || ''
      return {
        id: patientId,
        patientId,
        patId: patientId,
        filePath,
        filepath: filePath,
        path: filePath,
        fileUrl,
        url: fileUrl,
        recordType: item.type,
        type: item.type,
        fileName: rawFile && rawFile.name ? rawFile.name : item.name,
        name: item.name
      }
    },
    isApiSuccess(res) {
      const body = res && res.data ? res.data : {}
      return body.code === undefined || body.code === 200 || body.code === '200'
    },
    async uploadAttachment(rawFile, item) {
      const formData = new FormData()
      formData.append('file', rawFile)
      item.status = '上传中'
      try {
        const uploadRes = await axios.post(API_URL + 'pic/recordPicUrl/upload', formData, {
          headers: this.getApiHeaders('multipart/form-data')
        })
        if (!this.isApiSuccess(uploadRes)) {
          throw new Error((uploadRes.data && (uploadRes.data.message || uploadRes.data.msg)) || '上传失败')
        }
        const uploaded = this.extractUploadedFileInfo(uploadRes)
        if (!uploaded.filePath && !uploaded.url) {
          throw new Error('上传成功但后端未返回文件路径')
        }
        item.url = uploaded.url || uploaded.filePath
        item.filePath = uploaded.filePath || uploaded.url
        item.uploaded = true
        item.saved = false
        item.status = '已上传，待保存'
      } catch (e) {
        console.error('电子病历附件上传失败：', e)
        item.status = '上传失败，请查看控制台/Network响应'
      }
    },
    async saveRecordAttachment(payload) {
      const url = API_URL + 'pic/recordPicUrl/add'
      const headers = this.getApiHeaders('application/json')
      try {
        const res = await axios.post(url, null, { params: payload, headers })
        if (this.isApiSuccess(res)) return res
        throw new Error((res.data && (res.data.message || res.data.msg)) || '保存附件失败')
      } catch (firstError) {
        const res = await axios.post(url, payload, { headers })
        if (this.isApiSuccess(res)) return res
        throw new Error((res.data && (res.data.message || res.data.msg)) || '保存附件失败')
      }
    },
    async saveAllAttachments() {
      const pending = this.attachments.filter(item => item && item.uploaded && !item.saved)
      if (!pending.length) return
      this.savingAttachments = true
      try {
        for (const item of pending) {
          item.status = '保存中'
          const payload = this.buildRecordPicPayload(null, item, { url: item.url, filePath: item.filePath })
          await this.saveRecordAttachment(payload)
          item.saved = true
          item.status = '已保存'
        }
        this.cacheSavedAttachmentsLocally()
        alert('附件已保存到数据库')
        await this.loadSavedAttachments()
      } catch (e) {
        console.error('电子病历附件保存失败：', e)
        alert('附件保存失败，请查看控制台/Network响应')
      } finally {
        this.savingAttachments = false
      }
    },
    parseSavedAttachmentList(data) {
      let list = data
      if (list && typeof list === 'object' && !Array.isArray(list)) {
        list = list.records || list.list || list.rows || list.data || list.result || []
      }
      if (!Array.isArray(list)) return []
      // 调试：打印第一条原始数据，确认后端字段名
      if (list.length) console.log('[erecord] 附件原始数据第一条：', JSON.stringify(list[0]))
      return list.map((it, idx) => {
        // 尽可能兼容各种后端字段名
        const url = it.url || it.fileUrl || it.fileURL || it.path || it.filePath
          || it.filepath || it.recordPicUrl || it.picUrl || it.imageUrl
          || it.imgUrl || it.src || it.link || ''
        const filePath = it.filePath || it.filepath || it.path || it.fileUrl
          || it.fileURL || it.recordPicUrl || it.picUrl || url || ''
        const name = it.fileName || it.name || it.filename
          || (url ? String(url).split('/').pop() : `附件${idx + 1}`)
        const type = it.recordType || it.type || '检查报告'
        return {
          uid: it.id || `${Date.now()}_saved_${idx}`,
          name,
          type,
          status: '已保存',
          url,
          filePath,
          preview: /\.(png|jpe?g|gif|bmp|webp)$/i.test(url) ? url : '',
          uploaded: true,
          saved: true,
          raw: it
        }
      }).filter(item => item.url || item.filePath)
    },

    getAttachmentCacheKey() {
      const patientId = this.getEffectivePatientId ? this.getEffectivePatientId() : this.patient.id
      return `erecord_record_attachments_${patientId || 'unknown'}`
    },
    cacheSavedAttachmentsLocally() {
      try {
        const saved = this.attachments.filter(item => item && item.saved)
        localStorage.setItem(this.getAttachmentCacheKey(), JSON.stringify(saved))
      } catch (_) {}
    },
    readLocalSavedAttachments() {
      try {
        const raw = localStorage.getItem(this.getAttachmentCacheKey())
        if (!raw) return []
        const list = JSON.parse(raw)
        return Array.isArray(list) ? list : []
      } catch (_) {
        return []
      }
    },
    mergeAttachmentLists(pending, savedList, localList) {
      const map = new Map()
      const put = (item) => {
        if (!item) return
        const key = item.filePath || item.url || item.uid || item.name
        if (!key) return
        map.set(String(key), item)
      }
      ;(localList || []).forEach(put)
      ;(savedList || []).forEach(put)
      ;(pending || []).forEach(put)
      return Array.from(map.values())
    },
    async loadSavedAttachments() {
      const patientId = this.getEffectivePatientId ? this.getEffectivePatientId() : this.patient.id
      if (!patientId) return
      const pending = this.attachments.filter(item => item && !item.saved)
      const localList = this.readLocalSavedAttachments()
      try {
        const res = await axios.post(API_URL + 'pic/recordPicUrl', null, {
          params: { id: patientId, patientId, patId: patientId },
          headers: this.getApiHeaders('application/json')
        })
        if (!this.isApiSuccess(res)) {
          this.attachments = this.mergeAttachmentLists(pending, [], localList)
          return
        }
        const rawData = this.normalizeApiData(res)
        console.log('[erecord] pic/recordPicUrl 返回 data：', JSON.stringify(rawData))
        const savedList = this.parseSavedAttachmentList(rawData)
        console.log('[erecord] 解析出附件数量：', savedList.length)
        this.attachments = this.mergeAttachmentLists(pending, savedList, localList)
        if (savedList.length) this.cacheSavedAttachmentsLocally()
      } catch (e) {
        console.error('读取电子病历已保存附件失败：', e)
        this.attachments = this.mergeAttachmentLists(pending, [], localList)
      }
    },

    async getPatientData() {
      const id = this.patient.id
      // console.log("id:"+ typeof id);
      const token = getToken()
      console.log('token:' + token)
      const response = await axios.post(API_URL + 'pat/frontAnalysis', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      console.log(response)
      // 处理响应
      if (response.data.code === 200) {
        const patient = response.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段
        const { userName, patientName, firstMedicalTime, dischargeTime, ...rest } = patient // 排除 userName
        // 更新 this.patient，直接合并新的字段
        Object.assign(this.patient, rest) // 合并其他字段
        console.log('rest')
        console.log(this.patient)
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
        this.patient.dischargeTime = dischargeDisplay
        this.patient.name = patientName
        this.patient.doctor = userName

        // 预警判断：从 Vuex store 读取患者生命体征，没有再调 frontPatInfo
        try {
          let vitalsSource = null
          const storeList = this.$store.getters.patientList
          if (storeList && storeList.length > 0) {
            vitalsSource = storeList.find(p => String(p.id) === String(id)) || null
          }
          if (!vitalsSource) {
            const viRes = await axios.post(API_URL + 'pat/frontPatInfo', null, {
              headers: { 'Content-Type': 'application/json', 'Authorization': token }
            })
            if (viRes.data.code === 200 && Array.isArray(viRes.data.data)) {
              this.$store.dispatch('user/setPatientList', viRes.data.data)
              vitalsSource = viRes.data.data.find(p => String(p.id) === String(id)) || null
            }
          }
          if (vitalsSource) {
            const warning = buildVitalsWarning(vitalsSource)
            this.patient.isWarning = warning.isWarning
            this.patient.warningReason = warning.warningReason
          }
        } catch (e) {
          console.error('预警生命体征读取失败：', e)
        }

        console.log(this.patient)
      } else {
        this.loading = false
      }

      const response1 = await axios.post(API_URL + 'pat/frontDiagnosisInfo', null,
        {
          params: { id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
      console.log(response1)
      // 处理响应
      if (response1.data.code === 200) {
        const patient = response1.data.data
        // 使用解构赋值和剩余运算符排除 userName 字段


        this.patient.complaint = patient.chiefComplaint
        this.patient.diagnosis = patient.dischargeDiagnosis
        this.patient.treatment = patient.treatmentPlan
        this.patient.medication = patient.dischargeMedications
        this.patient.surgery = patient.surgery
        this.patient.nursing = patient.specialNursing
        this.patient.followUp = patient.followUpPlan


        console.log(this.patient)
      } else {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5; /* 页面背景颜色偏灰 */
  max-height: 90vh; /* 最多占据视口的90%高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
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

.warning-row {
  background: #fff5f5;
  border-left: 3px solid #f00;
  padding-left: 6px;
  border-radius: 3px;
}

.warning-card {
  background: #fff;
  border-radius: 5px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-left: 5px solid #67c23a;
}

.warning-card.danger {
  border-left-color: #f56c6c;
  background: #fff5f5;
}

.warning-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.warning-content {
  color: #333;
}

.report-section,
.upload-section {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 14px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 12px;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.report-field {
  border: 1px solid #ebeef5;
  border-radius: 5px;
  padding: 10px;
  background: #fafafa;
}

.report-field span {
  display: block;
  color: #666;
  margin-bottom: 6px;
}

.report-field strong {
  color: #222;
  word-break: break-all;
}

.record-section {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.record-item {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin: 5px 0; /* 上下间距 */
  width: 100%; /* 占据一整行 */
}

.record-item h4 {
  margin: 0;
}

.divider {
  height: 1px;
  background-color: #ddd;
  margin: 5px 0; /* 上下间距 */
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.upload-btn {
  display: inline-block;
  padding: 8px 14px;
  color: #fff;
  background: #409eff;
  border-radius: 5px;
  cursor: pointer;
}

.upload-btn input {
  display: none;
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.attachment-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  background: #fafafa;
}

.attachment-item img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.attachment-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.attachment-meta small {
  color: #666;
  word-break: break-all;
}

.file-icon {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.attachment-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.mini-btn {
  padding: 3px 8px;
  border: 1px solid #409eff;
  color: #409eff;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.mini-btn.danger {
  border-color: #f56c6c;
  color: #f56c6c;
}

.save-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.save-btn {
  padding: 8px 18px;
  color: #fff;
  background: #67c23a;
  border: 1px solid #67c23a;
  border-radius: 5px;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.save-tip {
  color: #888;
  font-size: 13px;
}

.empty-upload {
  color: #999;
}

/* 切换按钮：与第一页面一致，放“主治医生”右侧，适中大小 */
.switch-btn{padding:4px 10px;border-radius:6px;border:1px solid #ccc;background:#409eff;cursor:pointer;line-height:22px;margin-left:8px;}
.switch-btn:hover{background:#f6f6f6;}

/* 切换患者弹窗样式（erecord 注入） */
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
