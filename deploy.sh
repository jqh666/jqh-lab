#!/bin/bash
set -e

echo "================================"
echo "  JQH Lab deployment"
echo "================================"

if [ -f .env ]; then
  echo "Loading .env ..."
  export $(grep -v '^\s*#' .env | xargs)
else
  echo "No .env file found, using application.yml defaults."
fi

echo "Checking Docker ..."
command -v docker >/dev/null 2>&1 || { echo "Docker is not installed."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose plugin is not installed."; exit 1; }

echo "Stopping old containers ..."
docker compose down || true

echo "Building images ..."
docker compose build

echo "Starting services ..."
docker compose up -d

echo "Waiting for services ..."
sleep 8

echo ""
docker compose ps
echo ""
echo "Deployment complete."
echo "Logs: docker compose logs -f --tail=100"
