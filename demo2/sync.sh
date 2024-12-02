#!/bin/bash

# 设置字符编码
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

# 设置服务器信息
SERVER_IP="110.41.41.11"
SERVER_USER="administrator"
SERVER_PATH="C:/home/administrator/app"

# SSH通用参数
SSH_OPTS="-o StrictHostKeyChecking=no -o ServerAliveInterval=60"

# 设置错误处理
set -e

# 同步文件并重启
echo "[Deploy] Syncing and restarting..."
sshpass -p 'Qaz123456.' scp $SSH_OPTS -r \
    index.js \
    imageRoutes.js \
    todoRoutes.js \
    tweetRoutes.js \
    package.json \
    appVersion.js \
    package-lock.json \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

sshpass -p 'Qaz123456.' ssh $SSH_OPTS ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && set PATH=C:\\Program Files\\nodejs;%PATH% && \"C:\\Users\\Administrator\\AppData\\Roaming\\npm\\pm2.cmd\" restart node-app"

sleep 2

# 显示新版本
echo "[Deploy] Current version:"
curl -s http://${SERVER_IP}:8080/test
