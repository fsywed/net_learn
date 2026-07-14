import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow-cyan" />
        <div className="hero-content">
          <div className="hero-badge">
            <span style={{ color: '#39ff14' }}>●</span> SYSTEM ONLINE
          </div>
          <h1 className="hero-title">NETLEARN · 网络安全学习平台</h1>
          <div className="hero-title-en">// CYBER SECURITY TRAINING PLATFORM</div>
          <p className="hero-subtitle">
            系统化课程 + 真实靶机实战，在安全环境中锤炼攻防技能，从理论到 Flag 通关一站式成长。
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary">
              ▶ 浏览课程
            </Link>
            <Link to="/targets" className="btn btn-outline">
              ◈ 查看靶场
            </Link>
            <Link to="/getting-started" className="btn btn-outline">
              ⚡ 新手入门
            </Link>
          </div>
          <p className="hero-tip">
            $ 纯静态站点 · 无需注册 · 内容直接构建到页面
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">核心特性</h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 20px', fontSize: '14px' }}>// PLATFORM FEATURES</p>
        <div className="features">
          <div className="feature-card">
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <h3>系统课程</h3>
            <p>结构化章节与 Markdown 教程，循序渐进掌握网络安全理论基础与攻防思路。</p>
          </div>
          <div className="feature-card">
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <h3>实战靶场</h3>
            <p>每个靶机附带 Python 启动命令、解题步骤与学习要点，本地一键开练。</p>
          </div>
          <div className="feature-card">
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌐</div>
            <h3>开源开放</h3>
            <p>全部源代码与课程内容在 GitHub 公开，欢迎贡献新的靶机与章节。</p>
          </div>
          <div className="feature-card">
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
            <h3>题单训练</h3>
            <p>精选题目合集，按专题分类训练，追踪你的解题进度与技能成长。</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">快速开始</h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 20px', fontSize: '14px' }}>// QUICK START</p>
        <div className="card-grid">
          <Link to="/getting-started" className="card course-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <h3 className="card-title">新手入门</h3>
            <p className="card-desc">6步交互式教程，带你从零开始认识网络安全，启动第一个靶机并拿到你的第一面 Flag。</p>
            <div className="card-meta">
              <span className="badge badge-easy">入门级</span>
              <span className="badge">教程</span>
            </div>
          </Link>
          <Link to="/courses" className="card course-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📖</div>
            <h3 className="card-title">课程中心</h3>
            <p className="card-desc">14门精选课程，覆盖 Web安全、密码学、逆向工程、云安全、容器安全、API安全等方向。</p>
            <div className="card-meta">
              <span className="badge">14 门课程</span>
              <span className="badge badge-skill">全栈</span>
            </div>
          </Link>
          <Link to="/targets" className="card target-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚔️</div>
            <h3 className="card-title">实战靶场</h3>
            <p className="card-desc">真实漏洞环境本地运行，每个靶机配详细提示与答案，边学边练，边练边学。</p>
            <div className="card-meta">
              <span className="badge badge-medium">靶机</span>
              <span className="badge badge-skill">实战</span>
            </div>
          </Link>
          <Link to="/problemsets" className="card problemset-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <h3 className="card-title">题单训练</h3>
            <p className="card-desc">专题题目合集，按难度递进，支持进度追踪和提示查看，高效提升实战能力。</p>
            <div className="card-meta">
              <span className="badge">15 个题单</span>
              <span className="badge badge-hard">挑战</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
