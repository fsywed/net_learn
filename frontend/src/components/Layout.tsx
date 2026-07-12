import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

// 带顶部导航的布局：纯静态展示型，移除所有账号相关入口
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
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
          NetLearn · 纯静态网络安全学习平台 ·{' '}
          <a href="https://github.com/fsywed/net_learn" target="_blank" rel="noreferrer">
            源代码
          </a>
        </p>
      </footer>
    </div>
  )
}
