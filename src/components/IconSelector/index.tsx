import React, { useState, useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { iconMap, getIconByName, IconName } from '../../utils/iconMapping';
import { Search, X } from 'lucide-react';

interface IconSelectorProps {
  selectedIcon?: IconName;
  onSelect: (iconName: IconName) => void;
  onClose?: () => void;
  isOpen: boolean;
}

/**
 * 图标选择器组件
 * 提供可视化的图标选择界面
 */
const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelect,
  onClose,
  isOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState<IconName | null>(null);

  /**
   * 获取所有可用的图标
   */
  const allIcons = useMemo(() => {
    return Object.keys(iconMap) as IconName[];
  }, []);

  /**
   * 根据搜索查询过滤图标
   */
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIcons;
    }
    
    const query = searchQuery.toLowerCase();
    return allIcons.filter(iconName => 
      iconName.toLowerCase().includes(query)
    );
  }, [allIcons, searchQuery]);

  /**
   * 处理图标选择
   */
  const handleIconSelect = (iconName: IconName) => {
    onSelect(iconName);
    if (onClose) {
      onClose();
    }
  };

  /**
   * 处理搜索输入变化
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    setSearchQuery('');
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">选择图标</h2>
            <p className="text-sm text-gray-600 mt-1">
              共 {allIcons.length} 个图标，当前显示 {filteredIcons.length} 个
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="关闭"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 搜索栏 */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="搜索图标名称..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                title="清除搜索"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 图标网格 */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>未找到匹配的图标</p>
              <p className="text-sm mt-2">尝试使用不同的关键词搜索</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
              {filteredIcons.map((iconName) => {
                const IconComponent = getIconByName(iconName);
                const isSelected = selectedIcon === iconName;
                const isHovered = hoveredIcon === iconName;
                
                return (
                  <div
                    key={iconName}
                    className={`
                      relative group cursor-pointer rounded-lg p-3 transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300'
                      }
                      ${isHovered ? 'transform scale-105' : ''}
                    `}
                    onClick={() => handleIconSelect(iconName)}
                    onMouseEnter={() => setHoveredIcon(iconName)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    title={iconName}
                  >
                    {/* 图标 */}
                    <div className="flex items-center justify-center h-8 w-8 mx-auto">
                      <IconComponent 
                        size={24} 
                        className={`
                          transition-colors duration-200
                          ${isSelected ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'}
                        `}
                      />
                    </div>
                    
                    {/* 选中标识 */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    
                    {/* 悬停时显示名称 */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                        {iconName}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedIcon && (
              <div className="flex items-center gap-2">
                <span>已选择:</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {React.createElement(getIconByName(selectedIcon), { size: 16 })}
                  <span className="font-medium">{selectedIcon}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
            )}
            {selectedIcon && (
              <button
                onClick={() => handleIconSelect(selectedIcon)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                确认选择
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconSelector;