/**
 * JWT认证配置文件
 * 包含JWT密钥和过期时间的配置
 */
module.exports = {
    // JWT_SECRET: 用于签名和验证JWT的密钥
    // 1. 优先使用环境变量中的密钥，提高安全性
    // 2. 如果环境变量不存在，则使用默认值
    // 3. 在生产环境中应该使用环境变量设置密钥
    JWT_SECRET: process.env.JWT_SECRET || 'ZWG1utgSHURiqLFa6v1eNdf527IjlNejLLFDzIzsB2RR2GtlNxj2e+4t3+NnImZvuNWRmDWqVmh4KBfgqG53sg==',

    // JWT_EXPIRES_IN: token的过期时间
    // 1. 可以通过环境变量配置
    // 2. 默认为24小时
    // 3. 支持的格式：
    //    - 数字（秒）：例如 3600
    //    - 时间字符串：例如 '2 days', '10h', '7d'
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};
