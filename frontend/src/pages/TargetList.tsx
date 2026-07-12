import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  targets,
  difficultyClass,
  difficultyLabel,
  type TargetTemplate,
} from '../api/content'

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'
type CategoryFilter =
  | 'all'
  | 'Web'
  | 'PWN'
  | 'Crypto'
  | 'Reverse'
  | 'Misc'
  | 'Network'
  | '无线安全'
type SortBy = 'id' | 'difficulty' | 'points'

// 难度排序权重：easy < medium < hard
const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

// 靶场列表：展示所有靶机，公开可访问
export default function TargetList() {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('id')

  // 难度 + 分类 + 关键词组合过滤，再按所选维度排序
  const filteredTargets = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const list = targets.filter((t: TargetTemplate) => {
      if (difficulty !== 'all' && t.difficulty !== difficulty) return false
      if (category !== 'all' && t.category !== category) return false
      if (kw) {
        const hay = `${t.name} ${t.description}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
    const sorted = [...list]
    if (sortBy === 'difficulty') {
      sorted.sort(
        (a, b) =>
          (DIFFICULTY_ORDER[a.difficulty] || 99) -
          (DIFFICULTY_ORDER[b.difficulty] || 99),
      )
    } else if (sortBy === 'points') {
      sorted.sort((a, b) => b.points - a.points)
    } else {
      sorted.sort((a, b) => a.id - b.id)
    }
    return sorted
  }, [difficulty, category, keyword, sortBy])

  return (
    <div className="page">
      <h1 className="page-title">靶场</h1>
      <p className="page-desc">点击进入查看 Docker 启动命令、解题步骤与学习要点。</p>

      <div className="targets-toolbar">
        <select
          className="toolbar-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
          aria-label="按难度筛选"
        >
          <option value="all">难度：全部</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>

        <select
          className="toolbar-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          aria-label="按分类筛选"
        >
          <option value="all">分类：全部</option>
          <option value="Web">Web</option>
          <option value="PWN">PWN</option>
          <option value="Crypto">Crypto</option>
          <option value="Reverse">Reverse</option>
          <option value="Misc">Misc</option>
          <option value="Network">Network</option>
          <option value="无线安全">无线安全</option>
        </select>

        <input
          className="toolbar-input"
          type="text"
          placeholder="搜索靶机名称或描述…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          aria-label="搜索靶机"
        />

        <select
          className="toolbar-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="排序方式"
        >
          <option value="id">排序：按编号</option>
          <option value="difficulty">按难度</option>
          <option value="points">按积分</option>
        </select>
      </div>

      <div className="toolbar-info">
        共 {filteredTargets.length} / {targets.length} 个靶机
      </div>

      {filteredTargets.length === 0 ? (
        <div className="empty-state">没有符合条件的靶机，试试调整筛选条件。</div>
      ) : (
        <div className="card-grid">
          {filteredTargets.map((t: TargetTemplate) => (
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
              <div className="target-meta">
                <span className="meta-item">积分 {t.points}</span>
                <span className="meta-item">耗时 {t.estimated_time}</span>
                <span className="meta-item">解出 {t.solved_count}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
