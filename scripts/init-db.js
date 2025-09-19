const mysql = require('mysql2/promise');

/**
 * 数据库初始化脚本
 * 创建用户表和邀请码表
 */
async function initDatabase() {
  const connection = await mysql.createConnection({
    host: '124.223.62.233',
    port: 3306,
    user: 'coze-hub',
    password: '7788Gg7788',
    database: 'coze-hub',
    charset: 'utf8mb4'
  });

  try {
    console.log('开始初始化数据库...');

    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
        email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱地址',
        phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号码',
        password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
        invite_code VARCHAR(20) DEFAULT NULL COMMENT '使用的邀请码',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        is_active BOOLEAN DEFAULT TRUE COMMENT '账户是否激活'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
    `;

    await connection.execute(createUsersTable);
    console.log('✓ 用户表创建成功');

    // 创建用户表索引（先检查是否存在）
    const indexes = [
      { name: 'idx_users_username', sql: 'CREATE INDEX idx_users_username ON users(username)' },
      { name: 'idx_users_email', sql: 'CREATE INDEX idx_users_email ON users(email)' },
      { name: 'idx_users_phone', sql: 'CREATE INDEX idx_users_phone ON users(phone)' },
      { name: 'idx_users_created_at', sql: 'CREATE INDEX idx_users_created_at ON users(created_at DESC)' }
    ];

    for (const index of indexes) {
      try {
        await connection.execute(index.sql);
        console.log(`✓ 索引 ${index.name} 创建成功`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`✓ 索引 ${index.name} 已存在，跳过创建`);
        } else {
          throw error;
        }
      }
    }

    // 创建邀请码表
    const createInviteCodesTable = `
      CREATE TABLE IF NOT EXISTS invite_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL COMMENT '邀请码',
        created_by_user_id INT DEFAULT NULL COMMENT '创建者用户ID',
        used_by_user_id INT DEFAULT NULL COMMENT '使用者用户ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        used_at TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否有效'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请码表';
    `;

    await connection.execute(createInviteCodesTable);
    console.log('✓ 邀请码表创建成功');

    // 检查是否已存在邀请码
    const [existingCodes] = await connection.execute(
      'SELECT COUNT(*) as count FROM invite_codes WHERE code IN (?, ?)',
      ['1212', '7777']
    );

    if (existingCodes[0].count === 0) {
      // 插入初始邀请码
      const insertInviteCodes = `
        INSERT INTO invite_codes (code, is_active) VALUES 
        ('1212', TRUE),
        ('7777', TRUE)
      `;
      
      await connection.execute(insertInviteCodes);
      console.log('✓ 初始邀请码插入成功');
    } else {
      console.log('✓ 邀请码已存在，跳过插入');
    }

    console.log('数据库初始化完成！');

  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行初始化
initDatabase().catch(console.error);