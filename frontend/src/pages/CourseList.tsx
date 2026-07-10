import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseApi, getErrorMessage, type Course } from '../api/services'

// 课程列表：卡片展示，点击进入详情
export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    courseApi
      .list()
      .then(setCourses)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">加载中…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="page">
      <h1 className="page-title">课程</h1>
      {courses.length === 0 ? (
        <div className="empty-state">暂无课程</div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="course-card card">
              <h3 className="card-title">{c.title}</h3>
              <p className="card-desc">{c.description || '暂无描述'}</p>
              <div className="card-meta">
                <span className="badge">{c.chapters?.length ?? 0} 章节</span>
                <span className={`badge badge-status-${c.status}`}>{c.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
