<template>
  <div class="form-container">

    <!-- 智能识别浮动入口（右上角） -->
    <div class="ocr-float-btn" @click="openOcrDialog" title="上传图片自动识别填表">
      📷 智能识别
    </div>

    <!-- OCR 识别弹窗 -->
    <div v-if="ocrDialog.visible" class="ocr-dialog-backdrop" @click.self="ocrDialog.visible = false">
      <div class="ocr-dialog">
        <div class="ocr-dialog-header">
          <span>智能识别 · 快速填表</span>
          <button class="ocr-close-btn" @click="closeOcrDialog">✕</button>
        </div>
        <div class="ocr-dialog-body">
          <div class="ocr-panel">
            <div class="ocr-upload-area" @click="selectOcrFile" @dragover.prevent @drop.prevent="handleOcrDrop">
              <input ref="ocrFileInput" type="file" accept="image/*" class="ocr-file-input" @change="handleOcrUpload">
              <div v-if="!ocrDialog.imgUrl" class="ocr-upload-placeholder">
                <div class="ocr-upload-icon">📷</div>
                <div>将图片拖到此处，或点击上传</div>
                <p>支持 JPG / PNG / BMP，单张不超过 10MB</p>
              </div>
              <img v-else :src="ocrDialog.imgUrl" class="ocr-preview-img">
            </div>
            <div class="ocr-preview-panel">
              <div v-if="ocrDialog.loading" class="ocr-loading">
                识别中，请稍候…
                <div class="ocr-progress"><span :style="{ width: ocrDialog.progress + '%' }"></span></div>
              </div>
              <div v-if="ocrDialog.resultText" class="ocr-result">
                <p><strong>原始识别文本：</strong></p>
                <textarea v-model="ocrDialog.resultText" rows="8"></textarea>
              </div>
            </div>
          </div>
          <div v-if="ocrDialog.error" class="ocr-error">{{ ocrDialog.error }}</div>
          <div v-if="ocrHasAnyParsed" class="ocr-parsed">
            <div class="ocr-parsed-title">自动解析字段（可修改后填入）</div>
            <div class="ocr-field-grid">
              <label v-if="ocrDialog.parsedData.name !== undefined">姓名<input v-model="ocrDialog.parsedData.name"></label>
              <label v-if="ocrDialog.parsedData.gender !== undefined">性别<input v-model="ocrDialog.parsedData.gender"></label>
              <label v-if="ocrDialog.parsedData.age !== undefined">年龄<input v-model="ocrDialog.parsedData.age"></label>
              <label v-if="ocrDialog.parsedData.dob !== undefined">出生日期<input v-model="ocrDialog.parsedData.dob"></label>
              <label v-if="ocrDialog.parsedData.idNumber !== undefined">证件号<input v-model="ocrDialog.parsedData.idNumber"></label>
              <label v-if="ocrDialog.parsedData.phone !== undefined">电话<input v-model="ocrDialog.parsedData.phone"></label>
              <label v-if="ocrDialog.parsedData.ethnicity !== undefined">民族<input v-model="ocrDialog.parsedData.ethnicity"></label>
              <label v-if="ocrDialog.parsedData.inpatientId !== undefined">住院号<input v-model="ocrDialog.parsedData.inpatientId"></label>
              <label v-if="ocrDialog.parsedData.outpatientId !== undefined">门诊号<input v-model="ocrDialog.parsedData.outpatientId"></label>
              <label v-if="ocrDialog.parsedData.onsetTime !== undefined">发病时间<input v-model="ocrDialog.parsedData.onsetTime"></label>
              <label v-if="ocrDialog.parsedData.address !== undefined">发病地址<input v-model="ocrDialog.parsedData.address"></label>
              <label v-if="ocrDialog.parsedData.detailedAddress !== undefined">详细地址<input v-model="ocrDialog.parsedData.detailedAddress"></label>
            </div>
          </div>
          <div v-if="ocrDialog.extraLines.length" class="ocr-extra">
            未匹配内容：
            <span v-for="(line, index) in ocrDialog.extraLines" :key="index">{{ line }}</span>
          </div>
        </div>
        <div class="ocr-dialog-footer">
          <button :disabled="ocrDialog.loading || !ocrHasAnyParsed" @click="applyOcrParsedData">填入当前申报表</button>
          <button @click="clearOcrResult">重新识别</button>
          <button @click="closeOcrDialog">取消</button>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" ref="mainForm">

      <div class="form-section">
        <div class="module">
          <h2>基本信息</h2>
          <div class="form-row">
            <div class="form-row-item">
              <label for="name">姓名：<span style="color: red;">*</span></label>
              <input id="name" v-model="formData.name" type="text" placeholder="请输入姓名" required>
            </div>
            <div class="form-row-item">
              <label for="gender">性别：<span style="color: red;">*</span></label>
              <select id="gender" v-model="formData.gender" required>
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-row-item">
              <label for="idType">证件类型：<span style="color: red;">*</span></label>
              <select id="idType" v-model="formData.idType" required>
                <option value="0">请选择</option>
                <option value="1">身份证</option>
                <option value="2">护照</option>
                <option value="3">军官证</option>
                <option value="4">未知</option>
              </select>
            </div>
            <div class="form-row-item">
              <label for="idNumber">证件号：<span style="color: red;">*</span></label>
              <input id="idNumber" v-model="formData.idNumber" type="text" placeholder="请输入证件号" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="age">年龄：<span style="color: red;">*</span></label>
              <input id="age" v-model="formData.age" type="number" placeholder="请输入年龄" required>
            </div>
            <div class="form-row-item">
              <label for="dob">出生日期：</label>
              <input id="dob" v-model="formData.dob" type="date" :max="maxDateTime">
            </div>
            <div class="form-row-item">
              <label for="ethnicity">民族：<span style="color: red;">*</span></label>
              <select id="ethnicity" v-model="formData.ethnicity" required>
                <option value="">请选择</option>
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
              <input id="phone" v-model="formData.phone" type="tel" placeholder="请输入手机号" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="occupation">职业：</label>
              <select id="occupation" v-model="formData.occupation">
                <option value="">请选择</option>
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
              <select id="education" v-model="formData.education">
                <option value="">请选择</option>
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
              <select id="maritalStatus" v-model="formData.maritalStatus">
                <option value="">请选择</option>
                <option value="1">未婚</option>
                <option value="2">已婚</option>
                <option value="3">丧偶</option>
                <option value="4">离异</option>
                <option value="5">不详</option>
              </select>
            </div>
            <div class="form-row-item">
              <label for="height">身高：</label>
              <input id="height" v-model="formData.height" type="text" placeholder="厘米（选填）">
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="weight">体重：</label>
              <input id="weight" v-model="formData.weight" type="text" placeholder="公斤（选填）">
            </div>
            <div class="form-row-item">
              <label for="caseDate">病例归属日期：<span style="color: red;">*</span></label>
              <input id="caseDate" v-model="formData.caseDate" type="date" :max="maxDateTime" required>
            </div>
            <div class="form-row-item">
              <!-- 占位元素，保持布局一致 -->
            </div>
            <div class="form-row-item">
              <!-- 占位元素，保持布局一致 -->
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
      <div v-show="currentModule === 'emergency'" class="form-section">
        <!--        <h3>急救</h3>-->


        <div class="module">
          <h3>基本信息</h3>
          <div class="form-row">
            <div class="form-row-item">
              <label for="inpatientId">住院ID：</label>
              <input id="inpatientId" v-model="emergencyData.inpatientId" type="text">
            </div>
            <div class="form-row-item">
              <label for="outpatientId">门诊ID：</label>
              <input id="outpatientId" v-model="emergencyData.outpatientId" type="number">
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="onsetTime">发病时间 <span style="color: red;">*</span>：</label>
              <input id="onsetTime" v-model="emergencyData.onsetTime" type="datetime-local" :max="maxDateTime" @change="validateTime(emergencyData, 'onsetTime')">
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="address">发病地址：</label>
              <input id="address" v-model="emergencyData.address" type="text" placeholder="省市区">
            </div>
            <div class="form-row-item">
              <label for="detailedAddress">详细地址：</label>
              <input id="detailedAddress" v-model="emergencyData.detailedAddress" type="text">
            </div>

          </div>
          <div class="form-row">
            <div class="form-row-item">
              <label for="insuranceType">医保类型：</label>
              <select id="insuranceType" v-model="emergencyData.insuranceType">
                <option value="">请选择</option>
                <option value="1">城镇职工</option>
                <option value="2">城镇居民</option>
                <option value="3">新农合</option>
                <option value="4">城乡居民</option>
                <option value="5">自费</option>
              </select>
            </div>

            <div class="form-row-item">
              <label for="insuranceNumber">医保编号：</label>
              <input id="insuranceNumber" v-model="emergencyData.insuranceNumber" type="text">
            </div>
            <div class="form-row-item">
              <label>大病医保：</label>
              <input id="True" v-model="emergencyData.isCriticalIllnessInsurance" type="radio" value="True">
              <label for="True">是</label>
              <input id="False" v-model="emergencyData.isCriticalIllnessInsurance" type="radio" value="False">
              <label for="False">否</label>
            </div>
          </div>
        </div>

        <!-- 病情状况模块 -->
        <div class="module">
          <h3>病情状况<span style="color: red;">*</span></h3>
          <div class="symptom-group">
            <div class="symptom-row">
              <input id="symptom1" v-model="emergencyData.symptomslevel" type="radio" value="1">
              <label for="symptom1">持续性胸闷/胸痛</label>
              <input id="symptom2" v-model="emergencyData.symptomslevel" type="radio" value="2">
              <label for="symptom2">间歇性胸闷/胸痛</label>
              <input id="symptom3" v-model="emergencyData.symptomslevel" type="radio" value="3">
              <label for="symptom3">症状已缓解</label>
            </div>
            <div class="symptom-row">
              <input id="symptom4" v-model="emergencyData.symptoms" type="checkbox" value="呼吸困难">
              <label for="symptom4">呼吸困难</label>
              <input id="symptom5" v-model="emergencyData.symptoms" type="checkbox" value="腹痛">
              <label for="symptom5">腹痛</label>
              <input id="symptom6" v-model="emergencyData.symptoms" type="checkbox" value="齿痛">
              <label for="symptom6">齿痛</label>
              <input id="symptom7" v-model="emergencyData.symptoms" type="checkbox" value="合并出血">
              <label for="symptom7">合并出血</label>
              <input id="symptom8" v-model="emergencyData.symptoms" type="checkbox" value="合并心衰">
              <label for="symptom8">合并心衰</label>
              <input id="symptom9" v-model="emergencyData.symptoms" type="checkbox" value="合并恶性心率失常">
              <label for="symptom9">合并恶性心率失常</label>
            </div>
            <div class="symptom-row">
              <input id="symptom10" v-model="emergencyData.symptoms" type="checkbox" value="自汗/大汗淋漓">
              <label for="symptom10">自汗/大汗淋漓</label>
              <input id="symptom11" v-model="emergencyData.symptoms" type="checkbox" value="心慌心悸">
              <label for="symptom11">心慌心悸</label>
              <input id="symptom12" v-model="emergencyData.symptoms" type="checkbox" value="烦躁不安">
              <label for="symptom12">烦躁不安</label>
              <input id="symptom13" v-model="emergencyData.symptoms" type="checkbox" value="颈前部束缚感">
              <label for="symptom13">颈前部束缚感</label>
              <input id="symptom14" v-model="emergencyData.symptoms" type="checkbox" value="乏力">
              <label for="symptom14">乏力</label>
              <input id="symptom15" v-model="emergencyData.symptoms" type="checkbox" value="气喘">
              <label for="symptom15">气喘</label>
              <input id="symptom16" v-model="emergencyData.symptoms" type="checkbox" value="其他">
              <label for="symptom16">其他</label>
            </div>
          </div>
        </div>

        <!-- 来院方式模块 -->
        <div class="module">
          <h3>来院方式</h3>
          <div class="form-row">
            <label>来院方式 <span style="color: red;">*</span>:</label>
            <input id="120" v-model="emergencyData.source" type="radio" :value="1">
            <label for="120">呼叫（120或其他）出车</label>
            <input id="transfer" v-model="emergencyData.source" type="radio" :value="2">
            <label for="transfer">转院</label>
            <input id="self" v-model="emergencyData.source" type="radio" :value="3">
            <label for="self">自行来院</label>
            <input id="Hospital-onset" v-model="emergencyData.source" type="radio" :value="4">
            <label for="Hospital-onset">院内发病</label>
          </div>

          <div v-if="emergencyData.source === 1">
            <div class="form-row">

              <label>出车单位 <span style="color: red;">*</span>：</label>
              <input id="ambulance120" v-model="emergencyData.transportUnit" type="radio" value="120救护车">
              <label for="ambulance120">120救护车</label>
              <input id="hospitalAmbulance" v-model="emergencyData.transportUnit" type="radio" value="本院救护车">
              <label for="hospitalAmbulance">本院救护车</label>
              <input id="externalAmbulance" v-model="emergencyData.transportUnit" type="radio" value="外院救护车">
              <label for="externalAmbulance">外院救护车</label>

            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="callTime">呼救时间 <span style="color: red;">*</span>：</label>
                <input id="callTime" v-model="emergencyData.callTime" type="datetime-local" placeholder="请输入呼救时间" :max="maxDateTime" @change="validateTime(emergencyData, 'callTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="arrivalTime">到达医院大门时间 <span style="color: red;">*</span>：</label>
                <input id="arrivalTime" v-model="emergencyData.arrivalTime" type="datetime-local" placeholder="请输入到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalTime')">
              </div>

              <div class="form-row-item">
                <label>直接转送上级医院 <span style="color: red;">*</span>：</label>
                <input id="transferFalse" v-model="emergencyData.directTransfer" type="radio" value="False">
                <label for="transferFalse">否</label>
                <input id="transferTrue" v-model="emergencyData.directTransfer" type="radio" value="True">
                <label for="transferTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="firstContactTime">首次医疗接触时间 <span style="color: red;">*</span>：</label>
                <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="请输入首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')">
              </div>

              <div class="form-row-item">
                <label for="firstDoctorTime">首诊医师接诊时间：</label>
                <input id="firstDoctorTime" v-model="emergencyData.firstDoctorTime" type="datetime-local" placeholder="请输入接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstDoctorTime')">
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="medicalStaff">医护人员：</label>
                <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="请输入医护人员姓名">
              </div>
            </div>


          </div>

          <div v-if="emergencyData.source === 2">
            <div class="form-row">
              <div class="form-row-item">
                <label>转院类型 <span style="color: red;">*</span>：</label>
                <input id="networkHospital" v-model="emergencyData.transferType" type="radio" value="网络医院">
                <label for="networkHospital">网络医院</label>
                <input id="otherMedicalInstitution" v-model="emergencyData.transferType" type="radio" value="其他医疗机构">
                <label for="otherMedicalInstitution">其他医疗机构</label>
              </div>
            </div>
            <div class="form-row">

              <div class="form-row-item">
                <label for="hospitalName">医院名称：</label>
                <input id="hospitalName" v-model="emergencyData.hospitalName" type="text" placeholder="请输入医院名称">
              </div>

              <div class="form-row-item">
                <label for="firstContactTime">首次医疗接触时间 <span style="color: red;">*</span>：</label>
                <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="请输入首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="transferInTime">转出医院入门时间 <span style="color: red;">*</span>：</label>
                <input id="transferInTime" v-model="emergencyData.transferInTime" type="datetime-local" placeholder="请输入入门时间" :max="maxDateTime" @change="validateTime(emergencyData, 'transferInTime')">
              </div>

              <div class="form-row-item">
                <label for="decisionTransferTime">决定转院时间 <span style="color: red;">*</span>：</label>
                <input id="decisionTransferTime" v-model="emergencyData.decisionTransferTime" type="datetime-local" placeholder="请输入决定转院时间" :max="maxDateTime" @change="validateTime(emergencyData, 'decisionTransferTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="transferOutTime">转出医院出门时间 <span style="color: red;">*</span>：</label>
                <input id="transferOutTime" v-model="emergencyData.transferOutTime" type="datetime-local" placeholder="请输入出门时间" :max="maxDateTime" @change="validateTime(emergencyData, 'transferOutTime')">
              </div>

              <div class="form-row-item">
                <label for="arrivalAtHospitalTime">到达本院大门时间 <span style="color: red;">*</span>：</label>
                <!--<input type="datetime-local" id="arrivalAtHospitalTime" v-model="emergencyData.arrivalAtHospitalTime" placeholder="请输入到达时间"  :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalAtHospitalTime')"/>-->
                <input id="arrivalAtHospitalTime" v-model="emergencyData.arrivalTime" type="datetime-local" placeholder="请输入到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="inHospitalConsultationTime">院内接诊时间 <span style="color: red;">*</span>：</label>
                <input id="inHospitalConsultationTime" v-model="emergencyData.inHospitalConsultationTime" type="datetime-local" placeholder="请输入接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'inHospitalConsultationTime')">
              </div>

              <div class="form-row-item">
                <label for="medicalStaff">医护人员：</label>
                <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="请输入医护人员姓名">
              </div>
            </div>
          </div>

          <div v-if="emergencyData.source === 3">
            <div class="form-row">
              <div class="form-row-item">
                <label for="arrivalAtHospitalTime">到达本院大门时间 <span style="color: red;">*</span>：</label>
                <input id="arrivalAtHospitalTime" v-model="emergencyData.arrivalAtHospitalTime" type="datetime-local" placeholder="请输入到达时间" :max="maxDateTime" @change="validateTime(emergencyData, 'arrivalAtHospitalTime')">
              </div>

              <div class="form-row-item">
                <label for="firstContactTime">首次医疗接触时间 <span style="color: red;">*</span>：</label>
                <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="请输入首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="firstDoctorTime">首诊医师接诊时间 <span style="color: red;">*</span>：</label>
                <input id="firstDoctorTime" v-model="emergencyData.firstDoctorTime" type="datetime-local" placeholder="请输入接诊时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstDoctorTime')">
              </div>

              <div class="form-row-item">
                <label for="medicalStaff">医护人员：</label>
                <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="请输入医护人员姓名">
              </div>
            </div>
          </div>
          <div v-if="emergencyData.source === 4">
            <div class="form-row">
              <div class="form-row-item">
                <label for="department">发病地点 <span style="color: red;">*</span>：</label>
                <input id="department" v-model="emergencyData.department" type="text" placeholder="请输入地点">
              </div>

              <div class="form-row-item">
                <label for="firstContactTime">首次医疗接触时间 <span style="color: red;">*</span>：</label>
                <input id="firstContactTime" v-model="emergencyData.firstContactTime" type="datetime-local" placeholder="请输入首次接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'firstContactTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="bedDoctorContactTime">床位医生接触时间：</label>
                <input id="bedDoctorContactTime" v-model="emergencyData.bedDoctorContactTime" type="datetime-local" placeholder="请输入接触时间" :max="maxDateTime" @change="validateTime(emergencyData, 'bedDoctorContactTime')">
              </div>

              <div class="form-row-item">
                <label for="leaveDepartmentTime">离开科室时间：</label>
                <input id="leaveDepartmentTime" v-model="emergencyData.leaveDepartmentTime" type="datetime-local" placeholder="请输入离开时间" :max="maxDateTime" @change="validateTime(emergencyData, 'leaveDepartmentTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label for="medicalStaff">医护人员：</label>
                <input id="medicalStaff" v-model="emergencyData.medicalStaff" type="text" placeholder="请输入医护人员姓名">
              </div>
            </div>
          </div>
        </div>

        <div class="module">
          <h3>基础生命体征</h3>
          <div class="form-row">
            <div class="form-row-item">
              <label for="consciousness">意识 <span style="color: red;">*</span>：</label>
              <select id="consciousness" v-model="emergencyData.consciousness">
                <option value="">请选择</option>
                <option value="1">清醒</option>
                <option value="2">对语言有反应</option>
                <option value="3">对刺激有反应</option>
                <option value="4">对任何刺激无反应</option>
              </select>
            </div>
            <div class="form-row-item">
              <label for="respiration">呼吸（次/分钟） <span style="color: red;">*</span>：</label>
              <input id="respiration" v-model="emergencyData.respiration" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'respiration', emergencyData.respiration, 0, 100, '次/分钟')">
            </div>

            <div class="form-row-item">
              <label for="pulse">脉搏（次/分钟） <span style="color: red;">*</span>：</label>
              <input id="pulse" v-model="emergencyData.pulse" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'pulse', emergencyData.pulse, 0, 300, '次/分钟')">
            </div>

          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="heartRate">心率 <span style="color: red;">*</span>：</label>
              <input id="heartRate" v-model="emergencyData.heartRate" type="number" placeholder="次/分钟" @input="checkValue(emergencyData,'heartRate', emergencyData.heartRate, 0, 300, '次/分钟')">
            </div>

            <div class="form-row-item">
              <label for="bloodPressure">血压 <span style="color: red;">*</span>：</label>
              <input id="bloodPressure" v-model="emergencyData.bloodPressure" type="text" placeholder="mmHg">
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label for="temperature">体温 <span style="color: red;">*</span>：</label>
              <input id="temperature" v-model="emergencyData.temperature" type="number" placeholder="℃" @blur="validateTemperature">
            </div>

          </div>

          <div class="form-row">
            <label for="patientRemarks">患者情况备注：</label>
            <textarea id="patientRemarks" v-model="emergencyData.remarks" placeholder="请输入备注" />
          </div>
        </div>
      </div>

      <div v-show="currentModule === 'chestPain'" class="form-section">
        <!--        <h3>胸痛</h3>-->
        <!-- 心电图模块 -->
        <div class="module">
          <h3>心电图</h3>
          <div class="form-row">
            <label>心电图 <span style="color: red;">*</span>：</label>
            <input id="ecgTrue" v-model="chestPainData.ecg" type="radio" value="True">
            <label for="ecgTrue">是</label>
            <input id="ecgFalse" v-model="chestPainData.ecg" type="radio" value="False">
            <label for="ecgFalse">否</label>

            <div v-if="chestPainData.ecg === 'False'" class="form-row-item">
              <label>未获得原因：</label>
              <input v-model="chestPainData.whynoecg" type="text" placeholder="原因">
            </div>
          </div>
          <div v-if="chestPainData.ecg === 'True'">

            <div v-for="(ecg, index) in chestPainData.ecgs" :key="index" class="ecg-record-container">
              <div class="ecg-record-header">
                <span class="ecg-record-title">心电图记录 {{ index + 1 }}</span>
                <button type="button" class="delete-record-btn" @click="removeEcg(index)">
                  删除此记录
                </button>
              </div>
              <div class="ecg-record-content">
                <div class="form-row-item">
                  <label :for="'ecgTime' + index">心电图时间 <span style="color: red;">*</span>：</label>
                  <input :id="'ecgTime' + index" v-model="ecg.time" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="validecgdateTime(index)">
                </div>
                <div class="form-row-item ECG">
                  <label :for="'ecgFile' + index">心电图文件 <span style="color: red;">*</span>：</label>
                  <input :id="'ecgFile' + index" type="file" accept="image/*,.pdf,.doc,.docx" @change="(event) => handleFileUpload(event, index)">
                </div>
                <div v-if="ecg.fileName" class="file-preview-container">
                  <div class="file-info">
                    <span class="file-name">{{ ecg.fileName }}</span>
                  </div>
                  <div v-if="ecg.filePreview" class="image-preview">
                    <img :src="ecg.filePreview" alt="心电图预览" class="preview-thumbnail">
                  </div>
                  <div v-else class="file-icon">
                    <span class="file-type-icon">📄</span>
                    <span class="file-type-text">文件已上传</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row">
              <button type="button" @click="addEcg">添加心电图</button>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label for="ecgDiagFalsesisTime">心电图诊断时间 <span style="color: red;">*</span>：</label>
                <input id="ecgDiagFalsesisTime" v-model="chestPainData.ecgDiagFalsesisTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ecgDiagFalsesisTime')">
              </div>
            </div>

            <!-- 其他字段保持不变 -->
          </div>
          <div class="form-row">
            <label>远程心电图传输 <span style="color: red;">*</span>：</label>
            <input id="ecgRemoteTrue" v-model="chestPainData.ecgRemote" type="radio" value="True">
            <label for="ecgRemoteTrue">接受120/网络医院心电图</label>
            <input id="ecgRemoteFalse" v-model="chestPainData.ecgRemote" type="radio" value="False">
            <label for="ecgRemoteFalse">未传输</label>
            <div v-if="chestPainData.ecgRemote === 'True'" class="form-row-item">
              <label>时间 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.ecgRemoteTime" type="datetime-local" placeholder="选择时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ecgRemoteTime')">
            </div>
            <div v-if="chestPainData.ecgRemote === 'True'" class="form-row-item">
              <label>传输方式 <span style="color: red;">*</span>：</label>
              <input id="transmissionMethod1" v-model="chestPainData.transmissionMethod" type="radio" value="1">
              <label for="transmissionMethod1">实时监控</label>
              <input id="transmissionMethod2" v-model="chestPainData.transmissionMethod" type="radio" value="2">
              <label for="transmissionMethod2">微信群</label>
            </div>
          </div>
        </div>

        <!-- 实验室检查模块 -->
        <div class="module">
          <h3>实验室检查</h3>
          <div class="form-row">
            <div class="form-row-item">
              <label>肌钙蛋白 <span style="color: red;">*</span>：</label>

              <input id="troponinFalse" v-model="chestPainData.troponin" type="radio" value="False">
              <label for="troponinFalse">否</label>
              <input id="troponinTrue" v-model="chestPainData.troponin" type="radio" value="True">
              <label for="troponinTrue">是</label>
            </div>
          </div>
          <div v-if="chestPainData.troponin === 'True'">
            <div v-for="(troponin, index) in chestPainData.troponins" :key="index">
              <div class="form-row">
                <div class="form-row-item">
                  <label>{{ index === 0 ? '首次肌钙蛋白' : '肌钙蛋白' }}：</label>
                  <input :id="'troponinT' + index" v-model="troponin.type" type="radio" value="TnT">
                  <label :for="'troponinT' + index">TnT</label>
                  <input :id="'troponinI' + index" v-model="troponin.type" type="radio" value="TnI">
                  <label :for="'troponinI' + index">TnI</label>
                </div>

                <div class="form-row-item">
                  <label>单位：</label>
                  <input :id="'unitNgMl' + index" v-model="troponin.unit" type="radio" value="ng/ml">
                  <span :for="'unitNgMl' + index">ng/ml</span>
                  <input :id="'unitUgL' + index" v-model="troponin.unit" type="radio" value="ug/L">
                  <span :for="'unitUgL' + index">ug/L</span>

                  <input :id="'unitNgL' + index" v-model="troponin.unit" type="radio" value="ng/L">
                  <span :for="'unitNgL' + index">ng/L</span>
                  <input :id="'unitPgMl' + index" v-model="troponin.unit" type="radio" value="pg/ml">
                  <span :for="'unitPgMl' + index">pg/ml</span>
                  <input :id="'unitMgL' + index" v-model="troponin.unit" type="radio" value="mg/L">
                  <span :for="'unitMgL' + index">mg/L</span>
                </div>



              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>结果 <span style="color: red;">*</span>：</label>
                  <input :id="'resultNegative' + index" v-model="troponin.result" type="radio" value="阴性">
                  <span :for="'resultNegative' + index">阴性</span>
                  <input :id="'resultPositive' + index" v-model="troponin.result" type="radio" value="阳性">
                  <span :for="'resultPositive' + index">阳性</span>
                </div>
                <div class="form-row-item">
                  <label for="'bloodDrawTime' + index">抽血完成时间 <span style="color: red;">*</span>：</label>
                  <input :id="'bloodDrawTime' + index" v-model="troponin.bloodDrawTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="checktroponinTimes(index)">
                </div>

                <div class="form-row-item">
                  <label for="'reportTime' + index">获得报告时间 <span style="color: red;">*</span>：</label>
                  <input :id="'reportTime' + index" v-model="troponin.reportTime" type="datetime-local" class="datetimepicker" placeholder="选择时间" :max="maxDateTime" @change="checktroponinTimes(index)">
                </div>
                <div class="form-row-item">
                  <button type="button" @click="removeTroponin(index)">删除</button>
                </div>
              </div>

            </div>
            <button type="button" @click="addTroponin">添加肌钙蛋白</button>
          </div>




          <div class="form-row">
            <div class="form-row-item">
              <label>血清肌酐 <span style="color: red;">*</span>：</label>

              <input id="creatinineFalse" v-model="chestPainData.creatinine" type="radio" value="False">
              <label for="creatinineFalse">否</label>
              <input id="creatinineTrue" v-model="chestPainData.creatinine" type="radio" value="True">
              <label for="creatinineTrue">是</label>
            </div>
            <div v-if="chestPainData.creatinine === 'True'" class="form-row-item">
              <label>数值 v：</label>
              <input v-model="chestPainData.creatinineValue" type="number" placeholder="输入值">
              <span>umol/L</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label>D二聚体 <span style="color: red;">*</span>：</label>

              <input id="dDimerFalse" v-model="chestPainData.dDimer" type="radio" value="False">
              <label for="dDimerFalse">否</label>
              <input id="dDimerTrue" v-model="chestPainData.dDimer" type="radio" value="True">
              <label for="dDimerTrue">是</label>
            </div>
            <div v-if="chestPainData.dDimer === 'True'" class="form-row-item">
              <label>数值 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.dDimerValue" type="number" placeholder="输入值">
              <span>ug/L</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label>BNP <span style="color: red;">*</span>：</label>

              <input id="bnpFalse" v-model="chestPainData.bnp" type="radio" value="False">
              <label for="bnpFalse">否</label>
              <input id="bnpTrue" v-model="chestPainData.bnp" type="radio" value="True">
              <label for="bnpTrue">是</label>
            </div>
            <div v-if="chestPainData.bnp === 'True'" class="form-row-item">
              <label>数值 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.bnpValue" type="number" placeholder="输入值">
              <span>pg/ml</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label>NT-proBNP <span style="color: red;">*</span>：</label>

              <input id="ntProBnpFalse" v-model="chestPainData.ntProBnp" type="radio" value="False">
              <label for="ntProBnpFalse">否</label>
              <input id="ntProBnpTrue" v-model="chestPainData.ntProBnp" type="radio" value="True">
              <label for="ntProBnpTrue">是</label>
            </div>
            <div v-if="chestPainData.ntProBnp === 'True'" class="form-row-item">
              <label>数值 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.ntProBnpValue" type="number" placeholder="输入值">
              <span>pg/ml</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label>Myo <span style="color: red;">*</span>：</label>

              <input id="myoFalse" v-model="chestPainData.myo" type="radio" value="False">
              <label for="myoFalse">否</label>
              <input id="myoTrue" v-model="chestPainData.myo" type="radio" value="True">
              <label for="myoTrue">是</label>
            </div>
            <div v-if="chestPainData.myo === 'True'" class="form-row-item">
              <label>数值 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.myoValue" type="number" placeholder="输入值">
              <input id="myoValueUnitng" v-model="chestPainData.myoValueUnit" type="radio" value="ng/ml">
              <span for="myoValueUnitng">ng/ml</span>
              <input id="myoValueUnitug" v-model="chestPainData.myoValueUnit" type="radio" value="ug/L">
              <span for="myoValueUnitug">ug/ml</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-item">
              <label>CKMB <span style="color: red;">*</span>：</label>

              <input id="ckmbFalse" v-model="chestPainData.ckmb" type="radio" value="False">
              <label for="ckmbFalse">否</label>
              <input id="ckmbTrue" v-model="chestPainData.ckmb" type="radio" value="True">
              <label for="ckmbTrue">是</label>
            </div>
            <div v-if="chestPainData.ckmb === 'True'" class="form-row-item">
              <label>数值 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.ckmbValue" type="number" placeholder="输入值">

              <input id="ckmbValueUnitng" v-model="chestPainData.ckmbValueUnit" type="radio" value="ng/ml">
              <span for="ckmbValueUnitng">ng/ml</span>
              <input id="ckmbValueUnitug" v-model="chestPainData.ckmbValueUnit" type="radio" value="ug/L">
              <span for="ckmbValueUnitug">ug/ml</span>
              <input id="ckmbValueUnitu" v-model="chestPainData.ckmbValueUnit" type="radio" value="U/L">
              <span for="ckmbValueUnitU">U/ml</span>

            </div>
          </div>
        </div>

        <!-- 心内科会诊模块 -->
        <div class="module">
          <h3>心内科会诊</h3>
          <div class="form-row">
            <label>是否会诊 <span style="color: red;">*</span>：</label>
            <input id="consultTrue" v-model="chestPainData.consult" type="radio" value="True">
            <label for="consultTrue">是</label>
            <input id="consultFalse" v-model="chestPainData.consult" type="radio" value="False">
            <label for="consultFalse">否</label>
          </div>
          <div v-if="chestPainData.consult==='True'" class="form-row">
            <div class="form-row-item">
              <label>会诊类型 <span style="color: red;">*</span>：</label>
              <input id="consultationType1" v-model="chestPainData.consultationType" type="radio" value="现场会诊">
              <label for="consultationType1">现场会诊</label>
              <input id="consultationType2" v-model="chestPainData.consultationType" type="radio" value="远程会诊">
              <label for="consultationType2">远程会诊</label>
            </div>
            <div class="form-row-item">
              <label>通知心外科会诊 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.cardiacSurgeryConsultationFalsetification" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationFalsetification')">
            </div>
            <div class="form-row-item">
              <label>心外科会诊时间 <span style="color: red;">*</span>：</label>
              <input v-model="chestPainData.cardiacSurgeryConsultationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationTime')">
            </div>
          </div>
        </div>

        <!-- 诊断模块 -->
        <div class="module">
          <!--              <h3>诊断</h3>-->
          <div class="form-row">
            <label>初步诊断 <span style="color: red;">*</span>：</label>
            <input id="diagFalsesisSTEMI" v-model="chestPainData.diagFalsesis" type="radio" value="STEMI">
            <span for="diagFalsesisSTEMI">STEMI</span>
            <input id="diagFalsesisNSTEMI" v-model="chestPainData.diagFalsesis" type="radio" value="NSTEMI">
            <span for="diagFalsesisNSTEMI">NSTEMI</span>
            <input id="diagFalsesisUA" v-model="chestPainData.diagFalsesis" type="radio" value="UA">
            <span for="diagFalsesisUA">UA</span>
            <input id="diagFalsesisAorticDissection" v-model="chestPainData.diagFalsesis" type="radio" value="主动脉夹层">
            <span for="diagFalsesisAorticDissection">主动脉夹层</span>

            <input id="diagFalsesisPulmonaryEmbolism" v-model="chestPainData.diagFalsesis" type="radio" value="肺动脉栓塞">
            <span for="diagFalsesisPulmonaryEmbolism">肺动脉栓塞</span>

            <input id="diagFalsesisFalsenACS" v-model="chestPainData.diagFalsesis" type="radio" value="非ACS心源性胸痛">
            <span for="diagFalsesisFalsenACS">非ACS心源性胸痛</span>

            <input id="diagFalsesisOtherFalsenCardiac" v-model="chestPainData.diagFalsesis" type="radio" value="其它非心源性胸痛">
            <span for="diagFalsesisOtherFalsenCardiac">其它非心源性胸痛</span>

            <input id="diagFalsesisPending" v-model="chestPainData.diagFalsesis" type="radio" value="待查">
            <span for="diagFalsesisPending">待查</span>
          </div>
          <div v-if="chestPainData.diagFalsesis === 'STEMI'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.doctorName" type="text" placeholder="输入医生姓名">
              </div>
            </div>

            <div class="form-row">
              <label>心功能分级 <span style="
              color: red;">*</span>：</label>
              <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)">
              <span for="classI">I级(FalseCHF)</span>
              <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)">
              <span for="classII">II级(ralesand/orJVD)</span>
              <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)">
              <span for="classIII">III级(pulmonaryedema)</span>
              <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)">
              <span for="classIV">IV级(cardiogenicshock)</span>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>绕行急诊 <span style="color: red;">*</span>:</label>
                <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False">
                <label for="emergencyBypassFalse">否</label>
                <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True">
                <label for="emergencyBypassTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>绕行CCU <span style="color: red;">*</span>：</label>

                <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False">
                <label for="ccuBypassFalse">否</label>
                <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True">
                <label for="ccuBypassTrue">是</label>
              </div>
            </div>


            <div class="form-row">

              <div class="form-row-item">
                <label>抗血小板治疗 <span style="color: red;">*</span>：</label>
                <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False">
                <label for="antiplateletFalse">否</label>
                <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True">
                <label for="antiplateletTrue">是</label>
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>阿司匹林：</label>
                <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>氯吡格雷：</label>

                <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>替格瑞洛：</label>
                <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>抗凝 <span style="color: red;">*</span>：</label>
                <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False">
                <label for="anticoagulationFalse">否</label>
                <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True">
                <label for="anticoagulationTrue">是</label>
              </div>
            </div>

            <div v-if="chestPainData.anticoagulation==='True'">
              <div class="form-row">
                <div style="display: flex; align-items: center;">
                  <label>抗凝药物：</label>
                  <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素">
                  <span for="heparin">普通肝素</span>
                  <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素">
                  <span for="lmwh">低分子子肝素</span>
                  <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定">
                  <span for="bivalirudin">比伐卢定</span>
                  <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠">
                  <span for="fondaparinux">磺达肝癸钠</span>
                </div>

                <div class="form-row-item">
                  <label>剂量：</label>
                  <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量">
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')">
                </div>
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>他汀治疗 <span style="color: red;">*</span>：</label>
                <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False">
                <label for="statinFalse">否</label>
                <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True">
                <label for="statinTrue">是</label>
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>β受体阻滞剂 <span style="color: red;">*</span>：</label>
                <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False">
                <label for="betaBlockerFalse">否</label>
                <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True">
                <label for="betaBlockerTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <label>再灌注措施 <span style="color: red;">*</span>：</label>
              <div style="display: flex; align-items: center;">
                <input id="reperfusionFalse" v-model="chestPainData.reperfusion" type="radio" value="False">
                <label for="reperfusionFalse">否</label>
                <input id="reperfusionTrue" v-model="chestPainData.reperfusion" type="radio" value="True">
                <label for="reperfusionTrue">是</label>
              </div>
            </div>

            <div v-if="chestPainData.reperfusion === 'True'" class="form-row">
              <label>措施 <span style="color: red;">*</span>：</label>
              <div style="display: flex; align-items: center;">
                <input id="directPCI" v-model="chestPainData.reperfusionMethod" type="radio" value="直接PCI">
                <span for="directPCI">直接PCI</span>
                <input id="thrombolysis" v-model="chestPainData.reperfusionMethod" type="radio" value="溶栓">
                <span for="thrombolysis">溶栓</span>
                <input id="rescuePCI" v-model="chestPainData.reperfusionMethod" type="radio" value="补救PCI">
                <span for="rescuePCI">补救PCI</span>
                <input id="thrombolysisIntervention" v-model="chestPainData.reperfusionMethod" type="radio" value="溶栓后介入">
                <span for="thrombolysisIntervention">溶栓后介入</span>
                <input id="CABG" v-model="chestPainData.reperfusionMethod" type="radio" value="CABG">
                <span for="CABG">CABG</span>
                <input id="transportPCI" v-model="chestPainData.reperfusionMethod" type="radio" value="转运PCI">
                <span for="transportPCI">转运PCI</span>
                <input id="FalseReperfusion" v-model="chestPainData.reperfusionMethod" type="radio" value="无再灌注措施">
                <span for="FalseReperfusion">无再灌注措施</span>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='直接PCI'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>决定医生：</label>
                  <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名">
                </div>
                <div class="form-row-item">
                  <label>决定介入手术时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>启动导管室时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.cathLabStartTime" type="text" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')">
                </div>
                <div class="form-row-item">
                  <label>开始知情同意时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.informedConsentStartTime" type="text" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')">
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>签署知情同意时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.informedConsentSignatureTime" type="text" placeholder="输入时间">
                </div>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='溶栓'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>溶栓筛查 <span style="color: red;">*</span>：</label>
                  <input id="screeningSuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="合适">
                  <span for="screeningSuitable">合适</span>
                  <input id="screeningUnsuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="不合适">
                  <span for="screeningUnsuitable">不合适</span>
                  <input id="screeningFalsetScreened" v-model="chestPainData.thrombolysisScreening" type="radio" value="未筛查">
                  <span for="screeningFalsetScreened">未筛查</span>
                </div>
                <div class="form-row-item">
                  <label>溶栓治疗 <span style="color: red;">*</span>：</label>
                  <input id="thrombolysisTrue" v-model="chestPainData.thrombolysisTreatment" type="radio" value="有">
                  <label for="thrombolysisTrue">有</label>
                  <input id="thrombolysisFalse" v-model="chestPainData.thrombolysisTreatment" type="radio" value="无">
                  <label for="thrombolysisFalse">无</label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>直达溶栓场所 <span style="color: red;">*</span>：</label>
                  <input id="transportFalse" v-model="chestPainData.thrombolysisLocation" type="radio" value="False">
                  <label for="transportFalse">否</label>
                  <input id="transportTrue" v-model="chestPainData.thrombolysisLocation" type="radio" value="True">
                  <label for="transportTrue">是</label>
                </div>
                <div class="form-row-item">
                  <label>溶栓场所 <span style="color: red;">*</span>：</label>
                  <select v-model="chestPainData.thrombolysisLocationDetail">
                    <option value="本院急诊科">本院急诊科</option>
                    <option value="本院心内科">本院心内科</option>
                    <option value="其他科室">其他科室</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>开始知情同意 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidoginformedConsentStartTimerelTime')">
                </div>
                <div class="form-row-item">
                  <label>签署知情同意书 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.informedConsentSignature" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignature')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>开始溶栓时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.thrombolysisStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'thrombolysisStartTime')">
                </div>
                <div class="form-row-item">
                  <label>溶栓结束时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.thrombolysisEndTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'thrombolysisEndTime')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>溶栓药物 <span style="color: red;">*</span>：</label>
                  <input id="firstGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第一代">
                  <span for="firstGeneration">第一代</span>
                  <input id="secondGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第二代">
                  <span for="secondGeneration">第二代</span>
                  <input id="thirdGeneration" v-model="chestPainData.thrombolysisDrug" type="radio" value="第三代">
                  <span for="thirdGeneration">第三代</span>
                </div>

                <div class="form-row-item">
                  <label>剂量 <span style="color: red;">*</span>：</label>
                  <input id="fullDose" v-model="chestPainData.thrombolysisDose" type="radio" value="全量">
                  <label for="fullDose">全量</label>
                  <input id="halfDose" v-model="chestPainData.thrombolysisDose" type="radio" value="半量">
                  <label for="halfDose">半量</label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label>溶栓再通 <span style="color: red;">*</span>：</label>
                  <input id="reperfusionFalse" v-model="chestPainData.thrombolysisReperfusion" type="radio" value="False">
                  <label for="reperfusionFalse">否</label>
                  <input id="reperfusionTrue" v-model="chestPainData.thrombolysisReperfusion" type="radio" value="True">
                  <label for="reperfusionTrue">是</label>
                </div>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='补救PCI' || chestPainData.reperfusionMeasures==='择期介入'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>决定介入手术时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')">
                </div>
                <div class="form-row-item">
                  <label>造影开始时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.angiographyStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'angiographyStartTime')">
                </div>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='CABG'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>决定CABG时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.cabgDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cabgDecisionTime')">
                </div>
                <div class="form-row-item">
                  <label>开始CABG时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.cabgStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cabgStartTime')">
                </div>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='转运PCI'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>转运PCI <span style="color: red;">*</span>：</label>
                  <input id="transferOut" v-model="chestPainData.transportPCI" type="radio" value="转出患者">
                  <label for="transferOut">转出患者</label>
                  <input id="transferIn" v-model="chestPainData.transportPCI" type="radio" value="接收患者">
                  <label for="transferIn">接收患者</label>
                </div>
              </div>
            </div>

            <div v-if="chestPainData.reperfusionMethod==='无再灌注措施'">
              <div class="form-row">
                <label>无再灌注措施原因：</label>
                <input id="FalsePain" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="无明确胸痛">
                <span for="FalsePain">无明确胸痛，生命体征平稳</span>
                <input id="missedTime" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="错过再灌注时间">
                <span for="missedTime">错过再灌注时间</span>
                <input id="bleeding" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="出血">
                <span for="bleeding">出血</span>
                <input id="severeFunction" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="严重肝肾功能不全">
                <span for="severeFunction">严重肝肾功能不全</span>
                <input id="ecoFalsemicReasons" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="经济原因">
                <span for="ecoFalsemicReasons">经济原因</span>
                <input id="familyAbandon" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="家庭放弃">
                <span for="familyAbandon">家庭放弃</span>
                <input id="otherReasons" v-model="chestPainData.FalseReperfusionReason" type="checkbox" value="其他原因">
                <span for="otherReasons">其他原因</span>
              </div>
            </div>


            <div v-if="chestPainData.reperfusionMethod==='直接PCI'||chestPainData.reperfusionMeasures==='溶栓'||chestPainData.reperfusionMeasures==='补救PCI'">
              <h3>导管相关信息</h3>
              <div class="form-row">
                <div class="form-row-item">
                  <label for="catheterLabActivationTime">导管室激活时间 <span style="color: red;">*</span>：</label>
                  <input id="catheterLabActivationTime" v-model="catheterData.catheterLabActivationTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'catheterLabActivationTime')">
                </div>
                <div class="form-row-item">
                  <label for="patientArrivalCatheterLabTime">患者到达导管室时间 <span style="color: red;">*</span>：</label>
                  <input id="patientArrivalCatheterLabTime" v-model="catheterData.patientArrivalCatheterLabTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'patientArrivalCatheterLabTime')">
                </div>
                <div class="form-row-item">
                  <label for="interventionist">介入医师姓名：</label>
                  <input id="interventionist" v-model="catheterData.interventionist" type="text" >
                </div>
              </div>




              <div class="form-row">
                <div class="form-row-item">
                  <label for="startPunctureTime">开始穿刺时间 <span style="color: red;">*</span>：</label>
                  <input id="startPunctureTime" v-model="catheterData.startPunctureTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'startPunctureTime')">
                </div>

                <div class="form-row-item">
                  <label for="angiographyStartTime">造影开始时间 <span style="color: red;">*</span>：</label>
                  <input id="angiographyStartTime" v-model="catheterData.angiographyStartTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'angiographyStartTime')">
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label for="anticoagulationDrugAdministrationTime">抗凝给药时间 <span style="color: red;">*</span>：</label>
                  <input id="anticoagulationDrugAdministrationTime" v-model="catheterData.anticoagulationDrugAdministrationTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'anticoagulationDrugAdministrationTime')">
                </div>


                <div class="form-row-item">
                  <label for="anticoagulationDrug">抗凝药物种类：</label>
                  <select id="anticoagulationDrug" v-model="catheterData.anticoagulationDrug">
                    <option value="">请选择</option>
                    <option value="普通肝素">普通肝素</option>
                    <option value="低分子肝素">低分子肝素</option>
                    <option value="比伐卢定">比伐卢定</option>
                    <option value="磺达肝癸钠">磺达肝癸钠</option>
                  </select>
                </div>

                <div class="form-row-item">
                  <label for="anticoagulationDrugDose">抗凝药物剂量：</label>
                  <input id="anticoagulationDrugDose" v-model="catheterData.anticoagulationDrugDose" type="number">
                </div>

                <div class="form-row-item">
                  <label for="anticoagulationDrugUnit">抗凝药物剂量单位：</label>
                  <input id="anticoagulationDrugUnit" v-model="catheterData.anticoagulationDrugUnit" type="text">
                </div>
              </div>

              <div class="form-row">
                <div class="form-row-item">
                  <label for="surgeryEndTime">手术结束时间 <span style="color: red;">*</span>：</label>
                  <input id="surgeryEndTime" v-model="catheterData.surgeryEndTime" type="datetime-local" :max="maxDateTime" @change="validateTime(catheterData, 'surgeryEndTime')">
                </div>
              </div>

              <div class="form-row">
                <label>是否延误：</label>
                <input id="isDelayedYes" v-model="catheterData.isDelayed" type="radio" value="True">
                <label for="isDelayedYes">是</label>
                <input id="isDelayedNo" v-model="catheterData.isDelayed" type="radio" value="False">
                <label for="isDelayedNo">否</label>
              </div>

              <div v-if="catheterData.isDelayed === 'True'" class="form-row">
                <label for="delayReasons">延误原因：</label>
                <select id="delayReasons" v-model="catheterData.delayReasons">
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
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.doctorName" type="text" placeholder="输入医生姓名">
              </div>
            </div>

            <div class="form-row">
              <label>心功能分级 <span style="color: red;">*</span>：</label>
              <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)">
              <span for="classI">I级(FalseCHF)</span>
              <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)">
              <span for="classII">II级(ralesand/orJVD)</span>
              <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)">
              <span for="classIII">III级(pulmonaryedema)</span>
              <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)">
              <span for="classIV">IV级(cardiogenicshock)</span>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>绕行急诊 <span style="color: red;">*</span>:</label>
                <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False">
                <label for="emergencyBypassFalse">否</label>
                <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True">
                <label for="emergencyBypassTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>绕行CCU <span style="color: red;">*</span>：</label>
                <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False">
                <label for="ccuBypassFalse">否</label>
                <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True">
                <label for="ccuBypassTrue">是</label>
              </div>
            </div>


            <div class="form-row">

              <div class="form-row-item">
                <label>抗血小板治疗 <span style="color: red;">*</span>：</label>
                <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False">
                <label for="antiplateletFalse">否</label>
                <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True">
                <label for="antiplateletTrue">是</label>
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>阿司匹林：</label>
                <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>氯吡格雷：</label>
                <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>替格瑞洛：</label>
                <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')">
              </div>
            </div>

            <div class="form-row">
              <label>抗凝 <span style="color: red;">*</span>：</label>
              <div class="form-row-item">
                <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False">
                <label for="anticoagulationFalse">否</label>
                <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True">
                <label for="anticoagulationTrue">是</label>
              </div>
            </div>
            <div v-if="chestPainData.anticoagulation==='True'">
              <div class="form-row">
                <div style="display: flex; align-items: center;">
                  <label>抗凝药物：</label>
                  <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素">
                  <span for="heparin">普通肝素</span>
                  <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素">
                  <span for="lmwh">低分子子肝素</span>
                  <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定">
                  <span for="bivalirudin">比伐卢定</span>
                  <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠">
                  <span for="fondaparinux">磺达肝癸钠</span>
                </div>

                <div class="form-row-item">
                  <label>剂量：</label>
                  <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量">
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')">
                </div>
              </div>
            </div>

            <div class="form-row">
              <label>他汀治疗 <span style="color: red;">*</span>：</label>
              <div class="form-row-item">
                <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False">
                <label for="statinFalse">否</label>
                <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True">
                <label for="statinTrue">是</label>
              </div>
            </div>

            <div class="form-row">
              <label>β受体阻滞剂 <span style="color: red;">*</span>：</label>
              <div class="form-row-item">
                <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False">
                <label for="betaBlockerFalse">否</label>
                <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True">
                <label for="betaBlockerTrue">是</label>
              </div>
            </div>

            <div class="form-row" style="display: flex; align-items: center;justify-content: flex-start;flex-wrap: wrap;">
              <label>Grace评估：</label>
              <input id="cardiacArrest" v-model="chestPainData.graceAssessment" type="checkbox" value="心脏骤停">
              <span for="cardiacArrest">发病后曾出现心脏骤停</span>
              <input id="stSegmentChange" v-model="chestPainData.graceAssessment" type="checkbox" value="ST段改变">
              <span for="stSegmentChange">心电图ST段改变</span>
              <input id="biomarkerElevated" v-model="chestPainData.graceAssessment" type="checkbox" value="心肌坏死标志物升高">
              <span for="biomarkerElevated">心肌坏死标志物升高</span>
            </div>

            <div class="form-row">
              <label>Grace极高危条件：</label>
              <input id="acuteHeartFailure" v-model="chestPainData.graceHighRisk" type="checkbox" value="急性心力衰竭">
              <span for="acuteHeartFailure">急性心力衰竭伴难治性心绞痛和ST段改变</span>
              <input id="lifeThreateningArrhythmia" v-model="chestPainData.graceHighRisk" type="checkbox" value="心律失常">
              <span for="lifeThreateningArrhythmia">危及生命的心律失常或心脏骤停</span>
              <input id="cardiogenicShock" v-model="chestPainData.graceHighRisk" type="checkbox" value="心源性休克">
              <span for="cardiogenicShock">心源性休克或血流动力学不稳定</span>
              <input id="miComplications" v-model="chestPainData.graceHighRisk" type="checkbox" value="机械性并发症">
              <span for="miComplications">心肌梗死机械性并发症</span>
              <input id="dynamicEvolution" v-model="chestPainData.graceHighRisk" type="checkbox" value="ST-T动态演变">
              <span for="dynamicEvolution">再发ST-T动态演变，尤其是伴有间歇性ST段抬高</span>
            </div>

            <div class="form-row">
              <label>Grace分值：</label>
              <input v-model="chestPainData.graceScore" type="number" placeholder="输入分值">
            </div>

            <div class="form-row">
              <label>Grace危险分层：</label>
              <input id="veryHighRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="极高危">
              <span for="veryHighRisk">极高危</span>
              <input id="highRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="高危">
              <span for="highRisk">高危</span>
              <input id="mediumRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="中危">
              <span for="mediumRisk">中危</span>
              <input id="lowRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="低危">
              <span for="lowRisk">低危</span>
            </div>

            <div class="form-row">
              <label>再次危险分层：</label>
              <input id="FalsetDone" v-model="chestPainData.reassessment" type="radio" value="未做">
              <span for="FalsetDone">未做</span>

              <input id="toSTEMI" v-model="chestPainData.reassessment" type="radio" value="转为STEMI">
              <span for="toSTEMI">转为STEMI</span>

              <input id="veryHighRiskAgain" v-model="chestPainData.reassessment" type="radio" value="极高危">
              <span for="veryHighRiskAgain">极高危</span>

              <input id="highRiskAgain" v-model="chestPainData.reassessment" type="radio" value="高危">
              <span for="highRiskAgain">高危</span>

              <input id="mediumRiskAgain" v-model="chestPainData.reassessment" type="radio" value="中危">
              <span for="mediumRiskAgain">中危</span>

              <input id="lowRiskAgain" v-model="chestPainData.reassessment" type="radio" value="低危">
              <span for="lowRiskAgain">低危</span>

            </div>

            <div class="form-row">
              <label>再次危险分层时间：</label>
              <input v-model="chestPainData.reassessmentTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'reassessmentTime')">
            </div>

            <div class="form-row">
              <label>处理策略 <span style="color: red;">*</span>：</label>

              <input id="conservative" v-model="chestPainData.treatmentStrategyNstemi" type="radio" value="保守治疗">
              <span for="conservative">保守治疗(仅药物治疗)</span>

              <input id="invasive" v-model="chestPainData.treatmentStrategyNstemi" type="radio" value="侵入性策略">
              <span for="invasive">侵入性策略</span>

            </div>
            <div v-if="chestPainData.treatmentStrategyNstemi === '侵入性策略'">
              <div class="form-row">
                <label>侵入性策略：<span style="color: red;">*</span></label>

                <input id="emergencyIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="紧急介入治疗">
                <span for="emergencyIntervention">紧急介入治疗</span>

                <input id="within24Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="24H内介入治疗">
                <span for="within24Hours">24H内介入治疗</span>

                <input id="within72Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="72H内介入治疗">
                <span for="within72Hours">72H内介入治疗</span>

                <input id="scheduledIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="择期介入治疗">
                <span for="scheduledIntervention">择期介入治疗</span>
                <input id="CABG" v-model="chestPainData.invasiveStrategy" type="radio" value="CABG">
                <span for="CABG">CABG</span>

              </div>

              <div v-if="chestPainData.invasiveStrategy === '紧急介入治疗'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>决定医生：</label>
                    <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名">
                  </div>
                  <div class="form-row-item">
                    <label>决定介入手术时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>启动导管室时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.cathLabStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')">
                  </div>
                  <div class="form-row-item">
                    <label>开始知情同意时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')">
                  </div>

                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>签署知情同意时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.informedConsentSignatureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignatureTime')">
                  </div>
                </div>

              </div>
              <div v-if="chestPainData.invasiveStrategy === '24H内介入治疗'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>实际介入治疗时间：</label>
                    <input v-model="chestPainData.actualInterventionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'actualInterventionTime')">
                  </div>
                </div>
              </div>

            </div>



          </div>
          <div v-if="chestPainData.diagFalsesis === 'UA'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.diagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'diagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.doctorName" type="text" placeholder="输入医生姓名">
              </div>
            </div>

            <div class="form-row">
              <label>心功能分级 <span style="color: red;">*</span>：</label>
              <input id="classI" v-model="chestPainData.heartFunctionClass" type="radio" value="I级(FalseCHF)">
              <span for="classI">I级(FalseCHF)</span>
              <input id="classII" v-model="chestPainData.heartFunctionClass" type="radio" value="II级(ralesand/orJVD)">
              <span for="classII">II级(ralesand/orJVD)</span>
              <input id="classIII" v-model="chestPainData.heartFunctionClass" type="radio" value="III级(pulmonaryedema)">
              <span for="classIII">III级(pulmonaryedema)</span>
              <input id="classIV" v-model="chestPainData.heartFunctionClass" type="radio" value="IV级(cardiogenicshock)">
              <span for="classIV">IV级(cardiogenicshock)</span>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>绕行急诊 <span style="color: red;">*</span>:</label>
                <input id="emergencyBypassFalse" v-model="chestPainData.emergencyBypass" type="radio" value="False">
                <label for="emergencyBypassFalse">否</label>
                <input id="emergencyBypassTrue" v-model="chestPainData.emergencyBypass" type="radio" value="True">
                <label for="emergencyBypassTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>绕行CCU <span style="color: red;">*</span>：</label>
                <input id="ccuBypassFalse" v-model="chestPainData.ccuBypass" type="radio" value="False">
                <label for="ccuBypassFalse">否</label>
                <input id="ccuBypassTrue" v-model="chestPainData.ccuBypass" type="radio" value="True">
                <label for="ccuBypassTrue">是</label>
              </div>
            </div>


            <div class="form-row">

              <div class="form-row-item">
                <label>抗血小板治疗 <span style="color: red;">*</span>：</label>
                <input id="antiplateletFalse" v-model="chestPainData.antiplateletTreatment" type="radio" value="False">
                <label for="antiplateletFalse">否</label>
                <input id="antiplateletTrue" v-model="chestPainData.antiplateletTreatment" type="radio" value="True">
                <label for="antiplateletTrue">是</label>
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>阿司匹林：</label>
                <input v-model="chestPainData.aspirinDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.aspirinTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aspirinTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>氯吡格雷：</label>
                <input v-model="chestPainData.clopidogrelDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.clopidogrelTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'clopidogrelTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>替格瑞洛：</label>
                <input v-model="chestPainData.ticagrelorDose" type="number" placeholder="mg">

              </div>
              <div class="form-row-item">
                <label>时间：</label>
                <input v-model="chestPainData.ticagrelorTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ticagrelorTime')">
              </div>
            </div>

            <div class="form-row">

              <div class="form-row-item">
                <label>抗凝 <span style="color: red;">*</span>：</label>
                <input id="anticoagulationFalse" v-model="chestPainData.anticoagulation" type="radio" value="False">
                <label for="anticoagulationFalse">否</label>
                <input id="anticoagulationTrue" v-model="chestPainData.anticoagulation" type="radio" value="True">
                <label for="anticoagulationTrue">是</label>
              </div>
            </div>

            <div v-if="chestPainData.anticoagulation==='True'">
              <div class="form-row">
                <div style="display: flex; align-items: center;">
                  <label>抗凝药物：</label>
                  <input id="heparin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="普通肝素">
                  <span for="heparin">普通肝素</span>
                  <input id="lmwh" v-model="chestPainData.anticoagulantDrugs" type="radio" value="低分子子肝素">
                  <span for="lmwh">低分子子肝素</span>
                  <input id="bivalirudin" v-model="chestPainData.anticoagulantDrugs" type="radio" value="比伐卢定">
                  <span for="bivalirudin">比伐卢定</span>
                  <input id="fondaparinux" v-model="chestPainData.anticoagulantDrugs" type="radio" value="磺达肝癸钠">
                  <span for="fondaparinux">磺达肝癸钠</span>
                </div>

                <div class="form-row-item">
                  <label>剂量：</label>
                  <input v-model="chestPainData.anticoagulantDose" type="text" placeholder="剂量">
                </div>
              </div>

              <div class="form-row">

                <div class="form-row-item">
                  <label>时间：</label>
                  <input v-model="chestPainData.anticoagulantTime" type="datetime-local" placeholder="时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulantTime')">
                </div>
              </div>
            </div>

            <div class="form-row">
              <label>他汀治疗 <span style="color: red;">*</span>：</label>
              <div class="form-row-item">
                <input id="statinFalse" v-model="chestPainData.statinTreatment" type="radio" value="False">
                <label for="statinFalse">否</label>
                <input id="statinTrue" v-model="chestPainData.statinTreatment" type="radio" value="True">
                <label for="statinTrue">是</label>
              </div>
            </div>

            <div class="form-row">
              <label>β受体阻滞剂 <span style="color: red;">*</span>：</label>
              <div class="form-row-item">
                <input id="betaBlockerFalse" v-model="chestPainData.betaBlocker" type="radio" value="False">
                <label for="betaBlockerFalse">否</label>
                <input id="betaBlockerTrue" v-model="chestPainData.betaBlocker" type="radio" value="True">
                <label for="betaBlockerTrue">是</label>
              </div>
            </div>

            <div class="form-row" style="display: flex; align-items: center;justify-content: flex-start;flex-wrap: wrap;">
              <label>Grace评估：</label>
              <input id="cardiacArrest" v-model="chestPainData.graceAssessment" type="checkbox" value="心脏骤停">
              <span for="cardiacArrest">发病后曾出现心脏骤停</span>
              <input id="stSegmentChange" v-model="chestPainData.graceAssessment" type="checkbox" value="ST段改变">
              <span for="stSegmentChange">心电图ST段改变</span>
              <input id="biomarkerElevated" v-model="chestPainData.graceAssessment" type="checkbox" value="心肌坏死标志物升高">
              <span for="biomarkerElevated">心肌坏死标志物升高</span>
            </div>

            <div class="form-row">
              <label>Grace极高危条件：</label>
              <input id="acuteHeartFailure" v-model="chestPainData.graceHighRisk" type="checkbox" value="急性心力衰竭">
              <span for="acuteHeartFailure">急性心力衰竭伴难治性心绞痛和ST段改变</span>
              <input id="lifeThreateningArrhythmia" v-model="chestPainData.graceHighRisk" type="checkbox" value="心律失常">
              <span for="lifeThreateningArrhythmia">危及生命的心律失常或心脏骤停</span>
              <input id="cardiogenicShock" v-model="chestPainData.graceHighRisk" type="checkbox" value="心源性休克">
              <span for="cardiogenicShock">心源性休克或血流动力学不稳定</span>
              <input id="miComplications" v-model="chestPainData.graceHighRisk" type="checkbox" value="机械性并发症">
              <span for="miComplications">心肌梗死机械性并发症</span>
              <input id="dynamicEvolution" v-model="chestPainData.graceHighRisk" type="checkbox" value="ST-T动态演变">
              <span for="dynamicEvolution">再发ST-T动态演变，尤其是伴有间歇性ST段抬高</span>
            </div>

            <div class="form-row">
              <label>Grace分值：</label>
              <input v-model="chestPainData.graceScore" type="number" placeholder="输入分值">
            </div>

            <div class="form-row">
              <label>Grace危险分层：</label>
              <input id="veryHighRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="极高危">
              <label for="veryHighRisk">极高危</label>
              <input id="highRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="高危">
              <label for="highRisk">高危</label>
              <input id="mediumRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="中危">
              <label for="mediumRisk">中危</label>
              <input id="lowRisk" v-model="chestPainData.graceRiskStratification" type="radio" value="低危">
              <label for="lowRisk">低危</label>
            </div>

            <div class="form-row">
              <label>再次危险分层：</label>
              <input id="FalsetDone" v-model="chestPainData.reassessment" type="radio" value="未做">
              <label for="FalsetDone">未做</label>

              <input id="toSTEMI" v-model="chestPainData.reassessment" type="radio" value="转为STEMI">
              <label for="toSTEMI">转为STEMI</label>

              <input id="veryHighRiskAgain" v-model="chestPainData.reassessment" type="radio" value="极高危">
              <label for="veryHighRiskAgain">极高危</label>

              <input id="highRiskAgain" v-model="chestPainData.reassessment" type="radio" value="高危">
              <label for="highRiskAgain">高危</label>

              <input id="mediumRiskAgain" v-model="chestPainData.reassessment" type="radio" value="中危">
              <label for="mediumRiskAgain">中危</label>

              <input id="lowRiskAgain" v-model="chestPainData.reassessment" type="radio" value="低危">
              <label for="lowRiskAgain">低危</label>

            </div>

            <div class="form-row">
              <label>再次危险分层时间：</label>
              <input v-model="chestPainData.reassessmentTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'reassessmentTime')">
            </div>

            <div class="form-row">
              <label>处理策略 <span style="color: red;">*</span>：</label>

              <input id="conservative" v-model="chestPainData.treatmentStrategyNstemi" type="radio" value="保守治疗">
              <label for="conservative">保守治疗(仅药物治疗)</label>

              <input id="invasive" v-model="chestPainData.treatmentStrategyNstemi" type="radio" value="侵入性策略">
              <label for="invasive">侵入性策略</label>

            </div>
            <div v-if="chestPainData.treatmentStrategyNstemi === '侵入性策略'">
              <div class="form-row">
                <label>侵入性策略 <span style="color: red;">*</span>：</label>

                <input id="emergencyIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="紧急介入治疗">
                <label for="emergencyIntervention">紧急介入治疗</label>

                <input id="within24Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="24H内介入治疗">
                <label for="within24Hours">24H内介入治疗</label>

                <input id="within72Hours" v-model="chestPainData.invasiveStrategy" type="radio" value="72H内介入治疗">
                <label for="within72Hours">72H内介入治疗</label>

                <input id="scheduledIntervention" v-model="chestPainData.invasiveStrategy" type="radio" value="择期介入治疗">
                <label for="scheduledIntervention">择期介入治疗</label>

                <input id="CABG" v-model="chestPainData.invasiveStrategy" type="radio" value="CABG">
                <label for="CABG">CABG</label>

              </div>

              <div v-if="chestPainData.invasiveStrategy === '紧急介入治疗'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>决定医生：</label>
                    <input v-model="chestPainData.decidingDoctor" type="text" placeholder="输入医生姓名">
                  </div>
                  <div class="form-row-item">
                    <label>决定介入手术时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.interventionDecisionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'interventionDecisionTime')">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-row-item">
                    <label>启动导管室时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.cathLabStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cathLabStartTime')">
                  </div>
                  <div class="form-row-item">
                    <label>开始知情同意时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.informedConsentStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentStartTime')">
                  </div>

                </div>
                <div class="form-row">
                  <div class="form-row-item">
                    <label>签署知情同意时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.informedConsentSignatureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'informedConsentSignatureTime')">
                  </div>
                </div>

              </div>
              <div v-if="chestPainData.invasiveStrategy === '24H内介入治疗'">
                <div class="form-row">
                  <div class="form-row-item">
                    <label>实际介入治疗时间 <span style="color: red;">*</span>：</label>
                    <input v-model="chestPainData.actualInterventionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'actualInterventionTime')">
                  </div>
                </div>
              </div>

            </div>



          </div>
          <div v-if="chestPainData.diagFalsesis === '主动脉夹层'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.aorticDissectionDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'aorticDissectionDiagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.aorticDissectionDoctor" type="text" placeholder="输入医生姓名">
              </div>
            </div>
            <div class="form-row">
              <label>影像学检查 <span style="color: red;">*</span>：</label>
              <input id="ctEmergency" v-model="chestPainData.aorticDissectionImaging" type="radio" value="急诊CT">
              <label for="ctEmergency">急诊CT</label>
              <input id="ultrasound" v-model="chestPainData.aorticDissectionImaging" type="radio" value="彩超">
              <label for="ultrasound">彩超</label>
              <input id="mri" v-model="chestPainData.aorticDissectionImaging" type="radio" value="MRI">
              <label for="mri">MRI</label>
              <input id="FalsetDone" v-model="chestPainData.aorticDissectionImaging" type="radio" value="未做">
              <label for="FalsetDone">未做</label>
            </div>
            <div v-if="chestPainData.aorticDissectionImaging==='急诊CT'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>通知CT室时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ctFalsetificationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctFalsetificationTime')">
                </div>
                <div class="form-row-item">
                  <label>CT室完成准备 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ctPreparationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctPreparationTime')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>CT扫描开始时间：</label>
                  <input v-model="chestPainData.ctScanStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctScanStartTime')">
                </div>
                <div class="form-row-item">
                  <label>CT报告时间：</label>
                  <input v-model="chestPainData.ctReportTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctReportTime')">
                </div>
              </div>
            </div>
            <div v-if="chestPainData.aorticDissectionImaging==='彩超'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>通知彩超室时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ultrasoundFalsetificationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundFalsetificationTime')">
                </div>
                <div class="form-row-item">
                  <label>彩超检查时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ultrasoundExamTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundExamTime')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>彩超出结果时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ultrasoundResultTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ultrasoundResultTime')">
                </div>

              </div>

            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>通知心外科会诊：</label>
                <input v-model="chestPainData.cardiacSurgeryConsultationFalsetification" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationFalsetification')">
              </div>
              <div class="form-row-item">
                <label>心外科会诊时间：</label>
                <input v-model="chestPainData.cardiacSurgeryConsultationTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'cardiacSurgeryConsultationTime')">
              </div>
            </div>


            <div class="form-row">
              <label>夹层类型 <span style="color: red;">*</span>：</label>
              <input id="typeA" v-model="chestPainData.aorticDissectionType" type="radio" value="A型">
              <label for="typeA">A型</label>
              <input id="typeB" v-model="chestPainData.aorticDissectionType" type="radio" value="B型">
              <label for="typeB">B型</label>
            </div>
            <div class="form-row">
              <label>治疗策略 <span style="color: red;">*</span>：</label>
              <input id="emergencyIntervention" v-model="chestPainData.treatmentStrategy" type="radio" value="紧急介入治疗">
              <span for="emergencyIntervention">紧急介入治疗</span>
              <input id="scheduledIntervention" v-model="chestPainData.treatmentStrategy" type="radio" value="择期介入治疗">
              <span for="scheduledIntervention">择期介入治疗</span>
              <input id="conservativeTreatment" v-model="chestPainData.treatmentStrategy" type="radio" value="保守治疗">
              <span for="conservativeTreatment">保守治疗</span>
              <input id="surgical" v-model="chestPainData.treatmentStrategy" type="radio" value="外科手术">
              <span for="surgical">外科手术</span>
              <input id="other" v-model="chestPainData.treatmentStrategy" type="radio" value="其它（介入失败转为手术）">
              <span for="other">其它（介入失败转为手术）</span>
            </div>
          </div>

          <div v-if="chestPainData.diagFalsesis === '肺动脉栓塞'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.pulmonaryEmbolismDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'pulmonaryEmbolismDiagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.pulmonaryEmbolismDoctor" type="text" placeholder="输入医生姓名">
              </div>
            </div>
            <div class="form-row">
              <label>影像学检查 <span style="color: red;">*</span>：</label>
              <input id="ctEmergencyPE" v-model="chestPainData.pulmonaryEmbolismImaging" type="radio" value="急诊CT">
              <label for="ctEmergencyPE">急诊CT</label>
              <input id="FalsetDonePE" v-model="chestPainData.pulmonaryEmbolismImaging" type="radio" value="未做">
              <label for="FalsetDonePE">未做</label>
            </div>
            <div v-if="chestPainData.pulmonaryEmbolismImaging==='急诊CT'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>通知CT室时间 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ctFalsetificationTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctFalsetificationTimePE')">
                </div>
                <div class="form-row-item">
                  <label>CT室完成准备 <span style="color: red;">*</span>：</label>
                  <input v-model="chestPainData.ctPreparationTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctPreparationTimePE')">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>CT扫描开始时间：</label>
                  <input v-model="chestPainData.ctScanStartTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctScanStartTimePE')">
                </div>
                <div class="form-row-item">
                  <label>CT报告时间：</label>
                  <input v-model="chestPainData.ctReportTimePE" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'ctReportTimePE')">
                </div>
              </div>
            </div>
            <div class="form-row">
              <label>治疗信息：</label>
              <input id="highRisk" v-model="chestPainData.riskStratification" type="radio" value="高危">
              <label for="highRisk">高危</label>
              <input id="mediumRisk" v-model="chestPainData.riskStratification" type="radio" value="中危">
              <label for="mediumRisk">中危</label>
              <input id="lowRisk" v-model="chestPainData.riskStratification" type="radio" value="低危">
              <label for="lowRisk">低危</label>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>开始抗凝治疗时间：</label>
                <input v-model="chestPainData.anticoagulationStartTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'anticoagulationStartTime')">
              </div>
            </div>
            <div class="form-row">
              <label>院内溶栓治疗 <span style="color: red;">*</span>：</label>
              <input id="thrombolysisScreeningSuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="合适">
              <label for="thrombolysisScreeningSuitable">合适</label>
              <input id="thrombolysisScreeningUnsuitable" v-model="chestPainData.thrombolysisScreening" type="radio" value="不合适">
              <label for="thrombolysisScreeningUnsuitable">不合适</label>
              <input id="thrombolysisScreeningFalsetScreened" v-model="chestPainData.thrombolysisScreening" type="radio" value="未筛查">
              <label for="thrombolysisScreeningFalsetScreened">未筛查</label>
            </div>
            <div class="form-row">
              <label>溶栓治疗 <span style="color: red;">*</span>：</label>
              <input id="thrombolysisTrue" v-model="chestPainData.thrombolysisTreatment" type="radio" value="有">
              <label for="thrombolysisTrue">有</label>
              <input id="thrombolysisFalse" v-model="chestPainData.thrombolysisTreatment" type="radio" value="无">
              <label for="thrombolysisFalse">无</label>
            </div>
          </div>

          <div v-if="chestPainData.diagFalsesis === '非ACS心源性胸痛'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.FalsenACSChestPainDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'FalsenACSChestPainDiagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.FalsenACSChestPainDoctor" type="text" placeholder="输入医生姓名">
              </div>
            </div>
            <div class="form-row">
              <label>非ACS心源性胸痛类型 <span style="color: red;">*</span>：</label>
              <input id="arrhythmia" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心律失常">
              <span for="arrhythmia">心律失常</span>
              <input id="dilatedCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="扩张性心肌病">
              <span for="dilatedCardiomyopathy">扩张性心肌病</span>
              <input id="ischemicCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="缺血性心肌病">
              <span for="ischemicCardiomyopathy">缺血性心肌病</span>
              <input id="myocarditis" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心肌炎">
              <span for="myocarditis">心肌炎</span>
              <input id="hypertrophicCardiomyopathy" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="肥厚型心肌病">
              <span for="hypertrophicCardiomyopathy">肥厚型心肌病</span>
              <input id="coronaryHeartDisease" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="冠心病">
              <span for="coronaryHeartDisease">冠心病</span>
              <input id="valvularHeartDisease" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="瓣膜性心肌病">
              <span for="valvularHeartDisease">瓣膜性心肌病</span>
              <input id="oldMyocardialInfarction" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="陈旧性心肌梗死">
              <span for="oldMyocardialInfarction">陈旧性心肌梗死</span>
              <input id="angina" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心绞痛">
              <span for="angina">心绞痛</span>
              <input id="palpitation" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心悸">
              <span for="palpitation">心悸</span>
              <input id="af" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房颤">
              <span for="af">房颤</span>
              <input id="hypertension" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="高血压">
              <span for="hypertension">高血压</span>
              <input id="heartFailure" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心衰">
              <span for="heartFailure">心衰</span>
              <input id="aflutter" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房扑">
              <span for="aflutter">房扑</span>
              <input id="ventricularPremature" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="室早">
              <span for="ventricularPremature">室早</span>
              <input id="atrialPremature" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="房早">
              <span for="atrialPremature">房早</span>
              <input id="supraventricularTachycardia" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="室上速">
              <span for="supraventricularTachycardia">室上速</span>
              <input id="pericarditis" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心包炎">
              <span for="pericarditis">心包炎</span>
              <input id="myocardialBridge" v-model="chestPainData.FalsenACSChestPainType" type="radio" value="心肌桥">
              <span for="myocardialBridge">心肌桥</span>
            </div>
            <div class="form-row">
              <label>处理措施 <span style="color: red;">*</span>：</label>
              <input id="hospitalization" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="收治入院">
              <label for="hospitalization">收治入院</label>
              <input id="emergencyObservation" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="急诊留观">
              <label for="emergencyObservation">急诊留观</label>
              <input id="outpatientTreatment" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="门诊治疗">
              <label for="outpatientTreatment">门诊治疗</label>
              <input id="followup" v-model="chestPainData.FalsenACSChestPainTreatment" type="radio" value="随访">
              <label for="followup">随访</label>
            </div>
            <!--                <div class="form-row">
                  <label>患者情况备注：</label>
                  <input type="text" v-model="chestPainData.FalsenACSChestPainRemarks" placeholder="输入备注信息" />
                </div>-->
          </div>

          <div v-if="chestPainData.diagFalsesis === '其它非心源性胸痛'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'otherFalsenCardiacChestPainDiagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.otherFalsenCardiacChestPainDoctor" type="text" placeholder="输入医生姓名">
              </div>
            </div>
            <div class="form-row">
              <label>其它非心源性胸痛类型 <span style="color: red;">*</span>：</label>
              <input id="respiratorySystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="呼吸系统病">
              <label for="respiratorySystem">呼吸系统病</label>
              <input id="digestiveSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="消化系统病">
              <label for="digestiveSystem">消化系统病</label>
              <input id="nervousSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="神经系统病">
              <label for="nervousSystem">神经系统病</label>
              <input id="mentalSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="精神系统病">
              <label for="mentalSystem">精神系统病</label>
              <input id="musculoskeletal" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="肌肉骨骼病">
              <label for="musculoskeletal">肌肉骨骼病</label>
              <input id="skinSystem" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="皮肤系统病">
              <label for="skinSystem">皮肤系统病</label>
              <input id="other" v-model="chestPainData.otherFalsenCardiacChestPainType" type="radio" value="其他">
              <label for="other">其他</label>
            </div>
            <div class="form-row">
              <label>处理措施 <span style="color: red;">*</span>：</label>
              <input id="hospitalizatioFalsether" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="收治入院">
              <label for="hospitalizatioFalsether">收治入院</label>
              <input id="emergencyObservatioFalsether" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="急诊留观">
              <label for="emergencyObservatioFalsether">急诊留观</label>
              <input id="outpatientTreatmentOther" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="门诊治疗">
              <label for="outpatientTreatmentOther">门诊治疗</label>
              <input id="followup" v-model="chestPainData.otherFalsenCardiacChestPainTreatment" type="radio" value="随访">
              <label for="followup">随访</label>
            </div>
            <!--                <div class="form-row">
                  <label>患者情况备注：</label>
                  <input type="text" v-model="chestPainData.otherFalsenCardiacChestPainRemarks" placeholder="输入备注信息" />
                </div>-->
          </div>

          <div v-if="chestPainData.diagFalsesis === '待查'">
            <div class="form-row">
              <div class="form-row-item">
                <label>初步诊断时间 <span style="color: red;">*</span>：</label>
                <input v-model="chestPainData.pendingDiagFalsesisTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(chestPainData, 'pendingDiagFalsesisTime')">
              </div>
              <div class="form-row-item">
                <label>医生：</label>
                <input v-model="chestPainData.pendingDoctor" type="text" placeholder="输入医生姓名">
              </div>
            </div>
            <div class="form-row">
              <label>处理措施 <span style="color: red;">*</span>：</label>
              <input id="hospitalizationPending" v-model="chestPainData.pendingTreatment" type="radio" value="收治入院">
              <label for="hospitalizationPending">收治入院</label>
              <input id="emergencyObservationPending" v-model="chestPainData.pendingTreatment" type="radio" value="急诊留观">
              <label for="emergencyObservationPending">急诊留观</label>
              <input id="outpatientTreatmentPending" v-model="chestPainData.pendingTreatment" type="radio" value="门诊治疗">
              <label for="outpatientTreatmentPending">门诊治疗</label>
              <input id="followup" v-model="chestPainData.pendingTreatment" type="radio" value="随访">
              <label for="followup">随访</label>
            </div>
          </div>

          <div class="form-row">
            <label>是否进行后续治疗：</label>
            <input id="treatmentTrue" v-model="chestPainData.treatment" type="radio" value="True">
            <label for="treatmentTrue">是</label>
            <input id="treatmentFalse" v-model="chestPainData.treatment" type="radio" value="False">
            <label for="treatmentFalse">否</label>
          </div>
          <div class="form-row">
            <label>患者情况备注：</label>
            <textarea id="patientRemarks" v-model="chestPainData.remarks" placeholder="请输入备注" />
          </div>
        </div>
      </div>

      <div v-show="currentModule === 'outcome'" class="form-section">
        <h3>转归</h3>
        <div class="module">
          <h3>出院基本信息</h3>
          <div class="form-row">
            <label for="dischargeDiagFalsesis">出院诊断 <span style="color: red;">*</span>：</label>
            <input id="dischargeDiagFalsesisSTEMI" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="STEMI">
            <span for="dischargeDiagFalsesisSTEMI">STEMI</span>
            <input id="dischargeDiagFalsesisNSTEMI" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="NSTEMI">
            <span for="dischargeDiagFalsesisNSTEMI">NSTEMI</span>
            <input id="dischargeDiagFalsesisUA" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="UA">
            <span for="dischargeDiagFalsesisUA">UA</span>
            <input id="dischargeDiagFalsesisAorticDissection" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="主动脉夹层">
            <span for="dischargeDiagFalsesisAorticDissection">主动脉夹层</span>

            <input id="dischargeDiagFalsesisPulmonaryEmbolism" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="肺动脉栓塞">
            <span for="dischargeDiagFalsesisPulmonaryEmbolism">肺动脉栓塞</span>

            <input id="dischargeDiagFalsesisFalsenACS" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="非ACS心源性胸痛">
            <span for="dischargeDiagFalsesisFalsenACS">非ACS心源性胸痛</span>

            <input id="dischargeDiagFalsesisOtherFalsenCardiac" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="其它非心源性胸痛">
            <span for="dischargeDiagFalsesisOtherFalsenCardiac">其它非心源性胸痛</span>

            <input id="dischargeDiagFalsesisPending" v-model="outcomeData.dischargeDiagFalsesis" type="radio" value="待查">
            <span for="dischargeDiagFalsesisPending">待查</span>
          </div>
          <div />
          <div class="form-row">
            <div class="form-row-item">
              <label for="confirmedDate">确诊时间 <span style="color: red;">*</span>：</label>
              <input id="confirmedDate" v-model="outcomeData.confirmedDate" type="datetime-local" :max="maxDateTime" @change="validateTime(chestPainData, 'confirmedDate')">
            </div>
          </div>

          <div v-if="['STEMI', 'NSTEMI', 'UA'].includes(outcomeData.dischargeDiagFalsesis)">
            <div class="form-row">
              <div class="form-row-item">
                <label>院内新发心力衰竭 <span style="color: red;">*</span>：</label>
                <input id="heartFailureFalse" v-model="outcomeData.newHeartFailure" type="radio" value="False">
                <label for="heartFailureFalse">否</label>
                <input id="heartFailureTrue" v-model="outcomeData.newHeartFailure" type="radio" value="True">
                <label for="heartFailureTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <label>合并症 <span style="color: red;">*</span>：</label>
              <input id="shock" v-model="outcomeData.comorbidities" type="radio" value="休克">
              <label for="shock">休克</label>
              <input id="mechanicalComplication" v-model="outcomeData.comorbidities" type="radio" value="机械性并发症">
              <label for="mechanicalComplication">机械性并发症</label>
              <input id="infection" v-model="outcomeData.comorbidities" type="radio" value="感染">
              <label for="infection">感染</label>
              <input id="recurrentMyocardialInfarction" v-model="outcomeData.comorbidities" type="radio" value="再发心梗">
              <label for="recurrentMyocardialInfarction">再发心梗</label>
              <input id="thrombosis" v-model="outcomeData.comorbidities" type="radio" value="血栓">
              <label for="thrombosis">血栓</label>
              <input id="stroke" v-model="outcomeData.comorbidities" type="radio" value="卒中">
              <label for="stroke">卒中</label>
              <input id="tia" v-model="outcomeData.comorbidities" type="radio" value="TIA">
              <label for="tia">TIA</label>
              <input id="bleeding" v-model="outcomeData.comorbidities" type="radio" value="出血">
              <label for="bleeding">出血</label>
              <input id="respiratoryFailure" v-model="outcomeData.comorbidities" type="radio" value="呼吸衰竭">
              <label for="respiratoryFailure">呼吸衰竭</label>
              <input id="renalFailure" v-model="outcomeData.comorbidities" type="radio" value="肾衰竭">
              <label for="renalFailure">肾衰竭</label>
              <input id="death" v-model="outcomeData.comorbidities" type="radio" value="死亡">
              <label for="death">死亡</label>
              <input id="Falsene" v-model="outcomeData.comorbidities" type="radio" value="无">
              <label for="Falsene">无</label>
            </div>
            <label>危险因素：</label>
            <div class="form-row">
              <div class="form-row-item">
                <label>高血压 <span style="color: red;">*</span>：</label>
                <input id="hypertensionFalse" v-model="outcomeData.hypertension" type="radio" value="False">
                <label for="hypertensionFalse">否</label>
                <input id="hypertensionTrue" v-model="outcomeData.hypertension" type="radio" value="True">
                <label for="hypertensionTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>高脂血症 <span style="color: red;">*</span>：</label>
                <input id="hyperlipidemiaFalse" v-model="outcomeData.hyperlipidemia" type="radio" value="False">
                <label for="hyperlipidemiaFalse">否</label>
                <input id="hyperlipidemiaTrue" v-model="outcomeData.hyperlipidemia" type="radio" value="True">
                <label for="hyperlipidemiaTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>糖尿病 <span style="color: red;">*</span>：</label>
                <input id="diabetesFalse" v-model="outcomeData.diabetes" type="radio" value="False">
                <label for="diabetesFalse">否</label>
                <input id="diabetesTrue" v-model="outcomeData.diabetes" type="radio" value="True">
                <label for="diabetesTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>吸烟 <span style="color: red;">*</span>：</label>
                <input id="smokingFalse" v-model="outcomeData.smoking" type="radio" value="False">
                <label for="smokingFalse">否</label>
                <input id="smokingTrue" v-model="outcomeData.smoking" type="radio" value="True">
                <label for="smokingTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>肥胖 <span style="color: red;">*</span>：</label>
                <input id="obesityFalse" v-model="outcomeData.obesity" type="radio" value="False">
                <label for="obesityFalse">否</label>
                <input id="obesityTrue" v-model="outcomeData.obesity" type="radio" value="True">
                <label for="obesityTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>早发CVD家族史 <span style="color: red;">*</span>：</label>
                <input id="familyHistoryFalse" v-model="outcomeData.familyHistory" type="radio" value="False">
                <label for="familyHistoryFalse">否</label>
                <input id="familyHistoryTrue" v-model="outcomeData.familyHistory" type="radio" value="True">
                <label for="familyHistoryTrue">是</label>
              </div>
            </div>



            <label>合并疾病：</label>
            <div class="form-row">
              <div class="form-row-item">
                <label>冠心病 <span style="color: red;">*</span>：</label>
                <input id="coronaryHeartDiseaseFalse" v-model="outcomeData.coronaryHeartDisease" type="radio" value="False">
                <label for="coronaryHeartDiseaseFalse">否</label>
                <input id="coronaryHeartDiseaseTrue" v-model="outcomeData.coronaryHeartDisease" type="radio" value="True">
                <label for="coronaryHeartDiseaseTrue">是</label>
              </div>
              <div v-if="outcomeData.coronaryHeartDisease === 'True'" class="form-row-item">
                <label>血运重建史 <span style="color: red;">*</span>：</label>
                <input id="revascularizationHistoryFalse" v-model="outcomeData.revascularizationHistory" type="radio" value="False">
                <label for="revascularizationHistoryFalse">否</label>
                <input id="revascularizationHistoryTrue" v-model="outcomeData.revascularizationHistory" type="radio" value="True">
                <label for="revascularizationHistoryTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>心房颤动 <span style="color: red;">*</span>：</label>
                <input id="afFalse" v-model="outcomeData.af" type="radio" value="False">
                <label for="afFalse">否</label>
                <input id="afTrue" v-model="outcomeData.af" type="radio" value="True">
                <label for="afTrue">是</label>
              </div>
              <div v-if="outcomeData.af === 'True'" class="form-row-item">
                <input id="paroxysmal" v-model="outcomeData.afType" type="radio" value="阵发性">
                <label for="paroxysmal">阵发性</label>
                <input id="persistent" v-model="outcomeData.afType" type="radio" value="持续性">
                <label for="persistent">持续性</label>
                <input id="longStanding" v-model="outcomeData.afType" type="radio" value="长程持续性">
                <label for="longStanding">长程持续性</label>
                <input id="permanent" v-model="outcomeData.afType" type="radio" value="永久性">
                <label for="permanent">永久性</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>慢性心力衰竭 <span style="color: red;">*</span>：</label>
                <input id="chronicHeartFailureFalse" v-model="outcomeData.chronicHeartFailure" type="radio" value="False">
                <label for="chronicHeartFailureFalse">否</label>
                <input id="chronicHeartFailureTrue" v-model="outcomeData.chronicHeartFailure" type="radio" value="True">
                <label for="chronicHeartFailureTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>心脏瓣膜病 <span style="color: red;">*</span>：</label>
                <input id="heartValveDiseaseFalse" v-model="outcomeData.heartValveDisease" type="radio" value="False">
                <label for="heartValveDiseaseFalse">否</label>
                <input id="heartValveDiseaseTrue" v-model="outcomeData.heartValveDisease" type="radio" value="True">
                <label for="heartValveDiseaseTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>脑血管疾病 <span style="color: red;">*</span>：</label>
                <input id="cerebrovascularDiseaseFalse" v-model="outcomeData.cerebrovascularDisease" type="radio" value="False">
                <label for="cerebrovascularDiseaseFalse">否</label>
                <input id="cerebrovascularDiseaseTrue" v-model="outcomeData.cerebrovascularDisease" type="radio" value="True">
                <label for="cerebrovascularDiseaseTrue">是</label>
              </div>
              <div v-if="outcomeData.cerebrovascularDisease === 'True'" class="form-row-item">
                <label>脑血管疾病描述：</label>
                <input id="cerebrovascularDiseaseType1" v-model="outcomeData.cerebrovascularDiseaseType" type="radio" value="缺血性">
                <label for="cerebrovascularDiseaseType1">缺血性</label>
                <input id="cerebrovascularDiseaseType2" v-model="outcomeData.cerebrovascularDiseaseType" type="radio" value="出血性">
                <label for="cerebrovascularDiseaseType2">出血性</label>
              </div>

            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>外周动脉疾病 <span style="color: red;">*</span>：</label>
                <input id="peripheralArteryDiseaseFalse" v-model="outcomeData.peripheralArteryDisease" type="radio" value="False">
                <label for="peripheralArteryDiseaseFalse">否</label>
                <input id="peripheralArteryDiseaseTrue" v-model="outcomeData.peripheralArteryDisease" type="radio" value="True">
                <label for="peripheralArteryDiseaseTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>主动脉瘤 <span style="color: red;">*</span>：</label>
                <input id="aorticAneurysmFalse" v-model="outcomeData.aorticAneurysm" type="radio" value="False">
                <label for="aorticAneurysmFalse">否</label>
                <input id="aorticAneurysmTrue" v-model="outcomeData.aorticAneurysm" type="radio" value="True">
                <label for="aorticAneurysmTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>COPD <span style="color: red;">*</span>：</label>
                <input id="copdFalse" v-model="outcomeData.copd" type="radio" value="False">
                <label for="copdFalse">否</label>
                <input id="copdTrue" v-model="outcomeData.copd" type="radio" value="True">
                <label for="copdTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>慢性肾病 <span style="color: red;">*</span>：</label>
                <input id="chronicKidneyDiseaseFalse" v-model="outcomeData.chronicKidneyDisease" type="radio" value="False">
                <label for="chronicKidneyDiseaseFalse">否</label>
                <input id="chronicKidneyDiseaseTrue" v-model="outcomeData.chronicKidneyDisease" type="radio" value="True">
                <label for="chronicKidneyDiseaseTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>贫血 <span style="color: red;">*</span>：</label>
                <input id="anemiaFalse" v-model="outcomeData.anemia" type="radio" value="False">
                <label for="anemiaFalse">否</label>
                <input id="anemiaTrue" v-model="outcomeData.anemia" type="radio" value="True">
                <label for="anemiaTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>消化性溃疡 <span style="color: red;">*</span>：</label>
                <input id="pepticUlcerFalse" v-model="outcomeData.pepticUlcer" type="radio" value="False">
                <label for="pepticUlcerFalse">否</label>
                <input id="pepticUlcerTrue" v-model="outcomeData.pepticUlcer" type="radio" value="True">
                <label for="pepticUlcerTrue">是</label>
              </div>
              <div class="form-row-item">
                <label>甲状腺功能异常 <span style="color: red;">*</span>：</label>
                <input id="thyroidFunctionAbFalsermalFalse" v-model="outcomeData.thyroidFunctionAbFalsermal" type="radio" value="False">
                <label for="thyroidFunctionAbFalsermalFalse">否</label>
                <input id="thyroidFunctionAbFalsermalTrue" v-model="outcomeData.thyroidFunctionAbFalsermal" type="radio" value="True">
                <label for="thyroidFunctionAbFalsermalTrue">是</label>
              </div>
            </div>
            <label>检查结果：</label>
            <div class="form-row">
              <div class="form-row-item">
                <label>72h内肌钙蛋白 <span style="color: red;">*</span>：</label>
                <input id="troponin72hFalse" v-model="outcomeData.troponin72h" type="radio" value="False">
                <label for="troponin72hFalse">否</label>
                <input id="troponin72hTrue" v-model="outcomeData.troponin72h" type="radio" value="True">
                <label for="troponin72hTrue">是</label>

              </div>
              <div class="form-row-item">
                <input v-if="outcomeData.troponin72h === 'True'" v-model="outcomeData.troponinMaxValue" type="text" placeholder="72h内肌钙蛋白最高值">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>脑钠肽 <span style="color: red;">*</span>：</label>
                <input id="bnp" v-model="outcomeData.bnp" type="radio" value="BNP">
                <span for="bnp">BNP</span>
                <input id="ntProBNP" v-model="outcomeData.bnp" type="radio" value="NT-proBNP"><!--<input type="radio" id="ntProBNP" value="NT-proBNP" v-model="outcomeData.ntProBNP" />-->
                <span for="ntProBNP">NT-proBNP</span>
              </div>
              <div class="form-row-item">
                <input v-model="outcomeData.bnpMaxValue" type="text" placeholder="最高值pg/ml">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>总胆固醇(TC) <span style="color: red;">*</span>：</label>
                <input id="tcFalse" v-model="outcomeData.tc" type="radio" value="False">
                <label for="tcFalse">否</label>
                <input id="tcTrue" v-model="outcomeData.tc" type="radio" value="True">
                <label for="tcTrue">是</label>

              </div>
              <div class="form-row-item">
                <input v-if="outcomeData.tc === 'True'" v-model="outcomeData.tcValue" type="text" placeholder="数值">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>甘油三酯(TG) <span style="color: red;">*</span>：</label>
                <input id="tgFalse" v-model="outcomeData.tg" type="radio" value="False">
                <label for="tgFalse">否</label>
                <input id="tgTrue" v-model="outcomeData.tg" type="radio" value="True">
                <label for="tgTrue">是</label>

              </div>
              <div class="form-row-item">
                <input v-if="outcomeData.tg === 'True'" v-model="outcomeData.tgValue" type="text" placeholder="数值">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>高密度脂蛋白(HDL-C) <span style="color: red;">*</span>：</label>
                <input id="hdlFalse" v-model="outcomeData.hdl" type="radio" value="False">
                <label for="hdlFalse">否</label>
                <input id="hdlTrue" v-model="outcomeData.hdl" type="radio" value="True">
                <label for="hdlTrue">是</label>

              </div>
              <div class="form-row-item">
                <input v-if="outcomeData.hdl === 'True'" v-model="outcomeData.hdlValue" type="text" placeholder="数值">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>低密度脂蛋白(LDL-C) <span style="color: red;">*</span>：</label>
                <input id="ldlFalse" v-model="outcomeData.ldl" type="radio" value="False">
                <label for="ldlFalse">否</label>
                <input id="ldlTrue" v-model="outcomeData.ldl" type="radio" value="True">
                <label for="ldlTrue">是</label>

              </div>
              <div class="form-row-item">
                <input v-if="outcomeData.ldl === 'True'" v-model="outcomeData.ldlValue" type="text" placeholder="数值">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>超声心动图 <span style="color: red;">*</span>：</label>
                <input id="echoFalse" v-model="outcomeData.echo" type="radio" value="False">
                <label for="echoFalse">否</label>
                <input id="echoTrue" v-model="outcomeData.echo" type="radio" value="True">
                <label for="echoTrue">是</label>
              </div>

            </div>
            <div v-if="outcomeData.echo === 'True'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>LVEF % (诊疗过程中最低值)：</label>
                  <input v-model="outcomeData.lvefValue" type="text" placeholder="输入值">
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>室壁瘤 <span style="color: red;">*</span>：</label>
                  <input id="wallAneurysmFalse" v-model="outcomeData.wallAneurysm" type="radio" value="False">
                  <label for="wallAneurysmFalse">否</label>
                  <input id="wallAneurysmTrue" v-model="outcomeData.wallAneurysm" type="radio" value="True">
                  <label for="wallAneurysmTrue">是</label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-row-item">
                  <label>局部室壁活动异常 <span style="color: red;">*</span>：</label>
                  <input id="wallMotionAbFalsermalityFalse" v-model="outcomeData.wallMotionAbFalsermality" type="radio" value="False">
                  <label for="wallMotionAbFalsermalityFalse">否</label>
                  <input id="wallMotionAbFalsermalityTrue" v-model="outcomeData.wallMotionAbFalsermality" type="radio" value="True">
                  <label for="wallMotionAbFalsermalityTrue">是</label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="outcomeData.dischargeDiagFalsesis === '非ACS心源性胸痛'">
            <div class="form-row">
              <label>非ACS心源性胸痛 <span style="color: red;">*</span>：</label>
              <input id="arrhythmia" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心律失常">
              <label for="arrhythmia">心律失常</label>
              <input id="dilatedCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="扩张性心肌病">
              <label for="dilatedCardiomyopathy">扩张性心肌病</label>
              <input id="ischemicCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="缺血性心肌病">
              <label for="ischemicCardiomyopathy">缺血性心肌病</label>
              <input id="myocarditis" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心肌炎">
              <label for="myocarditis">心肌炎</label>
              <input id="hypertrophicCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="肥厚型心肌病">
              <label for="hypertrophicCardiomyopathy">肥厚型心肌病</label>
              <input id="coronaryHeartDiseaseFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="冠心病">
              <label for="coronaryHeartDiseaseFalsenACS">冠心病</label>
              <input id="valvularCardiomyopathy" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="瓣膜性心肌病">
              <label for="valvularCardiomyopathy">瓣膜性心肌病</label>
            </div>
            <div class="form-row">
              <label />

              <input id="oldMyocardialInfarction" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="陈旧性心肌梗死">
              <label for="oldMyocardialInfarction">陈旧性心肌梗死</label>
              <input id="angina" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心绞痛">
              <label for="angina">心绞痛</label>
              <input id="palpitation" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心悸">
              <label for="palpitation">心悸</label>
              <input id="af" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房颤">
              <label for="af">房颤</label>
              <input id="hypertensionFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="高血压">
              <label for="hypertensionFalsenACS">高血压</label>
              <input id="heartFailureFalsenACS" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心衰">
              <label for="heartFailureFalsenACS">心衰</label>
              <input id="aflutter" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房扑">
              <label for="aflutter">房扑</label>

            </div>
            <div class="form-row">
              <label />
              <input id="ventricularPremature" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="室早">
              <label for="ventricularPremature">室早</label>
              <input id="atrialPremature" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="房早">
              <label for="atrialPremature">房早</label>
              <input id="supraventricularTachycardia" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="室上速">
              <label for="supraventricularTachycardia">室上速</label>
              <input id="pericarditis" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心包炎">
              <label for="pericarditis">心包炎</label>
              <input id="myocardialBridge" v-model="outcomeData.FalsenACSChestPainType" type="radio" value="心肌桥">
              <label for="myocardialBridge">心肌桥</label>
            </div>
          </div>

          <div v-if="outcomeData.dischargeDiagFalsesis === '其它非心源性胸痛'">
            <div class="form-row">
              <label>其它非心源性胸痛类型 <span style="color: red;">*</span>：</label>
              <input id="respiratoryDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="呼吸系统病">
              <label for="respiratoryDisease">呼吸系统病</label>
              <input id="digestiveDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="消化系统病">
              <label for="digestiveDisease">消化系统病</label>
              <input id="nervousSystem" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="神经系统病">
              <label for="nervousSystem">神经系统病</label>
              <input id="mentalSystem" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="精神系统病">
              <label for="mentalSystem">精神系统病</label>
              <input id="musculoskeletal" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="肌肉骨骼病">
              <label for="musculoskeletal">肌肉骨骼病</label>
              <input id="skinDisease" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="皮肤系统病">
              <label for="skinDisease">皮肤系统病</label>
              <input id="otherType" v-model="outcomeData.otherFalsenCardiacChestPainType" type="radio" value="其他">
              <label for="otherType">其他</label>
            </div>
          </div>
        </div>

        <!-- 住院期间用药模块 -->
        <div class="module">
          <h3>住院期间用药</h3>
          <div class="form-row">
            <label>降糖药物 <span style="color: red;">*</span>：</label>
            <input id="antidiabeticTrue" v-model="outcomeData.antidiabetic" type="radio" value="True">
            <label for="antidiabeticTrue">是</label>
            <input id="antidiabeticFalse" v-model="outcomeData.antidiabetic" type="radio" value="False">
            <label for="antidiabeticFalse">否</label>
          </div>
          <div class="form-row">
            <label for="oralAnticoagulants">口服抗凝药物 <span style="color: red;">*</span>：</label>
            <input id="antidiabeticTrue" v-model="outcomeData.oralAnticoagulants" type="radio" value="True">
            <label for="antidiabeticTrue">是</label>
            <input id="antidiabeticFalse" v-model="outcomeData.oralAnticoagulants" type="radio" value="False">
            <label for="antidiabeticFalse">否</label>

          </div>
          <div class="form-row">
            <label for="lipidRegulating">调脂药物 <span style="color: red;">*</span>：</label>
            <input id="antidiabeticTrue" v-model="outcomeData.lipidRegulating" type="radio" value="True">
            <label for="antidiabeticTrue">是</label>
            <input id="antidiabeticFalse" v-model="outcomeData.lipidRegulating" type="radio" value="False">
            <label for="antidiabeticFalse">否</label>

          </div>
        </div>

        <!-- 出院信息模块 -->
        <div class="module">
          <h3>出院信息</h3>
          <div class="form-row">
            <div class="form-row-item">
              <label for="hospitalDays">住院天数 <span style="color: red;">*</span>：</label>
              <input id="hospitalDays" v-model="outcomeData.hospitalDays" type="number">
            </div>
          </div>
          <div class="form-row">
            <div class="form-row-item">
              <label for="totalCost">总费用 <span style="color: red;">*</span>：</label>
              <input id="totalCost" v-model="outcomeData.totalCost" type="number">
            </div>
          </div>
          <div class="form-row">
            <label>出院还是转归 <span style="color: red;">*</span>：</label>
            <input id="discharge" v-model="outcomeData.dischargeStatus" type="radio" value="出院">
            <label for="discharge">出院</label>
            <input id="transferHospital" v-model="outcomeData.dischargeStatus" type="radio" value="转送其他医院">
            <label for="transferHospital">转送其他医院</label>
            <input id="transferDepartment" v-model="outcomeData.dischargeStatus" type="radio" value="转送其它科室">
            <label for="transferDepartment">转送其它科室</label>
            <input id="death" v-model="outcomeData.dischargeStatus" type="radio" value="死亡">
            <label for="death">死亡</label>
          </div>


          <div v-if="outcomeData.dischargeStatus === '出院'">
            <div class="form-row">
              <div class="form-row-item">
                <label>出院时间 <span style="color: red;">*</span>：</label>
                <input v-model="outcomeData.dischargeTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'dischargeTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>治疗结果 <span style="color: red;">*</span>：</label>
                <input id="cure" v-model="outcomeData.treatmentOutcome" type="radio" value="治愈">
                <label for="cure">治愈</label>
                <input id="improvement" v-model="outcomeData.treatmentOutcome" type="radio" value="好转">
                <label for="improvement">好转</label>
                <input id="selfDischarge" v-model="outcomeData.treatmentOutcome" type="radio" value="自动离院">
                <label for="selfDischarge">自动离院</label>
                <input id="otherReason" v-model="outcomeData.treatmentOutcome" type="radio" value="其他原因离院">
                <label for="otherReason">其他原因离院</label>
              </div>
            </div>

            <label>出院带药：</label>

            <div class="form-row">
              <div class="form-row-item">
                <label>抗血小板药物：</label>
                <input id="antiplateletFalse" v-model="outcomeData.antiplateletMedication" type="radio" value="False">
                <label for="antiplateletFalse">否</label>
                <input id="antiplateletTrue" v-model="outcomeData.antiplateletMedication" type="radio" value="True">
                <label for="antiplateletTrue">是</label>
              </div>
            </div>

            <div v-if="outcomeData.antiplateletMedication === 'True'" class="form-row">
              <div class="form-row-item">
                <label>药物名称</label>
                <input v-model="outcomeData.antiplateletDrugName" type="text" placeholder="药物名称">

              </div>
              <div class="form-row-item">
                <label>剂量</label>
                <input v-model="outcomeData.antiplateletDosage" type="text" placeholder="mg">

              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>ACEI/ARB：</label>
                <input id="aceARBFalse" v-model="outcomeData.aceArbMedication" type="radio" value="False">
                <label for="aceARBFalse">否</label>
                <input id="aceARBTrue" v-model="outcomeData.aceArbMedication" type="radio" value="True">
                <label for="aceARBTrue">是</label>

              </div>

            </div>
            <div v-if="outcomeData.aceArbMedication === 'True'" class="form-row">
              <div class="form-row-item">
                <label>药物名称</label>
                <input v-model="outcomeData.aceArbDrugName" type="text" placeholder="药物名称">
              </div>
              <div class="form-row-item">
                <label>剂量</label>
                <input v-model="outcomeData.aceArbDosage" type="text" placeholder="mg">

              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>调脂药物：</label>
                <input id="lipidRegulatingFalse" v-model="outcomeData.lipidRegulatingMedication" type="radio" value="False">
                <label for="lipidRegulatingFalse">否</label>
                <input id="lipidRegulatingTrue" v-model="outcomeData.lipidRegulatingMedication" type="radio" value="True">
                <label for="lipidRegulatingTrue">是</label>
              </div>

            </div>
            <div v-if="outcomeData.lipidRegulatingMedication === 'True'" class="form-row">
              <div class="form-row-item">
                <label>药物名称</label>
                <input v-model="outcomeData.lipidRegulatingDrugName" type="text" placeholder="药物名称">
              </div>
              <div class="form-row-item">
                <label>剂量</label>
                <input v-model="outcomeData.lipidRegulatingDosage" type="text" placeholder="mg">

              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>β受体阻滞剂：</label>
                <input id="betaBlockerFalse" v-model="outcomeData.betaBlockerMedication" type="radio" value="False">
                <label for="betaBlockerFalse">否</label>
                <input id="betaBlockerTrue" v-model="outcomeData.betaBlockerMedication" type="radio" value="True">
                <label for="betaBlockerTrue">是</label>
              </div>

            </div>
            <div v-if="outcomeData.betaBlockerMedication === 'True'" class="form-row">
              <div class="form-row-item">
                <label>药物名称</label>
                <input v-model="outcomeData.betaBlockerDrugName" type="text" placeholder="药物名称">
              </div>
              <div class="form-row-item">
                <label>剂量</label>
                <input v-model="outcomeData.betaBlockerDosage" type="text" placeholder="mg">

              </div>
            </div>
            <!--            <div class="form-row">
              <div class="form-row-item">
                <label>患者情况说明：</label>
                <input type="text" v-model="outcomeData.patientStatusDescription" placeholder="输入说明" />
              </div>
            </div>-->
          </div>

          <div v-if="outcomeData.dischargeStatus === '转送其他医院'">
            <div class="form-row">
              <div class="form-row-item">
                <label>离开本院大门时间 <span style="color: red;">*</span>：</label>
                <input v-model="outcomeData.departureTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'departureTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>网络医院：</label>
                <input id="networkHospitalFalse" v-model="outcomeData.networkHospital" type="radio" value="False">
                <label for="networkHospitalFalse">否</label>
                <input id="networkHospitalTrue" v-model="outcomeData.networkHospital" type="radio" value="True">
                <label for="networkHospitalTrue">是</label>

              </div>
              <div v-if="outcomeData.networkHospital === 'True'" class="form-row-item">
                <label>医院名称：</label>
                <input v-model="outcomeData.networkHospitalName" type="text" placeholder="医院名称">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>转运PCI <span style="color: red;">*</span>：</label>
                <input id="transferPciFalse" v-model="outcomeData.transferPci" type="radio" value="False">
                <label for="transferPciFalse">否</label>
                <input id="transferPciTrue" v-model="outcomeData.transferPci" type="radio" value="True">
                <label for="transferPciTrue">是</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>直达导管室 <span style="color: red;">*</span>：</label>
                <input id="directCathLabFalse" v-model="outcomeData.directCathLab" type="radio" value="False">
                <label for="directCathLabFalse">否</label>
                <input id="directCathLabTrue" v-model="outcomeData.directCathLab" type="radio" value="True">
                <label for="directCathLabTrue">是</label>

              </div>
              <div v-if="outcomeData.directCathLab === 'True'" class="form-row-item">
                <label>实际介入手术开始时间 <span style="color: red;">*</span></label>
                <input v-model="outcomeData.actualInterventionStartTime" type="datetime-local" placeholder="实际介入手术开始时间" :max="maxDateTime" @change="validateTime(outcomeData, 'actualInterventionStartTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>远程心电图传输 <span style="color: red;">*</span>：</label>
                <input id="ecgTransmissionTrue" v-model="outcomeData.ecgTransmission" type="radio" value="传输心电图至协作单位">
                <label for="ecgTransmissionTrue">传输心电图至协作单位(转出患者时)</label>
                <input id="ecgTransmissionFalse" v-model="outcomeData.ecgTransmission" type="radio" value="无">
                <label for="ecgTransmissionFalse">无</label>
              </div>
            </div>
            <div v-if="outcomeData.ecgTransmission === '传输心电图至协作单位'">
              <div class="form-row">
                <div class="form-row-item">
                  <label>传输心电图至协作单位时间：</label>
                  <input v-model="outcomeData.ecgTransmissionTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'ecgTransmissionTime')">
                </div>
                <div class="form-row-item">
                  <label>传输方式：</label>
                  <input v-model="outcomeData.ecgTransmissionMethod" type="text" placeholder="输入传输方式">
                </div>
              </div>

            </div>
            <!--            <div class="form-row">
              <div class="form-row-item">
                <label>患者情况说明：</label>
                <input type="text" v-model="outcomeData.patientStatusDescriptionTransfer" placeholder="输入说明" />
              </div>
            </div>-->
          </div>

          <div v-if="outcomeData.dischargeStatus === '转送其它科室'">
            <div class="form-row">
              <div class="form-row-item">
                <label>转科时间：</label>
                <input v-model="outcomeData.transferTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'transferTime')">
              </div>
              <div class="form-row-item">
                <label>接诊科室：</label>
                <input v-model="outcomeData.admittingDepartment" type="text" placeholder="输入科室">
              </div>
            </div>

            <div class="form-row">
              <div class="form-row-item">
                <label>转科原因描述：</label>
                <input v-model="outcomeData.transferReason" type="text" placeholder="输入原因">
              </div>
            </div><!--
            <div class="form-row">
              <div class="form-row-item">
                <label>患者情况说明：</label>
                <input type="text" v-model="outcomeData.patientStatusDescriptionTransferDepartment" placeholder="输入说明" />
              </div>
            </div>-->
          </div>

          <div v-if="outcomeData.dischargeStatus === '死亡'">
            <div class="form-row">
              <div class="form-row-item">
                <label>死亡时间 <span style="color: red;">*</span>：</label>
                <input v-model="outcomeData.deathTime" type="datetime-local" placeholder="输入时间" :max="maxDateTime" @change="validateTime(outcomeData, 'deathTime')">
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>死亡原因 <span style="color: red;">*</span>：</label>
                <input id="cardiacCause" v-model="outcomeData.deathCause" type="radio" value="心源性">
                <label for="cardiacCause">心源性</label>
                <input id="FalsenCardiacCause" v-model="outcomeData.deathCause" type="radio" value="非心源性">
                <label for="FalsenCardiacCause">非心源性</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-row-item">
                <label>描述：</label>
                <input v-model="outcomeData.deathDescription" type="text" placeholder="输入描述">
              </div>
            </div>
          </div>

          <div class="form-row">
            <label for="patientRemarks">患者情况备注：</label>
            <textarea id="patientRemarks" v-model="outcomeData.remarks" placeholder="请输入备注" />
          </div>
        </div>
      </div>

      <button type="submit" :disabled="!isFormComplete">提交</button>
    </form>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { API_URL } from '@/api/constants'
/* eslint-disable */
export default {
  data() {
    return {
      ocrDialog: {
        visible: false,
        loading: false,
        error: '',
        resultText: '',
        imageBase64: '',
        imgUrl: '',
        progress: 0,
        parsedData: {},
        extraLines: [],
        progressTimer: null
      },
      maxDateTime: '', // 用于存储最小可选时间
      currentModule: 'emergency', // 默认显示急救模块
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
        hasSpecificOnsetTime: '',
        specificOnsetTime: '',
      },
      emergencyData: {
        inpatientId: '',
        outpatientId: '',
        onsetTime: '',
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

        //120
        transportUnit: [], // 存储出车单位
        callTime: '',
        arrivalTime: '',
        directTransfer: '', // 存储转送信息
        firstContactTime: '',
        firstDoctorTime: '',
        medicalStaff: '',

        //转院
        transferType: '', // 存储转院类型
        networkHospitalType:'', //网络医院类型
        hospitalName: '',
        //firstContactTime: '',
        transferInTime: '',
        decisionTransferTime: '',
        transferOutTime: '',
        arrivalAtHospitalTime: '',
        inHospitalConsultationTime: '',
        //medicalStaff: '',

        //自行来院
        //arrivalAtHospitalTime: '',
        //firstContactTime: '',
        //firstDoctorTime: '',
        //medicalStaff: '',

        //院内发病
        department: '',
        //firstContactTime: '',
        bedDoctorContactTime: '',
        leaveDepartmentTime: '',
        //medicalStaff: ''


      },
      chestPainData: {
        ecg: '',
        ecgRemote: '',
        ecgRemoteTime: '',
        transmissionMethod: '',
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

        //心电图
        whynoecg: "",
        ecgs: [
          { time: '', file: null, fileName: '', filePreview: null, filePath: '' } // 初始化一个心电图对象
        ],
        ecgDiagFalsesisTime: '', // 心电图诊断时间

        //肌钙蛋白
        troponins: [
          { type: [], unit: [], result: '', bloodDrawTime: '', reportTime: '' } // 初始化一个肌钙蛋白对象
        ],

        //实验室检查
        //creatinine: '',
        creatinineValue: null,
        //dDimer: '',
        dDimerValue: null,
        //bnp: '',
        bnpValue: null,
        //ntProBnp: '',
        ntProBnpValue: null,
        //myo: '',
        myoValue: null,
        myoValueUnit: 'ng/ml',
        //ckmb: '',
        ckmbValue: null,
        ckmbValueUnit: 'ng/ml',

        //STEMI
        diagFalsesisTime: '',
        doctorName: '',
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
        treatmentStrategyNstemi: '',
        invasiveStrategy: '',
        //紧急介入治疗
        decidingDoctor: '',
        interventionDecisionTime: '',
        cathLabStartTime: '',
        informedConsentStartTime: '',
        informedConsentSignatureTime: '',
        //24H介入
        actualInterventionTime: '', // 新增属性

        //STEMI
        reperfusion: '',
        reperfusionMethod: '',
        //decidingDoctor: '',
        //interventionDecisionTime: '',
        //cathLabStartTime: '',
        //informedConsentStartTime: '',
        //informedConsentSignatureTime: '',
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
        //treatmentStrategy: [],
        pulmonaryEmbolismDiagFalsesisTime: '',
        pulmonaryEmbolismDoctor: '',
        pulmonaryEmbolismImaging: [],
        ctFalsetificationTimePE: '',
        ctPreparationTimePE: '',
        ctScanStartTimePE: '',
        ctReportTimePE: '',
        riskStratification: [],
        anticoagulationStartTime: '',
        //thrombolysisScreening: [],
        //thrombolysisTreatment: [],
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
        cardiacSurgeryConsultationTime: '',

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
        isDelayed: null,
        delayReasons: [] // 多选原因，使用数组存储
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
        cerebrovascularDiseaseType: '',
        peripheralArteryDisease: '',
        aorticAneurysm: '',
        copd: '',
        chronicKidneyDisease: '',
        anemia: '',
        pepticUlcer: '',
        thyroidFunctionAbFalsermal: '',
        troponin72h: '',
        troponinMaxValue: '',
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


        //dischargeStatus: '',
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
        deathDescription: '',
      }
    };
  },
  computed: {
    ocrHasAnyParsed() {
      return this.ocrDialog && this.ocrDialog.parsedData && Object.keys(this.ocrDialog.parsedData).length > 0
    },
    isFormComplete() {
      return (
        this.formData.name &&
        this.formData.age &&
        this.formData.gender &&
        this.formData.phone &&
        this.formData.ethnicity &&
        this.formData.caseDate
        // 身高、体重、出生日期为选填，不影响表单完整性判断
      );
    }
  },
  created() {
    const token = getToken()
    this.token = token
    //this.patInfo()
  },
  mounted() {
    // 设置最小日期为当前日期和时间
    let data = new Date(); // 当前时间
    data.setHours(data.getHours() + 8);
    this.maxDateTime= data.toISOString().slice(0, 16)
    console.log(this.maxDateTime)

    // ===== OCR智能预填：读取来自ocr.vue的解析数据 =====
    this._applyOcrPrefill()
  },
  methods: {

/** ===== 智能识别：嵌入式 OCR 弹窗 ===== */
openOcrDialog() {
  this.ocrDialog.visible = true
},
closeOcrDialog() {
  this.ocrDialog.visible = false
},
selectOcrFile() {
  this.$refs.ocrFileInput && this.$refs.ocrFileInput.click()
},
handleOcrDrop(e) {
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (file) this.handleOcrFile(file)
},
handleOcrUpload(e) {
  const file = e.target.files && e.target.files[0]
  if (file) this.handleOcrFile(file)
  if (e.target) e.target.value = ''
},
fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
},
async handleOcrFile(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    this.ocrDialog.error = '请上传图片文件'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    this.ocrDialog.error = '图片不能超过10MB'
    return
  }

  this.clearOcrResult(false)
  this.ocrDialog.loading = true
  this.ocrDialog.progress = 0
  this.ocrDialog.progressTimer = setInterval(() => {
    if (this.ocrDialog.progress < 85) this.ocrDialog.progress += 8
  }, 400)

  try {
    const imageBase64 = await this.fileToBase64(file)
    this.ocrDialog.imgUrl = imageBase64
    this.ocrDialog.imageBase64 = imageBase64.split(',')[1]

    const { sendBaiduAIRequest } = await import('@/api/constants')
    const res = await sendBaiduAIRequest(this.ocrDialog.imageBase64)
    const lines = res && res.words_result ? res.words_result.map(item => item.words).filter(Boolean) : []
    this.ocrDialog.progress = 100

    if (!lines.length) {
      this.ocrDialog.error = 'OCR未返回有效内容，请检查图片清晰度'
      return
    }
    this.ocrDialog.resultText = lines.join('\n')
    this.parseOcrLines(lines)
  } catch (err) {
    this.ocrDialog.error = 'OCR识别失败：' + (err.message || String(err))
  } finally {
    clearInterval(this.ocrDialog.progressTimer)
    this.ocrDialog.progressTimer = null
    this.ocrDialog.loading = false
  }
},
parseOcrLines(lines) {
  const parsed = {}
  const unmatched = []
  const idCardReg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i
  const phoneReg = /1[3-9]\d{9}/
  const dobReg = /(\d{4})[年\-./](\d{1,2})[月\-./](\d{1,2})日?/

  lines.forEach(rawLine => {
    const raw = String(rawLine || '').trim()
    if (!raw) return
    const compact = raw.replace(/\s/g, '')

    if (!parsed.idNumber && idCardReg.test(compact)) {
      parsed.idNumber = compact
      parsed.idType = '1'
      parsed.dob = `${compact.substring(6, 10)}-${compact.substring(10, 12)}-${compact.substring(12, 14)}`
      parsed.age = String(new Date().getFullYear() - Number(compact.substring(6, 10)))
      parsed.gender = Number(compact[16]) % 2 === 1 ? '男' : '女'
      return
    }

    const phone = compact.match(phoneReg)
    if (phone && !parsed.phone) {
      parsed.phone = phone[0]
      return
    }

    const kv = raw.match(/^(.{1,10})[：:]\s*(.+)$/)
    if (kv) {
      const key = kv[1].replace(/\s/g, '')
      const val = kv[2].trim()
      if (/姓名|名字|名称/.test(key)) { parsed.name = val; return }
      if (/性别/.test(key)) { parsed.gender = /女/.test(val) ? '女' : (/男/.test(val) ? '男' : val); return }
      if (/年龄|岁/.test(key)) { parsed.age = val.replace(/岁/g, '').trim(); return }
      if (/出生|生日/.test(key)) {
        const d = val.match(dobReg)
        parsed.dob = d ? `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}` : val
        return
      }
      if (/身份证|证件号/.test(key)) { parsed.idNumber = val.replace(/\s/g, ''); parsed.idType = '1'; return }
      if (/电话|手机|联系电话/.test(key)) { parsed.phone = val.replace(/\s/g, ''); return }
      if (/民族/.test(key)) { parsed.ethnicity = val; return }
      if (/住院号|住院ID|住院编号/.test(key)) { parsed.inpatientId = val; return }
      if (/门诊号|门诊ID|门诊编号/.test(key)) { parsed.outpatientId = val; return }
      if (/发病|起病|症状出现/.test(key)) { parsed.onsetTime = val; return }
      if (/详细地址|街道|具体地址/.test(key)) { parsed.detailedAddress = val; return }
      if (/省市区|发病地址|地址/.test(key)) { parsed.address = val; return }
      if (/身高/.test(key)) { parsed.height = val.replace(/cm|厘米/ig, '').trim(); return }
      if (/体重/.test(key)) { parsed.weight = val.replace(/kg|公斤/ig, '').trim(); return }
      if (/职业/.test(key)) { parsed.occupation = val; return }
    }

    const dob = raw.match(dobReg)
    if (dob && !parsed.dob) {
      parsed.dob = `${dob[1]}-${dob[2].padStart(2, '0')}-${dob[3].padStart(2, '0')}`
      return
    }
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(raw) && !/汉族|满族|回族|壮族|男性|女性|医院|科室/.test(raw) && !parsed.name) {
      parsed.name = raw
      return
    }
    if (/族$/.test(raw) && raw.length <= 4 && !parsed.ethnicity) {
      parsed.ethnicity = raw
      return
    }
    unmatched.push(raw)
  })

  this.ocrDialog.parsedData = parsed
  this.ocrDialog.extraLines = unmatched.slice(0, 10)
},
clearOcrResult(clearImage = true) {
  this.ocrDialog.error = ''
  this.ocrDialog.resultText = ''
  this.ocrDialog.progress = 0
  this.ocrDialog.parsedData = {}
  this.ocrDialog.extraLines = []
  if (clearImage) {
    this.ocrDialog.imageBase64 = ''
    this.ocrDialog.imgUrl = ''
  }
},
applyOcrParsedData() {
  if (!this.ocrHasAnyParsed) {
    this.ocrDialog.error = '暂无可填入的解析字段'
    return
  }
  sessionStorage.setItem('ocr_prefill_data', JSON.stringify(this.ocrDialog.parsedData))
  sessionStorage.setItem('ocr_prefill_ts', String(Date.now()))
  this._applyOcrPrefill()
  this.closeOcrDialog()
},

/** ===== OCR预填：从sessionStorage读取ocr.vue解析的数据自动填入表单 ===== */
_applyOcrPrefill() {
  try {
    const raw = sessionStorage.getItem('ocr_prefill_data')
    const ts = Number(sessionStorage.getItem('ocr_prefill_ts') || 0)
    // 超过5分钟的预填数据丢弃
    if (!raw || (Date.now() - ts) > 5 * 60 * 1000) return

    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object') return

    // 清除已使用的预填数据
    sessionStorage.removeItem('ocr_prefill_data')
    sessionStorage.removeItem('ocr_prefill_ts')

    // 映射到 formData（基本信息）
    const fmap = {
      name: 'name',
      gender: 'gender',
      age: 'age',
      dob: 'dob',
      idType: 'idType',
      idNumber: 'idNumber',
      phone: 'phone',
      ethnicity: 'ethnicity',
      height: 'height',
      weight: 'weight',
      maritalStatus: 'maritalStatus',
      occupation: 'occupation',
      education: 'education'
    }
    let filled = 0
    for (const [ocrKey, formKey] of Object.entries(fmap)) {
      if (d[ocrKey] !== undefined && d[ocrKey] !== '') {
        this.formData[formKey] = d[ocrKey]
        filled++
      }
    }

    // 映射到 emergencyData（急救信息）
    const emap = {
      inpatientId: 'inpatientId',
      outpatientId: 'outpatientId',
      address: 'address',
      detailedAddress: 'detailedAddress',
      onsetTime: 'onsetTime',
      insuranceType: 'insuranceType',
      insuranceNumber: 'insuranceNumber',
      isCriticalIllnessInsurance: 'isCriticalIllnessInsurance',
      source: 'source'
    }
    for (const [ocrKey, emKey] of Object.entries(emap)) {
      if (d[ocrKey] !== undefined && d[ocrKey] !== '') {
        this.emergencyData[emKey] = d[ocrKey]
        filled++
      }
    }

    // 症状复选框（数组合并）
    if (Array.isArray(d.symptoms) && d.symptoms.length > 0) {
      this.emergencyData.symptoms = [...new Set([...(this.emergencyData.symptoms || []), ...d.symptoms])]
      filled++
    }

    if (filled > 0) {
      this.$nextTick(() => {
        this.$message({
          message: `OCR智能预填：已自动填入 ${filled} 个字段，请核对后提交`,
          type: 'success',
          duration: 4000,
          showClose: true
        })
      })
    }
  } catch (e) {
    console.warn('OCR预填数据读取失败:', e)
  }
},

/** ===== 动态必填校验（基于既有红星 + 可见性） ===== */
isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return false;
  const rects = el.getClientRects();
  if (!rects || rects.length === 0) return false;
  // 祖先 display:none 也不可见
  let cur = el;
  while (cur) {
    const cs = window.getComputedStyle(cur);
    if (cs.display === 'none') return false;
    cur = cur.parentElement;
  }
  return true;
},
_collectControls(container) {
  const ctrls = Array.from(container.querySelectorAll('input, select, textarea'));
  return ctrls.filter(el => el.type !== 'file' && !el.disabled && !el.readOnly && this.isElementVisible(el));
},
_isFilled(ctrls) {
  if (!ctrls || ctrls.length === 0) return true;
  const radios = ctrls.filter(el => el.type === 'radio');
  const checks = ctrls.filter(el => el.type === 'checkbox');
  if (radios.length > 0) return radios.some(el => el.checked);
  if (checks.length > 0) return checks.some(el => el.checked);
  return ctrls.every(el => el.tagName === 'SELECT' ? (el.value !== '' && el.value != null) : ((el.value || '').trim() !== ''));
},
_focusAndScroll(container) {
  if (!container) return;
  const t = container.querySelector('input, select, textarea') || container;
  if (t && typeof t.focus === 'function') t.focus();
  const y = container.getBoundingClientRect().top + window.pageYOffset - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
  container.classList.add('shake-error');
  setTimeout(() => container.classList.remove('shake-error'), 1200);
},
validateRequiredByStars() {
  try {
    const root = this.$refs.mainForm || this.$el;
    if (!root) return true;
    // 兼容：.red-star / 行内红色 * / label/th 直接包含 *
    const starNodes = Array.from(root.querySelectorAll('.red-star, label span[style*=\"red\"], th span[style*=\"red\"]'))
      .filter(n => this.isElementVisible(n));
    const textStars = Array.from(root.querySelectorAll('label, th'))
      .filter(n => this.isElementVisible(n) && n.textContent && n.textContent.includes('*'));
    const allStars = Array.from(new Set(starNodes.concat(textStars)));
    for (const star of allStars) {
      // 选择最接近的行容器
      let row = star.closest('.form-row') || star.closest('.form-row-item') || star.closest('tr') || star.closest('div, td, th');
      if (!row || !this.isElementVisible(row)) continue;
      const ctrls = this._collectControls(row);
      if (!this._isFilled(ctrls)) {
        let labelText = '';
        const label = row.querySelector('label, th');
        if (label) labelText = (label.innerText || label.textContent || '').replace('*', '').trim();
        if (!labelText) labelText = '有未填写的必填项';
        if (this.showMessage) this.showMessage(`${labelText} 为必填项`, 'error');
        else alert(`${labelText} 为必填项`);
        this._focusAndScroll(row);
        return false; // 拦截提交
      }
    }
    return true;
  } catch (e) {
    console.error('validateRequiredByStars error:', e);
    return true; // 发生异常不阻断提交，避免影响使用
  }
},


    // === 通用提示窗口 ===
    showMessage(msg, type = 'info') {
      if (this.$message) {
        if (type === 'success' && this.$message.success) return this.$message.success(msg);
        if (type === 'warning' && this.$message.warning) return this.$message.warning(msg);
        if (type === 'error' && this.$message.error) return this.$message.error(msg);
        return this.$message(msg);
      }
      alert(msg);
    },

    // === 姓名校验：只允许中英文/空格/间隔点“·”，不允许数字与符号 ===
    validateName(name) {
      if (!name) return false;
      const re = /^[\p{L}\u4e00-\u9fa5·\s]+$/u;
      return re.test(name);
    },

    // === 手机号校验：大陆 11 位，以 1 开头，第二位 3-9 ===
    validatePhone(phone) {
      const re = /^1[3-9]\d{9}$/;
      return re.test(String(phone || ''));
    },

    // === 根据出生日期计算年龄（按当前日期精确计算）===
    computeAgeFromDob(dobStr) {
      if (!dobStr) return null;
      const today = new Date();
      const dob = new Date(dobStr);
      if (isNaN(dob.getTime())) return null;
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age;
    },

    // === 二代身份证合法性校验与信息解析 ===
    // 返回 { valid, reason?, birth: 'YYYY-MM-DD', gender: '男'|'女', age }
    parseIdCard(id) {
      const code = String(id || '').trim().toUpperCase();
      // 18位格式
      const re18 = /^\d{17}[0-9X]$/;
      if (!re18.test(code)) {
        return { valid: false, reason: '身份证号码应为18位，最后一位可为X' };
      }
      // 出生日期 (7-14位)
      const y = parseInt(code.slice(6, 10), 10);
      const m = parseInt(code.slice(10, 12), 10);
      const d = parseInt(code.slice(12, 14), 10);
      const birthStr = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      const birthDate = new Date(birthStr);
      if (isNaN(birthDate.getTime()) || birthDate.getFullYear() != y || (birthDate.getMonth()+1) != m || birthDate.getDate() != d) {
        return { valid: false, reason: '身份证中的出生日期无效' };
      }
      // 校验码
      const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      const parity = ['1','0','X','9','8','7','6','5','4','3','2'];
      let sum = 0;
      for (let i=0; i<17; i++) sum += parseInt(code[i],10) * weights[i];
      const mod = sum % 11;
      if (parity[mod] !== code[17]) {
        return { valid: false, reason: '身份证校验位不正确' };
      }
      // 性别：第17位（index 16）奇数男，偶数女
      const genderCode = parseInt(code[16], 10);
      const gender = (genderCode % 2 === 1) ? '男' : '女';
      // 年龄
      const age = this.computeAgeFromDob(birthStr);
      return { valid: true, birth: birthStr, gender, age };
    },

    validateTemperature() {
      this.checkValue(this.emergencyData, 'temperature', this.emergencyData.temperature, 35, 42, '摄氏度');
    },
    checkValue(obj, field, value, min, max, unit = '') {
      console.log(`checkValue called for ${field}`); // 确保方法被调用

      // 字段与中文描述的映射
      const fieldNames = {
        weight: '体重',
        heartRate: '心率',
        pulse: '脉搏',
        respiration: '呼吸',
        temperature: '体温'
      };

      // 获取对应的中文描述
      const fieldLabel = fieldNames[field] || field; // 默认使用字段名

      // 假设值限制为 min 到 max
      if (value === null || value === '') {
        // 清空输入值
        obj[field] = null;
        alert(`请输入有效的${fieldLabel}`);
      } else if (isNaN(value)) {
        // 输入值不是数字
        alert(`请输入有效的数字`);
        obj[field] = null; // 清空输入值
      } else if (parseFloat(value) < min || parseFloat(value) > max) {
        // 输入值超出范围
        alert(`${fieldLabel}必须在${min}到${max}${unit}之间`);
        obj[field] = null; // 清空输入值
      }
      // 如果输入值符合要求，不做任何操作
    },
    validateTime(obj, field) {
      let data = new Date(); // 当前时间
      data.setHours(data.getHours() + 8);
      this.maxDateTime= data.toISOString().slice(0, 16)
      console.log("maxDateTime")
      console.log(this.maxDateTime)
      if (obj[field] > this.maxDateTime) {
        obj[field] = this.maxDateTime; // 超过最大时间则重置
        alert(`"${field}" 时间不能超过当前时间！`);
      }
    },
    validecgdateTime(index) {
      let data = new Date(); // 当前时间
      data.setHours(data.getHours() + 8);
      this.maxDateTime= data.toISOString().slice(0, 16)
      if (this.chestPainData.ecgs[index].time > this.maxDateTime) {
        this.chestPainData.ecgs[index].time = this.maxDateTime; // 超过最大时间则重置
        alert(`第 ${index + 1} 个心电图时间不能超过当前时间！`);
      }
    },
    checktroponinTimes(index) {
      const troponin = this.chestPainData.troponins[index];
      const bloodDrawTime = troponin.bloodDrawTime;
      const reportTime = troponin.reportTime;

      let data = new Date(); // 当前时间
      data.setHours(data.getHours() + 8);
      this.maxDateTime= data.toISOString().slice(0, 16)

      /* if (bloodDrawTime.getTime()) && !isNaN(reportTime.getTime())) {
        if (reportTime < bloodDrawTime) {
          alert(`第${index + 1}项：获得报告时间不能早于抽血完成时间`);
          this.chestPainData.troponins[index].reportTime = '';
        }
      } */
      console.log(reportTime)
      console.log(bloodDrawTime)
      console.log(this.maxDateTime)

      if (reportTime > this.maxDateTime) {
        alert(`第${index + 1}项：获得报告时间不能晚于当前时间`);
        this.chestPainData.troponins[index].reportTime = this.maxDateTime;
      }
      if (bloodDrawTime > this.maxDateTime) {
        alert(`第${index + 1}项：抽血完成时间不能晚于当前时间`);
        this.chestPainData.troponins[index].bloodDrawTime = this.maxDateTime;
      }

    },
    async patInfo(){


      const response = await axios.post(API_URL + 'pat/infoone', null,
        {
          params: { id: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        });
      // 处理响应
      if (response.data.code === 200) {
        const responseData = response.data.data; // 假设这是从后端获取的数据
        console.log(responseData)
        this.formData.age = responseData.age?.toString() || ''; // 转为字符串
        this.formData.dob = responseData.birthDate ? responseData.birthDate.substring(0, 10) : ''; // 格式化为 YYYY-MM-DD
        this.formData.education = responseData.educationLevel || ''; // 处理 null
        this.formData.ethnicity = responseData.ethnicity || ''; // 处理 null
        this.formData.gender = responseData.gender || ''; // 处理 null
        this.formData.height = responseData.height || 0; // 默认值为 0
        this.formData.idNumber = responseData.idNumber || ''; // 处理 null
        this.formData.idType = responseData.idType?.toString() || ''; // 转为字符串
        this.formData.maritalStatus = responseData.maritalStatus?.toString() || ''; // 转为字符串
        this.formData.caseDate = responseData.medicalRecordDate ? responseData.medicalRecordDate.substring(0, 10) : ''; // 格式化为 YYYY-MM-DD
        this.formData.occupation = responseData.occupation || ''; // 处理 null
        this.formData.name = responseData.patientName || ''; // 处理 null
        this.formData.phone = responseData.phone || ''; // 处理 null
        this.formData.weight = responseData.weight || 0; // 默认值为 0
        this.formData.patientId = responseData.outPatientId || 0; // 默认值为 0
        console.log("this.formData")
        console.log(this.formData)
      }
    },
    async getNextPatientId() {
      const response = await axios.post(API_URL + 'pat/frontPatInfo', null, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken()
        }
      });
      if (!response.data || response.data.code !== 200) {
        throw new Error(response.data?.message || '获取患者编号失败');
      }
      const rows = Array.isArray(response.data.data) ? response.data.data : [];
      const usedIds = new Set(
        rows
          .reduce((ids, item) => ids.concat([item?.patientId, item?.id]), [])
          .map(value => Number(value))
          .filter(id => Number.isInteger(id) && id > 0)
      );
      let nextId = usedIds.size ? Math.max(...usedIds) + 1 : 1;
      while (usedIds.has(nextId)) nextId++;
      return nextId;
    },
    async patInfoAdd(){
      // 新建申报不得沿用 Vuex 中上一位患者的 ID。
      const nextPatientId = await this.getNextPatientId();
      const patInfoDTO = {
        id: 0,
        patientId: nextPatientId,
        age: parseInt(this.formData.age, 10), // 确保是整数
        birthDate: this.formData.dob ? new Date(this.formData.dob) : null,
        educationLevel: Number(this.formData.education || 0),
        ethnicity: this.formData.ethnicity,
        gender: this.formData.gender,
        height: this.formData.height,
        idNumber: this.formData.idNumber,
        idType: Number(this.formData.idType || 0),
        maritalStatus: Number(this.formData.maritalStatus || 0),
        medicalRecordDate: this.formData.caseDate ? new Date(this.formData.caseDate) : null,
        occupation: Number(this.formData.occupation || 0),
        outPatientId: String(this.emergencyData.outpatientId || ''),
        patientName: this.formData.name,
        phone: this.formData.phone,
        weight: this.formData.weight,
      };
      console.log("patInfoDTO")
      console.log(patInfoDTO)
      const response = await axios.post(API_URL + 'pat/patInfoAdd', patInfoDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
      if (response.data.code === 200) {
        const created = response.data.data || {};
        // 后续所有子表都使用新患者编号，不再沿用旧的 2。
        this.patientId = Number(created.id ?? created.patientId ?? nextPatientId);
      } else {
        throw new Error(response.data.message || '患者基本信息提交失败');
      }
    },
    async patEmInfoAdd(){
      const patEmInfo = {
        hospitalAdmissionId: this.emergencyData.inpatientId, // 住院ID
        insuranceNumber: this.emergencyData.insuranceNumber, // 医保编号
        insuranceType: this.emergencyData.insuranceType, // 医保类型
        onsetLocation: this.emergencyData.address, // 发病地址
        onsetPeriod: this.emergencyData.specificOnsetTime, // 计算发病时段
        onsetTime: this.emergencyData.onsetTime, // 发病时间
        outpatientId: this.emergencyData.outpatientId, // 门诊ID
        patientId: this.patientId, // 患者ID，需根据实际情况设置
        isCriticalIllnessInsurance:this.emergencyData.isCriticalIllnessInsurance,

      };
      console.log("patEmInfo")
      console.log(patEmInfo)
      const response = await axios.post(API_URL + 'pat/patEmInfoAdd', patEmInfo,
        {
          params: { id: this.patientId},
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async patConInfoAdd(){
      const patConAsDTO = {
        additionalSymptoms: this.emergencyData.symptoms.join(', '), // 将症状数组转换为字符串
        conditionType: this.emergencyData.symptomslevel, // 获取病情类型
        patientId:this.patientId
        //emergencyId: 0 // 确保有有效的急救ID
        //assessmentId: 0, // 根据实际情况设置

      };
      console.log("patConAsDTO")
      console.log(patConAsDTO)
      const response = await axios.post(API_URL + 'pat/patConInfoAdd', patConAsDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async patAdInfoAdd(){
      const patAdMeDTO = {
        ambulanceUnit: Array.isArray(this.emergencyData.transportUnit) ? this.emergencyData.transportUnit.join(',') : (this.emergencyData.transportUnit || ''), // 转换救护车类型
        callTime: this.emergencyData.callTime ? new Date(this.emergencyData.callTime).toISOString() : null, // 呼救时间
        firstMedicalContactTime: this.emergencyData.firstContactTime ? new Date(this.emergencyData.firstContactTime).toISOString() : null, // 首次医疗接触时间
        hospitalArrivalTime: this.emergencyData.arrivalTime ? new Date(this.emergencyData.arrivalTime).toISOString() : null, // 到达医院时间
        methodType: this.emergencyData.source, // 获取来院方式
        transferHospitalName: this.emergencyData.hospitalName || '', // 转送医院名称
        patientId: this.patientId, // 患者ID
        admissionId: 0, // 入院ID，默认值
        medicalStaff: this.emergencyData.medicalStaff,
        isTransferHighHospital: this.emergencyData.directTransfer === 'True', // 直接转送上级医院（布尔值）
        transferType: this.emergencyData.transferType || '', // 转院类型
        transferHospitalInTime: this.emergencyData.transferInTime ? new Date(this.emergencyData.transferInTime).toISOString() : null, // 转出医院入门时间
        decisionTransferTime: this.emergencyData.decisionTransferTime ? new Date(this.emergencyData.decisionTransferTime).toISOString() : null, // 决定转院时间
        firstDiagnosisTime: this.emergencyData.firstDoctorTime ? new Date(this.emergencyData.firstDoctorTime).toISOString() : null,
        transferHospitalOutTime: this.emergencyData.transferOutTime ? new Date(this.emergencyData.transferOutTime).toISOString() : null, // 转出医院出门时间

        inHospitalContactTime: this.emergencyData.inHospitalConsultationTime ? new Date(this.emergencyData.inHospitalConsultationTime).toISOString() : null, // 院内接诊时间
        bedMedicalContactTime: this.emergencyData.bedDoctorContactTime ? new Date(this.emergencyData.bedDoctorContactTime).toISOString() : null, // 床位医生接触时间
        leaveDepartmentTime: this.emergencyData.leaveDepartmentTime ? new Date(this.emergencyData.leaveDepartmentTime).toISOString() : null, // 离开科室时间
        onsetDepartment: this.emergencyData.department || '' // 发病地点
      };
      console.log("patAdMeDTO ")
      console.log(patAdMeDTO)
      const response = await axios.post(API_URL + 'pat/patAdInfoAdd', patAdMeDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async patViInfoAdd(){
      const patViSiDTO = {
        bloodPressure: this.emergencyData.bloodPressure, // 血压
        checkTime: new Date().toISOString(), // 当前时间作为检查时间
        consciousness: Number(this.emergencyData.consciousness), // 转换意识状态
        //outpatientId: this.emergencyData.outpatientId, // 门诊ID
        outpatientId: this.patientId, // 门诊ID
        patientName: this.formData.name, // 患者姓名
        pulse: Number(this.emergencyData.pulse), // 脉搏
        respiration: Number(this.emergencyData.respiration), // 呼吸
        temperature: Number(this.emergencyData.temperature), // 体温
        patientId:this.patientId,
        heartRate: this.emergencyData.heartRate === '' ? null : Number(this.emergencyData.heartRate)

      };
      console.log("patViSiDTO")
      console.log(patViSiDTO)
      const response = await axios.post(API_URL + 'pat/patViInfoAdd', patViSiDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async patEcgInfoAdd(){
      // uploadEcgFiles 内部已完成：上传图片 → 写入数据库（pic/ecgPicUrl/upload + pic/ecgPicUrl/add）
      // 心电图选"否"时跳过
      await this.uploadEcgFiles()
    },
    async labAdd(){
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
        troponinValue: this.chestPainData.troponin === 'True' ? (t0.unit || null): null, // 将数组转换为字符串
        firstTroponinType: this.chestPainData.troponin === 'True' ?(t0.type || null): null, // 获取第一个肌钙蛋白的类型
        troponinResult: this.chestPainData.troponin === 'True'?(t0.result || null): null, // 获取第一个肌钙蛋白的结果
        bloodDrawCompletionTime: this.chestPainData.troponin === 'True'?(t0.bloodDrawTime || null): null ,
        reportObtainTime: this.chestPainData.troponin === 'True' ?(t0.reportTime || null):null,

      };
      console.log("patLabDTO")
      console.log(patLabDTO)
      const response = await axios.post(API_URL + 'diagnosis/lab/add', patLabDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async heartAdd(){
      /* const patHeartDTO = {
        diagnosisDoctor: this.chestPainData.diagnosisDoctor , // 医生姓名
        initialDiagnosis: this.chestPainData.diagFalsesis, // 初步诊断
        initialDiagnosisTime: this.chestPainData.diagFalsesisTime, // 当前时间作为初步诊断时间
        patientId: this.patientId, // 患者ID，根据实际情况设置
        patientRemarks: this.chestPainData.remarks, // 患者备注

      }; */
      const patHeartDTO = {

        consultationType: this.chestPainData.consultationType, // 初步诊断
        patientId: this.patientId, // 患者ID，根据实际情况设置

        isCardiologyConsultation: this.chestPainData.consult === "True",
        notificationConsultationTime: this.chestPainData.cardiacSurgeryConsultationFalsetification,
        consultationTime: this.chestPainData.cardiacSurgeryConsultationTime,
      };
      console.log("patHeartDTO")
      console.log(patHeartDTO)
      const response = await axios.post(API_URL + 'diagnosis/heart/add', patHeartDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      //console.log(response)

      const patDiaDTO = {
        diagnosisDoctor: this.chestPainData.doctorName , // 医生姓名
        initialDiagnosis: this.chestPainData.diagFalsesis, // 初步诊断
        initialDiagnosisTime: this.chestPainData.diagFalsesisTime, // 当前时间作为初步诊断时间
        patientId: this.patientId, // 患者ID，根据实际情况设置
        patientRemarks: this.chestPainData.remarks, // 患者备注

      };
      const response1 = await axios.post(API_URL + 'diagnosis/dia/add', patDiaDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })

      switch (this.chestPainData.diagFalsesis) {
        case 'STEMI':
          const patStemiDTO = {
            informedConsentSignatureTime:this.chestPainData.informedConsentSignatureTime,
            initialDiagnosisTime:this.chestPainData.informedConsentStartTime,

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
            prasugrelDosage: this.chestPainData.ticagrelorDose,
            prasugrelTime: this.chestPainData.ticagrelorTime,
            isAnticoagulation: this.chestPainData.anticoagulation === 'True', // 抗凝
            isAntiplateletTherapy: this.chestPainData.antiplateletTreatment === 'True', // 抗血小板治疗
            isBetaBlocker: this.chestPainData.betaBlocker === 'True', // β受体阻滞剂
            isBypassCcu: this.chestPainData.ccuBypass === 'True', // 绕行CCU
            isBypassEmergency: this.chestPainData.emergencyBypass === 'True', // 绕行急诊
            isReperfusion: this.chestPainData.reperfusion?? null, // 再灌注
            isStatinTherapy: this.chestPainData.statinTreatment === 'True', // 他汀治疗
            thrombolysisStartTime: this.chestPainData.thrombolysisStartTime, // 溶栓开始时间
            thrombolysisEndTime: this.chestPainData.thrombolysisEndTime, // 溶栓结束时间
            patientId: this.patientId ,//患者ID
            reperfusionMethod: (() => {
              const v =
                this.chestPainData.reperfusionMethod ??
                this.chestPainData.reperfusionMeasures; // 兼容旧字段，确保不丢值
              if (Array.isArray(v)) return v.join(','); // 若 UI 多选
              return v || null;
            })(),
            directPciDoctor: this.chestPainData.decidingDoctor ?? this.chestPainData.directPciDoctor ?? null,
            directPciTime: this.chestPainData.interventionDecisionTime ?? this.chestPainData.directPciTime ?? null,
            informedConsentStartTime: this.chestPainData.informedConsentStartTime || null,
            informedConsentSignTime:  this.chestPainData.informedConsentSignatureTime || null,
            // ===== 溶栓相关 =====
            thrombolysisScreening: this.chestPainData.thrombolysisScreening || null, // 溶栓筛查结论（字符串/枚举，按你表单）
            isThrombolysisTreatment: this.chestPainData.thrombolysisTreatment === 'True', // 是否实施溶栓（你表单是 'True'/'False'）
            // 场所：你表单里是 location + detail，后端既要布尔也要地点名
            isDirectThrombolysisPlace: this.chestPainData.thrombolysisLocation === 'True' ,// 如你们定义“导管室=直接溶栓”，不符请按你们约定改
            thrombolysisPlace: this.chestPainData.thrombolysisLocationDetail || this.chestPainData.thrombolysisLocation || null, // 优先细分地点

            // 溶栓知情同意时间（你表单用的是通用知情同意时间，这里直接复用）
            thrombolysisConsentStartTime: this.chestPainData.informedConsentStartTime || null,
            thrombolysisConsentSignTime:  this.chestPainData.informedConsentSignatureTime || null,

            // 溶栓用药与剂量
            // 说明：你表单只有 "thrombolysisDrug"（药名）和 "thrombolysisDose"（剂量），没有“药物代”这一项
            thrombolyticDrugGeneration: this.chestPainData.thrombolyticDrugGeneration, // 你目前没有对应输入项，若后端必须要“一代/二代/三代”，需要在表单新增该字段
            thrombolyticDrugDose: Number(this.chestPainData.thrombolysisDose) || null,

            // 溶栓再通
            isThrombolysisPatency: this.chestPainData.thrombolysisReperfusion === 'True',

            // ===== 补救 PCI（rescue/salvage PCI）=====
            // 你表单没有专门的 salvage 字段，常用的医生/时间来自“决定介入/决定医生”
            salvagePciDoctor: this.chestPainData.decidingDoctor || null,
            salvagePciTime:   this.chestPainData.interventionDecisionTime || null,

            // ===== 转运 PCI（reperfusionMethod=转运PCI 时才有）=====
            isTransferPci: this.chestPainData.reperfusionMethod === '转运PCI',
            transferPciType: this.chestPainData.reperfusionMethod === '转运PCI'
              ? (this.chestPainData.transportPCI || null) // '转出患者' / '接收患者'
              : null,

              // ===== 并发症 =====
            // 你当前 STEMI 表单里没有 chestPainData.complication，项目里“合并症/并发症”在 outcomeData.comorbidities
            // 如果 diagnosis 接口就要这个字段，你可以先用 outcomeData 的合并症字符串；更规范做法是给 STEMI 页加一个并发症输入。
            complication: this.outcomeData?.comorbidities || null,


            // …其余字段原样

          }
          const response1 = await axios.post(API_URL + 'diagnosis/stemi/add', patStemiDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case 'NSTEMI':
          const patNstemiDTO = {
            anticoagulantDoseNstemi: this.chestPainData.anticoagulantDose, // 抗凝剂量
            anticoagulantDrugNstemi: this.chestPainData.anticoagulantDrugs, // 抗凝药物
            anticoagulationTimeNstemi: this.chestPainData.anticoagulantTime, // 抗凝时间
            aspirinDosageNstemi: this.chestPainData.aspirinDose, // 阿司匹林剂量
            aspirinTimeNstemi: this.chestPainData.aspirinTime, // 阿司匹林时间
            cardiacFunctionGradeNstemi: this.chestPainData.heartFunctionClass, // 心功能分级
            clopidogrelDosageNstemi: Number(this.chestPainData.clopidogrelDose), // 氯吡格雷剂量
            clopidogrelTimeNstemi: this.chestPainData.clopidogrelTime, // 氯吡格雷时间
            emergencyInterventionCathLabStartTimeNstemi: this.chestPainData.cathLabStartTime, // 启动导管室时间
            emergencyInterventionDecisionTimeNstemi: this.chestPainData.interventionDecisionTime, // 决定介入时间
            emergencyInterventionDoctorNstemi: this.chestPainData.decidingDoctor, // 决定医生
            emergencyInterventionInformedConsentSignTimeNstemi: this.chestPainData.informedConsentSignatureTime, // 签署知情同意时间
            emergencyInterventionInformedConsentStartTimeNstemi: this.chestPainData.informedConsentStartTime, // 开始知情同意时间
            graceRiskStratificationNstemi: this.chestPainData.graceRiskStratification, // Grace危险分层
            graceScoreNstemi: this.chestPainData.graceScore, // Grace分值
            initialDiagnosisTime: this.chestPainData.diagFalsesisTime, // 初步诊断时间
            treatmentStrategyNstemi:this.chestPainData.treatmentStrategyNstemi,
            invasiveStrategyNstemi: this.chestPainData.invasiveStrategy, // 侵入性策略
            isAnticoagulationNstemi: this.chestPainData.anticoagulation === 'True', // 抗凝
            isAntiplateletTherapyNstemi: this.chestPainData.antiplateletTreatment === 'True', // 抗血小板治疗
            isBetaBlockerNstemi: this.chestPainData.betaBlocker === 'True', // β受体阻滞剂
            isBypassCcuNstemi: this.chestPainData.ccuBypass === 'True', // 绕行CCU
            isBypassEmergencyNstemi: this.chestPainData.emergencyBypass === 'True', // 绕行急诊
            isCardiacArrestAfterOnset: this.chestPainData.graceAssessment.includes('心脏骤停'), // 心脏骤停
            isCardiacNecrosisMarkerElevation: this.chestPainData.graceAssessment.includes('心肌坏死标志物升高'),//心肌坏死标志物升高
            isCardiogenicShockOrHemodynamicInstability: this.chestPainData.graceHighRisk.includes('心源性休克'), // 心源性休克
            isDynamicStSegmentChange: this.chestPainData.graceHighRisk.includes('ST-T动态演变'), // ST-T动态演变
            isEcgStSegmentChange: this.chestPainData.graceAssessment.includes('ST段改变'), // 心电图ST段改变
            isLifeThreateningArrhythmiaOrCardiacArrest: this.chestPainData.graceHighRisk.includes('心律失常'), // 危及生命的心律失常
            isMechanicalComplicationOfMyocardialInfarction: this.chestPainData.graceHighRisk.includes('机械性并发症'), // 机械性并发症
            isRefractoryAnginaAndStSegmentChange: this.chestPainData.graceHighRisk.includes('急性心力衰竭'), // 急性心力衰竭伴难治性心绞痛和ST段改变
            isRepeatedRiskStratification: this.chestPainData.reassessment === 'True', // 再次危险分层
            isStatinTherapyNstemi: this.chestPainData.statinTreatment === 'True', // 他汀治疗
            patientId: this.patientId, // 患者ID
            prasugrelDosageNstemi: this.chestPainData.ticagrelorDose, // 普拉格雷剂量
            prasugrelTimeNstemi: this.chestPainData.ticagrelorTime, // 普拉格雷时间
            repeatedRiskStratificationResultNstemi: this.chestPainData.reassessment, // 再次危险分层结果
            repeatedRiskStratificationTimeNstemi: this.chestPainData.reassessmentTime // 再次危险分层时
          }
          const response2 = await axios.post(API_URL + 'diagnosis/nstemi/add', patNstemiDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;
        case 'UA':
          const patUaDTO = {
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
              treatmentStrategyUa:this.chestPainData.treatmentStrategyUa,
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
          }
          const response3 = await axios.post(API_URL + 'diagnosis/ua/add', patUaDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case '主动脉夹层':
          const patHeartDisDTO = {
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
          }
          const response4 = await axios.post(API_URL + 'diagnosis/heartinfo/add', patHeartDisDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case '肺动脉栓塞':
          const patLungDTO = {
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
          }
          const response5 = await axios.post(API_URL + 'diagnosis/lung/add', patLungDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case '非ACS心源性胸痛':
          const patAntiACSDTO = {
            initialDiagnosisTime: this.chestPainData.FalsenACSChestPainDiagFalsesisTime, // 初步诊断时间
            nonAcsCardiogenicChestPainType: this.chestPainData.FalsenACSChestPainType, // 非ACS心源性胸痛类型
            treatmentMeasuresNonAcs: this.chestPainData.FalsenACSChestPainTreatment, // 处理措施
            patientDispositionNonAcs: this.chestPainData.FalsenACSChestPainDoctor, // 诊断医生
            patientId: this.patientId, // 患者ID
            //createTime: new Date().toISOString(), // 创建时间
            //updateTime: new Date().toISOString() // 更新时间
          }
          const response6 = await axios.post(API_URL + 'diagnosis/antiacs/add', patAntiACSDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case '其它非心源性胸痛':
          const patOtherHeartDTO = {
            initialDiagnosisTime: this.chestPainData.otherFalsenCardiacChestPainDiagFalsesisTime, // 初步诊断时间
            otherNonCardiacChestPainType: this.chestPainData.otherFalsenCardiacChestPainType, // 其它非心源性胸痛类型
            treatmentMeasureOther: this.chestPainData.otherFalsenCardiacChestPainTreatment, // 处理措施
            patientStatusOther: this.chestPainData.otherFalsenCardiacChestPainDoctor, // 诊断医生
            patientId: this.patientId, // 患者ID
          }
          const response7 = await axios.post(API_URL + 'diagnosis/otherheart/add', patOtherHeartDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        case '待查':
          const patTodoDTO = {
            initialDiagnosisTime: this.chestPainData.pendingDiagFalsesisTime, // 初步诊断时间
            patientDispositionPending: this.chestPainData.pendingDoctor, // 诊断医生
            treatmentMeasuresPending: this.chestPainData.pendingTreatment, // 处理措施
            patientId: this.patientId, // 患者ID
          }
          const response8 = await axios.post(API_URL + 'diagnosis/todo/add', patTodoDTO,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken()
              },
            })
          break;

        default:
          console.error('未知的初步诊断类型');
          return;
      }

      if (this.chestPainData.reperfusionMethod === '直接PCI' || this.chestPainData.reperfusionMethod === '溶栓' || this.chestPainData.reperfusionMethod === '补救PCI'){
        const patCatheterDTO = {
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
          patientId: this.patientId,
          directPciDoctor:this.chestPainData.decidingDoctor,//决定医生
          directPciTime:this.chestPainData.interventionDecisionTime,//决定介入手术时间
          informedConsentSignTime:this.chestPainData.informedConsentSignatureTime, //签署知情同意时间
          thrombolysisConsentStartTime:this.chestPainData.informedConsentStartTime,//溶栓开始知情同意时间
          thrombolysisConsentSignTime:this.chestPainData.informedConsentSignature,//溶栓签署知情权
          salvagePciTime:this.chestPainData.interventionDecisionTime,//补救PCI决定介入手术时间
        };
        const response77 = await axios.post(API_URL + 'catheter/castemi/add', patCatheterDTO,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getToken()
            },
          })
      }
    },
    async outdiaAdd(){
      const patOutDTO = {
        diagnosis: this.outcomeData.dischargeDiagFalsesis,

        // 确诊时间
        diagnosisConfirmationTime: this.outcomeData.confirmedDate ? new Date(this.outcomeData.confirmedDate).toISOString() : null,

        // 院内新发心力衰竭
        isNewOnsetHeartFailureInHospital: this.outcomeData.newHeartFailure === "True",

        // 合并症
        complications: this.outcomeData.comorbidities,

        // 危险因素
        isHypertension: this.outcomeData.hypertension === "True",
        isHyperlipidemia: this.outcomeData.hyperlipidemia === "True",
        isDiabetes: this.outcomeData.diabetes === "True",
        isSmoking: this.outcomeData.smoking === "True",
        isObesity: this.outcomeData.obesity === "True",
        isEarlyOnsetCVDFamilyHistory: this.outcomeData.familyHistory === "True",

        // 合并疾病
        isCoronaryHeartDisease: this.outcomeData.coronaryHeartDisease === "True",
        isRevascularizationHistory: this.outcomeData.revascularizationHistory === "True",
        isAtrialFibrillation: this.outcomeData.af === "True",
        atrialFibrillationType: this.outcomeData.afType,
        isChronicHeartFailure: this.outcomeData.chronicHeartFailure === "True",
        isValvularHeartDisease: this.outcomeData.heartValveDisease === "True",
        isCerebrovascularDisease: this.outcomeData.cerebrovascularDisease === "True",
        cerebrovascularDiseaseType: this.outcomeData.cerebrovascularDiseaseType,
        isPeripheralArterialDisease: this.outcomeData.peripheralArteryDisease === "True",
        isAorticAneurysm: this.outcomeData.aorticAneurysm === "True",
        isCOPD: this.outcomeData.copd === "True",
        isChronicKidneyDisease: this.outcomeData.chronicKidneyDisease === "True",
        isAnemia: this.outcomeData.anemia === "True",
        isPepticUlcer: this.outcomeData.pepticUlcer === "True",
        isThyroidDysfunction: this.outcomeData.thyroidFunctionAbFalsermal === "True",

        // 检查结果
        is72hTroponinChecked: this.outcomeData.troponin72h === "True",
        troponinMaxValue72h: this.outcomeData.troponinMaxValue ? parseFloat(this.outcomeData.troponinMaxValue) : null,
        troponinType72h: this.outcomeData.troponin72h,

        isNatriureticPeptideChecked: this.outcomeData.bnp ? true : false,
        natriureticPeptideType: this.outcomeData.bnp,
        natriureticPeptideMaxValue: this.outcomeData.bnpMaxValue ? parseFloat(this.outcomeData.bnpMaxValue) : null,

        isTotalCholesterolChecked: this.outcomeData.tc === "True",
        totalCholesterolValue: this.outcomeData.tcValue ? parseFloat(this.outcomeData.tcValue) : null,

        isTriglycerideChecked: this.outcomeData.tg === "True",
        triglycerideValue: this.outcomeData.tgValue ? parseFloat(this.outcomeData.tgValue) : null,

        isHDLChecked: this.outcomeData.hdl === "True",
        hdlValue: this.outcomeData.hdlValue ? parseFloat(this.outcomeData.hdlValue) : null,

        isLDLChecked: this.outcomeData.ldl === "True",
        dlValue: this.outcomeData.ldlValue ? parseFloat(this.outcomeData.ldlValue) : null,

        isEchocardiogramChecked: this.outcomeData.echo === "True",
        isVentricularAneurysm: this.outcomeData.wallAneurysm === "True",
        isRegionalWallMotionAbnormality: this.outcomeData.wallMotionAbFalsermality === "True",

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
            'Authorization': getToken()
          },
        })
      console.log(response)
    },
    async outAdd(){
      const patOutInfoDTO = {
        // 住院天数
        hospitalizationDays: this.outcomeData.hospitalDays,

        // 总费用
        totalCost: this.outcomeData.totalCost,

        // 出院还是转归
        patientOutcome: this.outcomeData.dischargeStatus,

        // 出院相关信息
        dischargeTime: (this.outcomeData.dischargeStatus === '出院' && this.outcomeData.dischargeTime) ? new Date(this.outcomeData.dischargeTime).toISOString() : null,
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
        leaveHospitalTime: (this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.departureTime) ? new Date(this.outcomeData.departureTime).toISOString() : null,
        isNetworkHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.networkHospital === 'True' : false,
        transferHospitalName: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.networkHospital === 'True' ? this.outcomeData.networkHospitalName : null,
        isTransferPCI: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.transferPci === 'True' : false,
        isDirectToCatheterLab: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.directCathLab === 'True' : false,
        actualInterventionStartTime: (this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.directCathLab === 'True' && this.outcomeData.actualInterventionStartTime) ? new Date(this.outcomeData.actualInterventionStartTime).toISOString() : null,
        isTeleEcgTransmission: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.ecgTransmission === '传输心电图至协作单位' : false,
        ecgTransmissionTime: (this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' && this.outcomeData.ecgTransmissionTime) ? new Date(this.outcomeData.ecgTransmissionTime).toISOString() : null,
        ecgTransmissionMethod: this.outcomeData.dischargeStatus === '转送其他医院' && this.outcomeData.ecgTransmission === '传输心电图至协作单位' ? this.outcomeData.ecgTransmissionMethod : null,

        // 转送其他科室相关信息
        transferDepartmentTime: (this.outcomeData.dischargeStatus === '转送其它科室' && this.outcomeData.transferTime) ? new Date(this.outcomeData.transferTime).toISOString() : null,
        acceptingDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.admittingDepartment : null,
        transferDepartmentReason: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.transferReason : null,

        // 死亡相关信息
        deathTime: (this.outcomeData.dischargeStatus === '死亡' && this.outcomeData.deathTime) ? new Date(this.outcomeData.deathTime).toISOString() : null,
        isCardiacCauseOfDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathCause === '心源性' : false,
        patientConditionDescriptionDeath: this.outcomeData.dischargeStatus === '死亡' ? this.outcomeData.deathDescription : null,

        // 其他备注
        patientConditionDescriptionTransferDepartment: this.outcomeData.dischargeStatus === '转送其它科室' ? this.outcomeData.remarks : null,
        patientConditionDescriptionTransferHospital: this.outcomeData.dischargeStatus === '转送其他医院' ? this.outcomeData.remarks : null,
        remarks: this.outcomeData.remarks,
        patientId: this.patientId

      };
      console.log("patOutInfoDTO")
      console.log(patOutInfoDTO)
      const response = await axios.post(API_URL + 'outhospital/out/add', patOutInfoDTO,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          },
        })
      console.log(response)
    },



async handleSubmit() {
      // 基于红星 + 可见性的动态必填校验
      if (!this.validateRequiredByStars()) { return; }

      // 在提交前进行表单验证
      if (!this.validateFormFields()) {
        return; // 验证失败，停止提交
      }

      // 逐个模块提交，失败立即提示并中止
      const tasks = [
        { fn: this.patInfoAdd, label: '基本信息' },
        { fn: this.patEmInfoAdd, label: '急救信息' },
        { fn: this.patConInfoAdd, label: '病情信息' },
        { fn: this.patAdInfoAdd, label: '入院信息' },
        { fn: this.patViInfoAdd, label: '生命体征' },
        { fn: this.patEcgInfoAdd, label: '心电图信息' },
        { fn: this.labAdd, label: '化验结果' },
        { fn: this.heartAdd, label: '心脏检查' },
        { fn: this.outdiaAdd, label: '出院诊断' },
        { fn: this.outAdd, label: '出院小结' },
      ];

      for (const task of tasks) {
        try {
          // 支持部分任务需要参数时写成 () => this.xxx(args)
          await task.fn();
        } catch (e) {
          console.error(`${task.label} 提交失败`, e);
          this.showMessage(`${task.label} 提交失败，请检查该部分数据`, 'error');
          return; // 出错中止后续提交
        }
      }

      this.showMessage('全部提交成功', 'success');
    }

,

validateFormFields() {
      let isValid = true;

      // 1) 必填校验
      const requiredFields = [
        { field: 'name', label: '姓名' },
        { field: 'age', label: '年龄' },
        { field: 'gender', label: '性别' },
        { field: 'phone', label: '联系电话' },
        // 出生日期、身高、体重已改为非必填
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

      if (!this.validateEcgFiles()) {
        return false;
      }

      return isValid;
    }
,
    resetForm() {
      this.currentModule= 'emergency', // 默认显示急救模块
        this.formData= {
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
      },
        this.emergencyData= {
        inpatientId: '',
          outpatientId: '',
          onsetTime: '',
          address: '',
          detailedAddress: '',
          insuranceType: '',
          insuranceNumber: '',
          isCriticalIllnessInsurance: '',
          symptoms: [],
          source: '',
      },
        this.chestPainData= {
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
          remarks: ''
      },
      this.outcomeData= {
        dischargeDiagFalsesis: '',
          confirmedDate: '',
          covid: '',
          antidiabetic: '',
          oralAnticoagulants: '',
          lipidRegulating: '',
          hospitalDays: '',
          totalCost: '',
          dischargeStatus: '',
          remarks: ''
      }
    },
    addEcg() {
      this.chestPainData.ecgs.push({ time: '', file: null, fileName: '', filePreview: null, filePath: '' });
      console.log("添加心电图");
    },
    removeEcg(index) {
      this.chestPainData.ecgs.splice(index, 1);
      console.log("删除心电图");
    },
    handleFileUpload(event, index) {
      const file = event.target.files[0];
      if (file) {
        this.$set(this.chestPainData.ecgs[index], 'file', file);
        this.$set(this.chestPainData.ecgs[index], 'fileName', file.name);
        this.$set(this.chestPainData.ecgs[index], 'filePath', '');

        // 检查是否为图片文件
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.$set(this.chestPainData.ecgs[index], 'filePreview', e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          this.$set(this.chestPainData.ecgs[index], 'filePreview', null);
        }
      }
    },
    validateEcgFiles() {
      if (this.chestPainData.ecg !== 'True') return true;
      const ecgs = this.chestPainData.ecgs || [];
      if (!ecgs.length) {
        this.showMessage('请至少添加一条心电图记录', 'error');
        this.currentModule = 'chestPain';
        return false;
      }
      for (let i = 0; i < ecgs.length; i++) {
        const ecg = ecgs[i];
        if (!ecg.time) {
          this.showMessage(`第 ${i + 1} 条心电图时间未填写`, 'error');
          this.currentModule = 'chestPain';
          return false;
        }
        if (!ecg.file && !ecg.filePath) {
          this.showMessage(`第 ${i + 1} 条心电图文件未上传`, 'error');
          this.currentModule = 'chestPain';
          return false;
        }
      }
      return true;
    },
    async uploadEcgFiles() {
      if (this.chestPainData.ecg !== 'True') return;
      const ecgs = this.chestPainData.ecgs || [];
      for (let i = 0; i < ecgs.length; i++) {
        const ecg = ecgs[i];
        if (!ecg || ecg.filePath || !ecg.file) continue;

        // 第一步：上传图片，获取文件路径
        const formData = new FormData();
        formData.append('file', ecg.file);
        const uploadRes = await axios.post(API_URL + 'pic/ecgPicUrl/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': getToken()
          }
        });
        const data = uploadRes && uploadRes.data && uploadRes.data.data;
        const filePath = (typeof data === 'string' ? data : (data && (data.url || data.filePath || data.path))) || '';
        if (!filePath) {
          throw new Error(`第 ${i + 1} 条心电图上传成功但未返回文件路径`);
        }
        this.$set(ecg, 'filePath', filePath);

        // 第二步：把路径、患者ID、时间写入数据库
        const ecgAddDTO = {
          patientId: this.patientId,
          filePath: filePath,
          ecgPerformed: true,
          ecgDiagnosisTime: ecg.time || '',
          checkTime: this.chestPainData.ecgDiagFalsesisTime || '',
          ecgDiagnosis: '',
          remoteEcgTransmission: this.chestPainData.ecgRemote === 'True',
          remoteEcgTime: this.chestPainData.ecgRemoteTime || '',
          transmissionMethod: this.chestPainData.transmissionMethod ? parseInt(this.chestPainData.transmissionMethod, 10) : 0,
        };
        await axios.post(API_URL + 'pic/ecgPicUrl/add', ecgAddDTO, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
          }
        });
      }
    },
    addTroponin() {
      this.chestPainData.troponins.push({ type: '', unit: '', result: '', bloodDrawTime: '', reportTime: '' });
    },
    removeTroponin(index) {
      this.chestPainData.troponins.splice(index, 1);
    }
  }
};
</script>

<style scoped>
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
    padding: 5px 0;
    box-sizing: border-box;
  }

  .ECG {
    width: 30% !important;
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

.form-navigation button:Falset(.active):hover {
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
    flex-wrap: wrap;
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

/* ========= 心电图记录容器样式 ========= */
.ecg-record-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.ecg-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
}

.ecg-record-title {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.delete-record-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.delete-record-btn:hover {
  background-color: #ff3742;
}

.ecg-record-content {
  padding: 16px;
}

.file-preview-container {
  margin-top: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.file-info {
  margin-bottom: 8px;
}

.file-name {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.image-preview {
  text-align: center;
}

.preview-thumbnail {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.file-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.file-type-icon {
  font-size: 20px;
}

.file-type-text {
  font-size: 13px;
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
/* ===== 智能识别浮动按钮 & 弹窗 ===== */
.form-container { position: relative; }

.ocr-float-btn {
  position: absolute;
  top: 12px;
  right: 20px;
  background: #409eff;
  color: #fff;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  z-index: 100;
  user-select: none;
  box-shadow: 0 2px 8px rgba(64,158,255,0.3);
}
.ocr-float-btn:hover { background: #66b1ff; }

.ocr-dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000;
}
.ocr-dialog {
  background: #fff;
  border-radius: 10px;
  width: min(980px, calc(100vw - 40px));
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0,0,0,.2);
}
.ocr-dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600; font-size: 15px;
}
.ocr-close-btn {
  background: transparent; border: none;
  font-size: 16px; cursor: pointer; color: #666;
  padding: 0 4px;
}
.ocr-close-btn:hover { color: #333; }
.ocr-dialog-body { padding: 16px; overflow: auto; flex: 1; background: #f5f7fa; }
.ocr-panel { display: grid; grid-template-columns: 320px 1fr; gap: 16px; align-items: start; }
.ocr-upload-area {
  min-height: 240px;
  border: 2px dashed #d9d9d9;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .2s;
}
.ocr-upload-area:hover { border-color: #409eff; }
.ocr-file-input { display: none; }
.ocr-upload-placeholder { text-align: center; color: #606266; padding: 20px; }
.ocr-upload-icon { font-size: 40px; margin-bottom: 8px; }
.ocr-upload-placeholder p { margin: 6px 0 0; color: #a8abb2; font-size: 12px; }
.ocr-preview-img { width: 100%; height: 240px; object-fit: contain; background: #fff; }
.ocr-preview-panel {
  min-height: 240px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 12px;
}
.ocr-dialog-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
.ocr-dialog-footer button {
  padding: 6px 16px; border-radius: 6px; cursor: pointer;
  border: 1px solid #409eff; background: #409eff; color: #fff;
}
.ocr-dialog-footer button:last-child {
  background: #fff; color: #333; border-color: #ddd;
}
.ocr-dialog-footer button:disabled { opacity: .5; cursor: not-allowed; }
.ocr-loading { color: #888; margin-top: 10px; }
.ocr-progress { height: 6px; background: #ebeef5; border-radius: 999px; margin-top: 10px; overflow: hidden; }
.ocr-progress span { display: block; height: 100%; background: #409eff; transition: width .2s; }
.ocr-error { color: red; margin-top: 10px; }
.ocr-result { margin-top: 12px; }
.ocr-result textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  line-height: 1.7;
  resize: vertical;
}
.ocr-parsed {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px;
}
.ocr-parsed-title { font-weight: 600; color: #303133; margin-bottom: 12px; }
.ocr-field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.ocr-field-grid label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #606266;
  font-size: 12px;
}
.ocr-field-grid input {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 7px 8px;
  font-size: 13px;
}
.ocr-extra {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}
.ocr-extra span {
  display: inline-block;
  margin: 4px 6px 0 0;
  padding: 3px 8px;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 999px;
}
@media (max-width: 820px) {
  .ocr-panel { grid-template-columns: 1fr; }
}
</style>

