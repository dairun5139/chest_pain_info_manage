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
      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'list' }"
          type="button"
          @click="activeTab = 'list'"
        >医院列表</button>
        <button
          class="tab"
          :class="{ active: activeTab === 'access' }"
          type="button"
          @click="activeTab = 'access'"
        >接入审核</button>
      </div>

      <!-- 医院列表 Panel -->
      <div class="panel" :class="{ active: activeTab === 'list' }">
        <div class="panel-head">
          <div>
            <h2>医院列表</h2>
            <p>展示接入医院、患者预警、会诊处理、质控评分与培训考核情况。</p>
          </div>
          <div class="filters">
            <el-select v-model="levelFilter" size="small" style="width:130px">
              <el-option label="全部等级" value="all" />
              <el-option label="三级甲等" value="三级甲等" />
              <el-option label="三级乙等" value="三级乙等" />
              <el-option label="二级甲等" value="二级甲等" />
            </el-select>
            <el-select v-model="statusFilter" size="small" style="width:130px">
              <el-option label="全部状态" value="all" />
              <el-option label="在线" value="在线" />
              <el-option label="忙碌" value="忙碌" />
              <el-option label="离线" value="离线" />
            </el-select>
          </div>
        </div>

        <div class="topbar-actions">
          <div class="search">
            <span>⌕</span>
            <input v-model="searchKeyword" type="search" placeholder="搜索医院、医生、患者、任务">
          </div>
          <el-button type="primary" size="small" @click="onQuickAdd">新增医院</el-button>
        </div>

        <div class="table-wrap">
          <el-table
            :data="filteredHospitals"
            style="width:100%"
            :row-class-name="rowClassName"
            stripe
          >
            <el-table-column label="医院" min-width="160">
              <template slot-scope="{ row }">
                <div class="hospital-name">
                  <strong>{{ row.name }}</strong>
                  <span>{{ row.area }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="等级" width="100">
              <template slot-scope="{ row }">
                <span class="badge">{{ row.level }}</span>
              </template>
            </el-table-column>
            <el-table-column label="今日患者" width="90" prop="patients">
              <template slot-scope="{ row }">{{ row.patients }} 人</template>
            </el-table-column>
            <el-table-column label="会诊管理" width="80" prop="consults">
              <template slot-scope="{ row }">{{ row.consults }} 单</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template slot-scope="{ row }">
                <span class="status" :class="statusClass[row.status]">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="预警" width="110">
              <template slot-scope="{ row }">
                <span class="warning-badge" :class="row.warnings > 0 ? 'danger' : 'normal'">
                  {{ row.warnings > 0 ? `患者预警 ${row.warnings}` : '无预警' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="质控评分" width="90">
              <template slot-scope="{ row }">
                <strong class="score-text">{{ row.score }}</strong>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="{ row }">
                <el-button type="text" size="small" @click="onQualityView(row)">质控查看</el-button>
                <el-button type="text" size="small" @click="onPatientView(row)">患者查看</el-button>
              </template>
            </el-table-column>
            <el-table-column label="培训考核" width="110">
              <template slot-scope="{ row }">
                <el-button type="text" size="small" @click="onTrainingJump(row)">{{ row.training }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 接入审核 Panel -->
      <div class="panel" :class="{ active: activeTab === 'access' }">
        <div class="panel-head">
          <div>
            <h2>接入审核</h2>
            <p>接收想要接入系统的医院申请，并完成资质审核。</p>
          </div>
        </div>
        <div class="card-grid">
          <article
            v-for="item in accessItems"
            :key="item.name"
            class="data-card access-card"
            :class="{ approved: item.approved }"
          >
            <strong>{{ item.name }}</strong>
            <span>{{ item.level }}</span>
            <p>{{ item.approved ? '已完成审核' : item.status }}</p>
            <small>联系人：{{ item.contact }} · 申请时间：{{ item.submitted }}</small>
            <el-button
              size="small"
              :type="item.approved ? 'info' : 'default'"
              :disabled="item.approved"
              @click="onAudit(item)"
            >{{ item.approved ? '审核完成' : '完成审核' }}</el-button>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getHospitalList, getAccessList, approveAccess } from '@/api/hospital'

export default {
  name: 'ChestpainHospital',
  data() {
    return {
      metricCards: [
        { label: '联网医院', value: '1869', desc: '全国接入医院' },
        { label: '预警', value: '6', desc: '患者预警 2 家' },
        { label: '会诊处理', value: '18', desc: '待处理 5 单' },
        { label: '教学培训完成情况', value: '78%', desc: '本月任务 24 项' }
      ],
      hospitals: [],
      accessItems: [],
      activeTab: 'list',
      searchKeyword: '',
      levelFilter: 'all',
      statusFilter: 'all',
      statusClass: { '在线': 'online', '忙碌': 'busy', '离线': 'offline' }
    }
  },
  mounted() {
    this.fetchHospitals()
    this.fetchAccessList()
  },
  computed: {
    filteredHospitals() {
      return this.hospitals.filter(h => {
        const keyword = this.searchKeyword.trim()
        if (keyword && !(h.name + h.area + h.doctor + h.level + h.status).includes(keyword)) return false
        if (this.levelFilter !== 'all' && h.level !== this.levelFilter) return false
        if (this.statusFilter !== 'all' && h.status !== this.statusFilter) return false
        return true
      })
    }
  },
  methods: {
    rowClassName({ row }) {
      return row.warnings > 0 ? 'warning-row' : ''
    },
    onQualityView(row) {
      this.$message.info(`预留接口：打开 ${row.name} 的医院质控管理`)
    },
    onPatientView(row) {
      this.$message.info(`预留接口：打开 ${row.name} 的患者管理`)
    },
    onTrainingJump(row) {
      this.$message.info(`跳转到培训考核 - ${row.name}`)
    },
    onQuickAdd() {
      this.$message.info('请在医院管理中维护新增医院信息')
    },
    onAudit(item) {
      approveAccess(item.id || 0).then(() => {
        item.approved = true
        item.status = '已完成审核'
        this.$message.success(`${item.name} 已完成接入审核`)
      })
    },
    fetchHospitals() {
      getHospitalList().then(res => {
        if (res.data && res.data.items) this.hospitals = res.data.items
      })
    },
    fetchAccessList() {
      getAccessList().then(res => {
        if (res.data && res.data.items) this.accessItems = res.data.items
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

.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px 0;
  border-bottom: 1px solid $chestLine;
}

.tab {
  min-width: 112px;
  height: 42px;
  border: 0;
  border-bottom: 3px solid transparent;
  color: $chestMuted;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  &.active {
    color: $chestPrimary;
    border-bottom-color: $chestPrimary;
  }
}

.panel { display: none; padding: 18px; }
.panel.active { display: block; }

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  h2 { margin: 0 0 5px; font-size: 20px; }
  p { margin: 0; color: $chestMuted; font-size: 13px; }
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 14px;
}

.search {
  display: grid;
  grid-template-columns: 28px 230px;
  align-items: center;
  height: 40px;
  padding: 0 10px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusSm;
  background: $chestSurface;
  input {
    width: 100%;
    border: 0;
    outline: 0;
  }
}

.table-wrap {
  overflow: hidden;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
}

::v-deep .warning-row { background: #fff1f1; }
::v-deep .warning-row:hover td { background: #ffe7e7 !important; }

.hospital-name {
  strong, span { display: block; }
  span { margin-top: 3px; color: $chestMuted; font-size: 12px; }
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: $chestRadiusRound;
  color: $chestPrimaryDark;
  background: #e6f1fb;
  font-size: 12px;
  font-weight: 700;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: $chestRadiusRound;
  font-size: 12px;
  font-weight: 700;
  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }
  &.online { color: $chestGreen; background: $chestOnlineBg; }
  &.busy { color: $chestAmber; background: $chestBusyBg; }
  &.offline { color: $chestRed; background: $chestOfflineBg; }
}

.warning-badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 4px 9px;
  border-radius: $chestRadiusRound;
  font-size: 12px;
  font-weight: 700;
  &.danger { color: #ffffff; background: $chestRed; }
  &.normal { color: $chestGreen; background: $chestOnlineBg; }
}

.score-text { color: $chestPrimaryDark; font-size: 18px; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.data-card {
  display: grid;
  gap: 8px;
  min-height: 150px;
  padding: 16px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
  strong { font-size: 17px; }
  p { margin: 0; color: $chestPrimaryDark; font-weight: 700; }
  small { color: $chestMuted; line-height: 1.5; }
  &.approved {
    border-color: rgba(25, 166, 106, 0.45);
    background: #f0fbf6;
    p { color: $chestGreen; }
  }
}

@media (max-width: 900px) {
  .card-grid { grid-template-columns: 1fr; }
  .topbar-actions, .panel-head { flex-direction: column; align-items: stretch; }
}
</style>
