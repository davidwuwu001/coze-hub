// 这个脚本需要在浏览器控制台中运行
// 用于调试前端认证和API调用问题

console.log('=== 前端调试脚本 ===');

// 检查localStorage中的token
console.log('\n1. 检查localStorage中的token:');
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token存在:', token.substring(0, 20) + '...');
  
  // 尝试解析JWT token（不验证签名）
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token过期时间:', new Date(payload.exp * 1000));
      console.log('当前时间:', new Date());
      console.log('Token是否过期:', payload.exp * 1000 < Date.now());
    }
  } catch (e) {
    console.log('❌ Token格式无效');
  }
} else {
  console.log('❌ Token不存在');
}

// 测试认证验证API
console.log('\n2. 测试认证验证API:');
fetch('/api/auth/verify', {
  method: 'GET',
  headers: {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('验证API状态码:', response.status);
  return response.json();
})
.then(data => {
  console.log('验证API响应:', data);
  
  if (data.success) {
    console.log('✅ 用户认证成功');
    
    // 如果认证成功，测试卡片API
    console.log('\n3. 测试卡片API:');
    return fetch('/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    console.log('❌ 用户认证失败:', data.message);
    throw new Error('认证失败');
  }
})
.then(response => {
  if (response) {
    console.log('卡片API状态码:', response.status);
    return response.json();
  }
})
.then(data => {
  if (data) {
    console.log('卡片API响应:', data);
    if (data.success && data.data) {
      console.log(`✅ 卡片API成功，返回 ${data.data.length} 条数据`);
    } else {
      console.log('❌ 卡片API失败:', data.message);
    }
  }
})
.catch(error => {
  console.error('❌ 测试过程中发生错误:', error);
});

// 检查当前页面的认证状态
console.log('\n4. 检查当前页面状态:');
if (window.location.pathname === '/login') {
  console.log('当前在登录页面');
} else if (window.location.pathname === '/') {
  console.log('当前在首页');
  
  // 检查页面上是否显示了卡片
  setTimeout(() => {
    const cards = document.querySelectorAll('[class*="card"], [class*="feature"]');
    console.log(`页面上找到 ${cards.length} 个可能的卡片元素`);
    
    const emptyMessage = document.querySelector('*');
    const pageText = document.body.innerText;
    if (pageText.includes('暂无卡片')) {
      console.log('❌ 页面显示"暂无卡片"消息');
    } else {
      console.log('✅ 页面没有显示"暂无卡片"消息');
    }
  }, 1000);
} else {
  console.log('当前在其他页面:', window.location.pathname);
}

console.log('\n=== 调试脚本执行完成 ===');
console.log('请将以上输出信息提供给开发者进行问题诊断');