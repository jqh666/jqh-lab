# JQH Lab

JQH Lab 是一个个人实验室与作品展示站，包含个人主页、项目经历、作品集、博客后台和基于知识库的 AI 对话能力。项目采用前后端分离架构，前端负责交互与展示，后端提供内容管理、认证、文件上传、RAG 知识库和流式 AI 对话接口。

## 功能

- 个人主页：个人介绍、技能栈、数据概览与入口导航
- 项目经历：项目卡片展示和后台管理
- 作品集：作品列表、详情页与图片上传
- 博客系统：分类、列表、详情、Markdown 编辑与发布
- AI 对话：SSE 流式响应、会话记忆、知识库问答
- 知识库管理：文档上传、切分、向量化与检索
- 后台仪表盘：基础数据统计
- 认证权限：访客访问公开页面，管理员访问编辑和管理页面

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | React 19, Vite 6, Tailwind CSS 4, Framer Motion, Three.js |
| 后端 | Java 17, Spring Boot 3.2, Spring Security, WebFlux, MyBatis-Plus |
| 数据库 | PostgreSQL, Flyway |
| 缓存/记忆 | Redis |
| AI | Qwen API, Embedding, RAG |
| 部署 | Docker, Docker Compose, Nginx |

## 目录结构

```text
jqh-lab/
├── backend/                 # Spring Boot 后端服务
├── frontend/                # React + Vite 前端应用
├── deployment/              # 部署脚本与服务器配置
├── server-deploy-*/         # 服务器部署材料
├── docker-compose.yml       # 容器编排
├── .env.example             # 环境变量模板
└── README.md
```

## 环境变量

复制模板并填写真实配置：

```bash
cp .env.example .env
```

主要变量：

| 变量 | 说明 |
| --- | --- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC 地址 |
| `DB_USERNAME` | PostgreSQL 用户名 |
| `DB_PASSWORD` | PostgreSQL 密码 |
| `REDIS_URL` | Redis 连接地址 |
| `JWT_SECRET` | JWT 签名密钥，建议至少 32 位 |
| `QWEN_API_KEY` | 通义千问 API Key |
| `QWEN_MODEL` | 对话模型，默认 `qwen-turbo` |
| `ADMIN_USERNAME` | 初始化管理员用户名 |
| `ADMIN_PASSWORD` | 初始化管理员密码 |

## 本地开发

### 1. 启动依赖服务

可以使用本地 PostgreSQL 和 Redis，也可以用 Docker 启动：

```bash
docker run -d --name jqh-postgres \
  -e POSTGRES_DB=jqh_lab \
  -e POSTGRES_USER=jqh \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:15

docker run -d --name jqh-redis \
  -p 6379:6379 redis:7
```

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

## Docker 部署

```bash
cp .env.example .env
docker compose up -d --build
```

当前 `docker-compose.yml` 会构建并启动后端和前端服务；PostgreSQL 与 Redis 可使用外部服务，连接信息通过 `.env` 注入。

## 常用命令

```bash
# 前端生产构建
cd frontend
npm run build

# 后端打包
cd backend
mvn clean package -DskipTests

# 查看容器日志
docker compose logs -f --tail=100
```

## API 概览

- `POST /api/auth/login`：管理员登录
- `GET /api/projects`：项目列表
- `GET /api/portfolio`：作品列表
- `GET /api/blogs`：博客列表
- `POST /api/ai/chat`：AI 流式对话
- `GET /api/ai/knowledge-list`：知识库列表
- `POST /api/upload/image`：图片上传
- `GET /api/dashboard/stats`：仪表盘统计

## 说明

仓库不提交构建产物、依赖目录、上传文件和真实环境变量。请在生产环境中使用强密码和独立密钥，并确保 `.env` 不进入版本控制。
