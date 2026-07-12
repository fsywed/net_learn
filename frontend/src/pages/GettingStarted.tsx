import { Link } from 'react-router-dom'

export default function GettingStarted() {
  const steps = [
    {
      num: 1,
      title: '启动本地靶机容器',
      icon: '📦',
      desc: '在你的电脑上启动靶机环境。每个靶机都是一个独立的 Docker 容器，运行真实的安全漏洞场景。',
      actions: [
        '安装 Docker（Windows/Mac 用 Docker Desktop，Linux 用 apt/yum）',
        '克隆项目仓库：git clone https://github.com/fsywed/net_learn.git',
        '进入 targets/local 目录',
        '选择靶机，执行 python target1_nginx.py 8081 &',
      ],
      tip: '不需要 Docker 也能运行！所有靶机都是纯 Python 脚本，直接 python xxx.py 端口 即可启动。',
      link: { to: '/targets', text: '去靶场选择题目 →' },
    },
    {
      num: 2,
      title: '访问网站浏览题目',
      icon: '🌐',
      desc: '打开网站，浏览靶机列表，选择适合你的难度和方向的题目。',
      actions: [
        '访问 https://fsywed.github.io/net_learn/',
        '进入"靶场"页面',
        '用筛选器按难度（入门/中等/困难）和方向（Web/PWN/Crypto 等）找到题目',
        '点击题目查看详情，阅读题目描述和提示',
      ],
      tip: '新手建议从"简单"难度开始，方向选择 Web 或 Misc。',
      link: { to: '/targets', text: '去靶场 →' },
    },
    {
      num: 3,
      title: '准备攻击工具',
      icon: '🛠️',
      desc: '根据题目类型，准备对应的工具。不需要买任何软件，全部免费。',
      actions: [
        '浏览器：Chrome/Firefox（内置开发者工具 F12）',
        'Burp Suite Community Edition（免费，Web 题目必备）',
        'curl / Postman（构造 HTTP 请求）',
        'Python 3（写脚本自动化攻击）',
        'Wireshark（流量分析题目）',
      ],
      tip: '访问"工具箱"页面查看完整工具清单和安装指南。',
      link: { to: '/toolbox', text: '查看工具箱 →' },
    },
    {
      num: 4,
      title: '在网站连接靶机',
      icon: '🔌',
      desc: '在靶机详情页输入本地靶机地址，网站会嵌入靶机页面，方便你边攻击边参考解题步骤。',
      actions: [
        '启动靶机后记住端口号（如 8081）',
        '在网站输入 http://localhost:8081',
        '点击"连接靶机"',
        '如果失败，检查靶机是否启动、端口是否正确',
      ],
      tip: '你也可以直接在新标签页打开 http://localhost:8081，不用通过网站嵌入。',
    },
    {
      num: 5,
      title: '分析题目并攻击',
      icon: '⚔️',
      desc: '使用你的工具和知识，找到并利用漏洞，获取 Flag。',
      actions: [
        '阅读题目描述，理解场景',
        '查看"解题步骤"获取提示（但不要直接看答案）',
        '使用工具探测漏洞（如用 Burp 抓包、用 curl 构造请求）',
        '尝试利用漏洞（如 SQL 注入、XSS、文件读取等）',
        '找到 Flag（格式通常为 flag{...}）',
      ],
      tip: '遇到困难时，先看"学习要点"复习相关知识，再尝试动手。',
    },
    {
      num: 6,
      title: '提交 Flag 验证',
      icon: '🏁',
      desc: '将找到的 Flag 提交到网站验证。正确后标记该题已完成。',
      actions: [
        '在靶机详情页的 Flag 输入框粘贴 flag{...}',
        '点击"提交 Flag"',
        '看到"Flag 正确！"表示成功',
        '回顾"学习要点"，理解漏洞原理和防御方案',
      ],
      tip: '即使提交成功，也建议重做一次，确保真正理解了漏洞原理。',
    },
  ]

  return (
    <div className="getting-started">
      <h1 className="page-title">新手入门指南</h1>
      <p className="page-subtitle">
        第一次使用？按照以下 6 个步骤，从零开始完成你的第一个网络安全挑战。
      </p>

      <div className="flow-diagram">
        <div className="flow-node">📦 启动容器</div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">🌐 浏览网站</div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">🛠️ 准备工具</div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">🔌 连接靶机</div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">⚔️ 攻击题目</div>
        <div className="flow-arrow">→</div>
        <div className="flow-node">🏁 提交 Flag</div>
      </div>

      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.num} className="step-card">
            <div className="step-header">
              <span className="step-number">{step.num}</span>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
            </div>
            <p className="step-desc">{step.desc}</p>
            <ul className="step-actions">
              {step.actions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
            <div className="step-tip">
              <strong>💡 提示：</strong>
              {step.tip}
            </div>
            {step.link && (
              <Link to={step.link.to} className="step-link">
                {step.link.text}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2>准备好开始了吗？</h2>
        <p>推荐新手从「Web 安全入门」课程和「Nginx Flag 隐藏」靶机开始。</p>
        <div className="cta-buttons">
          <Link to="/courses" className="btn btn-primary">
            浏览课程
          </Link>
          <Link to="/targets" className="btn btn-outline">
            进入靶场
          </Link>
        </div>
      </div>
    </div>
  )
}
