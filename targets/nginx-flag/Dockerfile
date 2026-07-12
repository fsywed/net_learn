# Nginx Flag 隐藏靶机
# 启动时把环境变量 $FLAG 注入到首页 HTML 注释
# 用户通过查看页面源码（Ctrl+U）即可拿到 Flag

FROM nginx:1.27-alpine

# 删默认页，用我们自己的
RUN rm -f /usr/share/nginx/html/index.html

COPY index.html /usr/share/nginx/html/index.html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
