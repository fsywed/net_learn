import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

// 路由守卫：未登录跳 /login；requireAdmin 仅管理员可访问
export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode
  requireAdmin?: boolean
}) {
  const { user, loading } = useAuth()

  // 加载中时显示占位，避免闪烁跳转
  if (loading) {
    return <div className="loading-state">加载中…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
