import { useState } from 'react'

type Tool = {
  name: string
  category: string
  description: string
  install: string
  usage: string
  platforms: string[]
  free: boolean
}

const tools: Tool[] = [
  {
    name: 'Chrome / Firefox 开发者工具',
    category: 'Web 基础',
    description: '浏览器内置调试工具，查看源码、网络请求、Cookie、LocalStorage。',
    install: '已随浏览器安装，按 F12 打开',
    usage: 'Elements（查看 DOM）、Network（查看请求响应）、Application（查看 Cookie）',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'Burp Suite Community Edition',
    category: 'Web 安全',
    description: 'Web 安全测试的核心工具，拦截和修改 HTTP/HTTPS 请求。',
    install: 'https://portswigger.net/burp/communitydownload',
    usage: '设置浏览器代理为 127.0.0.1:8080，开启 Intercept 拦截请求，修改后 Forward',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'curl',
    category: 'Web 基础',
    description: '命令行 HTTP 客户端，快速构造和发送请求。',
    install: 'Linux/Mac 自带；Windows 用 Git Bash 或 scoop install curl',
    usage: 'curl -X POST -d "username=admin" http://localhost:8081/login',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'Python 3',
    category: '通用',
    description: '写脚本自动化攻击、解密、数据处理。',
    install: 'https://www.python.org/downloads/',
    usage: 'python exploit.py 或 python -c "print(1+1)"',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'Wireshark',
    category: '网络 / 取证',
    description: '网络协议分析工具，分析 pcap 流量包。',
    install: 'https://www.wireshark.org/download.html',
    usage: '打开 pcap 文件 → 过滤 http → 右键 Follow → TCP Stream',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'tshark',
    category: '网络 / 取证',
    description: 'Wireshark 的命令行版本，适合批量处理。',
    install: '随 Wireshark 安装',
    usage: 'tshark -r capture.pcap -Y "http.request" -T fields -e http.host',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'Ghidra',
    category: '逆向工程',
    description: 'NSA 开源的逆向工程框架，反编译二进制程序。',
    install: 'https://ghidra-sre.org/',
    usage: 'File → Import → 选择二进制 → 分析 → 在 Symbol Tree 中查看函数',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'zsteg',
    category: 'Misc / 隐写',
    description: 'PNG/BMP 图片 LSB 隐写扫描工具。',
    install: 'gem install zsteg（需要 Ruby）',
    usage: 'zsteg -a flag.png',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'binwalk',
    category: 'Misc / 隐写',
    description: '文件提取工具，从文件中分离嵌入的其他文件。',
    install: 'pip install binwalk 或 apt install binwalk',
    usage: 'binwalk -e combined_file',
    platforms: ['Mac', 'Linux'],
    free: true,
  },
  {
    name: 'Volatility',
    category: '取证',
    description: '内存取证框架，分析内存镜像（raw/dmp）。',
    install: 'pip install volatility3',
    usage: 'vol.py -f mem.raw windows.info 或 linux.pslist',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'CyberChef',
    category: 'Crypto / 编码',
    description: '在线编码/解码/加密工具箱，支持 100+ 种操作。',
    install: 'https://gchq.github.io/CyberChef/（纯网页，无需安装）',
    usage: '拖拽操作：From Base64 → To Hex → XOR（输入密钥）',
    platforms: ['Web'],
    free: true,
  },
  {
    name: 'hashcat',
    category: 'Crypto / 密码破解',
    description: '世界最快的密码恢复工具，支持 GPU 加速。',
    install: 'https://hashcat.net/hashcat/',
    usage: 'hashcat -m 0 hash.txt wordlist.txt',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'sqlmap',
    category: 'Web 安全',
    description: '自动化 SQL 注入检测和利用工具。',
    install: 'pip install sqlmap',
    usage: 'sqlmap -u "http://target.com/page?id=1" --dump',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'nmap',
    category: '网络',
    description: '网络扫描和端口发现工具。',
    install: 'https://nmap.org/download.html',
    usage: 'nmap -sV -p- localhost',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
  {
    name: 'exiftool',
    category: 'Misc / 隐写',
    description: '读取和编辑图片/文件的 EXIF 元数据。',
    install: 'https://exiftool.org/',
    usage: 'exiftool flag.jpg',
    platforms: ['Windows', 'Mac', 'Linux'],
    free: true,
  },
]

export default function Toolbox() {
  const [filter, setFilter] = useState('全部')
  const categories = ['全部', ...Array.from(new Set(tools.map((t) => t.category)))]

  const filtered = filter === '全部' ? tools : tools.filter((t) => t.category === filter)

  return (
    <div className="toolbox-page">
      <h1 className="page-title">🛠️ 工具箱</h1>
      <p className="page-subtitle">
        做网络安全题目需要的工具，全部免费。根据题目类型选择对应工具。
      </p>

      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="tools-grid">
        {filtered.map((tool) => (
          <div key={tool.name} className="tool-card">
            <div className="tool-header">
              <h3>{tool.name}</h3>
              {tool.free && <span className="free-badge">免费</span>}
            </div>
            <p className="tool-desc">{tool.description}</p>

            <div className="tool-section">
              <strong>安装：</strong>
              <code className="tool-code">{tool.install}</code>
            </div>

            <div className="tool-section">
              <strong>用法：</strong>
              <code className="tool-code">{tool.usage}</code>
            </div>

            <div className="tool-meta">
              <span className="tool-category">{tool.category}</span>
              <span className="tool-platforms">{tool.platforms.join(' / ')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbox-tip">
        <h3>💡 新手工具组合建议</h3>
        <ul>
          <li><strong>Web 题目：</strong>Chrome F12 + Burp Suite + curl</li>
          <li><strong>Crypto 题目：</strong>Python + CyberChef</li>
          <li><strong>Reverse 题目：</strong>Ghidra + Python</li>
          <li><strong>Misc 题目：</strong>zsteg + binwalk + exiftool</li>
          <li><strong>Forensics 题目：</strong>Wireshark + Volatility</li>
        </ul>
      </div>
    </div>
  )
}
