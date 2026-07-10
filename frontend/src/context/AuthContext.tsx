import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { authApi, type UserInfo } from '../api/services'

// 认证上下文值
interface AuthContextValue {
  user: UserInfo | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// 认证 Provider：从 localStorage 恢复 token，调用 /auth/me 获取用户信息
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'),
  )
  const [loading, setLoading] = useState(true)

  // 挂载时若有 token，则拉取用户信息；失败则清除 token
  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (!saved) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // 登录：拿到 token 存 localStorage，再拉取用户信息
  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('token', res.access_token)
    setToken(res.access_token)
    const u = await authApi.me()
    setUser(u)
  }

  // 注册：注册成功即返回 token，自动登录
  const register = async (email: string, password: string) => {
    const res = await authApi.register(email, password)
    localStorage.setItem('token', res.access_token)
    setToken(res.access_token)
    const u = await authApi.me()
    setUser(u)
  }

  // 退出：清除 token 与用户
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth hook：必须在 AuthProvider 内使用
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return ctx
}
