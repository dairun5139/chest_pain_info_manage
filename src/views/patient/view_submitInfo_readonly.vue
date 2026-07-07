<template>

  <div class="container">
    <!-- 时间轴：仅当有事件时显示；相邻两点不同色；null自动忽略 -->
    <div class="form-timeline" v-if="timelineEvents && timelineEvents.length">
      <div class="timeline">
        <div class="timeline-line"></div>
        <h3>时间轴</h3>
        <div v-for="(event, index) in timelineEvents" :key="index" :class="['timeline-item', (index % 2 === 0 ? 'even' : 'odd')]">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <time class="timeline-time">{{ event.time }}</time>
            <p class="timeline-desc">{{ event.description }}</p >
          </div>
        </div>
      </div>
    </div>

    <!--    <div class="form-timeline">
      <div class="timeline">
        <div class="timeline-line"></div> &lt;!&ndash; 竖线 &ndash;&gt;
        <h3>时间轴</h3>
        <div v-for="(event, index) in timelineEvents" :key="index" class="timeline-item">
          <div class="timeline-dot"></div> &lt;!&ndash; 小圆点 &ndash;&gt;
          <div class="timeline-content">
            <time>{{ event.time }}</time>
            <p>{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>-->

    <div class="form-container">

      <form @submit.prevent="handleSubmit" ref="mainForm">

        <div class="form-section">
          <div class="module basic-info">
            <h2>基本信息</h2>
            <div class="form-row">
              <div class="form-row-item">
                <label for="name">姓名：<span style="color: red;">*</span></label>
                <input id="name" v-model="formData.name" type="text" placeholder="无姓名" readonly>
              </div>

              <div class="form-row-item">
                <label for="gender">性别：<span style="color: red;">*</span></label>
                <select id="gender" v-model="formData.gender" disabled>
                  <!-- <option value="">请选择</option> -->
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <div class="form-row-item">
                <label for="idType">证件类型：</label>
                <select id="idType" :value="formData.idType" disabled>
                  <!-- <option value="0">请选择</option> -->
                  <option value="1">身份证</option>
                  <option value="2">护照</option>
                  <option value="3">军官证</option>
                  <option value="4">未知</option>
                </select>
              </div>

              <div class="form-row-item">
                <label for="idNumber">证件号：</label>
                <input id="idNumber" v-model="formData.idNumber" type="text" placeholder="无证件号" readonly>
              </div>

            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="age">年龄：<span style="color: red;">*</span></label>
                <input id="age" v-model="formData.age" type="number" placeholder="无年龄" readonly>
              </div>

              <div class="form-row-item">
                <label for="dob">出生日期：<span style="color: red;">*</span></label>
                <input id="dob" v-model="formData.dob" type="date" :max="maxDateTime" readonly>
              </div>

              <div class="form-row-item">
                <label for="ethnicity">民族：<span style="color: red;">*</span></label>
                <select id="ethnicity" v-model="formData.ethnicity" disabled>
                  <!-- <option value="">请选择</option> -->
                  <option value="汉族">汉族</option>
                  <option value="壮族">壮族</option>
                  <option value="满族">满族</option>
                  <option value="回族">回族</option>
                  <option value="苗族">苗族</option>
                  <option value="维吾尔族">维吾尔族</option>
                  <option value="土家族">土家族</option>
                  <option value="彝族">彝族</option>
                  <option value="藏族">藏族</option>
                  <option value="蒙古族">蒙古族</option>
                  <option value="侗族">侗族</option>
                  <option value="瑶族">瑶族</option>
                  <option value="白族">白族</option>
                  <option value="黎族">黎族</option>
                  <option value="哈尼族">哈尼族</option>
                  <option value="傣族">傣族</option>
                  <option value="畲族">畲族</option>
                  <option value="高山族">高山族</option>
                  <option value="拉祜族">拉祜族</option>
                  <option value="水族">水族</option>
                  <option value="东乡族">东乡族</option>
                  <option value="纳西族">纳西族</option>
                  <option value="景颇族">景颇族</option>
                  <option value="柯尔克孜族">柯尔克孜族</option>
                  <option value="土族">土族</option>
                  <option value="达斡尔族">达斡尔族</option>
                  <option value="仫佬族">仫佬族</option>
                  <option value="锡伯族">锡伯族</option>
                  <option value="阿昌族">阿昌族</option>
                  <option value="布朗族">布朗族</option>
                  <option value="撒拉族">撒拉族</option>
                  <option value="毛南族">毛南族</option>
                  <option value="仡佬族">仡佬族</option>
                  <option value="黎族">黎族</option>
                  <option value="民族">民族</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div class="form-row-item">
                <label for="phone">联系电话：<span style="color: red;">*</span></label>
                <input id="phone" v-model="formData.phone" type="tel" placeholder="无手机号" readonly>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="occupation">职业：</label>
                <select id="occupation" v-model="formData.occupation" disabled>
                  <!-- <option value="">请选择</option> -->
                  <option value="1">国家机关、党群组织、企事业单位负责人</option>
                  <option value="2">各类专业技术人员</option>
                  <option value="3">办事人员及有关人员</option>
                  <option value="4">商贸及服务业工作人员</option>
                  <option value="5">农、林、牧、渔、水利生产人员</option>
                  <option value="6">生产工人，运输工人和相关人员</option>
                  <option value="7">下岗或无业</option>
                  <option value="8">离退休</option>
                  <option value="9">学生</option>
                  <option value="10">军人</option>
                  <option value="11">不便分类的其他从业人员</option>
                </select>
              </div>
              <div class="form-row-item">
                <label for="education">文化程度：</label>
                <select id="education" v-model="formData.education" disabled>
                  <!-- <option value="">请选择</option> -->
                  <option value="1">未上学</option>
                  <option value="2">小学</option>
                  <option value="3">初中</option>
                  <option value="4">高中</option>
                  <option value="5">本科</option>
                  <option value="6">硕士</option>
                  <option value="7">博士</option>
                  <option value="8">不详</option>
                </select>
              </div>
              <div class="form-row-item">
                <label for="maritalStatus">婚姻状况：</label>
                <select id="maritalStatus" v-model="formData.maritalStatus" disabled>
                  <!-- <option value="">请选择</option> -->
                  <option value="1">未婚</option>
                  <option value="2">已婚</option>
                  <option value="3">丧偶</option>
                  <option value="4">离异</option>
                  <option value="5">不详</option>
                </select>
              </div>
              <div class="form-row-item">
                <label for="height">身高：<span style="color: red;">*</span></label>
                <input id="height" v-model="formData.height" type="text" placeholder="厘米" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="weight">体重：<span style="color: red;">*</span></label>
                <input id="weight" v-model="formData.weight" type="text" placeholder="公斤" style="width: 20%" readonly>
              </div>
              <div class="form-row-item">
                <label for="caseDate">病例归属日期：</label>
                <input id="caseDate" v-model="formData.caseDate" type="date" :max="maxDateTime" readonly>
              </div>
            </div>
          </div>
        </div>


        <div class="form-navigation">
          <button
            type="button"
            :class="{ 'active': currentModule === 'emergency' }"
            @click="currentModule = 'emergency'"
          >
            急救信息
          </button>
          <button
            type="button"
            :class="{ 'active': currentModule === 'chestPain' }"
            @click="currentModule = 'chestPain'"
          >
            胸痛诊疗
          </button>
          <button
            type="button"
            :class="{ 'active': currentModule === 'outcome' }"
            @click="currentModule = 'outcome'"
          >
            患者转归
          </button>
        </div>
        <div v-if="currentModule === 'emergency'" class="form-section">
          <!--        <h3>急救</h3>-->


          <div class="module">
            <h3>基本信息</h3>
            <div class="form-row">
              <div class="form-row-item">
                <label for="inpatientId">住院ID：</label>
                <input id="inpatientId" v-model="emergencyData.inpatientId" type="text" readonly>
              </div>
              <div class="form-row-item">
                <label for="outpatientId">门诊ID：</label>
                <input id="outpatientId" v-model="emergencyData.outpatientId" type="number" readonly>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="onsetTime">发病时间 <span style="color:red">*</span>：</label>
                <input id="onsetTime" :value="emergencyData.onsetTime" type="text" :max="maxDateTime" @change="validateTime(emergencyData, 'onsetTime')" readonly>
              </div>
              <div v-if="emergencyData.hasSpecificOnsetTime === 'True'" class="form-row-item">
                <label for="specificTime">具体时间：</label>
                <select id="specificTime" v-model="emergencyData.specificOnsetTime" disabled>
                  <option value="">请选择</option>
                  <option value="1">凌晨(0点到6点)</option>
                  <option value="2">清晨(6到8点)</option>
                  <option value="3">上午(8到12点)</option>
                  <option value="4">中午(12到14点)</option>
                  <option value="5">下午(14到17点)</option>
                  <option value="6">傍晚(17到19点)</option>
                  <option value="7">晚上(19到24点)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="address">发病地址：</label>
                <input id="address" v-model="emergencyData.address" type="text" placeholder="省市区" readonly>
              </div>
              <div class="form-row-item">
                <label for="detailedAddress">详细地址：</label>
                <input id="detailedAddress" v-model="emergencyData.detailedAddress" type="text" readonly>
              </div>

            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="insuranceType">医保类型：</label>
                <span>{{ getInsuranceTypeText(emergencyData.insuranceType) }}</span>
              </div>

              <div class="form-row-item">
                <label for="insuranceNumber">医保编号：</label>
                <input id="insuranceNumber" v-model="emergencyData.insuranceNumber" type="text" readonly>
              </div>
              <div class="form-row-item">
                <label>大病医保：</label>
                <input id="ciiTrue" v-model="isCriticalInsuranceRadio" type="radio" :value="true" readonly disabled>
                <label for="ciiTrue">是</label>
                <input id="ciiFalse" v-model="isCriticalInsuranceRadio" type="radio" :value="false" readonly disabled>
                <label for="ciiFalse">否</label>
              </div>
            </div>
          </div>

          <!-- 病情状况模块 -->
          <div class="module">
            <h3>病情状况<span style="color: red;">*</span></h3>
            <div class="symptom-group">
              <div class="symptom-row">
                <input id="symptom1" v-model="emergencyData.symptomslevel" type="radio" value="1" readonly disabled>
                <label for="symptom1">持续性胸闷/胸痛</label>
                <input id="symptom2" v-model="emergencyData.symptomslevel" type="radio" value="2" readonly disabled>
                <label for="symptom2">间歇性胸闷/胸痛</label>
                <input id="symptom3" v-model="emergencyData.symptomslevel" type="radio" value="3" readonly disabled>
                <label for="symptom3">症状已缓解</label>
              </div>
              <div class="symptom-row">
                <input id="symptom4" v-model="emergencyData.symptoms" type="checkbox" value="呼吸困难" readonly disabled>
                <label for="symptom4">呼吸困难</label>
                <input id="symptom5" v-model="emergencyData.symptoms" type="checkbox" value="腹痛" readonly disabled>
                <label for="symptom5">腹痛</label>
                <input id="symptom6" v-model="emergencyData.symptoms" type="checkbox" value="齿痛" readonly disabled>
                <label for="symptom6">齿痛</label>
                <input id="symptom7" v-model="emergencyData.symptoms" type="checkbox" value="合并出血" readonly disabled>
                <label for="symptom7">合并出血</label>
                <input id="symptom8" v-model="emergencyData.symptoms" type="checkbox" value="合并心衰" readonly disabled>
                <label for="symptom8">合并心衰</label>
                <input id="symptom9" v-model="emergencyData.symptoms" type="checkbox" value="合并恶性心率失常" readonly disabled>
                <label for="symptom9">合并恶性心率失常</label>
              </div>
              <div class="symptom-row">
                <input id="symptom10" v-model="emergencyData.symptoms" type="checkbox" value="自汗/大汗淋漓" readonly disabled>
                <label for="symptom10">自汗/大汗淋漓</label>
                <input id="symptom11" v-model="emergencyData.symptoms" type="checkbox" value="心慌心悸" readonly disabled>
                <label for="symptom11">心慌心悸</label>
                <input id="symptom12" v-model="emergencyData.symptoms" type="checkbox" value="烦躁不安" readonly disabled>
                <label for="symptom12">烦躁不安</label>
                <input id="symptom13" v-model="emergencyData.symptoms" type="checkbox" value="颈前部束缚感" readonly disabled>
                <label for="symptom13">颈前部束缚感</label>
                <input id="symptom14" v-model="emergencyData.symptoms" type="checkbox" value="乏力" readonly disabled>
                <label for="symptom14">乏力</label>
                <input id="symptom15" v-model="emergencyData.symptoms" type="checkbox" value="气喘" readonly disabled>
                <label for="symptom15">气喘</label>
                <input id="symptom16" v-model="emergencyData.symptoms" type="checkbox" value="其他" readonly disabled>
                <label for="symptom16">其他</label>
              </div>
            </div>
          </div>

          <!-- 来院方式模块 -->
          <div class="module">
            <h3>来院方式</h3>
            <div class="form-row">
              <label>来院方式：<span style="color: red;">*</span></label>
<input id="source-120" :name="'source'" v-model="emergencyData.source" type="radio" :value="1" readonly disabled>
<label for="source-120">呼叫（120或其他）出车</label>
<input id="source-transfer" :name="'source'" v-model="emergencyData.source" type="radio" :value="2" readonly disabled>
<label for="source-transfer">转院</label>
<input id="source-self" :name="'source'" v-model="emergencyData.source" type="radio" :value="3" readonly disabled>
<label for="source-self">自行来院</label>
<input id="source-inward" :name="'source'" v-model="emergencyData.source" type="radio" :value="4" readonly disabled>
<label for="source-inward">院内发病</label>
</div>

            <div v-if="Number(emergencyData.source) === 1">
              <div class="form-row">

                <label>出车单位：<span style="color: red;">*</span></label>
                <input id="ambulance120" v-model="emergencyData.transportUnit" type="radio" value="120救护车" readonly disabled>
                <label for="ambulance120">120救护车</label>
                <input id="hospitalAmbulance" v-model="emergencyData.transportUnit" type="radio" value="本院救护车" readonly disabled>
                <label for="hospitalAmbulance">本院救护车</label>
                <input id="externalAmbulance" v-model="emergencyData.transportUnit" type="radio" value="外院救护车" readonly disabled>
                <label for="externalAmbulance">外院救护车</label>

              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label for="callTime">呼救时间：<span style="color: red;">*</span></label>
                  <input id="callTime" v-model="emergencyData.callTime" type="datetime-local" placeholder="无呼救时间" :max="maxDateTime" @change="validateTime(emergencyData, 'callTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="arrivalTime">到达医院大门时间：<span style="color: red;">*</span></label>
                  <input id="arrivalTime" v-model="emergencyData.arrivalTime" type="datetime-local" placeholder="无到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label>直接转送上级医院：<span style="color: red;">*</span></label>
                  <input id="transferFalse" v-model="emergencyData.directTransfer" type="radio" value="False" readonly disabled>
                  <label for="transferFalse">否</label>
                  <input id="transferTrue" v-model="emergencyData.directTransfer" type="radio" value="True" readonly disabled>
                  <label for="transferTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="firstContactTime">首次医疗接触时间：<span style="color: red;">*</span></label>
                  <input id="firstContactTime" v-model="emergencyData.firstContactTime"  type="datetime-local" placeholder="无首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="firstDoctorTime">首诊医师接诊时间：</label>
                  <input id="firstDoctorTime" v-model="emergencyData.firstDoctorTime" type="datetime-local" placeholder="无接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstDoctorTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="medicalStaff">医护人员：</label>
                  <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="无医护人员姓名" readonly>
                </div>
              </div>

            </div>

            <div v-if="Number(emergencyData.source) === 2">
              <div class="form-row">
                <div class="form-row-item">
                  <label>转院类型：<span style="color: red;">*</span></label>
                  <input id="networkHospital" v-model="emergencyData.transferType" type="radio" value="网络医院" readonly disabled>
                  <label for="networkHospital">网络医院</label>
                  <input id="otherMedicalInstitution" v-model="emergencyData.transferType" type="radio" value="其他医疗机构" readonly disabled>
                  <label for="otherMedicalInstitution">其他医疗机构</label>
                </div>
              </div>
              <div class="form-row">

                <div class="form-row-item">
                  <label for="hospitalName">医院名称：</label>
                  <input id="hospitalName" v-model="emergencyData.hospitalName" type="text" placeholder="无医院名称" readonly>
                </div>

                <div class="form-row-item">
                  <label for="firstContactTime">首次医疗接触时间：<span style="color: red;">*</span></label>
                  <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="无首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="transferInTime">转出医院入门时间：<span style="color: red;">*</span></label>
                  <input id="transferInTime" v-model="emergencyData.transferInTime" type="datetime-local" placeholder="无入门时间" :max="maxDateTime" @change="validateTime(emergencyData, 'transferInTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="decisionTransferTime">决定转院时间：<span style="color: red;">*</span></label>
                  <input id="decisionTransferTime" v-model="emergencyData.decisionTransferTime" type="datetime-local" placeholder="无决定转院时间" :max="maxDateTime" @change="validateTime(emergencyData, 'decisionTransferTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="transferOutTime">转出医院出门时间：<span style="color: red;">*</span></label>
                  <input id="transferOutTime" v-model="emergencyData.transferOutTime" type="datetime-local" placeholder="无出门时间" :max="maxDateTime" @change="validateTime(emergencyData, 'transferOutTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="arrivalAtHospitalTime">到达本院大门时间：<span style="color: red;">*</span></label>
                  <!--<input type="datetime-local" id="arrivalAtHospitalTime" v-model="emergencyData.arrivalAtHospitalTime" placeholder="无到达时间"  :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalAtHospitalTime')"/ readonly>-->
                  <input id="arrivalAtHospitalTime" v-model="emergencyData.arrivalTime" type="datetime-local" placeholder="无到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="inHospitalConsultationTime">院内接诊时间：<span style="color: red;">*</span></label>
                  <input id="inHospitalConsultationTime" v-model="emergencyData.inHospitalConsultationTime" type="datetime-local" placeholder="无接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'inHospitalConsultationTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="medicalStaff">医护人员：</label>
                  <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="无医护人员姓名" readonly>
                </div>
              </div>
            </div>

            <div v-if="Number(emergencyData.source) === 3">
              <div class="form-row">
                <div class="form-row-item">
                  <label for="arrivalAtHospitalTime">到达本院大门时间：<span style="color: red;">*</span></label>
                  <input id="arrivalAtHospitalTime" v-model="emergencyData.arrivalTime" type="datetime-local" placeholder="无到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalAtHospitalTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="firstContactTime">首次医疗接触时间：<span style="color: red;">*</span></label>
                  <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="无首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="firstDoctorTime">首诊医师接诊时间：<span style="color: red;">*</span></label>
                  <input id="firstDoctorTime" v-model="emergencyData.firstDoctorTime" type="datetime-local" placeholder="无接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstDoctorTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="medicalStaff">医护人员：</label>
                  <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="无医护人员姓名" readonly>
                </div>
              </div>
            </div>
            <div v-if="Number(emergencyData.source) === 4">
              <div class="form-row">
                <div class="form-row-item">
                  <label for="department">发病地点：<span style="color: red;">*</span></label>
                  <input id="department" v-model="emergencyData.department" type="text" placeholder="无地点" readonly>
                </div>

                <div class="form-row-item">
                  <label for="firstContactTime">首次医疗接触时间：<span style="color: red;">*</span></label>
                  <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="无首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="bedDoctorContactTime">床位医生接触时间：</label>
                  <input id="bedDoctorContactTime" v-model="emergencyData.bedDoctorContactTime" type="datetime-local" placeholder="无接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'bedDoctorContactTime')" readonly>
                </div>

                <div class="form-row-item">
                  <label for="leaveDepartmentTime">离开科室时间：</label>
                  <input id="leaveDepartmentTime" v-model="emergencyData.leaveDepartmentTime" type="datetime-local" placeholder="无离开时间" :max="maxDateTime" @change="validateTime(emergencyData, 'leaveDepartmentTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="medicalStaff">医护人员：</label>
                  <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="无医护人员姓名" readonly>
                </div>
              </div>
            </div>
          </div>

          <div class="module">
            <h3>基础生命体征</h3>
            <div class="form-row">
              <div class="form-row-item">
                <label for="consciousness">意识 <span style="color:red">*</span>：</label>
                <select id="consciousness" v-model="emergencyData.consciousness" disabled>
                  <option value="">请选择</option>
                  <option value="1">清醒</option>
                  <option value="2">对语言有反应</option>
                  <option value="3">对刺激有反应</option>
                  <option value="4">对任何刺激无反应</option>
                </select>
              </div>
              <div class="form-row-item">
                <label for="respiration">呼吸（次/分钟）<span style="color:red">*</span>：</label>
                <input id="respiration" v-model="emergencyData.respiration" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'respiration', emergencyData.respiration, 0, 100, '次/分钟')" readonly>
              </div>

              <div class="form-row-item">
                <label for="pulse">脉搏（次/分钟） <span style="color:red">*</span>：</label>
                <input id="pulse" v-model="emergencyData.pulse" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'pulse', emergencyData.pulse, 0, 300, '次/分钟')" readonly>
              </div>

            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="heartRate">心率 <span style="color:red">*</span>：</label>
                <input id="heartRate" v-model="emergencyData.heartRate" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'heartRate', emergencyData.heartRate, 0, 300, '次/分钟')" readonly>
              </div>

              <div class="form-row-item">
                <label for="bloodPressure">血压 <span style="color:red">*</span>：</label>
                <input id="bloodPressure" v-model="emergencyData.bloodPressure" type="text" placeholder="mmHg" readonly>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="temperature">体温 <span style="color:red">*</span>：</label>
                <input id="temperature" v-model="emergencyData.temperature" type="number" placeholder="℃" @blur="validateTemperature" readonly>
              </div>

            </div>

            <div class="form-row">
              <label for="patientRemarks">患者情况备注：</label>
              <textarea id="patientRemarks" v-model="emergencyData.remarks" placeholder="无备注"  readonly></textarea>
            </div>
          </div>
        </div>

        <div v-if="currentModule === 'chestPain'" class="form-section">
          <!--        <h3>胸痛</h3>-->
          <!-- 心电图模块 -->
          <div class="module">
            <h3>心电图 <span style="color:red">*</span></h3>
            <div class="form-row">
              <label>心电图 <span style="color:red">*</span>：</label>
              <input id="ecgTrue" v-model="chestPainData.ecg" type="radio" value="True" readonly disabled>
              <label for="ecgTrue">是</label>
              <input id="ecgFalse" v-model="chestPainData.ecg" type="radio" value="False" readonly disabled>
              <label for="ecgFalse">否</label>
              <div v-if="chestPainData.ecg === 'False'" class="form-row-item">
                <label>未获得原因：</label>
                <input v-model="chestPainData.whynoecg" type="text" placeholder="原因" readonly>
              </div>
            </div>
            <div v-if="chestPainData.ecg === 'True'">

              <div v-for="(ecg, index) in chestPainData.ecgs" :key="index" class="form-row">
                <div class="form-row-item">
                  <label :for="'ecgTime' + index">心电图时间 <span style="color:red">*</span>：</label>
                  <input :id="'ecgTime' + index" v-model="ecg.time" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="validecgdateTime(index)" readonly>
                </div>
                <div class="form-row-item">
                  <label :for="'ecgFile' + index">心电图文件 <span style="color:red">*</span>：</label>
                  <input :id="'ecgFile' + index" type="file" @change="(event) = readonly> handleFileUpload(event, index)">
                </div>
                <div class="form-row-item">
                  <!-- <button type="button" @click="removeEcg(index)">删除</button> -->
                </div>
              </div>
              <div class="form-row">
                <!-- <button type="button" @click="addEcg">添加心电图</button> -->
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label for="ecgDiagFalsesisTime">心电图诊断时间 <span style="color: red;">*</span>：</label>
                  <input id="ecgDiagFalsesisTime" v-model="chestPainData.ecgDiagFalsesisTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ecgDiagFalsesisTime')" readonly>
                </div>
              </div>

              <!-- 其他字段保持不变 -->
            </div>
            <div class="form-row">
              <label>远程心电图传输 <span style="color: red;">*</span>：</label>
              <input id="ecgRemoteTrue" v-model="chestPainData.ecgRemote" type="radio" value="True" readonly disabled>
              <label for="ecgRemoteTrue">接受120/网络医院心电图</label>
              <input id="ecgRemoteFalse" v-model="chestPainData.ecgRemote" type="radio" value="False" readonly disabled>
              <label for="ecgRemoteFalse">未传输</label>
              <div v-if="chestPainData.ecgRemote === 'True'" class="form-row-item">
                <label>时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.ecgRemoteTime" type="datetime-local" placeholder="选择时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ecgRemoteTime')" readonly>
              </div>
              <div v-if="chestPainData.ecgRemote === 'True'" class="form-row-item">
                <label>传输方式 <span style="color: red;">*</span>：</label>
<input id="trans-realtime" :name="'transmissionMode'" v-model="chestPainData.transmissionMode" type="radio" value="realtime" readonly disabled>
<label for="trans-realtime">实时监控</label>
<input id="trans-wechat" :name="'transmissionMode'" v-model="chestPainData.transmissionMode" type="radio" value="wechat" readonly disabled>
<label for="trans-wechat">微信群</label>
</div>
            </div>
          </div>

          <!-- 实验室检查模块 -->
          <div class="module">
            <h3>实验室检查</h3>
            <div class="form-row">
              <div class="form-row-item">
                <label>肌钙蛋白 <span style="color:red">*</span>：</label>

                <input id="troponinFalse" v-model="chestPainData.troponin" type="radio" value="False" readonly disabled>
                <label for="troponinFalse">否</label>
                <input id="troponinTrue" v-model="chestPainData.troponin" type="radio" value="True" readonly disabled>
                <label for="troponinTrue">是</label>
              </div>
            </div>
            <div v-if="chestPainData.troponin === 'True'">
              <div v-for="(troponin, index) in chestPainData.troponins" :key="index">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>{{ index === 0 ? '首次肌钙蛋白' : '肌钙蛋白' }}：</label>
                    <input :id="'troponinT' + index" v-model="troponin.type" type="radio"  value="TnT" readonly disabled>
                    <label :for="'troponinT' + index">TnT</label>
                    <input :id="'troponinI' + index" v-model="troponin.type"  type="radio" value="Tnl" readonly disabled>
                    <label :for="'troponinI' + index">Tnl</label>
                  </div>




                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>结果：</label>
                    <input :id="'resultNegative' + index" v-model="troponin.result" type="radio" value="阴性" readonly disabled>
                    <span :for="'resultNegative' + index">阴性</span>
                    <input :id="'resultPositive' + index" v-model="troponin.result" type="radio" value="阳性" readonly disabled>
                    <span :for="'resultPositive' + index">阳性</span>
                  </div>
                  <div class="form-row-item">
                    <label for="'bloodDrawTime' + index">抽血完成时间 <span style="color: red;">*</span>：</label>
                    <input :id="'bloodDrawTime' + index" v-model="troponin.bloodDrawTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="checktroponinTimes(index)" readonly>
                  </div>

                  <div class="form-row-item">
                    <label for="'reportTime' + index">获得报告时间 <span style="color: red;">*</span>：</label>
                    <input :id="'reportTime' + index" v-model="troponin.reportTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="checktroponinTimes(index)" readonly>
                  </div>
                  <div class="form-row-item">
                    <!-- <button type="button" @click="removeTroponin(index)">删除</button> -->
                  </div>
                </div>

              </div>
              <!-- <button type="button" @click="addTroponin">添加肌钙蛋白</button> -->
            </div>




            <div class="form-row">
              <div class="form-row-item">
                <label>血清肌酐 <span style="color: red;">*</span>:</label>

                <input id="creatinineFalse" v-model="chestPainData.creatinine" type="radio" value="False" readonly disabled>
                <label for="creatinineFalse">否</label>
                <input id="creatinineTrue" v-model="chestPainData.creatinine" type="radio" value="True" readonly disabled>
                <label for="creatinineTrue">是</label>
              </div>
              <div v-if="chestPainData.creatinine === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.creatinineValue" type="number" placeholder="输入值" readonly>
                <span>umol/L</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>D二聚体 <span style="color: red;">*</span>:</label>

                <input id="dDimerFalse" v-model="chestPainData.dDimer" type="radio" value="False" readonly disabled>
                <label for="dDimerFalse">否</label>
                <input id="dDimerTrue" v-model="chestPainData.dDimer" type="radio" value="True" readonly disabled>
                <label for="dDimerTrue">是</label>
              </div>
              <div v-if="chestPainData.dDimer === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.dDimerValue" type="number" placeholder="输入值" readonly>
                <span>ug/L</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>BNP <span style="color:red">*</span>：</label>

                <input id="bnpFalse" v-model="chestPainData.bnp" type="radio" value="False" readonly disabled>
                <label for="bnpFalse">否</label>
                <input id="bnpTrue" v-model="chestPainData.bnp" type="radio" value="True" readonly disabled>
                <label for="bnpTrue">是</label>
              </div>
              <div v-if="chestPainData.bnp === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.bnpValue" type="number" placeholder="输入值" readonly>
                <span>pg/ml</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>NT-proBNP <span style="color: red;">*</span>:</label>

                <input id="ntProBnpFalse" v-model="chestPainData.ntProBnp" type="radio" value="False" readonly disabled>
                <label for="ntProBnpFalse">否</label>
                <input id="ntProBnpTrue" v-model="chestPainData.ntProBnp" type="radio" value="True" readonly disabled>
                <label for="ntProBnpTrue">是</label>
              </div>
              <div v-if="chestPainData.ntProBnp === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.ntProBnpValue" type="number" placeholder="输入值" readonly>
                <span>pg/ml</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>Myo <span style="color:red">*</span>：</label>

                <input id="myoFalse" v-model="chestPainData.myo" type="radio" value="False" readonly disabled>
                <label for="myoFalse">否</label>
                <input id="myoTrue" v-model="chestPainData.myo" type="radio" value="True" readonly disabled>
                <label for="myoTrue">是</label>
              </div>
              <div v-if="chestPainData.myo === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.myoValue" type="number" placeholder="输入值" readonly>
                <input id="myoValueUnitng" v-model="chestPainData.myoValueUnit" type="radio" value="ng/ml" readonly disabled>
                <span for="myoValueUnitng">ng/ml</span>
                <input id="myoValueUnitug" v-model="chestPainData.myoValueUnit" type="radio" value="ug/L" readonly disabled>
                <span for="myoValueUnitug">ug/ml</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>CKMB <span style="color:red">*</span>：</label>

                <input id="ckmbFalse" v-model="chestPainData.ckmb" type="radio" value="False" readonly disabled>
                <label for="ckmbFalse">否</label>
                <input id="ckmbTrue" v-model="chestPainData.ckmb" type="radio" value="True" readonly disabled>
                <label for="ckmbTrue">是</label>
              </div>
              <div v-if="chestPainData.ckmb === 'True'" class="form-row-item">
                <label>数值 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.ckmbValue" type="number" placeholder="输入值" readonly>

                <input id="ckmbValueUnitng" v-model="chestPainData.ckmbValueUnit" type="radio" value="ng/ml" readonly disabled>
                <span for="ckmbValueUnitng">ng/ml</span>
                <input id="ckmbValueUnitug" v-model="chestPainData.ckmbValueUnit" type="radio" value="ug/L" readonly disabled>
                <span for="ckmbValueUnitug">ug/ml</span>
                <input id="ckmbValueUnitu" v-model="chestPainData.ckmbValueUnit" type="radio" value="U/L" readonly disabled>
                <span for="ckmbValueUnitU">U/ml</span>

              </div>
            </div>
          </div>

          <!-- 心内科会诊模块 -->
          <div class="module">
            <h3>心内科会诊</h3>
            <div class="form-row">
              <label>是否会诊 <span style="color: red;">*</span>:</label>
              <input id="consultTrue" v-model="chestPainData.consult" type="radio" value="True" readonly disabled>
              <label for="consultTrue">是</label>
              <input id="consultFalse" v-model="chestPainData.consult" type="radio" value="False" readonly disabled>
              <label for="consultFalse">否</label>
            </div>
            <div v-if="chestPainData.consult==='True'" class="form-row">
              <div class="form-row-item">
                <label>会诊类型 <span style="color: red;">*</span>:</label>
                <input id="consultationType1" v-model="chestPainData.consultationType" type="radio" value="现场会诊" readonly disabled>
                <label for="consultationType1">现场会诊</label>
                <input id="consultationType2" v-model="chestPainData.consultationType" type="radio" value="远程会诊" readonly disabled>
                <label for="consultationType2">远程会诊</label>
              </div>
              <div class="form-row-item">
                <label>通知心外科会诊 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.cardiacSurgeryConsultationFalsetification" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationFalsetification')" readonly>
              </div>
              <div class="form-row-item">
                <label>心外科会诊时间 <span style="color: red;">*</span>:</label>
                <input v-model="chestPainData.cardiacSurgeryConsultationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationTime')" readonly>
              </div>
            </div>
          </div>

          <!-- 诊断模块 -->
          <div class="module">
            <!--              <h3>诊断</h3>-->
            <div class="form-row">
              <label>初步诊断 <span style="color:red">*</span>：</label>
              <input id="diagFalsesisSTEMI" v-model="chestPainData.diagFalsesis" type="radio" value="STEMI" readonly disabled>
              <span for="diagFalsesisSTEMI">STEMI</span>
              <input id="diagFalsesisNSTEMI" v-model="chestPainData.diagFalsesis" type="radio" value="NSTEMI" readonly disabled>
              <span for="diagFalsesisNSTEMI">NSTEMI</span>
              <input id="diagFalsesisUA" v-model="chestPainData.diagFalsesis" type="radio" value="UA" readonly disabled>
              <span for="diagFalsesisUA">UA</span>
              <input id="diagFalsesisAorticDissection" v-model="chestPainData.diagFalsesis" type="radio" value="主动脉夹层" readonly disabled>
              <span for="diagFalsesisAorticDissection">主动脉夹层</span>

              <input id="diagFalsesisPulmonaryEmbolism" v-model="chestPainData.diagFalsesis" type="radio" value="肺动脉栓塞" readonly disabled>
              <span for="diagFalsesisPulmonaryEmbolism">肺动脉栓塞</span>

              <input id="diagFalsesisFalsenACS" v-model="chestPainData.diagFalsesis" type="radio" value="非ACS心源性胸痛" readonly disabled>
              <span for="diagFalsesisFalsenACS">非ACS心源性胸痛</span>

              <input id="diagFalsesisOtherFalsenCardiac" v-model="chestPainData.diagFalsesis" type="radio" value="其它非心源性胸痛" readonly disabled>
              <span for="diagFalsesisOtherFalsenCardiac">其它非心源性胸痛</span>

              <input id="diagFalsesisPending" v-model="chestPainData.diagFalsesis" type="radio" value="待查" readonly disabled>
              <span for="diagFalsesisPending">待查</span>
            </div>
            <div v-if="chestPainData.diagFalsesis === 'STEMI'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>

              <div class="form-row">
                <label>心功能分级 <span style="color:red">*</span>：</label>
                <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)" readonly disabled>
                <span for="classI">I级(FalseCHF)</span>
                <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)" readonly disabled>
                <span for="classII">II级(ralesand/orJVD)</span>
                <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)" readonly disabled>
                <span for="classIII">III级(pulmonaryedema)</span>
                <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)" readonly disabled>
                <span for="classIV">IV级(cardiogenicshock)</span>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>绕行急诊 <span style="color:red">*</span>:</label>
                  <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False" readonly disabled>
                  <label for="emergencyBypassFalse">否</label>
                  <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True" readonly disabled>
                  <label for="emergencyBypassTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>绕行CCU <span style="color:red">*</span>：</label>

                  <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False" readonly disabled>
                  <label for="ccuBypassFalse">否</label>
                  <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True" readonly disabled>
                  <label for="ccuBypassTrue">是</label>
                </div>
              </div>


              <div class="form-row">

                <div class="form-row-item">
                  <label>抗血小板治疗 <span style="color: red;">*</span>:</label>
                  <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False" readonly disabled>
                  <label for="antiplateletFalse">否</label>
                  <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True" readonly disabled>
                  <label for="antiplateletTrue">是</label>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>阿司匹林：</label>
                  <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>氯吡格雷：</label>

                  <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>替格瑞洛：</label>
                  <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>抗凝 <span style="color: red;">*</span>:</label>
                  <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False" readonly disabled>
                  <label for="anticoagulationFalse">否</label>
                  <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True" readonly disabled>
                  <label for="anticoagulationTrue">是</label>
                </div>
              </div>

              <div v-if="chestPainData.anticoagulation==='True'">
                <div class="form-row">
                  <div style="display: flex; align-items: center;">
                    <label>抗凝药物：</label>
                    <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素" readonly disabled>
                    <span for="heparin">普通肝素</span>
                    <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素" readonly disabled>
                    <span for="lmwh">低分子子肝素</span>
                    <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定" readonly disabled>
                    <span for="bivalirudin">比伐卢定</span>
                    <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠" readonly disabled>
                    <span for="fondaparinux">磺达肝癸钠</span>
                  </div>

                  <div class="form-row-item">
                    <label>剂量 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量" readonly>
                  </div>
                </div>

                <div class="form-row">

                  <div class="form-row-item">
                    <label>时间：</label>
                    <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')" readonly>
                  </div>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>他汀治疗 <span style="color: red;">*</span>:</label>
                  <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False" readonly disabled>
                  <label for="statinFalse">否</label>
                  <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True" readonly disabled>
                  <label for="statinTrue">是</label>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>β受体阻滞剂：</label>
                  <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False" readonly disabled>
                  <label for="betaBlockerFalse">否</label>
                  <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True" readonly disabled>
                  <label for="betaBlockerTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <label>再灌注措施 <span style="color: red;">*</span>:</label>
                <div style="display: flex; align-items: center;">
                  <input id="reperfusionFalse" v-model="chestPainData.reperfusion" type="radio" value="False" readonly disabled>
                  <label for="reperfusionFalse">否</label>
                  <input id="reperfusionTrue" v-model="chestPainData.reperfusion" type="radio" value="True" readonly disabled>
                  <label for="reperfusionTrue">是</label>
                </div>
              </div>

              <div v-if="chestPainData.reperfusion === 'True'" class="form-row">
                <label>措施 <span style="color: red;">*</span>:</label>
                <div style="display: flex; align-items: center;">
                  <input id="directPCI" v-model="chestPainData.reperfusionMethod" type="radio" value="直接PCI" readonly disabled>
                  <span for="directPCI">直接PCI</span>
                  <input id="thrombolysis" v-model="chestPainData.reperfusionMethod" type="radio" value="溶栓" readonly disabled>
                  <span for="thrombolysis">溶栓</span>
                  <input id="rescuePCI" v-model="chestPainData.reperfusionMethod" type="radio" value="补救PCI" readonly disabled>
                  <span for="rescuePCI">补救PCI</span>
                  <input id="thrombolysisIntervention" v-model="chestPainData.reperfusionMethod" type="radio" value="溶栓后介入" readonly disabled>
                  <span for="thrombolysisIntervention">溶栓后介入</span>
                  <input id="CABG" v-model="chestPainData.reperfusionMethod" type="radio" value="CABG" readonly disabled>
                  <span for="CABG">CABG</span>
                  <input id="transportPCI" v-model="chestPainData.reperfusionMethod" type="radio" value="转运PCI" readonly disabled>
                  <span for="transportPCI">转运PCI</span>
                  <input id="FalseReperfusion" v-model="chestPainData.reperfusionMethod" type="radio" value="无再灌注措施" readonly disabled>
                  <span for="FalseReperfusion">无再灌注措施</span>
                </div>
              </div>

              <div v-if="repEq('直接PCI')">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>决定医生：</label>
                    <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>决定介入手术时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>启动导管室时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.cathLabStartTime" type="text" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>开始知情同意时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.informedConsentStartTime" type="text" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')" readonly>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>签署知情同意时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.informedConsentSignatureTime" type="text" placeholder="输入时间" readonly>
                  </div>
                </div>
              </div>

              <div v-if="repEq('溶栓')">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>溶栓筛查 <span style="color:red">*</span>：</label>
                    <input id="screeningSuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="合适" readonly disabled>
                    <span for="screeningSuitable">合适</span>
                    <input id="screeningUnsuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="不合适" readonly disabled>
                    <span for="screeningUnsuitable">不合适</span>
                    <input id="screeningFalsetScreened" v-model="chestPainData.thrombolysisScreening" type="radio" value="未筛查" readonly disabled>
                    <span for="screeningFalsetScreened">未筛查</span>
                  </div>
                  <div class="form-row-item">
                    <label>溶栓治疗 <span style="color:red">*</span>：</label>
                    <input id="thrombolysisTrue" v-model="chestPainData.thrombolysisTreatment" type="radio" value="有" readonly disabled>
                    <label for="thrombolysisTrue">有</label>
                    <input id="thrombolysisFalse" v-model="chestPainData.thrombolysisTreatment" type="radio" value="无" readonly disabled>
                    <label for="thrombolysisFalse">无</label>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>直达溶栓场所 <span style="color: red;">*</span>:</label>
                    <input id="transportFalse" v-model="chestPainData.thrombolysisLocation" type="radio" value="False" readonly disabled>
                    <label for="transportFalse">否</label>
                    <input id="transportTrue" v-model="chestPainData.thrombolysisLocation" type="radio" value="True" readonly disabled>
                    <label for="transportTrue">是</label>
                  </div>
                  <div class="form-row-item">
                    <label>溶栓场所 <span style="color:red">*</span>：</label>
                    <select v-model="chestPainData.thrombolysisLocationDetail" disabled>
                      <option value="本院急诊科">本院急诊科</option>
                      <option value="本院心内科">本院心内科</option>
                      <option value="其他科室">其他科室</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>开始知情同意 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidoginformedConsentStartTimerelTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>签署知情同意书 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.informedConsentSignatureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignature')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>开始溶栓时间 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.thrombolysisStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'thrombolysisStartTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>溶栓结束时间 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.thrombolysisEndTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'thrombolysisEndTime')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>溶栓药物 <span style="color:red">*</span>：</label>
                    <input id="firstGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第一代" readonly disabled>
                    <span for="firstGeneration">第一代</span>
                    <input id="secondGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第二代" readonly disabled>
                    <span for="secondGeneration">第二代</span>
                    <input id="thirdGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第三代" readonly disabled>
                    <span for="thirdGeneration">第三代</span>
                  </div>

                  <div class="form-row-item">
                    <label>剂量 <span style="color:red">*</span>：</label>
                    <input id="fullDose" v-model="chestPainData.thrombolysisDose" type="radio" value="全量" readonly disabled>
                    <label for="fullDose">全量</label>
                    <input id="halfDose" v-model="chestPainData.thrombolysisDose" type="radio" value="半量" readonly disabled>
                    <label for="halfDose">半量</label>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>溶栓再通 <span style="color:red">*</span>：</label>
                    <input id="reperfusionFalse" v-model="chestPainData.thrombolysisReperfusion" type="radio" value="False" readonly disabled>
                    <label for="reperfusionFalse">否</label>
                    <input id="reperfusionTrue" v-model="chestPainData.thrombolysisReperfusion" type="radio" value="True" readonly disabled>
                    <label for="reperfusionTrue">是</label>
                  </div>
                </div>
              </div>

              <div v-if="repIn(['补救PCI' , '择期介入'])">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>决定介入手术时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>造影开始时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.angiographyStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'angiographyStartTime')" readonly>
                  </div>
                </div>
              </div>

              <div v-if="repEq('CABG')">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>决定CABG时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.cabgDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cabgDecisionTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>开始CABG时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.cabgStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cabgStartTime')" readonly>
                  </div>
                </div>
              </div>

              <div v-if="repEq('转运PCI')">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>转运PCI <span style="color:red">*</span>：</label>
                    <input id="transferOut" v-model="chestPainData.transportPCI" type="radio" value="转出患者" readonly disabled>
                    <label for="transferOut">转出患者</label>
                    <input id="transferIn" v-model="chestPainData.transportPCI" type="radio" value="接收患者" readonly disabled>
                    <label for="transferIn">接收患者</label>
                  </div>
                </div>
              </div>

              <div v-if="repEq('无再灌注措施')">
                <div class="form-row">
                  <label>无再灌注措施原因：</label>
                  <input id="FalsePain" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="无明确胸痛" readonly disabled>
                  <span for="FalsePain">无明确胸痛，生命体征平稳</span>
                  <input id="missedTime" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="错过再灌注时间" readonly disabled>
                  <span for="missedTime">错过再灌注时间</span>
                  <input id="bleeding" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="出血" readonly disabled>
                  <span for="bleeding">出血</span>
                  <input id="severeFunction" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="严重肝肾功能不全" readonly disabled>
                  <span for="severeFunction">严重肝肾功能不全</span>
                  <input id="ecoFalsemicReasons" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="经济原因" readonly disabled>
                  <span for="ecoFalsemicReasons">经济原因</span>
                  <input id="familyAbandon" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="家庭放弃" readonly disabled>
                  <span for="familyAbandon">家庭放弃</span>
                  <input id="otherReasons" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="其他原因" readonly disabled>
                  <span for="otherReasons">其他原因</span>
                </div>
              </div>


              <div v-if="repIn(['直接PCI','溶栓','补救PCI'])">
                <h3>导管相关信息</h3>
                <div class="form-row">
                  <div class="form-row-item">
                    <label for="catheterLabActivationTime">导管室激活时间<span style="color: red;">*</span>:</label>
                    <input id="catheterLabActivationTime" v-model="catheterData.catheterLabActivationTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'catheterLabActivationTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label for="patientArrivalCatheterLabTime">患者到达导管室时间：</label>
                    <input id="patientArrivalCatheterLabTime" v-model="catheterData.patientArrivalCatheterLabTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'patientArrivalCatheterLabTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label for="interventionist">介入医师姓名：</label>
                    <input id="interventionist" v-model="catheterData.interventionist" type="text"  readonly>
                  </div>
                </div>




                <div class="form-row">
                  <div class="form-row-item">
                    <label for="startPunctureTime">开始穿刺时间：</label>
                    <input id="startPunctureTime" v-model="catheterData.startPunctureTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'startPunctureTime')" readonly>
                  </div>

                  <div class="form-row-item">
                    <label for="angiographyStartTime">造影开始时间：</label>
                    <input id="angiographyStartTime" v-model="catheterData.angiographyStartTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'angiographyStartTime')" readonly>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label for="anticoagulationDrugAdministrationTime">抗凝给药时间：</label>
                    <input id="anticoagulationDrugAdministrationTime" v-model="catheterData.anticoagulationDrugAdministrationTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'anticoagulationDrugAdministrationTime')" readonly>
                  </div>


                  <div class="form-row-item">
                    <label for="anticoagulationDrug">抗凝药物种类：</label>
                    <select id="anticoagulationDrug" v-model="catheterData.anticoagulationDrug" disabled>
                      <option value="">请选择</option>
                      <option value="普通肝素">普通肝素</option>
                      <option value="低分子肝素">低分子肝素</option>
                      <option value="比伐卢定">比伐卢定</option>
                      <option value="磺达肝癸钠">磺达肝癸钠</option>
                    </select>
                  </div>

                  <div class="form-row-item">
                    <label for="anticoagulationDrugDose">抗凝药物剂量：</label>
                    <input id="anticoagulationDrugDose" v-model="catheterData.anticoagulationDrugDose" type="number" readonly>
                  </div>

                  <div class="form-row-item">
                    <label for="anticoagulationDrugUnit">抗凝药物剂量单位：</label>
                    <input id="anticoagulationDrugUnit" v-model="catheterData.anticoagulationDrugUnit" type="text" readonly>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label for="surgeryEndTime">手术结束时间：</label>
                    <input id="surgeryEndTime" v-model="catheterData.surgeryEndTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'surgeryEndTime')" readonly>
                  </div>
                </div>

                <div class="form-row">
                  <label>是否延误：</label>
                  <input id="isDelayedYes" v-model="catheterData.isDelayed" type="radio" value="True" readonly disabled>
                  <label for="isDelayedYes">是</label>
                  <input id="isDelayedNo" v-model="catheterData.isDelayed" type="radio" value="False" readonly disabled>
                  <label for="isDelayedNo">否</label>
                </div>

                <div v-if="catheterData.isDelayed === 'True'" class="form-row">
                  <label for="delayReasons">延误原因：</label>
                  <select id="delayReasons" v-model="catheterData.delayReasons" multiple disabled>
                    <option value="症状不明显延误诊断">症状不明显延误诊断</option>
                    <option value="家属未到场">家属未到场</option>
                    <!-- 可以添加更多原因 -->
                  </select>
                </div>
              </div>



            </div>
            <div v-if="chestPainData.diagFalsesis === 'NSTEMI'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>

              <div class="form-row">
                <label>心功能分级 <span style="color:red">*</span>：</label>
                <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)" readonly disabled>
                <span for="classI">I级(FalseCHF)</span>
                <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)" readonly disabled>
                <span for="classII">II级(ralesand/orJVD)</span>
                <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)" readonly disabled>
                <span for="classIII">III级(pulmonaryedema)</span>
                <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)" readonly disabled>
                <span for="classIV">IV级(cardiogenicshock)</span>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>绕行急诊 <span style="color:red">*</span>:</label>
                  <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False" readonly disabled>
                  <label for="emergencyBypassFalse">否</label>
                  <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True" readonly disabled>
                  <label for="emergencyBypassTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>绕行CCU <span style="color:red">*</span>：</label>
                  <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False" readonly disabled>
                  <label for="ccuBypassFalse">否</label>
                  <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True" readonly disabled>
                  <label for="ccuBypassTrue">是</label>
                </div>
              </div>


              <div class="form-row">

                <div class="form-row-item">
                  <label>抗血小板治疗 <span style="color: red;">*</span>:</label>
                  <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False" readonly disabled>
                  <label for="antiplateletFalse">否</label>
                  <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True" readonly disabled>
                  <label for="antiplateletTrue">是</label>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>阿司匹林：</label>
                  <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>氯吡格雷：</label>
                  <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>替格瑞洛：</label>
                  <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')" readonly>
                </div>
              </div>

              <div class="form-row">
                <label>抗凝 <span style="color: red;">*</span>:</label>
                <div class="form-row-item">
                  <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False" readonly disabled>
                  <label for="anticoagulationFalse">否</label>
                  <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True" readonly disabled>
                  <label for="anticoagulationTrue">是</label>
                </div>
              </div>
              <div v-if="chestPainData.anticoagulation==='True'">
                <div class="form-row">
                  <div style="display: flex; align-items: center;">
                    <label>抗凝药物：</label>
                    <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素" readonly disabled>
                    <span for="heparin">普通肝素</span>
                    <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素" readonly disabled>
                    <span for="lmwh">低分子子肝素</span>
                    <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定" readonly disabled>
                    <span for="bivalirudin">比伐卢定</span>
                    <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠" readonly disabled>
                    <span for="fondaparinux">磺达肝癸钠</span>
                  </div>

                  <div class="form-row-item">
                    <label>剂量 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量" readonly>
                  </div>
                </div>

                <div class="form-row">

                  <div class="form-row-item">
                    <label>时间：</label>
                    <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')" readonly>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <label>他汀治疗 <span style="color: red;">*</span>:</label>
                <div class="form-row-item">
                  <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False" readonly disabled>
                  <label for="statinFalse">否</label>
                  <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True" readonly disabled>
                  <label for="statinTrue">是</label>
                </div>
              </div>

              <div class="form-row">
                <label>β受体阻滞剂：</label>
                <div class="form-row-item">
                  <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False" readonly disabled>
                  <label for="betaBlockerFalse">否</label>
                  <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True" readonly disabled>
                  <label for="betaBlockerTrue">是</label>
                </div>
              </div>

              <div class="form-row" style="display: flex; align-items: center;justify-content: flex-start;flex-wrap: wrap;">
                <label>Grace评估：</label>
                <input id="cardiacArrest" v-model="chestPainData.graceAssessment" type="checkbox" value="心脏骤停" readonly disabled>
                <span for="cardiacArrest">发病后曾出现心脏骤停</span>
                <input id="stSegmentChange" v-model="chestPainData.graceAssessment" type="checkbox" value="ST段改变" readonly disabled>
                <span for="stSegmentChange">心电图ST段改变</span>
                <input id="biomarkerElevated" v-model="chestPainData.graceAssessment" type="checkbox" value="心肌坏死标志物升高" readonly disabled>
                <span for="biomarkerElevated">心肌坏死标志物升高</span>
              </div>

              <div class="form-row">
                <label>Grace极高危条件：</label>
                <input id="acuteHeartFailure" v-model="chestPainData.graceHighRisk" type="checkbox" value="急性心力衰竭" readonly disabled>
                <span for="acuteHeartFailure">急性心力衰竭伴难治性心绞痛和ST段改变</span>
                <input id="lifeThreateningArrhythmia" v-model="chestPainData.graceHighRisk" type="checkbox" value="心律失常" readonly disabled>
                <span for="lifeThreateningArrhythmia">危及生命的心律失常或心脏骤停</span>
                <input id="cardiogenicShock" v-model="chestPainData.graceHighRisk" type="checkbox" value="心源性休克" readonly disabled>
                <span for="cardiogenicShock">心源性休克或血流动力学不稳定</span>
                <input id="miComplications" v-model="chestPainData.graceHighRisk" type="checkbox" value="机械性并发症" readonly disabled>
                <span for="miComplications">心肌梗死机械性并发症</span>
                <input id="dynamicEvolution" v-model="chestPainData.graceHighRisk" type="checkbox" value="ST-T动态演变" readonly disabled>
                <span for="dynamicEvolution">再发ST-T动态演变，尤其是伴有间歇性ST段抬高</span>
              </div>

              <div class="form-row">
                <label>Grace分值：</label>
                <input v-model="chestPainData.graceScore" type="number" placeholder="输入分值" readonly>
              </div>

              <div class="form-row">
                <label>Grace危险分层：</label>
                <input id="veryHighRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="极高危" readonly disabled>
                <span for="veryHighRisk">极高危</span>
                <input id="highRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="高危" readonly disabled>
                <span for="highRisk">高危</span>
                <input id="mediumRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="中危" readonly disabled>
                <span for="mediumRisk">中危</span>
                <input id="lowRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="低危" readonly disabled>
                <span for="lowRisk">低危</span>
              </div>

              <div class="form-row">
                <label>再次危险分层：</label>
                <input id="FalsetDone" v-model="chestPainData.reassessment" type="radio" value="未做" readonly disabled>
                <span for="FalsetDone">未做</span>

                <input id="toSTEMI" v-model="chestPainData.reassessment" type="radio" value="转为STEMI" readonly disabled>
                <span for="toSTEMI">转为STEMI</span>

                <input id="veryHighRiskAgain" v-model="chestPainData.reassessment" type="radio" value="极高危" readonly disabled>
                <span for="veryHighRiskAgain">极高危</span>

                <input id="highRiskAgain" v-model="chestPainData.reassessment" type="radio" value="高危" readonly disabled>
                <span for="highRiskAgain">高危</span>

                <input id="mediumRiskAgain" v-model="chestPainData.reassessment" type="radio" value="中危" readonly disabled>
                <span for="mediumRiskAgain">中危</span>

                <input id="lowRiskAgain" v-model="chestPainData.reassessment" type="radio" value="低危" readonly disabled>
                <span for="lowRiskAgain">低危</span>

              </div>

              <div class="form-row">
                <label>再次危险分层时间：</label>
                <input v-model="chestPainData.reassessmentTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'reassessmentTime')" readonly>
              </div>

              <div class="form-row">
                <label>处理策略 <span style="color: red;">*</span>:</label>

                <input id="conservative" v-model="chestPainData.treatmentStrategy" type="radio" value="保守治疗" readonly disabled>
                <span for="conservative">保守治疗(仅药物治疗)</span>

                <input id="invasive" v-model="chestPainData.treatmentStrategy" type="radio" value="侵入性策略" readonly disabled>
                <span for="invasive">侵入性策略</span>

              </div>
              <div v-if="chestPainData.treatmentStrategy === '侵入性策略'">
                <div class="form-row">
                  <label>侵入性策略 <span style="color: red;">*</span>:</label>

                  <input id="emergencyIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="紧急介入治疗" readonly disabled>
                  <span for="emergencyIntervention">紧急介入治疗</span>

                  <input id="within24Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="24H内介入治疗" readonly disabled>
                  <span for="within24Hours">24H内介入治疗</span>

                  <input id="within72Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="72H内介入治疗" readonly disabled>
                  <span for="within72Hours">72H内介入治疗</span>

                  <input id="scheduledIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="择期介入治疗" readonly disabled>
                  <span for="scheduledIntervention">择期介入治疗</span>

                  <input id="CABG" v-model="chestPainData.invasiveStrategy" type="radio" value="CABG" readonly disabled>
                  <span for="CABG">CABG</span>

                </div>

                <div v-if="chestPainData.invasiveStrategy === '紧急介入治疗'">
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>决定医生：</label>
                      <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名" readonly>
                    </div>
                    <div class="form-row-item">
                      <label>决定介入手术时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')" readonly>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-row-item">
                      <label>启动导管室时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.cathLabStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')" readonly>
                    </div>
                    <div class="form-row-item">
                      <label>开始知情同意时间 <span style="color:red">*</span>：</label>
                      <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')" readonly>
                    </div>

                  </div>
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>签署知情同意时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.informedConsentSignatureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignatureTime')" readonly>
                    </div>
                  </div>

                </div>
                <div v-if="chestPainData.invasiveStrategy === '24H内介入治疗'">
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>实际介入治疗时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.actualInterventionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'actualInterventionTime')" readonly>
                    </div>
                  </div>
                </div>

              </div>



            </div>
            <div v-if="chestPainData.diagFalsesis === 'UA'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>

              <div class="form-row">
                <label>心功能分级 <span style="color:red">*</span>：</label>
                <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)" readonly disabled>
                <span for="classI">I级(FalseCHF)</span>
                <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)" readonly disabled>
                <span for="classII">II级(ralesand/orJVD)</span>
                <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)" readonly disabled>
                <span for="classIII">III级(pulmonaryedema)</span>
                <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)" readonly disabled>
                <span for="classIV">IV级(cardiogenicshock)</span>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>绕行急诊 <span style="color:red">*</span>:</label>
                  <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False" readonly disabled>
                  <label for="emergencyBypassFalse">否</label>
                  <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True" readonly disabled>
                  <label for="emergencyBypassTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>绕行CCU <span style="color:red">*</span>：</label>
                  <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False" readonly disabled>
                  <label for="ccuBypassFalse">否</label>
                  <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True" readonly disabled>
                  <label for="ccuBypassTrue">是</label>
                </div>
              </div>


              <div class="form-row">

                <div class="form-row-item">
                  <label>抗血小板治疗 <span style="color: red;">*</span>:</label>
                  <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False" readonly disabled>
                  <label for="antiplateletFalse">否</label>
                  <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True" readonly disabled>
                  <label for="antiplateletTrue">是</label>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>阿司匹林：</label>
                  <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>氯吡格雷：</label>
                  <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>替格瑞洛：</label>
                  <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg" readonly>

                </div>
                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')" readonly>
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>抗凝 <span style="color: red;">*</span>:</label>
                  <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False" readonly disabled>
                  <label for="anticoagulationFalse">否</label>
                  <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True" readonly disabled>
                  <label for="anticoagulationTrue">是</label>
                </div>
              </div>

              <div v-if="chestPainData.anticoagulation==='True'">
                <div class="form-row">
                  <div style="display: flex; align-items: center;">
                    <label>抗凝药物：</label>
                    <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素" readonly disabled>
                    <span for="heparin">普通肝素</span>
                    <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素" readonly disabled>
                    <span for="lmwh">低分子子肝素</span>
                    <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定" readonly disabled>
                    <span for="bivalirudin">比伐卢定</span>
                    <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠" readonly disabled>
                    <span for="fondaparinux">磺达肝癸钠</span>
                  </div>

                  <div class="form-row-item">
                    <label>剂量 <span style="color:red">*</span>：</label>
                    <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量" readonly>
                  </div>
                </div>

                <div class="form-row">

                  <div class="form-row-item">
                    <label>时间：</label>
                    <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')" readonly>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <label>他汀治疗 <span style="color: red;">*</span>:</label>
                <div class="form-row-item">
                  <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False" readonly disabled>
                  <label for="statinFalse">否</label>
                  <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True" readonly disabled>
                  <label for="statinTrue">是</label>
                </div>
              </div>

              <div class="form-row">
                <label>β受体阻滞剂：</label>
                <div class="form-row-item">
                  <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False" readonly disabled>
                  <label for="betaBlockerFalse">否</label>
                  <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True" readonly disabled>
                  <label for="betaBlockerTrue">是</label>
                </div>
              </div>

              <div class="form-row" style="display: flex; align-items: center;justify-content: flex-start;flex-wrap: wrap;">
                <label>Grace评估：</label>
                <input id="cardiacArrest" v-model="chestPainData.graceAssessment" type="checkbox" value="心脏骤停" readonly disabled>
                <span for="cardiacArrest">发病后曾出现心脏骤停</span>
                <input id="stSegmentChange" v-model="chestPainData.graceAssessment" type="checkbox" value="ST段改变" readonly disabled>
                <span for="stSegmentChange">心电图ST段改变</span>
                <input id="biomarkerElevated" v-model="chestPainData.graceAssessment" type="checkbox" value="心肌坏死标志物升高" readonly disabled>
                <span for="biomarkerElevated">心肌坏死标志物升高</span>
              </div>

              <div class="form-row">
                <label>Grace极高危条件：</label>
                <input id="acuteHeartFailure" v-model="chestPainData.graceHighRisk" type="checkbox" value="急性心力衰竭" readonly disabled>
                <span for="acuteHeartFailure">急性心力衰竭伴难治性心绞痛和ST段改变</span>
                <input id="lifeThreateningArrhythmia" v-model="chestPainData.graceHighRisk" type="checkbox" value="心律失常" readonly disabled>
                <span for="lifeThreateningArrhythmia">危及生命的心律失常或心脏骤停</span>
                <input id="cardiogenicShock" v-model="chestPainData.graceHighRisk" type="checkbox" value="心源性休克" readonly disabled>
                <span for="cardiogenicShock">心源性休克或血流动力学不稳定</span>
                <input id="miComplications" v-model="chestPainData.graceHighRisk" type="checkbox" value="机械性并发症" readonly disabled>
                <span for="miComplications">心肌梗死机械性并发症</span>
                <input id="dynamicEvolution" v-model="chestPainData.graceHighRisk" type="checkbox" value="ST-T动态演变" readonly disabled>
                <span for="dynamicEvolution">再发ST-T动态演变，尤其是伴有间歇性ST段抬高</span>
              </div>

              <div class="form-row">
                <label>Grace分值：</label>
                <input v-model="chestPainData.graceScore" type="number" placeholder="输入分值" readonly>
              </div>

              <div class="form-row">
                <label>Grace危险分层：</label>
                <input id="veryHighRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="极高危" readonly disabled>
                <label for="veryHighRisk">极高危</label>
                <input id="highRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="高危" readonly disabled>
                <label for="highRisk">高危</label>
                <input id="mediumRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="中危" readonly disabled>
                <label for="mediumRisk">中危</label>
                <input id="lowRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="低危" readonly disabled>
                <label for="lowRisk">低危</label>
              </div>

              <div class="form-row">
                <label>再次危险分层：</label>
                <input id="FalsetDone" v-model="chestPainData.reassessment" type="radio" value="未做" readonly disabled>
                <label for="FalsetDone">未做</label>

                <input id="toSTEMI" v-model="chestPainData.reassessment" type="radio" value="转为STEMI" readonly disabled>
                <label for="toSTEMI">转为STEMI</label>

                <input id="veryHighRiskAgain" v-model="chestPainData.reassessment" type="radio" value="极高危" readonly disabled>
                <label for="veryHighRiskAgain">极高危</label>

                <input id="highRiskAgain" v-model="chestPainData.reassessment" type="radio" value="高危" readonly disabled>
                <label for="highRiskAgain">高危</label>

                <input id="mediumRiskAgain" v-model="chestPainData.reassessment" type="radio" value="中危" readonly disabled>
                <label for="mediumRiskAgain">中危</label>

                <input id="lowRiskAgain" v-model="chestPainData.reassessment" type="radio" value="低危" readonly disabled>
                <label for="lowRiskAgain">低危</label>

              </div>

              <div class="form-row">
                <label>再次危险分层时间：</label>
                <input v-model="chestPainData.reassessmentTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'reassessmentTime')" readonly>
              </div>

              <div class="form-row">
                <label>处理策略 <span style="color: red;">*</span>:</label>

                <input id="conservative" v-model="chestPainData.treatmentStrategy" type="radio" value="保守治疗" readonly disabled>
                <label for="conservative">保守治疗(仅药物治疗)</label>

                <input id="invasive" v-model="chestPainData.treatmentStrategy" type="radio" value="侵入性策略" readonly disabled>
                <label for="invasive">侵入性策略</label>

              </div>
              <div v-if="chestPainData.treatmentStrategy === '侵入性策略'">
                <div class="form-row">
                  <label>侵入性策略 <span style="color: red;">*</span>:</label>

                  <input id="emergencyIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="紧急介入治疗" readonly disabled>
                  <label for="emergencyIntervention">紧急介入治疗</label>

                  <input id="within24Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="24H内介入治疗" readonly disabled>
                  <label for="within24Hours">24H内介入治疗</label>

                  <input id="within72Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="72H内介入治疗" readonly disabled>
                  <label for="within72Hours">72H内介入治疗</label>

                  <input id="scheduledIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="择期介入治疗" readonly disabled>
                  <label for="scheduledIntervention">择期介入治疗</label>

                  <input id="CABG" v-model="chestPainData.invasiveStrategy" type="radio" value="CABG" readonly disabled>
                  <label for="CABG">CABG</label>

                </div>

                <div v-if="chestPainData.invasiveStrategy === '紧急介入治疗'">
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>决定医生：</label>
                      <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名" readonly>
                    </div>
                    <div class="form-row-item">
                      <label>决定介入手术时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')" readonly>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-row-item">
                      <label>启动导管室时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.cathLabStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')" readonly>
                    </div>
                    <div class="form-row-item">
                      <label>开始知情同意 <span style="color:red">*</span>时间：</label>
                      <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')" readonly>
                    </div>

                  </div>
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>签署知情同意时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.informedConsentSignatureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignatureTime')" readonly>
                    </div>
                  </div>

                </div>
                <div v-if="chestPainData.invasiveStrategy === '24H内介入治疗'">
                  <div class="form-row">
                    <div class="form-row-item">
                      <label>实际介入治疗时间 <span style="color: red;">*</span>:</label>
                      <input v-model="chestPainData.actualInterventionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'actualInterventionTime')" readonly>
                    </div>
                  </div>
                </div>

              </div>



            </div>
            <div v-if="chestPainData.diagFalsesis === '主动脉夹层'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.aorticDissectionDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aorticDissectionDiagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>影像学检查 <span style="color:red">*</span>：</label>
                <input id="ctEmergency" v-model="chestPainData.aorticDissectionImaging" type="radio" value="急诊CT" readonly disabled>
                <label for="ctEmergency">急诊CT</label>
                <input id="ultrasound" v-model="chestPainData.aorticDissectionImaging" type="radio" value="彩超" readonly disabled>
                <label for="ultrasound">彩超</label>
                <input id="mri" v-model="chestPainData.aorticDissectionImaging" type="radio" value="MRI" readonly disabled>
                <label for="mri">MRI</label>
                <input id="FalsetDone" v-model="chestPainData.aorticDissectionImaging" type="radio" value="未做" readonly disabled>
                <label for="FalsetDone">未做</label>
              </div>
              <div v-if="chestPainData.aorticDissectionImaging==='急诊CT'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>通知CT室时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ctFalsetificationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctFalsetificationTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>CT室完成准备 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ctPreparationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctPreparationTime')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>CT扫描开始时间：</label>
                    <input v-model="chestPainData.ctScanStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctScanStartTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>CT报告时间：</label>
                    <input v-model="chestPainData.ctReportTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctReportTime')" readonly>
                  </div>
                </div>
              </div>
              <div v-if="chestPainData.aorticDissectionImaging==='彩超'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>通知彩超室时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ultrasoundFalsetificationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundFalsetificationTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>彩超检查时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ultrasoundExamTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundExamTime')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>彩超出结果时间：</label>
                    <input v-model="chestPainData.ultrasoundResultTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundResultTime')" readonly>
                  </div>

                </div>

              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>通知心外科会诊：</label>
                  <input v-model="chestPainData.cardiacSurgeryConsultationFalsetification" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationFalsetification')" readonly>
                </div>
                <div class="form-row-item">
                  <label>心外科会诊时间：</label>
                  <input v-model="chestPainData.cardiacSurgeryConsultationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationTime')" readonly>
                </div>
              </div>


              <div class="form-row">
                <label>夹层类型 <span style="color:red">*</span>：</label>
                <input id="typeA" v-model="chestPainData.aorticDissectionType" type="radio" value="A型" readonly disabled>
                <label for="typeA">A型</label>
                <input id="typeB" v-model="chestPainData.aorticDissectionType" type="radio" value="B型" readonly disabled>
                <label for="typeB">B型</label>
              </div>
              <div class="form-row">
                <label>治疗策略 <span style="color:red">*</span>：</label>
                <input id="emergencyIntervention" v-model="chestPainData.treatmentStrategy" type="radio" value="紧急介入治疗" readonly disabled>
                <span for="emergencyIntervention">紧急介入治疗</span>
                <input id="scheduledIntervention" v-model="chestPainData.treatmentStrategy" type="radio" value="择期介入治疗" readonly disabled>
                <span for="scheduledIntervention">择期介入治疗</span>
                <input id="conservativeTreatment" v-model="chestPainData.treatmentStrategy" type="radio" value="保守治疗" readonly disabled>
                <span for="conservativeTreatment">保守治疗</span>
                <input id="surgical" v-model="chestPainData.treatmentStrategy" type="radio" value="外科手术" readonly disabled>
                <span for="surgical">外科手术</span>
                <input id="other" v-model="chestPainData.treatmentStrategy" type="radio" value="其它（介入失败转为手术）" readonly disabled>
                <span for="other">其它（介入失败转为手术）</span>
              </div>
            </div>

            <div v-if="chestPainData.diagFalsesis === '肺动脉栓塞'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.pulmonaryEmbolismDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'pulmonaryEmbolismDiagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>影像学检查 <span style="color:red">*</span>：</label>
                <input id="ctEmergencyPE" v-model="chestPainData.pulmonaryEmbolismImaging" type="radio" value="急诊CT" readonly disabled>
                <label for="ctEmergencyPE">急诊CT</label>
                <input id="FalsetDonePE" v-model="chestPainData.pulmonaryEmbolismImaging" type="radio" value="未做" readonly disabled>
                <label for="FalsetDonePE">未做</label>
              </div>
              <div v-if="chestPainData.pulmonaryEmbolismImaging==='急诊CT'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>通知CT室时间 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ctFalsetificationTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctFalsetificationTimePE')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>CT室完成准备 <span style="color: red;">*</span>:</label>
                    <input v-model="chestPainData.ctPreparationTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctPreparationTimePE')" readonly>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>CT扫描开始时间：</label>
                    <input v-model="chestPainData.ctScanStartTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctScanStartTimePE')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>CT报告时间：</label>
                    <input v-model="chestPainData.ctReportTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctReportTimePE')" readonly>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <label>治疗信息 <span style="color: red;">*</span>:</label>
                <input id="highRisk" v-model="chestPainData.riskStratification" type="radio" value="高危" readonly disabled>
                <label for="highRisk">高危</label>
                <input id="mediumRisk" v-model="chestPainData.riskStratification" type="radio" value="中危" readonly disabled>
                <label for="mediumRisk">中危</label>
                <input id="lowRisk" v-model="chestPainData.riskStratification" type="radio" value="低危" readonly disabled>
                <label for="lowRisk">低危</label>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>开始抗凝治疗时间：</label>
                  <input v-model="chestPainData.anticoagulationStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulationStartTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>院内溶栓治疗 <span style="color: red;">*</span>:</label>
                <input id="thrombolysisScreeningSuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="合适" readonly disabled>
                <label for="thrombolysisScreeningSuitable">合适</label>
                <input id="thrombolysisScreeningUnsuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="不合适" readonly disabled>
                <label for="thrombolysisScreeningUnsuitable">不合适</label>
                <input id="thrombolysisScreeningFalsetScreened" v-model="chestPainData.thrombolysisScreening" type="radio" value="未筛查" readonly disabled>
                <label for="thrombolysisScreeningFalsetScreened">未筛查</label>
              </div>
              <div class="form-row">
                <label>溶栓治疗 <span style="color:red">*</span>：</label>
                <input id="thrombolysisTrue" v-model="chestPainData.thrombolysisTreatment" type="radio" value="有" readonly disabled>
                <label for="thrombolysisTrue">有</label>
                <input id="thrombolysisFalse" v-model="chestPainData.thrombolysisTreatment" type="radio" value="无" readonly disabled>
                <label for="thrombolysisFalse">无</label>
              </div>
            </div>

            <div v-if="chestPainData.diagFalsesis === '非ACS心源性胸痛'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.FalsenACSChestPainDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'FalsenACSChestPainDiagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>非ACS心源性胸痛类型 <span style="color: red;">*</span>:</label>
                <input id="arrhythmia" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心律失常" readonly disabled>
                <span for="arrhythmia">心律失常</span>
                <input id="dilatedCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="扩张性心肌病" readonly disabled>
                <span for="dilatedCardiomyopathy">扩张性心肌病</span>
                <input id="ischemicCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="缺血性心肌病" readonly disabled>
                <span for="ischemicCardiomyopathy">缺血性心肌病</span>
                <input id="myocarditis" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心肌炎" readonly disabled>
                <span for="myocarditis">心肌炎</span>
                <input id="hypertrophicCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="肥厚型心肌病" readonly disabled>
                <span for="hypertrophicCardiomyopathy">肥厚型心肌病</span>
                <input id="coronaryHeartDisease" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="冠心病" readonly disabled>
                <span for="coronaryHeartDisease">冠心病</span>
                <input id="valvularHeartDisease" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="瓣膜性心肌病" readonly disabled>
                <span for="valvularHeartDisease">瓣膜性心肌病</span>
                <input id="oldMyocardialInfarction" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="陈旧性心肌梗死" readonly disabled>
                <span for="oldMyocardialInfarction">陈旧性心肌梗死</span>
                <input id="angina" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心绞痛" readonly disabled>
                <span for="angina">心绞痛</span>
                <input id="palpitation" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心悸" readonly disabled>
                <span for="palpitation">心悸</span>
                <input id="af" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房颤" readonly disabled>
                <span for="af">房颤</span>
                <input id="hypertension" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="高血压" readonly disabled>
                <span for="hypertension">高血压</span>
                <input id="heartFailure" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心衰" readonly disabled>
                <span for="heartFailure">心衰</span>
                <input id="aflutter" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房扑" readonly disabled>
                <span for="aflutter">房扑</span>
                <input id="ventricularPremature" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="室早" readonly disabled>
                <span for="ventricularPremature">室早</span>
                <input id="atrialPremature" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房早" readonly disabled>
                <span for="atrialPremature">房早</span>
                <input id="supraventricularTachycardia" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="室上速" readonly disabled>
                <span for="supraventricularTachycardia">室上速</span>
                <input id="pericarditis" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心包炎" readonly disabled>
                <span for="pericarditis">心包炎</span>
                <input id="myocardialBridge" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心肌桥" readonly disabled>
                <span for="myocardialBridge">心肌桥</span>
              </div>
              <div class="form-row">
                <label>处理措施 <span style="color: red;">*</span>:</label>
                <input id="hospitalization" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="收治入院" readonly disabled>
                <label for="hospitalization">收治入院</label>
                <input id="emergencyObservation" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="急诊留观" readonly disabled>
                <label for="emergencyObservation">急诊留观</label>
                <input id="outpatientTreatment" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="门诊治疗" readonly disabled>
                <label for="outpatientTreatment">门诊治疗</label>
                <input id="followup" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="随访" readonly disabled>
                <label for="followup">随访</label>
              </div>
              <!--                <div class="form-row">
                                <label>患者情况备注：</label>
                                <input type="text" v-model="chestPainData.FalsenACSChestPainRemarks" placeholder="输入备注信息" / readonly>
                              </div>-->
            </div>

            <div v-if="chestPainData.diagFalsesis === '其它非心源性胸痛'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间  <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'otherFalsenCardiacChestPainDiagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>其它非心源性胸痛类型 <span style="color: red;">*</span>:</label>
                <input id="respiratorySystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="呼吸系统病" readonly disabled>
                <label for="respiratorySystem">呼吸系统病</label>
                <input id="digestiveSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="消化系统病" readonly disabled>
                <label for="digestiveSystem">消化系统病</label>
                <input id="nervousSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="神经系统病" readonly disabled>
                <label for="nervousSystem">神经系统病</label>
                <input id="mentalSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="精神系统病" readonly disabled>
                <label for="mentalSystem">精神系统病</label>
                <input id="musculoskeletal" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="肌肉骨骼病" readonly disabled>
                <label for="musculoskeletal">肌肉骨骼病</label>
                <input id="skinSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="皮肤系统病" readonly disabled>
                <label for="skinSystem">皮肤系统病</label>
                <input id="other" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="其他" readonly disabled>
                <label for="other">其他</label>
              </div>
              <div class="form-row">
                <label>处理措施 <span style="color: red;">*</span>:</label>
                <input id="hospitalizatioFalsether" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="收治入院" readonly disabled>
                <label for="hospitalizatioFalsether">收治入院</label>
                <input id="emergencyObservatioFalsether" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="急诊留观" readonly disabled>
                <label for="emergencyObservatioFalsether">急诊留观</label>
                <input id="outpatientTreatmentOther" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="门诊治疗" readonly disabled>
                <label for="outpatientTreatmentOther">门诊治疗</label>
                <input id="followup" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="随访" readonly disabled>
                <label for="followup">随访</label>
              </div>
              <!--                <div class="form-row">
                                <label>患者情况备注：</label>
                                <input type="text" v-model="chestPainData.otherFalsenCardiacChestPainRemarks" placeholder="输入备注信息" / readonly>
                              </div>-->
            </div>

            <div v-if="chestPainData.diagFalsesis === '待查'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>初步诊断时间 <span style="color:red">*</span>：</label>
                  <input v-model="chestPainData.pendingDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'pendingDiagFalsesisTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>医生：</label>
                  <input v-model="chestPainData.initialDiagnosisDoctor" type="text" placeholder="输入医生姓名" readonly>
                </div>
              </div>
              <div class="form-row">
                <label>处理措施 <span style="color: red;">*</span>:</label>
                <input id="hospitalizationPending" v-model="chestPainData.pendingTreatment" type="radio" value="收治入院" readonly disabled>
                <label for="hospitalizationPending">收治入院</label>
                <input id="emergencyObservationPending" v-model="chestPainData.pendingTreatment" type="radio" value="急诊留观" readonly disabled>
                <label for="emergencyObservationPending">急诊留观</label>
                <input id="outpatientTreatmentPending" v-model="chestPainData.pendingTreatment" type="radio" value="门诊治疗" readonly disabled>
                <label for="outpatientTreatmentPending">门诊治疗</label>
                <input id="followup" v-model="chestPainData.pendingTreatment" type="radio" value="随访" readonly disabled>
                <label for="followup">随访</label>
              </div>
            </div>

            <div class="form-row">
              <label>患者情况备注：</label>
              <textarea id="patientRemarks" v-model="chestPainData.remarks" placeholder="无备注"  readonly></textarea>
            </div>
          </div>
        </div>

        <div v-if="currentModule === 'outcome'" class="form-section">
          <h3>转归</h3>
          <div class="module">
            <h3>出院基本信息</h3>
            <div class="form-row">
              <label for="dischargeDiagFalsesis">出院诊断 <span style="color:red">*</span>：</label>
              <input id="dischargeDiagFalsesisSTEMI" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="STEMI" readonly disabled>
              <span for="dischargeDiagFalsesisSTEMI">STEMI</span>
              <input id="dischargeDiagFalsesisNSTEMI" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="NSTEMI" readonly disabled>
              <span for="dischargeDiagFalsesisNSTEMI">NSTEMI</span>
              <input id="dischargeDiagFalsesisUA" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="UA" readonly disabled>
              <span for="dischargeDiagFalsesisUA">UA</span>
              <input id="dischargeDiagFalsesisAorticDissection" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="主动脉夹层" readonly disabled>
              <span for="dischargeDiagFalsesisAorticDissection">主动脉夹层</span>

              <input id="dischargeDiagFalsesisPulmonaryEmbolism" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="肺动脉栓塞" readonly disabled>
              <span for="dischargeDiagFalsesisPulmonaryEmbolism">肺动脉栓塞</span>

              <input id="dischargeDiagFalsesisFalsenACS" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="非ACS心源性胸痛" readonly disabled>
              <span for="dischargeDiagFalsesisFalsenACS">非ACS心源性胸痛</span>

              <input id="dischargeDiagFalsesisOtherFalsenCardiac" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="其它非心源性胸痛" readonly disabled>
              <span for="dischargeDiagFalsesisOtherFalsenCardiac">其它非心源性胸痛</span>

              <input id="dischargeDiagFalsesisPending" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="待查" readonly disabled>
              <span for="dischargeDiagFalsesisPending">待查</span>
            </div>
            <div ></div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="confirmedDate">确诊时间 <span style="color:red">*</span>：</label>
                <input id="confirmedDate" v-model="outcomeData.confirmedDate" type="datetime-local" :max="maxDateTime" @change="validateTime(chestPainData, 'confirmedDate')" readonly>
              </div>
            </div>

            <div v-if="['STEMI', 'NSTEMI', 'UA'].includes(outcomeData.dischargeDiagFalsesis)">
              <div class="form-row">
                <div class="form-row-item">
                  <label>院内新发心力衰竭 <span style="color: red;">*</span>:</label>
                  <input id="heartFailureFalse" v-model="outcomeData.newHeartFailure" type="radio" value="False" readonly disabled>
                  <label for="heartFailureFalse">否</label>
                  <input id="heartFailureTrue" v-model="outcomeData.newHeartFailure" type="radio" value="True" readonly disabled>
                  <label for="heartFailureTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <label>合并症 <span style="color: red;">*</span>:</label>
                <input id="shock" v-model="outcomeData.comorbidities" type="radio" value="休克" readonly disabled>
                <label for="shock">休克</label>
                <input id="mechanicalComplication" v-model="outcomeData.comorbidities" type="radio" value="机械性并发症" readonly disabled>
                <label for="mechanicalComplication">机械性并发症</label>
                <input id="infection" v-model="outcomeData.comorbidities" type="radio" value="感染" readonly disabled>
                <label for="infection">感染</label>
                <input id="recurrentMyocardialInfarction" v-model="outcomeData.comorbidities" type="radio" value="再发心梗" readonly disabled>
                <label for="recurrentMyocardialInfarction">再发心梗</label>
                <input id="thrombosis" v-model="outcomeData.comorbidities" type="radio" value="血栓" readonly disabled>
                <label for="thrombosis">血栓</label>
                <input id="stroke" v-model="outcomeData.comorbidities" type="radio" value="卒中" readonly disabled>
                <label for="stroke">卒中</label>
                <input id="tia" v-model="outcomeData.comorbidities" type="radio" value="TIA" readonly disabled>
                <label for="tia">TIA</label>
                <input id="bleeding" v-model="outcomeData.comorbidities" type="radio" value="出血" readonly disabled>
                <label for="bleeding">出血</label>
                <input id="respiratoryFailure" v-model="outcomeData.comorbidities" type="radio" value="呼吸衰竭" readonly disabled>
                <label for="respiratoryFailure">呼吸衰竭</label>
                <input id="renalFailure" v-model="outcomeData.comorbidities" type="radio" value="肾衰竭" readonly disabled>
                <label for="renalFailure">肾衰竭</label>
                <input id="death" v-model="outcomeData.comorbidities" type="radio" value="死亡" readonly disabled>
                <label for="death">死亡</label>
                <input id="Falsene" v-model="outcomeData.comorbidities" type="radio" value="无" readonly disabled>
                <label for="Falsene">无</label>
              </div>
              <label>危险因素：</label>
              <div class="form-row">
                <div class="form-row-item">
                  <label>高血压 <span style="color: red;">*</span>:</label>
                  <input id="hypertensionFalse" v-model="outcomeData.hypertension" type="radio" value="False" readonly disabled>
                  <label for="hypertensionFalse">否</label>
                  <input id="hypertensionTrue" v-model="outcomeData.hypertension" type="radio" value="True" readonly disabled>
                  <label for="hypertensionTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>高脂血症 <span style="color: red;">*</span>:</label>
                  <input id="hyperlipidemiaFalse" v-model="outcomeData.hyperlipidemia" type="radio" value="False" readonly disabled>
                  <label for="hyperlipidemiaFalse">否</label>
                  <input id="hyperlipidemiaTrue" v-model="outcomeData.hyperlipidemia" type="radio" value="True" readonly disabled>
                  <label for="hyperlipidemiaTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>糖尿病 <span style="color: red;">*</span>:</label>
                  <input id="diabetesFalse" v-model="outcomeData.diabetes" type="radio" value="False" readonly disabled>
                  <label for="diabetesFalse">否</label>
                  <input id="diabetesTrue" v-model="outcomeData.diabetes" type="radio" value="True" readonly disabled>
                  <label for="diabetesTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>吸烟 <span style="color: red;">*</span>:</label>
                  <input id="smokingFalse" v-model="outcomeData.smoking" type="radio" value="False" readonly disabled>
                  <label for="smokingFalse">否</label>
                  <input id="smokingTrue" v-model="outcomeData.smoking" type="radio" value="True" readonly disabled>
                  <label for="smokingTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>肥胖 <span style="color: red;">*</span>:</label>
                  <input id="obesityFalse" v-model="outcomeData.obesity" type="radio" value="False" readonly disabled>
                  <label for="obesityFalse">否</label>
                  <input id="obesityTrue" v-model="outcomeData.obesity" type="radio" value="True" readonly disabled>
                  <label for="obesityTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>早发CVD家族史 <span style="color: red;">*</span>:</label>
                  <input id="familyHistoryFalse" v-model="outcomeData.familyHistory" type="radio" value="False" readonly disabled>
                  <label for="familyHistoryFalse">否</label>
                  <input id="familyHistoryTrue" v-model="outcomeData.familyHistory" type="radio" value="True" readonly disabled>
                  <label for="familyHistoryTrue">是</label>
                </div>
              </div>



              <label>合并疾病：</label>
              <div class="form-row">
                <div class="form-row-item">
                  <label>冠心病 <span style="color: red;">*</span>:</label>
                  <input id="coronaryHeartDiseaseFalse" v-model="outcomeData.coronaryHeartDisease" type="radio" value="False" readonly disabled>
                  <label for="coronaryHeartDiseaseFalse">否</label>
                  <input id="coronaryHeartDiseaseTrue" v-model="outcomeData.coronaryHeartDisease" type="radio" value="True" readonly disabled>
                  <label for="coronaryHeartDiseaseTrue">是</label>
                </div>
                <div v-if="outcomeData.coronaryHeartDisease === 'True'" class="form-row-item">
                  <label>血运重建史 <span style="color: red;">*</span>:</label>
                  <input id="revascularizationHistoryFalse" v-model="outcomeData.revascularizationHistory" type="radio" value="False" readonly disabled>
                  <label for="revascularizationHistoryFalse">否</label>
                  <input id="revascularizationHistoryTrue" v-model="outcomeData.revascularizationHistory" type="radio" value="True" readonly disabled>
                  <label for="revascularizationHistoryTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>心房颤动 <span style="color: red;">*</span>:</label>
                  <input id="afFalse" v-model="outcomeData.af" type="radio" value="False" readonly disabled>
                  <label for="afFalse">否</label>
                  <input id="afTrue" v-model="outcomeData.af" type="radio" value="True" readonly disabled>
                  <label for="afTrue">是</label>
                </div>
                <div v-if="outcomeData.af === 'True'" class="form-row-item">
                  <input id="paroxysmal" v-model="outcomeData.afType" type="radio" value="阵发性" readonly disabled>
                  <label for="paroxysmal">阵发性</label>
                  <input id="persistent" v-model="outcomeData.afType" type="radio" value="持续性" readonly disabled>
                  <label for="persistent">持续性</label>
                  <input id="longStanding" v-model="outcomeData.afType" type="radio" value="长程持续性" readonly disabled>
                  <label for="longStanding">长程持续性</label>
                  <input id="permanent" v-model="outcomeData.afType" type="radio" value="永久性" readonly disabled>
                  <label for="permanent">永久性</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>慢性心力衰竭 <span style="color: red;">*</span>:</label>
                  <input id="chronicHeartFailureFalse" v-model="outcomeData.chronicHeartFailure" type="radio" value="False" readonly disabled>
                  <label for="chronicHeartFailureFalse">否</label>
                  <input id="chronicHeartFailureTrue" v-model="outcomeData.chronicHeartFailure" type="radio" value="True" readonly disabled>
                  <label for="chronicHeartFailureTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>心脏瓣膜病 <span style="color: red;">*</span>:</label>
                  <input id="heartValveDiseaseFalse" v-model="outcomeData.heartValveDisease" type="radio" value="False" readonly disabled>
                  <label for="heartValveDiseaseFalse">否</label>
                  <input id="heartValveDiseaseTrue" v-model="outcomeData.heartValveDisease" type="radio" value="True" readonly disabled>
                  <label for="heartValveDiseaseTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>脑血管疾病 <span style="color: red;">*</span>:</label>
                  <input id="cerebrovascularDiseaseFalse" v-model="outcomeData.cerebrovascularDisease" type="radio" value="False" readonly disabled>
                  <label for="cerebrovascularDiseaseFalse">否</label>
                  <input id="cerebrovascularDiseaseTrue" v-model="outcomeData.cerebrovascularDisease" type="radio" value="True" readonly disabled>
                  <label for="cerebrovascularDiseaseTrue">是</label>
                </div>
                <div v-if="outcomeData.cerebrovascularDisease === 'True'" class="form-row-item">
                  <label>脑血管疾病描述 <span style="color: red;">*</span>:</label>
                  <input id="cerebrovascularDiseaseType1" v-model="outcomeData.cerebrovascularDiseaseType" type="radio" value="缺血性" readonly disabled>
                  <label for="cerebrovascularDiseaseType1">缺血性</label>
                  <input id="cerebrovascularDiseaseType2" v-model="outcomeData.cerebrovascularDiseaseType" type="radio" value="出血性" readonly disabled>
                  <label for="cerebrovascularDiseaseType2">出血性</label>
                </div>

              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>外周动脉疾病 <span style="color: red;">*</span>:</label>
                  <input id="peripheralArteryDiseaseFalse" v-model="outcomeData.peripheralArteryDisease" type="radio" value="False" readonly disabled>
                  <label for="peripheralArteryDiseaseFalse">否</label>
                  <input id="peripheralArteryDiseaseTrue" v-model="outcomeData.peripheralArteryDisease" type="radio" value="True" readonly disabled>
                  <label for="peripheralArteryDiseaseTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>主动脉瘤 <span style="color: red;">*</span>:</label>
                  <input id="aorticAneurysmFalse" v-model="outcomeData.aorticAneurysm" type="radio" value="False" readonly disabled>
                  <label for="aorticAneurysmFalse">否</label>
                  <input id="aorticAneurysmTrue" v-model="outcomeData.aorticAneurysm" type="radio" value="True" readonly disabled>
                  <label for="aorticAneurysmTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>COPD <span style="color: red;">*</span>:</label>
                  <input id="copdFalse" v-model="outcomeData.copd" type="radio" value="False" readonly disabled>
                  <label for="copdFalse">否</label>
                  <input id="copdTrue" v-model="outcomeData.copd" type="radio" value="True" readonly disabled>
                  <label for="copdTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>慢性肾病 <span style="color: red;">*</span>:</label>
                  <input id="chronicKidneyDiseaseFalse" v-model="outcomeData.chronicKidneyDisease" type="radio" value="False" readonly disabled>
                  <label for="chronicKidneyDiseaseFalse">否</label>
                  <input id="chronicKidneyDiseaseTrue" v-model="outcomeData.chronicKidneyDisease" type="radio" value="True" readonly disabled>
                  <label for="chronicKidneyDiseaseTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>贫血 <span style="color: red;">*</span>:</label>
                  <input id="anemiaFalse" v-model="outcomeData.anemia" type="radio" value="False" readonly disabled>
                  <label for="anemiaFalse">否</label>
                  <input id="anemiaTrue" v-model="outcomeData.anemia" type="radio" value="True" readonly disabled>
                  <label for="anemiaTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>消化性溃疡 <span style="color: red;">*</span>:</label>
                  <<input id="pepticUlcerFalse" v-model="outcomeData.pepticUlcer" type="radio" value="False" readonly disabled>
                  <label for="pepticUlcerFalse">否</label>
                  <input id="pepticUlcerTrue" v-model="outcomeData.pepticUlcer" type="radio" value="True" readonly disabled>
                  <label for="pepticUlcerTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>甲状腺功能异常 <span style="color: red;">*</span>:</label>
                  <input id="thyroidFunctionAbFalsermalFalse" v-model="outcomeData.thyroidFunctionAbFalsermal" type="radio" value="False" readonly disabled>
                  <label for="thyroidFunctionAbFalsermalFalse">否</label>
                  <input id="thyroidFunctionAbFalsermalTrue" v-model="outcomeData.thyroidFunctionAbFalsermal" type="radio" value="True" readonly disabled>
                  <label for="thyroidFunctionAbFalsermalTrue">是</label>
                </div>
              </div>
              <label>检查结果：</label>
              <div class="form-row">
                <div class="form-row-item">
                  <label>72h内肌钙蛋白 <span style="color: red;">*</span>:</label>
                  <input id="troponin72hFalse" v-model="outcomeData.troponin72hChecked" type="radio" value="False" readonly disabled>
                  <label for="troponin72hFalse">否</label>
                  <input id="troponin72hTrue" v-model="outcomeData.troponin72hChecked" type="radio" value="True" readonly disabled>
                  <label for="troponin72hTrue">是</label>
                </div>
                <div class="form-row-item">
                  <input v-if="outcomeData.troponin72hChecked === 'True'" v-model="outcomeData.troponinMaxValue" type="text" placeholder="72h内肌钙蛋白最高值" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>脑钠肽 <span style="color: red;">*</span>:</label>
                  <input id="bnp" v-model="outcomeData.bnp" type="radio" value="BNP"  readonly disabled>
                  <span for="bnp">BNP</span>
                  <input id="ntProBNP" v-model="outcomeData.bnp" type="radio" value="NT-proBNP"  readonly disabled><!--<input type="radio" id="ntProBNP" value="NT-proBNP" v-model="outcomeData.ntProBNP" / readonly disabled>-->
                  <span for="ntProBNP">NT-proBNP</span>
                </div>
                <div class="form-row-item">
                  <input v-model="outcomeData.bnpMaxValue" type="text" placeholder="最高值pg/ml" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>总胆固醇(TC) <span style="color: red;">*</span>:</label>
                  <input id="tcFalse" v-model="outcomeData.tc" type="radio" value="False" readonly disabled>
                  <label for="tcFalse">否</label>
                  <input id="tcTrue" v-model="outcomeData.tc" type="radio" value="True" readonly disabled>
                  <label for="tcTrue">是</label>

                </div>
                <div class="form-row-item">
                  <input v-if="outcomeData.tc === 'True'" v-model="outcomeData.tcValue" type="text" placeholder="数值" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>甘油三酯(TG) <span style="color: red;">*</span>:</label>
                  <input id="tgFalse" v-model="outcomeData.tg" type="radio" value="False"  readonly disabled>
                  <label for="tgFalse">否</label>
                  <input id="tgTrue" v-model="outcomeData.tg" type="radio" value="True" readonly disabled>
                  <label for="tgTrue">是</label>

                </div>
                <div class="form-row-item">
                  <input v-if="outcomeData.tg === 'True'" v-model="outcomeData.tgValue" type="text" placeholder="数值" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>高密度脂蛋白(HDL-C) <span style="color: red;">*</span>:</label>
                  <input id="hdlFalse" v-model="outcomeData.hdl" type="radio" value="False" readonly disabled>
                  <label for="hdlFalse">否</label>
                  <input id="hdlTrue" v-model="outcomeData.hdl" type="radio" value="True" readonly disabled>
                  <label for="hdlTrue">是</label>

                </div>
                <div class="form-row-item">
                  <input v-if="outcomeData.hdl === 'True'" v-model="outcomeData.hdlValue" type="text" placeholder="数值" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>低密度脂蛋白(LDL-C) <span style="color: red;">*</span>:</label>
                  <input id="ldlFalse" v-model="outcomeData.ldl" type="radio" value="False" readonly disabled>
                  <label for="ldlFalse">否</label>
                  <input id="ldlTrue" v-model="outcomeData.ldl" type="radio" value="True" readonly disabled>
                  <label for="ldlTrue">是</label>

                </div>
                <div class="form-row-item">
                  <input v-if="outcomeData.ldl === 'True'" v-model="outcomeData.ldlValue" type="text" placeholder="数值" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>超声心动图 <span style="color: red;">*</span>:</label>
                  <input id="echoFalse" v-model="outcomeData.echo" type="radio" value="False" readonly disabled>
                  <label for="echoFalse">否</label>
                  <input id="echoTrue" v-model="outcomeData.echo" type="radio" value="True" readonly disabled>
                  <label for="echoTrue">是</label>
                </div>

              </div>
              <div v-if="outcomeData.echo === 'True'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>室壁瘤 <span style="color: red;">*</span>:</label>
                    <input id="wallAneurysmFalse" v-model="outcomeData.wallAneurysm" type="radio" value="False" readonly disabled>
                    <label for="wallAneurysmFalse">否</label>
                    <input id="wallAneurysmTrue" v-model="outcomeData.wallAneurysm" type="radio" value="True" readonly disabled>
                    <label for="wallAneurysmTrue">是</label>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>局部室壁活动异常 <span style="color: red;">*</span>:</label>
                    <input id="wallMotionAbFalsermalityFalse" v-model="outcomeData.wallMotionAbFalsermality" type="radio" value="False" readonly disabled>
                    <label for="wallMotionAbFalsermalityFalse">否</label>
                    <input id="wallMotionAbFalsermalityTrue" v-model="outcomeData.wallMotionAbFalsermality" type="radio" value="True" readonly disabled>
                    <label for="wallMotionAbFalsermalityTrue">是</label>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="outcomeData.dischargeDiagFalsesis === '非ACS心源性胸痛'">
              <div class="form-row">
                <label>非ACS心源性胸痛 <span style="color: red;">*</span>:</label>
                <input id="arrhythmia" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心律失常" readonly disabled>
                <label for="arrhythmia">心律失常</label>
                <input id="dilatedCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="扩张性心肌病" readonly disabled>
                <label for="dilatedCardiomyopathy">扩张性心肌病</label>
                <input id="ischemicCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="缺血性心肌病" readonly disabled>
                <label for="ischemicCardiomyopathy">缺血性心肌病</label>
                <input id="myocarditis" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心肌炎" readonly disabled>
                <label for="myocarditis">心肌炎</label>
                <input id="hypertrophicCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="肥厚型心肌病" readonly disabled>
                <label for="hypertrophicCardiomyopathy">肥厚型心肌病</label>
                <input id="coronaryHeartDiseaseFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="冠心病" readonly disabled>
                <label for="coronaryHeartDiseaseFalsenACS">冠心病</label>
                <input id="valvularCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="瓣膜性心肌病" readonly disabled>
                <label for="valvularCardiomyopathy">瓣膜性心肌病</label>
              </div>
              <div class="form-row">
                <label ></label>

                <input id="oldMyocardialInfarction" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="陈旧性心肌梗死" readonly disabled>
                <label for="oldMyocardialInfarction">陈旧性心肌梗死</label>
                <input id="angina" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心绞痛" readonly disabled>
                <label for="angina">心绞痛</label>
                <input id="palpitation" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心悸" readonly disabled>
                <label for="palpitation">心悸</label>
                <input id="af" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房颤" readonly disabled>
                <label for="af">房颤</label>
                <input id="hypertensionFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="高血压" readonly disabled>
                <label for="hypertensionFalsenACS">高血压</label>
                <input id="heartFailureFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心衰" readonly disabled>
                <label for="heartFailureFalsenACS">心衰</label>
                <input id="aflutter" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房扑" readonly disabled>
                <label for="aflutter">房扑</label>

              </div>
              <div class="form-row">
                <label ></label>
                <input id="ventricularPremature" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="室早" readonly disabled>
                <label for="ventricularPremature">室早</label>
                <input id="atrialPremature" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房早" readonly disabled>
                <label for="atrialPremature">房早</label>
                <input id="supraventricularTachycardia" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="室上速" readonly disabled>
                <label for="supraventricularTachycardia">室上速</label>
                <input id="pericarditis" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心包炎" readonly disabled>
                <label for="pericarditis">心包炎</label>
                <input id="myocardialBridge" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心肌桥" readonly disabled>
                <label for="myocardialBridge">心肌桥</label>
              </div>
            </div>

            <div v-if="outcomeData.dischargeDiagFalsesis === '其它非心源性胸痛'">
              <div class="form-row">
                <label>其它非心源性胸痛类型<span style="color: red;">*</span>:</label>
                <input id="respiratoryDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="呼吸系统病" readonly disabled>
                <label for="respiratoryDisease">呼吸系统病</label>
                <input id="digestiveDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="消化系统病" readonly disabled>
                <label for="digestiveDisease">消化系统病</label>
                <input id="nervousSystem" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="神经系统病" readonly disabled>
                <label for="nervousSystem">神经系统病</label>
                <input id="mentalSystem" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="精神系统病" readonly disabled>
                <label for="mentalSystem">精神系统病</label>
                <input id="musculoskeletal" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="肌肉骨骼病" readonly disabled>
                <label for="musculoskeletal">肌肉骨骼病</label>
                <input id="skinDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="皮肤系统病" readonly disabled>
                <label for="skinDisease">皮肤系统病</label>
                <input id="otherType" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="其他" readonly disabled>
                <label for="otherType">其他</label>
              </div>
            </div>

          </div>

          <!-- 住院期间用药模块 -->
          <div class="module">
            <h3>住院期间用药</h3>
            <div class="form-row">
              <label>降糖药物 <span style="color: red;">*</span>:</label>
              <input id="antidiabeticTrue" v-model="outcomeData.antidiabetic" type="radio" value="True" readonly disabled>
              <label for="antidiabeticTrue">是</label>
              <input id="antidiabeticFalse" v-model="outcomeData.antidiabetic" type="radio" value="False" readonly disabled>
              <label for="antidiabeticFalse">否</label>
            </div>
            <div class="form-row">
              <label for="oralAnticoagulants">口服抗凝药物 <span style="color: red;">*</span>:</label>
              <input id="antidiabeticTrue" v-model="outcomeData.oralAnticoagulants" type="radio" value="True" readonly disabled>
              <label for="antidiabeticTrue">是</label>
              <input id="antidiabeticFalse" v-model="outcomeData.oralAnticoagulants" type="radio" value="False" readonly disabled>
              <label for="antidiabeticFalse">否</label>

            </div>
            <div class="form-row">
              <label for="lipidRegulating">调脂药物 <span style="color: red;">*</span>:</label>
              <input id="antidiabeticTrue" v-model="outcomeData.lipidRegulating" type="radio" value="True" readonly disabled>
              <label for="antidiabeticTrue">是</label>
              <input id="antidiabeticFalse" v-model="outcomeData.lipidRegulating" type="radio" value="False" readonly disabled>
              <label for="antidiabeticFalse">否</label>

            </div>
          </div>

          <!-- 出院信息模块 -->
          <div class="module">
            <h3>出院信息</h3>
            <div class="form-row">
              <div class="form-row-item">
                <label for="hospitalDays">住院天数 <span style="color:red">*</span>：</label>
                <input id="hospitalDays" v-model="outcomeData.hospitalDays" type="number" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="totalCost">总费用 <span style="color:red">*</span>：</label>
                <input id="totalCost" v-model="outcomeData.totalCost" type="number" readonly>
              </div>
            </div>
            <div class="form-row">
              <label>出院还是转归 <span style="color: red;">*</span>:</label>
              <input id="discharge" v-model="outcomeData.dischargeStatus" type="radio" value="出院"  readonly disabled>
              <label for="discharge">出院</label>
              <input id="transferHospital" v-model="outcomeData.dischargeStatus" type="radio" value="转送其他医院"  readonly disabled>
              <label for="transferHospital">转送其他医院</label>
              <input id="transferDepartment" v-model="outcomeData.dischargeStatus" type="radio" value="转送其它科室"  readonly disabled>
              <label for="transferDepartment">转送其它科室</label>
              <input id="death" v-model="outcomeData.dischargeStatus" type="radio" value="死亡" readonly disabled>
              <label for="death">死亡</label>
            </div>


            <div v-if="outcomeData.dischargeStatus === '出院'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>出院时间 <span style="color:red">*</span>：</label>
                  <input v-model="outcomeData.dischargeTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'dischargeTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>治疗结果 <span style="color:red">*</span>：</label>
                  <input id="cure" v-model="outcomeData.treatmentOutcome" type="radio" value="治愈" readonly disabled>
                  <label for="cure">治愈</label>
                  <input id="improvement" v-model="outcomeData.treatmentOutcome" type="radio" value="好转" readonly disabled>
                  <label for="improvement">好转</label>
                  <input id="selfDischarge" v-model="outcomeData.treatmentOutcome" type="radio" value="自动离院" readonly disabled>
                  <label for="selfDischarge">自动离院</label>
                  <input id="otherReason" v-model="outcomeData.treatmentOutcome" type="radio" value="其他原因离院" readonly disabled>
                  <label for="otherReason">其他原因离院</label>
                </div>
              </div>

              <label>出院带药：</label>

              <div class="form-row">
                <div class="form-row-item">
                  <label>抗血小板药物：</label>
                  <input id="antiplateletFalse" v-model="outcomeData.antiplateletMedication" type="radio" value="False" readonly disabled>
                  <label for="antiplateletFalse">否</label>
                  <input id="antiplateletTrue" v-model="outcomeData.antiplateletMedication" type="radio" value="True" readonly disabled>
                  <label for="antiplateletTrue">是</label>
                </div>
              </div>

              <div v-if="outcomeData.antiplateletMedication === 'True'" class="form-row">
                <div class="form-row-item">
                  <label>药物名称</label>
                  <input v-model="outcomeData.antiplateletDrugName" type="text" placeholder="药物名称" readonly>

                </div>
                <div class="form-row-item">
                  <label>剂量 <span style="color:red">*</span></label>
                  <input v-model="outcomeData.antiplateletDosage" type="text" placeholder="mg" readonly>

                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>ACEI/ARB：</label>
                  <input id="aceARBFalse" v-model="outcomeData.aceArbMedication" type="radio" value="False" readonly disabled>
                  <label for="aceARBFalse">否</label>
                  <input id="aceARBTrue" v-model="outcomeData.aceArbMedication" type="radio" value="True" readonly disabled>
                  <label for="aceARBTrue">是</label>

                </div>

              </div>
              <div v-if="outcomeData.aceArbMedication === 'True'" class="form-row">
                <div class="form-row-item">
                  <label>药物名称</label>
                  <input v-model="outcomeData.aceArbDrugName" type="text" placeholder="药物名称" readonly>
                </div>
                <div class="form-row-item">
                  <label>剂量 <span style="color:red">*</span></label>
                  <input v-model="outcomeData.aceArbDosage" type="text" placeholder="mg" readonly>

                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>调脂药物：</label>
                  <input id="lipidRegulatingFalse" v-model="outcomeData.lipidRegulatingMedication" type="radio" value="False" readonly disabled>
                  <label for="lipidRegulatingFalse">否</label>
                  <input id="lipidRegulatingTrue" v-model="outcomeData.lipidRegulatingMedication" type="radio" value="True" readonly disabled>
                  <label for="lipidRegulatingTrue">是</label>
                </div>

              </div>
              <div v-if="outcomeData.lipidRegulatingMedication === 'True'" class="form-row">
                <div class="form-row-item">
                  <label>药物名称</label>
                  <input v-model="outcomeData.lipidRegulatingDrugName" type="text" placeholder="药物名称" readonly>
                </div>
                <div class="form-row-item">
                  <label>剂量 <span style="color:red">*</span></label>
                  <input v-model="outcomeData.lipidRegulatingDosage" type="text" placeholder="mg" readonly>

                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>β受体阻滞剂：</label>
                  <input id="betaBlockerFalse" v-model="outcomeData.betaBlockerMedication" type="radio" value="False" readonly disabled>
                  <label for="betaBlockerFalse">否</label>
                  <input id="betaBlockerTrue" v-model="outcomeData.betaBlockerMedication" type="radio" value="True" readonly disabled>
                  <label for="betaBlockerTrue">是</label>
                </div>

              </div>
              <div v-if="outcomeData.betaBlockerMedication === 'True'" class="form-row">
                <div class="form-row-item">
                  <label>药物名称</label>
                  <input v-model="outcomeData.betaBlockerDrugName" type="text" placeholder="药物名称" readonly>
                </div>
                <div class="form-row-item">
                  <label>剂量 <span style="color:red">*</span></label>
                  <input v-model="outcomeData.betaBlockerDosage" type="text" placeholder="mg" readonly>

                </div>
              </div>
              <!--            <div class="form-row">
                            <div class="form-row-item">
                              <label>患者情况说明：</label>
                              <input type="text" v-model="outcomeData.patientStatusDescription" placeholder="输入说明" / readonly>
                            </div>
                          </div>-->
            </div>

            <div v-if="outcomeData.dischargeStatus === '转送其他医院'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>离开本院大门时间 <span style="color:red">*</span>：</label>
                  <input v-model="outcomeData.departureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'departureTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>网络医院：</label>
                  <input id="networkHospitalFalse" v-model="outcomeData.networkHospital" type="radio" value="False" readonly disabled>
                  <label for="networkHospitalFalse">否</label>
                  <input id="networkHospitalTrue" v-model="outcomeData.networkHospital" type="radio" value="True" readonly disabled>
                  <label for="networkHospitalTrue">是</label>

                </div>
                <div v-if="outcomeData.networkHospital === 'True'" class="form-row-item">
                  <label>医院名称 <span style="color:red">*</span>：</label>
                  <input v-model="outcomeData.networkHospitalName" type="text" placeholder="医院名称" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>转运PCI <span style="color:red">*</span>：</label>
                  <input id="transferPciFalse" v-model="outcomeData.transferPci" type="radio" value="False" readonly disabled>
                  <label for="transferPciFalse">否</label>
                  <input id="transferPciTrue" v-model="outcomeData.transferPci" type="radio" value="True" readonly disabled>
                  <label for="transferPciTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>直达导管室：</label>
                  <input id="directCathLabFalse" v-model="outcomeData.directCathLab" type="radio" value="False" readonly disabled>
                  <label for="directCathLabFalse">否</label>
                  <input id="directCathLabTrue" v-model="outcomeData.directCathLab" type="radio" value="True" readonly disabled>
                  <label for="directCathLabTrue">是</label>

                </div>
                <div v-if="outcomeData.directCathLab === 'True'" class="form-row-item">
                  <label>实际介入手术开始时间</label>
                  <input v-model="outcomeData.actualInterventionStartTime" type="datetime-local" placeholder="实际介入手术开始时间" :max="maxDateTime" @change="validateTime(outcomeData, 'actualInterventionStartTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>远程心电图传输 <span style="color:red">*</span>：</label>
                  <input id="ecgTransmissionTrue" v-model="outcomeData.ecgTransmission" type="radio" value="传输心电图至协作单位" readonly disabled>
                  <label for="ecgTransmissionTrue">传输心电图至协作单位(转出患者时)</label>
                  <input id="ecgTransmissionFalse" v-model="outcomeData.ecgTransmission" type="radio" value="无" readonly disabled>
                  <label for="ecgTransmissionFalse">无</label>
                </div>
              </div>
              <div v-if="outcomeData.ecgTransmission === '传输心电图至协作单位'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>传输心电图至协作单位时间：</label>
                    <input v-model="outcomeData.ecgTransmissionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'ecgTransmissionTime')" readonly>
                  </div>
                  <div class="form-row-item">
                    <label>传输方式：</label>
                    <input v-model="outcomeData.ecgTransmissionMethod" type="text" placeholder="输入传输方式" readonly>
                  </div>
                </div>

              </div>
              <!--            <div class="form-row">
                            <div class="form-row-item">
                              <label>患者情况说明：</label>
                              <input type="text" v-model="outcomeData.patientStatusDescriptionTransfer" placeholder="输入说明" / readonly>
                            </div>
                          </div>-->
            </div>

            <div v-if="outcomeData.dischargeStatus === '转送其它科室'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>转科时间：</label>
                  <input v-model="outcomeData.transferTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'transferTime')" readonly>
                </div>
                <div class="form-row-item">
                  <label>接诊科室：</label>
                  <input v-model="outcomeData.admittingDepartment" type="text" placeholder="输入科室" readonly>
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>转科原因描述：</label>
                  <input v-model="outcomeData.transferReason" type="text" placeholder="输入原因" readonly>
                </div>
              </div><!--
            <div class="form-row">
              <div class="form-row-item">
                <label>患者情况说明：</label>
                <input type="text" v-model="outcomeData.patientStatusDescriptionTransferDepartment" placeholder="输入说明" / readonly>
              </div>
            </div>-->
            </div>

            <div v-if="outcomeData.dischargeStatus === '死亡'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>死亡时间 <span style="color:red">*</span>：</label>
                  <input v-model="outcomeData.deathTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'deathTime')" readonly>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>死亡原因 <span style="color:red">*</span>：</label>
                  <input id="cardiacCause" v-model="outcomeData.deathCause" type="radio" value="心源性" readonly disabled>
                  <label for="cardiacCause">心源性</label>
                  <input id="FalsenCardiacCause" v-model="outcomeData.deathCause" type="radio" value="非心源性" readonly disabled>
                  <label for="FalsenCardiacCause">非心源性</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>描述：</label>
                  <input v-model="outcomeData.deathDescription" type="text" placeholder="输入描述" readonly>
                </div>
              </div>
            </div>

            <div class="form-row">
              <label for="patientRemarks">患者情况备注：</label>
              <textarea id="patientRemarks" v-model="outcomeData.remarks" placeholder="无备注"  readonly></textarea>
            </div>
          </div>
        </div>

        <!--   <button type="submit">提交</button>     -->
      </form>
    </div>

    <div class="submit-bar" >
      <button class="primary-btn" @click="view_postdata(patientId)">补填转归</button>
    </div>
      <div v-if="footerCheckTime" class="submit-time">
      上次提交时间：{{formatDateTime(footerCheckTime)}}
    </div>
  </div>



</template>
<script>

import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
import TimelineModal from './TimelineModal.vue'
export default {
  components: { TimelineModal },
  data() {
    return {
      isBatchSubmitting: false,
      footerCheckTime: '',

      currentModule: 'emergency', // 默认显示急救模块
      showTimeline: false, // 控制弹窗显示
      maxDateTime: '',
      timelineEvents: [],
      // 基本信息
      formData: {
        name: '',
        gender: '',
        idType: '',
        idNumber: '',
        age: '',
        dob: '',
        ethnicity: '',
        phone: '',
        occupation: '',
        education: '',
        maritalStatus: '',
        height: '',
        weight: '',
        caseDate: '',

      },
      emergencyData: {
        inpatientId: '',
        outpatientId: '',
        onsetTime: '',
        hasSpecificOnsetTime: '',
        specificOnsetTime: '',
        address: '',
        detailedAddress: '',
        insuranceType: '',
        insuranceNumber: '',
        isCriticalIllnessInsurance: '',
        symptomslevel: '',
        symptoms: [],
        source: '',
        consciousness: '',
        respiration: '',
        pulse: '',
        heartRate: '',
        bloodPressure: '',
        temperature: '',
        remarks: '',


        // 120
        transportUnit: '', // 存储出车单位
        callTime: '',
        arrivalTime: '',
        directTransfer: '', // 存储转送信息
        firstContactTime: '',
        firstDoctorTime: '',
        medicalStaff: '',

        // 转院
        transferType: '', // 存储转院类型
        hospitalName: '',
        // firstContactTime: '',
        transferInTime: '',
        decisionTransferTime: '',
        transferOutTime: '',
        arrivalAtHospitalTime: '',
        inHospitalConsultationTime: '',
        // medicalStaff: '',

        // 自行来院
        // arrivalAtHospitalTime: '',
        // firstContactTime: '',
        // firstDoctorTime: '',
        // medicalStaff: '',

        // 院内发病
        department: '',
        // firstContactTime: '',
        bedDoctorContactTime: '',
        leaveDepartmentTime: ''
        // medicalStaff: ''


      },
      chestPainData: {
        ecg: '',
        ecgRemote: '',
        troponin: '',
        creatinine: '',
        dDimer: '',
        bnp: '',
        ntProBnp: '',
        myo: '',
        ckmb: '',
        consult: '',
        diagFalsesis: '',
        treatment: '',
        remarks: '',

        // 心电图
        ecgs: [
          { time: '', file: null
      , transmissionMode: ''
    } // 初始化一个心电图对象
        ],
        ecgDiagFalsesisTime: '', // 心电图诊断时间

        // 肌钙蛋白
        troponins: [
          { type: '', unit: '', result: '', bloodDrawTime: '', reportTime: '' } // 初始化一个肌钙蛋白对象
        ],

        // 实验室检查
        // creatinine: '',
        creatinineValue: null,
        // dDimer: '',
        dDimerValue: null,
        // bnp: '',
        bnpValue: null,
        // ntProBnp: '',
        ntProBnpValue: null,
        // myo: '',
        myoValue: null,
        myoValueUnit: 'ng/ml',
        // ckmb: '',
        ckmbValue: null,
        ckmbValueUnit: 'ng/ml',

        // STEMI
        diagFalsesisTime: '',
        doctorName: '',
        initialDiagnosisDoctor:'',
        heartFunctionClass: '',
        emergencyBypass: '',
        ccuBypass: '',
        antiplateletTreatment: '',
        aspirinDose: null,
        aspirinTime: '',
        clopidogrelDose: null,
        clopidogrelTime: '',
        ticagrelorDose: null,
        ticagrelorTime: '',
        anticoagulation: '',
        anticoagulantDrugs: '',
        anticoagulantDose: '',
        anticoagulantTime: '',
        statinTreatment: '',
        betaBlocker: '',
        graceAssessment: [],
        graceHighRisk: [],
        graceScore: null,
        graceRiskStratification: '',
        reassessment: '',
        reassessmentTime: '',
        treatmentStrategy: '',
        invasiveStrategy: '',

        // 紧急介入治疗
        decidingDoctor: '',
        interventionDecisionTime: '',
        cathLabStartTime: '',
        informedConsentStartTime: '',
        informedConsentSignatureTime: '',
        // 24H介入
        actualInterventionTime: '', // 新增属性

        // STEMI
        reperfusion: '',
        reperfusionMethod: '',
        // decidingDoctor: '',
        // interventionDecisionTime: '',
        // cathLabStartTime: '',
        // informedConsentStartTime: '',
        // informedConsentSignatureTime: '',
        thrombolysisScreening: '',
        thrombolysisTreatment: '',
        thrombolysisLocation: '',
        thrombolysisLocationDetail: '',
        thrombolysisStartTime: '',
        thrombolysisEndTime: '',
        thrombolysisDrug: [],
        thrombolysisDose: [],
        thrombolysisReperfusion: '',
        angiographyStartTime: '',
        cabgDecisionTime: '',
        cabgStartTime: '',
        transportPCI: '',
        FalseReperfusionReason: [],


        aorticDissectionDiagFalsesisTime: '',
        aorticDissectionDoctor: '',
        aorticDissectionImaging: '',
        ctFalsetificationTime: '',
        ctPreparationTime: '',
        ctScanStartTime: '',
        ctReportTime: '',
        aorticDissectionType: [],
        // treatmentStrategy: [],
        pulmonaryEmbolismDiagFalsesisTime: '',
        pulmonaryEmbolismDoctor: '',
        pulmonaryEmbolismImaging: [],
        ctFalsetificationTimePE: '',
        ctPreparationTimePE: '',
        ctScanStartTimePE: '',
        ctReportTimePE: '',
        riskStratification: [],
        anticoagulationStartTime: '',
        // thrombolysisScreening: [],
        // thrombolysisTreatment: [],
        FalsenACSChestPainDiagFalsesisTime: '',
        FalsenACSChestPainDoctor: '',
        FalsenACSChestPainType: [],
        FalsenACSChestPainTreatment: [],
        FalsenACSChestPainRemarks: '',
        otherFalsenCardiacChestPainDiagFalsesisTime: '',
        otherFalsenCardiacChestPainDoctor: '',
        otherFalsenCardiacChestPainType: [],
        otherFalsenCardiacChestPainTreatment: '',
        otherFalsenCardiacChestPainRemarks: '',
        pendingDiagFalsesisTime: '',
        pendingDoctor: '',
        pendingTreatment: '',
        ultrasoundFalsetificationTime: '',
        ultrasoundExamTime: '',
        ultrasoundResultTime: '',
        cardiacSurgeryConsultationFalsetification: '',
        cardiacSurgeryConsultationTime: ''

      },
    catheterData: {
      catheterLabActivationTime: '',
      patientArrivalCatheterLabTime: '',
      interventionist: '',
      startPunctureTime: '',
      angiographyStartTime: '',
      anticoagulationDrugAdministrationTime: '',
      anticoagulationDrug: '',
      anticoagulationDrugDose: null,
      anticoagulationDrugUnit: '',
      surgeryEndTime: '',
      isDelayed: 'False',
      delayReasons: ''
    },

      outcomeData: {
        dischargeDiagFalsesis: '',
        newHeartFailure: '',
        comorbidities: '',
        hypertension: '',
        hyperlipidemia: '',
        diabetes: '',
        smoking: '',
        obesity: '',
        familyHistory: '',
        coronaryHeartDisease: '',
        revascularizationHistory: '',
        af: '',
        afType: '',
        chronicHeartFailure: '',
        heartValveDisease: '',
        cerebrovascularDisease: '',
        peripheralArteryDisease: '',
        aorticAneurysm: '',
        copd: '',
        chronicKidneyDisease: '',
        anemia: '',
        pepticUlcer: '',
        thyroidFunctionAbFalsermal: '',
        troponin72hChecked:'',
        troponin72h: 'False',
        troponinMaxValue: 'null',
        bnp: '',
        ntProBNP: '',
        bnpMaxValue: '',
        tc: '',
        tcValue: '',
        tg: '',
        tgValue: '',
        hdl: '',
        hdlValue: '',
        ldl: '',
        ldlValue: '',
        echo: '',
        lvefValue: '',
        wallAneurysm: '',
        wallMotionAbFalsermality: '',
        FalsenACSChestPainType: '',
        otherFalsenCardiacChestPainType: '',


        confirmedDate: '',
        covid: '',
        antidiabetic: '',
        oralAnticoagulants: '',
        lipidRegulating: '',
        hospitalDays: '',
        totalCost: '',
        dischargeStatus: '',
        remarks: '',


        // dischargeStatus: '',
        dischargeTime: '',
        treatmentOutcome: '',
        antiplateletMedication: '',
        antiplateletDrugName: '',
        antiplateletDosage: '',
        antiplateletUnit: '',
        aceArbMedication: '',
        aceArbDrugName: '',
        aceArbDosage: '',
        aceArbUnit: '',
        lipidRegulatingMedication: '',
        lipidRegulatingDrugName: '',
        lipidRegulatingDosage: '',
        lipidRegulatingUnit: '',
        betaBlockerMedication: '',
        betaBlockerDrugName: '',
        betaBlockerDosage: '',
        betaBlockerUnit: '',
        patientStatusDescription: '',
        departureTime: '',
        networkHospital: '',
        networkHospitalName: '',
        transferPci: '',
        directCathLab: '',
        actualInterventionStartTime: '',
        ecgTransmission: '',
        ecgTransmissionTime: '',
        ecgTransmissionMethod: '',
        patientStatusDescriptionTransfer: '',
        transferTime: '',
        admittingDepartment: '',
        transferReason: '',
        patientStatusDescriptionTransferDepartment: '',
        deathTime: '',
        deathCause: '',
        deathDescription: ''
      }
    }
  },
  computed: {

    patientId: {
      get() {
        return this.$store.state.user.patientId
      },
      set(val) {
        this.$store.dispatch('user/Set_PatientID', val)
      }
    },
    isCriticalInsuranceRadio:{
      get(){
        const x = this.emergencyData.isCriticalIllnessInsurance;
        return String(x).toLowerCase() ==='true' || String(x) === '1';
      },
      set(v){
        if(!this.emergencyData) this.emergencyData={};
        this.emergencyData.isCriticalIllnessInsurance = v? 'True' :'False';
      }
    },
  },
  async created() {
    // 优先使用路由 query 中的 id（防止刷新页面后 Vuex 中的 patientId 丢失）
    const queryId = this.$route && this.$route.query && this.$route.query.id
    if (queryId) {
      this.patientId = Number(queryId)
    } else if (!this.patientId) {
      console.error('未获取到患者ID，无法加载胸痛申报数据')
      this.showMessage('未获取到患者ID，请从患者列表重新进入本页面', 'error')
      return
    }
    await this.getPatientData()
    this.getTimeLine()
    // this.fetchImages(imageType, patientId, imageDate);
  },
  methods: {
    async fetchAndRenderCastemi() {
      try {
        const res = await axios.post(API_URL + 'catheter/castemi', null, {
          params: { patientId: this.patientId },
          headers: { 'Content-Type': 'application/json', 'Authorization': this.token }
        });
        if (res?.data?.code !== 200) return;

        const list = Array.isArray(res.data.data)
          ? res.data.data.filter(x => x && x.patientId === this.patientId)
          : [];
        const latest = this.pickLatestRecord(list);
        if (!latest) return;

        // 统一时间格式
        const F = (v) => this.formatDateTime(v ?? null);

        // 只做回显赋值；等号左边保持你页面的 v-model 命名（如已有不同可改左边）
        if (!this.catheterData) this.catheterData = {};
        this.catheterData.catheterLabActivationTime         = F(latest.catheterLabActivationTime ?? latest.catheterActivationTime);
        this.catheterData.patientArrivalCatheterLabTime     = F(latest.patientArrivalCatheterLabTime ?? latest.arrivalCatheterLabTime);
        this.catheterData.interventionist                   = latest.interventionist ?? latest.operator ?? this.catheterData.interventionist ?? '';
        this.catheterData.startPunctureTime                 = F(latest.startPunctureTime);
        this.catheterData.angiographyStartTime              = F(latest.angiographyStartTime);
        this.catheterData.anticoagulationDrugAdministrationTime = F(latest.anticoagulationDrugAdministrationTime ?? latest.heparinGivenTime);
        this.catheterData.anticoagulationDrug               = latest.anticoagulationDrug ?? latest.heparinDrug ?? '';
        this.catheterData.anticoagulationDrugDose           = latest.anticoagulationDrugDose ?? latest.heparinDose ?? '';
        this.catheterData.anticoagulationDrugUnit           = latest.anticoagulationDrugUnit ?? latest.heparinUnit ?? '';
        this.catheterData.surgeryEndTime                    = F(latest.surgeryEndTime ?? latest.procedureEndTime);
        this.catheterData.isDelayed                         = this.convertBooleanToString(!!(latest.isDelayed ?? latest.delayFlag));
        this.catheterData.delayReasons                      = (latest.delayReasons ?? latest.delayReason ?? '').toString().trim();
      } catch (e) {
        console.warn('fetchAndRenderCastemi error:', e);
      }
    },
    repEq(target) {
      const v = (this.chestPainData?.reperfusionMethod ?? '').toString().trim().toLowerCase();
      const t = target.toString().trim().toLowerCase();
      const alias = {
        '直接pci': '直接pci',
        '溶栓': '溶栓',
        '补救pci': '补救pci',
        '择期介入': '择期介入',
        '溶栓后介入': '溶栓后介入',
        'cabg': 'cabg',
        '转运pci': '转运pci',
        '无再灌注措施': '无再灌注措施'
      };
      const nv = alias[v] ?? v;
      const nt = alias[t] ?? t;
      return nv === nt;
    },
    repIn(list) {
      return list.some(x => this.repEq(x));
    },

    // 统一必填校验（排除“基本信息”模块；仅校验当前可见的带红星项）
    isElementVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle ? getComputedStyle(el) : el.style;
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      // 若祖先存在 display:none，也不可见
      let node = el;
      while (node) {
        const s = window.getComputedStyle ? getComputedStyle(node) : node.style;
        if (s && s.display === 'none') return false;
        node = node.parentElement;
      }
      return true;
    },
    validateRequiredFields() {
      const form = this.$refs.mainForm;
      if (!form) return true;
      // 查找所有“红星”标签，但排除“基本信息”模块下的
      const starSpans = Array.from(form.querySelectorAll('label > span'))
        .filter(span => /\*/.test(span.textContent) && this.isElementVisible(span));
      const errors = [];
      let firstBadControl = null;
      for (const span of starSpans) {
        // 跳过基本信息
        if (span.closest('.basic-info')) continue;
        const labelEl = span.parentElement;
        const container = labelEl.closest('.form-row-item') || labelEl.closest('.form-row') || labelEl;
        if (!this.isElementVisible(container)) continue;
        const controls = Array.from(container.querySelectorAll('input, select, textarea'))
          .filter(el => !el.disabled && !el.readOnly && this.isElementVisible(el));
        if (controls.length === 0) continue;
        // 分组判断：如果包含单选/多选，则要求至少勾选一个；否则要求每个文本/下拉/时间类均有值
        const radios = controls.filter(el => el.type === 'radio');
        const checks = controls.filter(el => el.type === 'checkbox');
        const others = controls.filter(el => el.type !== 'radio' && el.type !== 'checkbox' && el.type !== 'button' && el.type !== 'submit' && el.type !== 'file');
        let ok = true;
        if (radios.length > 0) {
          ok = radios.some(r => r.checked);
        }
        if (ok && checks.length > 0) {
          // 多选组里若存在至少一个必须选的情况，同样至少一个
          ok = checks.some(c => c.checked);
        }
        if (ok && others.length > 0) {
          ok = others.every(o => (o.value != null && String(o.value).trim() !== ''));
        }
        if (!ok) {
          const labelText = labelEl.textContent.replace('*', '').replace('：', ':').trim();
          errors.push(labelText + '为必填项');
          if (!firstBadControl) firstBadControl = controls[0];
        }
      }
      if (errors.length > 0) {
        const msg = errors[0]; // 只提示第一条，避免信息过载
        if (firstBadControl && typeof firstBadControl.scrollIntoView === 'function') {
          firstBadControl.scrollIntoView({behavior: 'smooth', block: 'center'});
          try {
            firstBadControl.focus();
          } catch (e) {
          }
        }
        this.showMessage(msg, 'error');
        return false;
      }
      return true;
    },

    getInsuranceTypeText(type) {
      const insuranceTypes = {
        1: '城镇职工',
        2: '城镇居民',
        3: '新农合',
        4: '城乡居民',
        5: '自费'
      }
      return insuranceTypes[type] || '未知'
    },
    validateTemperature() {
      this.checkValue(this.emergencyData, 'temperature', this.emergencyData.temperature, 35, 42, '摄氏度')
    },
    checkValue(obj, field, value, min, max, unit = '') {
      console.log(`checkValue called for ${field}`) // 确保方法被调用

      // 字段与中文描述的映射
      const fieldNames = {
        weight: '体重',
        heartRate: '心率',
        pulse: '脉搏',
        respiration: '呼吸',
        temperature: '体温'
      }

      // 获取对应的中文描述
      const fieldLabel = fieldNames[field] || field // 默认使用字段名

      // 假设值限制为 min 到 max
      if (value === null || value === '') {
        // 清空输入值
        obj[field] = null
        alert(`无有效的${fieldLabel}`)
      } else if (isNaN(value)) {
        // 输入值不是数字
        alert(`无有效的数字`)
        obj[field] = null // 清空输入值
      } else if (parseFloat(value) < min || parseFloat(value) > max) {
        // 输入值超出范围
        alert(`${fieldLabel}必须在${min}到${max}${unit}之间`)
        obj[field] = null // 清空输入值
      }
      // 如果输入值符合要求，不做任何操作
    },
    validateTime(obj, field) {
      const data = new Date() // 当前时间
      data.setHours(data.getHours() + 8)
      this.maxDateTime = data.toISOString().slice(0, 16)
      console.log('maxDateTime')
      console.log(this.maxDateTime)
      if (obj[field] > this.maxDateTime) {
        obj[field] = this.maxDateTime // 超过最大时间则重置
        alert(`"${field}" 时间不能超过当前时间！`)
      }
    },
    validecgdateTime(index) {
      const data = new Date() // 当前时间
      data.setHours(data.getHours() + 8)
      const maxDateTime = data.toISOString().slice(0, 16)
      if (this.chestPainData.ecgs[index].time > maxDateTime) {
        this.chestPainData.ecgs[index].time = maxDateTime // 超过最大时间则重置
        alert(`第 ${index + 1} 个心电图时间不能超过当前时间！`)
      }
    },
    checktroponinTimes(index) {
      const troponin = this.chestPainData.troponins[index]
      const bloodDrawTime = troponin.bloodDrawTime
      const reportTime = troponin.reportTime

      const data = new Date() // 当前时间
      data.setHours(data.getHours() + 8)
      const maxDateTime = data.toISOString().slice(0, 16)

      /* if (bloodDrawTime.getTime()) && !isNaN(reportTime.getTime())) {
        if (reportTime < bloodDrawTime) {
          alert(`第${index + 1}项：获得报告时间不能早于抽血完成时间`);
          this.chestPainData.troponins[index].reportTime = '';
        }
      } */
      console.log(reportTime)
      console.log(bloodDrawTime)
      console.log(maxDateTime)

      if (reportTime > maxDateTime) {
        alert(`第${index + 1}项：获得报告时间不能晚于当前时间`)
        this.chestPainData.troponins[index].reportTime = maxDateTime
      }
      if (bloodDrawTime > maxDateTime) {
        alert(`第${index + 1}项：抽血完成时间不能晚于当前时间`)
        this.chestPainData.troponins[index].bloodDrawTime = maxDateTime
      }
    },
    convertBooleanToString(value) {
      if (value === null) {
        return null // 或者返回默认值，如空字符串 ""
      }
      return value ? 'True' : 'False'
    },
    formatDateTime(inputDateTime) {
      if (!inputDateTime) return ''
      const date = new Date(inputDateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    getTimeLine() {
      console.log('timeline start')
      // 提取所有非空时间
      const allEvents = []

      // 从 formData 中提取时间
      if (this.formData.caseDate) {
        allEvents.push({time: this.formData.caseDate, description: '病例归属日期'})
      }

      // 从 emergencyData 中提取时间
      if (this.emergencyData.onsetTime) {
        allEvents.push({time: this.emergencyData.onsetTime, description: '发病时间'})
      }
      if (this.emergencyData.callTime) {
        allEvents.push({time: this.emergencyData.callTime, description: '呼救时间'})
      }
      if (this.emergencyData.arrivalTime) {
        allEvents.push({time: this.emergencyData.arrivalTime, description: '到达医院大门时间'})
      }
      if (this.emergencyData.firstContactTime) {
        allEvents.push({time: this.emergencyData.firstContactTime, description: '首次医疗接触时间'})
      }
      if (this.emergencyData.firstDoctorTime) {
        allEvents.push({time: this.emergencyData.firstDoctorTime, description: '首诊医师接诊时间'})
      }
      if (this.emergencyData.transferInTime) {
        allEvents.push({time: this.emergencyData.transferInTime, description: '转出医院入门时间'})
      }
      if (this.emergencyData.decisionTransferTime) {
        allEvents.push({time: this.emergencyData.decisionTransferTime, description: '决定转院时间'})
      }
      if (this.emergencyData.transferOutTime) {
        allEvents.push({time: this.emergencyData.transferOutTime, description: '转出医院出门时间'})
      }
      if (this.emergencyData.arrivalAtHospitalTime) {
        allEvents.push({time: this.emergencyData.arrivalAtHospitalTime, description: '到达本院大门时间'})
      }
      if (this.emergencyData.inHospitalConsultationTime) {
        allEvents.push({time: this.emergencyData.inHospitalConsultationTime, description: '院内接诊时间'})
      }
      if (this.emergencyData.bedDoctorContactTime) {
        allEvents.push({time: this.emergencyData.bedDoctorContactTime, description: '床位医生接触时间'})
      }
      if (this.emergencyData.leaveDepartmentTime) {
        allEvents.push({time: this.emergencyData.leaveDepartmentTime, description: '离开科室时间'})
      }

      // 从 chestPainData 中提取时间
      if (this.chestPainData.ecgDiagFalsesisTime) {
        allEvents.push({time: this.chestPainData.ecgDiagFalsesisTime, description: '心电图诊断时间'})
      }
      if (this.chestPainData.diagFalsesisTime) {
        allEvents.push({time: this.chestPainData.diagFalsesisTime, description: '初步诊断时间'})
      }
      if (this.chestPainData.reassessmentTime) {
        allEvents.push({time: this.chestPainData.reassessmentTime, description: '再次危险分层时间'})
      }
      if (this.chestPainData.interventionDecisionTime) {
        allEvents.push({time: this.chestPainData.interventionDecisionTime, description: '决定介入手术时间'})
      }
      if (this.chestPainData.cathLabStartTime) {
        allEvents.push({time: this.chestPainData.cathLabStartTime, description: '启动导管室时间'})
      }
      if (this.chestPainData.informedConsentStartTime) {
        allEvents.push({time: this.chestPainData.informedConsentStartTime, description: '开始知情同意时间'})
      }
      if (this.chestPainData.informedConsentSignatureTime) {
        allEvents.push({time: this.chestPainData.informedConsentSignatureTime, description: '签署知情同意时间'})
      }
      if (this.chestPainData.actualInterventionTime) {
        allEvents.push({time: this.chestPainData.actualInterventionTime, description: '实际介入治疗时间'})
      }
      if (this.chestPainData.thrombolysisStartTime) {
        allEvents.push({time: this.chestPainData.thrombolysisStartTime, description: '溶栓开始时间'})
      }
      if (this.chestPainData.thrombolysisEndTime) {
        allEvents.push({time: this.chestPainData.thrombolysisEndTime, description: '溶栓结束时间'})
      }
      if (this.chestPainData.cabgDecisionTime) {
        allEvents.push({time: this.chestPainData.cabgDecisionTime, description: '决定CABG时间'})
      }
      if (this.chestPainData.cabgStartTime) {
        allEvents.push({time: this.chestPainData.cabgStartTime, description: '开始CABG时间'})
      }
      if (this.chestPainData.aorticDissectionDiagFalsesisTime) {
        allEvents.push({
          time: this.chestPainData.aorticDissectionDiagFalsesisTime,
          description: '主动脉夹层初步诊断时间'
        })
      }
      if (this.chestPainData.ctFalsetificationTime) {
        allEvents.push({time: this.chestPainData.ctFalsetificationTime, description: '通知CT室时间'})
      }
      if (this.chestPainData.ctPreparationTime) {
        allEvents.push({time: this.chestPainData.ctPreparationTime, description: 'CT室完成准备时间'})
      }
      if (this.chestPainData.ctScanStartTime) {
        allEvents.push({time: this.chestPainData.ctScanStartTime, description: 'CT扫描开始时间'})
      }
      if (this.chestPainData.ctReportTime) {
        allEvents.push({time: this.chestPainData.ctReportTime, description: 'CT报告时间'})
      }
      if (this.chestPainData.ultrasoundFalsetificationTime) {
        allEvents.push({time: this.chestPainData.ultrasoundFalsetificationTime, description: '通知彩超室时间'})
      }
      if (this.chestPainData.ultrasoundExamTime) {
        allEvents.push({time: this.chestPainData.ultrasoundExamTime, description: '彩超检查时间'})
      }
      if (this.chestPainData.ultrasoundResultTime) {
        allEvents.push({time: this.chestPainData.ultrasoundResultTime, description: '彩超结果时间'})
      }
      if (this.chestPainData.cardiacSurgeryConsultationFalsetification) {
        allEvents.push({
          time: this.chestPainData.cardiacSurgeryConsultationFalsetification,
          description: '通知心外科会诊时间'
        })
      }
      if (this.chestPainData.cardiacSurgeryConsultationTime) {
        allEvents.push({time: this.chestPainData.cardiacSurgeryConsultationTime, description: '心外科会诊时间'})
      }

      const parseTimelineTime = (time) => {
        if (!time) return null
        const normalized = String(time).replace(/\//g, '-')
        const parsed = new Date(normalized)
        const timestamp = parsed.getTime()
        return Number.isFinite(timestamp) ? timestamp : null
      }

      const sortedEvents = allEvents
        .map(event => ({ ...event, sortTime: parseTimelineTime(event.time) }))
        .filter(event => event.sortTime !== null)
        .sort((a, b) => a.sortTime - b.sortTime)
        .map(({ sortTime, ...event }) => event)

      // 更新 timelineEvents
      this.timelineEvents.splice(0, this.timelineEvents.length, ...sortedEvents)
      console.log('timeline end')
      console.log(this.timelineEvents)

      // 如果使用 Vue.js，可以直接更新数据
      // this.timelineEvents = allEvents;
    },
    async patInfo() {
      const response = await axios.post(API_URL + 'pat/infoone', null,
        {
          params: {id: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      // 处理响应
      if (response.data.code === 200) {
        const responseData = response.data.data // 假设这是从后端获取的数据
        console.log(responseData)
        this.formData.age = responseData.age?.toString() || '' // 转为字符串
        this.formData.dob = responseData.birthDate ? responseData.birthDate.substring(0, 10) : '' // 格式化为 YYYY-MM-DD
        this.formData.education = responseData.educationLevel || '' // 处理 null
        this.formData.ethnicity = responseData.ethnicity || '' // 处理 null
        this.formData.gender = responseData.gender || '' // 处理 null
        this.formData.height = responseData.height || 0 // 默认值为 0
        this.formData.idNumber = responseData.idNumber || '' // 处理 null
        this.formData.idType = responseData.idType || 4 // 转为字符串
        this.formData.maritalStatus = responseData.maritalStatus?.toString() || '' // 转为字符串
        this.formData.caseDate = responseData.medicalRecordDate ? responseData.medicalRecordDate.substring(0, 10) : '' // 格式化为 YYYY-MM-DD
        this.formData.occupation = responseData.occupation || '' // 处理 null
        this.formData.name = responseData.patientName || '' // 处理 null
        this.formData.phone = responseData.phone || '' // 处理 null
        this.formData.weight = responseData.weight || 0 // 默认值为 0
        this.formData.patientId = Number(responseData.id)
        this.patientId = Number(responseData.id)
        console.log('this.formData')
        console.log(this.formData)
      }
    },
    async patEmInfo() {
      /* const patEmInfo = {
        hospitalAdmissionId: this.emergencyData.inpatientId, // 住院ID
        insuranceNumber: this.emergencyData.insuranceNumber, // 医保编号
        insuranceType: this.emergencyData.insuranceType, // 医保类型
        onsetLocation: this.emergencyData.address, // 发病地址
        onsetPeriod: this.emergencyData.specificOnsetTime, // 计算发病时段
        onsetTime: this.emergencyData.onsetTime, // 发病时间
        outpatientId: this.emergencyData.outpatientId, // 门诊ID
        patientId: this.patientId, // 患者ID，需根据实际情况设置

      };
      console.log("patEmInfo")
      console.log(patEmInfo)*/
      const response = await axios.post(API_URL + 'pat/patEmInfo', null,
        {
          params: {patientId: this.patientId}, // this.patientId
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })

      console.log('patEmInfo')
      console.log(response)
      if (response.data.code === 200) {
        const raw = response.data.data;
        const d = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw;
        if (!d) return;

// emergencyData: {
//         inpatientId: '',
//         outpatientId: '',
//         onsetTime: '',
//         address: '',
//         detailedAddress: '',
//         insuranceType: '',
//         insuranceNumber: '',
//         severeInsurance: '',
//         symptomslevel: '',
//         symptoms: [],
//         source: '',
//         consciousness: '',
//         respiration: '',
//         pulse: '',
//         heartRate: '',
//         bloodPressure: '',
//         temperature: '',
//         remarks: '',

//         // 120
//         transportUnit: [], // 存储出车单位
//         callTime: '',
//         arrivalTime: '',
//         directTransfer: '', // 存储转送信息
//         firstContactTime: '',
//         firstDoctorTime: '',
//         medicalStaff: '',

//         // 转院
//         transferType: [], // 存储转院类型
//         hospitalName: '',
//         // firstContactTime: '',
//         transferInTime: '',
//         decisionTransferTime: '',
//         transferOutTime: '',
//         arrivalAtHospitalTime: '',
//         inHospitalConsultationTime: '',
//         // medicalStaff: '',

//         // 自行来院
//         // arrivalAtHospitalTime: '',
//         // firstContactTime: '',
//         // firstDoctorTime: '',
//         // medicalStaff: '',

//         // 院内发病
//         department: '',
//         // firstContactTime: '',
//         bedDoctorContactTime: '',
//         leaveDepartmentTime: ''
//         // medicalStaff: ''


//       },

        this.emergencyData.inpatientId = d.hospitalAdmissionId || '';
        this.emergencyData.insuranceNumber = d.insuranceNumber || '';
        this.emergencyData.insuranceType = d.insuranceType || '';
        this.emergencyData.address = d.onsetLocation || '';
        this.emergencyData.specificOnsetTime = d.onsetPeriod || '';
        this.emergencyData.onsetTime = this.formatDateTime(d.onsetTime);
        this.emergencyData.outpatientId = d.outpatientId || '';
        this.emergencyData.isCriticalIllnessInsurance = this.convertBooleanToString(d.isCriticalIllnessInsurance);
        this.emergencyData.detailedAddress=d.detailedAddress;
      }

      // === normalized assignments for patEmInfo ===
      if (d) {
        this._set(this.emergencyData, 'source', Number(d.methodType ?? 0));
        this._set(this.emergencyData, 'specificOnsetTime', String(d.onsetPeriod ?? ''));
        this._set(this.emergencyData, 'networkHospitalType', String(d.networkHospitalType ?? ''));
        this._set(this.emergencyData, 'consciousness', String(d.consciousness ?? ''));
        this._set(this.emergencyData, 'arriveTime', this.formatLocal(d.arriveTime));
      }
    },
    async patConInfo() {
      /* const patConAsDTO = {
        additionalSymptoms: this.emergencyData.symptoms.join(', '), // 将症状数组转换为字符串
        conditionType: this.emergencyData.symptomslevel, // 获取病情类型
        //emergencyId: 0 // 确保有有效的急救ID
        //assessmentId: 0, // 根据实际情况设置

      };
      console.log("patConAsDTO")
      console.log(patConAsDTO)*/
      const response = await axios.post(API_URL + 'pat/patConInfo', null,
        {
          params: {patientId: this.patientId}, // this.patientId
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('patConInfo')
      console.log(response)
      if (response.data.code === 200) {
        const raw = response.data.data;
        const d = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw;
        if (!d) return;

        this.emergencyData.symptomslevel = d.conditionType ?? '';
        const s = (d.additionalSymptoms ?? '').toString();
        this.emergencyData.symptoms = s ? s.split(',').map(x => x.trim()).filter(Boolean) : [];
      }

      // === normalized assignments for patConInfo ===
      if (d) {
        this._set(this.conditionData, 'symptomslevel', d.symptomslevel == null ? '' : Number(d.symptomslevel));
        this._set(this.conditionData, 'killip', d.killip == null ? '' : Number(d.killip));
        this._set(this.conditionData, 'onsetTime', this.formatLocal(d.onsetTime));
        this._set(this.conditionData, 'firstMedicalTime', this.formatLocal(d.firstMedicalTime));
      }
    },
    async patAdInfo() {
      /* const patAdMeDTO = {

        ambulanceType: this.emergencyData.transportUnit, // 转换救护车类型
        callTime: this.emergencyData.callTime, // 呼救时间

        firstMedicalContactTime: this.emergencyData.firstContactTime, // 首次医疗接触时间
        hospitalArrivalTime: this.emergencyData.arrivalTime, // 到达医院时间
        methodType: this.emergencyData.source, // 获取来院方式
        transferHospitalName: this.emergencyData.hospitalName || '', // 转送医院名称
        patient_id: this.patientId,
        admissionId: 0,

      };
      console.log("patAdMeDTO ")
      console.log(patAdMeDTO) */
      const response = await axios.post(API_URL + 'pat/patAdmission', null,
        {
          params: {patientId: this.patientId}, // this.patientId
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('patAdInfo')
      console.log(response)
      if (response.data.code === 200) {
        const raw = response.data.data;
        const d = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw;
        if (!d) return;
        this.emergencyData.transportUnit = d.ambulanceType ?? d.transportUnit ?? d.ambulanceType ?? d.ambulanceUnit ?? '';
        this.emergencyData.callTime = this.formatDateTime(d.callTime);
        this.emergencyData.firstContactTime = this.formatDateTime(d.firstMedicalContactTime);
        this.emergencyData.arrivalTime = this.formatDateTime(d.hospitalArrivalTime);
        this.emergencyData.source = Number(d.methodType ?? '');
        this.emergencyData.hospitalName = d.transferHospitalName ?? '';
        this.emergencyData.patientId = d.patientId ?? '';
        this.emergencyData.directTransfer = this.convertBooleanToString(d.isTransferHighHospital);
        this.emergencyData.transferType = d.transferType ?? '';
        this.emergencyData.transferInTime = this.formatDateTime(d.transferHospitalInTime);
        this.emergencyData.decisionTransferTime = this.formatDateTime(d.decisionTransferTime);
        this.emergencyData.transferOutTime = this.formatDateTime(d.transferHospitalOutTime);
        this.emergencyData.inHospitalConsultationTime = this.formatDateTime(d.inHospitalContactTime);
        this.emergencyData.bedDoctorContactTime = this.formatDateTime(d.bedMedicalContactTime);
        this.emergencyData.leaveDepartmentTime = this.formatDateTime(d.leaveDepartmentTime);
        this.emergencyData.department = d.onsetDepartment ?? '';
        this.emergencyData.firstDoctorTime = this.formatDateTime(d.firstDiagnosisTime) || '';
        this.emergencyData.medicalStaff = d.medicalStaff || '';
      }

      // === normalized assignments for patAdInfo ===
      if (d) {
        this._set(this.emergencyData, 'source', Number((d.methodType ?? this.emergencyData.source ?? 0)));
        this._set(this.admissionData, 'department', String(d.department ?? ''));
        this._set(this.admissionData, 'bedNo', String(d.bedNo ?? ''));
        this._set(this.admissionData, 'admissionTime', this.formatLocal(d.admissionTime));
      }
    },
    async patViInfo() {
      /*  const patViSiDTO = {
        bloodPressure: this.emergencyData.bloodPressure, // 血压
        checkTime: new Date().toISOString(), // 当前时间作为检查时间
        consciousness: Number(this.emergencyData.consciousness), // 转换意识状态
        outpatientId: this.emergencyData.outpatientId, // 门诊ID
        patientName: this.formData.name, // 患者姓名
        pulse: Number(this.emergencyData.pulse), // 脉搏
        respiration: Number(this.emergencyData.respiration), // 呼吸
        temperature: Number(this.emergencyData.temperature), // 体温

        oxygenSaturation: Number(this.emergencyData.heartRate)

      };
      console.log("patViSiDTO")
      console.log(patViSiDTO) */
      const response = await axios.post(API_URL + 'pat/patViInfo', null,
        {
          params: {patientId: this.patientId}, // this.patientId
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('patViInfo')
      console.log(response)
      if (response.data.code === 200) {
        const raw = response.data.data;
        const d = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw;
        if (!d) return;

        this.emergencyData.bloodPressure = d.bloodPressure ?? '';
        this.emergencyData.consciousness = d.consciousness ?? '';
        this.emergencyData.outpatientId = d.outpatientId ?? '';
        this.emergencyData.pulse = d.pulse ?? '';
        this.emergencyData.respiration = d.respiration ?? '';
        this.emergencyData.temperature = d.temperature ?? '';
        this.emergencyData.heartRate = d.heartRate ?? '';
        this.footerCheckTime = d.checkTime ?? '';

        if (d) {
          this._set(this.vitalData, 'heartRate', d.heartRate == null ? '' : Number(d.heartRate));
          this._set(this.vitalData, 'respRate', d.respRate == null ? '' : Number(d.respRate));
          this._set(this.vitalData, 'bpSys', d.bpSys == null ? '' : Number(d.bpSys));
          this._set(this.vitalData, 'bpDia', d.bpDia == null ? '' : Number(d.bpDia));
          this._set(this.vitalData, 'collectTime', this.formatLocal(d.collectTime));
          this.footerCheckTime = this.formatDateTime(d.checkTime)
        }
      }

      // === normalized assignments for patViInfo ===
    },
    async patEcgInfo() {

      const response = await axios.post(API_URL + 'pat/patECGInfo', null,
        {
          params: {patientId: this.patientId}, // this.patientId
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('patEcgInfo')
      console.log(response)
   if (response.data.code === 200) {
  const raw = response.data.data;
  const d = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw;
  if (!d) return;

  // 是否做了心电图
  this.chestPainData.ecg = this.convertBooleanToString(d.ecgPerformed);

  // 先用 filePath 构建 ecgs 数组（避免后面把 time 覆盖掉）
  const files = ((d.filePath ?? '') + '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  this.chestPainData.ecgs = files.length
    ? files.map(p => ({ filePath: p }))
    : [{ filePath: '' }];

  // 再分别回填时间：检查时间=checkTime，诊断时间=ecgDiagnosisTime（互为兜底）
  if (!this.chestPainData.ecgs.length) this.chestPainData.ecgs = [{ filePath: '' }];

  // 心电图“检查时间”显示在 ecgs[0].time
  this.chestPainData.ecgs[0].time = this.formatDateTime(d.checkTime || d.ecgDiagnosisTime || null);

  // 心电图“诊断时间”
  this.chestPainData.ecgDiagFalsesisTime = this.formatDateTime(d.ecgDiagnosisTime || d.checkTime || null);

  // 远程心电图及方式
  this.chestPainData.ecgRemote = this.convertBooleanToString(d.remoteEcgTransmission);
  this.chestPainData.ecgRemoteTime = this.formatDateTime(d.remoteEcgTime);

  const m = (d.transmissionMethod ?? d.remoteEcgTransmission ?? null);
  // 兼容 1/'1'/true/'True' 表示实时；其余走 wechat
  this.chestPainData.transmissionMode =
    (String(m) === '1' || m === 1 || m === true || m === 'True') ? 'realtime' : 'wechat';
}},
    async lab() {
      /* const patLabDTO = {
        patientId: this.patientId, // 假设患者ID为0，实际应从上下文中获取
        isSerumCreatinine: this.chestPainData.creatinine === 'True',
        serumCreatinineValue: this.chestPainData.creatinine === 'True' ? parseFloat(this.chestPainData.creatinineValue) : null,
        isDdimer: this.chestPainData.dDimer === 'True',
        ddimerValue: this.chestPainData.dDimer === 'True' ? parseFloat(this.chestPainData.dDimerValue) : null,
        isBNP: this.chestPainData.bnp === 'True',
        bnpValue: this.chestPainData.bnp === 'True' ? parseFloat(this.chestPainData.bnpValue) : null,
        isNTproBNP: this.chestPainData.ntProBnp === 'True',
        ntproBNPValue: this.chestPainData.ntProBnp === 'True' ? parseFloat(this.chestPainData.ntProBnpValue) : null,
        isMyo: this.chestPainData.myo === 'True',
        myoValue: this.chestPainData.myo === 'True' ? parseFloat(this.chestPainData.myoValue) : null,
        isCKMB: this.chestPainData.ckmb === 'True',
        ckmbValue: this.chestPainData.ckmb === 'True' ? parseFloat(this.chestPainData.ckmbValue) : null,
        isReportTroponin: this.chestPainData.troponin === 'True',
        troponinValue: this.chestPainData.troponin === 'True' ? JSON.stringify(this.chestPainData.troponins) : null, // 将数组转换为字符串
        firstTroponinType: this.chestPainData.troponin === 'True' && this.chestPainData.troponins.length > 0 ? this.chestPainData.troponins[0].type.join(",") : null, // 获取第一个肌钙蛋白的类型
        troponinResult: this.chestPainData.troponin === 'True' && this.chestPainData.troponins.length > 0 ? this.chestPainData.troponins[0].result : null, // 获取第一个肌钙蛋白的结果
        bloodDrawCompletionTime: this.chestPainData.troponin === 'True' && this.chestPainData.troponins.length > 0 ? this.chestPainData.troponins[0].bloodDrawTime : null,
        reportObtainTime: this.chestPainData.troponin === 'True' && this.chestPainData.troponins.length > 0 ? this.chestPainData.troponins[0].reportTime : null

      }; */
      const resp = await axios.post(API_URL + 'diagnosis/lab', null, {
        params: {patientId: this.patientId},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token
        }
      });
      if (resp.data?.code !== 200) return;

      const raw = resp.data.data;
      const item = Array.isArray(raw) ? this.pickLatestRecord(raw) : raw; // 这里只有一条就取第一条
      if (!item) return;

      // 模板需要 'True'/'False'
      const S = (b) => this.convertBooleanToString?.(b) ?? (b ? 'True' : 'False');

      // ====== 常规实验室项 ======
      this.chestPainData.creatinine = S(item.isSerumCreatinine);
      this.chestPainData.creatinineValue = item.serumCreatinineValue ?? null;

      // D-二聚体（后端是 isDdimer）
      this.chestPainData.dDimer = S(item.isDdimer);
      this.chestPainData.dDimerValue = item.ddimerValue ?? null;

      // BNP / NT-proBNP（注意大小写）
      const isBnp = item.isBNP ?? item.isBnp;
      const isNtpro = item.isNTproBNP ?? item.isNTproBnp;
      this.chestPainData.bnp = S(!!isBnp);
      this.chestPainData.bnpValue = item.bnpValue ?? null;
      this.chestPainData.ntProBnp = S(!!isNtpro);
      this.chestPainData.ntProBnpValue = item.ntproBNPValue ?? item.ntproBnpValue ?? null;

      // 肌红蛋白 / CKMB（注意 CKMB 大小写）
      const isCkmb = item.isCKMB ?? item.isCkmb;
      this.chestPainData.myo = S(item.isMyo);
      this.chestPainData.myoValue = item.myoValue ?? null;
      this.chestPainData.ckmb = S(!!isCkmb);
      this.chestPainData.ckmbValue = item.ckmbValue ?? null;

      // ====== 肌钙蛋白：驱动显示开关 + 明细 ======
      this.chestPainData.troponin = S(item.isReportTroponin);

      // troponinValue 在你们的返回里是单位字符串（例如 "ng/ml"）
      const first = {
        type: item.firstTroponinType ?? '',
        unit: (item.troponinValue ?? '').toString(), // ✅ 当成单位
        result: item.troponinResult ?? '',
        bloodDrawTime: this.formatDateTime(item.bloodDrawCompletionTime) ?? '',
        reportTime: this.formatDateTime(item.reportObtainTime) ?? ''
      };

      // 确保 troponins 至少有一项，模板 v-for 才能渲染
      this.chestPainData.troponins = [first];

    },
    async heart() {
      /* const patHeartDTO = {

        consultationType: this.chestPainData.consultationType, // 初步诊断
        patientId: this.patientId, // 患者ID，根据实际情况设置

        isCardiologyConsultation: this.chestPainData.consult === "True",
        notificationConsultationTime: this.chestPainData.cardiacSurgeryConsultationFalsetification,
        consultationTime: this.chestPainData.cardiacSurgeryConsultationTime,
      };
      console.log("patHeartDTO")
      console.log(patHeartDTO) */
      const response = await axios.post(API_URL + 'diagnosis/heart', null,
        {
          params: {patientId: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('heart')
      console.log(response)
      if (response.data.code === 200) {
        const listheart = Array.isArray(response.data.data)
          ? response.data.data.filter(x => x && x.patientId === this.patientId)
          : [];
        const chestPainData = this.pickLatestRecord(listheart);
        if (!chestPainData) return;
        console.log(chestPainData)
        // this.patientId = patientId; // 假设患者ID为0，实际应从上下文中获取
        this.chestPainData.consultationType = chestPainData.consultationType // 初步诊断
        // this.patientId = chestPainData.patientId; // 患者ID，根据实际情况设置

        this.chestPainData.consult = this.convertBooleanToString(chestPainData.isCardiologyConsultation)
        this.chestPainData.cardiacSurgeryConsultationFalsetification = this.formatDateTime(chestPainData.notificationConsultationTime)
        this.chestPainData.cardiacSurgeryConsultationTime = this.formatDateTime(chestPainData.consultationTime)
      }

      const response00 = await axios.post(API_URL + 'diagnosis/dia', null,
        {
          params: {patientId: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('dia')
      console.log(response00)
      if (response00.data.code === 200) {
        const listdia = Array.isArray(response00.data.data)
          ? response00.data.data.filter(x => x && x.patientId === this.patientId)
          : [];
        const chestPainData = this.pickLatestRecord(listdia);
        if (!chestPainData) return;
        this.chestPainData.initialDiagnosisDoctor = chestPainData.diagnosisDoctor // 医生姓名
        this.chestPainData.diagFalsesis = chestPainData.initialDiagnosis // 初步诊断
        this.chestPainData.diagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime) // 当前时间作为初步诊断时间
        // this.patientId = chestPainData.patientId; // 患者ID，根据实际情况设置
        this.chestPainData.remarks = chestPainData.patientRemarks // 患者备注
      }


      switch (this.chestPainData.diagFalsesis) {
        case 'STEMI':
          /* const patStemiDTO = {
            angiographyStartTime: this.chestPainData.diagFalsesisTime, // 初步诊断时间
            anticoagulantDose: this.chestPainData.anticoagulantDose, // 抗凝剂量
            anticoagulantDrug: this.chestPainData.anticoagulantDrugs, // 抗凝药物chestPainData.anticoagulantDrugs
            anticoagulationTime: this.chestPainData.anticoagulantTime, // 抗凝时间
            aspirinDosage: this.chestPainData.aspirinDose, // 阿司匹林剂量
            aspirinTime: this.chestPainData.aspirinTime, // 阿司匹林时间
            cabgDoctor: this.chestPainData.decidingDoctor, // CABG医生
            cabgStartTime: this.chestPainData.cabgStartTime, // CABG开始时间
            cabgTime: this.chestPainData.cabgDecisionTime, // CABG决定时间
            cardiacFunctionGrade: this.chestPainData.heartFunctionClass, // 心功能分级
            cathLabStartTime: this.chestPainData.cathLabStartTime, // 启动导管室时间
            clopidogrelDosage: this.chestPainData.clopidogrelDose, // 氯吡格雷剂量
            clopidogrelTime: this.chestPainData.clopidogrelTime, // 氯吡格雷时间
            isAnticoagulation: this.chestPainData.anticoagulation === 'True', // 抗凝
            isAntiplateletTherapy: this.chestPainData.antiplateletTreatment === 'True', // 抗血小板治疗
            isBetaBlocker: this.chestPainData.betaBlocker === 'True', // β受体阻滞剂
            isBypassCcu: this.chestPainData.ccuBypass === 'True', // 绕行CCU
            isBypassEmergency: this.chestPainData.emergencyBypass === 'True', // 绕行急诊
            isReperfusion: this.chestPainData.reperfusion === 'True', // 再灌注
            isStatinTherapy: this.chestPainData.statinTreatment === 'True', // 他汀治疗
            thrombolysisStartTime: this.chestPainData.thrombolysisStartTime, // 溶栓开始时间
            thrombolysisEndTime: this.chestPainData.thrombolysisEndTime, // 溶栓结束时间
            thrombolysisPlace: this.chestPainData.thrombolysisPlace, // 溶栓场所
            patientId: this.patientId // 患者ID
          }
 */
          const response1 = await axios.post(API_URL + 'diagnosis/stemi', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('stemi')
          console.log(response1)
          if (response1.data.code === 200) {
            const liststemi = Array.isArray(response1.data.data)
              ? response1.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(liststemi);
            if (!chestPainData) return;
            this.chestPainData.diagFalsesisTime = this.formatDateTime(chestPainData.angiographyStartTime) // 初步诊断时间
            this.chestPainData.anticoagulantDose = chestPainData.anticoagulantDose // 抗凝剂量
            this.chestPainData.anticoagulantDrugs = chestPainData.anticoagulantDrug // 抗凝药物
            this.chestPainData.anticoagulantTime = this.formatDateTime(chestPainData.anticoagulationTime) // 抗凝时间
            this.chestPainData.aspirinDose = chestPainData.aspirinDosage // 阿司匹林剂量
            this.chestPainData.aspirinTime = this.formatDateTime(chestPainData.aspirinTime) // 阿司匹林时间
            this.chestPainData.decidingDoctor = chestPainData.cabgDoctor // CABG医生
            this.chestPainData.cabgStartTime = this.formatDateTime(chestPainData.cabgStartTime) // CABG开始时间
            this.chestPainData.cabgDecisionTime = this.formatDateTime(chestPainData.cabgTime) // CABG决定时间
            this.chestPainData.heartFunctionClass = chestPainData.cardiacFunctionGrade // 心功能分级
            this.chestPainData.cathLabStartTime = this.formatDateTime(chestPainData.cathLabStartTime) // 启动导管室时间
            this.chestPainData.clopidogrelDose = chestPainData.clopidogrelDosage // 氯吡格雷剂量
            this.chestPainData.clopidogrelTime = this.formatDateTime(chestPainData.clopidogrelTime) // 氯吡格雷时间
            this.chestPainData.ticagrelorDose = chestPainData.prasugrelDosage // 普拉格雷剂量
            this.chestPainData.ticagrelorTime = this.formatDateTime(chestPainData.prasugrelTime) // 普拉格雷时间
            this.chestPainData.anticoagulation = this.convertBooleanToString(chestPainData.isAnticoagulation) // 抗凝
            this.chestPainData.antiplateletTreatment = this.convertBooleanToString(chestPainData.isAntiplateletTherapy) // 抗血小板治疗
            this.chestPainData.betaBlocker = this.convertBooleanToString(chestPainData.isBetaBlocker) // β受体阻滞剂
            this.chestPainData.ccuBypass = this.convertBooleanToString(chestPainData.isBypassCcu) // 绕行CCU
            this.chestPainData.emergencyBypass = this.convertBooleanToString(chestPainData.isBypassEmergency) // 绕行急诊
            this.chestPainData.reperfusion = this.convertBooleanToString(chestPainData.isReperfusion) // 再灌注
            // === 回显『措施』 ===
            // 优先用后端直接给的字符串；其次兼容另一命名；最后用布尔标志推断
             let method =
               chestPainData?.reperfusionMethod ??
               chestPainData?.treatmentOfReperfusion ??
               (
                 chestPainData?.isDirectPCI             ? '直接PCI' :
                 chestPainData?.isThrombolysis          ? '溶栓' :
                 chestPainData?.isRescuePCI             ? '补救PCI' :
                 chestPainData?.isPostThrombolysisPCI   ? '溶栓后介入' :
                 chestPainData?.isElectivePCI           ? '择期介入' :
                 chestPainData?.isTransportPCI          ? '转运PCI' :
                 chestPainData?.isCABG                  ? 'CABG' :
                 null
               );
            // 数字/字符串数字 → 文本映射（若你的后端用枚举码）
            const repMap = { 0:'无再灌注措施', 1:'直接PCI', 2:'溶栓', 3:'补救PCI', 4:'溶栓后介入', 5:'择期介入', 6:'转运PCI', 7:'CABG' };
            if (method !== null && (typeof method === 'number' || /^\d+$/.test(String(method)))) {
              method = repMap[Number(method)] ?? null;
            }
            this.chestPainData.reperfusionMethod = method ? String(method).trim() : '';
            // 若后端没有 isReperfusion 字段，则用 method 反推开关（你的模板父级用 'True'/'False'）
            if (typeof chestPainData?.isReperfusion === 'undefined') {
              this.chestPainData.reperfusion = this.convertBooleanToString(!!(method && method !== '无再灌注措施'));
            }
            this.chestPainData.statinTreatment = this.convertBooleanToString(chestPainData.isStatinTherapy) // 他汀治疗
            this.chestPainData.thrombolysisStartTime = this.formatDateTime(chestPainData.thrombolysisStartTime) // 溶栓开始时间
            this.chestPainData.thrombolysisEndTime = this.formatDateTime(chestPainData.thrombolysisEndTime) // 溶栓结束时间
            this.chestPainData.thrombolysisPlace = this.chestPainData.thrombolysisPlace // 溶栓场所
            this.chestPainData.interventionDecisionTime=this.formatDateTime(chestPainData.directPciTime)
            this.chestPainData.informedConsentStartTime=this.formatDateTime(chestPainData.informedConsentStartTime)
            this.chestPainData.informedConsentSignatureTime=this.formatDateTime(chestPainData.informedConsentSignTime)
            this.chestPainData.angiographyStartTime=this.formatDateTime(chestPainData.angiographyStartTime)
            // —— 溶栓筛查 / 溶栓治疗（你页面是“有/无”单选）——
            this.chestPainData.thrombolysisScreening = (chestPainData.thrombolysisScreening ?? '').toString().trim();
            this.chestPainData.thrombolysisTreatment  = (chestPainData.isThrombolysisTreatment === true) ? '有'
              : (chestPainData.isThrombolysisTreatment === false) ? '无'
                : (chestPainData.thrombolysisTreatment ?? '');

            // —— 直达溶栓场所（你页面用的是 True/False 字符串）——
            this.chestPainData.thrombolysisLocation = this.convertBooleanToString(!!chestPainData.isDirectThrombolysisPlace);

            // —— 溶栓场所明细下拉（你有 v-model="chestPainData.thrombolysisLocationDetail"）——
            if (chestPainData.thrombolysisPlace) {
              this.chestPainData.thrombolysisLocationDetail = chestPainData.thrombolysisPlace;
            }

            // —— 溶栓时间（datetime-local 需要去掉毫秒/时区）——
            this.chestPainData.thrombolysisStartTime = this.formatDateTime(chestPainData.thrombolysisStartTime);
            this.chestPainData.thrombolysisEndTime   = this.formatDateTime(chestPainData.thrombolysisEndTime);

            // —— 溶栓药物代际 & 剂量（你页面字段是 thrombolysisDrug / thrombolysisDose）——
            this.chestPainData.thrombolysisDrug = (chestPainData.thrombolyticDrugGeneration ?? '').toString().trim();
            this.chestPainData.thrombolysisDose = (chestPainData.thrombolyticDrugDose ?? '').toString().trim();

            // —— 溶栓再通（你页面字段是 thrombolysisReperfusion，取值 'True'/'False'）——
            this.chestPainData.thrombolysisReperfusion = this.convertBooleanToString(!!chestPainData.isThrombolysisPatency);

            // —— 确保“措施”与父级开关先就绪（让‘转运PCI’区块能显示）——
            this.chestPainData.reperfusionMethod = (chestPainData.reperfusionMethod ?? '').toString().trim();
            if (!this.chestPainData.reperfusionMethod && chestPainData.treatmentOfReperfusion) {
              this.chestPainData.reperfusionMethod = String(chestPainData.treatmentOfReperfusion).trim();
            }
            this.chestPainData.reperfusion = this.convertBooleanToString(
              (typeof chestPainData.isReperfusion !== 'undefined')
                ? !!chestPainData.isReperfusion
                : !!(this.chestPainData.reperfusionMethod && this.chestPainData.reperfusionMethod !== '无再灌注措施')
            );

            // —— 只有当“措施=转运PCI”时，下面的字段才会显示 ——
            // 若你模板用了 repEq('转运PCI') 之类，这里要先命中
            if (this.chestPainData.reperfusionMethod === '转运PCI') {
              // 1) 是否转运布尔 → 'True'/'False'
              if (typeof chestPainData.isTransferPci !== 'undefined') {
                this.chestPainData.isTransferPci = this.convertBooleanToString(!!chestPainData.isTransferPci);
              }

              // 2) 转运类型：兼容 boolean / 'true'/'false' / 0/1 / '0'/'1' / 直接中文
              (()=>{
                const t = chestPainData.transferPciType;
                if (typeof t === 'boolean') {
                  this.chestPainData.transportPCI = t ? '接收患者' : '转出患者';
                  return;
                }
                if (t === 'true' || t === 'false') {
                  this.chestPainData.transportPCI = (t === 'true') ? '接收患者' : '转出患者';
                  return;
                }
                if (t === 1 || t === '1') {
                  this.chestPainData.transportPCI = '接收患者';
                  return;
                }
                if (t === 0 || t === '0') {
                  this.chestPainData.transportPCI = '转出患者';
                  return;
                }
                if (t != null && t !== '') {
                  // 后端若直接给了 '转出患者' / '接收患者'
                  this.chestPainData.transportPCI = String(t).trim();
                  return;
                }
                this.chestPainData.transportPCI = '';
              })();
            }
            // —— 无再灌注措施原因（你页面字段是数组 FalseReperfusionReason）——
            (() => {
              const raw = chestPainData.noReperfusionReason ?? chestPainData.reasonNoReperfusion ?? '';
              // 后端可能给单个原因或逗号分隔；统一成数组以驱动复选框
              const arr = Array.isArray(raw) ? raw : String(raw).split(/[，,]/).map(s => s.trim()).filter(Boolean);
              this.chestPainData.FalseReperfusionReason = arr;
            })();

            try {
              const m = this && this.chestPainData ? this.chestPainData.reperfusionMethod : '';
              if (m === '直接PCI' || m === '溶栓' || m === '补救PCI') {
                if (typeof this.fetchAndRenderCastemi === 'function') {
                  await this.fetchAndRenderCastemi();
                }
              }
            } catch (e) {
              console.warn('fetchAndRenderCastemi failed:', e);
            }
            // this.patientId = chestPainData.patientId; // 患者ID
          }

          break

        case 'NSTEMI':
          const response2 = await axios.post(API_URL + 'diagnosis/nstemi', null, {
            params: {patientId: this.patientId},
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            }
          })
          console.log('nstemi')
          console.log(response2)
          if (response2.data.code === 200) {
            const listnstemi = Array.isArray(response2.data.data)
              ? response2.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(listnstemi);
            if (!chestPainData) return;

            // ==== 基本与药物 ====
            this.chestPainData.anticoagulantDose = chestPainData.anticoagulantDoseNstemi;     // 抗凝剂量
            this.chestPainData.anticoagulantDrugs = chestPainData.anticoagulantDrugNstemi;     // 抗凝药物
            this.chestPainData.anticoagulantTime = this.formatLocal
              ? this.formatLocal(chestPainData.anticoagulationTimeNstemi)
              : chestPainData.anticoagulationTimeNstemi;                                       // 抗凝时间

            this.chestPainData.aspirinDose = chestPainData.aspirinDosageNstemi;                // 阿司匹林剂量
            this.chestPainData.aspirinTime = this.formatLocal
              ? this.formatLocal(chestPainData.aspirinTimeNstemi)
              : chestPainData.aspirinTimeNstemi;                                               // 阿司匹林时间

            this.chestPainData.clopidogrelDose = chestPainData.clopidogrelDosageNstemi;        // 氯吡格雷剂量
            this.chestPainData.clopidogrelTime = this.formatLocal
              ? this.formatLocal(chestPainData.clopidogrelTimeNstemi)
              : chestPainData.clopidogrelTimeNstemi;                                           // 氯吡格雷时间

            // ★ 改为 ticagrelor*（后端字段名）
            this.chestPainData.ticagrelorDose = chestPainData.ticagrelorDoseNstemi;           // 替格瑞洛剂量
            this.chestPainData.ticagrelorTime = this.formatLocal
              ? this.formatLocal(chestPainData.ticagrelorTimeNstemi)
              : chestPainData.ticagrelorTimeNstemi;                                            // 替格瑞洛时间

            this.chestPainData.heartFunctionClass = chestPainData.cardiacFunctionGradeNstemi;  // 心功能分级

            // ==== 介入相关 ====
            this.chestPainData.cathLabStartTime = this.formatLocal
              ? this.formatLocal(chestPainData.emergencyInterventionCathLabStartTimeNstemi)
              : chestPainData.emergencyInterventionCathLabStartTimeNstemi;                     // 启动导管室时间

            this.chestPainData.interventionDecisionTime = this.formatLocal
              ? this.formatLocal(chestPainData.emergencyInterventionDecisionTimeNstemi)
              : chestPainData.emergencyInterventionDecisionTimeNstemi;                         // 决定介入时间

            this.chestPainData.decidingDoctor = chestPainData.emergencyInterventionDoctorNstemi; // 决定医生

            this.chestPainData.informedConsentStartTime = this.formatLocal
              ? this.formatLocal(chestPainData.emergencyInterventionInformedConsentStartTimeNstemi)
              : chestPainData.emergencyInterventionInformedConsentStartTimeNstemi;             // 开始知情同意时间

            this.chestPainData.informedConsentSignatureTime = this.formatLocal
              ? this.formatLocal(chestPainData.emergencyInterventionInformedConsentSignTimeNstemi)
              : chestPainData.emergencyInterventionInformedConsentSignTimeNstemi;              // 签署知情同意时间

            // ==== GRACE ====
            this.chestPainData.graceRiskStratification = chestPainData.graceRiskStratificationNstemi; // GRACE 危险分层
            this.chestPainData.graceScore = chestPainData.graceScoreNstemi;              // GRACE 分值

            // 三项“评估” → graceAssessment
            this.chestPainData.graceAssessment = [];
            if (chestPainData.isCardiacArrestAfterOnset) this.chestPainData.graceAssessment.push('心脏骤停');
            if (chestPainData.isEcgStSegmentChange) this.chestPainData.graceAssessment.push('ST段改变');
            if (chestPainData.isCardiacNecrosisMarkerElevation) this.chestPainData.graceAssessment.push('心肌坏死标志物升高');

            // “极高危多选” → graceHighRisk
            this.chestPainData.graceHighRisk = [];
            if (chestPainData.isLifeThreateningArrhythmiaOrCardiacArrest) this.chestPainData.graceHighRisk.push('心律失常');
            if (chestPainData.isCardiogenicShockOrHemodynamicInstability) this.chestPainData.graceHighRisk.push('心源性休克');
            if (chestPainData.isMechanicalComplicationOfMyocardialInfarction) this.chestPainData.graceHighRisk.push('机械性并发症');
            if (chestPainData.isDynamicStSegmentChange) this.chestPainData.graceHighRisk.push('ST-T动态演变');
            if (chestPainData.isRefractoryAnginaAndStSegmentChange) this.chestPainData.graceHighRisk.push('急性心力衰竭');

            // ==== 初步诊断时间 ====
            this.chestPainData.diagFalsesisTime = this.formatLocal
              ? this.formatLocal(chestPainData.initialDiagnosisTime)
              : chestPainData.initialDiagnosisTime;

            // ==== 策略 ====
            this.chestPainData.invasiveStrategy = chestPainData.invasiveStrategyNstemi;      // 侵入性策略
            this.chestPainData.treatmentStrategy = chestPainData.treatmentStrategyNstemi;     // ★ 处理策略（补上）

            // ==== 后续治疗（是/否） ====
            this.chestPainData.treatment = this.convertBooleanToString(
              chestPainData.isSubsequentTreatmentNstemi
              ?? chestPainData.isFollowupTreatmentNstemi
              ?? chestPainData.isFurtherTreatmentNstemi
              ?? chestPainData.isSubsequentTreatment
              ?? false
            );

            // ==== 布尔开关 ====
            this.chestPainData.anticoagulation = this.convertBooleanToString(chestPainData.isAnticoagulationNstemi);       // 抗凝
            this.chestPainData.antiplateletTreatment = this.convertBooleanToString(chestPainData.isAntiplateletTherapyNstemi);   // 抗血小板治疗
            this.chestPainData.betaBlocker = this.convertBooleanToString(chestPainData.isBetaBlockerNstemi);           // β受体阻滞剂
            this.chestPainData.ccuBypass = this.convertBooleanToString(chestPainData.isBypassCcuNstemi);             // 绕行CCU
            this.chestPainData.emergencyBypass = this.convertBooleanToString(chestPainData.isBypassEmergencyNstemi);       // 绕行急诊
            this.chestPainData.statinTreatment = this.convertBooleanToString(chestPainData.isStatinTherapyNstemi);         // 他汀治疗

            // ==== 再次危险分层（结果+时间；不再把布尔写进 reassessment，避免覆盖显示） ====
            this.chestPainData.reassessment = chestPainData.repeatedRiskStratificationResultNstemi ?? '未做'; // 结果字符串
            this.chestPainData.reassessmentTime = this.formatLocal
              ? this.formatLocal(chestPainData.repeatedRiskStratificationTimeNstemi)
              : chestPainData.repeatedRiskStratificationTimeNstemi;

            this.patientId = chestPainData.patientId; // 患者ID
          }
          break
        case 'UA':
          /* const patUaDTO = {
            anticoagulantDoseUa: this.chestPainData.anticoagulantDose, // 抗凝剂量
            anticoagulantDrugUa: this.chestPainData.anticoagulantDrugs, // 抗凝药物
            anticoagulationTimeUa: this.chestPainData.anticoagulantTime, // 抗凝时间
            aspirinDosageUa: this.chestPainData.aspirinDose, // 阿司匹林剂量
            aspirinTimeUa: this.chestPainData.aspirinTime, // 阿司匹林时间
            cardiacFunctionGradeUa: this.chestPainData.heartFunctionClass, // 心功能分级
            clopidogrelDosageUa: this.chestPainData.clopidogrelDose, // 氯吡格雷剂量
            clopidogrelTimeUa: this.chestPainData.clopidogrelTime, // 氯吡格雷时间
            emergencyInterventionCathLabStartTimeUa: this.chestPainData.cathLabStartTime, // 启动导管室时间
            emergencyInterventionDecisionTimeUa: this.chestPainData.interventionDecisionTime, // 决定介入时间
            emergencyInterventionDoctorUa: this.chestPainData.decidingDoctor, // 决定医生
            emergencyInterventionInformedConsentSignTimeUa: this.chestPainData.informedConsentSignatureTime, // 签署知情同意时间
            emergencyInterventionInformedConsentStartTimeUa: this.chestPainData.informedConsentStartTime, // 开始知情同意时间
            graceRiskStratificationUa: this.chestPainData.graceRiskStratification, // Grace危险分层
            graceScoreUa: this.chestPainData.graceScore, // Grace分值
            initialDiagnosisTime: this.chestPainData.diagFalsesisTime, // 初步诊断时间
            invasiveStrategyUa: this.chestPainData.invasiveStrategy, // 侵入性策略
            isAnticoagulationUa: this.chestPainData.anticoagulation === 'True', // 抗凝
            isAntiplateletTherapyUa: this.chestPainData.antiplateletTreatment === 'True', // 抗血小板治疗
            isBetaBlockerUa: this.chestPainData.betaBlocker === 'True', // β受体阻滞剂
            isBypassCcuUa: this.chestPainData.ccuBypass=== 'True', // 绕行CCU
            isBypassEmergencyUa: this.chestPainData.emergencyBypass=== 'True', // 绕行急诊
            isCardiacArrestAfterOnsetUa: this.chestPainData.graceAssessment.includes('心脏骤停'), // 心脏骤停
            isCardiacNecrosisMarkerElevationUa: this.chestPainData.graceAssessment.includes('心肌坏死标志物升高'), // 心肌坏死标志物升高
            isCardiogenicShockOrHemodynamicInstabilityUa: this.chestPainData.graceHighRisk.includes('心源性休克'), // 心源性休克
            isDynamicStSegmentChangeUa: this.chestPainData.graceHighRisk.includes('ST-T动态演变'), // ST-T动态演变
            isEcgStSegmentChangeUa: this.chestPainData.graceAssessment.includes('ST段改变'), // ST段改变
            isLifeThreateningArrhythmiaOrCardiacArrestUa: this.chestPainData.graceHighRisk.includes('心律失常'), // 心律失常
            isMechanicalComplicationOfMyocardialInfarctionUa: this.chestPainData.graceHighRisk.includes('机械性并发症'), // 机械性并发症
            isRefractoryAnginaAndStSegmentChangeUa: this.chestPainData.graceHighRisk.includes('急性心力衰竭'), // 急性心力衰竭伴难治性心绞痛和ST段改变
            isRepeatedRiskStratificationUa: this.chestPainData.reassessment ==="未做", // 再次危险分层
            isStatinTherapyUa: this.chestPainData.statinTreatment === 'True', // 他汀治疗
            patientId: this.patientId, // 患者ID
            prasugrelDosageUa: this.chestPainData.ticagrelorDose, // 普拉格雷剂量
            prasugrelTimeUa: this.chestPainData.ticagrelorTime, // 普拉格雷时间
            repeatedRiskStratificationResultUa: this.chestPainData.reassessment, // 再次危险分层结果
            repeatedRiskStratificationTimeUa: this.chestPainData.reassessmentTime // 再次危险分层时间
          } */
          const response3 = await axios.post(API_URL + 'diagnosis/ua', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('ua')
          console.log(response3)
          if (response3.data.code === 200) {
            const listua = Array.isArray(response3.data.data)
              ? response3.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(listua);
            if (!chestPainData) return;
            this.chestPainData.anticoagulantDose = chestPainData.anticoagulantDoseUa
            this.chestPainData.anticoagulantDrugs = chestPainData.anticoagulantDrugUa
            this.chestPainData.anticoagulantTime = chestPainData.anticoagulationTimeUa
            this.chestPainData.aspirinDose = chestPainData.aspirinDosageUa
            this.chestPainData.aspirinTime = chestPainData.aspirinTimeUa
            this.chestPainData.heartFunctionClass = chestPainData.cardiacFunctionGradeUa
            this.chestPainData.clopidogrelDose = chestPainData.clopidogrelDosageUa
            this.chestPainData.clopidogrelTime = chestPainData.clopidogrelTimeUa
            this.chestPainData.cathLabStartTime = chestPainData.emergencyInterventionCathLabStartTimeUa
            this.chestPainData.interventionDecisionTime = chestPainData.emergencyInterventionDecisionTimeUa
            this.chestPainData.decidingDoctor = chestPainData.emergencyInterventionDoctorUa
            this.chestPainData.informedConsentSignatureTime = chestPainData.emergencyInterventionInformedConsentSignTimeUa
            this.chestPainData.informedConsentStartTime = chestPainData.emergencyInterventionInformedConsentStartTimeUa
            this.chestPainData.graceRiskStratification = chestPainData.graceRiskStratificationUa
            this.chestPainData.graceScore = chestPainData.graceScoreUa
            this.chestPainData.diagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime)
            this.chestPainData.treatmentStrategy=chestPainData.treatmentStrategyUa
            this.chestPainData.invasiveStrategy = chestPainData.invasiveStrategyUa
            this.chestPainData.anticoagulation = this.convertBooleanToString(chestPainData.isAnticoagulationUa)
            this.chestPainData.antiplateletTreatment = this.convertBooleanToString(chestPainData.isAntiplateletTherapyUa)
            this.chestPainData.betaBlocker = this.convertBooleanToString(chestPainData.isBetaBlockerUa)
            this.chestPainData.ccuBypass = this.convertBooleanToString(chestPainData.isBypassCcuUa)
            this.chestPainData.emergencyBypass = this.convertBooleanToString(chestPainData.isBypassEmergencyUa)
            this.chestPainData.ticagrelorDose = chestPainData.prasugrelDosageUa
            this.chestPainData.ticagrelorTime = chestPainData.prasugrelTimeUa
            this.chestPainData.statinTreatment = this.convertBooleanToString(chestPainData.isAnticoagulationUa)
            // 处理 graceAssessment 和 graceHighRisk
            this.chestPainData.graceAssessment = []
            if (chestPainData.isCardiacArrestAfterOnsetUa) {
              this.chestPainData.graceAssessment.push('心脏骤停')
            }
            if (chestPainData.isCardiacNecrosisMarkerElevationUa) {
              this.chestPainData.graceAssessment.push('心肌坏死标志物升高')
            }

            this.chestPainData.graceHighRisk = []
            if (chestPainData.isCardiogenicShockOrHemodynamicInstabilityUa) {
              this.chestPainData.graceHighRisk.push('心源性休克')
            }
            if (chestPainData.isDynamicStSegmentChangeUa) {
              this.chestPainData.graceHighRisk.push('ST-T动态演变')
            }
            if (chestPainData.isEcgStSegmentChangeUa) {
              this.chestPainData.graceAssessment.push('ST段改变')
            }
            if (chestPainData.isLifeThreateningArrhythmiaOrCardiacArrestUa) {
              this.chestPainData.graceHighRisk.push('心律失常')
            }
            if (chestPainData.isMechanicalComplicationOfMyocardialInfarctionUa) {
              this.chestPainData.graceHighRisk.push('机械性并发症')
            }
            if (chestPainData.isRefractoryAnginaAndStSegmentChangeUa) {
              this.chestPainData.graceHighRisk.push('急性心力衰竭')
            }
            this.chestPainData.reassessment = chestPainData.isRepeatedRiskStratificationUa ? '未做' : '已做' // 再次危险分层结果
            this.chestPainData.reassessmentTime = chestPainData.repeatedRiskStratificationTimeUa // 再次危险分层时间

            // console.log('还原后的 chestPainData:', this.chestPainData);
          }
          break

        case '主动脉夹层':
          /* const patHeartDisDTO = {
            initialDiagnosisTime: this.chestPainData.aorticDissectionDiagFalsesisTime, // 初步诊断时间
            imagingExaminationAad: this.chestPainData.aorticDissectionImaging, // 影像学检查
            notifyCtRoomTimeAad: this.chestPainData.ctFalsetificationTime, // 通知CT室时间
            ctRoomReadyTimeAad: this.chestPainData.ctPreparationTime, // CT室完成准备
            ctScanStartTimeAad: this.chestPainData.ctScanStartTime, // CT扫描开始时间
            ctReportTimeAad: this.chestPainData.ctReportTime, // CT报告时间
            notifyUltrasoundRoomTimeAad: this.chestPainData.ultrasoundFalsetificationTime, // 通知彩超室时间
            ultrasoundExaminationTimeAad: this.chestPainData.ultrasoundExamTime, // 彩超检查时间
            ultrasoundResultTimeAad: this.chestPainData.ultrasoundResultTime, // 彩超出结果时间
            cardiacSurgeryConsultationTimeAad: this.chestPainData.cardiacSurgeryConsultationTime, // 心外科会诊时间
            cardiacSurgeryConsultationTypeAad: this.chestPainData.cardiacSurgeryConsultationFalsetification, // 心外科会诊类型
            treatmentStrategyAad: this.chestPainData.treatmentStrategy, // 治疗策略
            aorticDissectionTypeAad: this.chestPainData.aorticDissectionType, // 夹层类型
            isCardiacSurgeryConsultationAad: this.chestPainData.consult === 'True', // 是否进行心外科会诊
            patientId: this.patientId // 患者ID
          } */
          const response4 = await axios.post(API_URL + 'diagnosis/heartinfo', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('heartinfo')
          console.log(response4)
          if (response4.data.code === 200) {
            const list1 = Array.isArray(response4.data.data)
              ? response4.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(list1);
            if (!chestPainData) return;
            this.chestPainData.aorticDissectionDiagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime) // 初步诊断时间
            this.chestPainData.aorticDissectionImaging = chestPainData.imagingExaminationAad // 影像学检查
            this.chestPainData.ctFalsetificationTime = chestPainData.notifyCtRoomTimeAad // 通知CT室时间
            this.chestPainData.ctPreparationTime = chestPainData.ctRoomReadyTimeAad // CT室完成准备
            this.chestPainData.ctScanStartTime = chestPainData.ctScanStartTimeAad // CT扫描开始时间
            this.chestPainData.ctReportTime = chestPainData.ctReportTimeAad // CT报告时间
            this.chestPainData.ultrasoundFalsetificationTime = chestPainData.notifyUltrasoundRoomTimeAad // 通知彩超室时间
            this.chestPainData.ultrasoundExamTime = chestPainData.ultrasoundExaminationTimeAad // 彩超检查时间
            this.chestPainData.ultrasoundResultTime = chestPainData.ultrasoundResultTimeAad // 彩超出结果时间
            this.chestPainData.cardiacSurgeryConsultationTime = chestPainData.cardiacSurgeryConsultationTimeAad // 心外科会诊时间
            this.chestPainData.cardiacSurgeryConsultationFalsetification = chestPainData.cardiacSurgeryConsultationTypeAad // 心外科会诊类型
            this.chestPainData.treatmentStrategy = chestPainData.treatmentStrategyAad // 治疗策略
            this.chestPainData.aorticDissectionType = chestPainData.aorticDissectionTypeAad // 夹层类型
            this.chestPainData.consult = this.convertBooleanToString(chestPainData.isCardiacSurgeryConsultationAad) // 是否进行心外科会诊
            // this.patientId = chestPainData.patientId; // 患者ID
          }
          break

        case '肺动脉栓塞':
          /* const patLungDTO = {
            initialDiagnosisTime: this.chestPainData.pulmonaryEmbolismDiagFalsesisTime, // 初步诊断时间
            pulmonaryEmbolismDoctor: this.chestPainData.pulmonaryEmbolismDoctor, // 医生
            imagingExaminationPe: this.chestPainData.pulmonaryEmbolismImaging, // 影像学检查
            notifyCtRoomTimePe: this.chestPainData.ctFalsetificationTimePE, // 通知CT室时间
            ctRoomReadyTimePe: this.chestPainData.ctPreparationTimePE, // CT室完成准备
            ctScanStartTimePe: this.chestPainData.ctScanStartTimePE, // CT扫描开始时间
            ctReportTimePe: this.chestPainData.ctReportTimePE, // CT报告时间
            riskStratificationPe: this.chestPainData.riskStratification, // 治疗信息（风险分层）
            anticoagulationStartTimePe: this.chestPainData.anticoagulationStartTime, // 开始抗凝治疗时间
            thrombolysisScreeningPe: this.chestPainData.thrombolysisScreening, // 院内溶栓治疗筛查
            isThrombolysisTreatmentPe: this.chestPainData.thrombolysisTreatment === '有', // 是否进行溶栓治疗
            patientId: this.patientId // 患者ID
          } */
          const response5 = await axios.post(API_URL + 'diagnosis/lung', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('lung')
          console.log(response5)
          if (response5.data.code === 200) {
            const list2 = Array.isArray(response5.data.data)
              ? response5.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(list2);
            if (!chestPainData) return;

            // —— 先让父块挂载出来（你的 v-if 用的是 “肺动脉栓塞”）——
            this.chestPainData.diagFalsesis = '肺动脉栓塞';
            await this.$nextTick();

            // —— 保证 datetime-local 的格式：YYYY-MM-DDTHH:mm ——
            const toLocal = (v) => {
              if (!v) return '';
              const s = String(v).trim();
              const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
              if (m) return m[1];                // 已是 2025-11-06T15:01[:ss] → 取前16位
              try { return new Date(s).toISOString().slice(0,16); }
              catch { return ''; }
            };

            // —— 进入回显模式，避免被 watcher/reset 清空 ——
            this._echoing = true;

            // 初步诊断时间（你之前是好的，这里继续保持本地化）
            this.chestPainData.pulmonaryEmbolismDiagFalsesisTime = toLocal(chestPainData.initialDiagnosisTime);

            // 影像学检查（你的 radio 值是“急诊CT/未做”，必须全字匹配；⚠️ 强制 trim）
            this.chestPainData.pulmonaryEmbolismImaging = (chestPainData.imagingExaminationPe ?? '').toString().trim();

            // ⚠️ 只有当影像学是“急诊CT”时，内层 v-if 才渲染四个时间输入
            //   保险：如果后端给的字符串带空格/大小写等，已用 trim 统一，可命中 v-if
            // 四个 CT 相关时间 + 抗凝开始时间（严格 toLocal）
            this.chestPainData.ctFalsetificationTimePE  = toLocal(chestPainData.notifyCtRoomTimePe);
            this.chestPainData.ctPreparationTimePE      = toLocal(chestPainData.ctRoomReadyTimePe);
            this.chestPainData.ctScanStartTimePE        = toLocal(chestPainData.ctScanStartTimePe);
            this.chestPainData.ctReportTimePE           = toLocal(chestPainData.ctReportTimePe);
            this.chestPainData.anticoagulationStartTime = toLocal(chestPainData.anticoagulationStartTimePe);

            // 治疗信息（你的 radio 值是“高危/中危/低危”“合适/不合适/未筛查”，必须全字匹配；⚠️ 强制 trim）
            this.chestPainData.riskStratification    = (chestPainData.riskStratificationPe ?? '').toString().trim();
            this.chestPainData.thrombolysisScreening = (chestPainData.thrombolysisScreeningPe ?? '').toString().trim();

            // 溶栓治疗（你的 radio 值是“有/无”）
            this.chestPainData.thrombolysisTreatment = chestPainData.isThrombolysisTreatmentPe ? '有' : '无';

            this._echoing = false;

            // —— 最后一手：下一帧再写一遍，防止异步 watch 抹值 ——
            this.$nextTick(() => {
              this.chestPainData.pulmonaryEmbolismImaging = (chestPainData.imagingExaminationPe ?? '').toString().trim();
              this.chestPainData.ctFalsetificationTimePE  = toLocal(chestPainData.notifyCtRoomTimePe);
              this.chestPainData.ctPreparationTimePE      = toLocal(chestPainData.ctRoomReadyTimePe);
              this.chestPainData.ctScanStartTimePE        = toLocal(chestPainData.ctScanStartTimePe);
              this.chestPainData.ctReportTimePE           = toLocal(chestPainData.ctReportTimePe);
              this.chestPainData.anticoagulationStartTime = toLocal(chestPainData.anticoagulationStartTimePe);
              this.chestPainData.riskStratification       = (chestPainData.riskStratificationPe ?? '').toString().trim();
              this.chestPainData.thrombolysisScreening    = (chestPainData.thrombolysisScreeningPe ?? '').toString().trim();
              this.chestPainData.thrombolysisTreatment    = chestPainData.isThrombolysisTreatmentPe ? '有' : '无';
            });
          }
          break;

        case '非ACS心源性胸痛':
          /* const patAntiACSDTO = {
            initialDiagnosisTime: this.chestPainData.FalsenACSChestPainDiagFalsesisTime, // 初步诊断时间
            nonAcsCardiogenicChestPainType: this.chestPainData.FalsenACSChestPainType, // 非ACS心源性胸痛类型
            treatmentMeasuresNonAcs: this.chestPainData.FalsenACSChestPainTreatment, // 处理措施
            patientDispositionNonAcs: this.chestPainData.FalsenACSChestPainDoctor, // 诊断医生
            patientId: this.patientId, // 患者ID
            //createTime: new Date().toISOString(), // 创建时间
            //updateTime: new Date().toISOString() // 更新时间
          } */
          const response6 = await axios.post(API_URL + 'diagnosis/antiacs', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('antiacs')
          console.log(response6)
          if (response6.data.code === 200) {
            const list3 = Array.isArray(response6.data.data)
              ? response6.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(list3);
            if (!chestPainData) return;
            this.chestPainData.FalsenACSChestPainDiagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime) // 初步诊断时间
            this.chestPainData.FalsenACSChestPainType = chestPainData.nonAcsCardiogenicChestPainType // 非ACS心源性胸痛类型
            this.chestPainData.FalsenACSChestPainTreatment = chestPainData.treatmentMeasuresNonAcs // 处理措施
            this.chestPainData.FalsenACSChestPainDoctor = chestPainData.patientDispositionNonAcs // 诊断医生
            // this.patientId = chestPainData.patientId; // 患者ID
          }
          break

        case '其它非心源性胸痛':
          /* const patOtherHeartDTO = {
            initialDiagnosisTime: this.chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime, // 初步诊断时间
            otherNonCardiacChestPainType: this.chestPainData.otherFalsenCardiacChestPainType, // 其它非心源性胸痛类型
            treatmentMeasureOther: this.chestPainData.otherFalsenCardiacChestPainTreatment, // 处理措施
            patientStatusOther: this.chestPainData.otherFalsenCardiacChestPainDoctor, // 诊断医生
            patientId: this.patientId, // 患者ID
          } */
          const response7 = await axios.post(API_URL + 'diagnosis/otherheart', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('otherheart')
          console.log(response7)
          if (response7.data.code === 200) {
            const list5 = Array.isArray(response7.data.data)
              ? response7.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(list5);
            if (!chestPainData) return;
            this.chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime) // 初步诊断时间
            this.chestPainData.otherFalsenCardiacChestPainType = chestPainData.otherNonCardiacChestPainType // 其它非心源性胸痛类型
            this.chestPainData.otherFalsenCardiacChestPainTreatment = chestPainData.treatmentMeasureOther // 处理措施
            this.chestPainData.otherFalsenCardiacChestPainDoctor = chestPainData.patientStatusOther // 诊断医生
            // this.patientId = chestPainData.patientId; // 患者ID
          }
          break

        case '待查':
          /* const patTodoDTO = {
            initialDiagnosisTime: this.chestPainData.pendingDiagFalsesisTime, // 初步诊断时间
            patientDispositionPending: this.chestPainData.pendingDoctor, // 诊断医生
            treatmentMeasuresPending: this.chestPainData.pendingTreatment, // 处理措施
            patientId: this.patientId, // 患者ID
          } */
          const response8 = await axios.post(API_URL + 'diagnosis/todo', null,
            {
              params: {patientId: this.patientId},
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              }
            })
          console.log('todo')
          console.log(response8)
          if (response8.data.code === 200) {
            const list6 = Array.isArray(response8.data.data)
              ? response8.data.data.filter(x => x && x.patientId === this.patientId)
              : [];
            const chestPainData = this.pickLatestRecord(list6);
            if (!chestPainData) return;
            this.chestPainData.pendingDiagFalsesisTime = this.formatDateTime(chestPainData.initialDiagnosisTime) // 初步诊断时间
            this.chestPainData.pendingDoctor = chestPainData.patientDispositionPending // 诊断医生
            this.chestPainData.pendingTreatment = chestPainData.treatmentMeasuresPending // 处理措施
            // this.patientId = chestPainData.patientId; // 患者ID
          }
          break

        default:
          console.error('未知的初步诊断类型')
          return
      }

      if (this.chestPainData.reperfusionMethod === '直接PCI' || this.chestPainData.reperfusionMeehod === '溶栓' || this.chestPainData.reperfusionMethod === '补救PCI') {
        /* const patCatheterDTO = {
          catheterLabActivationTime: this.catheterData.catheterLabActivationTime, // 导管室激活时间
          patientArrivalCatheterLabTime: this.catheterData.patientArrivalCatheterLabTime, // 患者到达导管室时间
          interventionist: this.catheterData.interventionist, // 介入医师姓名
          startPunctureTime: this.catheterData.startPunctureTime, // 开始穿刺时间
          angiographyStartTime: this.catheterData.angiographyStartTime, // 造影开始时间
          anticoagulationDrugAdministrationTime: this.catheterData.anticoagulationDrugAdministrationTime, // 抗凝给药时间
          anticoagulationDrug: this.catheterData.anticoagulationDrug, // 抗凝药物种类
          anticoagulationDrugDose: this.catheterData.anticoagulationDrugDose, // 抗凝药物剂量
          anticoagulationDrugUnit: this.catheterData.anticoagulationDrugUnit, // 抗凝药物剂量单位
          surgeryEndTime: this.catheterData.surgeryEndTime, // 手术结束时间
          isDelayed: this.catheterData.isDelayed === 'True', // 是否延误
          delayReasons: this.catheterData.delayReasons, // 延误原因
          patientId: this.patientId
        }; */
        const response77 = await axios.post(API_URL + 'catheter/castemi', patCatheterDTO,
          {
            params: {patientId: this.patientId},
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            }
          })
        console.log('castemi')
        console.log(response77)
        if (response77.data.code === 200) {
          const catheterData = response77.data.data.find(item => item.patientId === this.patientId) // 假设这是从后端获取的数据
          this.catheterData.catheterLabActivationTime = this.formatDateTime(catheterData.catheterLabActivationTime) // 导管室激活时间
          this.catheterData.patientArrivalCatheterLabTime = this.formatDateTime(catheterData.patientArrivalCatheterLabTime) // 患者到达导管室时间
          this.catheterData.interventionist = catheterData.interventionist // 介入医师姓名
          this.catheterData.startPunctureTime = this.formatDateTime(catheterData.startPunctureTime) // 开始穿刺时间
          this.catheterData.angiographyStartTime = this.formatDateTime(catheterData.angiographyStartTime) // 造影开始时间
          this.catheterData.anticoagulationDrugAdministrationTime = this.formatDateTime(catheterData.anticoagulationDrugAdministrationTime) // 抗凝给药时间
          this.catheterData.anticoagulationDrug = catheterData.anticoagulationDrug // 抗凝药物种类
          this.catheterData.anticoagulationDrugDose = catheterData.anticoagulationDrugDose // 抗凝药物剂量
          this.catheterData.anticoagulationDrugUnit = catheterData.anticoagulationDrugUnit // 抗凝药物剂量单位
          this.catheterData.surgeryEndTime = this.formatDateTime(catheterData.surgeryEndTime) // 手术结束时间
          this.catheterData.isDelayed = catheterData.isDelayed === 'True' // 是否延误
          this.catheterData.delayReasons = catheterData.delayReasons // 延误原因
          // this.patientId = catheterData.patientId; // 患者ID
        }
      }
    },
    async outdia() {
      /* const patOutDTO = {
        diagnosis: this.outcomeData.dischargeDiagFalsesis,

        // 确诊时间
        diagnosisConfirmationTime: this.outcomeData.confirmedDate ? new Date(this.outcomeData.confirmedDate).toISOString() : null,

        // 院内新发心力衰竭
        isNewOnsetHeartFailureInHospital: this.outcomeData.newHeartFailure,

        // 合并症
        complications: this.outcomeData.comorbidities,

        // 危险因素
        isHypertension: this.outcomeData.hypertension,
        isHyperlipidemia: this.outcomeData.hyperlipidemia,
        isDiabetes: this.outcomeData.diabetes,
        isSmoking: this.outcomeData.smoking,
        isObesity: this.outcomeData.obesity,
        isEarlyOnsetCVDFamilyHistory: this.outcomeData.familyHistory,

        // 合并疾病
        isCoronaryHeartDisease: this.outcomeData.coronaryHeartDisease,
        isRevascularizationHistory: this.outcomeData.revascularizationHistory,
        isAtrialFibrillation: this.outcomeData.af,
        atrialFibrillationType: this.outcomeData.afType,
        isChronicHeartFailure: this.outcomeData.chronicHeartFailure,
        isValvularHeartDisease: this.outcomeData.heartValveDisease,
        isCerebrovascularDisease: this.outcomeData.cerebrovascularDisease,
        cerebrovascularDiseaseType: this.outcomeData.cerebrovascularDiseaseType,
        isPeripheralArterialDisease: this.outcomeData.peripheralArteryDisease,
        isAorticAneurysm: this.outcomeData.aorticAneurysm,
        isCOPD: this.outcomeData.copd,
        isChronicKidneyDisease: this.outcomeData.chronicKidneyDisease,
        isAnemia: this.outcomeData.anemia,
        isPepticUlcer: this.outcomeData.pepticUlcer,
        isThyroidDysfunction: this.outcomeData.thyroidFunctionAbFalsermal,

        // 检查结果
        is72hTroponinChecked: this.outcomeData.troponin72h,
        troponinMaxValue72h: this.outcomeData.troponinMaxValue ? parseFloat(this.outcomeData.troponinMaxValue) : null,
        troponinType72h: this.outcomeData.troponin72h,

        isNatriureticPeptideChecked: this.outcomeData.bnp ? true : false,
        natriureticPeptideType: this.outcomeData.bnp,
        natriureticPeptideMaxValue: this.outcomeData.bnpMaxValue ? parseFloat(this.outcomeData.bnpMaxValue) : null,

        isTotalCholesterolChecked: this.outcomeData.tc,
        totalCholesterolValue: this.outcomeData.tcValue ? parseFloat(this.outcomeData.tcValue) : null,

        isTriglycerideChecked: this.outcomeData.tg,
        triglycerideValue: this.outcomeData.tgValue ? parseFloat(this.outcomeData.tgValue) : null,

        isHDLChecked: this.outcomeData.hdl,
        hdlValue: this.outcomeData.hdlValue ? parseFloat(this.outcomeData.hdlValue) : null,

        isLDLChecked: this.outcomeData.ldl,
        dlValue: this.outcomeData.ldlValue ? parseFloat(this.outcomeData.ldlValue) : null,

        isEchocardiogramChecked: this.outcomeData.echo,
        isVentricularAneurysm: this.outcomeData.wallAneurysm,
        isRegionalWallMotionAbnormality: this.outcomeData.wallMotionAbFalsermality,

        // 非ACS心源性胸痛类型
        nonACSCardiogenicChestPainType: this.outcomeData.FalsenACSChestPainType,

        // 其它非心源性胸痛类型
        otherNonCardiacChestPainType: this.outcomeData.otherFalsenCardiacChestPainType,

        // COVID-19
        isCovid: this.outcomeData.covid === "True",

        // 住院期间用药
        isAntidiabetic: this.outcomeData.antidiabetic === "True",
        isOralAnticoagulants: this.outcomeData.oralAnticoagulants === "True",
        isLipidRegulating: this.outcomeData.lipidRegulating === "True",
        patientId: this.patientId,

      }; */

      const response = await axios.post(API_URL + 'outhospital/outdia', null,
        {
          params: {patientId: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('outdia')
      console.log(response)
      if (response.data.code === 200) {
        const list = (response.data?.data || []).filter(i => i.patientId === this.patientId);
        list.sort((a, b) => ((b.id ?? 0) - (a.id ?? 0)));
        const outcomeData = list[0] || {};// 假设这是从后端获取的数据
        this.outcomeData.dischargeDiagFalsesis = outcomeData.diagnosis

        // 确诊时间
        this.outcomeData.confirmedDate = this.formatDateTime(outcomeData.diagnosisConfirmationTime)

        // 院内新发心力衰竭
        this.outcomeData.newHeartFailure = this.convertBooleanToString(outcomeData.isNewOnsetHeartFailureInHospital)

        // 合并症
        this.outcomeData.comorbidities = outcomeData.complications

        // 危险因素
        this.outcomeData.hypertension = this.convertBooleanToString(outcomeData.isHypertension)
        this.outcomeData.hyperlipidemia = this.convertBooleanToString(outcomeData.isHyperlipidemia)
        this.outcomeData.diabetes = this.convertBooleanToString(outcomeData.isDiabetes)
        this.outcomeData.smoking = this.convertBooleanToString(outcomeData.isSmoking)
        this.outcomeData.obesity = this.convertBooleanToString(outcomeData.isObesity)
        this.outcomeData.familyHistory = this.convertBooleanToString(outcomeData.isEarlyOnsetCVDFamilyHistory)

        // 合并疾病
        this.outcomeData.coronaryHeartDisease = this.convertBooleanToString(outcomeData.isCoronaryHeartDisease)
        this.outcomeData.revascularizationHistory = this.convertBooleanToString(outcomeData.isRevascularizationHistory)
        this.outcomeData.af = this.convertBooleanToString(outcomeData.isAtrialFibrillation)
        this.outcomeData.afType = outcomeData.atrialFibrillationType
        this.outcomeData.chronicHeartFailure = this.convertBooleanToString(outcomeData.isChronicHeartFailure)
        this.outcomeData.heartValveDisease = this.convertBooleanToString(outcomeData.isValvularHeartDisease)
        this.outcomeData.cerebrovascularDisease = this.convertBooleanToString(outcomeData.isCerebrovascularDisease)
        this.outcomeData.cerebrovascularDiseaseType = outcomeData.cerebrovascularDiseaseType
        this.outcomeData.peripheralArteryDisease = this.convertBooleanToString(outcomeData.isPeripheralArterialDisease)
        this.outcomeData.aorticAneurysm = this.convertBooleanToString(outcomeData.isAorticAneurysm)
        this.outcomeData.copd = this.convertBooleanToString(outcomeData.isCOPD)
        this.outcomeData.chronicKidneyDisease = this.convertBooleanToString(outcomeData.isChronicKidneyDisease)
        this.outcomeData.anemia = this.convertBooleanToString(outcomeData.isAnemia)
        this.outcomeData.pepticUlcer = this.convertBooleanToString(outcomeData.isPepticUlcer)
        this.outcomeData.thyroidFunctionAbFalsermal = this.convertBooleanToString(outcomeData.isThyroidDysfunction)

        // 检查结果
        this.outcomeData.troponin72hChecked = this.convertBooleanToString(outcomeData.is72hTroponinChecked)
        this.outcomeData.troponinMaxValue = outcomeData.troponinMaxValue72h ? parseFloat(outcomeData.troponinMaxValue72h) : null;
        this.outcomeData.troponin72h = outcomeData.troponinType72h

        this.outcomeData.bnp = this.convertBooleanToString(outcomeData.isNatriureticPeptideChecked)
        this.outcomeData.bnp = outcomeData.natriureticPeptideType
        this.outcomeData.bnpMaxValue = outcomeData.natriureticPeptideMaxValue ? parseFloat(outcomeData.natriureticPeptideMaxValue) : null

        this.outcomeData.tc = this.convertBooleanToString(outcomeData.isTotalCholesterolChecked)
        this.outcomeData.tcValue = outcomeData.totalCholesterolValue ? parseFloat(outcomeData.totalCholesterolValue) : null

        this.outcomeData.tg = this.convertBooleanToString(outcomeData.isTriglycerideChecked)
        this.outcomeData.tgValue = outcomeData.triglycerideValue ? parseFloat(outcomeData.triglycerideValue) : null

        this.outcomeData.hdl = this.convertBooleanToString(outcomeData.isHDLChecked)
        this.outcomeData.hdlValue = outcomeData.hdlValue ? parseFloat(outcomeData.hdlValue) : null

        this.outcomeData.ldl = this.convertBooleanToString(outcomeData.isLDLChecked)
        this.outcomeData.ldlValue = (outcomeData.dlValue != null && outcomeData.dlValue !== '')
          ? parseFloat(outcomeData.dlValue)
          : null;

        this.outcomeData.echo = this.convertBooleanToString(outcomeData.isEchocardiogramChecked)
        this.outcomeData.wallAneurysm = this.convertBooleanToString(outcomeData.isVentricularAneurysm)
        this.outcomeData.wallMotionAbFalsermality = this.convertBooleanToString(outcomeData.isRegionalWallMotionAbnormality)

        // 非ACS心源性胸痛类型
        this.outcomeData.FalsenACSChestPainType = outcomeData.nonACSCardiogenicChestPainType

        // 其它非心源性胸痛类型
        this.outcomeData.otherFalsenCardiacChestPainType = outcomeData.otherNonCardiacChestPainType

        // COVID-19
        this.outcomeData.covid = this.convertBooleanToString(outcomeData.isCovid)

        // 住院期间用药
        this.outcomeData.antidiabetic = this.convertBooleanToString(outcomeData.isAntidiabetic)
        this.outcomeData.oralAnticoagulants = this.convertBooleanToString(outcomeData.isOralAnticoagulants)
        this.outcomeData.lipidRegulating = this.convertBooleanToString(outcomeData.isLipidRegulating)
        this.patientId = outcomeData.patientId
      }
    },
    async out() {
      /* const patOutInfoDTO = {
        // 住院天数
        hospitalizationDays: this.outcomeData.hospitalDays,

        // 总费用
        totalCost: this.outcomeData.totalCost,

        // 出院还是转归
        patientOutcome: this.outcomeData.dischargeStatus,

        // 出院相关信息
        dischargeTime: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.dischargeTime : null,
        treatmentOutcome: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.treatmentOutcome : null,
        isCarryMedicationAfterDischarge: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.antiplateletMedication === 'True' : false,
        antithromboticDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.antiplateletMedication === 'True' ? this.outcomeData.antiplateletDrugName : null,
        antithromboticDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.antiplateletMedication === 'True' ? parseFloat(this.outcomeData.antiplateletDosage) : null,
        isACEIARB: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.aceArbMedication === 'True' : false,
        aceiarbDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.aceArbMedication === 'True' ? this.outcomeData.aceArbDrugName : null,
        aceiarbDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.aceArbMedication === 'True' ? parseFloat(this.outcomeData.aceArbDosage) : null,
        isLipidLoweringDrug: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.lipidRegulatingMedication === 'True' : false,
        lipidLoweringDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.lipidRegulatingMedication === 'True' ? this.outcomeData.lipidRegulatingDrugName : null,
        lipidLoweringDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.lipidRegulatingMedication === 'True' ? parseFloat(this.outcomeData.lipidRegulatingDosage) : null,
        isBetaBlocker: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.betaBlockerMedication === 'True' : false,
        betaBlockerDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.betaBlockerMedication === 'True' ? this.outcomeData.betaBlockerDrugName : null,
        betaBlockerDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.betaBlockerMedication === 'True' ? parseFloat(this.outcomeData.betaBlockerDosage) : null,

        // 转送其他医院相关信息
        leaveHospitalTime: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.departureTime : null,
        isNetworkHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.networkHospital === 'True' : false,
        transferHospitalName: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.networkHospital === 'True' ? this.outcomeData.networkHospitalName : null,
        isTransferPCI: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.transferPci === 'True' : false,
        isDirectToCatheterLab: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.directCathLab === 'True' : false,
        actualInterventionStartTime: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.directCathLab === 'True' ? this.outcomeData.actualInterventionStartTime : null,
        isTeleEcgTransmission: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.ecgTransmission === '传输心电图至协作单位' : false,
        ecgTransmissionTime: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' ? this.outcomeData.ecgTransmissionTime : null,
        ecgTransmissionMethod: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' ? this.outcomeData.ecgTransmissionMethod : null,

        // 转送其他科室相关信息
        transferDepartmentTime: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.transferTime : null,
        acceptingDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.admittingDepartment : null,
        transferDepartmentReason: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.transferReason : null,

        // 死亡相关信息
        deathTime: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathTime : null,
        isCardiacCauseOfDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathCause === '心源性' : false,
        patientConditionDescriptionDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathDescription : null,

        // 其他备注
        patientConditionDescriptionTransferDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.remarks : null,
        patientConditionDescriptionTransferHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.remarks : null,
        remarks: this.outcomeData.remarks

      };
      console.log("patOutInfoDTO")
      console.log(patOutInfoDTO) */
      const response = await axios.post(API_URL + 'outhospital/out', null,
        {
          params: {patientId: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        })
      console.log('out')
      console.log(response)
      if (response.data.code === 200) {
        const list = (response.data?.data || []).filter(i => i.patientId === this.patientId);
        list.sort((a, b) => ((b.id ?? 0) - (a.id ?? 0)));
        const outcomeData = list[0] || {};// 假设这是从后端获取的数据
        this.outcomeData.hospitalDays = outcomeData.hospitalizationDays

        // 总费用
        this.outcomeData.totalCost = outcomeData.totalCost

        // 出院还是转归
        this.outcomeData.dischargeStatus = outcomeData.patientOutcome

        // 出院相关信息
        // 放在 out() 拉到 outcomeData 后、回填“出院相关信息”的位置
        const b = (v) => v === true || v === 'True' || v === 1 || v === '1';
        const n = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };

        if (this.outcomeData.dischargeStatus === '出院') {
      // 出院时间 / 治疗转归
        this.outcomeData.dischargeTime = outcomeData.dischargeTime ? this.formatDateTime(outcomeData.dischargeTime) : null;
        this.outcomeData.treatmentOutcome = outcomeData.treatmentOutcome || null;

      // 1) 抗血小板药物（带药出院）
        this.outcomeData.antiplateletMedication = b(outcomeData.isCarryMedicationAfterDischarge) ? 'True' : 'False';
        this.outcomeData.antiplateletDrugName = this.outcomeData.antiplateletMedication === 'True'
            ? (outcomeData.antithromboticDrugName || null) : null;
        this.outcomeData.antiplateletDosage = this.outcomeData.antiplateletMedication === 'True'
            ? n(outcomeData.antithromboticDrugDose) : null;

      // 2) ACEI/ARB
        this.outcomeData.aceArbMedication = b(outcomeData.isACEIARB) ? 'True' : 'False';
        this.outcomeData.aceArbDrugName = this.outcomeData.aceArbMedication === 'True'
            ? (outcomeData.aceiarbDrugName || null) : null;
        this.outcomeData.aceArbDosage = this.outcomeData.aceArbMedication === 'True'
            ? n(outcomeData.aceiarbDrugDose) : null;

      // 3) 调脂药物（他汀等）
        this.outcomeData.lipidRegulatingMedication = b(outcomeData.isLipidLoweringDrug) ? 'True' : 'False';
        this.outcomeData.lipidRegulatingDrugName = this.outcomeData.lipidRegulatingMedication === 'True'
            ? (outcomeData.lipidLoweringDrugName || null) : null;
        this.outcomeData.lipidRegulatingDosage = this.outcomeData.lipidRegulatingMedication === 'True'
            ? n(outcomeData.lipidLoweringDrugDose) : null;

      // 4) β受体阻滞剂
        this.outcomeData.betaBlockerMedication = b(outcomeData.isBetaBlocker) ? 'True' : 'False';
        this.outcomeData.betaBlockerDrugName = this.outcomeData.betaBlockerMedication === 'True'
            ? (outcomeData.betaBlockerDrugName || null) : null;
        this.outcomeData.betaBlockerDosage = this.outcomeData.betaBlockerMedication === 'True'
            ? n(outcomeData.betaBlockerDrugDose) : null;

        } else {
      // 非“出院”时，清空出院相关字段，避免脏数据残留影响渲染
        this.outcomeData.dischargeTime = null;
        this.outcomeData.treatmentOutcome = null;

        this.outcomeData.antiplateletMedication = 'False';
        this.outcomeData.antiplateletDrugName = null;
        this.outcomeData.antiplateletDosage = null;

        this.outcomeData.aceArbMedication = 'False';
        this.outcomeData.aceArbDrugName = null;
        this.outcomeData.aceArbDosage = null;

        this.outcomeData.lipidRegulatingMedication = 'False';
        this.outcomeData.lipidRegulatingDrugName = null;
        this.outcomeData.lipidRegulatingDosage = null;

        this.outcomeData.betaBlockerMedication = 'False';
        this.outcomeData.betaBlockerDrugName = null;
        this.outcomeData.betaBlockerDosage = null;
      }

        // 转送其他医院相关信息
        // —— 放在 out() 拉到 outcomeData 后 ——
        // 转送其他医院相关信息（统一布尔归一化）


        if (this.outcomeData.dischargeStatus === '转送其他医院') {
            // 离开本院大门时间
          this.outcomeData.departureTime =
          outcomeData.leaveHospitalTime ? this.formatDateTime(outcomeData.leaveHospitalTime) : null;

            // 网络医院（单选 True/False）
          this.outcomeData.networkHospital = b(outcomeData.isNetworkHospital) ? 'True' : 'False';
          this.outcomeData.networkHospitalName =
          this.outcomeData.networkHospital === 'True' ? (outcomeData.transferHospitalName || null) : null;

            // 转运PCI（单选 True/False）
          this.outcomeData.transferPci = b(outcomeData.isTransferPCI) ? 'True' : 'False';

            // 直达导管室（单选 True/False）+ 实际介入手术开始时间（仅直达导管室=是时显示）
          this.outcomeData.directCathLab = b(outcomeData.isDirectToCatheterLab) ? 'True' : 'False';
          this.outcomeData.actualInterventionStartTime =
          this.outcomeData.directCathLab === 'True' && outcomeData.actualInterventionStartTime
              ? this.formatDateTime(outcomeData.actualInterventionStartTime)
              : null;

            // 远程心电图传输（枚举：'传输心电图至协作单位' / '无'）
          this.outcomeData.ecgTransmission = b(outcomeData.isTeleEcgTransmission)
              ? '传输心电图至协作单位'
              : '无';

            // 仅在“传输心电图至协作单位”时回填时间和方式
          this.outcomeData.ecgTransmissionTime =
          this.outcomeData.ecgTransmission === '传输心电图至协作单位' && outcomeData.ecgTransmissionTime
              ? this.formatDateTime(outcomeData.ecgTransmissionTime)
              : null;

          this.outcomeData.ecgTransmissionMethod =
          this.outcomeData.ecgTransmission === '传输心电图至协作单位'
              ? (outcomeData.ecgTransmissionMethod || null)
              : null;
          }  else {
            // 非“转送其他医院”场景，保险起见清空这些字段
          this.outcomeData.departureTime = null;
          this.outcomeData.networkHospital = 'False';
          this.outcomeData.networkHospitalName = null;
          this.outcomeData.transferPci = 'False';
          this.outcomeData.directCathLab = 'False';
          this.outcomeData.actualInterventionStartTime = null;
          this.outcomeData.ecgTransmission = '无';
          this.outcomeData.ecgTransmissionTime = null;
          this.outcomeData.ecgTransmissionMethod = null;
          }
        // 转送其他科室相关信息
        this.outcomeData.transferTime = this.outcomeData.dischargeStatus === '转送其它科室' ? this.formatDateTime(outcomeData.transferDepartmentTime) : null
        this.outcomeData.admittingDepartment = this.outcomeData.dischargeStatus === '转送其它科室' ? outcomeData.acceptingDepartment : null
        this.outcomeData.transferReason = this.outcomeData.dischargeStatus === '转送其它科室' ? outcomeData.transferDepartmentReason : null


        // 死亡相关信息（替换原来的三行中的第二行）
        this.outcomeData.deathTime = this.outcomeData.dischargeStatus === '死亡' ? this.formatDateTime(outcomeData.deathTime) : null
        if (this.outcomeData.dischargeStatus === '死亡') {
            const v = outcomeData.isCardiacCauseOfDeath
            const yes = v === true || v === 'True' || v === 1 || v === '1'
            const no  = v === false || v === 'False' || v === 0 || v === '0'
            this.outcomeData.deathCause = yes ? '心源性' : (no ? '非心源性' : null)
        } else {
             this.outcomeData.deathCause = null
            }
        this.outcomeData.deathDescription = this.outcomeData.dischargeStatus === '死亡' ? outcomeData.patientConditionDescriptionDeath : null


        // 其他备注
        this.outcomeData.remarksTransferDepartment = this.outcomeData.dischargeStatus === '转送其它科室' ? outcomeData.patientConditionDescriptionTransferDepartment : null
        this.outcomeData.remarksTransferHospital = this.outcomeData.dischargeStatus === '转送其他医院' ? outcomeData.patientConditionDescriptionTransferHospital : null
        this.outcomeData.remarks = outcomeData.remarks
      }
      // this.getTimeLine()
    },
    async getPatientData() {
      const id = this.patientId
      console.log('id:' + id)
      console.log('id:' + typeof id)
      this.token = getToken()
      console.log('token:' + this.token)
      await this.patInfo()
      await Promise.allSettled([
        this.patEmInfo(),
        this.patConInfo(),
        this.patAdInfo(),
        this.patViInfo(),
        this.patEcgInfo(),
        this.lab?.(),
        this.heart?.(),
        this.outdia?.(),
        this.out?.()])


    },
    handleOpenTimeline() {
      console.log('[调试] 按钮点击事件已触发') // 调试输出
      this.fetchData()
      this.showTimeline = true
      console.log('[调试] showTimeline 值已设置为:', this.showTimeline) // 验证数据状态
    },
    handleCloseTimeline() {
      this.showTimeline = false
    },
    fetchData() {
      // 模拟请求数据
      const events = [
        {name: '发病时间', time: '2024/7/1 00:00:00', timespy: 0},
        {name: '到达医院大门时间', time: '2024/7/16 07:00:00', timespy: 0},
        {name: '首次医疗接触时间', time: '2024/7/16 07:30:00', timespy: 0},
        {name: '首次医师接诊时间', time: '2024/7/16 07:31:00', timespy: 0},
        {name: '初步诊断时间', time: '2024/7/16 07:33:00', timespy: 0},
        {name: 'CT完成时间', time: '2024/7/16 07:37:00', timespy: 0},
        {name: '开始抗凝时间', time: '2024/7/16 07:45:00', timespy: 0},
        {name: '首份心电图', time: '2024/7/16 07:55:00', timespy: 0},
        {name: '抽血时间', time: '2024/7/16 07:56:00', timespy: 0},
        {name: '报告时间', time: '2024/7/16 08:00:00', timespy: 0}
      ]
      this.processEvents(events) // 处理获取的数据
    },
    processEvents(events) {
      // 处理事件逻辑
      this.processedEvents = []
      for (let i = 0; i < events.length; i++) {
        const currentEvent = events[i]
        const currentTime = new Date(currentEvent.time)
        let timeDifference = 0

        if (i === 0) {
          this.processedEvents.push({
            ...currentEvent,
            formattedTime: currentEvent.time,
            timespy: 0
          })
        } else {
          const previousEvent = events[i - 1]
          const previousTime = new Date(previousEvent.time)
          timeDifference = Math.floor((currentTime - previousTime) / 60000)

          this.processedEvents.push({
            ...currentEvent,
            formattedTime: this.formatTime(currentTime, previousEvent.time),
            timespy: timeDifference
          })
        }
      }
    },
    formatTime(currentTime, previousTime) {
      const day = currentTime.getDate()
      const month = currentTime.getMonth() + 1
      const year = currentTime.getFullYear()
      const hours = String(currentTime.getHours()).padStart(2, '0')
      const minutes = String(currentTime.getMinutes()).padStart(2, '0')

      if (previousTime) {
        const prevDate = new Date(previousTime)
        if (prevDate.getDate() !== day || prevDate.getMonth() + 1 !== month || prevDate.getFullYear() !== year) {
          return `${year}/${month}/${day} ${hours}:${minutes}`
        }
      }

      return `${hours}:${minutes}`
    },

    view_postdata(id) {
      // 这里实现会诊的逻辑
      console.log('申报查看', id)
      this.$store.dispatch('user/Set_PatientID', id).then(() => {
        this.$router.push({
          path: '/chestpain/review',
          query: {
            module: 'outcome'
          }
        })
      })
    },

    async updateFillFlag() {
      try {
        const pid = parseInt(this.patientId, 10)
        if (!pid || isNaN(pid)) {
          console.warn('updateFillFlag: patientId 无效，跳过')
          return false
        }
        const response = await axios.post(API_URL + 'pat/patInfoUpdate', null, {
          params: { patientId: pid, fillFlag: 1 },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        });
        if (!response || !response.data || response.data.code !== 200) {
          throw new Error('更新标志位失败');
        }
        return true;
      } catch (err) {
        console.error('updateFillFlag error:', err);
        console.warn('更新患者填写标志失败，不影响已提交数据');
        return false;
      }
    },

    async validateFormFields() {
      let isValid = true;

      // 1) 必填校验
      const requiredFields = [
        {field: 'name', label: '姓名'},
        {field: 'age', label: '年龄'},
        {field: 'gender', label: '性别'},
        {field: 'phone', label: '联系电话'},
        {field: 'dob', label: '出生日期'},
      ];
      for (const item of requiredFields) {
        if (!this.formData[item.field] && this.formData[item.field] !== 0) {
          this.showMessage(`${item.label}为必填项`, 'warning');
          isValid = false;
          return false;
        }
      }

      // 2) 姓名：只允许中英文、空格、间隔点“·”
      if (!this.validateName(this.formData.name)) {
        this.showMessage('姓名只能包含中英文字符、空格或“·”，且不能包含数字或符号', 'error');
        return false;
      }

      // 3) 年龄：纯数字且与出生日期合理
      if (!/^\d{1,3}$/.test(String(this.formData.age || ''))) {
        this.showMessage('年龄必须为纯数字', 'error');
        return false;
      }
      const ageFromDob = this.computeAgeFromDob(this.formData.dob);
      if (ageFromDob != null) {
        const ageNum = parseInt(this.formData.age, 10);
        if (ageNum !== ageFromDob) {
          this.showMessage(`年龄与出生日期不一致（按出生日期计算为 ${ageFromDob} 岁）`, 'error');
          return false;
        }
      }

      // 4) 手机号：11位大陆手机号
      if (!this.validatePhone(this.formData.phone)) {
        this.showMessage('请输入正确的11位大陆手机号（以1开头）', 'error');
        return false;
      }

      // 5) 证件：若证件类型为身份证，则校验并与性别/出生日期/年龄关联
      if (String(this.formData.idType) === '1' && this.formData.idNumber) {
        const info = this.parseIdCard(this.formData.idNumber);
        if (!info.valid) {
          this.showMessage(`身份证校验失败：${info.reason}`, 'error');
          return false;
        }
        // 性别一致
        if (this.formData.gender && info.gender && this.formData.gender !== info.gender) {
          this.showMessage(`身份证性别（${info.gender}）与所填性别不一致`, 'error');
          return false;
        }
        // 出生日期一致
        if (this.formData.dob && info.birth && this.formData.dob !== info.birth) {
          this.showMessage(`身份证出生日期（${info.birth}）与所填出生日期不一致`, 'error');
          return false;
        }
        // 年龄一致
        const ageNum = parseInt(this.formData.age, 10);
        if (!isNaN(ageNum) && info.age != null && ageNum !== info.age) {
          this.showMessage(`身份证推算年龄为 ${info.age} 岁，与所填年龄不一致`, 'error');
          return false;
        }
      }

      return isValid;
    },

    showMessage(msg, type = 'info') {
      if (this.$message) {
        if (type === 'success' && this.$message.success) return this.$message.success(msg);
        if (type === 'warning' && this.$message.warning) return this.$message.warning(msg);
        if (type === 'error' && this.$message.error) return this.$message.error(msg);
        return this.$message(msg);
      }
      alert(msg);
    },

    async patEmInfoAdd() {
      const patEmInfo = {
        hospitalAdmissionId: this.emergencyData.inpatientId, // 住院ID
        insuranceNumber: this.emergencyData.insuranceNumber, // 医保编号
        insuranceType: this.emergencyData.insuranceType, // 医保类型
        onsetLocation: this.emergencyData.address, // 发病地址
        onsetPeriod: this.emergencyData.specificOnsetTime, // 计算发病时段
        onsetTime: this.emergencyData.onsetTime, // 发病时间
        outpatientId: this.emergencyData.outpatientId, // 门诊ID
        patientId: this.patientId, // 患者ID，需根据实际情况设置
        isCriticalIllnessInsurance: this.emergencyData.isCriticalIllnessInsurance,
        detailedAddress:this.emergencyData.detailedAddress,

      };
      console.log("patEmInfo")
      console.log(patEmInfo)
      const response = await axios.post(API_URL + 'pat/patEmInfoAdd', patEmInfo,
        {
          params: {id: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },

    async patConInfoAdd() {
      const patConAsDTO = {
        additionalSymptoms: this.emergencyData.symptoms.join(', '), // 将症状数组转换为字符串
        conditionType: this.emergencyData.symptomslevel, // 获取病情类型
        patientId: this.patientId
        //emergencyId: 0 // 确保有有效的急救ID
        //assessmentId: 0, // 根据实际情况设置

      };
      console.log("patConAsDTO")
      console.log(patConAsDTO)
      const response = await axios.post(API_URL + 'pat/patConInfoAdd', patConAsDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },

    async patAdInfoAdd() {
      try {
        // 显式映射字段，全部来自 this.emergencyData
        const basePayload = {
          // 主键
          admissionId: this.emergencyData?.admissionId ?? null,
          patientId: this.patientId,

          // 来源方式
          methodType: Number(this.emergencyData?.source ?? 0),

          // 120/急救相关
          ambulanceUnit: this.emergencyData?.transportUnit || null,         // transportUnit → ambulanceUnit
          callTime: this.emergencyData?.callTime || null,
          hospitalArrivalTime: this.emergencyData?.arrivalTime || null,     // arrivalTime → hospitalArrivalTime

          // 首次接触/诊断
          firstMedicalContactTime: this.emergencyData?.firstContactTime || null, // firstContactTime → firstMedicalContactTime
          firstDiagnosisTime: this.emergencyData?.firstDoctorTime || null,       // firstDoctorTime → firstDiagnosisTime

          // 转上级医院
          isTransferHighHospital:
            this.emergencyData?.directTransfer === 'True'
              ? true
              : this.emergencyData?.directTransfer === 'False'
                ? false
                : (typeof this.emergencyData?.directTransfer === 'boolean'
                  ? this.emergencyData.directTransfer
                  : null),
          transferType: this.emergencyData?.transferType ?? null,
          transferHospitalName: this.emergencyData?.hospitalName || null,       // hospitalName → transferHospitalName
          transferHospitalInTime: this.emergencyData?.transferInTime || null,
          decisionTransferTime: this.emergencyData?.decisionTransferTime || null,
          transferHospitalOutTime: this.emergencyData?.transferOutTime || null,

          // 院内接触/离科
          inHospitalContactTime: this.emergencyData?.inHospitalConsultationTime || null,
          bedMedicalContactTime: this.emergencyData?.bedDoctorContactTime || null,
          leaveDepartmentTime: this.emergencyData?.leaveDepartmentTime || null,

          // 其他
          onsetDepartment: this.emergencyData?.department || null,
          medicalStaff: this.emergencyData?.medicalStaff || null,
        };

        // 统一转换时间格式（使用你现有的工具函数）
        const dateKeys = [
          'callTime',
          'hospitalArrivalTime',
          'firstMedicalContactTime',
          'firstDiagnosisTime',
          'transferHospitalInTime',
          'decisionTransferTime',
          'transferHospitalOutTime',
          'inHospitalContactTime',
          'bedMedicalContactTime',
          'leaveDepartmentTime',
        ];

        const payload = this.mapDateFieldsForBackend(basePayload, dateKeys);

        // 提交请求
        const res = await axios.post(`${API_URL}pat/patAdInfoAdd`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.token,
          },
        });

        // 结果处理
        if (res.data.code === 200) {
          this.showMessage('入院信息提交成功', 'success');
          if (!this.isBatchSubmitting) {
            await this.getPatientData();
          }
        } else {
          this.showMessage(res.data.msg || '提交失败', 'error');
        }
      } catch (e) {
        console.error(e);
        this.showMessage('入院信息提交异常', 'error');
      }
    },
    async patViInfoAdd() {
      const patViSiDTO = {
        bloodPressure: this.emergencyData.bloodPressure, // 血压
        checkTime: new Date().toISOString(), // 当前时间作为检查时间
        consciousness: this.emergencyData.consciousness, // 转换意识状态
        //outpatientId: this.emergencyData.outpatientId, // 门诊ID
        outpatientId: this.patientId, // 门诊ID
        patientName: this.formData.name, // 患者姓名
        pulse: Number(this.emergencyData.pulse), // 脉搏
        respiration: Number(this.emergencyData.respiration), // 呼吸
        temperature: Number(this.emergencyData.temperature), // 体温
        patientId: this.patientId,
        oxygenSaturation: Number(this.emergencyData.heartRate)

      };
      console.log("patViSiDTO")
      console.log(patViSiDTO)
      const response = await axios.post(API_URL + 'pat/patViInfoAdd', patViSiDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },
    async patEcgInfoAdd() {
      try {
        const firstEcg = this.chestPainData?.ecgs?.[0] ?? null;

        const basePayload = {
          // 是否做了心电图
          ecgPerformed: this.chestPainData?.ecg === 'True',

          // 时间字段（原始值，后面统一映射格式）
          ecgDiagnosisTime: firstEcg?.time ?? '',
          checkTime: this.chestPainData?.ecgDiagFalsesisTime ?? '',   // 你原来用的字段名保留
          remoteEcgTime: this.chestPainData?.ecgRemoteTime ?? '',

          // 其他字段
          filePath: (this.chestPainData?.ecgs ?? [])
            .map(e => e?.filePath || '')
            .filter(Boolean)
            .join(', '),

          patientId: this.patientId,
          remoteEcgTransmission: this.chestPainData?.ecgRemote === 'True',
          transmissionMethod: this.chestPainData?.transmissionMode === 'realtime' ? 1
            : this.chestPainData.transmissionMode === 'wechat' ? 0
              : null,
        };

        // 统一交给 mapDateFieldsForBackend 处理时间格式
        const dateKeys = [
          'ecgDiagnosisTime',
          'checkTime',
          'remoteEcgTime',
        ];

        const payload = this.mapDateFieldsForBackend(basePayload, dateKeys);

        const res = await axios.post(`${API_URL}pat/patEcgInfoAdd`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.token,
          },
        });

        if (res.data.code === 200) {
          this.showMessage('心电图信息提交成功', 'success');
          if (!this.isBatchSubmitting) {
            await this.getPatientData();
          }
        } else {
          this.showMessage(res.data.msg || '提交失败', 'error');
        }
      } catch (e) {
        console.error(e);
        this.showMessage('网络异常', 'error');
      }
    },

    async labAdd() {
      const t0 = (this.chestPainData.troponins && this.chestPainData.troponins.length > 0)
        ? this.chestPainData.troponins[0] : {};

      const patLabDTO = {
        patientId: this.patientId, // 假设患者ID为0，实际应从上下文中获取
        isSerumCreatinine: this.chestPainData.creatinine === 'True',
        serumCreatinineValue: this.chestPainData.creatinine === 'True' ? parseFloat(this.chestPainData.creatinineValue) : null,
        isDdimer: this.chestPainData.dDimer === 'True',
        ddimerValue: this.chestPainData.dDimer === 'True' ? parseFloat(this.chestPainData.dDimerValue) : null,
        isBnp: this.chestPainData.bnp === 'True',
        bnpValue: this.chestPainData.bnp === 'True' ? parseFloat(this.chestPainData.bnpValue) : null,
        isNTproBnp: this.chestPainData.ntProBnp === 'True',
        ntproBnpValue: this.chestPainData.ntProBnp === 'True' ? parseFloat(this.chestPainData.ntProBnpValue) : null,
        isMyo: this.chestPainData.myo === 'True',
        myoValue: this.chestPainData.myo === 'True' ? parseFloat(this.chestPainData.myoValue) : null,
        isCkmb: this.chestPainData.ckmb === 'True',
        ckmbValue: this.chestPainData.ckmb === 'True' ? parseFloat(this.chestPainData.ckmbValue) : null,
        isReportTroponin: this.chestPainData.troponin === 'True',
        troponinValue: this.chestPainData.troponin === 'True' ? (t0.unit || null) : null, // 将数组转换为字符串
        firstTroponinType: this.chestPainData.troponin === 'True' ? (t0.type || null) : null, // 获取第一个肌钙蛋白的类型
        troponinResult: this.chestPainData.troponin === 'True' ? (t0.result || null) : null, // 获取第一个肌钙蛋白的结果
        bloodDrawCompletionTime: this.chestPainData.troponin === 'True' ? (t0.bloodDrawTime || null) : null,
        reportObtainTime: this.chestPainData.troponin === 'True' ? (t0.reportTime || null) : null,

      }
      const patLabDTOFixed = this.mapDateFieldsForBackend(patLabDTO, ['bloodDrawApplyTime', 'bloodDrawCompletionTime', 'reportObtainTime', 'reportTime']);
      ;
      console.log("patLabDTO")
      console.log(patLabDTO)
      const response = await axios.post(API_URL + 'diagnosis/lab/add', patLabDTOFixed,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },

    async heartAdd() {
      // 小工具：把对象里指定的时间字段转成后端想要的格式
      const normalizeDates = (obj, dateKeys) => {
        return this.mapDateFieldsForLocal(obj, dateKeys || [])
      }

      // 1. 心外/心内会诊信息 -> diagnosis/heart/add
      {
        const basePatHeartDTO = {
          consultationType: this.chestPainData.consultationType,
          patientId: this.patientId,
          isCardiologyConsultation: this.chestPainData.consult === "True",
          notificationConsultationTime: this.chestPainData.cardiacSurgeryConsultationFalsetification,
          consultationTime: this.chestPainData.cardiacSurgeryConsultationTime,
        }

        const patHeartDTO = normalizeDates(basePatHeartDTO, [
          'notificationConsultationTime',
          'consultationTime',
        ])

        console.log("patHeartDTO", patHeartDTO)

        await axios.post(
          API_URL + 'diagnosis/heart/add',
          patHeartDTO,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            },
          }
        )
      }

      // 2. 初步诊断基础信息 -> diagnosis/dia/add
      {
        const basePatDiaDTO = {
          diagnosisDoctor: this.chestPainData.initialDiagnosisDoctor,           // 医生姓名
          initialDiagnosis: this.chestPainData.diagFalsesis,         // 初步诊断
          initialDiagnosisTime: this.chestPainData.diagFalsesisTime, // 初步诊断时间
          patientId: this.patientId,                                 // 患者ID
          patientRemarks: this.chestPainData.remarks,                // 备注
        }

        const patDiaDTO = normalizeDates(basePatDiaDTO, [
          'initialDiagnosisTime',
        ])

        await axios.post(
          API_URL + 'diagnosis/dia/add',
          patDiaDTO,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            },
          }
        )
      }

      // 3. 按初步诊断类型分别提交详细信息
      switch (this.chestPainData.diagFalsesis) {

        case 'STEMI': {
          const basePatStemiDTO = {
            informedConsentSignatureTime: this.chestPainData.informedConsentSignatureTime,
            initialDiagnosisTime: this.chestPainData.informedConsentStartTime,

            angiographyStartTime: this.chestPainData.diagFalsesisTime,
            anticoagulantDose: this.chestPainData.anticoagulantDose,
            anticoagulantDrug: this.chestPainData.anticoagulantDrugs,
            anticoagulationTime: this.chestPainData.anticoagulantTime,
            aspirinDosage: this.chestPainData.aspirinDose,
            aspirinTime: this.chestPainData.aspirinTime,
            cabgDoctor: this.chestPainData.decidingDoctor,
            cabgStartTime: this.chestPainData.cabgStartTime,
            cabgTime: this.chestPainData.cabgDecisionTime,
            cardiacFunctionGrade: this.chestPainData.heartFunctionClass,
            cathLabStartTime: this.chestPainData.cathLabStartTime,
            clopidogrelDosage: this.chestPainData.clopidogrelDose,
            clopidogrelTime: this.chestPainData.clopidogrelTime,
            prasugrelDosage: this.chestPainData.ticagrelorDose,
            prasugrelTime: this.chestPainData.ticagrelorTime,

            isAnticoagulation: this.chestPainData.anticoagulation === 'True',
            isAntiplateletTherapy: this.chestPainData.antiplateletTreatment === 'True',
            isBetaBlocker: this.chestPainData.betaBlocker === 'True',
            isBypassCcu: this.chestPainData.ccuBypass === 'True',
            isBypassEmergency: this.chestPainData.emergencyBypass === 'True',
            isReperfusion: this.chestPainData.reperfusion ?? null,
            isStatinTherapy: this.chestPainData.statinTreatment === 'True',

            thrombolysisStartTime: this.chestPainData.thrombolysisStartTime,
            thrombolysisEndTime: this.chestPainData.thrombolysisEndTime,

            patientId: this.patientId,

            reperfusionMethod: (() => {
              const v = this.chestPainData.reperfusionMethod ?? this.chestPainData.reperfusionMeasures
              if (Array.isArray(v)) return v.join(',')
              return v || null
            })(),

            directPciDoctor: this.chestPainData.decidingDoctor ?? this.chestPainData.directPciDoctor ?? null,
            directPciTime: this.chestPainData.interventionDecisionTime ?? this.chestPainData.directPciTime ?? null,

            informedConsentStartTime: this.chestPainData.informedConsentStartTime || null,
            informedConsentSignTime: this.chestPainData.informedConsentSignatureTime || null,

            thrombolysisScreening: this.chestPainData.thrombolysisScreening || null,
            isThrombolysisTreatment: this.chestPainData.thrombolysisTreatment === 'True',
            isDirectThrombolysisPlace: this.chestPainData.thrombolysisLocation === 'True',
            thrombolysisPlace: this.chestPainData.thrombolysisLocationDetail || this.chestPainData.thrombolysisLocation || null,

            thrombolysisConsentStartTime: this.chestPainData.informedConsentStartTime || null,
            thrombolysisConsentSignTime: this.chestPainData.informedConsentSignatureTime || null,

            thrombolyticDrugGeneration: (() => {
              let g = this.chestPainData.thrombolysisDrug;
              if (Array.isArray(g)) g = g[0];
              if (g == null || g === '') return null;
              if (g === 1 || g === '1') return '第一代';
              if (g === 2 || g === '2') return '第二代';
              if (g === 3 || g === '3') return '第三代';
              return String(g); // 回退：直接传字符串
            })(),
            thrombolyticDrugDose: (() => {
              let d = this.chestPainData.thrombolysisDose;
              if (Array.isArray(d)) d = d[0];
              if (d == null || d === '') return null;
              if (d === 1 || d === '1' || d === true)  return '全量';
              if (d === 0 || d === '0' || d === false) return '半量';
              return String(d);
            })(),

            isThrombolysisPatency: this.chestPainData.thrombolysisReperfusion === 'True',

            salvagePciDoctor: this.chestPainData.decidingDoctor || null,
            salvagePciTime: this.chestPainData.interventionDecisionTime || null,

            isTransferPci: this.chestPainData.reperfusionMethod === '转运PCI',
            transferPciType:
              this.chestPainData.reperfusionMethod === '转运PCI'
                ? (this.chestPainData.transportPCI || null)
                : null,

            complication: this.outcomeData?.comorbidities || null,
          }

          const patStemiDTO = normalizeDates(basePatStemiDTO, [
            'informedConsentSignatureTime',
            'initialDiagnosisTime',
            'angiographyStartTime',
            'anticoagulationTime',
            'aspirinTime',
            'cabgStartTime',
            'cabgTime',
            'cathLabStartTime',
            'clopidogrelTime',
            'prasugrelTime',
            'thrombolysisStartTime',
            'thrombolysisEndTime',
            'directPciTime',
            'informedConsentStartTime',
            'informedConsentSignTime',
            'thrombolysisConsentStartTime',
            'thrombolysisConsentSignTime',
            'salvagePciTime'
          ])

          await axios.post(
            API_URL + 'diagnosis/stemi/add',
            patStemiDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case 'NSTEMI': {
          // 宽容布尔 & 数字转换（只对本分支生效）
          const b = (x) => String(x).toLowerCase() === 'true' || String(x) === '1' || x === true;
          const n = (x) => {
            const v = Number(x);
            return Number.isFinite(v) ? v : null;
          };
          const didReassess = (v) => v != null && String(v).trim() !== '' && String(v).trim() !== '未做';

          const basePatNstemiDTO = {
            // 基本/时间
            initialDiagnosisTime: this.chestPainData.diagFalsesisTime,

            // 路径/旁路
            isBypassEmergencyNstemi: b(this.chestPainData.emergencyBypass),
            isBypassCcuNstemi: b(this.chestPainData.ccuBypass),

            // 抗血小板（有开关才带剂量/时间）
            isAntiplateletTherapyNstemi: b(this.chestPainData.antiplateletTreatment),
            aspirinDosageNstemi: b(this.chestPainData.antiplateletTreatment) ? n(this.chestPainData.aspirinDose) : null,
            aspirinTimeNstemi: b(this.chestPainData.antiplateletTreatment) ? this.chestPainData.aspirinTime : null,
            clopidogrelDosageNstemi: b(this.chestPainData.antiplateletTreatment) ? n(this.chestPainData.clopidogrelDose) : null,
            clopidogrelTimeNstemi: b(this.chestPainData.antiplateletTreatment) ? this.chestPainData.clopidogrelTime : null,
            ticagrelorDoseNstemi: b(this.chestPainData.antiplateletTreatment) ? n(this.chestPainData.ticagrelorDose) : null, // ← 后端用 ticagrelor*
            ticagrelorTimeNstemi: b(this.chestPainData.antiplateletTreatment) ? this.chestPainData.ticagrelorTime : null,

            // 抗凝（有开关才带药物/剂量/时间）
            isAnticoagulationNstemi: b(this.chestPainData.anticoagulation),
            anticoagulantDrugNstemi: b(this.chestPainData.anticoagulation) ? this.chestPainData.anticoagulantDrugs : null,
            anticoagulantDoseNstemi: b(this.chestPainData.anticoagulation) ? n(this.chestPainData.anticoagulantDose) : null,
            anticoagulationTimeNstemi: b(this.chestPainData.anticoagulation) ? this.chestPainData.anticoagulantTime : null,

            // 他汀 / β受体阻滞剂
            isStatinTherapyNstemi: b(this.chestPainData.statinTreatment),
            isBetaBlockerNstemi: b(this.chestPainData.betaBlocker),

            // GRACE 分层/高危要素
            graceScoreNstemi: n(this.chestPainData.graceScore),
            graceRiskStratificationNstemi: this.chestPainData.graceRiskStratification,
            isEcgStSegmentChange: (this.chestPainData.graceAssessment || '').includes('ST段改变'),
            isCardiacNecrosisMarkerElevation: (this.chestPainData.graceAssessment || '').includes('心肌坏死标志物升高'),
            isCardiacArrestAfterOnset: (this.chestPainData.graceAssessment || '').includes('心脏骤停'),
            isDynamicStSegmentChange: (this.chestPainData.graceHighRisk || '').includes('ST-T动态演变'),
            isLifeThreateningArrhythmiaOrCardiacArrest:
              (this.chestPainData.graceHighRisk || '').includes('心律失常'),
            isCardiogenicShockOrHemodynamicInstability:
              (this.chestPainData.graceHighRisk || '').includes('心源性休克'),
            isMechanicalComplicationOfMyocardialInfarction:
              (this.chestPainData.graceHighRisk || '').includes('机械性并发症'),
            isRefractoryAnginaAndStSegmentChange:
              (this.chestPainData.graceHighRisk || '').includes('急性心力衰竭'),

            // 再次危险分层
            isRepeatedRiskStratification: didReassess(this.chestPainData.reassessment),
            repeatedRiskStratificationResultNstemi: this.chestPainData.reassessment,
            repeatedRiskStratificationTimeNstemi: didReassess(this.chestPainData.reassessment) ? this.chestPainData.reassessmentTime : null,

            // 介入策略/时间点
            treatmentStrategyNstemi: this.chestPainData.treatmentStrategy,
            invasiveStrategyNstemi: this.chestPainData.invasiveStrategy,
            emergencyInterventionDoctorNstemi: this.chestPainData.decidingDoctor,
            emergencyInterventionDecisionTimeNstemi: this.chestPainData.interventionDecisionTime,
            emergencyInterventionInformedConsentStartTimeNstemi: this.chestPainData.informedConsentStartTime,
            emergencyInterventionInformedConsentSignTimeNstemi: this.chestPainData.informedConsentSignatureTime,
            emergencyInterventionCathLabStartTimeNstemi: this.chestPainData.cathLabStartTime,

            // 其它
            cardiacFunctionGradeNstemi: this.chestPainData.heartFunctionClass,
            patientId: this.patientId
          };

          // 时间字段统一格式（保持你原来用的 normalizeDates）
          const patNstemiDTO = normalizeDates(basePatNstemiDTO, [
            'initialDiagnosisTime',
            'aspirinTimeNstemi',
            'clopidogrelTimeNstemi',
            'ticagrelorTimeNstemi', // ← 用后端的 ticagrelor*
            'anticoagulationTimeNstemi',
            'emergencyInterventionDecisionTimeNstemi',
            'emergencyInterventionInformedConsentStartTimeNstemi',
            'emergencyInterventionInformedConsentSignTimeNstemi',
            'emergencyInterventionCathLabStartTimeNstemi',
            'repeatedRiskStratificationTimeNstemi'
          ]);

          await axios.post(
            API_URL + 'diagnosis/nstemi/add',
            patNstemiDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          );
          break;
        }
        case 'UA': {
          const basePatUaDTO = {
            anticoagulantDoseUa: this.chestPainData.anticoagulantDose,
            anticoagulantDrugUa: this.chestPainData.anticoagulantDrugs,
            anticoagulationTimeUa: this.chestPainData.anticoagulantTime,
            aspirinDosageUa: this.chestPainData.aspirinDose,
            aspirinTimeUa: this.chestPainData.aspirinTime,
            cardiacFunctionGradeUa: this.chestPainData.heartFunctionClass,
            clopidogrelDosageUa: this.chestPainData.clopidogrelDose,
            clopidogrelTimeUa: this.chestPainData.clopidogrelTime,
            emergencyInterventionCathLabStartTimeUa: this.chestPainData.cathLabStartTime,
            emergencyInterventionDecisionTimeUa: this.chestPainData.interventionDecisionTime,
            emergencyInterventionDoctorUa: this.chestPainData.decidingDoctor,
            emergencyInterventionInformedConsentSignTimeUa: this.chestPainData.informedConsentSignatureTime,
            emergencyInterventionInformedConsentStartTimeUa: this.chestPainData.informedConsentStartTime,
            graceRiskStratificationUa: this.chestPainData.graceRiskStratification,
            graceScoreUa: this.chestPainData.graceScore,
            initialDiagnosisTime: this.chestPainData.diagFalsesisTime,
            invasiveStrategyUa: this.chestPainData.invasiveStrategy,
            treatmentStrategyUa: this.chestPainData.treatmentStrategy,
            isAnticoagulationUa: this.chestPainData.anticoagulation === 'True',
            isAntiplateletTherapyUa: this.chestPainData.antiplateletTreatment === 'True',
            isBetaBlockerUa: this.chestPainData.betaBlocker === 'True',
            isBypassCcuUa: this.chestPainData.ccuBypass === 'True',
            isBypassEmergencyUa: this.chestPainData.emergencyBypass === 'True',
            isCardiacArrestAfterOnsetUa: this.chestPainData.graceAssessment.includes('心脏骤停'),
            isCardiacNecrosisMarkerElevationUa: this.chestPainData.graceAssessment.includes('心肌坏死标志物升高'),
            isCardiogenicShockOrHemodynamicInstabilityUa: this.chestPainData.graceHighRisk.includes('心源性休克'),
            isDynamicStSegmentChangeUa: this.chestPainData.graceHighRisk.includes('ST-T动态演变'),
            isEcgStSegmentChangeUa: this.chestPainData.graceAssessment.includes('ST段改变'),
            isLifeThreateningArrhythmiaOrCardiacArrestUa: this.chestPainData.graceHighRisk.includes('心律失常'),
            isMechanicalComplicationOfMyocardialInfarctionUa: this.chestPainData.graceHighRisk.includes('机械性并发症'),
            isRefractoryAnginaAndStSegmentChangeUa: this.chestPainData.graceHighRisk.includes('急性心力衰竭'),
            isRepeatedRiskStratificationUa: this.chestPainData.reassessment === "未做",
            isStatinTherapyUa: this.chestPainData.statinTreatment === 'True',
            patientId: this.patientId,
            prasugrelDosageUa: this.chestPainData.ticagrelorDose,
            prasugrelTimeUa: this.chestPainData.ticagrelorTime,
            repeatedRiskStratificationResultUa: this.chestPainData.reassessment,
            repeatedRiskStratificationTimeUa: this.chestPainData.reassessmentTime
          }

          const patUaDTO = normalizeDates(basePatUaDTO, [
            'anticoagulationTimeUa',
            'aspirinTimeUa',
            'clopidogrelTimeUa',
            'emergencyInterventionCathLabStartTimeUa',
            'emergencyInterventionDecisionTimeUa',
            'emergencyInterventionInformedConsentSignTimeUa',
            'emergencyInterventionInformedConsentStartTimeUa',
            'initialDiagnosisTime',
            'prasugrelTimeUa',
            'repeatedRiskStratificationTimeUa'
          ])

          await axios.post(
            API_URL + 'diagnosis/ua/add',
            patUaDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case '主动脉夹层': {
          const basePatHeartDisDTO = {
            initialDiagnosisTime: this.chestPainData.aorticDissectionDiagFalsesisTime,
            imagingExaminationAad: this.chestPainData.aorticDissectionImaging,
            notifyCtRoomTimeAad: this.chestPainData.ctFalsetificationTime,
            ctRoomReadyTimeAad: this.chestPainData.ctPreparationTime,
            ctScanStartTimeAad: this.chestPainData.ctScanStartTime,
            ctReportTimeAad: this.chestPainData.ctReportTime,
            notifyUltrasoundRoomTimeAad: this.chestPainData.ultrasoundFalsetificationTime,
            ultrasoundExaminationTimeAad: this.chestPainData.ultrasoundExamTime,
            ultrasoundResultTimeAad: this.chestPainData.ultrasoundResultTime,
            cardiacSurgeryConsultationTimeAad: this.chestPainData.cardiacSurgeryConsultationTime,
            cardiacSurgeryConsultationTypeAad: this.chestPainData.cardiacSurgeryConsultationFalsetification,
            treatmentStrategyAad: this.chestPainData.treatmentStrategy,
            aorticDissectionTypeAad: this.chestPainData.aorticDissectionType,
            isCardiacSurgeryConsultationAad: this.chestPainData.consult === 'True',
            patientId: this.patientId
          }

          const patHeartDisDTO = normalizeDates(basePatHeartDisDTO, [
            'initialDiagnosisTime',
            'notifyCtRoomTimeAad',
            'ctRoomReadyTimeAad',
            'ctScanStartTimeAad',
            'ctReportTimeAad',
            'notifyUltrasoundRoomTimeAad',
            'ultrasoundExaminationTimeAad',
            'ultrasoundResultTimeAad',
            'cardiacSurgeryConsultationTimeAad'
          ])

          await axios.post(
            API_URL + 'diagnosis/heartinfo/add',
            patHeartDisDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case '肺动脉栓塞': {
          const basePatLungDTO = {
            initialDiagnosisTime: this.chestPainData.pulmonaryEmbolismDiagFalsesisTime,
            pulmonaryEmbolismDoctor: this.chestPainData.pulmonaryEmbolismDoctor,
            imagingExaminationPe: this.chestPainData.pulmonaryEmbolismImaging,
            notifyCtRoomTimePe: this.chestPainData.ctFalsetificationTimePE,
            ctRoomReadyTimePe: this.chestPainData.ctPreparationTimePE,
            ctScanStartTimePe: this.chestPainData.ctScanStartTimePE,
            ctReportTimePe: this.chestPainData.ctReportTimePE,
            riskStratificationPe: this.chestPainData.riskStratification,
            anticoagulationStartTimePe: this.chestPainData.anticoagulationStartTime,
            thrombolysisScreeningPe: this.chestPainData.thrombolysisScreening,
            isThrombolysisTreatmentPe: this.chestPainData.thrombolysisTreatment === '有',
            patientId: this.patientId
          }

          const patLungDTO = normalizeDates(basePatLungDTO, [
            'initialDiagnosisTime',
            'notifyCtRoomTimePe',
            'ctRoomReadyTimePe',
            'ctScanStartTimePe',
            'ctReportTimePe',
            'anticoagulationStartTimePe'
          ])

          await axios.post(
            API_URL + 'diagnosis/lung/add',
            patLungDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case '非ACS心源性胸痛': {
          const basePatAntiACSDTO = {
            initialDiagnosisTime: this.chestPainData.FalsenACSChestPainDiagFalsesisTime,
            nonAcsCardiogenicChestPainType: this.chestPainData.FalsenACSChestPainType,
            treatmentMeasuresNonAcs: this.chestPainData.FalsenACSChestPainTreatment,
            patientDispositionNonAcs: this.chestPainData.FalsenACSChestPainDoctor,
            patientId: this.patientId,
          }

          const patAntiACSDTO = normalizeDates(basePatAntiACSDTO, [
            'initialDiagnosisTime'
          ])

          await axios.post(
            API_URL + 'diagnosis/antiacs/add',
            patAntiACSDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case '其它非心源性胸痛': {
          const basePatOtherHeartDTO = {
            initialDiagnosisTime: this.chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime,
            otherNonCardiacChestPainType: this.chestPainData.otherFalsenCardiacChestPainType,
            treatmentMeasureOther: this.chestPainData.otherFalsenCardiacChestPainTreatment,
            patientStatusOther: this.chestPainData.otherFalsenCardiacChestPainDoctor,
            patientId: this.patientId,
          }

          const patOtherHeartDTO = normalizeDates(basePatOtherHeartDTO, [
            'initialDiagnosisTime'
          ])

          await axios.post(
            API_URL + 'diagnosis/otherheart/add',
            patOtherHeartDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        case '待查': {
          const basePatTodoDTO = {
            initialDiagnosisTime: this.chestPainData.pendingDiagFalsesisTime,
            patientDispositionPending: this.chestPainData.pendingDoctor,
            treatmentMeasuresPending: this.chestPainData.pendingTreatment,
            patientId: this.patientId,
          }

          const patTodoDTO = normalizeDates(basePatTodoDTO, [
            'initialDiagnosisTime'
          ])

          await axios.post(
            API_URL + 'diagnosis/todo/add',
            patTodoDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
              },
            }
          )
          break
        }

        default:
          console.error('未知的初步诊断类型')
          return
      }

      // 4. 导管室 / 再灌注（castemi）
      if (
        this.chestPainData.reperfusionMethod === '直接PCI' ||
        this.chestPainData.reperfusionMethod === '溶栓' ||
        this.chestPainData.reperfusionMethod === '补救PCI'
      ) {
        const basePatCatheterDTO = {
          catheterLabActivationTime: this.catheterData.catheterLabActivationTime,
          patientArrivalCatheterLabTime: this.catheterData.patientArrivalCatheterLabTime,
          interventionist: this.catheterData.interventionist,
          startPunctureTime: this.catheterData.startPunctureTime,
          angiographyStartTime: this.catheterData.angiographyStartTime,
          anticoagulationDrugAdministrationTime: this.catheterData.anticoagulationDrugAdministrationTime,
          anticoagulationDrug: this.catheterData.anticoagulationDrug,
          anticoagulationDrugDose: this.catheterData.anticoagulationDrugDose,
          anticoagulationDrugUnit: this.catheterData.anticoagulationDrugUnit,
          surgeryEndTime: this.catheterData.surgeryEndTime,
          isDelayed: this.catheterData.isDelayed === 'True',
          delayReasons: this.catheterData.delayReasons,
          patientId: this.patientId,

          directPciDoctor: this.chestPainData.decidingDoctor,
          directPciTime: this.chestPainData.interventionDecisionTime, // 修掉 this.chestPainData.chestPainData...

          informedConsentSignTime: this.chestPainData.informedConsentSignatureTime,
          thrombolysisConsentStartTime: this.chestPainData.informedConsentStartTime,
          thrombolysisConsentSignTime: this.chestPainData.informedConsentSignatureTime, // 你原来写的是 this.chestPainData.informedConsentSignature

          salvagePciTime: this.chestPainData.interventionDecisionTime,
        }

        const patCatheterDTO = normalizeDates(basePatCatheterDTO, [
          'catheterLabActivationTime',
          'patientArrivalCatheterLabTime',
          'startPunctureTime',
          'angiographyStartTime',
          'anticoagulationDrugAdministrationTime',
          'surgeryEndTime',
          'directPciTime',
          'informedConsentSignTime',
          'thrombolysisConsentStartTime',
          'thrombolysisConsentSignTime',
          'salvagePciTime'
        ])

        await axios.post(
          API_URL + 'catheter/castemi/add',
          patCatheterDTO,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
            },
          }
        )
      }
    },
    async outdiaAdd() {
      const patOutDTO = {
        diagnosis: this.outcomeData.dischargeDiagFalsesis,

        // 确诊时间
        diagnosisConfirmationTime: this.outcomeData.confirmedDate ? new Date(this.outcomeData.confirmedDate).toISOString() : null,

        // 院内新发心力衰竭
        isNewOnsetHeartFailureInHospital: this.outcomeData.newHeartFailure,

        // 合并症
        complications: this.outcomeData.comorbidities,

        // 危险因素
        isHypertension: this.outcomeData.hypertension,
        isHyperlipidemia: this.outcomeData.hyperlipidemia,
        isDiabetes: this.outcomeData.diabetes,
        isSmoking: this.outcomeData.smoking,
        isObesity: this.outcomeData.obesity,
        isEarlyOnsetCVDFamilyHistory: this.outcomeData.familyHistory,

        // 合并疾病
        isCoronaryHeartDisease: this.outcomeData.coronaryHeartDisease,
        isRevascularizationHistory: this.outcomeData.revascularizationHistory,
        isAtrialFibrillation: this.outcomeData.af,
        atrialFibrillationType: this.outcomeData.afType,
        isChronicHeartFailure: this.outcomeData.chronicHeartFailure,
        isValvularHeartDisease: this.outcomeData.heartValveDisease,
        isCerebrovascularDisease: this.outcomeData.cerebrovascularDisease,
        cerebrovascularDiseaseType: this.outcomeData.cerebrovascularDiseaseType,
        isPeripheralArterialDisease: this.outcomeData.peripheralArteryDisease,
        isAorticAneurysm: this.outcomeData.aorticAneurysm,
        isCOPD: this.outcomeData.copd,
        isChronicKidneyDisease: this.outcomeData.chronicKidneyDisease,
        isAnemia: this.outcomeData.anemia,
        isPepticUlcer: this.outcomeData.pepticUlcer,
        isThyroidDysfunction: this.outcomeData.thyroidFunctionAbFalsermal,

        // 检查结果
        is72hTroponinChecked: this.outcomeData.troponin72hChecked,
        troponinMaxValue72h: this.outcomeData.troponinMaxValue ? parseFloat(this.outcomeData.troponinMaxValue) : null,
        troponinType72h: this.outcomeData.troponin72h,

        isNatriureticPeptideChecked: this.outcomeData.bnp ? true : false,
        natriureticPeptideType: this.outcomeData.bnp,
        natriureticPeptideMaxValue: this.outcomeData.bnpMaxValue ? parseFloat(this.outcomeData.bnpMaxValue) : null,

        isTotalCholesterolChecked: this.outcomeData.tc,
        totalCholesterolValue: this.outcomeData.tcValue ? parseFloat(this.outcomeData.tcValue) : null,

        isTriglycerideChecked: this.outcomeData.tg,
        triglycerideValue: this.outcomeData.tgValue ? parseFloat(this.outcomeData.tgValue) : null,

        isHDLChecked: this.outcomeData.hdl,
        hdlValue: this.outcomeData.hdlValue ? parseFloat(this.outcomeData.hdlValue) : null,

        isLDLChecked: this.outcomeData.ldl,
        dlValue: this.outcomeData.ldlValue ? parseFloat(this.outcomeData.ldlValue) : null,

        isEchocardiogramChecked: this.outcomeData.echo,
        isVentricularAneurysm: this.outcomeData.wallAneurysm,
        isRegionalWallMotionAbnormality: this.outcomeData.wallMotionAbFalsermality,

        // 非ACS心源性胸痛类型
        nonACSCardiogenicChestPainType: this.outcomeData.FalsenACSChestPainType,

        // 其它非心源性胸痛类型
        otherNonCardiacChestPainType: this.outcomeData.otherFalsenCardiacChestPainType,

        // COVID-19
        isCovid: this.outcomeData.covid === "True",

        // 住院期间用药
        isAntidiabetic: this.outcomeData.antidiabetic === "True",
        isOralAnticoagulants: this.outcomeData.oralAnticoagulants === "True",
        isLipidRegulating: this.outcomeData.lipidRegulating === "True",
        patientId: this.patientId,

      };
      console.log("patOutDTO")
      console.log(patOutDTO)
      const response = await axios.post(API_URL + 'outhospital/outdia/add', patOutDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },
    async outAdd() {
      const patOutInfoDTO = {
        // 住院天数
        hospitalizationDays: this.outcomeData.hospitalDays,

        // 总费用
        totalCost: this.outcomeData.totalCost,

        // 出院还是转归
        patientOutcome: this.outcomeData.dischargeStatus,

        // 出院相关信息
        dischargeTime: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.dischargeTime : null,
        treatmentOutcome: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.treatmentOutcome : null,
        isCarryMedicationAfterDischarge: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.antiplateletMedication === 'True' : false,
        antithromboticDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.antiplateletMedication === 'True' ? this.outcomeData.antiplateletDrugName : null,
        antithromboticDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.antiplateletMedication === 'True' ? parseFloat(this.outcomeData.antiplateletDosage) : null,
        isACEIARB: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.aceArbMedication === 'True' : false,
        aceiarbDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.aceArbMedication === 'True' ? this.outcomeData.aceArbDrugName : null,
        aceiarbDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.aceArbMedication === 'True' ? parseFloat(this.outcomeData.aceArbDosage) : null,
        isLipidLoweringDrug: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.lipidRegulatingMedication === 'True' : false,
        lipidLoweringDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.lipidRegulatingMedication === 'True' ? this.outcomeData.lipidRegulatingDrugName : null,
        lipidLoweringDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.lipidRegulatingMedication === 'True' ? parseFloat(this.outcomeData.lipidRegulatingDosage) : null,
        isBetaBlocker: this.outcomeData.dischargeStatus === '出院' ? this.outcomeData.betaBlockerMedication === 'True' : false,
        betaBlockerDrugName: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.betaBlockerMedication === 'True' ? this.outcomeData.betaBlockerDrugName : null,
        betaBlockerDrugDose: this.outcomeData.dischargeStatus === '出院' && this.outcomeData.betaBlockerMedication === 'True' ? parseFloat(this.outcomeData.betaBlockerDosage) : null,

        // 转送其他医院相关信息
        leaveHospitalTime: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.departureTime : null,
        isNetworkHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.networkHospital === 'True' : false,
        transferHospitalName: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.networkHospital === 'True' ? this.outcomeData.networkHospitalName : null,
        isTransferPCI: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.transferPci === 'True' : false,
        isDirectToCatheterLab: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.directCathLab === 'True' : false,
        actualInterventionStartTime: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.directCathLab === 'True' ? this.outcomeData.actualInterventionStartTime : null,
        isTeleEcgTransmission: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.ecgTransmission === '传输心电图至协作单位' : false,
        ecgTransmissionTime: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' ? this.outcomeData.ecgTransmissionTime : null,
        ecgTransmissionMethod: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' ? this.outcomeData.ecgTransmissionMethod : null,

        // 转送其他科室相关信息
        transferDepartmentTime: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.transferTime : null,
        acceptingDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.admittingDepartment : null,
        transferDepartmentReason: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.transferReason : null,

        // 死亡相关信息
        deathTime: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathTime : null,
        isCardiacCauseOfDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathCause === '心源性' : false,
        patientConditionDescriptionDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathDescription : null,

        // 其他备注
        patientConditionDescriptionTransferDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.remarks : null,
        patientConditionDescriptionTransferHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.remarks : null,
        remarks: this.outcomeData.remarks,
        patientId: this.patientId

      }
      const patOutInfoDTOFixed = this.mapDateFieldsForBackend(patOutInfoDTO, ['dischargeTime', 'leaveHospitalTime', 'transferDepartmentTime', 'actualInterventionStartTime', 'ecgTransmissionTime', 'deathTime']);


      ;
      console.log("patOutInfoDTO")
      console.log(patOutInfoDTO)
      const response = await axios.post(API_URL + 'outhospital/out/add', patOutInfoDTOFixed,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          },
        })
      console.log(response)
    },

    pickLatestRecord(list) {
      if (!Array.isArray(list) || list.length === 0) return null;
     // 取 id 最大的那条记录（兼容 id / ID 大小写）
      return list.slice().sort((a, b) => {
        const idA = Number(a?.id ?? a?.ID ?? 0);
        const idB = Number(b?.id ?? b?.ID ?? 0);
        return idB - idA; // 降序，id 最大的排最前
         })[0];
      },

    formatLocal(dt) {
      if (!dt) return '';
      const t = new Date(dt);
      if (Number.isNaN(t)) return '';
      const off = t.getTime() - t.getTimezoneOffset() * 60000;
      return new Date(off).toISOString().slice(0, 16);
    },


    _set(target, key, val) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = val;
      } else {
        this.$set(target, key, val);
      }
    },


    toBackendDate(dt) {
      if (!dt) return null;
      let v = dt;
      if (typeof v === 'string' && v.indexOf('T') === -1 && v.indexOf(' ') > 0) {
        v = v.replace(' ', 'T');
      }
      const d = new Date(v);
      if (Number.isNaN(d)) return null;
      const pad = (n, w = 2) => String(n).padStart(w, '0');
      const yyyy = d.getFullYear();
      const MM = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const HH = pad(d.getHours());
      const mm = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      const SSS = pad(d.getMilliseconds(), 3);
      const tzMin = -d.getTimezoneOffset();
      const sign = tzMin >= 0 ? '+' : '-';
      const abs = Math.abs(tzMin);
      const th = pad(Math.floor(abs / 60));
      const tm = pad(abs % 60);
      return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}${sign}${th}${tm}`;
    },

    toBackendLocalDateTime(dt) {
      if (dt == null || dt === '') return null;
      const d = new Date(dt);
      if (isNaN(d.getTime())) return null;
      const pad = (n, w = 2) => String(n).padStart(w, '0');
      const yyyy = d.getFullYear();
      const MM = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const HH = pad(d.getHours());
      const mm = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      const SSS = pad(d.getMilliseconds(), 3);
      return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}`;
    },

    mapDateFieldsForLocal(obj, dateKeys) {
      const out = {...(obj || {})};
      (dateKeys || []).forEach(k => {
        if (k in out) out[k] = this.toBackendLocalDateTime(out[k]);
      });
      return out;
    },


    mapDateFieldsForBackend(obj, dateKeys) {
      const out = {...(obj || {})};
      (dateKeys || []).forEach(k => {
        if (k in out) out[k] = this.toBackendDate(out[k]);
      });
      return out;
    }
  }
}

</script>
<style>
.submit-time{
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 10px;
  margin-top: 20px;
}

/* ========= 表单容器 ========= */
.form-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

/* ========= 表单节 ========= */
.form-section {
  margin-bottom: 20px;

  .form-row {
    display: flex;
    flex-wrap: wrap; /* 修复拼写错误 */
    margin-bottom: 16px;
  }

  .form-row-item {
    display: flex;
    align-items: center;
    width: 25%;
  }

  .form-row label {
    flex: 0 0 100px;
    margin-right: 8px;
    display: flex;
    align-items: center;
  }

  .form-row input,
  .form-row select {
    flex: 1;
    margin-right: 16px;
    max-width: 100%;
  }

  .form-row input[type="text"],
  .form-row input[type="tel"],
  .form-row input[type="date"] {
    padding-right: 30px;
  }

  label {
    display: block;
    margin: 5px 0;
  }

  span {
    margin-right: 10px;
  }

  input, select, textarea {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

/* ========= 按钮导航 ========= */
.form-navigation button {
  padding: 10px 15px;
  background-color: #20b6f9; /* 默认背景颜色 */
  color: #333; /* 默认文字颜色 */
  border: none; /* 修复拼写错误 */
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.submit-bar{
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap:16px;
  padding: 10px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border:1px solid rgba(0,0,0,0.05);
}
.primary-btn{
  width: 200px;
}
@supports  not(position: fixed) {
  .submit-bar{
    position: static;
    margin-top: 24px !important;
    justify-content: center;
  }
}

/* ========= 修改前三个按钮颜色为灰色 ========= */
.form-navigation button:nth-child(1),
.form-navigation button:nth-child(2),
.form-navigation button:nth-child(3) {
  background-color: #ccc; /* 灰色背景 */
  color: #666; /* 灰色文字 */
}

.form-navigation button:nth-child(1):hover,
.form-navigation button:nth-child(2):hover,
.form-navigation button:nth-child(3):hover {
  background-color: #aaa; /* 鼠标悬停时更深的灰色 */
}

.form-navigation button.active {
  background-color: #007bff; /* 被选中时的背景颜色 */
  color: white; /* 被选中时的文字颜色 */
}

.form-navigation button:not(.active):hover {
  background-color: #b0b0b0; /* 未选中时的悬停效果 */
}

/* ========= 模块卡片 ========= */
.module {
  border: 1px solid #eee;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 6px;
}

.module h3 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  margin-bottom: 15px;
}

/* ========= 子模块内表单行 ========= */
.module .form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

/* ========= 标签样式 ========= */
.module label {
  text-align: left;
  margin-right: 15px;
}

/* ========= 输入控件统一宽度 ========= */
.module input[type="text"],
.module input[type="number"],
.module input[type="tel"],
.module input[type="date"],
.module select,
.module textarea {
  width: 20% !important;
  min-width: 50px;
  margin-right: 20px;
}

/* ========= 单选框/复选框组 ========= */
.module .radio-group,
.module .checkbox-group {
  display: flex;
  align-items: center;
  gap: 25px;
}

/* ========= 单个选项样式 ========= */
.module input[type="checkbox"] {
  margin: 0 5px 0 0;
}

.module input[type="radio"] {
  margin: 2px;
  height: 13px;
}

.module input[type="radio"] + label {
  margin-left: 0;
}

.module input[type="checkbox"],
.module input[type="radio"] {
  flex: 0;
}

/* ========= 症状复选框特殊处理 ========= */
.module .symptom-group {
  display: flex;
  flex-direction: column;
}

.module .symptom-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* ========= 文本域特殊处理 ========= */
.module textarea {
  width: 60% !important;
  height: 80px;
  vertical-align: top;
}

/* ========= 其他按钮 ========= */
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
/* 单选、多选按钮选中时高亮为蓝色 */
input[type="radio"]:checked,
input[type="checkbox"]:checked {
  accent-color:#007bff; /* ✅ 现代浏览器生效 */
}

/* 同时把文字也改为蓝色（label 紧跟在 input 后面时生效） */
input[type="radio"]:checked + label,
input[type="checkbox"]:checked + label {
  color: #007bff;
  font-weight: bold; /* 可选，加粗 */
}
/* 只读/禁用输入框里的文字显示为正常黑色 */
input[readonly],
input[disabled] {
  color: #000 !important;   /* 黑色 */
  -webkit-text-fill-color: #000 !important; /* Safari/Chrome 特殊属性 */
  opacity: 1 !important;    /* 覆盖掉禁用状态的半透明 */
}
/* ========= 时间轴（Timeline） ========= */
.form-timeline {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}
.timeline { position: relative; padding-left: 24px; }
.timeline h3 { margin: 0 0 12px 0; font-size: 18px; }
.timeline-line {
  position: absolute;
  top: 0; bottom: 0; left: 12px;
  width: 2px; background: #e5e7eb;
}
.timeline-item { position: relative; margin: 12px 0; padding-left: 16px; }
.timeline-item .timeline-dot {
  position: absolute;
  left: -2px;
  top: 4px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 2px #fff;
}
.timeline-item.even .timeline-dot { background: #0ea5e9; } /* 天蓝 */
.timeline-item.odd  .timeline-dot { background: #22c55e; } /* 绿色 */
.timeline-time { font-weight: 600; margin-right: 8px; }
.timeline-desc { display: inline; }



/* Readonly lock helpers */
.submit-info-readonly :is(input, textarea) {
  overscroll-behavior: contain;
}

/* --- Display-only look for options --- */
.submit-info-readonly :is(.el-select, .el-date-editor, .el-time-picker, .el-time-select) .el-input__suffix,
.submit-info-readonly :is(.el-select, .el-date-editor, .el-time-picker, .el-time-select) .el-input__suffix-inner {
  display: none !important;
}
.submit-info-readonly :is(.el-select, .el-date-editor) .el-input__wrapper {
  cursor: default !important;
}


/* --- Lock boolean options (是否类) --- */
.submit-info-readonly :is(.el-radio-group, .el-checkbox-group, .el-switch) {
  pointer-events: none !important; /* no click/hover */
}
.submit-info-readonly :is(.el-radio, .el-checkbox, .el-switch) .is-checked,
.submit-info-readonly :is(.el-radio, .el-checkbox, .el-switch) .is-focus {
  box-shadow: none !important;
}
.submit-info-readonly :is(.el-radio, .el-checkbox, .el-switch) .el-switch__core {
  cursor: default !important;
}


/* ==== READONLY FROZEN LAYER (no interaction on options) ==== */
:global(.el-select.is-disabled),
:global(.el-cascader.is-disabled),
:global(.el-radio-group[disabled]),
:global(.el-checkbox-group[disabled]),
:global(.el-radio.is-disabled),
:global(.el-checkbox.is-disabled),
:global(.el-switch.is-disabled),
:global(select[disabled]),
:global(input[type="checkbox"][disabled]),
:global(input[type="radio"][disabled]){
  pointer-events: none !important;
}

:global(.el-select.is-disabled) .el-input__wrapper,
:global(.el-date-editor.is-disabled),
:global(.el-date-editor.is-disabled) *,
:global(.el-cascader.is-disabled) * {
  pointer-events: none !important;
}

/* hide suffix/caret for display-only look */
:global(.el-input__suffix),
:global(.el-input__suffix-inner) {
  display: none !important;
}

</style>
