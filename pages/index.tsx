import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import SearchBar from '../src/components/SearchBar';
import HeroBanner from '../src/components/HeroBanner';
import FeatureGrid from '../src/components/FeatureGrid';
import BottomNavigation from '../src/components/BottomNavigation';
import ProfilePage from '../src/components/ProfilePage';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { FeatureCardData } from '../src/types';
import { useAuth } from '../src/hooks/useAuth';
import { toast } from 'sonner';
import { cardStorage } from '../src/utils/cardStorage';
import { getIconByName } from '../src/utils/iconMapping';

/**
 * Ai企业获客盈利系统主页面
 * 1:1还原设计稿的UI界面
 */
export default function Home() {
  const router = useRouter();
  const [cards, setCards] = useState<FeatureCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();

  // 从API或localStorage加载卡片数据
  const loadCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 开始加载卡片数据');
      console.log('🔍 Token存在:', !!token);
      console.log('🔍 Token内容:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('🔍 用户登录状态:', !!user);
      console.log('🔍 用户信息:', user);
      
      // 如果有token，尝试从API获取数据
      if (token) {
        try {
          console.log('📡 尝试从API获取卡片数据...');
          const response = await fetch('/api/cards', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📡 API响应状态:', response.status);
          if (response.ok) {
            const result = await response.json();
            console.log('📡 API响应数据:', result);
            
            if (result.success && result.data) {
              // 转换API数据格式为组件需要的格式
              const formattedCards = result.data.map((card: any) => ({
                id: card.id,
                name: card.name,
                desc: card.desc,
                icon: getIconByName(card.iconName),
                bgColor: card.bgColor
              }));
              console.log('✅ API数据转换完成，卡片数量:', formattedCards.length);
              setCards(formattedCards);
              return; // 成功获取API数据，直接返回
            }
          } else {
            console.log('❌ API请求失败:', response.status);
          }
        } catch (apiError) {
          // API获取失败，静默回退到localStorage
          console.log('❌ API获取失败，使用本地数据:', apiError);
        }
      } else {
        console.log('⚠️ 没有token，使用本地数据');
      }
      
      // 如果没有token或API失败，使用localStorage数据
      console.log('💾 从localStorage获取卡片数据...');
      const savedCards = cardStorage.getCards();
      console.log('💾 localStorage卡片数量:', savedCards.length);
      setCards(savedCards);
    } catch (error) {
      // 静默处理加载错误，使用默认数据
      console.log('❌ 加载卡片数据出错:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

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
   * 刷新卡片数据
   */
  const refreshCards = () => {
    loadCards();
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
          <p className="text-gray-600">加载中...</p>
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