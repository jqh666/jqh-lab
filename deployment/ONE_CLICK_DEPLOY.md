# 一键部署命令

## 1. 本地生成发布包

在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\build-release.ps1
```

生成文件：

```text
release/jqh-lab-release.tar.gz
```

这个压缩包里包含：

- 后端 `app.jar`
- 前端 `dist`
- 服务器一键部署脚本 `deploy.sh`
- 配置说明文档

## 2. 上传到服务器

```powershell
scp .\release\jqh-lab-release.tar.gz root@你的服务器IP:/root/
```

## 3. 服务器一条命令部署

如果你还没有域名：

```bash
cd /root && tar -xzf jqh-lab-release.tar.gz && cd jqh-lab-release && sudo bash deploy.sh
```

如果你已有域名：

```bash
cd /root && tar -xzf jqh-lab-release.tar.gz && cd jqh-lab-release && sudo bash deploy.sh 你的域名
```

部署完成后访问：

```text
http://你的服务器IP
```

或：

```text
http://你的域名
```

## 4. 更新部署

以后每次修改代码后，重复：

```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\build-release.ps1
scp .\release\jqh-lab-release.tar.gz root@你的服务器IP:/root/
```

然后在服务器执行：

```bash
cd /root && rm -rf jqh-lab-release && tar -xzf jqh-lab-release.tar.gz && cd jqh-lab-release && sudo bash deploy.sh
```
