/**
 * Socket.IO 配置文件
 * 处理实时聊天的事件和连接
 */

function configureSocket(io) {
    // 存储在线用户
    const onlineUsers = new Map();

    // 监听新的连接
    io.on('connection', (socket) => {
        console.log('新用户连接:', socket.id);

        // 用户加入聊天
        socket.on('join', (username) => {
            // 保存用户信息
            onlineUsers.set(socket.id, {
                id: socket.id,
                username: username
            });

            // 广播新用户加入的消息
            io.emit('userJoined', {
                user: username,
                onlineCount: onlineUsers.size
            });

            // 发送在线用户列表
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        });

        // 处理新消息
        socket.on('message', (data) => {
            const user = onlineUsers.get(socket.id);
            if (user) {
                // 广播消息给所有用户
                io.emit('message', {
                    id: Date.now(),
                    user: user.username,
                    text: data.text,
                    time: new Date().toISOString()
                });
            }
        });

        // 处理私聊消息
        socket.on('privateMessage', (data) => {
            const sender = onlineUsers.get(socket.id);
            if (sender && data.to) {
                // 发送私聊消息
                io.to(data.to).emit('privateMessage', {
                    id: Date.now(),
                    from: sender.username,
                    text: data.text,
                    time: new Date().toISOString()
                });
                // 也发送给发送者
                socket.emit('privateMessage', {
                    id: Date.now(),
                    from: sender.username,
                    to: data.to,
                    text: data.text,
                    time: new Date().toISOString()
                });
            }
        });

        // 用户断开连接
        socket.on('disconnect', () => {
            const user = onlineUsers.get(socket.id);
            if (user) {
                // 从在线用户列表中移除
                onlineUsers.delete(socket.id);
                // 广播用户离开的消息
                io.emit('userLeft', {
                    user: user.username,
                    onlineCount: onlineUsers.size
                });
                // 更新在线用户列表
                io.emit('onlineUsers', Array.from(onlineUsers.values()));
            }
        });

        // 用户正在输入
        socket.on('typing', () => {
            const user = onlineUsers.get(socket.id);
            if (user) {
                socket.broadcast.emit('userTyping', user.username);
            }
        });

        // 用户停止输入
        socket.on('stopTyping', () => {
            const user = onlineUsers.get(socket.id);
            if (user) {
                socket.broadcast.emit('userStoppedTyping', user.username);
            }
        });
    });
}

module.exports = configureSocket;
