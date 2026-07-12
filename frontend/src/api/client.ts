// 后端 API 客户端（动态靶机）
//
// baseURL 来自 VITE_API_BASE（构建时通过 .env.production 注入）
//   - GitHub Pages 生产环境：'https://netlearn-backend.fly.dev'
//   - 本地开发：留空，Vite dev server 会把 /api/* 代理到 http://localhost:8001
//
// 同时维护 backendOnline 状态，Layout 组件订阅它以显示警告横幅。
import axios, { type AxiosError } from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 120_000, // 首次拉镜像可能慢
  withCredentials: false,
})

// ---- 后端可用性状态 ----
let backendOnline = true
const listeners = new Set<(online: boolean) => void>()

export function isBackendOnline() {
  return backendOnline
}

export function onBackendStatusChange(cb: (online: boolean) => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function setOnline(v: boolean) {
  if (v === backendOnline) return
  backendOnline = v
  listeners.forEach((cb) => cb(v))
}

// 启动时主动 ping 一次，避免 Layout 永远不知道后端挂了
export async function probeBackend(): Promise<boolean> {
  try {
    await api.get('/health', { timeout: 5000 })
    setOnline(true)
    return true
  } catch {
    setOnline(false)
    return false
  }
}

api.interceptors.response.use(
  (r) => {
    setOnline(true)
    return r
  },
  (err: AxiosError) => {
    // 网络层错误或 5xx 视为不可用；4xx 视为逻辑错误但服务还在
    if (!err.response || err.response.status >= 500) setOnline(false)
    return Promise.reject(err)
  }
)

// ---- 类型定义 ----
export interface Instance {
  id: number
  template_id: number
  template_name: string
  status: string
  host_port: number
  container_port: number
  proxy_url: string
  expires_at: string
  remaining_seconds: number
}

// ---- API ----
export async function spawnInstance(templateId: number): Promise<Instance> {
  const { data } = await api.post<Instance>('/instances/spawn', {
    template_id: templateId,
  })
  return data
}

export async function listInstances(): Promise<Instance[]> {
  const { data } = await api.get<Instance[]>('/instances')
  return data
}

export async function destroyInstance(id: number): Promise<void> {
  await api.delete(`/instances/${id}`)
}

export async function submitFlag(
  instanceId: number,
  flag: string
): Promise<{ correct: boolean; message: string }> {
  const { data } = await api.post<{ correct: boolean; message: string }>(
    '/submissions',
    { instance_id: instanceId, flag }
  )
  return data
}
