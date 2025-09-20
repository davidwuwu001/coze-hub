/**
 * 测试编辑和保存卡片功能
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

async function testEditSave() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 查找"行业文案创作"卡片
    console.log('\n🔍 查找"行业文案创作"卡片...');
    const [cards] = await connection.execute(
      'SELECT * FROM feature_cards WHERE name LIKE ?',
      ['%行业文案创作%']
    );
    
    if (cards.length === 0) {
      console.log('❌ 未找到"行业文案创作"卡片');
      return;
    }
    
    const card = cards[0];
    console.log('✅ 找到卡片:', card.name);
    console.log('   当前状态:');
    console.log(`   - workflow_enabled: ${card.workflow_enabled}`);
    console.log(`   - workflow_id: ${card.workflow_id || '(空)'}`);
    console.log(`   - api_token: ${card.api_token ? '(已设置)' : '(空)'}`);
    
    // 2. 测试更新工作流配置
    console.log('\n🔧 测试更新工作流配置...');
    const testWorkflowId = 'test_workflow_' + Date.now();
    const testApiToken = 'test_token_' + Date.now();
    
    const [updateResult] = await connection.execute(`
      UPDATE feature_cards 
      SET 
        workflow_enabled = ?,
        workflow_id = ?,
        api_token = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [true, testWorkflowId, testApiToken, card.id]);
    
    if (updateResult.affectedRows > 0) {
      console.log('✅ 更新成功');
      
      // 3. 验证更新结果
      console.log('\n🔍 验证更新结果...');
      const [updatedCards] = await connection.execute(
        'SELECT * FROM feature_cards WHERE id = ?',
        [card.id]
      );
      
      const updatedCard = updatedCards[0];
      console.log('✅ 更新后状态:');
      console.log(`   - workflow_enabled: ${updatedCard.workflow_enabled}`);
      console.log(`   - workflow_id: ${updatedCard.workflow_id}`);
      console.log(`   - api_token: ${updatedCard.api_token ? '(已设置)' : '(空)'}`);
      console.log(`   - updated_at: ${updatedCard.updated_at}`);
      
      // 4. 测试API端点格式
      console.log('\n🌐 测试API数据格式...');
      const apiData = {
        id: updatedCard.id,
        name: updatedCard.name,
        desc: updatedCard.desc,
        iconName: updatedCard.icon_name,
        bgColor: updatedCard.bg_color,
        order: updatedCard.order,
        enabled: updatedCard.enabled,
        workflowEnabled: updatedCard.workflow_enabled, // 注意字段映射
        workflowId: updatedCard.workflow_id,
        apiToken: updatedCard.api_token,
        createdAt: updatedCard.created_at,
        updatedAt: updatedCard.updated_at
      };
      
      console.log('✅ API返回格式预览:');
      console.log(JSON.stringify(apiData, null, 2));
      
      // 5. 恢复原始状态（可选）
      console.log('\n🔄 恢复原始状态...');
      await connection.execute(`
        UPDATE feature_cards 
        SET 
          workflow_enabled = ?,
          workflow_id = ?,
          api_token = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [card.workflow_enabled, card.workflow_id, card.api_token, card.id]);
      
      console.log('✅ 已恢复原始状态');
      
    } else {
      console.log('❌ 更新失败');
    }
    
    // 6. 测试其他卡片的工作流状态
    console.log('\n📊 检查其他启用工作流的卡片...');
    const [workflowCards] = await connection.execute(`
      SELECT id, name, workflow_enabled, workflow_id, api_token 
      FROM feature_cards 
      WHERE workflow_enabled = true
      ORDER BY created_at DESC
    `);
    
    console.log(`找到 ${workflowCards.length} 个启用工作流的卡片:`);
    workflowCards.forEach((wCard, index) => {
      console.log(`${index + 1}. ${wCard.name}`);
      console.log(`   - ID: ${wCard.id}`);
      console.log(`   - 工作流ID: ${wCard.workflow_id || '(未设置)'}`);
      console.log(`   - API令牌: ${wCard.api_token ? '(已设置)' : '(未设置)'}`);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
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

// 运行测试
testEditSave();