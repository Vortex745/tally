# 此 Dockerfile 仅用于构建环境或作为参考，
# 因为微信小程序是客户端应用，不直接运行在 Docker 容器中。

# 使用 Node.js 作为基础镜像，方便运行 miniprogram-ci 或其他脚本
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 如果项目有 package.json，则安装依赖
# RUN if [ -f package.json ]; then npm install; fi

# 默认命令：打印说明
CMD ["echo", "Tunshu WeChat Mini Program Source Code Container. Use this for CI/CD builds."]
