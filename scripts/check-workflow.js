const mysql = require('mysql2/promise');

async function checkWorkflowEnabled() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: '124.223.62.233',
      port: 3306,
      user: 'coze-hub',
      password: '7788Gg7788',
      database: 'coze-hub'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 先查看表结构
    const [columns] = await connection.execute(
      'DESCRIBE feature_cards'
    );
    
    console.log('\n📋 feature_cards表结构:');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 查询所有卡片的workflowEnabled状态
    const [rows] = await connection.execute(
      'SELECT id, name, workflow_enabled FROM feature_cards ORDER BY id'
    );
    
    console.log('\n📋 卡片工作流启用状态:');
    console.log('ID\t名称\t\t\t工作流启用');
    console.log('----------------------------------------');
    
    rows.forEach(row => {
      const name = row.name.length > 15 ? row.name.substring(0, 15) + '...' : row.name;
      console.log(`${row.id}\t${name.padEnd(20)}\t${row.workflow_enabled ? '✅ 是' : '❌ 否'}`);
    });
    
    // 统计信息
    const enabledCount = rows.filter(row => row.workflow_enabled).length;
    const totalCount = rows.length;
    
    console.log('\n📊 统计信息:');
    console.log(`总卡片数: ${totalCount}`);
    console.log(`启用工作流: ${enabledCount}`);
    console.log(`未启用工作流: ${totalCount - enabledCount}`);
    
    if (enabledCount === 0) {
      console.log('\n⚠️  所有卡片的工作流功能都未启用，这就是为什么在编辑页面看不到工作流配置选项的原因！');
      console.log('\n💡 解决方案: 需要将某个卡片的workflow_enabled字段设置为1来测试工作流配置功能。');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

checkWorkflowEnabled();