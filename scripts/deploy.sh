#!/bin/bash
set -e

cd /root/SolveBridge

echo "[deploy] git pull..."
git pull origin master

echo "[deploy] frontend build..."
cd frontend
npm ci --prefer-offline
npm run build
cd ..

echo "[deploy] python deps..."
pip install -q -r requirements.txt

echo "[deploy] migrations..."
alembic upgrade head

echo "[deploy] restart api..."
systemctl restart solvebridge-api

echo "[deploy] done."
