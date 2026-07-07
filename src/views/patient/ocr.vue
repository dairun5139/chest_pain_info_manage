<template>
  <div class="ocr-page">
    <div class="ocr-header">
      <h2 class="page-title">
        <i class="el-icon-document" style="margin-right:8px;color:#409eff" />智能识别 · 快速注册
      </h2>
      <p class="page-subtitle">上传身份证 / 就诊卡 / 病历封面等图片，自动提取信息并填入病人注册表单</p>
    </div>

    <div class="ocr-body">
      <!-- 左侧：上传区 + 预览 + 解析结果 -->
      <div class="left-panel">
        <el-upload
          action=""
          :show-file-list="false"
          :before-upload="handleUpload"
          :disabled="loading"
          drag
          class="upload-dragger"
        >
          <div v-if="!imgUrl" class="upload-placeholder">
            <i class="el-icon-upload" style="font-size:48px;color:#c0c4cc" />
            <div class="upload-text">将图片拖到此处，或 <em>点击上传</em></div>
            <div class="upload-hint">支持 JPG / PNG / BMP，单张不超过 10MB</div>
          </div>
          <div v-else class="preview-wrapper">
            <img :src="imgUrl" class="preview-img" />
            <div class="preview-mask">
              <span><i class="el-icon-refresh-right" /> 更换图片</span>
            </div>
          </div>
        </el-upload>

        <!-- 状态条 -->
        <transition name="fade">
          <div v-if="status" class="status-bar" :class="statusClass">
            <i :class="statusIcon" style="margin-right:6px" />
            <span>{{ statusText }}</span>
            <el-progress
              v-if="loading"
              :percentage="progress"
              :show-text="false"
              style="flex:1;margin-left:12px"
            />
          </div>
        </transition>

        <!-- 原始识别文本 -->
        <div class="raw-result-panel" v-if="ocrText">
          <div class="raw-result-header">
            <span>原始识别文本</span>
            <div>
              <el-button size="mini" icon="el-icon-copy-document" @click="copyText">复制</el-button>
              <el-button size="mini" icon="el-icon-delete" @click="clearResult">清空</el-button>
            </div>
          </div>
          <el-input
            v-model="ocrText"
            type="textarea"
            :rows="8"
            resize="none"
            class="result-textarea"
          />
          <div class="result-footer" v-if="wordCount > 0">
            共识别 <strong>{{ wordCount }}</strong> 行 / <strong>{{ charCount }}</strong> 个字符
          </div>
        </div>
      </div>

      <!-- 右侧：解析字段 + 注册表单 -->
      <div class="right-panel">
        <div class="parsed-header">
          <span class="parsed-title">
            <i class="el-icon-s-check" style="color:#67c23a;margin-right:6px" />
            自动解析字段
          </span>
          <div class="parsed-actions" v-if="parsedData && hasAnyParsed">
            <el-button type="primary" size="small" icon="el-icon-edit" @click="goToRegister">
              填入注册表单并提交
            </el-button>
          </div>
        </div>

        <div v-if="!hasAnyParsed && !loading" class="parsed-empty">
          <i class="el-icon-s-opportunity" style="font-size:40px;color:#dcdfe6;display:block;margin-bottom:12px" />
          上传含有患者信息的图片后，系统将自动提取并展示可填充的字段
        </div>

        <div v-else-if="loading" class="parsed-empty">
          <i class="el-icon-loading" style="font-size:30px;color:#409eff;display:block;margin-bottom:10px" />
          正在识别并解析患者信息...
        </div>

        <div v-else class="parsed-fields">
          <!-- 基本信息 -->
          <div class="field-group">
            <div class="field-group-title">基本信息</div>
            <div class="field-row">
              <div class="field-item" v-if="parsedData.name !== undefined">
                <label>姓名</label>
                <el-input v-model="parsedData.name" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item" v-if="parsedData.gender !== undefined">
                <label>性别</label>
                <el-select v-model="parsedData.gender" size="small" placeholder="请选择">
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                </el-select>
              </div>
              <div class="field-item" v-if="parsedData.age !== undefined">
                <label>年龄</label>
                <el-input v-model="parsedData.age" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item" v-if="parsedData.dob !== undefined">
                <label>出生日期</label>
                <el-input v-model="parsedData.dob" size="small" placeholder="YYYY-MM-DD" clearable />
              </div>
            </div>
            <div class="field-row">
              <div class="field-item" v-if="parsedData.idNumber !== undefined">
                <label>身份证号</label>
                <el-input v-model="parsedData.idNumber" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item" v-if="parsedData.phone !== undefined">
                <label>联系电话</label>
                <el-input v-model="parsedData.phone" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item" v-if="parsedData.ethnicity !== undefined">
                <label>民族</label>
                <el-input v-model="parsedData.ethnicity" size="small" placeholder="未识别" clearable />
              </div>
            </div>
          </div>

          <!-- 地址信息 -->
          <div class="field-group" v-if="parsedData.address !== undefined || parsedData.detailedAddress !== undefined">
            <div class="field-group-title">地址信息</div>
            <div class="field-row">
              <div class="field-item wide" v-if="parsedData.address !== undefined">
                <label>省市区</label>
                <el-input v-model="parsedData.address" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item wide" v-if="parsedData.detailedAddress !== undefined">
                <label>详细地址</label>
                <el-input v-model="parsedData.detailedAddress" size="small" placeholder="未识别" clearable />
              </div>
            </div>
          </div>

          <!-- 就诊信息 -->
          <div class="field-group" v-if="parsedData.inpatientId !== undefined || parsedData.outpatientId !== undefined">
            <div class="field-group-title">就诊信息</div>
            <div class="field-row">
              <div class="field-item" v-if="parsedData.inpatientId !== undefined">
                <label>住院ID</label>
                <el-input v-model="parsedData.inpatientId" size="small" placeholder="未识别" clearable />
              </div>
              <div class="field-item" v-if="parsedData.outpatientId !== undefined">
                <label>门诊ID</label>
                <el-input v-model="parsedData.outpatientId" size="small" placeholder="未识别" clearable />
              </div>
            </div>
          </div>

          <!-- 无法匹配的额外文本 -->
          <div class="field-group" v-if="extraLines.length > 0">
            <div class="field-group-title" style="color:#e6a23c">
              <i class="el-icon-warning-outline" style="margin-right:4px" />
              未能自动匹配的内容（可手动参考）
            </div>
            <div class="extra-lines">
              <span v-for="(line, i) in extraLines" :key="i" class="extra-tag">{{ line }}</span>
            </div>
          </div>

          <div class="submit-bar">
            <el-alert
              title="以上字段已自动解析，请确认内容后点击「填入注册表单并提交」"
              type="success"
              :closable="false"
              show-icon
              style="margin-bottom:12px"
            />
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="goToRegister"
              :disabled="!hasAnyParsed"
            >
              填入注册表单并提交
            </el-button>
            <el-button icon="el-icon-refresh" @click="clearResult">重新识别</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendBaiduAIRequest } from '@/api/constants'

export default {
  name: 'OcrPage',
  data() {
    return {
      loading: false,
      status: '',
      imgUrl: '',
      ocrText: '',
      progress: 0,
      progressTimer: null,
      parsedData: {},
      extraLines: []
    }
  },
  computed: {
    statusClass() {
      return {
        'status-loading': this.status === 'loading',
        'status-done': this.status === 'done',
        'status-error': this.status === 'error'
      }
    },
    statusIcon() {
      const map = { loading: 'el-icon-loading', done: 'el-icon-circle-check', error: 'el-icon-circle-close' }
      return map[this.status] || ''
    },
    statusText() {
      const map = { loading: '正在识别，请稍候...', done: '识别完成，已自动解析字段', error: '识别失败，请重试' }
      return map[this.status] || ''
    },
    wordCount() {
      return this.ocrText ? this.ocrText.split('\n').filter(l => l.trim()).length : 0
    },
    charCount() {
      return this.ocrText ? this.ocrText.replace(/\s/g, '').length : 0
    },
    hasAnyParsed() {
      return Object.keys(this.parsedData).length > 0
    }
  },
  beforeDestroy() {
    if (this.progressTimer) clearInterval(this.progressTimer)
  },
  methods: {
    async handleUpload(file) {
      this.loading = true
      this.status = 'loading'
      this.ocrText = ''
      this.parsedData = {}
      this.extraLines = []
      this.progress = 0

      this.progressTimer = setInterval(() => {
        if (this.progress < 85) this.progress += Math.random() * 12
      }, 400)

      try {
        const imageBase64 = await this.fileToBase64(file)
        this.imgUrl = imageBase64
        const base64Data = imageBase64.split(',')[1]
        const res = await sendBaiduAIRequest(base64Data)

        this.progress = 100
        this.status = 'done'

        if (res.words_result && res.words_result.length > 0) {
          const lines = res.words_result.map(item => item.words)
          this.ocrText = lines.join('\n')
          this.parseOcrLines(lines)
        } else {
          this.ocrText = '未识别到文字'
        }
      } catch (err) {
        this.status = 'error'
        this.ocrText = '识别失败：' + (err.message || err)
      } finally {
        clearInterval(this.progressTimer)
        this.loading = false
        setTimeout(() => { if (this.status !== 'error') this.status = '' }, 4000)
      }
      return false
    },

    /**
     * 将OCR识别的文本行智能解析为注册表单字段
     */
    parseOcrLines(lines) {
      const parsed = {}
      const unmatched = []

      // 身份证号正则（18位）
      const idCardReg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i
      // 手机号正则
      const phoneReg = /^1[3-9]\d{9}$/
      // 出生日期各种格式
      const dobReg = /(\d{4})[年\-./](\d{1,2})[月\-./](\d{1,2})日?/
      // 年龄
      const ageReg = /^(\d{1,3})\s*岁$/

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i].trim()
        if (!raw) continue

        // ---- 身份证号直接匹配 ----
        if (idCardReg.test(raw.replace(/\s/g, ''))) {
          parsed.idNumber = raw.replace(/\s/g, '')
          parsed.idType = '1'
          // 从身份证号提取生日
          const id = parsed.idNumber
          const y = id.substring(6, 10)
          const m = id.substring(10, 12)
          const d = id.substring(12, 14)
          parsed.dob = `${y}-${m}-${d}`
          // 从身份证推算年龄
          const birthYear = parseInt(y)
          const currentYear = new Date().getFullYear()
          parsed.age = String(currentYear - birthYear)
          // 性别（倒数第2位奇男偶女）
          if (!parsed.gender) {
            parsed.gender = parseInt(id[16]) % 2 === 1 ? '男' : '女'
          }
          continue
        }

        // ---- 手机号 ----
        const phoneMatch = raw.replace(/\s/g, '').match(phoneReg)
        if (phoneMatch) {
          parsed.phone = phoneMatch[0]
          continue
        }

        // ---- 行内扫描：同一行可能含多个字段（OCR常把多字段拼一行）----
        if (!parsed.inpatientId) {
          const m = raw.match(/住院号[：:\s]*([A-Za-z0-9]+)/)
          if (m) parsed.inpatientId = m[1]
        }
        if (!parsed.outpatientId) {
          const m = raw.match(/门诊号[：:\s]*([A-Za-z0-9]+)/)
          if (m) parsed.outpatientId = m[1]
        }
        if (!parsed.onsetTime) {
          const m = raw.match(/发病时间[：:\s]*([\d\-\/年月日\s:]{5,20})/)
          if (m) parsed.onsetTime = m[1].trim()
        }
        if (!parsed.source) {
          if (/120|急救车|救护车/.test(raw)) parsed.source = '1'
          else if (/转院|转诊/.test(raw)) parsed.source = '2'
          else if (/自行来院|自行就诊/.test(raw)) parsed.source = '3'
          else if (/院内发病/.test(raw)) parsed.source = '4'
        }
        if (!parsed.insuranceType) {
          const m = raw.match(/医保类型[：:\s]*([^\s]{2,10})/)
          if (m) parsed.insuranceType = m[1]
        }
        if (!parsed.insuranceNumber) {
          const m = raw.match(/医保编号[：:\s]*([A-Za-z0-9]+)/)
          if (m) parsed.insuranceNumber = m[1]
        }
        if (parsed.isCriticalIllnessInsurance === undefined) {
          const m = raw.match(/大病医保[：:\s]*(是|否|有|无)/)
          if (m) parsed.isCriticalIllnessInsurance = /是|有/.test(m[1]) ? '1' : '0'
        }
        if (!parsed.occupation) {
          const m = raw.match(/职业[：:\s]*([^\s]{2,6})/)
          if (m && !/住院|门诊|医院/.test(m[1])) parsed.occupation = m[1]
        }
        if (!parsed.education) {
          const m = raw.match(/文化程度[：:\s]*([^\s]{2,6})/)
          if (m) {
            const ev = m[1]
            if (/文盲/.test(ev)) parsed.education = '1'
            else if (/小学/.test(ev)) parsed.education = '2'
            else if (/初中/.test(ev)) parsed.education = '3'
            else if (/高中|中专|职高/.test(ev)) parsed.education = '4'
            else if (/大专|专科/.test(ev)) parsed.education = '5'
            else if (/本科|大学/.test(ev)) parsed.education = '6'
            else if (/硕士|研究生/.test(ev)) parsed.education = '7'
            else if (/博士/.test(ev)) parsed.education = '8'
          }
        }
        if (!parsed.maritalStatus) {
          const m = raw.match(/婚姻状况[：:\s]*(已婚|未婚|离婚|丧偶)/)
          if (m) {
            if (/未婚/.test(m[1])) parsed.maritalStatus = '1'
            else if (/已婚/.test(m[1])) parsed.maritalStatus = '2'
            else if (/丧偶/.test(m[1])) parsed.maritalStatus = '3'
            else if (/离/.test(m[1])) parsed.maritalStatus = '4'
          }
        }
        if (!parsed.address) {
          const m = raw.match(/发病地址[：:\s]*(.{2,20})/) || raw.match(/省市区?[：:\s]*(.{2,15})/)
          if (m) parsed.address = m[1].trim()
        }
        if (!parsed.detailedAddress) {
          const m = raw.match(/详细地址[：:\s]*(.{2,30})/)
          if (m) parsed.detailedAddress = m[1].trim()
        }

        // ---- 含冒号/冒号的键值对，如 "姓名：张三" ----
        const kvMatch = raw.match(/^(.{1,8})[：:]\s*(.+)$/)
        if (kvMatch) {
          const key = kvMatch[1].replace(/\s/g, '')
          const val = kvMatch[2].trim()

          if (/姓名|名字|名称/.test(key)) { parsed.name = val; continue }
          if (/性别/.test(key)) {
            if (/男/.test(val)) parsed.gender = '男'
            else if (/女/.test(val)) parsed.gender = '女'
            continue
          }
          if (/年龄|岁/.test(key)) { parsed.age = val.replace(/岁|Years|years/g, '').trim(); continue }
          if (/出生|生日|birthday/i.test(key)) {
            const d = val.match(dobReg)
            if (d) parsed.dob = `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}`
            else parsed.dob = val
            continue
          }
          if (/民族/.test(key)) { parsed.ethnicity = val; continue }
          if (/联系电话|手机|电话|Tel|tel/i.test(key)) {
            const p = val.replace(/\s/g, '').match(phoneReg)
            parsed.phone = p ? p[0] : val
            continue
          }
          if (/住院号|住院ID|住院编号/.test(key)) { parsed.inpatientId = val; continue }
          if (/门诊号|门诊ID|门诊编号/.test(key)) { parsed.outpatientId = val; continue }
          if (/身份证|证件号/.test(key)) { parsed.idNumber = val.replace(/\s/g, ''); parsed.idType = '1'; continue }
          if (/护照/.test(key)) { parsed.idNumber = val; parsed.idType = '2'; continue }
          if (/省市区|发病地址|地址/.test(key)) { parsed.address = val; continue }
          if (/详细地址|街道|具体地址/.test(key)) { parsed.detailedAddress = val; continue }
          if (/身高/.test(key)) { parsed.height = val.replace(/cm|CM|厘米/g, '').trim(); continue }
          if (/体重/.test(key)) { parsed.weight = val.replace(/kg|KG|公斤/g, '').trim(); continue }
          if (/婚姻/.test(key)) {
            if (/未婚/.test(val)) parsed.maritalStatus = '1'
            else if (/已婚/.test(val)) parsed.maritalStatus = '2'
            else if (/丧偶/.test(val)) parsed.maritalStatus = '3'
            else if (/离/.test(val)) parsed.maritalStatus = '4'
            continue
          }

          // ---- 职业 ----
          if (/职业|工作/.test(key)) { parsed.occupation = val; continue }

          // ---- 文化程度 ----
          if (/文化|学历|教育/.test(key)) {
            if (/文盲|不识字/.test(val)) parsed.education = '1'
            else if (/小学/.test(val)) parsed.education = '2'
            else if (/初中/.test(val)) parsed.education = '3'
            else if (/高中|中专|职高/.test(val)) parsed.education = '4'
            else if (/大专|专科/.test(val)) parsed.education = '5'
            else if (/本科|大学/.test(val)) parsed.education = '6'
            else if (/硕士|研究生/.test(val)) parsed.education = '7'
            else if (/博士/.test(val)) parsed.education = '8'
            else parsed.education = val
            continue
          }

          // ---- 发病时间 ----
          if (/发病|发作|起病|症状出现/.test(key)) { parsed.onsetTime = val; continue }

          // ---- 医保类型 ----
          if (/医保类型|保险类型|险种/.test(key)) { parsed.insuranceType = val; continue }

          // ---- 医保编号 ----
          if (/医保编号|医保号|社保号|保险编号/.test(key)) { parsed.insuranceNumber = val; continue }

          // ---- 大病医保 ----
          if (/大病/.test(key)) {
            if (/是|有/.test(val)) parsed.isCriticalIllnessInsurance = '1'
            else if (/否|无/.test(val)) parsed.isCriticalIllnessInsurance = '0'
            continue
          }

          // ---- 来院方式 ----
          if (/来院|来诊|入院方式|转运/.test(key)) {
            if (/120|急救车/.test(val)) parsed.source = '1'
            else if (/自行|步行|自驾/.test(val)) parsed.source = '3'
            else if (/转院|转诊/.test(val)) parsed.source = '2'
            else if (/院内/.test(val)) parsed.source = '4'
            else parsed.source = val
            continue
          }

          // ---- 主诉/症状（尝试匹配胸痛相关） ----
          if (/主诉|症状|主要症状/.test(key)) { parsed.chiefComplaint = val; continue }

          // 无法分类的键值对也当 unmatched
          unmatched.push(raw)
          continue
        }

        // ---- 独立行：纯姓名（2-4个汉字，排除常见词） ----
        if (/^[\u4e00-\u9fa5]{2,4}$/.test(raw) && !parsed.name) {
          const excludeWords = /汉族|满族|回族|壮族|男性|女性|科室|住院|门诊|医院|出院|入院|姓名/
          if (!excludeWords.test(raw)) {
            parsed.name = raw
            continue
          }
        }

        // ---- 独立出现的民族关键词 ----
        if (/族$/.test(raw) && raw.length <= 4) {
          parsed.ethnicity = raw
          continue
        }

        // ---- 独立出现的年龄 ----
        const ageMatch = raw.match(ageReg)
        if (ageMatch && !parsed.age) {
          parsed.age = ageMatch[1]
          continue
        }

        // ---- 独立出现的性别 ----
        if (/^男$|^女$/.test(raw) && !parsed.gender) {
          parsed.gender = raw
          continue
        }

        // ---- 独立行：来院方式关键词 ----
        if (!parsed.source) {
          if (/120|急救车|救护车/.test(raw)) { parsed.source = '1'; continue }
          if (/转院|转诊/.test(raw)) { parsed.source = '2'; continue }
          if (/自行来院|自行就诊|步行|自驾/.test(raw)) { parsed.source = '3'; continue }
          if (/院内发病/.test(raw)) { parsed.source = '4'; continue }
        }

        // ---- 独立行：症状关键词（多选，累加到数组）----
        const symptomMap = {
          '持续性胸痛': '1', '间歇性胸痛': '2', '症状已缓解': '3',
          '呼吸困难': '4', '晕厥': '5', '咳嗽': '6', '咯血': '7',
          '合并出血': '8', '合并心衰': '9', '合并恶性心率失常': '10',
          '白汗': '11', '大汗淋漓': '11', '心慌': '12', '心悸': '12',
          '烦躁不安': '13', '濒死感': '14', '乏力': '15', '气喘': '16'
        }
        let symptomHit = false
        for (const [keyword, code] of Object.entries(symptomMap)) {
          if (raw.includes(keyword)) {
            if (!parsed.symptoms) parsed.symptoms = []
            if (!parsed.symptoms.includes(code)) parsed.symptoms.push(code)
            symptomHit = true
          }
        }
        if (symptomHit) continue

        // ---- 出生日期独立行 ----
        const dobMatch = raw.match(dobReg)
        if (dobMatch && !parsed.dob) {
          parsed.dob = `${dobMatch[1]}-${dobMatch[2].padStart(2, '0')}-${dobMatch[3].padStart(2, '0')}`
          if (!parsed.age) {
            parsed.age = String(new Date().getFullYear() - parseInt(dobMatch[1]))
          }
          continue
        }

        // 其余无法识别的行归入 extra
        if (raw.length >= 2) {
          unmatched.push(raw)
        }
      }

      this.parsedData = parsed
      this.extraLines = unmatched.slice(0, 10) // 最多展示10条未匹配行
    },

    /**
     * 跳转到病人注册页面，并通过 sessionStorage 传递解析好的数据
     */
    goToRegister() {
      if (!this.hasAnyParsed) {
        this.$message.warning('暂无可填充的解析数据')
        return
      }
      // 将解析数据写入 sessionStorage，供 submit_info.vue 读取
      sessionStorage.setItem('ocr_prefill_data', JSON.stringify(this.parsedData))
      sessionStorage.setItem('ocr_prefill_ts', String(Date.now()))
      this.$message.success('正在跳转到注册表单...')
      this.$router.push({ name: 'ChestPainSubmit' })
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },

    copyText() {
      navigator.clipboard.writeText(this.ocrText).then(() => {
        this.$message({ message: '已复制到剪贴板', type: 'success', duration: 1500 })
      }).catch(() => {
        const el = document.createElement('textarea')
        el.value = this.ocrText
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        this.$message({ message: '已复制', type: 'success', duration: 1500 })
      })
    },

    clearResult() {
      this.ocrText = ''
      this.status = ''
      this.parsedData = {}
      this.extraLines = []
      this.imgUrl = ''
    }
  }
}
</script>

<style scoped>
.ocr-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
  box-sizing: border-box;
}
.ocr-header { margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #303133; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #909399; margin: 0; }

.ocr-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 左侧 */
.left-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-dragger { width: 100%; }
.upload-dragger :deep(.el-upload) { width: 100%; }
.upload-dragger :deep(.el-upload-dragger) {
  width: 100%;
  height: 240px;
  border-radius: 10px;
  border: 2px dashed #d9d9d9;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color .2s;
  padding: 0;
  overflow: hidden;
}
.upload-dragger :deep(.el-upload-dragger:hover) { border-color: #409eff; }

.upload-placeholder { text-align: center; padding: 20px; }
.upload-text { font-size: 15px; color: #606266; margin: 10px 0 6px; }
.upload-text em { color: #409eff; font-style: normal; }
.upload-hint { font-size: 12px; color: #c0c4cc; }

.preview-wrapper { width: 100%; height: 240px; position: relative; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: contain; display: block; }
.preview-mask {
  position: absolute; inset: 0; background: rgba(0,0,0,.45);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 15px; opacity: 0; transition: opacity .2s;
}
.preview-wrapper:hover .preview-mask { opacity: 1; }

.status-bar {
  display: flex; align-items: center; padding: 10px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 500;
}
.status-loading { background: #ecf5ff; color: #409eff; }
.status-done    { background: #f0f9eb; color: #67c23a; }
.status-error   { background: #fef0f0; color: #f56c6c; }

.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.raw-result-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}
.raw-result-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid #ebeef5;
  font-size: 13px; font-weight: 600; color: #606266;
}
.result-textarea :deep(.el-textarea__inner) {
  border: none; border-radius: 0; padding: 12px;
  font-size: 13px; line-height: 1.7; color: #303133;
  resize: none;
}
.result-textarea :deep(.el-textarea__inner:focus) { box-shadow: none; }
.result-footer {
  padding: 8px 14px; border-top: 1px solid #ebeef5;
  font-size: 12px; color: #909399; text-align: right;
}

/* 右侧 */
.right-panel {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.parsed-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #ebeef5;
}
.parsed-title { font-size: 15px; font-weight: 600; color: #303133; }

.parsed-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #c0c4cc; font-size: 14px; padding: 60px 40px;
}

.parsed-fields {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 20px;
  padding: 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.field-group-title {
  font-size: 13px; font-weight: 600; color: #606266;
  margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px dashed #e8e8e8;
}
.field-row {
  display: flex; flex-wrap: wrap; gap: 12px;
}
.field-item {
  display: flex; flex-direction: column; gap: 4px;
  min-width: 160px; flex: 1;
}
.field-item.wide { min-width: 280px; flex: 2; }
.field-item label {
  font-size: 12px; color: #909399; font-weight: 500;
}
.field-item .el-input, .field-item .el-select {
  width: 100%;
}

.extra-lines {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.extra-tag {
  background: #fff8e6; color: #e6a23c;
  border: 1px solid #f5dfa0;
  border-radius: 4px; padding: 3px 8px;
  font-size: 13px;
}

.submit-bar {
  margin-top: 8px; padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
