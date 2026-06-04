<template>
  <div class="image-gallery">
    <h1>{{ imageType }} - 影像学分析</h1>
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
          <p>{{ formatDate(patient.admissionTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>出院时间:</strong></p>
          <p>{{ formatDate(patient.dischargeTime) }}</p>
        </div>
        <div class="info-row">
          <p><strong>主治医生:</strong></p>
          <p>{{ patient.doctor }}</p>
        </div>
      </div>
    </div>
    <div class="images">
      <div v-if="images.length">
        <div v-for="(row, rowIndex) in imageRows" :key="rowIndex" class="image-row">
          <img
            v-for="(image, index) in row"
            :key="index"
            :src="image"
            :alt="image.alt"
            class="zoomable-image"
            @click="enterFullscreen($event)"
          >
        </div>
      </div>
      <p v-if="loading">加载中...</p>
      <p v-if="error">{{ error }}</p>
    </div>

    <div v-if="info" class="info">
      <h2>分析结果</h2>
      <p>{{ info }}</p>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import { API_URL } from '@/api/constants'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      // 原有数据保持不变
      isModalOpen: false,
      currentImage: null,
      images: [
        require('@/assets/images/CT/ct.jpg')

      ],
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

      imagefile: '',
      info: '心律不齐',
      patientId: '',
      imageType: '', // 新增属性
      imageDate: '',
      loading: false,
      error: null
    }
  },
  computed: {
    imageRows() {
      const rows = []
      for (let i = 0; i < this.images.length; i += 3) {
        rows.push(this.images.slice(i, i + 3))
      }
      console.log('imagerows')
      console.log(this.images)
      return rows
    }
  },
  created() {
    const { imageType, imageDate } = this.$route.query
    // console.log("111："+imageType);
    const patientId = this.$store.getters.patientId
    this.patientId = patientId
    this.imageType = imageType
    this.imageDate = imageDate
    console.log(imageDate)
        this.getPatientData()
    this.fetchImages(imageType, this.patientId, imageDate)
  },
  methods: {
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
    async getPatientData() {
      const id = this.patientId
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
        this.patient.dischargeTime = dischargeDisplay // 更新出院时间
        this.patient.name = patientName // 更新患者姓名
        this.patient.doctor = userName // 更新医生信息

        console.log(this.patient)
      } else {
        this.loading = false
      }

    },
    async fetchImages(imageType, patientId, imageDate) {
      var string = ''
      if (this.imageType === '心电图') {
        string = 'pat/frontEcgInfo'
      } else if (this.imageType === 'CT') {
        string = 'pat/frontCtInfo'
      } else {
        string = 'pat/frontEchoInfo'
      }

      this.token = getToken()
      const response1 = await axios.post(API_URL + string, null, {
        params: { id: patientId },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      })
      console.log('response1')
      console.log(response1)

      if (response1.data.code === 200) {
        if (this.imageType === '心电图') {
          this.info = response1.data.data.ecgDiagnosis
        } else if (this.imageType === 'CT') {
          this.info = response1.data.data.ctDiagnosis
        } else {
          this.info = response1.data.data.echoDiagnosis
        }

        this.imagefile = response1.data.data.filePath
      } else {

      }

      try {
        // 假设 this.imagefile 可以是一个字符串或一个数组
        // 确保 images 数组的长度与 imagefile 数组的长度一致
        const length = Array.isArray(this.imagefile) ? this.imagefile.length : 1
        this.images = new Array(length).fill('')

        // 如果是一个数组，遍历每个 imagefile
        const imageFiles = Array.isArray(this.imagefile) ? this.imagefile : [this.imagefile]

        for (const file of imageFiles) {
          const response = await axios.get(API_URL + file, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            },
            responseType: 'arraybuffer' // 设置响应类型为 arraybuffer
          })
          console.log('response')
          console.log(response)
          // 处理响应
          if (response.status === 200) {
            // 创建一个 Blob 对象
            const blob = new Blob([response.data], { type: response.headers['content-type'] })
            const reader = new FileReader()

            reader.onloadend = () => {
              // 将 Blob 转换为 Data URL 后赋值给 images 数组
              const index = imageFiles.indexOf(file) // 获取当前文件在数组中的索引
              this.$set(this.images, index, reader.result)
            }

            // 读取 Blob 对象为 Data URL
            reader.readAsDataURL(blob)
          } else {
            // 请求不成功的处理
            console.error(`请求失败: ${response.status}`)
            this.loading = false
          }
        }
      } catch (error) {
        // 捕获并处理任何错误
        console.error('请求出错:', error)
        this.loading = false
      }
      console.log('11111111111111')
      console.log(this.images)
    },
    enterFullscreen(event) {
      const img = event.target
      if (img.requestFullscreen) {
        img.requestFullscreen()
      } else if (img.webkitRequestFullscreen) { /* Safari */
        img.webkitRequestFullscreen()
      } else if (img.msRequestFullscreen) { /* IE11 */
        img.msRequestFullscreen()
      }

      // 添加全屏样式
      img.classList.add('fullscreen-image')

      // 监听退出全屏事件
      const exitHandler = () => {
        img.classList.remove('fullscreen-image')
        img.removeEventListener('fullscreenchange', exitHandler)
      }
      img.addEventListener('fullscreenchange', exitHandler)
    }
  }

,
watch: {
  '$route.query'(q) {
    const { imageType, imageDate, patientId } = q || {}
    if (patientId) this.patientId = patientId
    if (imageType) this.imageType = imageType
    if (imageDate) this.imageDate = imageDate
    this.getPatientData()
    this.fetchImages(this.imageType, this.patientId, this.imageDate)
  }
}
}
</script>

<style scoped>
.image-gallery {
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
}

.image-row {
  display: flex;
  gap: 10px;
  margin: 10px;
  justify-content: center; /* 新增：使整行内容居中 */
}

.image-row img {
  flex: 1; /* 关键：自动平分剩余空间 */
  height: auto;
  object-fit: contain;
  min-width: 0; /* 修复flex容器的最小尺寸限制问题 */
}

/* 保证极端情况下的显示效果 */
.image-row img:only-child {
  flex: 0 1 100%; /* 单张图片时占满整行 */
}

.zoomable-image {
  cursor: zoom-in;
  transition: transform 0.3s;
}

.zoomable-image:hover {
  transform: scale(1.02);
}

/* 全屏状态样式 */
.fullscreen-image {
  cursor: zoom-out;
  background: black !important;
  object-fit: contain !important;
}

/* 全屏时隐藏其他元素 */
:fullscreen .image-gallery > :not(img) {
  display: none;
}
:fullscreen::backdrop {
  background: black;
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
</style>
