#!/bin/sh
# 启动时把 $FLAG 注入到首页 HTML 注释
set -eu

FLAG="${FLAG:-flag{default}}"

cat > /usr/share/nginx/html/index.html <<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <title>Nginx 靶机</title>
</head>
<body>
    <h1>欢迎来到 Nginx 靶机</h1>
    <p>这是一个用于学习「信息搜集」与「源码审计」的极简靶机。</p>
    <p>请尝试用 <kbd>Ctrl+U</kbd> 查看页面源码，Flag 就藏在里面。</p>
    <!-- $FLAG -->
</body>
</html>
HTML

# 交还给 nginx 前台进程
exec nginx -g 'daemon off;'
