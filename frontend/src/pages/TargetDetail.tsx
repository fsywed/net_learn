import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Markdown from '@uiw/react-markdown-preview'
import {
  targets,
  difficultyClass,
  difficultyLabel,
  type TargetTemplate,
} from '../api/content'

// 靶机详情：介绍 + Docker 启动命令 + 解题步骤 + 学习要点
export default function TargetDetail() {
  const { templateId } = useParams<{ templateId: string }>()
  const tid = Number(templateId)
  const target = targets.find((t: TargetTemplate) => t.id === tid)
  const [copied, setCopied] = useState(false)

  if (!target) {
    return (
      <div className="page">
        <Link to="/targets" className="back-link">
          ← 返回靶场列表
        </Link>
        <div className="empty-state">靶机不存在</div>
      </div>
    )
  }

  const copyDocker = async () => {
    try {
      await navigator.clipboard.writeText(target.docker_run)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="page target-detail">
      <Link to="/targets" className="back-link">
        ← 返回靶场列表
      </Link>

      <header className="target-header">
        <h1 className="page-title">{target.name}</h1>
        <div className="target-badges">
          <span className={`badge ${difficultyClass(target.difficulty)}`}>
            {difficultyLabel(target.difficulty)}
          </span>
          <span className="badge">{target.category}</span>
          <span className="badge badge-status-published">{target.status}</span>
        </div>
        <p className="page-desc">{target.description}</p>
      </header>

      <section className="card docker-card">
        <h3>本地启动</h3>
        <p className="docker-hint">
          需要本机已安装 <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noreferrer">Docker</a>。
          复制以下命令到终端执行即可启动靶机。
        </p>
        <pre className="code-block">
          <code>{target.docker_run}</code>
        </pre>
        <button className="btn btn-primary btn-sm" onClick={copyDocker}>
          {copied ? '已复制 ✓' : '复制命令'}
        </button>
        <p className="docker-info">
          镜像：<code>{target.image}</code> · 端口：<code>{target.ports}</code>
        </p>
      </section>

      <section className="card">
        <h3>解题步骤</h3>
        <ol className="step-list">
          {target.solution_steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h3>技能标签</h3>
        <div className="skill-list">
          {target.skills.map((s) => (
            <span key={s} className="badge badge-skill">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>学习要点</h3>
        <Markdown
          source={
            '- ' +
            target.learn_points.map((p) => p.replace(/\n/g, '\n  ')).join('\n- ')
          }
        />
      </section>
    </div>
  )
}
