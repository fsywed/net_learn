# 在线网络安全学习平台（含在线靶机）Spec

## Why
当前需要一个让用户能够在线学习网络安全相关知识、并通过实战靶机进行动手练习的 Web 平台。平台需要将"理论课程"与"靶机实操"结合，让学习者在隔离环境中安全地进行渗透测试、CTF 等练习，避免在真实网络中误操作。

## What Changes
- 新增用户认证与角色系统（学员 / 管理员），支持注册、登录、会话管理
- 新增课程/章节内容系统，支持图文教程的发布与浏览
- 新增靶机镜像库（基于 Docker），管理员可上架/下架靶机模板
- 新增靶机实例管理：学员可一键启动属于自己的隔离靶机实例，并获取访问地址与端口
- 新增练习记录与积分系统：记录学员做题状态、提交 Flag、自动判分
- 新增后台管理面板：管理用户、课程、靶机模板、查看统计数据
- 新增前端 Web 界面（响应式），覆盖学习、靶机、个人中心、后台等页面

## Impact
- Affected specs: 无（全新项目）
- Affected code: 全新仓库，包含前端、后端 API、靶机调度服务、数据库 schema、Docker 镜像管理
- 技术栈建议：后端 Python (FastAPI) + PostgreSQL + Redis；前端 React + Vite；靶机调度基于 Docker SDK；部署使用 Docker Compose

## ADDED Requirements

### Requirement: 用户认证与角色
系统 SHALL 提供基于账号密码的用户注册与登录，并区分 `student`（学员）与 `admin`（管理员）两种角色。系统 SHALL 使用 JWT 进行会话保持，密码 SHALL 使用 bcrypt 等算法加密存储。

#### Scenario: 学员注册登录
- **WHEN** 未注册用户使用有效邮箱与密码注册
- **THEN** 系统创建 `student` 角色账号并返回登录态

#### Scenario: 权限拦截
- **WHEN** 学员访问管理员接口
- **THEN** 系统返回 403 并拒绝访问

### Requirement: 课程内容系统
系统 SHALL 支持管理员创建课程与章节，每个章节包含标题与 Markdown 正文。系统 SHALL 提供课程列表、章节详情的查询接口供学员浏览。

#### Scenario: 浏览课程
- **WHEN** 学员打开课程列表
- **THEN** 系统返回所有已发布课程及其章节概览

### Requirement: 靶机镜像库
系统 SHALL 维护靶机模板库，每个模板包含名称、描述、难度、Docker 镜像地址、暴露端口、预期 Flag。管理员 SHALL 能新增/编辑/下架靶机模板。

#### Scenario: 上架靶机
- **WHEN** 管理员提交靶机模板（镜像、端口、Flag）
- **THEN** 模板入库并对学员可见

### Requirement: 靶机实例调度
系统 SHALL 在学员请求启动靶机时，为其创建一个隔离的 Docker 容器实例，并将容器的端口映射到主机随机端口供学员访问。系统 SHALL 限制每个学员同一靶机的并发实例数（默认 1），并支持学员主动销毁实例或超时自动回收。

#### Scenario: 启动靶机
- **WHEN** 学员点击"启动靶机"
- **THEN** 系统拉起隔离容器并返回访问地址、端口、剩余时长

#### Scenario: 超时回收
- **WHEN** 实例存活时间超过上限（默认 60 分钟）
- **THEN** 系统自动销毁该容器

### Requirement: Flag 提交与积分
系统 SHALL 允许学员对某靶机实例提交 Flag，系统比对模板中的预期 Flag 后判定是否正确。首次正确提交 SHALL 给予积分奖励并记录为"已通关"。

#### Scenario: 正确提交 Flag
- **WHEN** 学员提交与预期一致的 Flag
- **THEN** 系统记录通关、发放积分、返回成功

### Requirement: 个人中心与统计
系统 SHALL 提供学员个人中心，展示已通关靶机、积分、学习进度。系统 SHALL 提供管理员后台的用户与靶机使用统计。

#### Scenario: 查看个人进度
- **WHEN** 学员打开个人中心
- **THEN** 系统返回其通关数、积分、最近活动

### Requirement: 后台管理
系统 SHALL 提供管理员后台，支持管理用户（查看/禁用）、管理课程（增删改查）、管理靶机模板（增删改查）、查看全局统计。

#### Scenario: 禁用用户
- **WHEN** 管理员禁用某学员
- **THEN** 该学员无法再登录

## MODIFIED Requirements
无（全新项目）

## REMOVED Requirements
无（全新项目）
