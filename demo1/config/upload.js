const multer = require('multer');
const path = require('path');

// 配置文件存储
const storage = multer.diskStorage({
    // 设置文件存储位置
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    // 设置文件名
    filename: function (req, file, cb) {
        // 生成唯一的文件名：时间戳 + 原始文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 只接受图片文件
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('请上传图片文件！'), false);
    }
};

// 创建 multer 实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 限制文件大小为5MB
    }
});

module.exports = upload;
