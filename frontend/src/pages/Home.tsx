import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 首页：平台简介 + 快捷入口，未登录引导注册
export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">NetLearn · 网络安全学习平台</h1>
        <p className="hero-subtitle">
          系统化课程 + 真实靶场实战，在安全环境中锤炼攻防技能，从理论到 Flag 通关一站式成长。
        </p>
        <div className="hero-actions">
          <Link to={user ? '/courses' : '/login'} className="btn btn-primary">
            去学习
          </Link>
          <Link to={user ? '/targets' : '/login'} className="btn btn-outline">
            去靶场
          </Link>
        </div>
        {!user && (
          <p className="hero-tip">
            还没有账号？<Link to="/register">立即注册</Link>，开启你的安全学习之旅。
          </p>
        )}
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>系统课程</h3>
          <p>结构化章节与 Markdown 教程，循序渐进掌握网络安全理论基础与攻防思路。</p>
        </div>
        <div className="feature-card">
          <h3>实战靶场</h3>
          <p>一键启动靶机实例，真实端口访问，限时挑战，Flag 提交即时验证学习成果。</p>
        </div>
        <div className="feature-card">
          <h3>积分激励</h3>
          <p>通关获得积分，排行榜见证成长，持续挑战更高难度的靶机。</p>
        </div>
      </section>
    </div>
  )
}
