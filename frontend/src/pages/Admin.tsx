import { useEffect, useState, type FormEvent } from 'react'
import {
  adminApi,
  courseApi,
  difficultyClass,
  difficultyLabel,
  getErrorMessage,
  type OverviewStats,
  type LeaderboardEntry,
  type AdminUser,
  type PaginatedUsers,
  type Course,
  type Chapter,
  type TargetTemplateAdmin,
} from '../api/services'

type Tab = 'overview' | 'users' | 'courses' | 'targets'

// 管理后台：标签页布局（概览/用户/课程/靶机）
export default function Admin() {
  const [tab, setTab] = useState<Tab>('overview')
  return (
    <div className="page admin-page">
      <h1 className="page-title">管理后台</h1>
      <div className="tabs">
        <button
          className={`tab${tab === 'overview' ? ' active' : ''}`}
          onClick={() => setTab('overview')}
        >
          概览
        </button>
        <button
          className={`tab${tab === 'users' ? ' active' : ''}`}
          onClick={() => setTab('users')}
        >
          用户
        </button>
        <button
          className={`tab${tab === 'courses' ? ' active' : ''}`}
          onClick={() => setTab('courses')}
        >
          课程
        </button>
        <button
          className={`tab${tab === 'targets' ? ' active' : ''}`}
          onClick={() => setTab('targets')}
        >
          靶机
        </button>
      </div>
      {tab === 'overview' && <AdminOverview />}
      {tab === 'users' && <AdminUsers />}
      {tab === 'courses' && <AdminCourses />}
      {tab === 'targets' && <AdminTargets />}
    </div>
  )
}

/* ---------- 概览：统计卡片 + 排行榜 ---------- */
function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([adminApi.overview(), adminApi.leaderboard()])
      .then(([s, b]) => {
        setStats(s)
        setBoard(b)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">加载中…</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!stats) return null

  const cards: Array<{ label: string; value: number }> = [
    { label: '用户总数', value: stats.users_total },
    { label: '学员', value: stats.students },
    { label: '管理员', value: stats.admins },
    { label: '靶机模板', value: stats.targets_total },
    { label: '已发布靶机', value: stats.targets_published },
    { label: '实例总数', value: stats.instances_total },
    { label: '运行中实例', value: stats.instances_running },
    { label: '提交总数', value: stats.submissions_total },
    { label: '通关总数', value: stats.solved_total },
  ]

  return (
    <div>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <section className="card">
        <h3>积分排行榜</h3>
        {board.length === 0 ? (
          <div className="empty-state">暂无数据</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>排名</th>
                <th>邮箱</th>
                <th>通关数</th>
                <th>积分</th>
              </tr>
            </thead>
            <tbody>
              {board.map((b, i) => (
                <tr key={b.user_id}>
                  <td>{i + 1}</td>
                  <td>{b.email}</td>
                  <td>{b.solved_count}</td>
                  <td>{b.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

/* ---------- 用户管理 ---------- */
function AdminUsers() {
  const [data, setData] = useState<PaginatedUsers | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const pageSize = 20

  const load = (p: number, role: string, status: string) => {
    setLoading(true)
    adminApi
      .users({
        page: p,
        page_size: pageSize,
        role: role || undefined,
        status: status || undefined,
      })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(page, filterRole, filterStatus)
  }, [page, filterRole, filterStatus])

  const toggleStatus = async (u: AdminUser) => {
    const next = u.status === 'active' ? 'disabled' : 'active'
    if (!window.confirm(`确认${next === 'active' ? '启用' : '禁用'}用户 ${u.email}？`))
      return
    setError('')
    try {
      await adminApi.updateUserStatus(u.id, next)
      load(page, filterRole, filterStatus)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const toggleRole = async (u: AdminUser) => {
    const next = u.role === 'admin' ? 'student' : 'admin'
    if (
      !window.confirm(
        `确认将用户 ${u.email} 设为${next === 'admin' ? '管理员' : '学员'}？`,
      )
    )
      return
    setError('')
    try {
      await adminApi.updateUserRole(u.id, next)
      load(page, filterRole, filterStatus)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading && !data) return <div className="loading-state">加载中…</div>
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filter-bar">
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value)
            setPage(1)
          }}
        >
          <option value="">全部角色</option>
          <option value="student">学员</option>
          <option value="admin">管理员</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      {data && data.items.length === 0 ? (
        <div className="empty-state">暂无用户</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>积分</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role === 'admin' ? '管理员' : '学员'}</td>
                <td>
                  <span
                    className={`badge ${u.status === 'active' ? 'badge-easy' : 'badge-hard'}`}
                  >
                    {u.status === 'active' ? '正常' : '禁用'}
                  </span>
                </td>
                <td>{u.score}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => toggleStatus(u)}>
                    {u.status === 'active' ? '禁用' : '启用'}
                  </button>
                  <button className="btn btn-sm" onClick={() => toggleRole(u)}>
                    {u.role === 'admin' ? '降为学员' : '升为管理员'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button
          className="btn btn-sm"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          上一页
        </button>
        <span>
          第 {page} / {totalPages} 页
        </span>
        <button
          className="btn btn-sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  )
}

/* ---------- 课程管理（CRUD + 章节管理） ---------- */
interface CourseForm {
  title: string
  description: string
  status: string
}

function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Course | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CourseForm>({
    title: '',
    description: '',
    status: 'published',
  })
  const [managingCourse, setManagingCourse] = useState<Course | null>(null)

  const load = () => {
    setLoading(true)
    adminApi
      .courses()
      .then(setCourses)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', status: 'published' })
    setShowForm(true)
  }
  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({ title: c.title, description: c.description, status: c.status })
    setShowForm(true)
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) await adminApi.updateCourse(editing.id, form)
      else await adminApi.createCourse(form)
      setShowForm(false)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }
  const remove = async (c: Course) => {
    if (!window.confirm(`确认删除课程「${c.title}」？`)) return
    setError('')
    try {
      await adminApi.deleteCourse(c.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (managingCourse)
    return (
      <ChapterManager
        course={managingCourse}
        onBack={() => {
          setManagingCourse(null)
          load()
        }}
      />
    )

  if (loading) return <div className="loading-state">加载中…</div>

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openCreate}>
          新增课程
        </button>
      </div>
      {courses.length === 0 ? (
        <div className="empty-state">暂无课程</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>描述</th>
              <th>状态</th>
              <th>章节数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td className="ellipsis">{c.description}</td>
                <td>{c.status}</td>
                <td>{c.chapters?.length ?? 0}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => setManagingCourse(c)}>
                    章节
                  </button>
                  <button className="btn btn-sm" onClick={() => openEdit(c)}>
                    编辑
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => remove(c)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? '编辑课程' : '新增课程'}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>标题</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowForm(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- 章节管理 ---------- */
interface ChapterForm {
  title: string
  content: string
  order: number
}

function ChapterManager({
  course,
  onBack,
}: {
  course: Course
  onBack: () => void
}) {
  const [chapters, setChapters] = useState<Chapter[]>(course.chapters ?? [])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ChapterForm>({
    title: '',
    content: '',
    order: 0,
  })
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    try {
      const list = await adminApi.courses()
      const found = list.find((x) => x.id === course.id)
      setChapters(found?.chapters ?? [])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: '', content: '', order: chapters.length + 1 })
    setShowForm(true)
  }

  // 编辑前先拉取章节详情获取 content
  const openEdit = async (ch: Chapter) => {
    setError('')
    try {
      const detail = await courseApi.chapter(course.id, ch.id)
      setEditingId(ch.id)
      setForm({
        title: detail.title,
        content: detail.content,
        order: detail.order,
      })
      setShowForm(true)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editingId) await adminApi.updateChapter(editingId, form)
      else await adminApi.createChapter(course.id, form)
      setShowForm(false)
      refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (ch: Chapter) => {
    if (!window.confirm(`确认删除章节「${ch.title}」？`)) return
    setError('')
    try {
      await adminApi.deleteChapter(ch.id)
      refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const sorted = [...chapters].sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="toolbar">
        <button className="btn" onClick={onBack}>
          ← 返回课程列表
        </button>
        <strong style={{ marginLeft: 'auto' }}>
          {course.title} · 章节管理
        </strong>
        <button className="btn btn-primary" onClick={openCreate}>
          新增章节
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {sorted.length === 0 ? (
        <div className="empty-state">暂无章节</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>序号</th>
              <th>标题</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ch) => (
              <tr key={ch.id}>
                <td>{ch.order}</td>
                <td>{ch.title}</td>
                <td className="actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => openEdit(ch)}
                    disabled={busy}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => remove(ch)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? '编辑章节' : '新增章节'}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>标题</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>内容（Markdown）</label>
                <textarea
                  rows={10}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>排序</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowForm(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- 靶机管理（CRUD，含 flag） ---------- */
interface TargetForm {
  name: string
  description: string
  difficulty: string
  image: string
  ports: string
  flag: string
  status: string
}

function AdminTargets() {
  const [targets, setTargets] = useState<TargetTemplateAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<TargetTemplateAdmin | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TargetForm>({
    name: '',
    description: '',
    difficulty: 'easy',
    image: '',
    ports: '',
    flag: '',
    status: 'published',
  })
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi
      .targets()
      .then(setTargets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      description: '',
      difficulty: 'easy',
      image: '',
      ports: '',
      flag: '',
      status: 'published',
    })
    setShowForm(true)
  }
  const openEdit = (t: TargetTemplateAdmin) => {
    setEditing(t)
    setForm({
      name: t.name,
      description: t.description,
      difficulty: t.difficulty,
      image: t.image,
      ports: t.ports,
      flag: t.flag,
      status: t.status,
    })
    setShowForm(true)
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editing) await adminApi.updateTarget(editing.id, form)
      else await adminApi.createTarget(form)
      setShowForm(false)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }
  const remove = async (t: TargetTemplateAdmin) => {
    if (!window.confirm(`确认删除靶机「${t.name}」？`)) return
    setError('')
    try {
      await adminApi.deleteTarget(t.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <div className="loading-state">加载中…</div>

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openCreate}>
          新增靶机
        </button>
      </div>
      {targets.length === 0 ? (
        <div className="empty-state">暂无靶机</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>难度</th>
              <th>镜像</th>
              <th>端口</th>
              <th>Flag</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>
                  <span className={`badge ${difficultyClass(t.difficulty)}`}>
                    {difficultyLabel(t.difficulty)}
                  </span>
                </td>
                <td>{t.image || '-'}</td>
                <td>{t.ports || '-'}</td>
                <td className="flag-cell">{t.flag}</td>
                <td>{t.status}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => openEdit(t)}>
                    编辑
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => remove(t)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? '编辑靶机' : '新增靶机'}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>名称</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>难度</label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value })
                  }
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              <div className="form-group">
                <label>镜像</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>端口</label>
                <input
                  value={form.ports}
                  onChange={(e) => setForm({ ...form, ports: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Flag</label>
                <input
                  value={form.flag}
                  onChange={(e) => setForm({ ...form, flag: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="published">已发布</option>
                  <option value="unlisted">已下架</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowForm(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
