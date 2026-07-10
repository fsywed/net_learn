import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Markdown from '@uiw/react-md-preview'
import {
  courseApi,
  getErrorMessage,
  type Course,
  type ChapterDetail,
} from '../api/services'

// 课程详情：左侧章节列表，右侧 Markdown 渲染章节内容
export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const cid = Number(courseId)
  const [course, setCourse] = useState<Course | null>(null)
  const [activeChapter, setActiveChapter] = useState<ChapterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [chapterLoading, setChapterLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    courseApi
      .detail(cid)
      .then(setCourse)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [cid])

  // 拉取并展开某章节内容
  const openChapter = async (chapterId: number) => {
    setChapterLoading(true)
    setError('')
    try {
      const ch = await courseApi.chapter(cid, chapterId)
      setActiveChapter(ch)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setChapterLoading(false)
    }
  }

  if (loading) return <div className="loading-state">加载中…</div>
  if (error && !course) return <div className="alert alert-error">{error}</div>
  if (!course) return <div className="empty-state">课程不存在</div>

  const chapters = [...(course.chapters ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="page course-detail">
      <h1 className="page-title">{course.title}</h1>
      <p className="page-desc">{course.description}</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="course-layout">
        <aside className="chapter-list">
          <h3>章节目录</h3>
          <ul>
            {chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  className={`chapter-item${activeChapter?.id === ch.id ? ' active' : ''}`}
                  onClick={() => openChapter(ch.id)}
                >
                  {ch.order}. {ch.title}
                </button>
              </li>
            ))}
            {chapters.length === 0 && <li className="empty-state">暂无章节</li>}
          </ul>
        </aside>

        <section className="chapter-content">
          {chapterLoading && <div className="loading-state">加载章节…</div>}
          {!chapterLoading && activeChapter ? (
            <>
              <h2>{activeChapter.title}</h2>
              <Markdown source={activeChapter.content} />
            </>
          ) : (
            !chapterLoading && (
              <div className="empty-state">请从左侧选择章节开始学习</div>
            )
          )}
        </section>
      </div>
    </div>
  )
}
