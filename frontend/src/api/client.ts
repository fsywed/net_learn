import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE || '/api'

// 后端可用性标记：检测到 405/404 时标记为离线
let _backendOnline = true
export function isBackendOnline() {
  return _backendOnline
}

const client = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // 405 / 404 且路径以 /api 开头 → 后端不可用
    if ((status === 405 || status === 404) && !error?.response?.data?.detail) {
      _backendOnline = false
    }
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
