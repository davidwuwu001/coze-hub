# 智能体功能卡片小程序前端项目

## 项目简介

这是一个基于 Next.js 和 React 的智能体功能卡片展示小程序前端项目。项目提供了一个现代化的用户界面，展示各种智能体功能，并包含后台管理系统。

## 主要功能

### 前端功能
- 🎨 **现代化UI设计**：采用 Tailwind CSS 构建的响应式界面
- 📱 **移动端适配**：完美适配各种屏幕尺寸
- 🎯 **功能卡片展示**：12个智能体功能卡片，每行两列布局
- 🎭 **立体图标效果**：每个卡片都有对应的立体图标和渐变背景
- 🏠 **主横幅区域**：HeroBanner组件展示项目标题和描述
- 📍 **底部导航栏**：固定在屏幕底部的导航栏

### 后台管理功能
- ⚙️ **卡片管理**：可视化编辑卡片名称、图标和功能
- 🔄 **拖拽排序**：支持拖拽重新排列卡片顺序
- 💾 **数据持久化**：使用 localStorage 保存配置
- 🎨 **图标选择器**：从 lucide-react 图标库中选择图标

## 技术栈

- **前端框架**：Next.js 14 + React 18
- **样式方案**：Tailwind CSS
- **类型检查**：TypeScript
- **图标库**：Lucide React
- **拖拽功能**：react-beautiful-dnd
- **开发工具**：ESLint + PostCSS

## 项目结构

```
├── pages/                 # Next.js 页面
│   ├── index.tsx         # 主页面
│   ├── admin.tsx         # 后台管理页面
│   └── _app.tsx          # 应用入口
├── src/
│   ├── components/       # React 组件
│   │   ├── FeatureCard.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── Header.tsx
│   │   ├── HeroBanner.tsx
│   │   └── BottomNav.tsx
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数
├── public/              # 静态资源
└── styles/              # 样式文件
```

## 快速开始

### 安装依赖
```bash
npm install
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

### 主页面
- 浏览12个智能体功能卡片
- 点击右上角管理按钮进入后台
- 使用底部导航栏切换不同功能

### 后台管理
- 编辑卡片名称和描述
- 选择合适的图标
- 拖拽调整卡片顺序
- 所有更改自动保存

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

**项目状态**：✅ 开发完成，可用于生产环境
