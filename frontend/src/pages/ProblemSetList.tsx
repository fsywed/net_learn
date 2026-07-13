import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  problemsets,
  difficultyClass,
  difficultyLabel,
  type ProblemSet,
} from '../api/content'

export default function ProblemSetList() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [search, setSearch] = useState('')

  const filtered = problemsets.filter((ps: ProblemSet) => {
    const matchDiff = filter === 'all' || ps.difficulty === filter
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      ps.title.toLowerCase().includes(q) ||
      ps.description.toLowerCase().includes(q) ||
      ps.tags.some((t) => t.toLowerCase().includes(q))
    return matchDiff && matchSearch
  })

  return (
    <div className="page">
      <h1 className="page-title">📋 题单</h1>
      <p className="page-desc">
        按主题分类的练习题单，从入门到进阶，每道题都有提示和答案。选择感兴趣的题单开始挑战吧！
      </p>

      {/* 筛选工具栏 */}
      <div className="targets-toolbar">
        <input
          type="text"
          className="input"
          placeholder="搜索题单标题、标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              className={`filter-chip${filter === d ? ' active' : ''}`}
              onClick={() => setFilter(d)}
            >
              {d === 'all'
                ? '全部'
                : d === 'easy'
                  ? '简单'
                  : d === 'medium'
                    ? '中等'
                    : '困难'}
            </button>
          ))}
        </div>
      </div>

      <div className="problemset-grid">
        {filtered.map((ps) => (
          <div className="problemset-card" key={ps.id}>
            <div className="problemset-header">
              <h3 className="problemset-title">{ps.title}</h3>
              <span className={`badge ${difficultyClass(ps.difficulty)}`}>
                {difficultyLabel(ps.difficulty)}
              </span>
            </div>
            <p className="problemset-desc">{ps.description}</p>
            <div className="problemset-tags">
              {ps.tags.map((tag) => (
                <span key={tag} className="badge badge-skill">
                  {tag}
                </span>
              ))}
            </div>
            <div className="problemset-meta">
              <span>📝 {ps.problems.length} 道题</span>
            </div>
            <Link
              to={`/problemsets/${ps.id}`}
              className="btn btn-primary btn-sm"
            >
              开始做题 →
            </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">没有找到匹配的题单</div>
      )}
    </div>
  )
}
