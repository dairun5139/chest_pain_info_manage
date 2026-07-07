const qualitySeeds = {
  '全国': { cases: 128642, hospitals: 1869, warnings: 312, d2ccu: 29, d2u: 18, tpe: 91, d2b: 68, ecg: 7.2, diseases: 'STEMI 42% / NSTEMI 31% / UA 19% / 其他 8%', trend: { d2ccu: [36, 34, 32, 31, 30, 29], d2u: [24, 22, 21, 20, 19, 18], d2b: [76, 74, 72, 70, 69, 68], ecg: [8.8, 8.4, 8.1, 7.8, 7.5, 7.2], tpe: [85, 86, 88, 89, 90, 91], stemi: [39, 40, 41, 41, 42, 42], nstemi: [32, 32, 31, 31, 31, 31], ua: [20, 20, 19, 19, 19, 19] } },
  '江苏': { cases: 8642, hospitals: 126, warnings: 28, d2ccu: 25, d2u: 15, tpe: 94, d2b: 61, ecg: 6.4, diseases: 'STEMI 45% / NSTEMI 30% / UA 18% / 其他 7%', trend: { d2ccu: [31, 30, 28, 27, 26, 25], d2u: [20, 19, 18, 17, 16, 15], d2b: [69, 67, 66, 64, 62, 61], ecg: [7.5, 7.2, 6.9, 6.7, 6.5, 6.4], tpe: [89, 90, 91, 92, 93, 94], stemi: [42, 43, 44, 44, 45, 45], nstemi: [31, 31, 30, 30, 30, 30], ua: [19, 19, 18, 18, 18, 18] } },
  '苏州': { cases: 1326, hospitals: 12, warnings: 6, d2ccu: 22, d2u: 13, tpe: 96, d2b: 57, ecg: 5.8, diseases: 'STEMI 47% / NSTEMI 29% / UA 17% / 其他 7%', trend: { d2ccu: [29, 27, 25, 24, 23, 22], d2u: [18, 17, 16, 15, 14, 13], d2b: [65, 63, 61, 60, 58, 57], ecg: [7.0, 6.8, 6.4, 6.2, 6.0, 5.8], tpe: [91, 92, 93, 94, 95, 96], stemi: [44, 45, 45, 46, 46, 47], nstemi: [30, 30, 30, 29, 29, 29], ua: [18, 18, 17, 17, 17, 17] } }
}

function regionStats(name) {
  if (qualitySeeds[name]) return qualitySeeds[name]
  const code = Array.from(name).reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const d2b = 58 + (code % 18)
  const ecg = +(5.5 + (code % 26) / 10).toFixed(1)
  const tpe = 86 + (code % 11)
  return {
    cases: 700 + (code % 6200), hospitals: 8 + (code % 88), warnings: code % 21,
    d2ccu: 21 + (code % 15), d2u: 12 + (code % 11), tpe, d2b, ecg,
    diseases: 'STEMI 43% / NSTEMI 30% / UA 19% / 其他 8%',
    trend: {
      d2ccu: [d2b - 25, d2b - 27, d2b - 28, d2b - 30, d2b - 32, d2b - 34].map(v => Math.max(18, v)),
      d2u: [d2b - 40, d2b - 42, d2b - 43, d2b - 44, d2b - 45, d2b - 46].map(v => Math.max(10, v)),
      d2b: [d2b + 7, d2b + 5, d2b + 4, d2b + 2, d2b + 1, d2b],
      ecg: [ecg + 1.1, ecg + 0.9, ecg + 0.7, ecg + 0.4, ecg + 0.2, ecg].map(v => +v.toFixed(1)),
      tpe: [tpe - 5, tpe - 4, tpe - 3, tpe - 2, tpe - 1, tpe],
      stemi: [39, 40, 41, 42, 42, 43 + (code % 5)],
      nstemi: [32, 31, 31, 30, 30, 29 + (code % 3)],
      ua: [20, 20, 19, 19, 18, 17 + (code % 3)]
    }
  }
}

module.exports = [
  // 获取质控数据（地图+指标+趋势 综合接口）
  {
    url: '/api/quality/map',
    type: 'get',
    response: config => {
      const { level, code } = config.query || {}
      const name = code || '全国'
      const stats = regionStats(name)
      return { code: 20000, data: { name, level: level || 'country', stats } }
    }
  },
  // 获取质控指标（简化版）
  {
    url: '/api/quality/indicators',
    type: 'get',
    response: config => {
      const { name } = config.query || {}
      const stats = regionStats(name || '全国')
      return { code: 20000, data: stats }
    }
  },
  // 获取趋势数据
  {
    url: '/api/quality/trends',
    type: 'get',
    response: config => {
      const { name } = config.query || {}
      const stats = regionStats(name || '全国')
      return { code: 20000, data: { name: name || '全国', trend: stats.trend } }
    }
  }
]
