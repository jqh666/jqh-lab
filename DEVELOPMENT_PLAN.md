# 沁昊の脑洞实验室 — 开发计划

> 本文档分阶段描述项目开发步骤，按顺序执行。
> 项目路径: `E:/project/Interview/jqh-lab/`
> 域名: `jqh666.icu`

---

## 阶段零：前置准备

### 0.1 环境要求
| 工具 | 版本要求 | 用途 |
|---|---|---|
| Node.js | >= 18 | 前端开发 |
| Java | >= 17 | 后端开发 |
| Maven | >= 3.8 | 后端构建 |
| Docker | >= 24 | 容器化部署 |
| Docker Compose | >= 2.20 | 多容器编排 |
| PostgreSQL | 15 + pgvector | 数据库 |

### 0.2 本地开发准备
```bash
node -v
java -version
mvn -v
docker -v
docker compose version
```

---

## 第一阶段：项目桑手架搭建

### Step 1.1 初始化 React 前端
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install react-router-dom zustand axios
npm install tailwindcss @tailwindcss/vite
```

### Step 1.2 初始化 Spring Boot 后端
- 使用 Spring Initializr 生成基础项目
- 依赖: Spring Web, MyBatis-Plus, Spring Security, PostgreSQL Driver, Flyway, Lombok, Validation
- 导入到 `backend/` 目录

### Step 1.3 配置 Docker 环境
- 编写 `frontend/Dockerfile` (多阶段: node构建 → nginx运行)
- 编写 `backend/Dockerfile` (多阶段: maven构建 → jre运行)
- 编写 `docker-compose.yml` (frontend + backend + postgres)
- 编写 `.env.example` 环境变量模板
- 编写 `nginx.conf`

### Step 1.4 配置文件结构
- `application.yml`: 数据源配置、JWT 配置、DeepSeek 配置
- `vite.config.js`: 代理 `/api` 到后端

### 产出物
- [x] React 项目可 `npm run dev` 启动
- [x] Spring Boot 项目可 `mvn spring-boot:run` 启动
- [x] Docker Compose 可一键启动三个容器

---

## 第二阶段：数据库设计

### Step 2.1 编写 Flyway 迁移脚本
`V1__init.sql` 包含所有表的创建:

```sql
-- 1. 开启 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. blog_categories 分类表
CREATE TABLE blog_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. blog_posts 文章表
CREATE TABLE blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content_md TEXT NOT NULL,
    category_id BIGINT REFERENCES blog_categories(id),
    tags TEXT[],
    status VARCHAR(20) DEFAULT ''published'',
    cover_image VARCHAR(500),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. projects 项目表
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tech_stack TEXT[],
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    cover_image VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. portfolio_items 作品集表
CREATE TABLE portfolio_items (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images TEXT[],
    demo_url VARCHAR(500),
    category VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. knowledge_docs RAG知识库表
CREATE TABLE knowledge_docs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200),
    source VARCHAR(50),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. users 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(20) DEFAULT ''admin'',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建向量索引
CREATE INDEX idx_knowledge_docs_embedding ON knowledge_docs
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 插入默认分类
INSERT INTO blog_categories (name, slug, sort_order) VALUES
    (''技术'', ''tech'', 1),
    (''生活'', ''life'', 2),
    (''成长'', ''growth'', 3),
    (''碎碎念'', ''random'', 4);
```

### Step 2.2 创建 Entity + Mapper 类
- Entity: 对应数据表
- Mapper: 继承 BaseMapper，注解 @Mapper

### 产出物
- [x] 数据库迁移脚本可用
- [x] Entity + Mapper 映射正确
- [x] 可自动建表

---

## 第三阶段：后端 API 开发

### Step 3.1 基础框架搭建
- 全局统一响应 `ApiResponse<T>`
- 全局异常处理 `GlobalExceptionHandler`
- 自定义异常 `BusinessException`
- CORS 配置
- JWT 认证 + Security 配置

### Step 3.2 Auth 模块
- `POST /api/auth/login` — 管理员登录，返回 JWT
- `GET /api/auth/me` — 获取当前用户信息
- 访客模式下 JWT 可传可不传，后端识别 role

### Step 3.3 Blog 模块
- `GET /api/blogs?page=0&size=10&category=tech` — 分页查询
- `GET /api/blogs/:id` — 文章详情
- `GET /api/blogs/categories` — 分类列表
- `POST /api/blogs` — 创建文章 (Admin only)
- `PUT /api/blogs/:id` — 更新文章 (Admin only)
- `DELETE /api/blogs/:id` — 删除文章 (Admin only)

### Step 3.4 Project 模块
- `GET /api/projects` — 项目列表
- `GET /api/projects/:id` — 项目详情
- `POST /api/projects` — 创建 (Admin)
- `PUT /api/projects/:id` — 更新 (Admin)
- `DELETE /api/projects/:id` — 删除 (Admin)

### Step 3.5 Portfolio 模块
- `GET /api/portfolio` — 作品集列表
- `GET /api/portfolio/:id` — 作品详情
- `POST /api/portfolio` — 创建 (Admin)
- `PUT /api/portfolio/:id` — 更新 (Admin)
- `DELETE /api/portfolio/:id` — 删除 (Admin)

### Step 3.6 AI Chat 模块
- `POST /api/ai/chat` — 对话接口 (SSE 流式)
- `POST /api/ai/upload-knowledge` — 上传知识文档 (Admin)
- `GET /api/ai/knowledge-list` — 知识库列表

### Step 3.7 Dashboard 模块
- `GET /api/dashboard/stats` — 统计数据 (Admin)

### 产出物
- [x] 所有 API 可用并可 Postman 测试
- [x] 权限控制正确 (admin/guest)
- [x] SSE 流式输出正常工作

---

## 第四阶段：前端页面开发

### Step 4.1 布局与路由
- 创建 `App.jsx` 路由配置
- 创建 `Navbar.jsx` — 浮动导航
- 创建 `Footer.jsx` — 版权信息
- 创建 `ProtectedRoute.jsx` — 访客拦截管理页

### Step 4.2 首页 (`/`)
- Hero 区域: 头像 + 一句话介绍 + CTA
- 技能图谱: 环形图或标签云
- 数据卡片: 项目数、文章数
- 最新博客: 最近 3 篇
- 精选项目: 3 个 featured 项目

### Step 4.3 项目经验 (`/projects`)
- 项目卡片网格布局
- 封面图、标题、描述、技术栈标签

### Step 4.4 作品集 (`/portfolio`)
- 网格布局，每项展示第一张图片 + 标题
- 悬浮动效，点击进入详情页
- 详情页展示全部图片 + 详细信息

### Step 4.5 AI 对话 (`/ai-chat`)
- 聊天界面 UI
- SSE 流式展示回答

### Step 4.6 博客 (`/blog` + `/blog/:id`)
- 分类 Tab 切换
- 文章卡片列表
- Markdown 渲染 + 目录锚点

### Step 4.7 登录页 (`/login`)
- 管理员登录 + 访客一键进入按钮

### Step 4.8 文章编辑器 (`/editor`)
- Markdown 编辑器 + 实时预览
- 标题、分类、标签、封面图

### Step 4.9 仪表盘 (`/dashboard`)
- 统计数据卡片

### 产出物
- [x] 所有页面可访问
- [x] 访客/管理员权限正确

---

## 第五阶段：AI + RAG 模块

### Step 5.1 DeepSeek API 接入
- `DeepSeekClient` 封装
- SSE 流式响应

### Step 5.2 RAG 流程实现
1. 文档入库生成 embedding
2. 问题向量化 → pgvector 检索 → 拼接上下文 → DeepSeek

### Step 5.3 知识库管理
- 上传简历/文档
- 博客自动同步

### 产出物
- [x] AI 对话正常
- [x] RAG 检索准确

---

## 第六阶段：Docker 部署

### Step 6.1 Dockerfile
- frontend: node构建 → nginx运行
- backend: maven构建 → jre运行

### Step 6.2 docker-compose.yml
- frontend + backend + postgres(pgvector)

### Step 6.3 Nginx 配置
- HTTPS 跳转 + 反向代理

### Step 6.4 腾讯云部署
1. 服务器安装 Docker
2. DNS 解析
3. SSL 证书
4. 运行部署脚本

### 产出物
- [x] 一键部署可用
- [x] HTTPS 正常访问
