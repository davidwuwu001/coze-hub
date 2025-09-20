const mysql = require('mysql2/promise');

async function addPointsColumn() {
  try {
    const connection = await mysql.createConnection('mysql://coze-hub:7788Gg7788@124.223.62.233:3306/coze-hub');
    
    // 检查points字段是否存在
    const [columns] = await connection.execute('SHOW COLUMNS FROM users LIKE "points"');
    
    if (columns.length === 0) {
      console.log('添加points字段...');
      await connection.execute('ALTER TABLE users ADD COLUMN points INT DEFAULT 0 AFTER avatar');
      console.log('points字段添加成功');
    } else {
      console.log('points字段已存在');
    }
    
    await connection.end();
  } catch (error) {
    console.error('操作失败:', error.message);
  }
}

addPointsColumn();