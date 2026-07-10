import { useEffect, useState } from 'react'
import {
  profileApi,
  difficultyClass,
  difficultyLabel,
  getErrorMessage,
  type ProfileData,
} from '../api/services'

// 个人中心：用户信息卡 + 通关数 + 通关记录 + 最近活动
export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    profileApi
      .get()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">加载中…</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!data) return null

  return (
    <div className="page profile-page">
      <h1 className="page-title">个人中心</h1>

      <div className="card profile-info">
        <div className="info-row">
          <span>邮箱</span>
          <strong>{data.user_info.email}</strong>
        </div>
        <div className="info-row">
          <span>角色</span>
          <strong>{data.user_info.role === 'admin' ? '管理员' : '学员'}</strong>
        </div>
        <div className="info-row">
          <span>积分</span>
          <strong className="score">{data.score}</strong>
        </div>
        <div className="info-row">
          <span>通关数</span>
          <strong>{data.solved_count}</strong>
        </div>
        <div className="info-row">
          <span>注册时间</span>
          <strong>{new Date(data.user_info.created_at).toLocaleString()}</strong>
        </div>
      </div>

      <section className="card">
        <h3>最近通关</h3>
        {data.recent_solved.length === 0 ? (
          <div className="empty-state">暂无通关记录</div>
        ) : (
          <ul className="record-list">
            {data.recent_solved.map((s, idx) => (
              <li key={idx} className="record-item">
                <span className="record-name">{s.template_name}</span>
                <span className={`badge ${difficultyClass(s.difficulty)}`}>
                  {difficultyLabel(s.difficulty)}
                </span>
                <span className="record-time">
                  {new Date(s.solved_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3>最近活动</h3>
        {data.recent_activity.length === 0 ? (
          <div className="empty-state">暂无活动</div>
        ) : (
          <ul className="record-list">
            {data.recent_activity.map((a, idx) => (
              <li key={idx} className="record-item">
                <span className="record-name">{a.template_name}</span>
                <span className="record-desc">{a.description}</span>
                <span className="record-time">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
