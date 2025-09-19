/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 图片配置
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // 基础路径配置（如果需要部署到子路径）
  // basePath: '',
  
  // 环境变量配置
  env: {
    customKey: 'my-value',
  },
};

export default nextConfig;