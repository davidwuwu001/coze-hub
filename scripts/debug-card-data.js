/**
 * 调试卡片数据格式
 * 检查数据库数据和前端期望格式的差异
 */

async function debugCardData() {
  console.log('=== 调试卡片数据格式 ===');
  
  try {
    // 1. 获取数据库原始数据
    console.log('\n1. 获取数据库原始数据...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'David',
        password: '123456'
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    
    const cardsResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const cardsResult = await cardsResponse.json();
    console.log('数据库原始数据（前3张）:');
    cardsResult.data.slice(0, 3).forEach((card, index) => {
      console.log(`卡片${index + 1}:`, {
        id: card.id,
        name: card.name,
        desc: card.desc,
        iconName: card.iconName,
        bgColor: card.bgColor,
        bgColorType: typeof card.bgColor
      });
    });
    
    // 2. 检查图标映射
    console.log('\n2. 检查图标映射...');
    const iconMap = {
      FileText: 'FileText',
      Video: 'Video', 
      BookOpen: 'BookOpen',
      Search: 'Search',
      Image: 'Image',
      Mic: 'Mic',
      Volume2: 'Volume2',
      TrendingUp: 'TrendingUp',
      Edit: 'Edit',
      User: 'User',
      BarChart3: 'BarChart3',
      Target: 'Target'
    };
    
    cardsResult.data.slice(0, 3).forEach((card, index) => {
      const hasIcon = iconMap[card.iconName];
      console.log(`卡片${index + 1} 图标映射:`, {
        iconName: card.iconName,
        hasMapping: !!hasIcon,
        mappedTo: hasIcon || 'FileText (fallback)'
      });
    });
    
    // 3. 检查bgColor格式
    console.log('\n3. 检查bgColor格式...');
    const expectedBgColors = [
      'bg-blue-500', 'bg-orange-500', 'bg-red-500', 'bg-green-500',
      'bg-pink-500', 'bg-purple-500', 'bg-yellow-500', 'bg-cyan-500'
    ];
    
    cardsResult.data.slice(0, 3).forEach((card, index) => {
      const isValidBgColor = expectedBgColors.includes(card.bgColor);
      console.log(`卡片${index + 1} bgColor检查:`, {
        bgColor: card.bgColor,
        isValidFormat: isValidBgColor,
        expectedFormats: expectedBgColors
      });
    });
    
    // 4. 模拟前端数据转换
    console.log('\n4. 模拟前端数据转换...');
    const formattedCards = cardsResult.data.slice(0, 3).map((card) => ({
      id: card.id,
      name: card.name,
      desc: card.desc,
      icon: iconMap[card.iconName] || 'FileText',
      bgColor: card.bgColor
    }));
    
    console.log('转换后的数据:');
    formattedCards.forEach((card, index) => {
      console.log(`转换后卡片${index + 1}:`, card);
    });
    
    console.log('\n=== 调试完成 ===');
    
  } catch (error) {
    console.error('调试过程中发生错误:', error.message);
  }
}

// 运行调试
debugCardData();