const jwt = require('jsonwebtoken');

// 生成一个测试用的JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const testPayload = {
  userId: 1,
  username: 'gg7788',
  email: '7788gg@qq.com'
};

const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });

console.log('Generated test token:');
console.log(token);

// 验证token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\nToken verification successful:');
  console.log(decoded);
} catch (error) {
  console.log('\nToken verification failed:', error.message);
}