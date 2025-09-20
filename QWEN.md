# CATAIT智媒体运营工具 - 项目上下文

## 项目概述

这是一个基于 Next.js 和 React 的智能体功能卡片展示小程序前端项目，名为 CATAIT智媒体运营工具。该项目提供了一个现代化的用户界面，用于展示各种智能体功能，并包含完整的用户认证系统和后台管理功能。

主要功能包括：
- 用户注册、登录和JWT认证
- 功能卡片展示（每行两列布局）
- 后台管理系统，支持卡片的增删改查和拖拽排序
- 响应式设计，适配移动端和桌面端

## 技术栈

### 前端技术
- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **图标库**: Lucide React
- **拖拽功能**: react-beautiful-dnd
- **动画**: Framer Motion
- **通知**: Sonner
- **状态管理**: Zustand
- **开发工具**: ESLint + PostCSS

### 后端技术
- **数据库**: MySQL
- **认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs
- **数据库连接**: mysql2
- **API路由**: Next.js API Routes

## 项目结构

```
├── pages/                 # Next.js 页面
│   ├── api/              # API 路由
│   │   └── auth/         # 认证相关 API
│   │       ├── register.ts
│   │       ├── login.ts
│   │       ├── verify.ts
│   │       └── logout.ts
│   ├── auth/             # 认证页面
│   │   ├── login.tsx     # 登录页面
│   │   └── register.tsx  # 注册页面
│   ├── index.tsx         # 主页面
│   ├── admin.tsx         # 后台管理页面
│   └── _app.tsx          # 应用入口
├── src/
│   ├── components/       # React 组件
│   │   ├── AuthLayout.tsx      # 认证布局组件
│   │   ├── LoginForm.tsx       # 登录表单
│   │   ├── RegisterForm.tsx    # 注册表单
│   │   ├── ProtectedRoute.tsx  # 路由保护组件
│   │   ├── FeatureCard.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── Header.tsx
│   │   ├── HeroBanner.tsx
│   │   └── BottomNav.tsx
│   ├── hooks/           # React Hooks
│   │   └── useAuth.ts   # 认证状态管理
│   ├── types/           # TypeScript 类型定义
│   │   └── auth.ts      # 认证相关类型
│   └── utils/           # 工具函数
│       ├── auth.ts      # 认证工具函数
│       └── db.ts        # 数据库连接
├── scripts/             # 脚本文件
│   └── init-db.js      # 数据库初始化脚本
├── public/              # 静态资源
├── styles/              # 样式文件
└── .env.local          # 环境变量配置
```

## 开发环境配置

### 环境要求
- Node.js 18+
- MySQL 5.7+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制 `.env.local` 文件并配置数据库连接：
```env
DATABASE_URL=mysql://username:password@host:port/database
JWT_SECRET=your-jwt-secret-key
```

2. 初始化数据库：
```bash
node scripts/init-db.js
```

## 构建和运行命令

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 运行代码检查
```bash
npm run lint
```

### 运行 TypeScript 类型检查
```bash
npm run check
```

### 导出静态站点
```bash
npm run export
```

## 开发约定

1. 使用 TypeScript 进行类型检查
2. 使用 Tailwind CSS 进行样式开发
3. 遵循 Next.js 的文件系统路由约定
4. API 路由放在 `pages/api` 目录下
5. 使用 `useAuth` Hook 进行认证状态管理
6. 所有组件应尽量保持无状态或使用自定义 Hooks 管理状态
7. 数据库操作通过 `src/utils/db.ts` 中的工具函数进行

## 数据库结构

### users 表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### invite_codes 表
```sql
CREATE TABLE invite_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL
);
```

## 安全特性

- 密码加密：使用 bcryptjs 进行密码哈希
- JWT认证：安全的令牌认证机制
- 路由保护：防止未授权访问
- 邀请码系统：控制用户注册
- 输入验证：前后端双重验证
- 安全Cookie：HttpOnly Cookie 存储令牌

## 用户认证流程

1. 用户通过 `/auth/register` 页面注册，需要提供邀请码
2. 用户通过 `/auth/login` 页面登录，支持用户名/邮箱/手机号多种方式
3. 登录成功后，服务器返回 JWT 令牌，前端将其存储在 localStorage 中
4. 在需要认证的页面，使用 `ProtectedRoute` 组件或 `useAuth` Hook 检查登录状态
5. 用户登出时，清除 localStorage 中的令牌

## 后台管理功能

- 编辑卡片名称和描述
- 选择合适的图标
- 拖拽调整卡片顺序
- 所有更改自动保存
- 需要登录后才能访问

访问 `/admin` 页面进入后台管理。

## 项目当前状态

项目已完成 v2.0.0 版本，包含完整的用户认证系统，可用于生产环境。