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
          <td>{{ formatTime(item.dischargeTime) }}</td>
          <td>{{ item.dischargeMedications }}</td>
          <td>{{ item.followUpPlan }}</td>
          <td>{{ item.followValidity ? formatTime(item.followValidity) : "-" }}</td>
          <td>
            <div class="follow-circles">
              <div class="circle-block">
                <div
                  class="circle"
                  :class="item.followUpMonth1 > 0 ? 'green' : 'gray'"
                >
                  {{ Number(item.followUpMonth1) > 0 ? '已随访' : '未随访' }}
                </div>
                <div>一个月后随访</div>
              </div>
              <div class="circle-block">
                <div
                  class="circle"
                  :class="item.followUpMonth2 > 0 ? 'green' : 'gray'"
                >
                  {{ Number(item.followUpMonth2) > 0 ? '已随访' : '未随访' }}
                </div>
                <div>三个月后随访</div>
              </div>
              <div class="circle-block">
                <div
                  class="circle"
                  :class="item.followUpMonth3 > 0 ? 'green' : 'gray'"
                >
                  {{ Number(item.followUpMonth3) > 0 ? '已随访' : '未随访' }}
                </div>
                <div>六个月后随访</div>
              </div>
            </div>

          <td class="ops-cell">
            <button class="op-btn op-view" @click="goToSurvey(item)">查看</button>
            <button class="op-btn op-investigate" @click="goToInvestigation(item)">调查</button>
            <button class="op-btn op-diagnose" @click="goToDiagnosis(item)">智能处方</button>
          </td>
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
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'

export default {
  name: "FollowUpList",
  data() {
    return {
      loadingCount: 0,

      records: [],
      filteredRecords: [],
      searchKey: "",
      sortField: "dischargeTime"
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
// 2) 新增：获取所有随访记录，并按 patientId 聚合到 1/3/6 个月三个时间窗
        let monthBucketsByPid = Object.create(null);
        let latestSubmitByPid = Object.create(null);
        try {
          const resFU = await axios.post(API_URL + "pat/patFollowUp/selectAll", null, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            }
          });
          const fuList = (resFU && resFU.data && resFU.data.data) || [];
          const now = Date.now();
          for (const r of fuList) {
            const pid = r && (r.patientId || r.patient_id || r.id);
            const t = r && r.submitTime ? new Date(r.submitTime).getTime() : NaN;
            if (!pid || !t || isNaN(t)) continue;
            const diffDays = Math.floor((now - t) / (1000 * 60 * 60 * 24));
            // 记录该患者最新一次 submitTime
            if (!latestSubmitByPid[pid] || t > latestSubmitByPid[pid]) {
              latestSubmitByPid[pid] = t;
            }
            // 初始化
            if (!monthBucketsByPid[pid]) {
              monthBucketsByPid[pid] = { m1: 0, m3: 0, m6: 0 };
            }
            // 窗口：<=30天 记入1个月；30<天数<=90 记入3个月；90<天数<=180 记入6个月
            if (diffDays <= 30) {
              monthBucketsByPid[pid].m1 += 1;
            } else if (diffDays <= 90) {
              monthBucketsByPid[pid].m3 += 1;
            } else if (diffDays <= 180) {
              monthBucketsByPid[pid].m6 += 1;
            }
          }
        } catch (fuErr) {
          console.error("获取随访记录(selectAll)失败:", fuErr);
        }

        // 3) 将聚合结果回填到原有记录的 followUpMonth1/2/3 字段（仅改逻辑，不改UI字段名）
        for (const row of sorted) {
          const pid = row && (row.patientId || row.outpatientId || row.id);
          const buckets = pid ? monthBucketsByPid[pid] : null;
          row.followUpMonth1 = buckets ? buckets.m1 : 0;
          row.followUpMonth2 = buckets ? buckets.m3 : 0; // 第二个圈：一个月之外、三个月之内
          row.followUpMonth3 = buckets ? buckets.m6 : 0; // 第三个圈：三个月之外、六个月之内
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
        this.records = filteredList;
        this.filteredRecords = sorted;
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
    // === 操作列点击方法 ===
    goToSurvey(row) {
      const pid = row && (row.patientId || row.outpatientId || row.id);
      this.$router && this.$router.push({ path: 'surveyList', query: { patientId: pid } });
    },
    goToInvestigation(row) {
      const pid = row && (row.patientId || row.outpatientId || row.id);
      window.open("https://www.wjx.cn/vm/emf7atu.aspx", "_blank");
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
  width:10%;
  max-width: 30%;
}
.record-table td:nth-child(7){
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  width:25%;
  max-width: 25%;
}
.record-table td:nth-child(8){
  width:20%;
  max-width: 30%;
}
.record-table td:nth-child(9){
  width:10%;
  max-width: 30%;
}
.record-table td:nth-child(10){
  width:30%;
  max-width: 30%;
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
.circle {
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
  padding: 4px 10px;
  margin-right: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
