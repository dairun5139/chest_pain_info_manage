// constants.js
// 定义静态变量
// export const API_URL = 'https://2463ej5oy406.vicp.fun/'
// export const API_URL = 'http://192.168.1.200:9999/'
export const API_URL = 'http://1.117.62.76:8091/'
// export const API_URL = 'https://2463ej5oy406.vicp.fun/'
export const DEFAULT_PAGE_SIZE = 10
export const API_AI_URL = 'https://api.deepseek.com'
export const API_AI_KEY = 'sk-59962f4873d7493fbe4c038776c252a7'
const OPENAI_API_URL = 'https://api.deepseek.com'

// 百度AI配置
// 无论开发(devServer:9527)还是生产(IIS)，统一走 /baidu-api 路径：
//   - 开发环境：由 vue.config.js devServer.proxy 转发
//   - 生产环境：由 IIS web.config URL Rewrite + ARR 转发
export const API_BAIDUAI_URL = '/baidu-api'
export const BAIDU_DIRECT_URL = 'https://aip.baidubce.com'
export const client_id = 'N5oytllWbhGBpSiVQ5i941fh'
export const client_secret = 'DAj4S34uatIugfLqfoIvvW303QL9PrYx'

// export const API_AI_KEY = 'c5da8f31-0281-4e47-a379-3e5564ebea4f'
// const OPENAI_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
import axios from 'axios'

const instance = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Authorization': `Bearer ${API_AI_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
})

const AI_CACHE_PREFIX = 'ai_diagnosis_cache:'

const stableStringify = (value) => {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch (e) {
    return String(value)
  }
}

const hashText = (text) => {
  let hash = 0
  const str = stableStringify(text)
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}

export const sendOpenAIRequest = async(messages) => {
  try {
    const promptText = stableStringify(messages)
    const cacheKey = AI_CACHE_PREFIX + hashText(promptText)
    const cached = typeof window !== 'undefined' ? window.localStorage.getItem(cacheKey) : null
    if (cached) {
      return JSON.parse(cached)
    }

    const response = await instance.post('/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: Array.isArray(messages)
        ? messages
        : [
          { role: 'system', content: '你是胸痛中心临床辅助诊断助手。请严格依据用户给出的患者资料回答，不添加无关内容；相同输入必须输出相同文本。' },
          { role: 'user', content: promptText }
        ],
      temperature: 0,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      stream: false
    })
    console.log('API 响应:', response.data)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(cacheKey, JSON.stringify(response.data))
    }
    return response.data
  } catch (error) {
    console.error('API 请求失败:', error)
    throw error
  }
}

/**
 * 获取百度 access_token
 * 统一走 /baidu-api 路径（开发由 devServer proxy 转发，生产由 IIS ARR 转发）
 */
const getBaiduAccessToken = async() => {
  try {
    const res = await axios.post(
      `${API_BAIDUAI_URL}/oauth/2.0/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
      null,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    )
    console.log('百度Token响应:', res.data)
    if (res.data.error) {
      throw new Error('获取token失败: ' + res.data.error_description)
    }
    return res.data.access_token
  } catch (err) {
    console.error('获取百度token失败:', err.response ? err.response.data : err.message)
    throw new Error('获取百度token失败: ' + (err.response ? JSON.stringify(err.response.data) : err.message))
  }
}

/**
 * 百度OCR识别 - 完整流程：先获取token，再调用OCR接口
 */
export const sendBaiduAIRequest = async(imageBase64) => {
  try {
    const accessToken = await getBaiduAccessToken()
    console.log('获取到token:', accessToken ? accessToken.substring(0, 10) + '...' : 'null')

    const body = 'image=' + encodeURIComponent(imageBase64)
    const ocrUrl = `${API_BAIDUAI_URL}/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`

    const res = await axios.post(ocrUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    console.log('OCR 响应:', res.data)
    return res.data
  } catch (error) {
    console.error('OCR 请求失败:', error)
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('响应体:', error.response.data)
    }
    const errMsg = error.response
      ? `status=${error.response.status}, data=${JSON.stringify(error.response.data)}`
      : error.message
    throw new Error('OCR请求失败: ' + errMsg)
  }
}
