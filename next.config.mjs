import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 图片配置
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // 输出配置 - 确保与Vercel兼容
  output: 'standalone',
  
  // 环境变量配置
  env: {
    customKey: 'my-value',
  },

  // TypeScript配置
  typescript: {
    // 在构建时忽略TypeScript错误（仅用于部署）
    ignoreBuildErrors: false,
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // 实验性功能
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['mysql2'],
  },
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);