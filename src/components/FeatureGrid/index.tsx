import React from 'react';
import { LucideIcon } from 'lucide-react';
import FeatureCard from '../FeatureCard';

/**
 * 功能卡片数据接口
 */
export interface FeatureCardData {
  /** 卡片ID */
  id?: string;
  /** 功能名称 */
  name: string;
  /** 功能描述 */
  desc: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 背景颜色类名 */
  bgColor: string;

  /** 工作流ID */
  workflowId?: string;
  /** 工作流参数 */
  workflowParams?: string;
}

/**
 * 功能网格组件接口
 */
interface FeatureGridProps {
  /** 功能卡片数据数组 */
  cards: FeatureCardData[];
  /** 卡片点击事件处理函数 */
  onCardClick?: (card: FeatureCardData, index: number) => void;
}

/**
 * 功能网格组件
 * 以每行两列的布局展示功能卡片
 * 响应式设计，在移动端保持两列布局
 */
export default function FeatureGrid({ cards, onCardClick }: FeatureGridProps) {
  if (cards.length === 0) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-500 mb-4">暂无卡片</p>
          <p className="text-sm text-gray-400">点击"添加卡片"按钮来创建第一个卡片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card, index) => (
            <FeatureCard
              key={card.id || index}
              name={card.name}
              desc={card.desc}
              icon={card.icon}
              bgColor={card.bgColor}
              onClick={() => onCardClick?.(card, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}