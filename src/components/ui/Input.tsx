import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * 基础输入框组件
 * @param variant - 输入框样式变体
 * @param size - 输入框尺寸
 * @param leftIcon - 左侧图标
 * @param rightIcon - 右侧图标
 * @param className - 额外的CSS类名
 * @param props - 其他HTML输入框属性
 */
const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseClasses = 'w-full border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  
  const variantClasses = {
    default: '',
    search: 'bg-gray-50 border-gray-200'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  if (leftIcon || rightIcon) {
    return (
      <div className="relative">
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            iconSizeClasses[size]
          )}>
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className={cn(
            'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            iconSizeClasses[size]
          )}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <input
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

export default Input;