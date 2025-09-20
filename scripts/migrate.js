const { query, testConnection } = require('../src/lib/database');
const fs = require('fs');
const path = require('path');

/**
 * 数据库迁移工具
 * 执行migrations目录下的SQL文件
 */
class DatabaseMigrator {
  constructor() {
    this.migrationsDir = path.join(process.cwd(), 'migrations');
  }

  /**
   * 获取所有迁移文件
   * @returns {string[]} 迁移文件列表
   */
  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsDir)) {
      console.log('migrations目录不存在');
      return [];
    }

    return fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * 执行单个迁移文件
   * @param {string} filename 文件名
   */
  async executeMigration(filename) {
    const filePath = path.join(this.migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`执行迁移: ${filename}`);
    
    // 分割SQL语句（以分号分割）
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement.trim());
        } catch (error) {
          console.error(`执行SQL失败: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
    
    console.log(`✅ ${filename} 执行成功`);
  }

  /**
   * 运行所有迁移
   */
  async runMigrations() {
    try {
      // 测试数据库连接
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      const migrationFiles = this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log('没有找到迁移文件');
        return;
      }

      console.log(`找到 ${migrationFiles.length} 个迁移文件`);
      
      for (const file of migrationFiles) {
        await this.executeMigration(file);
      }
      
      console.log('🎉 所有迁移执行完成');
    } catch (error) {
      console.error('迁移执行失败:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.runMigrations();
}

module.exports = DatabaseMigrator;