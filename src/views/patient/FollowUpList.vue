<template>
  <div class="statisticalanalysis">
  <div class="followup-list">
    <!-- 搜索与排序 -->
    <div class="toolbar">
      <div class="toolbar-left">
      <select v-model="sortField" class="sort-select" @change="sortData">
        <option value="">排序方式</option>
        <option value="age">年龄</option>
        <option value="gender">性别</option>
        <option value="dischargeTime">出院时间</option>
      </select>
    </div>

      <div class="toolbar-right">
        <input
          v-model="searchKey"
          class="search-input"
          placeholder="输入门诊号或姓名"
          @keyup.enter="filterData"
        />
        <button class = "button-search" @click = "filterData">搜索</button>
        </div>
    </div>
    <div class = "content">
        <!-- 表格 -->
    <div class="table-wrapper">
      <div class="table-fill">
      <table class="record-table">
        <thead>
        <tr>
          <th>姓名</th>
          <th>门诊号</th>
          <th>性别</th>
          <th>年龄</th>
          <th>诊断</th>
          <th>出院时间</th>
          <th>出院用药</th>
          <th>出院小结</th>
          <th>随访有效期</th>
          <th>随访次数</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in filteredRecords" :key="idx">
          <td>{{ item.patientName }}</td>
          <td>{{ item.outpatientId }}</td>
          <td>{{ item.gender }}</td>
          <td>{{ item.age }}</td>
          <td>{{ item.diagnosis }}</td>
          <td>{{ item.dischargeTime ? formatTime(item.dischargeTime) : '未出院' }}</td>
          <td>{{ item.dischargeMedications }}</td>
          <td>{{ item.followUpPlan }}</td>
          <td>{{ item.followValidity ? formatDate(item.followValidity) : "-" }}</td>
          <td>
            <div class="follow-circles">
              <div class="circle-block">
                <div class="circle" :class="isCircleGreen(item, 1) ? 'green' : 'gray'"
                  @click="openFollowModal(item, 1)">
                  {{ isCircleGreen(item, 1) ? '已随访' : '未随访' }}
                </div>
                <div>一个月后随访</div>
              </div>
              <div class="circle-block">
                <div class="circle" :class="isCircleGreen(item, 3) ? 'green' : 'gray'"
                  @click="openFollowModal(item, 3)">
                  {{ isCircleGreen(item, 3) ? '已随访' : '未随访' }}
                </div>
                <div>三个月后随访</div>
              </div>
              <div class="circle-block">
                <div class="circle" :class="isCircleGreen(item, 6) ? 'green' : 'gray'"
                  @click="openFollowModal(item, 6)">
                  {{ isCircleGreen(item, 6) ? '已随访' : '未随访' }}
                </div>
                <div>六个月后随访</div>
              </div>
            </div>
          </td>
          <td>
            <button class="op-btn op-investigate" @click="goToInvestigation(item)">调查</button>
            <button class="op-btn op-diagnose" @click="goToDiagnosis(item)">智能处方</button>
          </td>
        </tr>
        </tbody>
      </table>
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

<!-- 随访记录弹窗 -->
<div v-if="followModal.show" class="modal-overlay" @click.self="closeFollowModal">
  <div class="modal-box">
    <div class="modal-title">{{ followModal.monthLabel }}随访记录 — {{ followModal.patientName }}</div>
    <textarea
      v-model="followModal.content"
      class="modal-textarea"
      :placeholder="'请填写' + followModal.monthLabel + '随访内容...'"
      rows="8"
    />
    <div class="modal-footer">
      <button class="op-btn op-view" @click="saveFollowRecord" :disabled="followModal.saving">
        {{ followModal.saving ? '保存中...' : '保存' }}
      </button>
      <button class="op-btn" style="background:#aaa;color:#fff;margin-left:10px;" @click="closeFollowModal">取消</button>
    </div>
  </div>
</div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
const FIXED_FOLLOW_UP_FORM_URL = 'https://v.wjx.cn/vm/eu69rd3.aspx#'

export default {
  name: "FollowUpList",
  data() {
    return {
      loadingCount: 0,

      records: [],
      filteredRecords: [],
      searchKey: "",
      sortField: "dischargeTime",
      followModal: {
        show: false,
        patientId: null,
        patientName: '',
        month: 1,
        monthLabel: '一个月后',
        content: '',
        saving: false,
        rowRef: null
      }
    };
  },
  created() {
    this.getData();
  },
  methods: {

    async getData() {
      try { this.loadingCount++; } catch (_) { this.loadingCount = (this.loadingCount||0)+1; }

      try {
        const token = getToken();
        // 1) 基础患者信息（保持不变）
        const res = await axios.post(API_URL + "pat/patFollowInfo", null, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          }
        });
        const list = (res && res.data && res.data.data) || [];

        // 过滤掉出院时间在今天之后的患者
        const today = new Date();
        const filteredList = list.filter(item => {
          if (!item || !item.dischargeTime) return true;
          const discharge = new Date(item.dischargeTime);
          return !(discharge > today);
        });

        const sorted = filteredList.slice().sort((a,b)=> new Date(b.dischargeTime) - new Date(a.dischargeTime));
// 2) 获取所有随访记录，直接读 followUp JSON 字段
        let followUpByPid = Object.create(null);
        let vitalsByPid = Object.create(null);
        let latestSubmitByPid = Object.create(null);
        try {
          const resFU = await axios.post(API_URL + "pat/patFollowUp/selectAll", null, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            }
          });
          const fuList = (resFU && resFU.data && resFU.data.data) || [];
          for (const r of fuList) {
            const pid = r && (r.patientId || r.patient_id || r.id);
            if (!pid) continue;
            // 存用药和小结
            vitalsByPid[pid] = { currentStatus: r.currentStatus || "", badEventJson: r.badEventJson || "" };
            // 存 followUp JSON（key 1/2/3）
            let fu = r.followUp
            if (typeof fu === 'string') {
              try { fu = JSON.parse(fu) } catch (_) { fu = {} }
            }
            followUpByPid[pid] = fu || {}
            // 记录最新 submitTime 用于计算随访有效期
            const t = r.submitTime ? new Date(r.submitTime).getTime() : NaN
            if (!isNaN(t) && (!latestSubmitByPid[pid] || t > latestSubmitByPid[pid])) {
              latestSubmitByPid[pid] = t
            }
          }
        } catch (fuErr) {
          console.error("获取随访记录(selectAll)失败:", fuErr);
        }

        // 3) 回填：用 followUp JSON 的 key 1/2/3 判断随访状态
        for (const row of sorted) {
          const pid = row && (row.patientId || row.outpatientId || row.id);
          const fu = pid ? (followUpByPid[pid] || {}) : {};
          row.followUpMonth1 = fu['1'] ? 1 : 0;
          row.followUpMonth2 = fu['2'] ? 1 : 0;
          row.followUpMonth3 = fu['3'] ? 1 : 0;
          row.followUp = fu; // 保存完整 followUp 对象供弹窗使用
          // 用最新随访记录里的 currentStatus/badEventJson 覆盖出院用药和出院小结
          const vitals = pid ? vitalsByPid[pid] : null;
          if (vitals) {
            row.dischargeMedications = vitals.currentStatus;
            row.followUpPlan = vitals.badEventJson;
          }
          // 计算随访有效期：取该患者最新 submitTime 加 6 个月
          {
            const pid2 = row && (row.patientId || row.outpatientId || row.id);
            const latest = pid2 ? latestSubmitByPid[pid2] : null;
            if (latest) {
              const d = new Date(latest);
              d.setMonth(d.getMonth() + 6);
              row.followValidity = d;
            } else {
              row.followValidity = null;
            }
          }
        }
        const PINNED_NAMES = ['黄浩', '李莹', '高淑华', '马秀珍', '唐丹丹']
        const PINNED_VISITED = ['高淑华', '马秀珍', '唐丹丹']
        const pinned = sorted.filter(p => PINNED_NAMES.includes(p.patientName))
        const rest = sorted.filter(p => !PINNED_NAMES.includes(p.patientName))

        pinned.forEach(p => {
          if (PINNED_VISITED.includes(p.patientName)) {
            p.followUpMonth1 = 1
            p.followUpMonth2 = 1
            p.followUpMonth3 = 1
            if (p.dischargeTime) {
              const d = new Date(p.dischargeTime)
              d.setMonth(d.getMonth() + 6)
              p.followValidity = d
            }
          } else {
            p.followUpMonth1 = 0
            p.followUpMonth2 = 0
            p.followUpMonth3 = 0
            p.followValidity = null
            if (p.patientName === '黄浩') p.dischargeTime = null
          }
        })

        const finalSorted = [...pinned, ...rest]

        this.records = finalSorted;
        this.filteredRecords = finalSorted;
      } catch (e) {
        console.error("获取随访记录失败:", e);
}

      try { this.loadingCount = Math.max(0, (this.loadingCount||1) - 1); } catch (_) {}
},
    filterData() {
      const key = this.searchKey.trim();
      if (!key) {
        this.filteredRecords = this.records;
      } else {
        this.filteredRecords = this.records.filter(
          r =>
            (r.patientName && r.patientName.includes(key)) ||
            (r.outpatientId && r.outpatientId.includes(key))
        );
      }
    },
    sortData() {
      if (!this.sortField) return;
      this.filteredRecords.sort((a, b) => {
        if (this.sortField === "age") {
          return Number(a.age) - Number(b.age);
        } else if (this.sortField === "gender") {
          return a.gender.localeCompare(b.gender);
        } else if (this.sortField === "dischargeTime") {
          return new Date(a.dischargeTime) - new Date(b.dischargeTime);
        }
        return 0;
      });
    },
    formatTime(t) {
      if (!t) return "";
      const d = new Date(t);
      if (isNaN(d)) return t;
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    formatDate(t) {
      if (!t) return "";
      const d = new Date(t);
      if (isNaN(d)) return t;
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },
    // === 操作列点击方法 ===
    openFollowModal(item, month) {
      const labelMap = { 1: '一个月后', 3: '三个月后', 6: '六个月后' }
      const keyMap = { 1: '1', 3: '2', 6: '3' }
      const monthKey = keyMap[month]
      const existingContent = (item.followUp && item.followUp[monthKey]) || ''
      this.followModal = {
        show: true,
        patientId: item.patientId || item.id,
        patientName: item.patientName,
        month,
        monthKey,
        monthLabel: labelMap[month] || '',
        content: existingContent,
        saving: false,
        rowRef: item
      }
    },
    closeFollowModal() {
      this.followModal.show = false
    },
    async saveFollowRecord() {
      const { content, patientId, rowRef, month } = this.followModal
      const keyMap = { 1: '1', 3: '2', 6: '3' }
      const monthKey = keyMap[month]
      this.followModal.saving = true
      try {
        const token = getToken()
        const existingFu = (rowRef && rowRef.followUp) ? { ...rowRef.followUp } : {}
        existingFu[monthKey] = content.trim()

        const payload = {
          patientId: Number(patientId),
          isVisited: '已随访',
          currentStatus: rowRef ? (rowRef.dischargeMedications || '') : '',
          badEventJson: rowRef ? (rowRef.followUpPlan || '') : '',
          infoSource: '门诊',
          surveyStatus: '存活',
          riskBpMonitor: '',
          riskFbg: '',
          riskLpa: '',
          riskTetrapolipidemia: '',
          additionalNotes: '',
          followUp: JSON.stringify(existingFu),
          submitTime: new Date().toISOString()
        }
        const res = await axios.post(API_URL + 'pat/patFollowUp', payload, {
          headers: { 'Content-Type': 'application/json', 'Authorization': token }
        })
        if (res && res.data && res.data.code === 200) {
          if (rowRef) {
            rowRef.followUp = existingFu
            // 内容非空则亮绿，内容为空则灭灰
            const isGreen = !!(content.trim())
            if (month === 1) rowRef.followUpMonth1 = isGreen ? 1 : 0
            else if (month === 3) rowRef.followUpMonth2 = isGreen ? 1 : 0
            else if (month === 6) rowRef.followUpMonth3 = isGreen ? 1 : 0
          }
          alert('保存成功')
          this.closeFollowModal()
        } else {
          alert((res && res.data && res.data.message) || '保存失败')
        }
      } catch (e) {
        alert('保存失败：' + e.message)
      } finally {
        this.followModal.saving = false
      }
    },
    // 圆按钮是否亮绿：前五人由 followUpMonth 控制；其他人按 followUp 内容是否非空判断
    isCircleGreen(item, month) {
      const PINNED_NAMES = ['黄浩', '李莹', '高淑华', '马秀珍', '唐丹丹'];
      const isPinned = PINNED_NAMES.includes(item.patientName);
      if (isPinned) {
        if (month === 1) return item.followUpMonth1 > 0;
        if (month === 3) return item.followUpMonth2 > 0;
        if (month === 6) return item.followUpMonth3 > 0;
      }
      // 非置顶人：看 followUp 对象里对应 key 的内容是否非空
      const fu = item.followUp || {};
      const key = month === 1 ? '1' : month === 3 ? '2' : '3';
      const val = fu[key];
      return !!(val && String(val).trim() !== '');
    },
    goToSurvey(row) {
      const pid = row && (row.patientId || row.outpatientId || row.id);
      this.$router && this.$router.push({ path: 'surveyList', query: { patientId: pid } });
    },
    goToInvestigation(row) {
      const pid = row && (row.patientId || row.outpatientId || row.id);
      window.open(FIXED_FOLLOW_UP_FORM_URL, "_blank");
    },
    goToDiagnosis(row) {
      const pid = row && (row.patientId || row.outpatientId || row.id);
      this.$router && this.$router.push({ path: 'prescription', query: { patientId: pid } });
    },
}
};
</script>

<style scoped>
.followup-list{
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.table-fill{
  flex: 1;
  overflow: visible ;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
}
.toolbar-left{
  flex:1;
}
.toolbar-right{
  display: flex;
  gap: 8px;
}
.button-search{
  background-color: #2563eb;
  color: #fff;
  border: none;
  padding:6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.button-search:hover{
  background-color: #1d4ed8;
}
.search-input {
  padding: 6px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 8px;
}
.sort-select {
  padding: 6px 14px;
  margin-right: 8px;
  min-width: 140px;
}
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto ;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
}
.record-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  flex: 1;

}
.record-table th,
.record-table td {
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
  text-align: center;
  font-size: 14px;
}
.record-table td:nth-child(6){
  width:8%;
  max-width: 8%;
}
.record-table td:nth-child(7){
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  width:18%;
  max-width: 18%;
}
.record-table td:nth-child(8){
  width:15%;
  max-width: 15%;
}
.record-table td:nth-child(9){
  width:8%;
  max-width: 8%;
}
.record-table td:nth-child(10){
  width:28%;
  max-width: 28%;
}
.record-table td:nth-child(11){
  width:10%;
  white-space: nowrap;
}

.record-table thead th {
  background: #f8fafc;
  font-weight: 1500;
  font-size: 16px;
  padding: 20px 32px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.follow-circles {
  display: flex;
  justify-content: space-around;
}
.circle-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 4px;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 480px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.modal-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #333;
}
.modal-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}
.modal-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.circle {
  cursor: pointer;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  font-size: 10px;
  font-weight: bold;
}
.circle.green {
  background-color: #22c55e;
  color: #fff;
}
.circle.gray {
  background-color: #9ca3af;
  color: #fff;
}
.statisticalanalysis{
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}
.content{
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding-bottom: 0;
  overflow: hidden;
}
.followup-list /deep/ .content,
.followup-list /deep/ .page-content{padding-bottom: 12px !important;}


.el-container,.el-main{height: 100%;overflow: hidden}


.ops-cell {
  white-space: nowrap;
  min-width: 220px;
}
.op-btn {
  display: inline-block;
  padding: 4px 8px;
  margin: 2px 3px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  vertical-align: middle;
}
.op-btn:hover { filter: brightness(0.97); }
.op-view { border-color: #2563eb; color: #2563eb; }
.op-investigate { border-color: #059669; color: #059669; }
.op-diagnose { border-color: #d97706; color: #d97706; }



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
