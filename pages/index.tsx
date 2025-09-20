import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import SearchBar from '../src/components/SearchBar';
import HeroBanner from '../src/components/HeroBanner';
import FeatureGrid from '../src/components/FeatureGrid';
import BottomNavigation from '../src/components/BottomNavigation';
import ProfilePage from '../src/components/ProfilePage';
import ProtectedRoute from '../src/components/ProtectedRoute';
import SensitiveOperationGuard from '../src/components/SensitiveOperationGuard';
import { FeatureCardData } from '../src/types';
import { useOptimizedAuth } from '../src/hooks/useOptimizedAuth';
import { useCards } from '../src/hooks/useCards';
import { SensitiveOperation } from '../src/utils/authUtils';
import { toast } from 'sonner';
import { cardStorage } from '../src/utils/cardStorage';
import { getIconByName } from '../src/utils/iconMapping';
import { FaSync } from 'react-icons/fa';

/**
 * Ai企业获客盈利系统主页面
 * 1:1还原设计稿的UI界面
 */
export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  
  // 使用优化的身份验证钩子
  const { user, logout, isAuthenticated, loading: authLoading } = useOptimizedAuth();
  
  // 使用优化的卡片管理钩子
  const { 
    cards, 
    loading: cardsLoading, 
    error: cardsError,
    refreshCards,
    isSyncing
  } = useOptimizedCards(user?.id);

  // 合并加载状态
  const loading = authLoading || cardsLoading;

  /**
   * 处理后台管理按钮点击
   * 跳转到后台管理页面
   */
  const handleAdminClick = () => {
    router.push('/admin');
  };

  /**
   * 处理底部导航栏标签切换
   * @param tabId - 标签页ID
   */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  /**
   * 处理刷新按钮点击
   */
  const handleRefresh = () => {
    refreshCards();
    toast.success('数据已刷新');
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('已退出登录');
      router.push('/login');
    } catch (error) {
      toast.error('退出登录失败');
    }
  };

  /**
   * 处理卡片点击事件
   * 跳转到对应的工作流页面
   * @param card - 被点击的卡片数据
   * @param index - 卡片索引
   */
  const handleCardClick = (card: FeatureCardData, index: number) => {
    console.log('🎯 卡片被点击:', card);
    
    // 如果卡片有ID，跳转到工作流页面
    if (card.id) {
      console.log('🚀 跳转到工作流页面:', `/workflow/${card.id}`);
      router.push(`/workflow/${card.id}`);
    } else {
      console.warn('⚠️ 卡片没有ID，无法跳转');
      toast.error('该卡片暂未配置工作流');
    }
  };

  // 监听页面焦点，当从后台管理页面返回时刷新数据
  /*
  useEffect(() => {
    const handleFocus = () => {
      refreshCards();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? '验证身份中...' : '加载数据中...'}
          </p>
          {isSyncing && (
            <p className="text-sm text-blue-500 mt-2">
              <FaSync className="inline animate-spin mr-1" />
              后台同步中...
            </p>
          )}
        </div>
      </div>
    );
  }

  // 显示错误信息
  if (cardsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{cardsError}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  /**
   * 渲染当前激活的页面内容
   */
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <SearchBar />
            <HeroBanner />
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">功能卡片</h2>
                <div className="flex items-center space-x-2">
                  {isSyncing && (
                    <span className="text-sm text-blue-500 flex items-center">
                      <FaSync className="animate-spin mr-1" />
                      同步中
                    </span>
                  )}
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    title="刷新数据"
                  >
                    <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* 敏感操作：管理功能 */}
                  <SensitiveOperationGuard 
                    operation={SensitiveOperation.MANAGE_CARDS}
                    fallback={
                      <div className="text-sm text-gray-500">管理功能需要特殊权限</div>
                    }
                  >
                    <button
                      onClick={() => {
                        // 这里可以添加管理功能
                        toast.info('管理功能开发中...');
                      }}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      管理
                    </button>
                  </SensitiveOperationGuard>
                </div>
              </div>
            </div>
            <FeatureGrid cards={cards} onCardClick={handleCardClick} />
          </>
        );
      case 'discover':
        return (
          <div className="px-4">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">发现</h1>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">发现页面正在开发中...</p>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <>
            <SearchBar />
            <HeroBanner />
            <FeatureGrid cards={cards} />
          </>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header 
            title="Ai企业获客盈利系统" 
            onAdminClick={handleAdminClick}
          />
        </div>
        
        <div className="flex-1 pt-16 pb-20 overflow-y-auto">
          <div className="h-full">
            {renderActiveContent()}
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}