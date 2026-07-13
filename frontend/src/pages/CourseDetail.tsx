import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Markdown from '../components/Markdown'
import { courses, type Course, type Chapter } from '../api/content'

// 课程详情：左侧章节列表，右侧 Markdown 渲染章节内容
export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const cid = Number(courseId)
  const [course, setCourse] = useState<Course | null>(null)
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)

  useEffect(() => {
    const c = courses.find((x) => x.id === cid) || null
    setCourse(c)
    setActiveChapter(c?.chapters?.[0] || null)
  }, [cid])

  if (!course) {
    return <div className="empty-state">课程不存在</div>
  }

  return (
    <div className="page course-detail">
      <div className="course-header">
        <Link to="/courses" className="back-link">
          ← 返回课程列表
        </Link>
        <h1 className="page-title">{course.title}</h1>
        <p className="page-desc">{course.description}</p>
      </div>

      <div className="course-layout">
        <aside className="chapter-sidebar">
          <h3 className="sidebar-title">章节目录</h3>
          <ul className="chapter-list">
            {course.chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  className={`chapter-item ${
                    activeChapter?.id === ch.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveChapter(ch)}
                >
                  {ch.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="chapter-content">
          {activeChapter ? (
            <>
              <h2>{activeChapter.title}</h2>
              <Markdown source={activeChapter.content} />
            </>
          ) : (
            <div className="empty-state">请选择左侧章节</div>
          )}
        </article>
      </div>
    </div>
  )
}
