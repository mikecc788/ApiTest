/**
 * 认证路由模块
 * 处理用户注册和登录请求
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 * 
 * @body {string} username - 用户名，至少3个字符
 * @body {string} email - 邮箱地址，必须唯一
 * @body {string} password - 密码，至少6个字符
 * 
 * @returns {Object} 包含用户信息和JWT token的响应
 * @returns {string} message - 注册成功的消息
 * @returns {Object} user - 用户信息（不包含密码）
 * @returns {string} token - JWT token
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 检查用户是否已存在
        // 使用$or操作符同时检查用户名和邮箱
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: '用户名或邮箱已被使用' 
            });
        }

        // 创建新用户
        // 密码会在保存时自动加密（通过mongoose中间件）
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // 生成JWT token
        // 1. userId: token中包含用户ID用于后续认证
        // 2. JWT_SECRET: 使用配置的密钥签名
        // 3. expiresIn: token的过期时间
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 返回成功响应
        // user对象会自动排除密码字段（通过schema配置）
        res.status(201).json({
            message: '注册成功',
            user,
            token
        });
    } catch (error) {
        res.status(400).json({ 
            message: '注册失败',
            error: error.message 
        });
    }
});

/**
 * POST /api/auth/login
 * 用户登录
 * 
 * @body {string} email - 用户邮箱
 * @body {string} password - 用户密码
 * 
 * @returns {Object} 包含用户信息和JWT token的响应
 * @returns {string} message - 登录成功的消息
 * @returns {Object} user - 用户信息（不包含密码）
 * @returns {string} token - JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 查找用户
        // 根据邮箱查找用户
        const user = await User.findOne({ email });
        
        // 如果用户不存在，返回错误
        // 出于安全考虑，不说明具体是邮箱还是密码错误
        if (!user) {
            return res.status(401).json({ 
                message: '邮箱或密码错误' 
            });
        }

        // 验证密码
        // 使用schema中定义的comparePassword方法
        const isMatch = await user.comparePassword(password);
        
        // 如果密码不匹配，返回错误
        if (!isMatch) {
            return res.status(401).json({ 
                message: '邮箱或密码错误' 
            });
        }

        // 生成新的JWT token
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 返回成功响应
        res.json({
            message: '登录成功',
            user,
            token
        });
    } catch (error) {
        res.status(400).json({ 
            message: '登录失败',
            error: error.message 
        });
    }
});

module.exports = router;
