# Tasks

- [ ] Task 1: 为比赛与认证页面添加图片资源
  - [ ] SubTask 1.1: 在 competitions.json 中为每个 CTF 比赛、认证考试、训练平台添加 image 字段（使用官方 logo URL 或首字母占位方案）
  - [ ] SubTask 1.2: 修改 Competitions.tsx，在卡片中渲染 logo 图片，支持加载失败时显示名称首字母 fallback
  - [ ] SubTask 1.3: 在 index.css 中添加图片相关样式（logo 容器、fallback 占位符）

- [ ] Task 2: 优化靶场列表页（筛选/搜索/排序）
  - [ ] SubTask 2.1: 修改 TargetList.tsx，增加难度筛选下拉框、分类筛选下拉框、关键词搜索输入框、排序下拉框（按难度/按编号）
  - [ ] SubTask 2.2: 在 index.css 中添加筛选工具栏样式

- [ ] Task 3: 扩展靶机数据模型与卡片信息
  - [ ] SubTask 3.1: 在 targets.json 中为每个靶机添加 points（积分）、estimated_time（预计耗时）、solved_count（解出人数）字段
  - [ ] SubTask 3.2: 将 category 字段对齐标准 CTF 分类（Web/PWN/Crypto/Reverse/Misc/Network/无线安全）
  - [ ] SubTask 3.3: 修改 TargetList.tsx 卡片，展示积分、耗时、解出人数等元信息
  - [ ] SubTask 3.4: 更新 content.ts 中的分类映射（如需要）

- [ ] Task 4: 靶场详情页 iframe 安全与可用性优化
  - [ ] SubTask 4.1: 修正 TargetDetail.tsx 中 iframe 的 sandbox 配置，移除 allow-same-origin
  - [ ] SubTask 4.2: 在 iframe 旁增加"在新标签页打开"按钮作为兜底方案

- [ ] Task 5: 清理 CSS 残留死代码
  - [ ] SubTask 5.1: 删除 index.css 中 .countdown、.instance-running、.instance-idle、.submit-form 等未使用的样式

- [ ] Task 6: 构建验证与部署
  - [ ] SubTask 6.1: 运行 npm run build 确认无 TypeScript 编译错误
  - [ ] SubTask 6.2: 复制构建产物到根目录，提交并推送到 GitHub

# Task Dependencies
- Task 2、Task 3 可并行（均涉及 TargetList.tsx，需协调合并）
- Task 1、Task 4、Task 5 相互独立，可并行
- Task 6 依赖所有前置任务完成
