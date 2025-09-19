import React from 'react';
import { Home, Compass, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

/**
 * 底部导航栏组件
 * @param activeTab - 当前激活的标签页ID
 * @param onTabChange - 标签页切换回调函数
 * @param className - 额外的CSS类名
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
  className
}) => {
  // 导航项配置
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: '首页',
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 'discover',
      label: '发现',
      icon: <Compass className="w-6 h-6" />
    },
    {
      id: 'profile',
      label: '我的',
      icon: <User className="w-6 h-6" />
    }
  ];

  /**
   * 处理导航项点击
   */
  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 px-4 py-2 z-50',
      className
    )}>
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors',
                'hover:bg-gray-50 active:bg-gray-100',
                isActive ? 'text-primary-blue' : 'text-gray-600'
              )}
              aria-label={item.label}
            >
              {/* 图标 */}
              <div className={cn(
                'mb-1 transition-colors',
                isActive ? 'text-primary-blue' : 'text-gray-400'
              )}>
                {item.icon}
              </div>
              
              {/* 标签文字 */}
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive ? 'text-primary-blue' : 'text-gray-600'
              )}>
                {item.label}
              </span>
              
              {/* 激活状态指示器 */}
              {isActive && (
                <div className="w-1 h-1 bg-primary-blue rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;