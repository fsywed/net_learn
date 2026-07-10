import axios from 'axios'

// axios 实例：统一 baseURL 指向 /api，超时 15s
const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：从 localStorage 读取 token 并附加 Bearer 头
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：401 时清除 token 并跳转登录页（排除登录/注册页自身，避免循环跳转）
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const path = window.location.pathname
    if (
      status === 401 &&
      !path.startsWith('/login') &&
      !path.startsWith('/register')
    ) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default client
