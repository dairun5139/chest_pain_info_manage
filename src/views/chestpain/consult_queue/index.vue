<template>
  <div class="app-container">
    <!-- 顶部指标卡片 -->
    <section class="metrics">
      <article v-for="(card, i) in metricCards" :key="i">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.desc }}</small>
      </article>
    </section>

    <!-- 工作区 -->
    <section class="workspace">
      <div class="panel active" style="display:block; padding:18px;">
        <div class="consult-layout">
          <!-- 左侧：会诊请求队列 -->
          <section class="consult-request-panel">
            <div class="panel-head compact">
              <div>
                <h2>会诊请求队列</h2>
                <p>收集下级医院提交的会诊请求，点击后查看详情。</p>
              </div>
            </div>
            <div class="consult-request-list">
              <button
                v-for="req in requests"
                :key="req.id"
                class="consult-request-card"
                :class="{ active: req.id === selectedRequestId, urgent: req.priority === '急危' }"
                type="button"
                @click="selectRequest(req.id)"
              >
                <span>{{ req.priority }}</span>
                <strong>{{ req.patient }}</strong>
                <small>{{ req.hospital }} · {{ req.submittedAt }}</small>
                <p>{{ req.desc }}</p>
                <div class="task-meta">
                  <span v-for="m in req.materials" :key="m">{{ m }}</span>
                </div>
              </button>
            </div>
          </section>

          <!-- 右侧：详情 + 推荐医生 + 发起 -->
          <section class="consult-recommend-panel">
            <div class="panel-head compact">
              <div>
                <h2>推荐医院医生</h2>
                <p>根据请求病情和医院能力推荐高级医生，选择后发起会诊。</p>
              </div>
            </div>

            <!-- 选中请求详情 -->
            <div class="consult-request-detail">
              <article class="consult-detail-card">
                <div>
                  <span>{{ currentRequest.id }}</span>
                  <strong>{{ currentRequest.patient }}</strong>
                </div>
                <p>{{ currentRequest.hospital }} 提交 · {{ currentRequest.disease }} · {{ currentRequest.priority }} · {{ currentRequest.status }}</p>
                <small>{{ currentRequest.desc }}</small>
              </article>
            </div>

            <!-- 推荐医生列表 -->
            <div class="doctor-recommend-list">
              <button
                v-for="doc in recommendedDoctors"
                :key="doc.id"
                class="doctor-card"
                :class="{ selected: doc.id === selectedDoctorId }"
                type="button"
                @click="selectedDoctorId = doc.id"
              >
                <div>
                  <strong>{{ doc.name }}</strong>
                  <span>{{ doc.title }} · {{ doc.dept }}</span>
                  <small>{{ doc.hospital }}</small>
                </div>
                <p>{{ doc.specialty }}</p>
                <div class="doctor-meta">
                  <span>匹配度 {{ doc.match }}%</span>
                  <span>{{ doc.response }}响应</span>
                  <span>{{ doc.load }}</span>
                </div>
              </button>
            </div>

            <!-- 发起会诊 -->
            <div class="consult-launch-bar">
              <textarea
                v-model="consultNote"
                rows="3"
                placeholder="补充会诊要求，如导管室评估、心电图复核、转运建议"
              />
              <el-button type="primary" @click="launchConsult">发起会诊</el-button>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getConsultQueue, getRecommendedDoctors, launchConsult } from '@/api/consult'

export default {
  name: 'ChestpainConsult',
  data() {
    return {
      metricCards: [
        { label: '会诊请求', value: '3', desc: '下级医院待分派' },
        { label: '急危请求', value: '1', desc: '需优先处理' },
        { label: '推荐专家', value: '4', desc: '跨院高级医生' },
        { label: '平均响应', value: '8分', desc: '最快 5 分钟' }
      ],
      requests: [],
      doctors: [],
      selectedRequestId: '',
      selectedDoctorId: '',
      consultNote: ''
    }
  },
  mounted() {
    this.fetchData()
  },
  computed: {
    currentRequest() {
      return this.requests.find(r => r.id === this.selectedRequestId) || this.requests[0]
    },
    recommendedDoctors() {
      return this.doctors.map(doc => ({ ...doc }))
    }
  },
  methods: {
    selectRequest(id) {
      this.selectedRequestId = id
      this.selectedDoctorId = this.doctors[0].id
    },
    launchConsult() {
      const request = this.currentRequest
      const doctor = this.doctors.find(d => d.id === this.selectedDoctorId) || this.doctors[0]
      launchConsult({ requestId: request.id, doctorId: doctor.id, note: this.consultNote }).then(() => {
        request.status = '已分派'
        this.consultNote = ''
        this.$message.success(`已将 ${request.patient} 会诊分派给 ${doctor.hospital} ${doctor.name}`)
      })
    },
    fetchData() {
      getConsultQueue().then(res => {
        if (res.data && res.data.items) {
          this.requests = res.data.items
          if (this.requests.length) this.selectedRequestId = this.requests[0].id
        }
      })
      getRecommendedDoctors().then(res => {
        if (res.data && res.data.items) {
          this.doctors = res.data.items
          if (this.doctors.length) this.selectedDoctorId = this.doctors[0].id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
  article {
    min-height: 108px;
    padding: 18px;
    border: 1px solid $chestLine;
    border-radius: $chestRadiusMd;
    background: $chestSurface;
    box-shadow: $chestShadow;
    span, small { display: block; color: $chestMuted; }
    strong { display: block; margin: 8px 0 4px; color: $chestPrimaryDark; font-size: 32px; }
  }
}

.workspace {
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: $chestSurface;
  box-shadow: $chestShadow;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  &.compact { align-items: flex-start; }
  h2 { margin: 0 0 5px; font-size: 20px; }
  p { margin: 0; color: $chestMuted; font-size: 13px; }
}

.consult-layout {
  display: grid;
  grid-template-columns: minmax(420px, 0.85fr) minmax(560px, 1.15fr);
  gap: 18px;
}

.consult-request-panel, .consult-recommend-panel {
  min-height: 560px;
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
}

.consult-request-list, .doctor-recommend-list {
  display: grid;
  gap: 12px;
}

.consult-request-card, .doctor-card {
  width: 100%;
  padding: 14px;
  border: 1px solid $chestLine;
  border-left: 4px solid $chestPrimary;
  border-radius: $chestRadiusMd;
  color: $chestInk;
  text-align: left;
  background: $chestSurface;
  cursor: pointer;
  &:hover, &.active, &.selected {
    border-color: rgba(23, 111, 193, 0.5);
    box-shadow: 0 12px 24px rgba(23, 72, 114, 0.1);
  }
  &.urgent { border-left-color: $chestRed; }
  > span {
    display: inline-flex;
    margin-bottom: 8px;
    padding: 4px 8px;
    border-radius: $chestRadiusRound;
    color: $chestPrimaryDark;
    background: $chestSoft;
    font-size: 12px;
    font-weight: 700;
  }
  &.urgent > span {
    color: #ffffff;
    background: $chestRed;
  }
  strong, small, p { display: block; }
  strong { font-size: 17px; }
  small, span { color: $chestMuted; }
  p { margin: 8px 0 10px; color: #496174; line-height: 1.55; }
}

.consult-request-detail { margin-bottom: 14px; }

.consult-detail-card {
  padding: 14px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #f5faff;
  strong { display: block; margin-top: 4px; font-size: 20px; }
  span { color: $chestMuted; }
  p { margin: 8px 0 0; color: #496174; }
  small { display: block; margin-top: 6px; color: $chestMuted; }
}

.doctor-card {
  display: grid;
  grid-template-columns: minmax(180px, 0.95fr) minmax(180px, 1fr);
  gap: 12px;
  &.selected {
    border-left-color: $chestGreen;
    background: #f4fbf8;
  }
}

.doctor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  grid-column: 1 / -1;
  span {
    padding: 4px 8px;
    border-radius: $chestRadiusRound;
    color: #496174;
    background: $chestSoft;
    font-size: 12px;
  }
}

.consult-launch-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 12px;
  margin-top: 14px;
  textarea {
    min-height: 72px;
    padding: 10px;
    border: 1px solid $chestLine;
    border-radius: $chestRadiusSm;
    resize: vertical;
    font: inherit;
  }
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  span {
    padding: 4px 8px;
    border-radius: 5px;
    color: #496174;
    background: $chestSoft;
    font-size: 12px;
  }
}

@media (max-width: 900px) {
  .consult-layout, .consult-launch-bar, .doctor-card { grid-template-columns: 1fr; }
}
</style>
