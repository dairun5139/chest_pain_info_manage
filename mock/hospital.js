const Mock = require('mockjs')

const hospitals = [
  { id: 1, name: '苏州科技城医院', area: '高新区', level: '三级甲等', patients: 18, consults: 6, status: '在线', score: 96, warnings: 2, training: '待复盘', doctor: '张明 / 心内科' },
  { id: 2, name: '苏州大学附属第一医院', area: '姑苏区', level: '三级甲等', patients: 15, consults: 4, status: '在线', score: 94, warnings: 0, training: '已完成', doctor: '周宁 / 急诊科' },
  { id: 3, name: '苏州大学附属第二医院', area: '姑苏区', level: '三级甲等', patients: 12, consults: 3, status: '忙碌', score: 91, warnings: 1, training: '进行中', doctor: '李越 / 心内科' },
  { id: 4, name: '苏州市立医院', area: '姑苏区', level: '三级甲等', patients: 11, consults: 2, status: '在线', score: 89, warnings: 0, training: '已完成', doctor: '魏然 / 急诊科' },
  { id: 5, name: '苏州市中医医院', area: '姑苏区', level: '三级甲等', patients: 8, consults: 2, status: '在线', score: 86, warnings: 0, training: '待提交', doctor: '宋琪 / 胸痛门诊' },
  { id: 6, name: '苏州市吴中人民医院', area: '吴中区', level: '三级乙等', patients: 7, consults: 1, status: '在线', score: 82, warnings: 0, training: '进行中', doctor: '顾辰 / 急诊科' }
]

const accessItems = [
  { id: 1, name: '苏州高新区人民医院', level: '二级甲等', status: '待管理员审核', contact: '王主任', submitted: '2026-07-02 09:20', approved: false },
  { id: 2, name: '苏州市相城人民医院', level: '三级乙等', status: '资料待补充', contact: '赵主任', submitted: '2026-07-01 16:45', approved: false },
  { id: 3, name: '昆山市第一人民医院', level: '三级甲等', status: '接口联调中', contact: '钱工', submitted: '2026-06-30 14:10', approved: false }
]

module.exports = [
  // 获取医院列表
  {
    url: '/api/hospital/list',
    type: 'get',
    response: config => {
      const { keyword, level, status, page = 1, limit = 20 } = config.query || {}
      let list = hospitals.filter(h => {
        if (keyword && !(h.name + h.area + h.doctor + h.level + h.status).includes(keyword)) return false
        if (level && level !== 'all' && h.level !== level) return false
        if (status && status !== 'all' && h.status !== status) return false
        return true
      })
      const total = list.length
      list = list.filter((_, i) => i < limit * page && i >= limit * (page - 1))
      return { code: 20000, data: { total, items: list } }
    }
  },
  // 获取接入审核列表
  {
    url: '/api/hospital/access/list',
    type: 'get',
    response: _ => {
      return { code: 20000, data: { items: accessItems } }
    }
  },
  // 审核通过
  {
    url: /\/api\/hospital\/access\/\d+\/approve/,
    type: 'post',
    response: config => {
      const id = +config.url.match(/\/api\/hospital\/access\/(\d+)\/approve/)[1]
      const item = accessItems.find(a => a.id === id)
      if (item) { item.approved = true; item.status = '已完成审核' }
      return { code: 20000, data: 'success' }
    }
  }
]
