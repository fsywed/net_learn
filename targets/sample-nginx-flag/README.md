# 示例靶机：Nginx Flag 查找

用于平台端到端联调与新手熟悉 Flag 提交流程的最小示例靶机。

## 镜像信息

| 项目     | 值                                   |
| -------- | ------------------------------------ |
| 镜像名   | `netlearn/sample-nginx-flag:latest`  |
| 暴露端口 | `80`                                 |
| 难度     | easy                                 |
| Flag     | `flag{w3lc0me_t0_n3t_l3arn}`         |

## 描述

基于 `nginx:alpine` 的最小靶机镜像。启动后通过浏览器访问首页，Flag 隐藏在
页面 HTML 源码的注释中，学员需查看源代码（`Ctrl+U`）找到形如 `flag{...}` 的
字符串并提交到平台，即可通关并获得积分。

## 构建镜像（可选，平台会按模板 image 字段拉取/构建）

```bash
cd targets/sample-nginx-flag
docker build -t netlearn/sample-nginx-flag:latest .
```

## 练习步骤

1. 在平台「靶机」列表找到「示例：Nginx Flag 查找」并点击启动。
2. 浏览器访问 `http://<主机IP>:<映射端口>`。
3. 按 `Ctrl+U` 查看页面源代码，定位 `flag{...}` 字符串。
4. 回到平台靶机详情页提交 Flag，正确后将获得 10 积分（easy 难度）。
