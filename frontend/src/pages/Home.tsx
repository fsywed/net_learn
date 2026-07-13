import { Link } from 'react-router-dom'

// 首页：赛博终端风 Hero + 入口卡片
export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="terminal-decoration">
          <div className="term-header">
            <span className="term-dot red" />
            <span className="term-dot yellow" />
            <span className="term-dot green" />
            <span className="term-title">netlearn@hackbox</span>
          </div>
          <div className="term-body">
            <div className="term-line"><span className="term-prompt">$</span> whoami</div>
            <div className="term-output">security_learner</div>
            <div className="term-line"><span className="term-prompt">$</span> cat /etc/motd</div>
            <div className="term-output">Welcome to <span className="term-cyan">NetLearn</span> — your gateway to cybersecurity.</div>
            <div className="term-line"><span className="term-prompt">$</span> start --learn<span className="term-cursor">█</span></div>
          </div>
        </div>

        <h1 className="hero-title">NetLearn · 网络安全学习平台</h1>
        <p className="hero-subtitle">
          系统化课程 + 真实靶机实战 + 题单练习，在安全环境中锤炼攻防技能，从理论到 Flag 通关一站式成长。
        </p>
        <div className="hero-actions">
          <Link to="/getting-started" className="btn btn-primary">
            🚀 开始学习
          </Link>
          <Link to="/targets" className="btn btn-outline">
            🎯 进入靶场
          </Link>
        </div>
        <p className="hero-tip">
          $ open-source · free · no-registry · local-targets
        </p>

        {/* 统计数据 */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">14</span>
            <span className="stat-label">系统课程</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">50+</span>
            <span className="stat-label">实战靶机</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">30</span>
            <span className="stat-label">练习题</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">6</span>
            <span className="stat-label">题单</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>系统课程</h3>
          <p>结构化章节与 Markdown 教程，循序渐进掌握网络安全理论基础与攻防思路。覆盖 Web、密码学、逆向、云安全等全方向。</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>实战靶场</h3>
          <p>每个靶机附带 Python 启动命令、解题步骤与学习要点。Docker 本地运行，在安全环境中练习真实漏洞利用。</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>题单练习</h3>
          <p>按主题分类的练习题单，每道题都有提示和答案，配合进度追踪，循序渐进巩固所学知识。</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>赛事日历</h3>
          <p>实时追踪 CTF 比赛和认证考试日程，不错过任何一场重要赛事，提前规划参赛时间。</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛠️</div>
          <h3>工具箱</h3>
          <p>精选安全工具推荐，涵盖 Web、PWN、Crypto、逆向、取证等方向，助你搭建高效的渗透测试环境。</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔓</div>
          <h3>开源开放</h3>
          <p>全部源代码与课程内容在 GitHub 公开，无需注册即可使用。欢迎贡献新的靶机与章节。</p>
        </div>
      </section>

      <section className="quick-start-card">
        <div className="qs-header">
          <span className="qs-icon">⚡</span>
          <h2>30 秒快速开始</h2>
        </div>
        <div className="qs-steps">
          <div className="qs-step">
            <div className="qs-step-num">1</div>
            <div>
              <strong>启动靶机</strong>
              <code className="qs-cmd">python targets/local/target1_nginx.py 8081</code>
            </div>
          </div>
          <div className="qs-arrow">→</div>
          <div className="qs-step">
            <div className="qs-step-num">2</div>
            <div>
              <strong>访问靶机</strong>
              <code className="qs-cmd">http://localhost:8081</code>
            </div>
          </div>
          <div className="qs-arrow">→</div>
          <div className="qs-step">
            <div className="qs-step-num">3</div>
            <div>
              <strong>找到 Flag</strong>
              <p>查看源码、利用漏洞、提交验证</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
