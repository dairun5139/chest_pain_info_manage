<template>
  <div class="container">
    <!-- 左侧信息栏 -->
    <div class="left-panel">
      <!--      <el-form :model="filterForm" label-width="80px">
        <el-form-item label="出院状态">
          <el-select v-model="filterForm.dischargeStatus" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="已出院" value="discharged"></el-option>
            <el-option label="未出院" value="inHospital"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="患者范围">
          <el-radio-group v-model="filterForm.patientScope">
            <el-radio label="all">所有患者</el-radio>
            <el-radio label="self">本人患者</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>-->

      <el-table
        :data="patientList"
        border
        height="calc(100vh - 200px)"
        @row-click="handlePatientClick"
      >
        <el-table-column prop="name" label="姓名">
          <template #default="{row}">
            <el-link type="primary" @click.prevent="handlePatientClick(row)">{{ row.name }}</el-link> <!-- 显示姓名，点击时传递 ID -->
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }} <!-- 性别转换 -->
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="60" />
      </el-table>
    </div>

    <!-- 右侧详细信息 -->
    <div v-loading="loading" class="right-panel">
      <template v-if="currentPatient">
        <!-- 基本信息 -->
        <el-card class="info-section">
          <div slot="header" class="section-header">
            <span>基本信息</span>
          </div>
          <el-row :gutter="30">
            <el-col :span="12">
              <div class="info-item"><label>姓名：</label>{{ currentPatient.name }}</div>
              <div class="info-item"><label>性别：</label>{{ currentPatient.gender === 1 ? '男' : '女' }}</div>
              <div class="info-item"><label>年龄：</label>{{ currentPatient.age }}</div>
              <div class="info-item"><label>身份证号：</label>{{ currentPatient.identificationNo }}</div> <!-- 修改 -->
            </el-col>
            <el-col :span="12">
              <div class="info-item"><label>联系电话：</label>{{ currentPatient.phoneNo }}</div> <!-- 修改 -->
              <div class="info-item"><label>门诊ID：</label>{{ currentPatient.medicalRecordNo }}</div> <!-- 修改 -->
              <div class="info-item"><label>出生日期：</label>{{ currentPatient.dateOfBirth }}</div> <!-- 修改 -->
            </el-col>
          </el-row>
        </el-card>

        <!-- 主诉与病史 -->
        <el-card class="info-section">
          <div slot="header" class="clearfix">
            <span>主诉与病史</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item"><label>发病时间：</label>{{ currentPatient.onsetTime }}</div>
              <div class="info-item"><label>发病地点：</label>{{ currentPatient.onsetLocation }}</div>
              <div class="info-item"><label>主诉：</label>{{ currentPatient.chiefComplaint }}</div>
            </el-col>
            <el-col :span="12">
              <div class="info-item"><label>现病史：</label>{{ currentPatient.currentIllnessHistory }}</div> <!-- 修改 -->
              <div class="info-item"><label>既往史：</label>{{ currentPatient.pastMedicalHistory }}</div> <!-- 修改 -->
            </el-col>
          </el-row>
        </el-card>

        <!-- 诊断与治疗 -->
        <el-card class="info-section">
          <div slot="header" class="clearfix">
            <span>诊断与治疗</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item"><label>初步诊断：</label>{{ currentPatient.preliminaryDiagnosis }}</div>
              <div class="info-item"><label>治疗计划：</label>{{ currentPatient.treatmentPlan }}</div>
              <div class="info-item"><label>病情进展：</label>{{ currentPatient.diseaseProgress }}</div> <!-- 修改 -->
            </el-col>
            <el-col :span="12">
              <div class="info-item"><label>出院诊断：</label>{{ currentPatient.dischargeDiagnosis }}</div>
              <div class="info-item"><label>出院带药：</label>{{ currentPatient.dischargeMedications }}</div> <!-- 修改 -->
              <div class="info-item"><label>随访计划：</label>{{ currentPatient.followUpPlan }}</div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 生命体征 -->
        <el-card class="info-section">
          <div slot="header" class="clearfix">
            <span>生命体征</span>
          </div>
          <el-row :gutter="20">
            <el-col v-for="(value, key) in currentPatient" v-if="vitalSignsLabels[key]" :key="key" :span="8">
              <div class="info-item"><label>{{ vitalSignsLabels[key] }}：</label>{{ value }}</div>
            </el-col>
          </el-row>
        </el-card>
      </template>

      <div v-else class="empty-tip">
        请从左侧选择患者查看详细信息
      </div>
    </div>
  </div>
</template>

<script>
import { selectAllPatient, selectPatientInfoById } from '@/api/outpatient/patient'
export default {
  data() {
    return {
      loading: false,
      filterForm: {
        dischargeStatus: '',
        patientScope: 'all'
      },
      patientList: [],
      currentPatient: null,
      vitalSignsLabels: {
        temperature: '体温',
        pulse: '脉搏',
        respiration: '呼吸',
        bloodPressure: '血压',
        spo2: '血氧饱和度'
      }
    }
  },
  mounted() {
    this.fetchAllPatients() // 在组件挂载时调用方法
  },
  methods: {
    async handlePatientClick(patient) {
      this.loading = true
      console.log(patient)
      try {
        // 调用 selectPatientInfoById 并传入患者 ID
        const response = await selectPatientInfoById(patient.id)

        // 处理返回的数据
        console.log(response.data) // 根据您的 API 返回格式进行处理
        // 例如，您可以将数据存储在组件的状态中
        this.patientInfo = response.data // 假设您有 patientInfo 用于存储患者信息
        this.currentPatient = {
          ...patient, // 将 patient 的所有属性赋值
          ...this.patientInfo // 将 response.data 的所有属性赋值

        }
        console.log(this.currentPatient)
      } catch (error) {
        // 使用 ElMessage 弹出提示
        this.$message.error('获取患者信息失败: ' + (error.message || '没有该患者信息')) // 显示错误信息
      } finally {
        this.loading = false // 结束加载状态
      }
    },
    handleSearch() {
      // 搜索逻辑
    },
    async fetchAllPatients() {
      this.loading = true // 开始加载
      try {
        const response = await selectAllPatient() // 调用前端定义的方法
        console.log('Response:', response) // 打印整个响应对象
        this.patientList = response.data // 将返回的数据赋值给 patientList
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false // 结束加载
      }
    }
  }
}
</script>

<style scoped>
/* 优化后的样式 */
.container {
  display: flex;
  height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.right-panel {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.info-section {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.info-section:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  padding: 8px 0;
}

.info-item {
  margin-bottom: 18px;
  font-size: 16px;
  line-height: 1.8;
  display: flex;
  align-items: flex-start;
}

.info-item label {
  color: #5a6d82;
  min-width: 120px;
  font-weight: 500;
  flex-shrink: 0;
}

.info-item-content {
  flex: 1;
  word-break: break-word;
  white-space: pre-wrap;
}

.el-card__header {
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(120deg, #f8f9fa 0%, #f1f3f5 100%);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-item {
    flex-direction: column;
  }

  .info-item label {
    margin-bottom: 4px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }

  .el-col {
    width: 100% !important;
  }
}
</style>
