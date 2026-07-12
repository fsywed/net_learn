import { Link } from 'react-router-dom'

// 首页：平台介绍 + 入口卡片（无登录态）
export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">NetLearn · 网络安全学习平台</h1>
        <p className="hero-subtitle">
          系统化课程 + 真实靶机实战，在安全环境中锤炼攻防技能，从理论到 Flag 通关一站式成长。
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-primary">
            浏览课程
          </Link>
          <Link to="/targets" className="btn btn-outline">
            查看靶场
          </Link>
        </div>
        <p className="hero-tip">
          纯静态站点 · 无需注册 · 内容直接构建到页面
        </p>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>系统课程</h3>
          <p>结构化章节与 Markdown 教程，循序渐进掌握网络安全理论基础与攻防思路。</p>
        </div>
        <div className="feature-card">
          <h3>实战靶场</h3>
          <p>每个靶机附带 Docker 启动命令、解题步骤与学习要点，本地一键开练。</p>
        </div>
        <div className="feature-card">
          <h3>开源开放</h3>
          <p>全部源代码与课程内容在 GitHub 公开，欢迎贡献新的靶机与章节。</p>
        </div>
      </section>
    </div>
  )
}
