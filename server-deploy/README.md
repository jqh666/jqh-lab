# JQH Lab Docker 部署包

服务器 IP：`118.195.205.69`

## 目录结构

上传到服务器前，保证目录是这样：

```text
server-deploy-118.195.205.69/
  docker-compose.yml
  deploy.sh
  backend/
    Dockerfile
    app.jar
  frontend/
    Dockerfile
    nginx.conf
    dist/
      index.html
      assets/
```

其中：

- `backend/app.jar`：你本地 Maven 打包出来的后端 jar
- `frontend/dist/`：你本地 `npm run build` 打包出来的前端 dist

## 本地准备

后端打包：

```powershell
cd E:\project\Interview\jqh-lab\backend
mvn clean package -DskipTests
```

把生成的 jar 复制到：

```text
E:\project\Interview\jqh-lab\server-deploy-118.195.205.69\backend\app.jar
```

前端打包：

```powershell
cd E:\project\Interview\jqh-lab\frontend
npm run build
```

把 `frontend/dist` 整个文件夹复制到：

```text
E:\project\Interview\jqh-lab\server-deploy-118.195.205.69\frontend\dist
```

## 上传服务器

在 `E:\project\Interview\jqh-lab` 下执行：

```powershell
scp -r .\server-deploy-118.195.205.69 root@118.195.205.69:/root/
```

## 一键部署

SSH 到服务器：

```bash
ssh root@118.195.205.69
```

执行：

```bash
cd /root/server-deploy-118.195.205.69
chmod +x deploy.sh
sudo bash deploy.sh
```

访问：

```text
http://118.195.205.69
```

## 常用命令

查看容器：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f --tail=100
```

只看后端日志：

```bash
docker compose logs -f backend
```

只看前端 Nginx 日志：

```bash
docker compose logs -f frontend
```

重新部署：

```bash
cd /root/server-deploy-118.195.205.69
sudo bash deploy.sh
```

## 注意

服务器安全组需要放行 `80` 端口。

你的后端配置目前写在 jar 内的 `application.yml`，包括 PostgreSQL、Redis、Qwen 配置。只要本地打包前配置正确，上传后的 jar 会直接使用这些配置。
