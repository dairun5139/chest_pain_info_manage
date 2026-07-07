const trainingTasks = [
  { id: 1, title: '7月胸痛救治流程培训', hospital: '苏州科技城医院', desc: '要求完成线上学习并提交签到记录。', type: '标准化流程培训', deadline: '2026-07-12', completed: false, score: '--' },
  { id: 2, title: '高危胸痛病例复盘', hospital: '苏州大学附属第二医院', desc: '围绕转运前处置进行复盘。', type: '病例复盘', deadline: '2026-07-08', completed: true, score: 92 },
  { id: 3, title: '绿色通道演练考核', hospital: '苏州大学附属第一医院', desc: '完成急危胸痛患者绿色通道演练并上传记录。', type: '绿色通道演练', deadline: '2026-07-18', completed: true, score: 96 }
]

let nextId = 4

module.exports = [
  // 获取培训任务列表
  {
    url: '/api/training/tasks',
    type: 'get',
    response: config => {
      const { hospital, type, status } = config.query || {}
      let list = trainingTasks.filter(t => {
        if (hospital && hospital !== 'all' && t.hospital !== hospital) return false
        if (type && type !== 'all' && t.type !== type) return false
        if (status === 'completed' && !t.completed) return false
        if (status === 'pending' && t.completed) return false
        return true
      })
      return { code: 20000, data: { items: list } }
    }
  },
  // 发布培训考核
  {
    url: '/api/training/create',
    type: 'post',
    response: config => {
      const { hospital, type: taskType, deadline, owner, content } = config.body || {}
      trainingTasks.unshift({
        id: nextId++,
        title: taskType || '',
        hospital: hospital || '',
        desc: `负责人：${owner || ''}。${content || '请按要求完成学习并提交材料。'}`,
        type: taskType || '',
        deadline: deadline || '待定',
        completed: false,
        score: '--'
      })
      return { code: 20000, data: { success: true } }
    }
  },
  // 提交培训成绩
  {
    url: /\/api\/training\/\d+\/score/,
    type: 'put',
    response: config => {
      const id = +config.url.match(/\/api\/training\/(\d+)\/score/)[1]
      const task = trainingTasks.find(t => t.id === id)
      if (task) { task.completed = true; task.score = config.body?.score || 0 }
      return { code: 20000, data: { success: true } }
    }
  }
]
