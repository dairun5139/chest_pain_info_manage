import request from '@/utils/request'

// ===================================================================
// 医院管理 API
// ===================================================================

// 获取医院列表
export function getHospitalList(params) {
  return request({
    url: '/api/hospital/list',
    method: 'get',
    params
  })
}

// 获取接入审核列表
export function getAccessList(params) {
  return request({
    url: '/api/hospital/access/list',
    method: 'get',
    params
  })
}

// 审核通过
export function approveAccess(id) {
  return request({
    url: `/api/hospital/access/${id}/approve`,
    method: 'post'
  })
}
