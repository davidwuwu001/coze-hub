import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Grid,
  List,
  Settings,
  Check,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  GripVertical,
  RefreshCw
} from 'lucide-react';
import { FeatureCardData, AdminPageState, CardActionType, IconName } from '../src/types';
import { getIconByName, getAvailableIcons, iconMap } from '../src/utils/iconMapping';
import DragDropList from '../src/components/DragDropList';
import IconSelector from '../src/components/IconSelector';
import ProtectedRoute from '../src/components/ProtectedRoute';

/**
 * 后台管理页面
 * 用于管理功能卡片的配置
 */
export default function AdminPage() {
  const router = useRouter();
  
  // 页面状态
  const [state, setState] = useState<AdminPageState>({
    isEditing: false,
    editingCardId: null,
    showAddDialog: false,
    showIconPicker: false,
    searchKeyword: '',
    selectedCardIds: []
  });
  
  // 卡片数据
  const [cards, setCards] = useState<FeatureCardData[]>([]);
  const [editingCard, setEditingCard] = useState<Partial<FeatureCardData>>({});
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  /**
   * 从API加载卡片数据
   */
  const loadCards = async () => {
    try {
      const response = await fetch('/api/cards?admin=true');
      if (response.ok) {
        const cardsData = await response.json();
        setCards(cardsData);
      } else {
        setMessage({ type: 'error', text: '加载卡片数据失败' });
      }
    } catch (error) {
      console.error('加载卡片数据失败:', error);
      setMessage({ type: 'error', text: '加载卡片数据失败' });
    }
  };

  // 加载卡片数据
  useEffect(() => {
    loadCards();
  }, []);
  
  // 返回首页
  const handleGoBack = () => {
    router.push('/');
  };
  
  /**
   * 刷新卡片数据
   */
  const handleRefreshCards = () => {
    loadCards();
    setMessage({ type: 'success', text: '数据已刷新' });
    setTimeout(() => setMessage(null), 3000);
  };
  
  /**
   * 添加新卡片
   */
  const handleAddCard = () => {
    setState(prev => ({ ...prev, showAddDialog: true, isEditing: true }));
    setEditingCard({
      name: '',
      desc: '',
      iconName: 'FileText',
      bgColor: 'bg-blue-500',
      order: cards.length,
      enabled: true
    });
  };
  
  // 编辑卡片
  const handleEditCard = (card: FeatureCardData) => {
    setState(prev => ({ 
      ...prev, 
      isEditing: true, 
      editingCardId: card.id,
      showAddDialog: true 
    }));
    setEditingCard({ ...card });
  };

  /**
   * 处理卡片重新排序
   */
  const handleReorderCards = async (reorderedCards: FeatureCardData[]) => {
    try {
      const response = await fetch('/api/cards/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: reorderedCards }),
      });

      if (response.ok) {
        setCards(reorderedCards);
        setMessage({ type: 'success', text: '卡片顺序已更新' });
      } else {
        setMessage({ type: 'error', text: '更新卡片顺序失败' });
      }
    } catch (error) {
      console.error('更新卡片顺序失败:', error);
      setMessage({ type: 'error', text: '更新卡片顺序失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 处理启用/禁用切换
   */
  const handleToggleEnabled = async (cardId: string, enabled: boolean) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    try {
      const response = await fetch('/api/cards/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: cardId,
          name: card.name,
          desc: card.desc,
          iconName: card.iconName,
          bgColor: card.bgColor,
          order: card.order,
          enabled
        }),
      });

      if (response.ok) {
        const newCards = cards.map(c => 
          c.id === cardId ? { ...c, enabled } : c
        );
        setCards(newCards);
        setMessage({ 
          type: 'success', 
          text: enabled ? '卡片已启用' : '卡片已禁用' 
        });
      } else {
        setMessage({ type: 'error', text: '更新卡片状态失败' });
      }
    } catch (error) {
      console.error('更新卡片状态失败:', error);
      setMessage({ type: 'error', text: '更新卡片状态失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };
  
  /**
   * 删除卡片
   */
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('确定要删除这个卡片吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/cards/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: cardId }),
      });

      if (response.ok) {
        const newCards = cards.filter(card => card.id !== cardId);
        setCards(newCards);
        setMessage({ type: 'success', text: '卡片删除成功' });
      } else {
        setMessage({ type: 'error', text: '删除卡片失败' });
      }
    } catch (error) {
      console.error('删除卡片失败:', error);
      setMessage({ type: 'error', text: '删除卡片失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };
  
  /**
   * 保存编辑的卡片
   */
  const handleSaveEditingCard = async () => {
    if (!editingCard.name || !editingCard.desc) {
      setMessage({ type: 'error', text: '请填写完整的卡片信息' });
      return;
    }
    
    try {
      const cardData = {
        name: editingCard.name,
        desc: editingCard.desc,
        iconName: editingCard.iconName || 'FileText',
        bgColor: editingCard.bgColor || 'bg-blue-500',
        order: editingCard.order || 0,
        enabled: editingCard.enabled !== false
      };

      let response;
      if (state.editingCardId) {
        // 更新现有卡片
        response = await fetch('/api/cards/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: state.editingCardId, ...cardData }),
        });
      } else {
        // 添加新卡片
        response = await fetch('/api/cards/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cardData),
        });
      }

      if (response.ok) {
        // 重新加载卡片数据
        await loadCards();
        
        // 重置状态
        setState(prev => ({
          ...prev,
          isEditing: false,
          editingCardId: null,
          showAddDialog: false
        }));
        setEditingCard({});
        setMessage({ type: 'success', text: '卡片保存成功' });
      } else {
        setMessage({ type: 'error', text: '保存卡片失败' });
      }
    } catch (error) {
      console.error('保存卡片失败:', error);
      setMessage({ type: 'error', text: '保存卡片失败' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 处理图标选择
   */
  const handleIconSelect = (iconName: IconName) => {
    setEditingCard({
      ...editingCard,
      iconName,
      icon: getIconByName(iconName)
    });
    setIsIconSelectorOpen(false);
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      editingCardId: null,
      showAddDialog: false
    }));
    setEditingCard({});
  };
  
  // 切换卡片启用状态
  const handleToggleCard = (cardId: string) => {
    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    );
    setCards(newCards);
  };
  
  // 过滤卡片
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(state.searchKeyword.toLowerCase()) ||
    card.desc.toLowerCase().includes(state.searchKeyword.toLowerCase())
  );
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="返回首页"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">后台管理</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshCards}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              刷新数据
            </button>
          </div>
        </div>
      </header>
      
      {/* 工具栏 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索卡片..."
                value={state.searchKeyword}
                onChange={(e) => setState(prev => ({ ...prev, searchKeyword: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 添加按钮 */}
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>添加卡片</span>
          </button>
        </div>
      </div>
      
      {/* 卡片列表 */}
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-4">
          共 {filteredCards.length} 个卡片
        </div>
        
        {viewMode === 'list' ? (
          <DragDropList
            items={filteredCards}
            onReorder={handleReorderCards}
            onEdit={handleEditCard}
            onDelete={handleDeleteCard}
            onToggleEnabled={handleToggleEnabled}
          />
        ) : (
          filteredCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-2">暂无卡片</p>
              <p className="text-sm">点击"添加卡片"按钮来创建第一个卡片</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCards.map((card) => {
                const IconComponent = getIconByName(card.iconName);
                return (
                  <div
                    key={card.id}
                    className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                      !card.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleEnabled(card.id, !card.enabled)}
                          className={`p-1 rounded ${card.enabled ? 'text-green-600' : 'text-gray-400'}`}
                          title={card.enabled ? '禁用' : '启用'}
                        >
                          {card.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditCard(card)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{card.name}</h3>
                    <p className="text-sm text-gray-600">{card.desc}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      排序: {card.order}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      
      {/* 编辑对话框 */}
      {state.showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {state.editingCardId ? '编辑卡片' : '添加卡片'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 卡片名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  卡片名称
                </label>
                <input
                  type="text"
                  value={editingCard.name || ''}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入卡片名称"
                />
              </div>
              
              {/* 卡片描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  卡片描述
                </label>
                <input
                  type="text"
                  value={editingCard.desc || ''}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入卡片描述"
                />
              </div>
              
              {/* 图标选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图标
                </label>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${editingCard.bgColor || 'bg-blue-500'} flex items-center justify-center`}>
                    {editingCard.iconName && React.createElement(getIconByName(editingCard.iconName), { className: "w-6 h-6 text-white" })}
                  </div>
                  <button
                    onClick={() => setIsIconSelectorOpen(true)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left"
                  >
                    <span className="text-gray-700">{editingCard.iconName || 'FileText'}</span>
                    <span className="text-gray-400 ml-2">点击选择图标</span>
                  </button>
                </div>
              </div>
              
              {/* 背景颜色 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  背景颜色
                </label>
                <select
                  value={editingCard.bgColor || 'bg-blue-500'}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bg-blue-500">蓝色</option>
                  <option value="bg-red-500">红色</option>
                  <option value="bg-green-500">绿色</option>
                  <option value="bg-yellow-500">黄色</option>
                  <option value="bg-purple-500">紫色</option>
                  <option value="bg-pink-500">粉色</option>
                  <option value="bg-orange-500">橙色</option>
                  <option value="bg-cyan-500">青色</option>
                </select>
              </div>
              
              {/* 排序权重 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序权重
                </label>
                <input
                  type="number"
                  value={editingCard.order || 0}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="排序权重（数字越小越靠前）"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditingCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 图标选择器 */}
      <IconSelector
        isOpen={isIconSelectorOpen}
        selectedIcon={editingCard?.iconName}
        onSelect={handleIconSelect}
        onClose={() => setIsIconSelectorOpen(false)}
      />
      </div>
    </ProtectedRoute>
  );
}