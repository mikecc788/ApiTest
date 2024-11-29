/**
 * 认证中间件
 * 用于保护需要认证的路由
 * 验证请求中的JWT token并获取对应的用户信息
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const User = require('../models/user');

/**
 * 认证中间件函数
 * 在需要认证的路由中使用此中间件
 * 
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express的next函数
 */
const auth = async (req, res, next) => {
    try {
        // 从请求头获取token
        // Authorization: Bearer <token>
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // 如果没有提供token，抛出错误
        if (!token) {
            throw new Error();
        }

        // 验证token
        // 1. 验证token是否有效
        // 2. 验证token是否过期
        // 3. 解码token获取用户ID
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 根据token中的用户ID查找用户
        // 确保用户仍然存在于数据库中
        const user = await User.findById(decoded.userId);
        
        // 如果用户不存在，抛出错误
        if (!user) {
            throw new Error();
        }

        // 将用户信息和token添加到请求对象
        // 后续的路由处理函数可以通过req.user访问用户信息
        req.user = user;
        req.token = token;
        
        // 继续处理请求
        next();
    } catch (error) {
        // 认证失败，返回401状态码
        res.status(401).json({ message: '请先登录' });
    }
};

module.exports = auth;
