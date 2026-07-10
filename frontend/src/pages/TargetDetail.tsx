import { useEffect, useState, useRef, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  targetApi,
  instanceApi,
  submissionApi,
  difficultyClass,
  difficultyLabel,
  getErrorMessage,
  type TargetTemplate,
  type Instance,
  type StartInstanceResponse,
  type SubmissionResult,
} from '../api/services'

// 靶机详情：启动/销毁靶机、倒计时、Flag 提交
export default function TargetDetail() {
  const { templateId } = useParams<{ templateId: string }>()
  const tid = Number(templateId)
  const [target, setTarget] = useState<TargetTemplate | null>(null)
  const [runningInstance, setRunningInstance] = useState<Instance | null>(null)
  const [access, setAccess] = useState<StartInstanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flag, setFlag] = useState('')
  const [submitResult, setSubmitResult] = useState<SubmissionResult | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 加载靶机详情 + 当前用户在该靶机上的运行实例
  const loadAll = async () => {
    try {
      const [t, list] = await Promise.all([targetApi.detail(tid), instanceApi.list()])
      setTarget(t)
      const mine = list.find(
        (i) => i.template_id === tid && i.status === 'running',
      )
      setRunningInstance(mine ?? null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid])

  // 剩余时间倒计时
  useEffect(() => {
    if (access && access.remaining_seconds > 0) {
      setRemaining(access.remaining_seconds)
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev === null) return null
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [access])

  const handleStart = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await instanceApi.start(tid)
      setAccess(res)
      setRunningInstance(res.instance)
      setSubmitResult(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleDestroy = async () => {
    if (!runningInstance) return
    if (!window.confirm('确认销毁该靶机实例？')) return
    setBusy(true)
    try {
      await instanceApi.destroy(runningInstance.id)
      setRunningInstance(null)
      setAccess(null)
      setRemaining(null)
      if (timerRef.current) clearInterval(timerRef.current)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!flag.trim()) return
    setBusy(true)
    setError('')
    try {
      const res = await submissionApi.submit(tid, flag.trim())
      setSubmitResult(res)
      if (res.is_correct) setFlag('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m} 分 ${sec.toString().padStart(2, '0')} 秒`
  }

  if (loading) return <div className="loading-state">加载中…</div>
  if (error && !target) return <div className="alert alert-error">{error}</div>
  if (!target) return <div className="empty-state">靶机不存在</div>

  return (
    <div className="page target-detail">
      <div>
        <h1 className="page-title">{target.name}</h1>
        <div className="target-meta">
          <span className={`badge ${difficultyClass(target.difficulty)}`}>
            {difficultyLabel(target.difficulty)}
          </span>
          <span className="badge">镜像 {target.image || '-'}</span>
          <span className="badge">端口 {target.ports || '-'}</span>
          <span className={`badge badge-status-${target.status}`}>{target.status}</span>
        </div>
      </div>
      <p className="page-desc">{target.description}</p>
      {error && <div className="alert alert-error">{error}</div>}

      {/* 实例操作区 */}
      <section className="card instance-card">
        <h3>靶机实例</h3>
        {!runningInstance && !access ? (
          <div className="instance-idle">
            <p>当前没有运行中的实例，点击启动开始挑战。</p>
            <button className="btn btn-primary" onClick={handleStart} disabled={busy}>
              {busy ? '启动中…' : '启动靶机'}
            </button>
          </div>
        ) : (
          <div className="instance-running">
            <div className="instance-info">
              <div>
                <strong>访问地址：</strong>
                {access
                  ? `${access.access_host}:${access.access_port}`
                  : `${runningInstance?.access_host ?? '-'}:${runningInstance?.access_port ?? '-'}`}
              </div>
              {remaining !== null && remaining > 0 && (
                <div className="countdown">
                  <strong>剩余时间：</strong>
                  {fmtTime(remaining)}
                </div>
              )}
              {remaining === 0 && <div className="countdown">实例已过期，请重新启动</div>}
              <div>
                <strong>实例状态：</strong>
                {runningInstance?.status ?? 'running'}
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleDestroy} disabled={busy}>
              销毁靶机
            </button>
          </div>
        )}
      </section>

      {/* Flag 提交区 */}
      <section className="card submit-card">
        <h3>提交 Flag</h3>
        <form className="submit-form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="flag{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            提交
          </button>
        </form>
        {submitResult && (
          <div
            className={`alert ${submitResult.is_correct ? 'alert-success' : 'alert-error'}`}
          >
            {submitResult.is_correct ? '✅ ' : '❌ '}
            {submitResult.message}
            {submitResult.score_awarded > 0 && (
              <span> · 获得 {submitResult.score_awarded} 积分</span>
            )}
            {submitResult.already_solved && <span> · 你此前已通关该靶机</span>}
          </div>
        )}
      </section>
    </div>
  )
}
