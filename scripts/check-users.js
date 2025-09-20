const mysql = require('mysql2/promise');

/**
 * 数据库连接配置
 */
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

/**
 * 检查用户表和数据
 */
async function checkUsers() {
  let connection;
  
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查users表是否存在
    console.log('\n检查users表...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('❌ users表不存在');
      
      // 创建users表
      console.log('\n创建users表...');
      const createTableSQL = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          invite_code VARCHAR(20) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      
      await connection.execute(createTableSQL);
      console.log('✅ users表创建成功');
      
      // 插入测试用户
      console.log('\n插入测试用户...');
      const insertUserSQL = `
        INSERT INTO users (username, email, password, phone, invite_code) 
        VALUES ('testuser', 'test@example.com', '$2b$10$rOvHPxfuqjx4Op/S/uLANOeGgAcVcRUuQQH5uLfMlAcqOpFuC0aGm', '13800138000', 'TEST001')
      `;
      
      await connection.execute(insertUserSQL);
      console.log('✅ 测试用户插入成功');
      console.log('用户名: testuser');
      console.log('密码: 123456');
      console.log('邮箱: test@example.com');
      
      return;
    }
    
    console.log('✅ users表存在');
    
    // 查询表结构
    console.log('\n表结构:');
    const [columns] = await connection.execute(
      "DESCRIBE users"
    );
    console.table(columns);
    
    // 查询用户总数
    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM users"
    );
    const total = countResult[0].total;
    console.log(`\n用户总数: ${total}`);
    
    if (total === 0) {
      console.log('❌ users表为空，没有用户数据');
      
      // 插入测试用户
      console.log('\n插入测试用户...');
      const insertUserSQL = `
        INSERT INTO users (username, email, password, phone, invite_code) 
        VALUES ('testuser', 'test@example.com', '$2b$10$rOvHPxfuqjx4Op/S/uLANOeGgAcVcRUuQQH5uLfMlAcqOpFuC0aGm', '13800138000', 'TEST001')
      `;
      
      await connection.execute(insertUserSQL);
      console.log('✅ 测试用户插入成功');
      console.log('用户名: testuser');
      console.log('密码: 123456');
      console.log('邮箱: test@example.com');
      
      return;
    }
    
    // 查询所有用户数据
    console.log('\n所有用户数据:');
    const [users] = await connection.execute(
      "SELECT id, username, email, phone, invite_code, is_active, created_at FROM users ORDER BY id ASC"
    );
    console.table(users);
    
    // 查询活跃用户数量
    const [activeResult] = await connection.execute(
      "SELECT COUNT(*) as active_count FROM users WHERE is_active = 1"
    );
    const activeCount = activeResult[0].active_count;
    console.log(`\n活跃用户数量: ${activeCount}`);
    
  } catch (error) {
    console.error('❌ 用户表检查失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行检查
checkUsers();