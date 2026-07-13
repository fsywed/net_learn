import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown'
import {
  problemsets,
  targets,
  difficultyClass,
  difficultyLabel,
  type Problem,
  type ProblemSet,
} from '../api/content'

export default function ProblemSetDetail() {
  const { setId } = useParams<{ setId: string }>()
  const sid = Number(setId)
  const ps = problemsets.find((p: ProblemSet) => p.id === sid)

  const [revealedHint, setRevealedHint] = useState<Set<number>>(new Set())
  const [revealedAnswer, setRevealedAnswer] = useState<Set<number>>(new Set())
  const [checkedProblem, setCheckedProblem] = useState<Set<number>>(new Set())

  if (!ps) {
    return (
      <div className="page">
        <Link to="/problemsets" className="back-link">
          ← 返回题单列表
        </Link>
        <div className="empty-state">题单不存在</div>
      </div>
    )
  }

  const toggleHint = (pid: number) => {
    const next = new Set(revealedHint)
    if (next.has(pid)) next.delete(pid)
    else next.add(pid)
    setRevealedHint(next)
  }

  const toggleAnswer = (pid: number) => {
    const next = new Set(revealedAnswer)
    if (next.has(pid)) next.delete(pid)
    else next.add(pid)
    setRevealedAnswer(next)
  }

  const toggleCheck = (pid: number) => {
    const next = new Set(checkedProblem)
    if (next.has(pid)) next.delete(pid)
    else next.add(pid)
    setCheckedProblem(next)
  }

  const completedCount = checkedProblem.size
  const totalCount = ps.problems.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="page problemset-detail">
      <Link to="/problemsets" className="back-link">
        ← 返回题单列表
      </Link>

      <header className="problemset-detail-header">
        <h1 className="page-title">{ps.title}</h1>
        <div className="target-badges">
          <span className={`badge ${difficultyClass(ps.difficulty)}`}>
            {difficultyLabel(ps.difficulty)}
          </span>
          {ps.tags.map((tag) => (
            <span key={tag} className="badge badge-skill">
              {tag}
            </span>
          ))}
        </div>
        <p className="page-desc">{ps.description}</p>

        {/* 进度条 */}
        <div className="problemset-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-text">
            已完成 {completedCount} / {totalCount} 题 ({progress}%)
          </p>
        </div>
      </header>

      <div className="problem-list">
        {ps.problems.map((problem: Problem, idx: number) => {
          const target = problem.target_id
            ? targets.find((t) => t.id === problem.target_id)
            : null
          const isChecked = checkedProblem.has(problem.id)

          return (
            <div
              key={problem.id}
              className={`problem-card ${isChecked ? 'done' : ''}`}
            >
              <div className="problem-card-header">
                <div className="problem-num">{idx + 1}</div>
                <div className="problem-info">
                  <h3>{problem.title}</h3>
                  <div className="problem-badges">
                    <span className={`badge ${difficultyClass(problem.difficulty)}`}>
                      {difficultyLabel(problem.difficulty)}
                    </span>
                    <span className="badge">{problem.type}</span>
                  </div>
                </div>
                <button
                  className={`check-btn ${isChecked ? 'checked' : ''}`}
                  onClick={() => toggleCheck(problem.id)}
                  title={isChecked ? '标记为未完成' : '标记为已完成'}
                >
                  {isChecked ? '✓' : '○'}
                </button>
              </div>

              <div className="problem-body">
                <div className="problem-desc">
                  <Markdown source={problem.description} />
                </div>

                {target && (
                  <div className="problem-target-link">
                    <span>🔗 关联靶机：</span>
                    <Link to={`/targets/${target.id}`} className="target-link">
                      {target.name}
                    </Link>
                  </div>
                )}

                <div className="problem-skills">
                  {problem.skills.map((s) => (
                    <span key={s} className="badge badge-skill">
                      {s}
                    </span>
                  ))}
                </div>

                {/* 提示 */}
                <details
                  className="problem-hint"
                  open={revealedHint.has(problem.id)}
                  onToggle={(e) => {
                    e.preventDefault()
                    toggleHint(problem.id)
                  }}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault()
                      toggleHint(problem.id)
                    }}
                  >
                    💡 {revealedHint.has(problem.id) ? '隐藏提示' : '查看提示'}
                  </summary>
                  <div className="hint-content">
                    <Markdown source={problem.hint} />
                  </div>
                </details>

                {/* 答案 */}
                <details
                  className="problem-answer"
                  open={revealedAnswer.has(problem.id)}
                  onToggle={(e) => {
                    e.preventDefault()
                    toggleAnswer(problem.id)
                  }}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault()
                      toggleAnswer(problem.id)
                    }}
                  >
                    🔑 {revealedAnswer.has(problem.id) ? '隐藏答案' : '查看答案'}
                  </summary>
                  <div className="answer-content">
                    <code>{problem.answer}</code>
                  </div>
                </details>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
