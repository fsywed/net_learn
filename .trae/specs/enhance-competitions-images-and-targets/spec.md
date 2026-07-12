# 比赛认证图片增强与靶场体验优化 Spec

## Why
当前"比赛与认证"页面纯文字展示，缺乏视觉吸引力；靶场页面经过与 HackTheBox、TryHackMe、VulnHub、PentesterLab、攻防世界、BUUCTF 等主流平台对比，存在筛选缺失、信息单薄、分类非标准、CSS 残留死代码等问题，影响用户体验和学习引导效果。

## What Changes
- 比赛与认证页面：为 CTF 比赛、认证考试、训练平台卡片添加 logo/图标图片
- 靶场列表页：增加按难度、分类筛选 + 关键词搜索 + 排序功能
- 靶场数据模型：targets.json 增加 `points`（积分）、`estimated_time`（预计耗时）、`solved_count`（解出人数）字段
- 靶场分类：对齐标准 CTF 分类（Web/PWN/Crypto/Reverse/Misc/Network/无线安全）
- 靶场详情页：清理 index.css 残留死代码（.countdown、.instance-running 等）
- 靶场详情页：iframe 增加"在新标签页打开"兜底按钮，修正 sandbox 配置

## Impact
- Affected specs: build-network-learning-platform（靶场相关需求）
- Affected code:
  - `/workspace/frontend/src/data/competitions.json`（新增 image 字段）
  - `/workspace/frontend/src/data/targets.json`（新增字段、调整分类）
  - `/workspace/frontend/src/pages/Competitions.tsx`（渲染图片）
  - `/workspace/frontend/src/pages/TargetList.tsx`（筛选/搜索/排序）
  - `/workspace/frontend/src/pages/TargetDetail.tsx`（iframe 兜底）
  - `/workspace/frontend/src/api/content.ts`（分类映射）
  - `/workspace/frontend/src/index.css`（清理死代码 + 新样式）

## ADDED Requirements

### Requirement: 比赛与认证图片展示
系统 SHALL 为每个 CTF 比赛、认证考试、训练平台卡片展示对应的 logo 或代表性图标图片，提升视觉识别度。

#### Scenario: 图片正常加载
- **WHEN** 用户访问比赛与认证页面
- **THEN** 每个 CTF/认证/平台卡片显示 logo 图片

#### Scenario: 图片加载失败
- **WHEN** 图片 URL 无法加载
- **THEN** 显示名称首字母作为 fallback 占位符

### Requirement: 靶场列表筛选与搜索
系统 SHALL 提供按难度、分类筛选 + 关键词搜索 + 排序功能，帮助用户在 20+ 靶机中快速定位。

#### Scenario: 按难度筛选
- **WHEN** 用户选择"hard"难度
- **THEN** 列表只显示 difficulty 为 hard 的靶机

#### Scenario: 关键词搜索
- **WHEN** 用户输入"SQL"
- **THEN** 列表显示名称或描述含"SQL"的靶机

### Requirement: 靶机元信息扩展
系统 SHALL 为每个靶机展示积分、预计耗时、解出人数等元信息，对齐主流平台。

#### Scenario: 卡片信息展示
- **WHEN** 用户查看靶机列表卡片
- **THEN** 卡片显示难度、分类、积分、预计耗时、技能标签

## MODIFIED Requirements

### Requirement: 靶机分类体系
将 category 字段对齐标准 CTF 分类：Web / PWN / Crypto / Reverse / Misc / Network / 无线安全，替代当前的"服务""加密"等非标准分类。

### Requirement: iframe 安全与可用性
详情页 iframe SHALL 修正 sandbox 配置（移除 allow-same-origin 与 allow-scripts 同时开启的风险组合），并增加"在新标签页打开"按钮作为兜底方案。

## REMOVED Requirements

### Requirement: CSS 残留死代码
**Reason**: index.css 中 .countdown、.instance-running、.instance-idle、.submit-form 等样式是旧后端实例管理方案的遗留，当前组件未使用
**Migration**: 直接删除，不影响现有功能
