<template>
  <div class="container">

    <div class="statistics">

      <div class="stat-item">
        <div class="text">
          <p>本周入院人数: {{ admissionCount }}</p>
          <p></p>
          <p style="color: #007fff">上周入院人数: {{ lastWeekAdmissionCount }}人</p>
        </div>
        <div ref="admissionchart" class="chart-container" />
      </div>

      <div class="stat-item">
        <div class="text">
          <p>本周住院人数: {{ inpatientCount }}</p>
          <p></p>
          <p style="color: red">上周住院人数: {{ lastWeekInpatientCount }}人</p>
        </div>
        <div ref="inpatientchart" class="chart-container" />
      </div>

      <div class="stat-item">
        <div class="text">
          <p>本周出院人数: {{ dischargeCount }}</p>
          <p></p>
          <p style="color: green">上周出院人数: {{ lastWeekDischargeCount }}人</p>
        </div>
        <div ref="dischargechart" class="chart-container" />
      </div>
    </div>


    <div class="header">
      <h3>患者列表</h3>
      <div class="sort-section">
        <label for="sort">排序方式:</label>
        <select id="sort" v-model="sortOrder" @change="sortPatients">
          <option value="id">病历号</option>
          <option value="patientName">姓名</option>
          <option value="gender">性别</option>
          <option value="age">年龄</option>
          <option value="firstMedicalTime">首次医疗接触时间</option>
          <option value="onsetTime" selected>发病时间</option>
          <!--          <option value="fileTime">建档时间</option>-->
          <option value="diagnosis">诊断</option>
          <option value="doctors">主治医生</option>
          <option value="status">状态</option>
        </select>
      </div>
      <div class="sort-section">
        <label>  </label>
      </div>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="输入病历号或姓名"
          class="search-input"
          @keyup.enter="searchPatients"
        >
        <button class="search-button" @click="searchPatients">搜索</button>

      </div>

      <div class="sort-section">
        <!--<div style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">-->
          <div style="padding: 0 20px;">
            <label for="startDate"><strong>开始时间: </strong></label>
            <input id="startDate" v-model="startDate" type="date">
          </div>
          <div style="padding: 0 20px;">
            <label for="endDate"><strong>  结束时间: </strong></label>
            <input id="endDate" v-model="endDate" type="date">
          </div>
          <button class="search-button" @click="searchPatientList">确认</button>
        </div>

      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>病历号</th>
              <th>性别</th>
              <th>年龄</th>
              <th>首次医疗接触时间</th>
              <th>发病时间</th>
              <!--          <th>建档时间</th>-->
            <th>诊断</th>
            <th>主治医生</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in currentPagePatients" :key="patient.id" :style="patient.isWarning ? 'background:#fff5f5' : ''">
            <td>
              <span v-if="patient.isWarning" style="display:inline-block;background:#f00;color:#fff;font-size:11px;padding:1px 5px;border-radius:3px;margin-right:4px;vertical-align:middle;">⚠ 预警</span>
              {{ patient.patientName }}
            </td>
            <td>{{ patient.outpatientId }}</td>
            <td>{{ patient.gender }}</td>
            <td>{{ patient.age }}</td>
            <td>{{ formatDate(patient.firstMedicalTime) }}</td>
            <td>{{ formatDate(patient.onsetTime) }}</td>
            <!--          <td>{{ patient.fileTime != null ? formatDate(patient.fileTime) : '无' }}</td>-->
            <td>{{ patient.diagnosis }}</td>
            <td>{{ formatDoctors(patient.doctors) }}</td>
            <td :style="{ color: getStatusColor(patient.diagnosis) }">{{displayStatus(patient)}}</td>
            <td>
              <a style="color:blue" @click="viewDetails(patient.id)">[查看详情]</a> |
              <a
                :style="{'color': patient.fillFlag ? 'gray' : 'blue', 'cursor': patient.fillFlag ? 'not-allowed' : 'pointer'}"
                @click="patient.fillFlag ? () => {} : view_postdata(patient.id)"
              >[胸痛申报]</a>  |
              <a style="color:blue" @click="postdata(patient.id)">[申报查看]</a> |
              <a style="color:blue" @click="diagnosis(patient.id)">[AI问诊]</a> |
              <a style="color:blue" @click="view_trajectory(patient.id)">[行医轨迹]</a> |
              <a style="color:blue" @click="survey(patient.id)">[随访]</a> |
              <a style="color:blue" @click="consulation(patient.id)">[远程会诊]</a>
              <!--   <a style="color:blue" @click="consulation(patient.id)">[会诊]</a>-->
              <!--            <a @click="postdata(patient.id)" style="color:blue">[胸痛申报]</a> |-->

            </td>
          </tr>
        </tbody>
      </table>
      <!-- 分页控件 -->
      <div class="pagination">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
        >
          首页
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <span>
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
        >
          下一页
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
        >
          末页
        </button>
        <div class="page-size-selector">
          每页显示：
          <select v-model="pageSize" @change="handlePageSizeChange">
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="30">30条</option>
            <option value="50">50条</option>
            <option value="100">100条</option>
          </select>
        </div>
      </div>

    </div>

    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { API_URL } from '@/api/constants'
import { getToken } from '@/utils/auth'
import axios from 'axios'

export default {
  data() {
    return {
      loading: false, // 页面加载中悬浮圆圈
      sortOrder: 'onsetTime',
      searchQuery: '', // 用于存储搜索输入
      // 新增分页相关数据
      currentPage: 1,       // 当前页码
      pageSize: 20,           // 每页显示条数
      patients: [
        // {
        //   id: 18200,
        //   patientName: '张三',
        //   gender: '男',
        //   age: 30,
        //   firstMedicalTime: '2023-02-24 13:30', // 首次医疗接触时间
        //   onsetTime: '2023-02-23 09:00', // 发病时间
        //   fileTime: '2023-02-24 10:00', // 建档时间
        //   diagnosis: '急性心肌梗死', // 诊断
        //   doctors: '李医生',
        //   status: '急救中'
        // },
        // {
        //   id: 18201,
        //   patientName: '李四',
        //   gender: '男',
        //   age: 35,
        //   firstMedicalTime: '2023-02-23 10:15',
        //   onsetTime: '2023-02-22 14:00',
        //   fileTime: '2023-02-23 11:00',
        //   diagnosis: '肺炎',
        //   doctors: '王医生',
        //   status: '住院中'
        // },
        // {
        //   id: 18202,
        //   patientName: '王五',
        //   gender: '女',
        //   age: 20,
        //   firstMedicalTime: '2023-02-24 08:45',
        //   onsetTime: '2023-02-23 15:30',
        //   fileTime: '2023-02-24 09:00',
        //   diagnosis: '骨折',
        //   doctors: '赵医生',
        //   status: '已出院'
        // }
      ],
      patientList: [

      ],
      admissionCount: 30,
      inpatientCount: 51,
      dischargeCount: 23,
      lastWeekAdmissionCount: 32,
      lastWeekInpatientCount: 47,
      lastWeekDischargeCount: 28,
      admissionPct: 52.94,
      startDate: '',
      endDate: ''
    }
  },

  computed: {
    sortedPatients() {
      const toTime = (v) => {
        if (!v) return 0
        const d = new Date(typeof v === 'string' ? v.replace(' ', 'T') : v)
        return isNaN(d.getTime()) ? 0 : d.getTime()
      }
      const safeStr = (v) => (v == null ? '' : String(v))
      return [...this.patients].sort((a, b) => {
        if (this.sortOrder === 'outpatientId') {
          return safeStr(b.outpatientId).localeCompare(safeStr(a.outpatientId))
        } else if (this.sortOrder === 'patientName') {
          return safeStr(b.patientName).localeCompare(safeStr(a.patientName))
        } else if (this.sortOrder === 'gender') {
          return safeStr(b.gender).localeCompare(safeStr(a.gender))
        } else if (this.sortOrder === 'age') {
          return (b.age || 0) - (a.age || 0)
        } else if (this.sortOrder === 'firstMedicalTime') {
          return toTime(b.firstMedicalTime) - toTime(a.firstMedicalTime)
        } else if (this.sortOrder === 'onsetTime') {
          // 空值排到末尾
          const bt = toTime(b.onsetTime), at = toTime(a.onsetTime)
          if (!bt && !at) return 0
          if (!bt) return 1
          if (!at) return -1
          return bt - at
        } else if (this.sortOrder === 'dischargeTime') {
          return toTime(b.dischargeTime) - toTime(a.dischargeTime)
        } else if (this.sortOrder === 'diagnosis') {
          return safeStr(b.diagnosis).localeCompare(safeStr(a.diagnosis))
        } else if (this.sortOrder === 'doctors') {
          return safeStr(b.doctors).localeCompare(safeStr(a.doctors))
        } else if (this.sortOrder === 'status') {
          return safeStr(b.status).localeCompare(safeStr(a.status))
        }
        return 0
      })
    },
    filteredPatients() {
      // 仅渲染 firstMedicalTime 在“今天（含）之前”的患者；今天之后（未来）的记录不进入列表与分页
      const now = Date.now();


      const isFuture = (dateStr) => {
        if (!dateStr) return false // 无日期不视为未来，保留
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return false // 非法日期不视为未来，保留
        return d.getTime()>now;
      }

      // 先过滤掉未来日期
      const base = this.sortedPatients.filter(p => !isFuture(p.firstMedicalTime))

      // 再执行原有搜索过滤
      const query = this.searchQuery.trim().toLowerCase()
      return base.filter(patient => {
        const idMatch = patient.id?.toString().includes(query)
        const nameMatch = patient.patientName?.toLowerCase().includes(query)
        return idMatch || nameMatch
      })
    },
    // 新增分页相关计算属性
    totalItems() {
      // 总记录数
      return this.filteredPatients.length
    },
    totalPages() {
      // 总页数
      return Math.ceil(this.totalItems / this.pageSize)
    },
    currentPagePatients() {
      // 当前页显示的数据
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = Number(startIndex) + Number(this.pageSize)
      console.log('startIndex: ' + startIndex + ', endIndex: ' + endIndex)
      return this.filteredPatients.slice(startIndex, endIndex)
    }


  },
  created() {
    // 先尝试读取缓存以秒开首屏
    const hit = this.loadFromCacheSafely()

    //console.log('id:')

    //console.log(this.$store.getters)
    if (!hit) {
    this.getPatientListData()
  }

    const today = new Date()
    const lastYear = new Date()
    lastYear.setMonth(today.getMonth() - 6)

    // 设置默认日期
    this.startDate = lastYear.toISOString().split('T')[0] // 近一年开始时间
    this.endDate = today.toISOString().split('T')[0] // 今天作为结束时间
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  mounted() {
    // 组件挂载时初始化过滤列表，显示所有患者
    // this.filteredPatients = this.patients;
    if(this.$store.getters.patientId==='')
      this.$store.dispatch('user/Set_PatientID', 2)
    setTimeout(() => {
      this.initCharts()
    }, 100)
  },


  watch: {
    patients: {
      handler(newVal) {
        // 只将全量患者列表写入缓存，不受搜索过滤影响
        // 这样切换弹窗读到的始终是完整列表
        try {
          if (Array.isArray(newVal) && newVal.length > 0) {
            sessionStorage.setItem('filteredPatients', JSON.stringify(newVal));
            sessionStorage.setItem('filteredPatientsUpdatedAt', Date.now().toString());
          }
        } catch (e) {}
      },
      immediate: false,
      deep: false
    }
  },

  methods: {
    displayStatus(patient) {
      const first = patient.firstMedicalTime;
      const discharge = patient.dischargeTime;
      if (first && discharge) {
        const toDate = (v) => {
          if (!v) return NaN;
          if (typeof v === 'string' && v.indexOf('T') === -1 && v.indexOf('Z') === -1) {
            return new Date(v.replace(' ', 'T'));
          }
          return new Date(v);
        };
        const firstDt = toDate(first);
        const dischargeDt = toDate(discharge);
        const now = new Date();
        if (!isNaN(firstDt) && !isNaN(dischargeDt) && now >= firstDt && now <= dischargeDt) {
          return '住院中';
        }
      }
      return patient.status;
    },
    /**
     * 先读缓存（filteredPatients）并临时铺到 this.patients，
     * 仅用于首屏快速渲染；接口返回后会覆盖为最新数据。
     */
    loadFromCacheSafely() {
      try {
        const raw = sessionStorage.getItem('filteredPatients')
        if (!raw) return false
        const arr = JSON.parse(raw)
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (typeof arr[0] !== 'object' || arr[0] === null || !('id' in arr[0])) return false
        this.patients = arr
        return true
      } catch (e) {
        return false
      }
    },

    async getPatientListData() {
      this.loading = true;
      try {
      //const id = this.$store.getters.id
      //.log('id:' + id)
      //console.log('id:' + typeof id)

      const token = getToken()
      //console.log('token:' + token)
      const response = await axios.post(API_URL + 'pat/frontPatInfo', null,
        {
          // params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      // console.log("response：")
      // console.log(response)

      // 处理响应
      if (response.data.code === 200) {
        const mergedPatients = response.data.data
        //console.log('mergedPatients :', mergedPatients)

        this.patients = Object.values(
          mergedPatients.reduce((acc, patient) => {
            const { id, outpatientId, patientName, gender, age, firstMedicalTime, onsetTime, diagnosis, userName, status, fillFlag } = patient

            // 过滤掉没有名字的患者
            if (!patientName) {
              return acc // 如果没有名字，直接返回累加器
            }

            // 转换fillFlag：1→true，2→false（默认保持原值或设为false）
            let convertedFillFlag;
            if (fillFlag === 1) {
              convertedFillFlag = true;
            } else {
              // 处理其他情况（如null/undefined/其他数值），可根据需求调整默认值
              convertedFillFlag = false;
            }

            // 使用 id 作为唯一标识符
            if (!acc[id]) {
              // 创建新的患者对象并初始化医生名数组
              // 预警逻辑：STEMI/高危诊断 或 指定演示患者 标记为预警
              const warningDiagnoses = ['STEMI', '急性心肌梗死', '主动脉夹层', '肺栓塞']
              const isWarning = warningDiagnoses.some(d => (diagnosis || '').includes(d)) || id === 1
              acc[id] = { id, outpatientId, patientName, gender, age, firstMedicalTime, onsetTime,
              dischargeTime: patient.dischargeTime, diagnosis, doctors: [] , status, fillFlag: convertedFillFlag,
              isWarning }
            }

            // 添加医生到医生数组中（避免重复）
            if (!acc[id].doctors.includes(userName)) {
              acc[id].doctors.push(userName)
            }

            return acc
          }, {})
        )
        this.patientList = this.patients

        /* console.log("Updated patients:", this.patients);
        console.log("Sorted patients:", this.sortedPatients);
        console.log("Filtered patients:", this.filteredPatients);*/
      } else {
        this.loading = false
      }

      const response1 = await axios.post(API_URL + 'status/admissions/week', null,
        {
          // params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      // 处理响应
      if (response1.data.code === 200) {
        const inPatients = response1.data.data
        this.admissionCount = inPatients.current
        this.lastWeekAdmissionCount = inPatients.previous
        this.admissionPct = inPatients.pct

      }
      const response2 = await axios.post(API_URL + 'status/discharges/week', null,
        {
          // params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      // 处理响应
      if (response2.data.code === 200) {
        const inPatients = response2.data.data
        this.inpatientCount = inPatients.current
        this.lastWeekInpatientCount = inPatients.previous
        this.inpatientPct = inPatients.pct
      }

      const response3 = await axios.post(API_URL + 'status/inpatients/day', null,
        {
          // params:{ id: id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      // 处理响应
      if (response3.data.code === 200) {
        const inPatients = response3.data.data
        this.dischargeCount = inPatients.current
        this.lastWeekDischargeCount = inPatients.previous
        this.DischargePct = inPatients.pct
      }
      this.initCharts()

      } finally {
        this.loading = false;
      }
    },
    sortPatients() {
      // 触发计算属性更新
    },
    searchPatients() {

      /* if (!this.searchQuery) {
        return this.sortedPatients; // 如果没有搜索内容，返回已排序的患者列表
      }*/

      /* const query = this.searchQuery.trim().toLowerCase(); // 处理查询内容
      this.filteredPatients = this.sortedPatients.filter(patient => {
        const idMatch = patient.id.toString().includes(query); // 按ID搜索
        const nameMatch = patient.patientName.toLowerCase().includes(query); // 按姓名搜索
        return idMatch || nameMatch; // 只返回匹配的患者
      });*/

    },
    searchPatientList(){
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      // 验证时间格式有效性
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('无效的时间格式，请使用正确的日期字符串或Date对象');
      }

      // 筛选符合条件的患者
      this.patients = this.patientList.filter(patient => {
        // 跳过没有onsettime的患者（可选处理方式）
        if (!patient.onsetTime)
          return false

        const onsetTime = new Date(patient.onsetTime);
        // 验证患者发病时间格式
        if (isNaN(onsetTime.getTime())) {
          console.warn(`患者${patient.id || ''}的onsettime格式无效: ${patient.onsetTime}`);
          return false;
        }

        // 检查是否在时间范围内（闭区间）
        return onsetTime >= start && onsetTime <= end;
      });
      this.currentPage = 1
    },
    handlePageSizeChange() {
      // 当每页条数改变时，重置到第一页
      this.currentPage = 1
    },
    getStatusColor(status) {
      if (status === 'STEMI') {
        return 'red' // 急救中为红色
      } else if (status === 'NSTEMI') {
        return '#D4AF37' // 康复为绿色
      }
      return 'black' // 其他状态为黑色
    },
    formatDate(dateString) {
      //console.log('dateString')
      //console.log(dateString)
      if (dateString !== null && dateString !== '' && typeof dateString === 'string') {
        const date = new Date(dateString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(/\//g, '-')
      }
      return '' // 返回一个默认值或空字符串
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
    viewDetails(id) {
      this.searchQuery = '' // 清空搜索词，确保切换患者时能看到完整列表
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({
          path: '/patient/patientinfo',
          query: { id: id }
        })
      })
    },
    submit_info(id) {
      // 这里实现查看详情的逻辑
      // console.log("查看详情", id);

      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({
          path: '/chestpain/review',
          query: {

          }
        })
      })
    },
    diagnosis(id) {
      // 这里实现诊断的逻辑
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({ path: '/patient/diagnosis', query: { id: id } })
      })
    },
    viewTimeline(id) {
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({ path: '/patient/statisticalanalysis', query: { id: id } })
      })
    },
    survey(id) {
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({ path: '/patient/survey', query: { id: id } })
      })
    },
    consulation(id) {
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({ path: '/patient/remoteconsultation', query: { id: id } })
      })
    },
    postdata(id) {
      // 这里实现会诊的逻辑
      // console.log("胸痛申报仅查看", id);
      this.$store.dispatch('user/Set_PatientID',id).then(() => {
        this.$router.push({
          path: '/chestpain/review-readonly',
          query: {


          }
        })
      })
    },
    view_postdata(id) {
      // 这里实现会诊的逻辑
      console.log('申报查看', id)
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({
          path: '/chestpain/review',
          query: {


          }
        })
      })
    },
    view_trajectory(id) {
      // 这里实现会诊的逻辑
      console.log('行医轨迹', id)
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({
          path: '/patient/analysis',
          query: {


          }
        })
      })
    },
    initCharts() {
      this.initAdmissionChart()
      this.initInpatientChart()
      this.initDischargeChart()
      window.addEventListener('resize', this.handleResize)
    },
    handleResize() {
      [this.$refs.admissionchart,
        this.$refs.inpatientchart,
        this.$refs.dischargechart].forEach(chart => {
        if (chart && chart.chart) {
          chart.chart.resize()
        }
      })
    },
    initAdmissionChart() {
      // this.admissionchart = echarts.init(this.$refs.admissionchart);
      if (!this.$refs.admissionchart) return // 添加空判断
      const chartDom = this.$refs.admissionchart
      const myChart = echarts.init(chartDom)

      this.$refs.admissionchart.chart = myChart

      const total = this.admissionCount + this.lastWeekAdmissionCount
      const percentage = total === 0 ? 0 : (this.admissionCount / total * 100).toFixed(2)

      const option = {
        series: [{
          type: 'pie',
          radius: ['70%', '90%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center',
            formatter: `${percentage}%`,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff'
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: this.lastWeekAdmissionCount,
              name: '本周',
              itemStyle: {
                color: '#007fff'
              }
            },
            {
              value: this.admissionCount,
              name: '上周',
              itemStyle: {
                color: '#f0f0f0'
              }
            }
          ]
        }]
      }

      myChart.setOption(option)
    },
    initInpatientChart() {
      // this.inpatientchart = echarts.init(this.$refs.inpatientChart);
      const chartDom = this.$refs.inpatientchart
      const myChart = echarts.init(chartDom)
      this.$refs.inpatientchart.chart = myChart

      const total = this.inpatientCount + this.lastWeekInpatientCount
      const percentage = total === 0 ? 0 : (this.inpatientCount / total * 100).toFixed(2)

      const option = {
        series: [{
          type: 'pie',
          radius: ['70%', '90%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center',
            formatter: `${percentage}%`,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff'
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: this.lastWeekInpatientCount,
              name: '当前',
              itemStyle: {
                color: 'red'
              }
            },
            {
              value: this.inpatientCount,
              name: '上周',
              itemStyle: {
                color: '#f0f0f0'
              }
            }
          ]
        }]
      }

      myChart.setOption(option)
    },
    initDischargeChart() {
      // this.dischargechart = echarts.init(this.$refs.dischargechart);
      const chartDom = this.$refs.dischargechart
      const myChart = echarts.init(chartDom)
      this.$refs.dischargechart.chart = myChart

      const total = this.dischargeCount + this.lastWeekDischargeCount
      const percentage = total === 0 ? 0 : (this.dischargeCount / total * 100).toFixed(2)

      const option = {
        series: [{
          type: 'pie',
          radius: ['70%', '90%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center',
            formatter: `${percentage}%`,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff'
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: this.lastWeekDischargeCount,
              name: '当前',
              itemStyle: {
                color: 'green'
              }
            },
            {
              value: this.dischargeCount,
              name: '上周',
              itemStyle: {
                color: '#f0f0f0'
              }
            }
          ]
        }]
      }

      myChart.setOption(option)
    }

  }
}
</script>

<style scoped>

.container {
  background-color: #f5f5f5; /* 页面背景颜色偏灰 */
  display: flex;
  flex-direction: column;
  height: 96vh; /* 设定容器高度 */
  /* 内边距 */
  padding: 5px 20px 0px;
  box-sizing: border-box; /* 包含内边距 */
}

.header {
  background-color: #ffffff;
  display: flex;
  align-items: center; /* 垂直居中 */
  margin-bottom: 5px;
  margin-top: 5px;
  border-radius: 8px;
}

h3 {
  margin-right: 10px; /* 保留一点间隔 */
}

.sort-section {
  display: flex;
  align-items: center; /* 垂直居中 */
  padding-left: 5%;
}

.search-section {
  display: flex; /* 水平布局 */
  align-items: center; /* 垂直居中 */
  margin-left: auto; /* 向右对齐 */
  padding-right: 10%;
}

.search-input {
  margin-left: 10px; /* 输入框与标题之间的间隔 */
  padding: 5px; /* 内边距 */
  border: 1px solid #ccc; /* 边框样式 */
  border-radius: 4px; /* 圆角 */
}

.search-button {
  margin-left: 5px; /* 按钮与输入框之间的间隔 */
  padding: 5px 10px; /* 内边距 */
  background-color: #007bff; /* 按钮背景颜色 */
  color: white; /* 按钮文本颜色 */
  border: none; /* 去掉边框 */
  border-radius: 4px; /* 圆角 */
  cursor: pointer; /* 指针样式 */
}

.table-container {
  background-color: #ffffff;
  flex: 0 0 75%; /* 设置占据60%的高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  margin-bottom: 5px;
  border: 1px solid #ddd; /* 添加边框 */
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center; /* 表格内容居中 */
}
th{
  position: sticky;
  top: 0; /* 在滚动时保持顶部 */
  background-color: #fff; /* 表头背景颜色 */
  z-index: 1; /* 确保表头在其他内容之上 */
  border-bottom: 2px solid #ddd; /* 底部边框以便于区分 */
}
th, td {
  padding: 12px; /* 上下留边 */
}

th {
  background-color: #f2f2f2;
}

.statistics {
  background-color: #ffffff;
  display: flex;
  justify-content: space-between; /* 使统计项平均分布 */
  padding: 5px;
  border-radius: 8px;

}

.stat-item {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  flex: 1; /* 平均分配宽度 */
  background-color: #333; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border-radius: 10px; /* 圆角 */
  padding: 5px; /* 内边距 */
  padding-left: 20px;
  margin: 0 10px; /* 左右间距 */
}

.text {
  flex: 1; /* 占据剩余空间 */
}

.circle {
  width: 100px; /* 圆的直径 */
  height: 100px; /* 圆的直径 */
  border-radius: 50%; /* 变成圆形 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px; /* 左边距 */
}

.number {
  font-size: 24px; /* 字体大小 */
  font-weight: bold; /* 加粗 */
}

.percentage {
  font-size: 14px; /* 字体大小 */
}

.chart-container {
  width: 140px;
  height: 120px;
  min-width: 120px;
  position: relative; /* 修复 echarts 定位问题 */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.text {
  font-size: 18px;
  line-height: 1.5;
  p{
    margin: 5px;
  }
}
/* 新增分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-top: 5px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination span {
  color: #333;
}


/* 悬浮居中加载圆圈 */
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
