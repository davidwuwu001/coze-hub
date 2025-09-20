/**
 * 测试数据库连接和工作流字段功能
 */
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub'
};

/**
 * 测试数据库连接和工作流字段
 */
async function testDatabase() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查询表结构，确认工作流字段已添加
    console.log('\n📋 检查表结构:');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM feature_cards WHERE Field IN ('workflow_id', 'workflow_params', 'workflow_enabled')"
    );
    
    console.log('工作流相关字段:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 测试插入带工作流配置的卡片
    console.log('\n🧪 测试插入工作流卡片:');
    const testCard = {
      name: '测试工作流卡片',
      description: '用于测试工作流功能的卡片',
      icon_name: 'Workflow',
      bg_color: '#8B5CF6',
      order_index: 999,
      enabled: 1,
      workflow_id: 'test-workflow-001',
      workflow_params: JSON.stringify({
        timeout: 30,
        retries: 3,
        model: 'gpt-3.5-turbo'
      }),
      workflow_enabled: 1
    };
    
    const [insertResult] = await connection.execute(
      `INSERT INTO feature_cards (name, description, icon_name, bg_color, order_index, enabled, workflow_id, workflow_params, workflow_enabled, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [testCard.name, testCard.description, testCard.icon_name, testCard.bg_color, testCard.order_index, testCard.enabled, testCard.workflow_id, testCard.workflow_params, testCard.workflow_enabled]
    );
    
    const insertId = insertResult.insertId;
    console.log(`✅ 测试卡片插入成功，ID: ${insertId}`);
    
    // 查询刚插入的卡片
    console.log('\n🔍 查询测试卡片:');
    const [rows] = await connection.execute(
      'SELECT * FROM feature_cards WHERE id = ?',
      [insertId]
    );
    
    if (rows.length > 0) {
      const card = rows[0];
      console.log('✅ 查询成功:');
      console.log(`  名称: ${card.name}`);
      console.log(`  工作流ID: ${card.workflow_id}`);
      console.log(`  工作流参数: ${card.workflow_params}`);
      console.log(`  工作流启用: ${card.workflow_enabled ? '是' : '否'}`);
    }
    
    // 测试更新工作流配置
    console.log('\n🔄 测试更新工作流配置:');
    const newParams = JSON.stringify({
      timeout: 60,
      retries: 5,
      model: 'gpt-4',
      temperature: 0.7
    });
    
    await connection.execute(
      'UPDATE feature_cards SET workflow_params = ?, workflow_enabled = ? WHERE id = ?',
      [newParams, 0, insertId]
    );
    
    console.log('✅ 工作流配置更新成功');
    
    // 再次查询验证更新
    const [updatedRows] = await connection.execute(
      'SELECT workflow_params, workflow_enabled FROM feature_cards WHERE id = ?',
      [insertId]
    );
    
    if (updatedRows.length > 0) {
      const updated = updatedRows[0];
      console.log('✅ 更新验证成功:');
      console.log(`  新参数: ${updated.workflow_params}`);
      console.log(`  工作流启用: ${updated.workflow_enabled ? '是' : '否'}`);
    }
    
    // 清理测试数据
    console.log('\n🧹 清理测试数据:');
    await connection.execute('DELETE FROM feature_cards WHERE id = ?', [insertId]);
    console.log('✅ 测试数据清理完成');
    
    console.log('\n🎉 所有测试通过！数据库工作流功能正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行测试
testDatabase();