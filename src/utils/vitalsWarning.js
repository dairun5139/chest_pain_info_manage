// vitalsWarning.js
// 胸痛中心预警判断逻辑
//
// 预警三项指标（必须同时满足才触发预警，三者为"且"关系，不是"或"关系）：
//   1) 收缩压(SBP) < 90 mmHg
//   2) 持续性胸闷/胸痛（病情状况选择"持续性胸闷/胸痛"）
//   3) 心率 > 110 次/分
//
// 注：原来的预警逻辑只看 SpO2，现已废弃，统一改为上面三项。

/**
 * 从血压字符串中提取收缩压(SBP)。
 * 兼容 "120/80"、"120 / 80 mmHg"、纯数字 "120" 等写法。
 */
function extractSystolicBP(patient = {}) {
  const raw = patient.bloodPressure ??
    patient.BloodPressure ??
    patient.sbp ??
    patient.systolicBloodPressure ??
    patient.systolicPressure

  if (raw === null || raw === undefined || raw === '') return null

  const str = String(raw).trim()
  const slashMatch = str.match(/(\d+(?:\.\d+)?)\s*[/／]\s*\d+(?:\.\d+)?/)
  if (slashMatch) return Number(slashMatch[1])

  const numMatch = str.match(/\d+(?:\.\d+)?/)
  return numMatch ? Number(numMatch[0]) : null
}

/**
 * 提取心率（次/分）。
 */
function extractHeartRate(patient = {}) {
  const raw = patient.pulse ??
    patient.heartRate ??
    patient.heartrate ??
    patient.HeartRate

  if (raw === null || raw === undefined || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

/**
 * 判断病情状况是否为"持续性胸闷/胸痛"。
 * 前端字段名为 symptomslevel，提交到后端的字段名为 conditionType，值为 '1'。
 */
function extractIsPersistentChestPain(patient = {}) {
  const raw = patient.chestPainDuration ??
    patient.conditionType ??
    patient.symptomslevel ??
    patient.symptomsLevel

  if (raw === null || raw === undefined || raw === '') return false
  const minutes = Number(raw)
  // 持续性胸闷/胸痛：≥20分钟
  return Number.isFinite(minutes) && minutes >= 30
}

export function buildVitalsWarning(patient = {}) {
  const sbp = extractSystolicBP(patient)
  const heartRate = extractHeartRate(patient)
  const isPersistentChestPain = extractIsPersistentChestPain(patient)

  const lowSbp = sbp !== null && sbp < 90
  const highHeartRate = heartRate !== null && heartRate > 110

  // 三项必须同时满足
  const isWarning = lowSbp && isPersistentChestPain && highHeartRate

  const warningReason = isWarning
    ? `收缩压偏低(${sbp}mmHg)，持续性胸闷/胸痛，心率偏快(${heartRate}次/分)`
    : ''

  return {
    sbp,
    heartRate,
    isPersistentChestPain,
    isWarning,
    warningReason
  }
}

export function enrichVitalsWarning(patient = {}) {
  return {
    ...patient,
    ...buildVitalsWarning(patient)
  }
}
