import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  targetApi,
  difficultyClass,
  difficultyLabel,
  getErrorMessage,
  type TargetTemplate,
} from '../api/services'

// 靶场列表：靶机卡片（名称、难度标签、描述），点击进入详情
export default function TargetList() {
  const [targets, setTargets] = useState<TargetTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    targetApi
      .list()
      .then(setTargets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">加载中…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="page">
      <h1 className="page-title">靶场</h1>
      {targets.length === 0 ? (
        <div className="empty-state">暂无靶机</div>
      ) : (
        <div className="card-grid">
          {targets.map((t) => (
            <Link key={t.id} to={`/targets/${t.id}`} className="target-card card">
              <div className="card-head">
                <h3 className="card-title">{t.name}</h3>
                <span className={`badge ${difficultyClass(t.difficulty)}`}>
                  {difficultyLabel(t.difficulty)}
                </span>
              </div>
              <p className="card-desc">{t.description || '暂无描述'}</p>
              <div className="card-meta">
                <span className="badge">端口 {t.ports || '-'}</span>
                <span className={`badge badge-status-${t.status}`}>{t.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
