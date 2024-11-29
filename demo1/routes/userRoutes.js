/**
 * 用户路由模块
 * 处理所有与用户相关的HTTP请求
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const upload = require('../config/upload');
const auth = require('../middleware/auth');

/**
 * 中间件函数 - 根据ID获取用户
 * 用于复用获取用户的逻辑，减少代码重复
 * 
 * @param {object} req - 请求对象，包含用户ID (req.params.id)
 * @param {object} res - 响应对象，用于存储找到的用户 (res.user)
 * @param {function} next - 下一个中间件函数
 */
async function getUser(req, res, next) {
    try {
        // 根据ID查找用户
        const user = await User.findById(req.params.id);
        // 如果用户不存在，返回404错误
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        // 将用户对象添加到响应对象中，供后续路由使用
        res.user = user;
        // 继续执行下一个中间件或路由处理函数
        next();
    } catch (err) {
        // 如果发生错误（如无效的ID格式），返回500错误
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/users
 * 获取所有用户列表
 */
router.get('/', auth, async (req, res) => {
    try {
        // 查询数据库中的所有用户
        const users = await User.find();
        res.json(users);
    } catch (err) {
        // 如果查询出错，返回500错误
        res.status(500).json({ message: err.message });
    }
});

/**
 * POST /api/users
 * 创建新用户
 * 
 * @body {string} name - 用户名
 * @body {number} age - 年龄
 * @body {string} email - 电子邮件
 */
router.post('/', async (req, res) => {
    // 创建新的用户对象
    const user = new User({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email
    });
    try {
        // 保存用户到数据库
        const newUser = await user.save();
        // 返回201状态码和新创建的用户数据
        res.status(201).json(newUser);
    } catch (err) {
        // 如果创建失败（如验证错误），返回400错误
        res.status(400).json({ message: err.message });
    }
});

/**
 * GET /api/users/:id
 * 获取单个用户信息
 * 
 * @param {string} id - 用户ID
 */
router.get('/:id', auth, getUser, async(req, res) => {
    try {
        res.json(res.user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * PUT /api/users/:id
 * 更新用户信息
 * 
 * @param {string} id - 用户ID
 * @body {string} [name] - 新的用户名（可选）
 * @body {number} [age] - 新的年龄（可选）
 * @body {string} [email] - 新的电子邮件（可选）
 */
router.put('/:id', auth, getUser, async (req, res) => {
    // 只更新提供的字段
    if (req.body.name != null) {
        res.user.name = req.body.name;
    }
    if (req.body.age != null) {
        res.user.age = req.body.age;
    }
    if (req.body.email != null) {
        res.user.email = req.body.email;
    }
    try {
        // 保存更新后的用户数据
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (err) {
        // 如果更新失败（如验证错误），返回400错误
        res.status(400).json({ message: err.message });
    }
});

/**
 * DELETE /api/users/:id
 * 删除用户
 * 
 * @param {string} id - 要删除的用户ID
 */
router.delete('/:id', auth, getUser, async (req, res) => {
    try {
        // 删除用户
        await res.user.deleteOne();
        res.json({ message: '用户已删除' });
    } catch (err) {
        // 如果删除失败，返回500错误
        res.status(500).json({ message: err.message });
    }
});

/**
 * POST /api/users/:id/avatar
 * 上传用户头像
 * 
 * @param {string} id - 用户ID
 * @body {file} avatar - 头像文件
 */
router.post('/:id/avatar', auth, getUser, upload.single('avatar'), async (req, res) => {
    try {
        // 获取上传的文件信息
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的文件' });
        }

        // 更新用户的头像字段
        res.user.avatar = `/uploads/${req.file.filename}`;
        const updatedUser = await res.user.save();
        
        res.json({
            message: '头像上传成功',
            avatar: updatedUser.avatar
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * GET /api/users/:id/avatar
 * 获取用户头像URL
 */
router.get('/:id/avatar', getUser, async (req, res) => {
    try {
        if (!res.user.avatar) {
            return res.status(404).json({ message: '用户还没有上传头像' });
        }
        res.json({ avatar: res.user.avatar });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 导出路由模块
module.exports = router;