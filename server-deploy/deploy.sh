#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Installing Docker..."
  curl -fsSL https://get.docker.com | bash -s docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not installed."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y docker-compose-plugin
  else
    echo "Please install Docker Compose plugin manually."
    exit 1
  fi
fi

if [ ! -f backend/app.jar ]; then
  echo "Missing backend/app.jar"
  echo "Please copy your built Spring Boot jar to: backend/app.jar"
  exit 1
fi

if [ ! -d frontend/dist ]; then
  echo "Missing frontend/dist"
  echo "Please copy your built frontend dist folder to: frontend/dist"
  exit 1
fi

echo "Stopping old containers..."
docker compose down || true

echo "Building images..."
docker compose build

echo "Starting services..."
docker compose up -d

echo ""
echo "Deployment finished."
echo "Visit: http://118.195.205.69"
echo ""
echo "Useful commands:"
echo "  docker compose ps"
echo "  docker compose logs -f --tail=100"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
