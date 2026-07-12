import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '@uiw/react-markdown-preview'
import {
  targets,
  difficultyClass,
  difficultyLabel,
  type TargetTemplate,
} from '../api/content'

export default function TargetDetail() {
  const { templateId } = useParams<{ templateId: string }>()
  const tid = Number(templateId)
  const target = targets.find((t: TargetTemplate) => t.id === tid)

  const [copied, setCopied] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [connected, setConnected] = useState(false)
  const [connectErr, setConnectErr] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [flagInput, setFlagInput] = useState('')
  const [submitState, setSubmitState] = useState<
    { kind: 'idle' | 'ok' | 'bad' | 'err'; msg?: string }
  >({ kind: 'idle' })
  const [showSolution, setShowSolution] = useState(false)
  const [confirmShow, setConfirmShow] = useState(false)

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

  // 默认地址
  const defaultUrl = `http://localhost:${target.default_port}`

  // 检查靶机是否在线（调用 /api/health）
  const checkHealth = async (url: string): Promise<boolean> => {
    try {
      const resp = await fetch(`${url}/api/health`, { mode: 'cors' })
      return resp.ok
    } catch {
      return false
    }
  }

  // 连接靶机
  const connectTarget = async () => {
    const url = (targetUrl || defaultUrl).trim().replace(/\/+$/, '')
    setConnectErr(null)
    setChecking(true)
    try {
      const ok = await checkHealth(url)
      if (!ok) {
        setConnectErr(
          `无法连接到 ${url}。请确认：1) Docker 容器已启动  2) 地址正确  3) 浏览器未拦截 CORS 请求`
        )
        setConnected(false)
        return
      }
      setTargetUrl(url)
      setConnected(true)
    } catch {
      setConnectErr(`连接失败，请检查地址 ${url} 是否正确`)
      setConnected(false)
    } finally {
      setChecking(false)
    }
  }

  // 断开连接
  const disconnect = () => {
    setConnected(false)
    setConnectErr(null)
    setSubmitState({ kind: 'idle' })
  }

  // 提交 Flag（调用靶机本地的 /api/verify）
  const submit = async () => {
    if (!flagInput.trim() || !connected) return
    setSubmitState({ kind: 'idle' })
    try {
      const resp = await fetch(`${targetUrl}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: flagInput.trim() }),
      })
      const data = await resp.json()
      setSubmitState(
        data.correct
          ? { kind: 'ok', msg: data.message || 'Flag 正确！' }
          : { kind: 'bad', msg: data.message || 'Flag 错误，再找找看。' }
      )
    } catch {
      setSubmitState({
        kind: 'err',
        msg: `无法连接到 ${targetUrl}/api/verify，请确认靶机仍在运行`,
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

  // 在新标签页打开靶机地址
  const openInNewTab = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank')
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
        </div>
        <p className="page-desc">{target.description}</p>
      </header>

      {/* 步骤 1：下载并启动容器 */}
      <section className="card docker-card">
        <h3>第 1 步：启动靶机容器</h3>
        <p className="docker-hint">
          需要本机已安装{' '}
          <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noreferrer">
            Docker
          </a>
          。复制以下命令到终端执行：
        </p>
        <pre className="code-block">
          <code>{target.docker_run}</code>
        </pre>
        <button className="btn btn-primary btn-sm" onClick={copyDocker}>
          {copied ? '已复制 ✓' : '复制命令'}
        </button>
        <p className="docker-info">
          启动后访问 <code>http://localhost:{target.default_port}</code> 即可看到靶机页面。
        </p>
      </section>

      {/* 步骤 2：输入地址连接靶机 */}
      <section className="card connect-card">
        <h3>第 2 步：连接靶机</h3>
        <p className="docker-hint">
          输入靶机地址（默认 <code>{defaultUrl}</code>），点击「连接靶机」在下方嵌入靶机页面。
        </p>
        <div className="connect-row">
          <input
            type="text"
            className="input"
            placeholder={defaultUrl}
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') connectTarget()
            }}
            disabled={connected}
          />
          {!connected ? (
            <button
              className="btn btn-primary"
              onClick={connectTarget}
              disabled={checking}
            >
              {checking ? '检测中…' : '连接靶机'}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={disconnect}>
              断开
            </button>
          )}
        </div>
        {connectErr && (
          <div className="alert alert-warn">{connectErr}</div>
        )}
      </section>

      {/* 步骤 3：靶机 iframe + Flag 提交 */}
      {connected && (
        <section className="card target-frame-card">
          <h3>第 3 步：攻击靶机 & 提交 Flag</h3>
          {targetUrl && (
            <button
              className="btn btn-outline btn-sm open-tab-btn"
              onClick={openInNewTab}
            >
              在新标签页打开 ↗
            </button>
          )}
          <div className="frame-wrapper">
            <iframe
              src={targetUrl}
              title="靶机页面"
              className="target-iframe"
              sandbox="allow-scripts allow-forms allow-popups"
            />
          </div>
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
        </section>
      )}

      <section className="card">
        <h3>推荐工具</h3>
        <div className="tool-suggestions">
          {target.category === 'Web' && (
            <ul>
              <li><strong>浏览器 F12</strong>：查看源码、网络请求、Cookie</li>
              <li><strong>Burp Suite</strong>：拦截和修改 HTTP 请求</li>
              <li><strong>curl</strong>：快速构造请求</li>
            </ul>
          )}
          {target.category === 'PWN' && (
            <ul>
              <li><strong>pwntools</strong>：Python 漏洞利用框架</li>
              <li><strong>checksec</strong>：检查二进制保护机制</li>
              <li><strong>GDB + pwndbg</strong>：动态调试</li>
            </ul>
          )}
          {target.category === 'Crypto' && (
            <ul>
              <li><strong>Python + gmpy2</strong>：大数运算和破解</li>
              <li><strong>CyberChef</strong>：在线编码解码</li>
              <li><strong>hashcat</strong>：密码破解</li>
            </ul>
          )}
          {target.category === 'Reverse' && (
            <ul>
              <li><strong>Ghidra</strong>：反编译二进制</li>
              <li><strong>IDA Pro / Cutter</strong>：高级逆向分析</li>
              <li><strong>Python</strong>：编写解密脚本</li>
            </ul>
          )}
          {target.category === 'Misc' && (
            <ul>
              <li><strong>zsteg</strong>：图片 LSB 扫描</li>
              <li><strong>binwalk</strong>：文件提取</li>
              <li><strong>exiftool</strong>：元数据查看</li>
            </ul>
          )}
          {target.category === 'Forensics' && (
            <ul>
              <li><strong>Wireshark</strong>：流量分析</li>
              <li><strong>Volatility</strong>：内存取证</li>
              <li><strong>tshark</strong>：命令行流量提取</li>
            </ul>
          )}
          {target.category === 'Network' && (
            <ul>
              <li><strong>Wireshark</strong>：抓包分析</li>
              <li><strong>nmap</strong>：端口扫描</li>
              <li><strong>curl</strong>：构造请求</li>
            </ul>
          )}
          {target.category === '无线安全' && (
            <ul>
              <li><strong>aircrack-ng</strong>：WiFi 破解</li>
              <li><strong>hashcat</strong>：密码破解</li>
              <li><strong>Wireshark</strong>：流量分析</li>
            </ul>
          )}
          <p className="tool-more">
            查看完整工具清单 → <Link to="/toolbox">工具箱</Link>
          </p>
        </div>
      </section>

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
