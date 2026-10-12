#!/bin/bash
set -e

PROJECT_DIR="/var/www/Kairo-projetoPIM"

echo "=== [1/4] Acessando diretório do projeto ==="
cd "$PROJECT_DIR"

echo "=== [2/4] Atualizando código com git pull ==="
git pull origin homolog

echo "=== [3/4] Reconstruindo e subindo containers ==="
docker compose -f docker-compose.homolog.yml --env-file .env.homolog up -d --build

echo "=== [4/4] Limpando imagens antigas sem tag ==="
docker image prune -f

echo "=== Deploy de homologação finalizado com sucesso! ==="