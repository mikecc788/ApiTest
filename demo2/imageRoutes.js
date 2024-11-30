/**
 * 图片路由模块
 * 提供图片列表获取和单张图片访问的API接口
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 图片存储的根目录路径
const AVATAR_PATH = 'C:\\home\\images\\avatar';

// 支持的图片类型
const SUPPORTED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif'];

/**
 * 获取图片列表接口
 * GET /api/images
 * 递归获取avatar目录下所有图片文件
 * 返回格式：{ images: string[], total: number }
 */
router.get('/', (req, res) => {
  /**
   * 递归读取目录下的所有图片文件
   * @param {string} dirPath - 要读取的目录路径
   * @returns {string[]} - 图片文件的相对路径数组
   */
  function getAllImages(dirPath) {
    let results = [];
    // 读取目录内容，包含文件类型信息
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        // 如果是目录，递归读取
        results = results.concat(getAllImages(fullPath));
      } else {
        // 如果是文件，检查是否为支持的图片类型
        const ext = path.extname(item.name).toLowerCase();
        if (SUPPORTED_IMAGE_TYPES.includes(ext)) {
          // 获取相对路径（相对于avatar文件夹）
          const relativePath = path.relative(AVATAR_PATH, fullPath);
          results.push(relativePath);
        }
      }
    }
    return results;
  }

  try {
    // 获取所有图片文件
    const imageFiles = getAllImages(AVATAR_PATH);
    // 返回图片列表和总数
    res.json({ 
      images: imageFiles.map(path => path.replace(/\\/g, '/')),  // 将Windows路径分隔符转换为Web标准的正斜杠
      total: imageFiles.length
    });
  } catch (err) {
    console.error('读取图片目录失败:', err);
    res.status(500).json({ error: '读取图片列表失败' });
  }
});

/**
 * 获取单张图片接口
 * GET /api/images/:subpath
 * @param {string} subpath - 图片相对路径，支持子目录
 * 例如：/api/images/folder1/image.jpg
 */
router.get('/:subpath(*)', (req, res) => {
  const subpath = req.params.subpath;
  const imagePath = path.join(AVATAR_PATH, subpath);

  // 安全检查：确保请求的文件在avatar目录下
  const normalizedPath = path.normalize(imagePath);
  const normalizedAvatarPath = path.normalize(AVATAR_PATH);
  if (!normalizedPath.startsWith(normalizedAvatarPath)) {
    console.error('访问被拒绝: 试图访问avatar目录以外的文件');
    return res.status(403).json({ error: '访问被拒绝' });
  }

  // 检查文件是否存在
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('图片不存在:', err);
      return res.status(404).json({ error: '图片不存在' });
    }

    // 读取并发送图片
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error('读取图片失败:', err);
        return res.status(500).json({ error: '读取图片失败' });
      }
      
      // 设置正确的Content-Type
      const ext = path.extname(imagePath).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      };
      
      // 设置响应头
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      // 设置缓存控制
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存24小时
      // 发送图片数据
      res.send(data);
    });
  });
});

// 导出路由模块
module.exports = router;
