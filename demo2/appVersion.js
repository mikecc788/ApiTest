const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB 连接配置
const mongoConfig = {
    url: 'mongodb://localhost:27017/demo_app',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
    }
};

// 版本信息的Schema
const versionSchema = new mongoose.Schema({
    appId: { type: String, required: true, unique: true },
    latestVersion: { type: String, required: true },
    updateContent: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    forceUpdate: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

const Version = mongoose.model('Version', versionSchema);

// 连接MongoDB
let dbInitialized = false;

async function ensureConnection() {
    if (!dbInitialized) {
        try {
            await mongoose.connect(mongoConfig.url, mongoConfig.options);
            console.log('MongoDB connected successfully');
            dbInitialized = true;
        } catch (error) {
            console.error('Database connection error:', error);
            throw error;
        }
    }
}

// 在每个路由处理之前确保数据库连接
router.use(async (req, res, next) => {
    try {
        await ensureConnection();
        next();
    } catch (error) {
        next(error);
    }
});

// POST接口 - 获取应用版本信息
router.post('/check', async (req, res) => {
    try {
        const { appId } = req.body;
        console.log('Checking version for appId:', appId);
        
        // 验证appId是否为允许的值
        const validAppIds = ['ibreathe-ios', 'ibreathe-air-ios', 'ibreathe-android', 'ibreathe-air-android'];
        if (!validAppIds.includes(appId)) {
            console.log('Invalid appId:', appId);
            return res.status(400).json({ error: 'Invalid appId' });
        }

        const versionInfo = await Version.findOne({ appId });
        
        if (!versionInfo) {
            return res.status(404).json({
                error: 'Version information not found for this app'
            });
        }

        res.json({
            latestVersion: versionInfo.latestVersion,
            updateContent: versionInfo.updateContent,
            downloadUrl: versionInfo.downloadUrl,
            forceUpdate: versionInfo.forceUpdate
        });
    } catch (error) {
        console.error('Error checking version:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 管理接口 - 更新版本信息
router.post('/update', async (req, res) => {
    try {
        const { appId, latestVersion, updateContent, downloadUrl, forceUpdate } = req.body;
        console.log('Updating version for appId:', appId, 'with data:', req.body);
        
        // 验证appId是否为允许的值
        const validAppIds = ['ibreathe-ios', 'ibreathe-air-ios', 'ibreathe-android', 'ibreathe-air-android'];
        if (!validAppIds.includes(appId)) {
            console.log('Invalid appId:', appId);
            return res.status(400).json({ error: 'Invalid appId' });
        }

        // 使用upsert选项，如果不存在则创建新记录
        const result = await Version.findOneAndUpdate(
            { appId },
            {
                latestVersion,
                updateContent,
                downloadUrl,
                forceUpdate,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        console.log('Update result:', result);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error updating version:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;