const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/api_demo');
        console.log('✅ MongoDB 连接成功');
    } catch (error) {
        console.error('❌ MongoDB 连接失败:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
