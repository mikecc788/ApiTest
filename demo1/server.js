const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadConfig = require('./config/upload');
const connectDB = require('./config/database');

const app = express();

// 创建HTTP服务器
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  }
});
const configureSocket = require('./config/socket');

// 连接数据库
connectDB();

// 中间件配置
app.use(cors());  // 启用CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// API信息路由
app.get('/api/info', (req, res) => {
    const serverUrl = `http://${req.hostname}:3000`;
    const wsUrl = `ws://${req.hostname}:3000`;
    
    res.json({
        status: 'running',
        server: {
            http: serverUrl,
            websocket: wsUrl,
            localIp: '192.168.1.65'
        },
        api: {
            auth: {
                register: `${serverUrl}/api/auth/register`,
                login: `${serverUrl}/api/auth/login`
            },
            users: {
                profile: `${serverUrl}/api/users/profile`,
                avatar: `${serverUrl}/api/users/avatar`
            }
        },
        socket: {
            events: {
                emit: {
                    join: 'join(username)',
                    message: 'message({text})',
                    privateMessage: 'privateMessage({to, text})',
                    typing: 'typing()',
                    stopTyping: 'stopTyping()'
                },
                on: {
                    message: '新消息',
                    privateMessage: '私聊消息',
                    userJoined: '用户加入',
                    userLeft: '用户离开',
                    onlineUsers: '在线用户列表',
                    userTyping: '用户正在输入',
                    userStoppedTyping: '用户停止输入'
                }
            }
        }
    });
});

// 根路径返回API信息
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用用户管理API',
        endpoints: {
            auth: {
                register: '/api/auth/register',
                login: '/api/auth/login'
            },
            users: '/api/users',
            avatar: '/api/users/:id/avatar'
        },
        pages: {
            auth: '/auth',
            uploadTest: '/upload-test',
            chat: '/chat'
        }
    });
});

// 认证页面路由
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/auth.html'));
});

// 上传测试页面的专门路由
app.get('/upload-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 聊天室路由
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/chat.html'));
});

// 配置Socket.IO
configureSocket(io);

// 启动服务器
const PORT = 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`
服务器已启动:
- 本地访问: http://localhost:${PORT}
- 局域网访问: http://192.168.1.65:${PORT}
- API文档: http://192.168.1.65:${PORT}/api/info

在Flutter中使用以下地址:
const serverUrl = 'http://192.168.1.65:${PORT}';
const wsUrl = 'ws://192.168.1.65:${PORT}';
    `);
});
