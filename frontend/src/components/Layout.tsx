import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { onBackendStatusChange, probeBackend } from '../api/client'

// 带顶部导航的布局：纯静态展示型 + 后端状态横幅
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [backendUp, setBackendUp] = useState(true)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    probeBackend()
    return onBackendStatusChange(setBackendUp)
  }, [])

  return (
    <div className="layout">
      {!backendUp && (
        <div className="backend-banner" role="alert">
          ⚠ 后端服务暂不可用 — 「在线靶机」与「Flag 提交」功能当前不可使用，其余课程内容仍可正常浏览。
        </div>
      )}

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
          <NavLink to="/courses" onClick={closeMenu}>
            课程
          </NavLink>
          <NavLink to="/targets" onClick={closeMenu}>
            靶场
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            关于
          </NavLink>
          <a
            href="https://github.com/fsywed/net_learn"
            target="_blank"
            rel="noreferrer"
            className="nav-github"
          >
            GitHub ↗
          </a>
        </nav>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <p>
          NetLearn · 网络安全在线学习与靶场 ·{' '}
          <a href="https://github.com/fsywed/net_learn" target="_blank" rel="noreferrer">
            源代码
          </a>
        </p>
      </footer>
    </div>
  )
}
