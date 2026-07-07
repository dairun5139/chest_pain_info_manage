<template>
  <div class="video-conference">
    <h1>视频会议</h1>
    <div class="videos">
      <div v-for="(url, index) in videoUrls" :id="'video-container-' + index" :key="index" class="video-item" />
    </div>
    <div class="container">
    <div class="header">
      <h3>电子病历</h3>
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
          <p>{{ patient.admissionTime }}</p>
        </div>
        <div class="info-row">
          <p><strong>出院时间:</strong></p>
          <p>{{ patient.dischargeTime }}</p>
        </div>
        <div class="info-row">
          <p><strong>主治医生:</strong></p>
          <p>{{ patient.doctor }}</p>
        </div>
      </div>
    </div>

    <div class="record-section">
      <div class="record-item">
        <h4>主诉病史</h4>
        <div class="divider" />
        <p>{{ patient.complaint }}</p>
      </div>

      <div class="record-item">
        <h4>体格检查</h4>
        <div class="divider" />
        <p>{{ patient.physicalExam }}</p>
      </div>

      <div class="record-item">
        <h4>辅助检查</h4>
        <div class="divider" />
        <p>{{ patient.assistExam }}</p>
      </div>

      <div class="record-item">
        <h4>诊断结果</h4>
        <div class="divider" />
        <p>{{ patient.diagnosis }}</p>
      </div>

      <div class="record-item">
        <h4>治疗方案</h4>
        <div class="divider" />
        <p>{{ patient.treatment }}</p>
      </div>

      <div class="record-item">
        <h4>用药记录</h4>
        <div class="divider" />
        <p>{{ patient.medication }}</p>
      </div>

      <div class="record-item">
        <h4>手术记录</h4>
        <div class="divider" />
        <p>{{ patient.surgery }}</p>
      </div>

      <div class="record-item">
        <h4>护理记录</h4>
        <div class="divider" />
        <p>{{ patient.nursing }}</p>
      </div>

      <div class="record-item">
        <h4>随访记录</h4>
        <div class="divider" />
        <p>{{ patient.followUp }}</p>
      </div>
    </div>
    </div>
  </div>

</template>
<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import EZUIKit from '@/api/ezuikit'
import {API_URL} from "@/api/constants";

console.log('window.EZUIKit') // 如果返回 `undefined`，说明脚本没有加载成功
console.log(window.EZUIKit) // 如果返回 `undefined`，说明脚本没有加载成功

export default {
  data() {
    return {
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
      videoUrls: []
    }
  },
  created() {
    const { assistExam, doctorIds } = this.$route.query
    this.patient.id = this.$store.getters.patientId
    this.patient.assistExam = assistExam
    if (this.patient.id === '') this.patient.id = 2
    this.getPatientData()

    // 根据选中专家数量动态生成视频流地址（每位专家一个窗口 + 患者端固定一个）
    const allStreamUrls = [
      'ezopen://open.ys7.com/BE3428413/1.live',
      'ezopen://open.ys7.com/BE3429143/1.live',
      'ezopen://open.ys7.com/BE3430012/1.live',
      'ezopen://open.ys7.com/BE3430234/1.live',
      'ezopen://open.ys7.com/BE3430567/1.live',
      'ezopen://open.ys7.com/BE3430789/1.live',
    ]
    let count = 1 // 默认至少2个窗口
    try {
      const ids = JSON.parse(doctorIds || '[]')
      if (Array.isArray(ids) && ids.length > 0) {
        count = ids.length + 1 // 每位专家一个 + 患者端一个
      }
    } catch (e) {}
    this.videoUrls = allStreamUrls.slice(0, Math.min(count, allStreamUrls.length))
  },
  mounted() {
    this.initializePlayers()
  },
  methods: {
    async initializePlayers() {
      try {
        const response = await fetch('https://open.ys7.com/jssdk/ezopen/demo/token')
        const res = await response.json()
        const accessToken = res.data.accessToken

        // 动态创建播放器实例
        this.videoUrls.forEach((url, index) => {
          new EZUIKit.EZUIKitPlayer({
            id: `video-container-${index}`, // 每个流对应的容器 ID
            accessToken: 'at.83jjlbb6314b8e6u6cderjnq3i3dyc95-54xyhlx7gr-0cwmrrk-2jchngpwh', // accessToken, // 萤石云 Access Token
            url: url, // 视频流 URL
            template: 'pcLive', // 播放器模板
            width: 600,
            height: 400,
            env: {
              domain: 'https://open.ys7.com'
            }
          })
        })

        console.log('所有播放器初始化完成！')
      } catch (error) {
        console.error('获取萤石云 Token 失败:', error)
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
        this.patient.dischargeTime = dischargeTime === null ? '已出院' : dischargeTime // 更新出院时间
        this.patient.name = patientName // 更新患者姓名
        this.patient.doctor = userName // 更新医生信息

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
        this.patient.physicalExam = '无'
        // this.patient.assistExam =  '无'
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
.video-conference {
  text-align: center;
}

.videos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.video-item {
  width: 600px;
  height: 400px;
  background-color: #000;
}
.container {
   padding: 20px;
  text-align: left;
   font-family: Arial, sans-serif;
   background-color: #f5f5f5; /* 页面背景颜色偏灰 */
   max-height: 90vh; /* 最多占据视口的90%高度 */
   overflow-y: auto; /* 添加垂直滚动条 */
 }

.header {
  background-color: #ffffff;
  margin-bottom: 10px;
  padding: 2px;
  border-radius: 5px;
}

.patient-info {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 2px;
  margin-bottom: 5px;
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
</style>
