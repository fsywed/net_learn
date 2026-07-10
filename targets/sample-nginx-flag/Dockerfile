# 示例靶机镜像：基于 nginx:alpine，首页藏有 Flag
# 镜像名：netlearn/sample-nginx-flag:latest
FROM nginx:alpine

# 将含 Flag 的首页覆盖到 nginx 默认 html 目录
COPY index.html /usr/share/nginx/html/index.html

# 暴露 HTTP 端口
EXPOSE 80
