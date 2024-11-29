const crypto = require('crypto');

// 生成一个 64 字节的随机密钥并转换为 base64
const secret = crypto.randomBytes(64).toString('base64');

console.log('Generated JWT Secret:');
console.log(secret);
