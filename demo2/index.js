/**
 * 主服务器文件
 * 配置服务器并加载各个路由模块
 */

const express = require('express');
const app = express();
const port = 8080;
const imageRoutes = require('./imageRoutes');
const todoRoutes = require('./todoRoutes');
const tweetRoutes = require('./tweetRoutes');
const appVersionRoutes = require('./appVersion');

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 测试接口
app.get('/test', (req, res) => {
  res.json({
    message: "Hello from Huawei Cloud! - Updated Version",
    timestamp: new Date().toISOString(),
    version: "1.3.0"
  });
});

// 路由模块
app.use('/api/images', imageRoutes);  // 图片相关接口
app.use('/api/todos', todoRoutes);   // 待办事项相关接口
app.use('/api/tweets', tweetRoutes); // 推文相关接口
app.use('/api/version', appVersionRoutes); // 应用版本控制接口

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});