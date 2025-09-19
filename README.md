# CATAIT智媒体运营工具

## 项目简介

这是一个基于 Next.js 和 React 的智能体功能卡片展示小程序前端项目。项目提供了一个现代化的用户界面，展示各种智能体功能，并包含完整的用户认证系统和后台管理功能。

## 主要功能

### 用户认证系统
- 🔐 **用户注册**：支持邀请码验证的用户注册功能
- 🔑 **用户登录**：支持用户名/邮箱/手机号多种登录方式
- 🛡️ **路由保护**：未登录用户自动重定向到登录页面
- 🎫 **JWT认证**：基于JWT的安全认证机制
- 📱 **响应式设计**：完美适配移动端和桌面端

### 前端功能
- 🎨 **现代化UI设计**：采用 Tailwind CSS 构建的响应式界面
- 📱 **移动端适配**：完美适配各种屏幕尺寸
- 🎯 **功能卡片展示**：智能体功能卡片，每行两列布局
- 🎭 **立体图标效果**：每个卡片都有对应的立体图标和渐变背景
- 🏠 **主横幅区域**：HeroBanner组件展示项目标题和描述
- 📍 **底部导航栏**：固定在屏幕底部的导航栏

### 后台管理功能
- ⚙️ **卡片管理**：可视化编辑卡片名称、图标和功能
- 🔄 **拖拽排序**：支持拖拽重新排列卡片顺序
- 💾 **数据持久化**：使用 localStorage 保存配置
- 🎨 **图标选择器**：从 lucide-react 图标库中选择图标

## 技术栈

### 前端技术
- **前端框架**：Next.js 15 + React 18
- **样式方案**：Tailwind CSS
- **类型检查**：TypeScript
- **图标库**：Lucide React
- **拖拽功能**：react-beautiful-dnd
- **动画库**：Framer Motion
- **通知组件**：Sonner
- **开发工具**：ESLint + PostCSS

### 后端技术
- **数据库**：MySQL
- **认证**：JWT (JSON Web Tokens)
- **密码加密**：bcryptjs
- **数据库连接**：mysql2
- **API路由**：Next.js API Routes

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

## 快速开始

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

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
```

## 使用说明

### 用户注册
1. 访问 `/auth/register` 注册页面
2. 填写用户名、邮箱、手机号和密码
3. 输入有效的邀请码（演示邀请码：`1212` 或 `7777`）
4. 提交注册信息

### 用户登录
1. 访问 `/auth/login` 登录页面
2. 使用用户名、邮箱或手机号登录
3. 输入密码
4. 登录成功后自动跳转到主页

### 主页面
- 浏览智能体功能卡片
- 点击右上角管理按钮进入后台
- 使用底部导航栏切换不同功能
- 未登录用户会自动重定向到登录页面

### 后台管理
- 编辑卡片名称和描述
- 选择合适的图标
- 拖拽调整卡片顺序
- 所有更改自动保存
- 需要登录后才能访问

## GitHub 同步说明

### 创建 GitHub 仓库
1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库名称（建议：`miniprogram-agent-cards`）
4. 选择 "Public" 或 "Private"
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

### 推送代码到 GitHub
复制 GitHub 提供的仓库 URL，然后在项目目录中执行：

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送代码
git push -u origin master
```

### 后续更新
```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push
```

## 开发日志

### v2.0.0 - 用户认证系统
- ✅ 用户注册登录系统开发
- ✅ MySQL数据库集成
- ✅ JWT认证机制实现
- ✅ 路由保护功能
- ✅ 认证相关UI组件
- ✅ 邀请码验证系统
- ✅ 多种登录方式支持
- ✅ 响应式认证页面设计

### v1.0.0 - 基础功能
- ✅ 初始项目搭建
- ✅ 功能卡片布局实现（每行两列）
- ✅ 立体图标效果添加
- ✅ 底部导航栏固定定位
- ✅ HeroBanner 主横幅组件
- ✅ 后台管理系统开发
- ✅ 拖拽排序功能
- ✅ 数据持久化
- ✅ Git 仓库初始化和配置

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送 Pull Request

---

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

- 🔒 **密码加密**：使用 bcryptjs 进行密码哈希
- 🎫 **JWT认证**：安全的令牌认证机制
- 🛡️ **路由保护**：防止未授权访问
- 🔐 **邀请码系统**：控制用户注册
- 📝 **输入验证**：前后端双重验证
- 🍪 **安全Cookie**：HttpOnly Cookie 存储令牌

---

**项目状态**：✅ v2.0.0 开发完成，包含完整的用户认证系统，可用于生产环境
