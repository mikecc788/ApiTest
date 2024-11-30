/**
 * 推文路由模块
 * 提供推文的发布、获取、评论等功能
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// MongoDB 连接配置
const mongoConfig = {
  url: 'mongodb://localhost:27017/demo_app',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
};

// 连接MongoDB并添加详细日志
mongoose.connect(mongoConfig.url, mongoConfig.options)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
  });

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// 处理应用退出时的连接关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// 推文模型
const tweetSchema = new mongoose.Schema({
  content: { type: String, required: true },
  images: [String],
  likes: { type: Number, default: 0 },
  comments: [{
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 使用 path.join 来处理路径，确保跨平台兼容
    const uploadDir = path.join('C:', 'home', 'images', 'tweets');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持图片文件!'));
  }
});

/**
 * 发布推文
 * POST /api/tweets
 * Body: 
 * - content: 推文内容
 * - images: 图片文件（可选，最多4张）
 */
router.post('/', upload.array('images', 4), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '推文内容不能为空' });
    }

    // 处理图片路径
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    // 创建新推文
    const tweet = new Tweet({
      content: content.trim(),
      images: imagePaths
    });

    await tweet.save();

    res.status(201).json({
      message: '推文发布成功',
      tweet: tweet
    });
  } catch (error) {
    console.error('发布推文失败:', error);
    res.status(500).json({ error: '发布推文失败' });
  }
});

/**
 * 获取推文列表
 * GET /api/tweets
 * Query参数:
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20）
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 获取推文总数
    const total = await Tweet.countDocuments();

    // 获取推文列表
    const tweets = await Tweet.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();  // 转换为普通JS对象，提高性能

    // 处理图片路径
    tweets.forEach(tweet => {
      tweet.images = tweet.images.map(img => `/api/tweets/images/${img}`);
      tweet.commentCount = tweet.comments ? tweet.comments.length : 0;
    });

    res.json({
      tweets,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取推文列表失败:', error);
    res.status(500).json({ error: '获取推文列表失败' });
  }
});

/**
 * 获取单条推文
 * GET /api/tweets/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id).lean();

    if (!tweet) {
      return res.status(404).json({ error: '推文不存在' });
    }

    // 处理图片路径
    tweet.images = tweet.images.map(img => `/api/tweets/images/${img}`);

    res.json({ tweet });
  } catch (error) {
    console.error('获取推文失败:', error);
    res.status(500).json({ error: '获取推文失败' });
  }
});

/**
 * 添加评论
 * POST /api/tweets/:id/comments
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ error: '推文不存在' });
    }

    // 添加评论
    tweet.comments.push({
      content: content.trim(),
      createdAt: new Date()
    });

    await tweet.save();

    res.status(201).json({
      message: '评论成功',
      comment: tweet.comments[tweet.comments.length - 1]
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({ error: '发表评论失败' });
  }
});

/**
 * 点赞推文
 * POST /api/tweets/:id/like
 */
router.post('/:id/like', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ error: '推文不存在' });
    }

    tweet.likes += 1;
    await tweet.save();

    res.json({ 
      message: '点赞成功',
      likes: tweet.likes
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});

/**
 * 获取推文图片
 * GET /api/tweets/images/:filename
 */
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  // 使用 path.join 来处理路径，确保跨平台兼容
  const imagePath = path.join('C:', 'home', 'images', 'tweets', filename);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('发送图片失败:', err);
      res.status(404).json({ error: '图片不存在' });
    }
  });
});

module.exports = router;
