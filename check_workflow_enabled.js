const mysql = require('mysql2/promise');

/**
 * 检查数据库中feature_cards表的workflow_enabled字段值
 */
async function checkWorkflowEnabled() {
  const connection = await mysql.createConnection({
    host: '124.223.62.233',
    port: 3306,
    user: 'coze-hub',
    password: '7788Gg7788',
    database: 'coze-hub'
  });

  try {
    console.log('连接数据库成功，查询feature_cards表的workflow_enabled字段...');
    
    const [rows] = await connection.execute(
      'SELECT id, name, workflow_enabled, workflow_id, api_token FROM feature_cards ORDER BY sort_order'
    );
    
    console.log('\n=== 卡片工作流配置状态 ===');
    rows.forEach(card => {
      console.log(`ID: ${card.id}`);
      console.log(`名称: ${card.name}`);
      console.log(`工作流启用: ${card.workflow_enabled ? '是' : '否'}`);
      console.log(`工作流ID: ${card.workflow_id || '未设置'}`);
      console.log(`API令牌: ${card.api_token ? '已设置' : '未设置'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkWorkflowEnabled().catch(console.error);