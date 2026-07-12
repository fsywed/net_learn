# Checklist

## 比赛与认证图片
- [x] competitions.json 中每个 CTF 比赛都有 image 字段
- [x] competitions.json 中每个认证考试都有 image 字段
- [x] competitions.json 中每个训练平台都有 image 字段
- [x] Competitions.tsx 卡片正确渲染 logo 图片
- [x] 图片加载失败时显示名称首字母 fallback
- [x] 图片样式美观（logo 容器尺寸、圆角、背景色）

## 靶场列表筛选
- [x] TargetList.tsx 有难度筛选下拉框（全部/easy/medium/hard）
- [x] TargetList.tsx 有分类筛选下拉框（全部/Web/PWN/Crypto/Reverse/Misc/Network/无线安全）
- [x] TargetList.tsx 有关键词搜索输入框
- [x] TargetList.tsx 有排序下拉框（按编号/按难度）
- [x] 筛选条件组合生效（难度+分类+关键词同时过滤）
- [x] 筛选工具栏样式美观

## 靶机数据模型
- [x] targets.json 每个靶机有 points 字段（积分）
- [x] targets.json 每个靶机有 estimated_time 字段（预计耗时）
- [x] targets.json 每个靶机有 solved_count 字段（解出人数）
- [x] category 字段对齐标准 CTF 分类
- [x] 卡片展示积分、耗时、解出人数

## 靶场详情页
- [x] iframe sandbox 不再同时开启 allow-same-origin 和 allow-scripts
- [x] 有"在新标签页打开"按钮
- [x] 按钮点击后在新标签页打开靶机地址

## CSS 清理
- [x] index.css 中 .countdown 相关样式已删除
- [x] index.css 中 .instance-running 相关样式已删除
- [x] index.css 中 .instance-idle 相关样式已删除
- [x] index.css 中 .submit-form 相关样式已删除
- [x] 删除后页面渲染正常

## 构建与部署
- [x] npm run build 成功无错误
- [x] 构建产物已复制到根目录
- [x] 已提交并推送到 GitHub
