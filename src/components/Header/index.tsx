import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  title?: string;
  showControls?: boolean;
  className?: string;
  onAdminClick?: () => void;
}

/**
 * 顶部标题栏组件
 * @param title - 标题文字
 * @param showControls - 是否显示右侧控制按钮
 * @param className - 额外的CSS类名
 * @param onAdminClick - 后台管理按钮点击回调
 */
const Header: React.FC<HeaderProps> = ({
  title = 'CATAIT智媒体运营工具',
  showControls = true,
  className,
  onAdminClick
}) => {
  return (
    <header className={cn(
      'w-full bg-gradient-main px-4 py-3 flex items-center justify-between',
      className
    )}>
      {/* 标题 */}
      <h1 className="text-white text-lg font-medium">
        {title}
      </h1>
      
      {/* 右侧控制按钮 */}
      {showControls && (
        <div className="flex items-center">
          {/* 后台管理按钮 */}
          <button 
            onClick={onAdminClick}
            className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
            aria-label="后台管理"
            title="后台管理"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;