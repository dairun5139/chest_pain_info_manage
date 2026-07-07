<template>
  <div class="app-container">
    <!-- 顶部指标卡片 -->
    <section class="metrics">
      <article v-for="(card, i) in metricCards" :key="i">
        <span>{{ card.label }}</span>
        <strong v-html="card.displayValue" />
        <small>{{ card.desc }}</small>
      </article>
    </section>

    <!-- 工作区 -->
    <section class="workspace">
      <div class="panel active" style="display:block; padding:18px;">
        <div class="split-layout">
          <!-- 左侧：发布考核表单 -->
          <div class="form-area">
            <div class="panel-head compact">
              <div>
                <h2>发布考核</h2>
                <p>向医院发送培训、病例复盘、演练和月度考核任务。</p>
              </div>
            </div>
            <el-form
              ref="trainingForm"
              :model="form"
              label-position="top"
              class="task-form"
              @submit.native.prevent="handleSubmit"
            >
              <el-form-item label="接收医院">
                <el-select v-model="form.hospital" style="width:100%">
                  <el-option
                    v-for="h in hospitals"
                    :key="h.name"
                    :label="h.name"
                    :value="h.name"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="任务类型">
                <el-select v-model="form.type" style="width:100%">
                  <el-option label="标准化流程培训" value="标准化流程培训" />
                  <el-option label="病例复盘" value="病例复盘" />
                  <el-option label="绿色通道演练" value="绿色通道演练" />
                  <el-option label="月度质控考核" value="月度质控考核" />
                </el-select>
              </el-form-item>
              <el-form-item label="截止日期">
                <el-date-picker v-model="form.deadline" type="date" value-format="yyyy-MM-dd" style="width:100%" />
              </el-form-item>
              <el-form-item label="负责人">
                <el-input v-model="form.owner" />
              </el-form-item>
              <el-form-item label="任务内容" class="wide">
                <el-input v-model="form.content" type="textarea" :rows="4" placeholder="填写培训目标、提交材料与考核要求" />
              </el-form-item>
              <el-button type="primary" native-type="submit" class="wide">发布考核任务</el-button>
            </el-form>
          </div>

          <!-- 右侧：培训考核列表 -->
          <div class="queue-area">
            <div class="panel-head compact">
              <div>
                <h2>培训考核列表</h2>
                <p>查看医院任务接收、完成和考核情况。</p>
              </div>
            </div>
            <div class="training-filters">
              <el-select v-model="filterHospital" style="width:100%">
                <el-option label="全部医院" value="all" />
                <el-option v-for="h in hospitals" :key="h.name" :label="h.name" :value="h.name" />
              </el-select>
              <el-select v-model="filterType" style="width:100%">
                <el-option label="全部类型" value="all" />
                <el-option label="标准化流程培训" value="标准化流程培训" />
                <el-option label="病例复盘" value="病例复盘" />
                <el-option label="绿色通道演练" value="绿色通道演练" />
                <el-option label="月度质控考核" value="月度质控考核" />
              </el-select>
              <el-select v-model="filterStatus" style="width:100%">
                <el-option label="全部状态" value="all" />
                <el-option label="已完成考核" value="completed" />
                <el-option label="未完成考核" value="pending" />
              </el-select>
            </div>
            <div v-if="filteredTasks.length" class="task-list">
              <article
                v-for="task in filteredTasks"
                :key="task.title + task.hospital"
                class="task-card training-card"
                :class="{ completed: task.completed, pending: !task.completed }"
              >
                <div class="training-card-head">
                  <div>
                    <h3>{{ task.title }}</h3>
                    <p>{{ task.hospital }} · {{ task.desc }}</p>
                  </div>
                  <strong>{{ task.score }}{{ task.score === '--' ? '' : '分' }}</strong>
                </div>
                <div class="task-meta">
                  <span>{{ task.type }}</span>
                  <span>截止 {{ task.deadline }}</span>
                  <span>{{ task.completed ? '已完成考核' : '未完成考核' }}</span>
                </div>
              </article>
            </div>
            <div v-else class="empty-state">暂无符合筛选条件的考核任务</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getTrainingTasks, createTraining } from '@/api/training'

const HOSPITALS = [
  { name: '苏州科技城医院' }, { name: '苏州大学附属第一医院' },
  { name: '苏州大学附属第二医院' }, { name: '苏州市立医院' },
  { name: '苏州市中医医院' }, { name: '苏州市吴中人民医院' }
]

export default {
  name: 'ChestpainTraining',
  data() {
    return {
      metricCards: [
        { label: '培训任务', value: '24', displayValue: '24', desc: '本月已发布' },
        { label: '完成率', value: '78%', displayValue: '78<em>%</em>', desc: '2 家医院临近截止' },
        { label: '平均分', value: '91', displayValue: '91', desc: '已完成任务均分' }
      ],
      hospitals: HOSPITALS,
      tasks: [],
      form: { hospital: '苏州科技城医院', type: '标准化流程培训', deadline: '', owner: '胸痛中心办公室', content: '' },
      filterHospital: 'all',
      filterType: 'all',
      filterStatus: 'all'
    }
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        if (this.filterHospital !== 'all' && task.hospital !== this.filterHospital) return false
        if (this.filterType !== 'all' && task.type !== this.filterType) return false
        if (this.filterStatus === 'completed' && !task.completed) return false
        if (this.filterStatus === 'pending' && task.completed) return false
        return true
      })
    }
  },
  mounted() {
    this.fetchTasks()
  },
  methods: {
    handleSubmit() {
      const data = {
        hospital: this.form.hospital,
        type: this.form.type,
        deadline: this.form.deadline || '待定',
        owner: this.form.owner,
        content: this.form.content
      }
      createTraining(data).then(() => {
        this.tasks.unshift({
          title: this.form.type,
          hospital: this.form.hospital,
          desc: `负责人：${this.form.owner}。${this.form.content || '请按要求完成学习并提交材料。'}`,
          type: this.form.type,
          deadline: this.form.deadline || '待定',
          completed: false,
          score: '--'
        })
        this.form.content = ''
        this.form.deadline = ''
        this.$message.success('培训考核任务已发送')
      })
    },
    fetchTasks() {
      getTrainingTasks().then(res => {
        if (res.data && res.data.items) this.tasks = res.data.items
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

.split-layout {
  display: grid;
  grid-template-columns: minmax(460px, 0.95fr) minmax(420px, 1.05fr);
  gap: 18px;
}

.form-area, .queue-area {
  min-height: 520px;
  padding: 18px;
  border: 1px solid $chestLine;
  border-radius: $chestRadiusMd;
  background: #fbfdff;
}

.task-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  .wide { grid-column: 1 / -1; }
}

.training-filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.task-list {
  display: grid;
  gap: 12px;
}

.task-card {
  padding: 14px;
  border: 1px solid $chestLine;
  border-left: 4px solid $chestPrimary;
  border-radius: $chestRadiusMd;
  background: $chestSurface;

  h3 { margin: 0 0 8px; font-size: 16px; }
  p { margin: 0 0 10px; color: $chestMuted; line-height: 1.6; }

  &.completed { border-left-color: $chestGreen; }
  &.pending { border-left-color: $chestAmber; }
}

.training-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  strong {
    min-width: 66px;
    padding: 8px 10px;
    border-radius: $chestRadiusMd;
    color: $chestPrimaryDark;
    background: #e6f1fb;
    font-size: 20px;
    text-align: center;
  }
}

.training-card.completed .training-card-head strong {
  color: $chestGreen;
  background: #eaf8f1;
}

.training-card.pending .training-card-head strong {
  color: $chestAmber;
  background: #fff4de;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  span {
    padding: 4px 8px;
    border-radius: 5px;
    color: #496174;
    background: $chestSoft;
    font-size: 12px;
  }
}

.empty-state {
  display: grid;
  min-height: 120px;
  place-items: center;
  border: 1px dashed $chestLine;
  border-radius: $chestRadiusMd;
  color: $chestMuted;
  background: #fbfdff;
}

@media (max-width: 900px) {
  .split-layout, .task-form, .training-filters { grid-template-columns: 1fr; }
}
</style>
