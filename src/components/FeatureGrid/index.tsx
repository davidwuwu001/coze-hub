import React from 'react';
import { LucideIcon } from 'lucide-react';
import FeatureCard from '../FeatureCard';

/**
 * 功能卡片数据接口
 */
export interface FeatureCardData {
  /** 功能名称 */
  name: string;
  /** 功能描述 */
  desc: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 背景颜色类名 */
  bgColor: string;
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
const FeatureGrid: React.FC<FeatureGridProps> = ({ cards, onCardClick }) => {
  return (
    <div className="px-4 mb-20">
      {/* 每行两列的网格布局 */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => (
          <FeatureCard
            key={index}
            name={card.name}
            desc={card.desc}
            icon={card.icon}
            bgColor={card.bgColor}
            onClick={() => onCardClick?.(card, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;