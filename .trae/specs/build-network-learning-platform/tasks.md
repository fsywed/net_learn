# Tasks

- [x] Task 1: 项目脚手架与基础设施搭建
  - [ ] SubTask 1.1: 初始化后端 FastAPI 项目结构（app/main.py、config、依赖管理 pyproject）
  - [ ] SubTask 1.2: 初始化前端 React + Vite 项目结构
  - [ ] SubTask 1.3: 编写 docker-compose.yml（PostgreSQL、Redis、后端、前端、靶机调度器）
  - [ ] SubTask 1.4: 编写后端数据库连接、Alembic 迁移初始化、基础配置加载

- [x] Task 2: 用户认证与角色模块
  - [ ] SubTask 2.1: 设计 User 模型（id、邮箱、密码哈希、角色、状态、积分、创建时间）
  - [ ] SubTask 2.2: 实现注册接口（邮箱校验、bcrypt 哈希、默认 student 角色）
  - [ ] SubTask 2.3: 实现登录接口并签发 JWT
  - [ ] SubTask 2.4: 实现认证依赖（解析 JWT、注入当前用户）与角色守卫（admin/student）
  - [ ] SubTask 2.5: 实现获取当前用户信息接口

- [x] Task 3: 课程内容系统
  - [ ] SubTask 3.1: 设计 Course、Chapter 模型与关系
  - [ ] SubTask 3.2: 实现管理员课程/章节 CRUD 接口
  - [ ] SubTask 3.3: 实现学员课程列表、章节详情查询接口
  - [ ] SubTask 3.4: 实现 Markdown 正文渲染（后端返回原文，前端渲染）

- [x] Task 4: 靶机模板库
  - [ ] SubTask 4.1: 设计 TargetTemplate 模型（名称、描述、难度、镜像、暴露端口、Flag、上架状态）
  - [ ] SubTask 4.2: 实现管理员靶机模板 CRUD 接口
  - [ ] SubTask 4.3: 实现学员靶机模板列表/详情接口（不返回 Flag）

- [x] Task 5: 靶机实例调度（核心）
  - [ ] SubTask 5.1: 设计 TargetInstance 模型（用户、模板、容器ID、映射端口、状态、过期时间）
  - [ ] SubTask 5.2: 封装 Docker SDK 调度器：创建容器、随机端口映射、销毁容器、查询状态
  - [ ] SubTask 5.3: 实现学员"启动靶机"接口（并发实例数限制、返回访问地址/端口/剩余时长）
  - [ ] SubTask 5.4: 实现学员"销毁靶机"接口与"我的实例列表"接口
  - [ ] SubTask 5.5: 实现超时自动回收任务（定时扫描过期实例并销毁）

- [x] Task 6: Flag 提交与积分
  - [ ] SubTask 6.1: 设计 Submission 模型（用户、模板、实例、Flag、是否正确、时间）
  - [ ] SubTask 6.2: 实现 Flag 提交接口：比对预期 Flag、记录提交、首次正确发放积分、标记通关
  - [ ] SubTask 6.3: 实现"我的通关记录"接口

- [x] Task 7: 个人中心与统计
  - [ ] SubTask 7.1: 实现学员个人中心接口（通关数、积分、最近活动）
  - [ ] SubTask 7.2: 实现管理员统计接口（用户数、靶机使用数、通关排行）

- [x] Task 8: 后台管理接口
  - [ ] SubTask 8.1: 实现用户管理接口（列表、禁用/启用）
  - [ ] SubTask 8.2: 复用 Task 3/4 的管理接口，统一在 admin 路由前缀下组织

- [x] Task 9: 前端 Web 界面
  - [ ] SubTask 9.1: 搭建前端骨架（路由、布局、请求封装、登录态管理）
  - [ ] SubTask 9.2: 实现登录/注册页
  - [ ] SubTask 9.3: 实现课程列表与章节阅读页
  - [ ] SubTask 9.4: 实现靶机列表、详情、启动/销毁、Flag 提交页
  - [ ] SubTask 9.5: 实现个人中心页
  - [ ] SubTask 9.6: 实现管理后台页（用户、课程、靶机模板、统计）

- [x] Task 10: 部署与验收
  - [ ] SubTask 10.1: 完善 docker-compose 一键启动，验证各服务连通
  - [ ] SubTask 10.2: 编写最少一个示例靶机镜像（含 Flag）用于联调
  - [ ] SubTask 10.3: 端到端走通：注册→登录→学习→启动靶机→提交 Flag→查看积分

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3、Task 4 依赖 Task 2（需要鉴权）
- Task 5 依赖 Task 4（需要靶机模板）
- Task 6 依赖 Task 5（需要实例）
- Task 7、Task 8 依赖 Task 2~6
- Task 9 依赖后端各 Task 接口就绪（可并行开发前端骨架）
- Task 10 依赖全部完成
