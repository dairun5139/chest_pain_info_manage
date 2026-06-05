// constants.js
// 定义静态变量
// export const API_URL = 'https://2463ej5oy406.vicp.fun/';
// export const API_URL = 'http://192.168.1.200:9999/';
export const API_URL = 'http://1.117.62.76:8091/'
// export const API_URL = 'https://2463ej5oy406.vicp.fun/';
export const DEFAULT_PAGE_SIZE = 10
export const API_AI_URL = 'https://api.deepseek.com'
export const API_AI_KEY = 'sk-59962f4873d7493fbe4c038776c252a7'
const OPENAI_API_URL = 'https://api.deepseek.com'

// export const API_AI_KEY = 'c5da8f31-0281-4e47-a379-3e5564ebea4f';
// const OPENAI_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
import axios from 'axios'
import { stream } from 'xlsx'

const instance = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Authorization': `Bearer ${API_AI_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
})
// deepseek url '/v1/chat/completions'
// 'deepseek-chat'
// "doubao-pro-256k-241115"
export const sendOpenAIRequest = async(messages) => {
  try {
    const response = await instance.post('/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: messages },{role: 'assistant', content: "<think>\n</think>\n\n"}]
    })
    console.log('API 响应:', response.data)
    const data = response.data
    // 校验返回结构：API Key 无效/余额不足/频率限制时，返回的是 {error:{...}} 而非 {choices:[...]}
    if (!data || !Array.isArray(data.choices) || data.choices.length === 0) {
      const errMsg = (data && data.error && (data.error.message || data.error.code)) || JSON.stringify(data)
      throw new Error('DeepSeek接口返回异常：' + errMsg)
    }
    return data
  } catch (error) {
    console.error('API 请求失败:', error)
    throw error
  }
}
