import React, { useState, useRef, useEffect } from 'react';
import { FeatureCardData } from '../../types';
import { GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getIconByName } from '../../utils/iconMapping';

interface DragDropListProps {
  items: FeatureCardData[];
  onReorder: (newOrder: FeatureCardData[]) => void;
  onEdit: (item: FeatureCardData) => void;
  onDelete: (itemId: string) => void;
  onToggleEnabled: (itemId: string, enabled: boolean) => void;
}

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
}

/**
 * 拖拽排序列表组件
 * 支持卡片的拖拽排序、编辑、删除和启用/禁用功能
 */
const DragDropList: React.FC<DragDropListProps> = ({
  items,
  onReorder,
  onEdit,
  onDelete,
  onToggleEnabled
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    dragOverIndex: null
  });
  
  const dragItemRef = useRef<HTMLDivElement | null>(null);
  const [draggedItem, setDraggedItem] = useState<FeatureCardData | null>(null);

  /**
   * 开始拖拽
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    const item = items[index];
    setDraggedItem(item);
    setDragState({
      isDragging: true,
      dragIndex: index,
      dragOverIndex: null
    });
    
    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    // 设置拖拽图像
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  /**
   * 拖拽经过
   */
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.dragIndex !== index) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: index
      }));
    }
  };

  /**
   * 拖拽进入
   */
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState.dragIndex !== index) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: index
      }));
    }
  };

  /**
   * 拖拽离开
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有当离开整个拖拽区域时才清除dragOverIndex
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: null
      }));
    }
  };

  /**
   * 放置
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    const { dragIndex } = dragState;
    
    if (dragIndex !== null && dragIndex !== dropIndex && draggedItem) {
      const newItems = [...items];
      
      // 移除拖拽的项目
      newItems.splice(dragIndex, 1);
      
      // 在新位置插入项目
      newItems.splice(dropIndex, 0, draggedItem);
      
      // 更新order字段
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index
      }));
      
      onReorder(reorderedItems);
    }
    
    // 重置拖拽状态
    setDragState({
      isDragging: false,
      dragIndex: null,
      dragOverIndex: null
    });
    setDraggedItem(null);
  };

  /**
   * 拖拽结束
   */
  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      dragIndex: null,
      dragOverIndex: null
    });
    setDraggedItem(null);
  };

  /**
   * 获取拖拽项目的样式类名
   */
  const getDragItemClassName = (index: number) => {
    const baseClasses = 'bg-white rounded-lg border p-4 transition-all duration-200 cursor-move';
    
    if (dragState.dragIndex === index) {
      return `${baseClasses} opacity-50 scale-95 border-blue-300`;
    }
    
    if (dragState.dragOverIndex === index) {
      return `${baseClasses} border-blue-400 shadow-lg transform scale-102`;
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300 hover:shadow-md`;
  };

  /**
   * 处理编辑按钮点击
   */
  const handleEditClick = (e: React.MouseEvent, item: FeatureCardData) => {
    e.stopPropagation();
    onEdit(item);
  };

  /**
   * 处理删除按钮点击
   */
  const handleDeleteClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个卡片吗？')) {
      onDelete(itemId);
    }
  };

  /**
   * 处理启用/禁用切换
   */
  const handleToggleEnabled = (e: React.MouseEvent, itemId: string, enabled: boolean) => {
    e.stopPropagation();
    onToggleEnabled(itemId, !enabled);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无卡片数据</p>
        <p className="text-sm mt-2">点击上方的"添加卡片"按钮来创建新卡片</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const IconComponent = getIconByName(item.iconName);
        
        return (
          <div
            key={item.id}
            className={getDragItemClassName(index)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            ref={dragState.dragIndex === index ? dragItemRef : null}
          >
            <div className="flex items-center gap-4">
              {/* 拖拽手柄 */}
              <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
              </div>
              
              {/* 图标 */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center text-white shadow-lg`}>
                <IconComponent size={24} />
              </div>
              
              {/* 卡片信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  {!item.enabled && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      已禁用
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{item.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">图标: {item.iconName}</span>
                  <span className="text-xs text-gray-500">顺序: {item.order + 1}</span>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* 启用/禁用按钮 */}
                <button
                  onClick={(e) => handleToggleEnabled(e, item.id, item.enabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.enabled 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={item.enabled ? '禁用卡片' : '启用卡片'}
                >
                  {item.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                
                {/* 编辑按钮 */}
                <button
                  onClick={(e) => handleEditClick(e, item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑卡片"
                >
                  <Edit size={16} />
                </button>
                
                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDeleteClick(e, item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除卡片"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DragDropList;