import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 带顶部导航的布局：根据登录状态显示导航项
export default function Layout() {
  const { user, logout, backendOnline } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <Link to="/" onClick={closeMenu}>
            <span className="brand-mark">⚡</span>
            NetLearn
          </Link>
        </div>

        <button
          className="nav-toggle"
          aria-label="菜单"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`layout-nav${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            首页
          </NavLink>
          {user && (
            <NavLink to="/courses" onClick={closeMenu}>
              课程
            </NavLink>
          )}
          {user && (
            <NavLink to="/targets" onClick={closeMenu}>
              靶场
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" onClick={closeMenu}>
              个人中心
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={closeMenu}>
              管理后台
            </NavLink>
          )}

          {user ? (
            <div className="nav-user">
              <span className="nav-email">{user.email}</span>
              <span className="nav-score">{user.score} 分</span>
              <button className="btn btn-sm btn-ghost" onClick={handleLogout}>
                退出
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" onClick={closeMenu}>
                登录
              </NavLink>
              <NavLink to="/register" onClick={closeMenu} className="btn btn-sm btn-primary">
                注册
              </NavLink>
            </div>
          )}
        </nav>
      </header>

      {!backendOnline && (
        <div className="alert alert-warning banner-offline">
          后端服务未连接 — 登录、课程等功能暂不可用。如需完整体验，请参考
          <a href="https://github.com/fsywed/net_learn" target="_blank" rel="noreferrer">
            项目文档
          </a>
          在本地启动后端。
        </div>
      )}

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
