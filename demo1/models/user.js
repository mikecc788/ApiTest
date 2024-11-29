/**
 * 用户模型
 * 定义用户数据结构和相关方法
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 用户Schema定义
 * 包含用户的基本信息和认证相关字段
 */
const userSchema = new mongoose.Schema({
    // 用户名
    username: {
        type: String,
        required: true,     // 必填
        unique: true,       // 唯一
        trim: true,         // 自动删除首尾空格
        minlength: 3        // 最小长度为3
    },
    // 邮箱
    email: {
        type: String,
        required: true,     // 必填
        unique: true,       // 唯一
        trim: true,         // 自动删除首尾空格
        lowercase: true     // 转换为小写
    },
    // 密码
    password: {
        type: String,
        required: true,     // 必填
        minlength: 6       // 最小长度为6
    },
    // 头像
    avatar: {
        type: String,
        default: ''        // 默认为空字符串
    },
    // 创建时间
    createdAt: {
        type: Date,
        default: Date.now  // 默认为当前时间
    }
});

/**
 * 保存前中间件
 * 在保存用户之前自动加密密码
 */
userSchema.pre('save', async function(next) {
    // 只有在密码被修改时才重新加密
    if (!this.isModified('password')) return next();
    
    try {
        // 生成盐值
        const salt = await bcrypt.genSalt(10);
        // 使用盐值加密密码
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * 实例方法：验证密码
 * 比较提供的密码和存储的加密密码是否匹配
 * 
 * @param {string} candidatePassword - 待验证的密码
 * @returns {Promise<boolean>} 如果密码匹配返回true，否则返回false
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * 实例方法：转换为JSON
 * 在输出用户信息时自动删除密码字段
 * 
 * @returns {Object} 不包含密码的用户信息
 */
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;  // 删除密码字段
    return user;
};

// 导出用户模型
module.exports = mongoose.model('User', userSchema);
