import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * 根据背景颜色获取对应的渐变色和阴影色
 */
const getGradientColors = (bgColor: string) => {
  const colorMap: Record<string, { light: string; dark: string; shadow: string }> = {
    'bg-blue-500': {
      light: '#60a5fa',
      dark: '#3b82f6',
      shadow: 'rgba(59, 130, 246, 0.3)'
    },
    'bg-orange-500': {
      light: '#fb923c',
      dark: '#f97316',
      shadow: 'rgba(249, 115, 22, 0.3)'
    },
    'bg-red-500': {
      light: '#f87171',
      dark: '#ef4444',
      shadow: 'rgba(239, 68, 68, 0.3)'
    },
    'bg-green-500': {
      light: '#6ee7b7',
      dark: '#10b981',
      shadow: 'rgba(16, 185, 129, 0.3)'
    },
    'bg-pink-500': {
      light: '#f472b6',
      dark: '#ec4899',
      shadow: 'rgba(236, 72, 153, 0.3)'
    },
    'bg-purple-500': {
      light: '#a78bfa',
      dark: '#8b5cf6',
      shadow: 'rgba(139, 92, 246, 0.3)'
    },
    'bg-yellow-500': {
      light: '#fbbf24',
      dark: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.3)'
    },
    'bg-cyan-500': {
      light: '#67e8f9',
      dark: '#06b6d4',
      shadow: 'rgba(6, 182, 212, 0.3)'
    }
  };

  return colorMap[bgColor] || {
    light: '#6b7280',
    dark: '#4b5563',
    shadow: 'rgba(75, 85, 99, 0.3)'
  };
};

/**
 * 功能卡片组件接口
 */
interface FeatureCardProps {
  /** 功能名称 */
  name: string;
  /** 功能描述 */
  desc: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 背景颜色类名 */
  bgColor: string;
  /** 点击事件处理函数 */
  onClick?: () => void;
}

/**
 * 功能卡片组件
 * 用于展示单个功能的卡片，包含图标、名称和描述
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  name,
  desc,
  icon: IconComponent,
  bgColor,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
      style={{
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 2px 4px rgba(0, 0, 0, 0.05)
        `
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          0 8px 25px rgba(0, 0, 0, 0.12),
          0 4px 8px rgba(0, 0, 0, 0.08)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 2px 4px rgba(0, 0, 0, 0.05)
        `;
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-900 font-medium text-sm mb-1">{name}</h3>
          <p className="text-gray-500 text-xs">{desc}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ml-3 relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
             style={{
               background: `linear-gradient(135deg, ${getGradientColors(bgColor).light}, ${getGradientColors(bgColor).dark})`,
               boxShadow: `
                 0 8px 16px ${getGradientColors(bgColor).shadow},
                 0 4px 8px rgba(0, 0, 0, 0.1),
                 inset 0 1px 0 rgba(255, 255, 255, 0.3),
                 inset 0 -1px 0 rgba(0, 0, 0, 0.2)
               `
             }}>
          {/* 高光效果 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;