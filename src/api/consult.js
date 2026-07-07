import request from '@/utils/request'

// ===================================================================
// 会诊管理 API
// ===================================================================

// 获取会诊请求队列
export function getConsultQueue(params) {
  return request({
    url: '/api/consult/queue',
    method: 'get',
    params
  })
}

// 获取推荐医生列表
export function getRecommendedDoctors(params) {
  return request({
    url: '/api/consult/doctors',
    method: 'get',
    params
  })
}

// 发起会诊
export function launchConsult(data) {
  return request({
    url: '/api/consult/launch',
    method: 'post',
    data
  })
}
