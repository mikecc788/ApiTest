/**
 * 推文路由模块 - 测试版
 * 仅包含基本的数据库功能测试
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB 连接配置
const mongoConfig = {
  url: 'mongodb://localhost:27017/demo_app',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

// 连接MongoDB
mongoose.connect(mongoConfig.url, mongoConfig.options)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 推文模型
const tweetSchema = new mongoose.Schema({
  content: { type: String, required: true },
  username: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  reply_count: { type: Number, default: 0 },
  retweet_count: { type: Number, default: 0 },
  like_count: { type: Number, default: 0 },
  view_count: { type: Number, default: 0 }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

// 测试路由：创建推文
router.post('/create', async (req, res) => {
  try {
    const tweet = new Tweet({
      content: req.body.content,
      username: req.body.username || ''
    });
    const savedTweet = await tweet.save();
    res.json(savedTweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 测试路由：获取所有推文
router.get('/all', async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ created_at: -1 });
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 测试路由：根据ID获取推文
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ message: '推文不存在' });
    }
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 测试路由：通过ID删除推文
router.delete('/:id', async (req, res) => {
  try {
    const result = await Tweet.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: '推文不存在' });
    }
    res.json({ message: '推文已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增：通过username删除推文
router.delete('/user/:username', async (req, res) => {
  try {
    const result = await Tweet.deleteMany({ username: req.params.username });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '未找到该用户的推文' });
    }
    res.json({ 
      message: '删除成功',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增：删除指定时间范围内的推文
router.delete('/range/:startDate/:endDate', async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    
    const result = await Tweet.deleteMany({
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '该时间范围内没有推文' });
    }
    res.json({ 
      message: '删除成功',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
