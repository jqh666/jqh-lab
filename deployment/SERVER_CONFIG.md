# 服务器配置说明

这套部署方式适用于“本地打包后上传服务器”的场景，不需要 Git 仓库。

## 服务器要求

- Ubuntu / Debian 推荐
- Java 17
- Nginx
- 可访问你的 PostgreSQL、Redis 和通义千问 API

一键脚本会自动安装 Java 17、Nginx、curl。

## 端口

云服务器安全组需要放行：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS，后续配置证书时使用

后端 Spring Boot 监听 `8080`，只在服务器本机使用，不需要对公网开放。

## 部署后的目录

```text
/opt/jqh-lab/backend/app.jar       后端 jar
/var/www/jqh-lab/                  前端静态文件
/etc/systemd/system/jqh-lab-backend.service
/etc/nginx/conf.d/jqh-lab.conf
```

## 常用命令

查看后端日志：

```bash
journalctl -u jqh-lab-backend -f
```

重启后端：

```bash
systemctl restart jqh-lab-backend
```

重启 Nginx：

```bash
nginx -t
systemctl restart nginx
```

查看端口：

```bash
ss -lntp | grep -E '80|8080'
```

## HTTPS

如果你有域名，可以部署完成后安装 Certbot：

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名
```
