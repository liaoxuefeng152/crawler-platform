# 多阶段构建：构建阶段
ARG CI_PROJECT_TITLE
FROM docker-registry.azgpu05.azshentong.com/starzz/az:${CI_PROJECT_TITLE}_vendor AS builder

# 设置构建参数
ARG CI_PROJECT_TITLE

# 设置工作目录
WORKDIR /app

# 复制项目配置文件
COPY project.config.json ./project.config.json

# 从配置文件读取项目名称并写入 .env.local（构建时需要）
# Next.js 的 NEXT_PUBLIC_* 变量在构建时嵌入到客户端代码中
RUN NEXT_PUBLIC_PROJECT_NAME=$(node -e "console.log(require('./project.config.json').projectName)") && \
    echo "NEXT_PUBLIC_PROJECT_NAME=$NEXT_PUBLIC_PROJECT_NAME" > .env.local && \
    echo "PROJECT_TABLE_PREFIX=$CI_PROJECT_TITLE" >> .env.local && \
    echo "📦 项目名称: $NEXT_PUBLIC_PROJECT_NAME" && \
    echo "📦 表名前缀: $CI_PROJECT_TITLE"

# 设置项目表名前缀（用于 Prisma Schema 生成）
ENV PROJECT_TABLE_PREFIX=${CI_PROJECT_TITLE}

# 数据库连接配置（构建阶段也需要，用于 Next.js 构建时的预渲染）
ENV DATABASE_URL="mongodb://mongo-service.gms:27017/wangzhenke"

# 复制package文件（利用Docker缓存层）
COPY package*.json ./

# 安装依赖（使用npm install代替npm ci，提高容错性）
RUN npm install --legacy-peer-deps --ignore-scripts

# 复制源代码
COPY . .

# 生成 Prisma Client（会读取 PROJECT_TABLE_PREFIX 环境变量）
RUN npx prisma generate

# 构建Next.js应用（会执行 generate-schema.js，使用 PROJECT_TABLE_PREFIX）
RUN npm run build

# ============================================
# 多阶段构建：运行阶段
# ============================================
FROM docker-registry.azgpu05.azshentong.com/starzz/az:${CI_PROJECT_TITLE}_vendor

# 设置版本信息（CI/CD会替换）
ENV VERSION=__VERSION__

# 设置工作目录
WORKDIR /app

# 设置Node.js环境变量
ENV NODE_ENV=production
ENV PORT=7860
ENV HOSTNAME=0.0.0.0

# 数据库连接配置（暂时写在 Dockerfile 中）
ENV DATABASE_URL="mongodb://mongo-service.gms:27017/wangzhenke"

# 设置项目表名前缀（运行时可能需要）
# 注意：实际的表名前缀在构建时已经硬编码到 Prisma Client 中
ARG CI_PROJECT_TITLE
ENV PROJECT_TABLE_PREFIX=${CI_PROJECT_TITLE}

# 复制项目配置文件（用于运行时读取项目名称）
COPY project.config.json ./project.config.json

# 从构建阶段复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# 复制 Prisma Client 生成的文件（运行时必需）
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 安装生产依赖（使用npm install代替npm ci，保持依赖一致性）
RUN npm install --legacy-peer-deps --production --ignore-scripts

# 暴露端口
EXPOSE 7860

# 启动命令
CMD ["npm", "start"]