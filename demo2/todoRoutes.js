/**
 * Todo路由模块
 * 提供待办事项的增删改查功能
 */

const express = require('express');
const router = express.Router();

// 内存中存储待办事项
const todos = [];

/**
 * 获取所有待办事项
 * GET /api/todos
 * @returns {Array} 所有待办事项列表
 */
router.get('/', (req, res) => {
  res.json(todos);
});

/**
 * 添加待办事项
 * POST /api/todos
 * @param {Object} req.body
 * @param {string} req.body.title - 待办事项标题
 * @param {string} req.body.description - 待办事项描述
 * @param {string} req.body.priority - 优先级
 */
router.post('/', (req, res) => {
  try {
    console.log('Received POST request to /todos');
    console.log('Request body:', req.body);
    const { title, description, priority } = req.body;
  
    // 数据验证
    if (!title) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'Title is required'
      });
    }
    
    if (title.length < 2 || title.length > 100) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Title must be between 2 and 100 characters'
      });
    }

    // 创建新的待办事项
    const todo = {
      id: Date.now().toString(),  // 使用时间戳作为唯一ID
      title,
      description: description || '',
      priority: priority || 'normal',
      completed: false,
      createdAt: new Date().toISOString()
    };

    // 添加到列表
    todos.push(todo);
    
    // 返回成功消息和新创建的待办事项
    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * 更新待办事项
 * PUT /api/todos/:id
 * @param {string} req.params.id - 待办事项ID
 * @param {Object} req.body - 更新的字段
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // 查找待办事项
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({
      error: 'Todo not found',
      details: `No todo item with id ${id}`
    });
  }

  // 验证更新的标题
  if (updates.title && (updates.title.length < 2 || updates.title.length > 100)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: 'Title must be between 2 and 100 characters'
    });
  }

  // 更新待办事项
  todos[todoIndex] = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  res.json({
    message: 'Todo updated successfully',
    todo: todos[todoIndex]
  });
});

/**
 * 删除待办事项
 * DELETE /api/todos/:id
 * @param {string} req.params.id - 待办事项ID
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // 查找并删除待办事项
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({
      error: 'Todo not found',
      details: `No todo item with id ${id}`
    });
  }

  todos.splice(todoIndex, 1);
  res.status(204).send();
});

// 导出路由模块
module.exports = router;
