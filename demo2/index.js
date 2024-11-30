const express = require('express');
const app = express();
const port = 8080;
const imageRoutes = require('./imageRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
// 内存中存储待办事项
const todos = [];
// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
app.get('/test', (req, res) => {
  res.json({
    message: "Hello from Huawei Cloud! - Updated Version",
    timestamp: new Date().toISOString(),
    version: "1.3.0"
  });
});

app.get('/todos', (req, res) => {
  res.json(todos);
});

// 添加待办事项
app.post('/todos', (req, res) => {
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
    
    // 创建待办事项
    const todo = {
      id: todos.length + 1,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'normal', // 'low', 'normal', 'high'
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    todos.push(todo);
    res.status(201).json({
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to create todo'
    });
  }
});

// 更新待办事项
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const { title, description, completed, priority } = req.body;
  
  if (title && (title.length < 2 || title.length > 100)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: 'Title must be between 2 and 100 characters'
    });
  }
  
  if (title) todo.title = title.trim();
  if (description) todo.description = description.trim();
  if (typeof completed === 'boolean') todo.completed = completed;
  if (priority && ['low', 'normal', 'high'].includes(priority)) todo.priority = priority;
  
  todo.updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Todo updated successfully',
    data: todo
  });
});

// 删除待办事项
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(index, 1);
  res.status(204).send();
});

// 使用图片路由
app.use('/api/images', imageRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});