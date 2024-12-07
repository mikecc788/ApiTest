const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存储用户信息
const users = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    // 处理设置用户名
    socket.on('set username', (username) => {
        users.set(socket.id, username);
        io.emit('user list', Array.from(users.values()));
        socket.broadcast.emit('user joined', username);
    });

    // 处理断开连接
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            io.emit('user list', Array.from(users.values()));
            socket.broadcast.emit('user left', username);
        }
        console.log('user disconnected');
    });

    // 处理聊天消息
    socket.on('chat message', (msg) => {
        const username = users.get(socket.id);
        io.emit('chat message', {
            username: username || 'Anonymous',
            message: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    // 处理正在输入状态
    socket.on('typing', () => {
        const username = users.get(socket.id);
        socket.broadcast.emit('user typing', username);
    });

    socket.on('stop typing', () => {
        const username = users.get(socket.id);
        socket.broadcast.emit('user stop typing', username);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});