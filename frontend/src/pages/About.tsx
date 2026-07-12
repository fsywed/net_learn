// 关于页面：项目说明
export default function About() {
  return (
    <div className="page about-page">
      <h1 className="page-title">关于 NetLearn</h1>
      <div className="card about-content">
        <h3>项目初衷</h3>
        <p>
          NetLearn 是一个面向网络安全爱好者的纯静态学习平台。
          通过系统化课程与可本地启动的 Docker 靶机，
          帮助学习者从理论到实践掌握 Web 安全、渗透测试等核心技能。
        </p>

        <h3>技术栈</h3>
        <ul>
          <li>React 18 + TypeScript + Vite 5</li>
          <li>React Router v6（纯客户端路由）</li>
          <li>静态 JSON 数据 + Markdown 渲染</li>
          <li>GitHub Pages 部署</li>
        </ul>

        <h3>特点</h3>
        <ul>
          <li>无需注册登录，零摩擦</li>
          <li>无需后端服务，永不宕机</li>
          <li>内容构建时打包，秒级加载</li>
          <li>所有靶机提供本地 Docker 启动方式</li>
        </ul>

        <h3>贡献</h3>
        <p>
          欢迎在{' '}
          <a
            href="https://github.com/fsywed/net_learn"
            target="_blank"
            rel="noreferrer"
          >
            GitHub 仓库
          </a>{' '}
          提交 Issue 或 PR，新增课程章节、靶机模板。
        </p>

        <h3>免责声明</h3>
        <p className="disclaimer">
          本站仅供学习用途。所有靶机漏洞演示均在受控环境下进行，
          请勿用于未授权的系统访问。技术学习应遵守所在国家/地区的法律法规。
        </p>
      </div>
    </div>
  )
}
