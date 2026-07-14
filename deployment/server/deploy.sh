#!/bin/bash
set -euo pipefail

APP_NAME="jqh-lab"
APP_DIR="/opt/${APP_NAME}"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="/var/www/${APP_NAME}"
SERVICE_NAME="${APP_NAME}-backend"
SERVER_NAME="${1:-_}"
CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo bash deploy.sh"
  exit 1
fi

if [ ! -f "${CURRENT_DIR}/backend/app.jar" ]; then
  echo "Missing backend/app.jar. Please run deployment/build-release.ps1 locally first."
  exit 1
fi

if [ ! -d "${CURRENT_DIR}/frontend/dist" ]; then
  echo "Missing frontend/dist. Please run deployment/build-release.ps1 locally first."
  exit 1
fi

echo "==> Installing system packages"
if command -v apt-get >/dev/null 2>&1; then
  apt-get update
  apt-get install -y openjdk-17-jre nginx curl
elif command -v yum >/dev/null 2>&1; then
  yum install -y java-17-openjdk nginx curl
else
  echo "Unsupported Linux distribution. Please install Java 17 and Nginx manually."
  exit 1
fi

echo "==> Creating application user"
if ! id "${APP_NAME}" >/dev/null 2>&1; then
  useradd --system --home "${APP_DIR}" --shell /usr/sbin/nologin "${APP_NAME}"
fi

echo "==> Installing backend"
mkdir -p "${BACKEND_DIR}"
cp "${CURRENT_DIR}/backend/app.jar" "${BACKEND_DIR}/app.jar"
chown -R "${APP_NAME}:${APP_NAME}" "${APP_DIR}"

echo "==> Installing frontend"
rm -rf "${FRONTEND_DIR}"
mkdir -p "${FRONTEND_DIR}"
cp -r "${CURRENT_DIR}/frontend/dist/." "${FRONTEND_DIR}/"
chown -R www-data:www-data "${FRONTEND_DIR}" 2>/dev/null || true

echo "==> Writing systemd service"
cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=JQH Lab Spring Boot backend
After=network-online.target
Wants=network-online.target

[Service]
User=${APP_NAME}
Group=${APP_NAME}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/java -jar ${BACKEND_DIR}/app.jar
Restart=always
RestartSec=5
Environment=TZ=Asia/Shanghai

[Install]
WantedBy=multi-user.target
EOF

echo "==> Writing Nginx config"
cat > "/etc/nginx/conf.d/${APP_NAME}.conf" <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    root ${FRONTEND_DIR};
    index index.html;

    client_max_body_size 20m;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "==> Restarting services"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> Service status"
systemctl --no-pager --full status "${SERVICE_NAME}" || true

echo ""
echo "Deployment complete."
echo "Visit: http://${SERVER_NAME}"
echo "Backend logs: journalctl -u ${SERVICE_NAME} -f"
echo "Nginx logs: tail -f /var/log/nginx/error.log"
