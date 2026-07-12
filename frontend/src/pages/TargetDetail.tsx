import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '@uiw/react-markdown-preview'
import {
  targets,
  difficultyClass,
  difficultyLabel,
  type TargetTemplate,
} from '../api/content'
import {
  destroyInstance,
  isBackendOnline,
  spawnInstance,
  submitFlag,
  type Instance,
} from '../api/client'

// 倒计时格式化 mm:ss
function fmt(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}

export default function TargetDetail() {
  const { templateId } = useParams<{ templateId: string }>()
  const tid = Number(templateId)
  const target = targets.find((t: TargetTemplate) => t.id === tid)

  const [copied, setCopied] = useState(false)

  // ---- 动态实例状态 ----
  const [instance, setInstance] = useState<Instance | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [spawning, setSpawning] = useState(false)
  const [spawnErr, setSpawnErr] = useState<string | null>(null)
  const [flagInput, setFlagInput] = useState('')
  const [submitState, setSubmitState] = useState<
    { kind: 'idle' | 'ok' | 'bad' | 'err'; msg?: string }
  >({ kind: 'idle' })
  const tickRef = useRef<number | null>(null)

  const supportsDynamic = !!target && typeof target.template_id === 'number'
  const backendTplId = target?.template_id

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
  }, [])

  if (!target) {
    return (
      <div className="page">
        <Link to="/targets" className="back-link">
          ← 返回靶场列表
        </Link>
        <div className="empty-state">靶机不存在</div>
      </div>
    )
  }

  const startTick = (inst: Instance) => {
    if (tickRef.current) window.clearInterval(tickRef.current)
    const endAt = new Date(inst.expires_at).getTime()
    setRemaining(Math.max(0, Math.floor((endAt - Date.now()) / 1000)))
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = r - 1
        if (next <= 0) {
          if (tickRef.current) window.clearInterval(tickRef.current)
          tickRef.current = null
          setInstance(null)
        }
        return Math.max(0, next)
      })
    }, 1000)
  }

  const startInstance = async () => {
    if (!supportsDynamic || backendTplId === undefined) return
    setSpawning(true)
    setSpawnErr(null)
    setSubmitState({ kind: 'idle' })
    try {
      const inst = await spawnInstance(backendTplId)
      setInstance(inst)
      startTick(inst)
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setSpawnErr(typeof detail === 'string' ? detail : e?.message || '启动失败，请稍后重试')
    } finally {
      setSpawning(false)
    }
  }

  const stopInstance = async () => {
    if (!instance) return
    if (tickRef.current) window.clearInterval(tickRef.current)
    tickRef.current = null
    try {
      await destroyInstance(instance.id)
    } catch {
      /* 即便后端失败也清本地状态 */
    }
    setInstance(null)
  }

  const submit = async () => {
    if (!instance || !flagInput.trim()) return
    setSubmitState({ kind: 'idle' })
    try {
      const r = await submitFlag(instance.id, flagInput.trim())
      setSubmitState(
        r.correct
          ? { kind: 'ok', msg: r.message }
          : { kind: 'bad', msg: r.message }
      )
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setSubmitState({
        kind: 'err',
        msg: typeof detail === 'string' ? detail : '提交失败',
      })
    }
  }

  const copyDocker = async () => {
    try {
      await navigator.clipboard.writeText(target.docker_run)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="page target-detail">
      <Link to="/targets" className="back-link">
        ← 返回靶场列表
      </Link>

      <header className="target-header">
        <h1 className="page-title">{target.name}</h1>
        <div className="target-badges">
          <span className={`badge ${difficultyClass(target.difficulty)}`}>
            {difficultyLabel(target.difficulty)}
          </span>
          <span className="badge">{target.category}</span>
          {supportsDynamic && (
            <span className="badge badge-status-published">在线启动</span>
          )}
        </div>
        <p className="page-desc">{target.description}</p>
      </header>

      {supportsDynamic ? (
        <section className="card dynamic-card">
          <h3>在线靶机</h3>
          {!instance && (
            <>
              <p className="docker-hint">
                点击启动一个 <strong>临时容器</strong>（30 分钟后自动销毁）。
                通过反向代理访问，无需暴露公网端口；Flag 每次启动唯一。
              </p>
              <div className="action-row">
                <button
                  className="btn btn-primary"
                  onClick={startInstance}
                  disabled={spawning || !isBackendOnline()}
                >
                  {spawning ? '启动中…' : '启动实例'}
                </button>
                {!isBackendOnline() && (
                  <span className="docker-hint inline-warn">
                    后端服务暂不可用，试试稍后再来。
                  </span>
                )}
              </div>
              {spawnErr && (
                <div className="alert alert-error">启动失败：{spawnErr}</div>
              )}
            </>
          )}

          {instance && (
            <>
              <div className="instance-meta">
                <span className="badge badge-status-running">运行中</span>
                <span className="badge">剩余 {fmt(remaining)}</span>
                <span className="badge">容器 :{instance.host_port}</span>
                <button className="btn btn-sm btn-ghost" onClick={stopInstance}>
                  立即销毁
                </button>
              </div>
              <p className="docker-hint">
                访问链接：
                <a href={instance.proxy_url} target="_blank" rel="noreferrer">
                  {instance.proxy_url}
                </a>
                （新窗口打开，Flag 就在容器里）
              </p>

              <div className="flag-form">
                <input
                  type="text"
                  className="input"
                  placeholder="粘贴你找到的 flag，格式 flag{...}"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit()
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={!flagInput.trim()}
                >
                  提交 Flag
                </button>
              </div>
              {submitState.kind === 'ok' && (
                <div className="alert alert-ok">✓ {submitState.msg}</div>
              )}
              {submitState.kind === 'bad' && (
                <div className="alert alert-warn">✗ {submitState.msg}</div>
              )}
              {submitState.kind === 'err' && (
                <div className="alert alert-error">{submitState.msg}</div>
              )}
            </>
          )}
        </section>
      ) : (
        <section className="card docker-card">
          <h3>本地启动</h3>
          <p className="docker-hint">
            需要本机已安装 <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noreferrer">Docker</a>。
            复制以下命令到终端执行即可启动靶机。
          </p>
          <pre className="code-block">
            <code>{target.docker_run}</code>
          </pre>
          <button className="btn btn-primary btn-sm" onClick={copyDocker}>
            {copied ? '已复制 ✓' : '复制命令'}
          </button>
          <p className="docker-info">
            镜像：<code>{target.image}</code> · 端口：<code>{target.ports}</code>
          </p>
        </section>
      )}

      <section className="card">
        <h3>解题步骤</h3>
        <ol className="step-list">
          {target.solution_steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h3>技能标签</h3>
        <div className="skill-list">
          {target.skills.map((s) => (
            <span key={s} className="badge badge-skill">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>学习要点</h3>
        <Markdown
          source={
            '- ' +
            target.learn_points.map((p) => p.replace(/\n/g, '\n  ')).join('\n- ')
          }
        />
      </section>
    </div>
  )
}
