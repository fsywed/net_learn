import { Link } from 'react-router-dom'
import { courses, type Course } from '../api/content'

// 课程列表：所有课程公开可访问
export default function CourseList() {
  const published = courses.filter((c: Course) => c.status === 'published')

  return (
    <div className="page">
      <h1 className="page-title">课程</h1>
      <p className="page-desc">从基础到实战，系统化学习网络安全。</p>
      {published.length === 0 ? (
        <div className="empty-state">暂无课程</div>
      ) : (
        <div className="card-grid">
          {published.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="course-card card"
            >
              <h3 className="card-title">{course.title}</h3>
              <p className="card-desc">{course.description}</p>
              <div className="card-meta">
                <span className="badge">{course.chapters.length} 章</span>
                <span className="badge badge-status-published">已发布</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
