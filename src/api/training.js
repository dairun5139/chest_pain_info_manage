import request from '@/utils/request'

// ===================================================================
// 培训考核 API
// ===================================================================

// 获取培训任务列表
export function getTrainingTasks(params) {
  return request({
    url: '/api/training/tasks',
    method: 'get',
    params
  })
}

// 发布培训考核
export function createTraining(data) {
  return request({
    url: '/api/training/create',
    method: 'post',
    data
  })
}

// 提交培训成绩
export function submitTrainingScore(id, data) {
  return request({
    url: `/api/training/${id}/score`,
    method: 'put',
    data
  })
}
