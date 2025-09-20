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
  RefreshCw,
  Users,
  Coins,
  CreditCard,
  UserPlus,
  UserMinus,
  Award
} from 'lucide-react';
import { FeatureCardData, AdminPageState, CardActionType, IconName } from '../src/types';
import { getIconByName, getAvailableIcons, iconMap } from '../src/utils/iconMapping';
import DragDropList from '../src/components/DragDropList';
import IconSelector from '../src/components/IconSelector';
import ProtectedRoute from '../src/components/ProtectedRoute';

/**
 * 后台管理页面
 * 用于管理功能卡片、用户和积分的配置
 */
function AdminPage() {
  const router = useRouter();
  
  // 当前活动的管理模块
  const [activeTab, setActiveTab] = useState<'cards' | 'users' | 'points'>('cards');
  
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
  
  // 用户数据
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>({});
  const [showUserDialog, setShowUserDialog] = useState(false);
  
  // 积分数据
  const [pointsData, setPointsData] = useState<any[]>([]);
  const [editingPoints, setEditingPoints] = useState<any>({});
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  
  /**
   * 从API加载卡片数据
   */
  const loadCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/cards?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCards(result.data || result);
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '认证失败，请重新登录' });
        localStorage.removeItem('token');
        router.push('/auth/login');
      } else {
        setMessage({ type: 'error', text: '加载卡片数据失败' });
      }
    } catch (error) {
      console.error('加载卡片数据失败:', error);
      setMessage({ type: 'error', text: '加载卡片数据失败' });
    }
  };

  /**
   * 加载用户数据
   */
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 模拟用户数据，实际项目中应该从API获取
      const mockUsers = [
        { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01', points: 1000 },
        { id: '2', username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', createdAt: '2024-01-02', points: 500 },
        { id: '3', username: 'user2', email: 'user2@example.com', role: 'user', status: 'inactive', createdAt: '2024-01-03', points: 200 }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      setMessage({ type: 'error', text: '加载用户数据失败' });
    }
  };

  /**
   * 加载积分数据
   */
  const loadPointsData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 模拟积分记录数据，实际项目中应该从API获取
      const mockPointsData = [
        { id: '1', userId: '1', username: 'admin', action: '登录奖励', points: 10, type: 'earn', createdAt: '2024-01-15' },
        { id: '2', userId: '2', username: 'user1', action: '完成任务', points: 50, type: 'earn', createdAt: '2024-01-14' },
        { id: '3', userId: '2', username: 'user1', action: '兑换商品', points: -20, type: 'spend', createdAt: '2024-01-13' },
        { id: '4', userId: '3', username: 'user2', action: '分享奖励', points: 5, type: 'earn', createdAt: '2024-01-12' }
      ];
      setPointsData(mockPointsData);
    } catch (error) {
      console.error('加载积分数据失败:', error);
      setMessage({ type: 'error', text: '加载积分数据失败' });
    }
  };

  // 加载所有数据
  useEffect(() => {
    loadCards();
    loadUsers();
    loadPointsData();
  }, []);
  
  // 返回首页
  const handleGoBack = () => {
    router.push('/');
  };
  
  /**
   * 刷新数据
   */
  const handleRefreshData = () => {
    if (activeTab === 'cards') {
      loadCards();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'points') {
      loadPointsData();
    }
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
      enabled: true,
      workflowId: '',
      workflowParams: '{}',
      workflowEnabled: false
    });
  };

  /**
   * 添加新用户
   */
  const handleAddUser = () => {
    setShowUserDialog(true);
    setEditingUser({
      username: '',
      email: '',
      role: 'user',
      status: 'active',
      points: 0
    });
  };

  /**
   * 编辑用户
   */
  const handleEditUser = (user: any) => {
    setShowUserDialog(true);
    setEditingUser({ ...user });
  };

  /**
   * 删除用户
   */
  const handleDeleteUser = (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return;
    setUsers(users.filter(user => user.id !== userId));
    setMessage({ type: 'success', text: '用户删除成功' });
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 保存用户
   */
  const handleSaveUser = () => {
    if (!editingUser.username || !editingUser.email) {
      setMessage({ type: 'error', text: '请填写完整的用户信息' });
      return;
    }

    if (editingUser.id) {
      // 更新用户
      setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
      setMessage({ type: 'success', text: '用户更新成功' });
    } else {
      // 添加新用户
      const newUser = { ...editingUser, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
      setUsers([...users, newUser]);
      setMessage({ type: 'success', text: '用户添加成功' });
    }

    setShowUserDialog(false);
    setEditingUser({});
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 添加积分记录
   */
  const handleAddPointsRecord = () => {
    setShowPointsDialog(true);
    setEditingPoints({
      userId: '',
      username: '',
      action: '',
      points: 0,
      type: 'earn'
    });
  };

  /**
   * 保存积分记录
   */
  const handleSavePointsRecord = () => {
    if (!editingPoints.userId || !editingPoints.action || !editingPoints.points) {
      setMessage({ type: 'error', text: '请填写完整的积分记录信息' });
      return;
    }

    const selectedUser = users.find(user => user.id === editingPoints.userId);
    if (!selectedUser) {
      setMessage({ type: 'error', text: '请选择有效的用户' });
      return;
    }

    const newRecord = {
      ...editingPoints,
      id: Date.now().toString(),
      username: selectedUser.username,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPointsData([newRecord, ...pointsData]);
    
    // 更新用户积分
    const pointsChange = editingPoints.type === 'earn' ? editingPoints.points : -editingPoints.points;
    setUsers(users.map(user => 
      user.id === editingPoints.userId 
        ? { ...user, points: user.points + pointsChange }
        : user
    ));

    setShowPointsDialog(false);
    setEditingPoints({});
    setMessage({ type: 'success', text: '积分记录添加成功' });
    setTimeout(() => setMessage(null), 3000);
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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const response = await fetch('/api/cards/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cards: reorderedCards }),
      });

      if (response.ok) {
        setCards(reorderedCards);
        setMessage({ type: 'success', text: '卡片顺序已更新' });
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '认证失败，请重新登录' });
        localStorage.removeItem('token');
        router.push('/auth/login');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const response = await fetch('/api/cards/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '认证失败，请重新登录' });
        localStorage.removeItem('token');
        router.push('/auth/login');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const response = await fetch('/api/cards/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: cardId }),
      });

      if (response.ok) {
        const newCards = cards.filter(card => card.id !== cardId);
        setCards(newCards);
        setMessage({ type: 'success', text: '卡片删除成功' });
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '认证失败，请重新登录' });
        localStorage.removeItem('token');
        router.push('/auth/login');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const cardData = {
        name: editingCard.name,
        desc: editingCard.desc,
        iconName: editingCard.iconName || 'FileText',
        bgColor: editingCard.bgColor || 'bg-blue-500',
        order: editingCard.order || 0,
        enabled: editingCard.enabled !== false,
        workflowId: editingCard.workflowId || '',
        workflowParams: editingCard.workflowParams || '{}',
        workflowEnabled: editingCard.workflowEnabled || false
      };

      let response;
      if (state.editingCardId) {
        // 更新现有卡片
        response = await fetch('/api/cards/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: state.editingCardId, ...cardData }),
        });
      } else {
        // 添加新卡片
        response = await fetch('/api/cards/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: '认证失败，请重新登录' });
        localStorage.removeItem('token');
        router.push('/auth/login');
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
                onClick={handleRefreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                刷新数据
              </button>
            </div>
          </div>
        </header>

        {/* 标签页导航 */}
        <div className="bg-white border-b">
          <div className="px-4">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('cards')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'cards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
                卡片管理
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                用户管理
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'points'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Coins className="w-4 h-4" />
                积分管理
              </button>
            </nav>
          </div>
        </div>
      
        {/* 内容区域 */}
        <div className="flex-1">
          {/* 卡片管理模块 */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {/* 搜索和视图切换 */}
              <div className="bg-white border-b px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="搜索卡片..."
                        value={state.searchKeyword}
                        onChange={(e) => setState(prev => ({ ...prev, searchKeyword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 添加卡片按钮 */}
                    <button
                      onClick={handleAddCard}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm border border-green-700"
                    >
                      <Plus className="w-5 h-5 stroke-2" />
                      添加卡片
                    </button>
                    
                    {/* 视图切换按钮 */}
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-label="网格视图"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      aria-label="列表视图"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
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
            </div>
          )}
          
          {/* 用户管理模块 */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* 用户管理工具栏 */}
              <div className="bg-white border-b px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">用户管理</h3>
                    <p className="text-sm text-gray-600 mt-1">管理系统用户和权限</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 添加用户按钮 */}
                    <button
                      onClick={handleAddUser}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm border border-green-700"
                    >
                      <UserPlus className="w-5 h-5 stroke-2" />
                      添加用户
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="bg-white rounded-lg border">
                  <div className="p-4">
                    <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-gray-900">用户名</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">邮箱</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">角色</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">状态</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">积分</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">创建时间</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3">{user.username}</td>
                            <td className="py-2 px-3">{user.email}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role === 'admin' ? '管理员' : '用户'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status === 'active' ? '活跃' : '禁用'}
                              </span>
                            </td>
                            <td className="py-2 px-3">{user.points}</td>
                            <td className="py-2 px-3">{user.createdAt}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="编辑"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 积分管理模块 */}
          {activeTab === 'points' && (
            <div className="space-y-4">
              {/* 积分管理工具栏 */}
              <div className="bg-white border-b px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">积分管理</h3>
                    <p className="text-sm text-gray-600 mt-1">查看和管理用户积分记录</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 添加积分记录按钮 */}
                    <button
                      onClick={handleAddPointsRecord}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm border border-green-700"
                    >
                      <Plus className="w-5 h-5 stroke-2" />
                      添加记录
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="bg-white rounded-lg border">
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-gray-900">用户</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">操作</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">积分变化</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">类型</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-900">时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointsData.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3">{record.username}</td>
                            <td className="py-2 px-3">{record.action}</td>
                            <td className="py-2 px-3">
                              <span className={`font-medium ${
                                record.type === 'earn' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {record.type === 'earn' ? '+' : ''}{record.points}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {record.type === 'earn' ? '获得' : '消费'}
                              </span>
                            </td>
                            <td className="py-2 px-3">{record.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
              
              {/* 工作流配置分隔线 */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">工作流配置</h3>
                
                {/* 启用工作流开关 */}
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    启用工作流
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingCard(prev => ({ ...prev, workflowEnabled: !prev.workflowEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      editingCard.workflowEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editingCard.workflowEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* 工作流ID */}
                {editingCard.workflowEnabled && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工作流ID
                    </label>
                    <input
                      type="text"
                      value={editingCard.workflowId || ''}
                      onChange={(e) => setEditingCard(prev => ({ ...prev, workflowId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入工作流ID"
                    />
                  </div>
                )}
                
                {/* 工作流参数 */}
                {editingCard.workflowEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工作流参数（JSON格式）
                    </label>
                    <textarea
                      value={editingCard.workflowParams ? JSON.stringify(editingCard.workflowParams, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const params = e.target.value ? JSON.parse(e.target.value) : null;
                          setEditingCard(prev => ({ ...prev, workflowParams: params }));
                        } catch (error) {
                          // 保持原值，等用户输入完整的JSON
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      请输入有效的JSON格式参数，例如：{'{"timeout": 30, "retries": 3}'}
                    </p>
                  </div>
                )}
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
      
      {/* 用户编辑对话框 */}
      {showUserDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingUser.id ? '编辑用户' : '添加用户'}
                </h2>
                <button
                  onClick={() => setShowUserDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入用户名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入邮箱"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">禁用</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    积分
                  </label>
                  <input
                    type="number"
                    value={editingUser.points || 0}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入积分"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 积分记录编辑对话框 */}
        {showPointsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">添加积分记录</h2>
                <button
                  onClick={() => setShowPointsDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户
                  </label>
                  <select
                    value={editingPoints.userId || ''}
                    onChange={(e) => setEditingPoints(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择用户</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    操作描述
                  </label>
                  <input
                    type="text"
                    value={editingPoints.action || ''}
                    onChange={(e) => setEditingPoints(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入操作描述"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    积分数量
                  </label>
                  <input
                    type="number"
                    value={editingPoints.points || 0}
                    onChange={(e) => setEditingPoints(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入积分数量"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={editingPoints.type || 'earn'}
                    onChange={(e) => setEditingPoints(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="earn">获得</option>
                    <option value="spend">消费</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPointsDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSavePointsRecord}
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
        
        {/* 消息提示 */}
        {message && (
          <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.text}
          </div>
        )}
    </ProtectedRoute>
  );
}

export default AdminPage;