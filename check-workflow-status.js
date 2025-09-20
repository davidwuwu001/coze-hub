/**
 * 检查数据库中所有卡片的工作流状态
 */
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub'
};

async function checkWorkflowStatus() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 查询所有卡片的工作流相关字段
    const [rows] = await connection.execute(`
      SELECT 
        id,
        name,
        workflow_enabled,
        workflow_id,
        api_token,
        enabled,
        created_at
      FROM feature_cards 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📊 卡片工作流状态统计:');
    console.log('=' .repeat(80));
    
    let workflowEnabledCount = 0;
    let totalCount = rows.length;
    
    rows.forEach((card, index) => {
      const workflowStatus = card.workflow_enabled ? '✅ 已启用' : '❌ 未启用';
      const hasWorkflowId = card.workflow_id ? '有' : '无';
      const hasApiToken = card.api_token ? '有' : '无';
      
      console.log(`${index + 1}. ${card.name}`);
      console.log(`   ID: ${card.id}`);
      console.log(`   工作流状态: ${workflowStatus}`);
      console.log(`   工作流ID: ${hasWorkflowId} ${card.workflow_id ? `(${card.workflow_id})` : ''}`);
      console.log(`   API令牌: ${hasApiToken}`);
      console.log(`   卡片启用: ${card.enabled ? '是' : '否'}`);
      console.log(`   创建时间: ${card.created_at}`);
      console.log('-'.repeat(60));
      
      if (card.workflow_enabled) {
        workflowEnabledCount++;
      }
    });
    
    console.log('\n📈 统计结果:');
    console.log(`总卡片数: ${totalCount}`);
    console.log(`启用工作流的卡片数: ${workflowEnabledCount}`);
    console.log(`未启用工作流的卡片数: ${totalCount - workflowEnabledCount}`);
    
    // 特别检查"行业文案创作"卡片
    const industryCard = rows.find(card => card.name.includes('行业文案创作'));
    if (industryCard) {
      console.log('\n🎯 "行业文案创作"卡片详情:');
      console.log(`   工作流启用: ${industryCard.workflow_enabled ? '是' : '否'}`);
      console.log(`   工作流ID: ${industryCard.workflow_id || '无'}`);
      console.log(`   API令牌: ${industryCard.api_token ? '已设置' : '未设置'}`);
    } else {
      console.log('\n❓ 未找到"行业文案创作"卡片');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 数据库连接已关闭');
    }
  }
}

// 运行检查
checkWorkflowStatus();