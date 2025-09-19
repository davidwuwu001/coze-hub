import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * 搜索栏组件
 * @param placeholder - 搜索框占位符文字
 * @param onSearch - 搜索回调函数
 * @param className - 额外的CSS类名
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索文章、营销等内容',
  onSearch,
  className
}) => {
  const [query, setQuery] = useState('');

  /**
   * 处理搜索提交
   */
  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  /**
   * 处理回车键搜索
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn(
      'w-full px-4 py-3 bg-gradient-main',
      className
    )}>
      <div className="flex items-center bg-white rounded-full shadow-sm overflow-hidden">
        {/* 左侧搜索图标 */}
        <div className="pl-4 pr-2 py-3">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* 搜索输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 py-3 text-base text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none"
        />
        
        {/* 右侧搜索按钮 */}
        <div className="pr-2">
          <Button
            onClick={handleSearch}
            variant="primary"
            size="sm"
            className="px-6 py-2 bg-primary-blue hover:bg-blue-600 text-white rounded-full font-medium"
          >
            搜索
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;