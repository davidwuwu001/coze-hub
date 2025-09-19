import React from 'react';
import { cn } from '../../lib/utils';

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  children: React.ReactNode;
}

/**
 * 基础图标组件
 * @param size - 图标尺寸
 * @param color - 图标颜色
 * @param className - 额外的CSS类名
 * @param children - 图标内容（通常是SVG或图标组件）
 * @param props - 其他HTML div属性
 */
const Icon: React.FC<IconProps> = ({
  size = 'md',
  color,
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={{ color }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Icon;