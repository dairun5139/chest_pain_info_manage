const consultRequests = [
  { id: 'REQ-20260702-001', hospital: '苏州科技城医院', patient: '赵某某 男 62岁 STEMI', disease: 'STEMI', priority: '急危', submittedAt: '09:18', status: '待分派', desc: '胸痛 90 分钟，ST 段抬高，肌钙蛋白升高，请求导管室启动评估。', materials: ['心电图已上传', '肌钙蛋白阳性', '生命体征稳定'] },
  { id: 'REQ-20260702-002', hospital: '苏州市吴中人民医院', patient: '沈某某 男 58岁 胸痛观察', disease: '胸痛待查', priority: '高危', submittedAt: '09:42', status: '待分派', desc: '持续胸闷伴大汗，基层医院请求上级专家协助判读心电图并给出转运建议。', materials: ['心电图已上传', '胸痛评分高危', '待转运评估'] },
  { id: 'REQ-20260702-003', hospital: '苏州市中医医院', patient: '吴某某 女 69岁 胸闷待查', disease: 'NSTEMI', priority: '普通', submittedAt: '10:05', status: '待分派', desc: '胸闷 4 小时，心电图改变不典型，请求心内科专家会诊。', materials: ['检验结果待复核', '心电图已上传'] }
]

const recommendedDoctors = [
  { id: 'DOC-001', name: '张明', hospital: '苏州大学附属第一医院', title: '主任医师', dept: '心内科', specialty: 'STEMI急诊介入', response: '5分钟', load: '空闲', match: 98 },
  { id: 'DOC-002', name: '林予安', hospital: '苏州市立医院', title: '主任医师', dept: '胸痛中心', specialty: '胸痛中心流程质控', response: '8分钟', load: '适中', match: 93 },
  { id: 'DOC-003', name: '陈思远', hospital: '苏州大学附属第二医院', title: '副主任医师', dept: '急诊医学科', specialty: '急性胸痛鉴别诊断', response: '10分钟', load: '适中', match: 89 },
  { id: 'DOC-004', name: '金悦', hospital: '苏州科技城医院', title: '主任医师', dept: '心内科', specialty: 'NSTEMI与复杂病情评估', response: '12分钟', load: '忙碌', match: 84 }
]

module.exports = [
  // 获取会诊请求队列
  {
    url: '/api/consult/queue',
    type: 'get',
    response: _ => {
      return { code: 20000, data: { items: consultRequests } }
    }
  },
  // 获取推荐医生列表
  {
    url: '/api/consult/doctors',
    type: 'get',
    response: config => {
      const { disease } = config.query || {}
      let doctors = recommendedDoctors.map(d => ({ ...d, computedMatch: d.match }))
      if (disease === 'STEMI') {
        doctors = doctors.map(d => ({ ...d, computedMatch: d.specialty.includes('STEMI') ? Math.min(99, d.match + 6) : d.match }))
      }
      return { code: 20000, data: { items: doctors } }
    }
  },
  // 发起会诊
  {
    url: '/api/consult/launch',
    type: 'post',
    response: config => {
      const { requestId, doctorId, note } = config.body || {}
      const request = consultRequests.find(r => r.id === requestId)
      if (request) request.status = '已分派'
      return { code: 20000, data: { success: true, message: '会诊已分派' } }
    }
  }
]
