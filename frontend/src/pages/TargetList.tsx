import { Link } from 'react-router-dom'
import {
  targets,
  difficultyClass,
  difficultyLabel,
  type TargetTemplate,
} from '../api/content'

// 靶场列表：展示所有靶机，公开可访问
export default function TargetList() {
  return (
    <div className="page">
      <h1 className="page-title">靶场</h1>
      <p className="page-desc">点击进入查看 Docker 启动命令、解题步骤与学习要点。</p>
      {targets.length === 0 ? (
        <div className="empty-state">暂无靶机</div>
      ) : (
        <div className="card-grid">
          {targets.map((t: TargetTemplate) => (
            <Link
              key={t.id}
              to={`/targets/${t.id}`}
              className="target-card card"
            >
              <div className="card-head">
                <h3 className="card-title">{t.name}</h3>
                <span className={`badge ${difficultyClass(t.difficulty)}`}>
                  {difficultyLabel(t.difficulty)}
                </span>
              </div>
              <p className="card-desc">{t.description}</p>
              <div className="card-meta">
                <span className="badge">{t.category}</span>
                {t.skills.slice(0, 2).map((s) => (
                  <span key={s} className="badge badge-skill">
                    {s}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
