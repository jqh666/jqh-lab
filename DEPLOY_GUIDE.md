# 部署指南

本项目推荐用 Docker Compose 部署到 Linux 服务器。

## 服务器准备

```bash
ssh root@你的服务器IP
apt-get update
curl -fsSL https://get.docker.com | bash -s docker
apt-get install -y docker-compose-plugin git
```

如果使用云服务器安全组，放行：

- `80`：HTTP 访问
- `443`：HTTPS 访问，配置证书后使用
- `22`：SSH

后端 `8080` 不需要对公网开放，前端 Nginx 会在容器网络内反向代理。

## 上传项目

方式一：用 Git。

```bash
cd /opt
git clone <你的仓库地址> jqh-lab
cd jqh-lab
```

方式二：本地上传。

```bash
scp -r jqh-lab root@你的服务器IP:/opt/
ssh root@你的服务器IP
cd /opt/jqh-lab
```

## 启动

```bash
chmod +x deploy.sh
./deploy.sh
```

部署完成后访问：

```text
http://你的服务器IP
```

## 更新

```bash
cd /opt/jqh-lab
git pull
docker compose build
docker compose up -d
```

## 查看日志

```bash
docker compose logs -f --tail=100
docker compose logs -f backend
docker compose logs -f frontend
```

## HTTPS

有域名后，可以在服务器安装 Nginx + Certbot，把 HTTPS 流量转发到本项目的 `80` 端口。

```bash
apt-get install -y nginx certbot python3-certbot-nginx
certbot --nginx -d 你的域名
```

Nginx 反代示例：

```nginx
server {
    listen 80;
    server_name 你的域名;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
