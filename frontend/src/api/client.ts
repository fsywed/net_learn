// 后端 API 客户端（动态靶机）
// 用原生 fetch 替代 axios，减小 bundle 体积
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''
const BASE_URL = `${API_BASE}/api`

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

// 封装 fetch，自动处理 JSON 和错误
async function request<T>(path: string, options?: RequestInit, timeout = 120000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    })
    setOnline(true)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.status === 204 ? (undefined as T) : await res.json()
  } catch (err) {
    if (err instanceof TypeError) setOnline(false) // 网络错误
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// 启动时主动 ping 一次
export async function probeBackend(): Promise<boolean> {
  try {
    await request('/health', {}, 5000)
    setOnline(true)
    return true
  } catch {
    setOnline(false)
    return false
  }
}

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
  return request<Instance>('/instances/spawn', {
    method: 'POST',
    body: JSON.stringify({ template_id: templateId }),
  })
}

export async function listInstances(): Promise<Instance[]> {
  return request<Instance[]>('/instances')
}

export async function destroyInstance(id: number): Promise<void> {
  await request<void>(`/instances/${id}`, { method: 'DELETE' })
}

export async function submitFlag(
  instanceId: number,
  flag: string
): Promise<{ correct: boolean; message: string }> {
  return request<{ correct: boolean; message: string }>('/submissions', {
    method: 'POST',
    body: JSON.stringify({ instance_id: instanceId, flag }),
  })
}
