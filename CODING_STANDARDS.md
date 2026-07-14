# 沁昊の脑洞实验室 — 开发规范

> 本文档是项目开发的**强制性准则**，每次开发前请先阅读。

---

## 1. Git 规范

### 1.1 分支策略
- `main` — 生产分支，只合入经过测试的代码
- `dev` — 开发分支，日常开发往此合并
- `feature/*` — 功能分支，如 `feature/ai-chat`
- `fix/*` — 修复分支

### 1.2 Commit 信息格式
```
<type>(<scope>): <description>

示例:
feat(blog): add markdown editor with live preview
fix(ai): correct embedding dimension mismatch
style(home): adjust hero section spacing
docs(readme): update deployment guide
```

**type 类型**: feat / fix / style / docs / refactor / test / chore

---

## 2. 后端规范 (Java / Spring Boot)

### 2.1 代码风格
- 包名: `com.jqhlab.*`，全小写
- 类名: PascalCase (如 `BlogController`)
- 方法名: camelCase (如 `getBlogPosts`)
- 变量名: camelCase，**禁止**单字母命名
- 缩进: 4 空格

### 2.2 分层架构
Controller → Service → Repository
- Controller: 只做参数校验和路由，不写业务逻辑
- Service: 业务逻辑在此，事务注解 `@Transactional`
- Repository: MyBatis-Plus，基础 CRUD 用 BaseMapper，复杂查询用 XML 或 LambdaQueryWrapper

### 2.3 API 设计规范
- RESTful 风格，统一前缀 `/api/`
- 分页参数: `?page=0&size=10` (从 0 开始)
- 返回格式统一:
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```
- 错误码: 200(成功) / 400(参数错误) / 401(未登录) / 403(无权限) / 404(不存在) / 500(服务器错误)

### 2.4 数据库规范
- 表名: 小写蛇形，复数，如 `blog_posts`
- 字段名: 小写蛇形，如 `created_at`
- 主键: `id` 类型 BIGSERIAL
- 时间字段: `created_at`, `updated_at` 自动管理
- 所有表必须包含 `id`, `created_at`, `updated_at`
- 使用 Flyway 管理迁移，SQL 文件命名: `V1__init.sql`, `V2__add_xxx.sql`

### 2.5 异常处理
- 使用全局 `@RestControllerAdvice`
- 自定义业务异常 `BusinessException`
- 不要在 Controller 里 try-catch

---

## 3. 前端规范 (React + Tailwind)

### 3.1 代码风格
- 使用函数组件
- 文件名: PascalCase 组件名，如 `BlogCard.jsx`
- 目录名: PascalCase Page 目录，如 `pages/Home/`
- Hooks: `use` 前缀，如 `useAuth.js`

### 3.2 组件设计
- 组件职责单一，一个文件一个组件
- 页面组件放在 `pages/` 下，通用组件放 `components/`
- 使用 Zustand 管理全局状态 (auth, ui)
- API 请求统一放在 `api/` 目录

### 3.3 样式规范
- 优先使用 Tailwind CSS 类
- 复杂样式使用 CSS Modules: `Component.module.css`
- 颜色变量定义在 `tailwind.config.js` 或 CSS 变量中
- 禁止行内 `style={{}}`

### 3.4 路由规范
```
/              → Home
/projects      → Projects
/portfolio     → Portfolio
/portfolio/:id → PortfolioDetail
/ai-chat       → AIChat
/blog          → Blog
/blog/:id      → BlogDetail
/login         → Login
/editor        → Editor (需登录)
/editor/:id    → Editor (编辑已有文章)
/dashboard     → Dashboard (需登录)
```

### 3.5 访客与管理员权限
- `role`: `admin` (你) / `guest` (访客)
- 访客可浏览所有页面 + AI对话，但编辑/发布/管理入口不可见
- `/editor`, `/dashboard` 路由在非 admin 时重定向到首页

---

## 4. AI 模块规范

### 4.1 DeepSeek API
- API Key 通过环境变量 `DEEPSEEK_API_KEY` 注入
- 流式响应 (SSE) 在前端逐字展示
- 失败重试策略: 最多 3 次，指数退避

### 4.2 RAG 流程
1. 用户提问 → 2. 向量化问题 → 3. pgvector 检索 TOP K → 4. 拼接上下文 → 5. DeepSeek 回答
- 知识库来源: 个人简历、项目文档、博客文章
- Embedding 模型: 使用 DeepSeek 的 embeddings API

---

## 5. Docker 部署规范

### 5.1 镜像命名
```
jqh-lab-frontend:latest
jqh-lab-backend:latest
postgres:15-alpine (官方)
```

### 5.2 多阶段构建
- 前端: Node 构建 → Nginx 运行
- 后端: Maven 构建 → JRE 运行

### 5.3 环境变量
- 敏感信息通过 `.env` 文件注入 docker-compose
- 提交到 Git 的只有 `.env.example`，不含真实值

---

## 6. 安全检查清单 (提交前自查)
- [ ] `.env` 未提交到 Git
- [ ] API Key 无硬编码
- [ ] JWT Token 有过期时间
- [ ] CORS 仅允许自己的域名
- [ ] 所有用户输入做了 XSS 过滤
- [ ] 访客无法访问管理接口
