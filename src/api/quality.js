import request from '@/utils/request'

// ===================================================================
// 质控管理 API
// ===================================================================

// 获取全国质控地图数据
export function getQualityMapData(level, code) {
  return request({
    url: '/api/quality/map',
    method: 'get',
    params: { level, code }
  })
}

// 获取质控指标汇总
export function getQualityIndicators(params) {
  return request({
    url: '/api/quality/indicators',
    method: 'get',
    params
  })
}

// 获取趋势曲线数据
export function getQualityTrends(params) {
  return request({
    url: '/api/quality/trends',
    method: 'get',
    params
  })
}
