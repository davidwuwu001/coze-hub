import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import SearchBar from '../src/components/SearchBar';
import HeroBanner from '../src/components/HeroBanner';
import FeatureGrid from '../src/components/FeatureGrid';
import BottomNavigation from '../src/components/BottomNavigation';
import { cardStorage } from '../src/utils/cardStorage';
import { FeatureCardData } from '../src/types';

/**
 * CATAIT智媒体运营工具主页面
 * 1:1还原设计稿的UI界面
 */
export default function Home() {
  const router = useRouter();
  const [featureCards, setFeatureCards] = useState<FeatureCardData[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 加载卡片数据
   * 从localStorage读取配置
   */
  useEffect(() => {
    try {
      const cards = cardStorage.getCards();
      // 只显示启用的卡片
      const enabledCards = cards.filter(card => card.enabled);
      setFeatureCards(enabledCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      // 如果加载失败，使用空数组
      setFeatureCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 处理后台管理按钮点击
   * 跳转到后台管理页面
   */
  const handleAdminClick = () => {
    router.push('/admin');
  };

  /**
   * 刷新卡片数据
   * 用于从后台管理页面返回时更新数据
   */
  const refreshCards = () => {
    try {
      const cards = cardStorage.getCards();
      const enabledCards = cards.filter(card => card.enabled);
      setFeatureCards(enabledCards);
    } catch (error) {
      console.error('Error refreshing cards:', error);
    }
  };

  // 监听页面焦点，当从后台管理页面返回时刷新数据
  useEffect(() => {
    const handleFocus = () => {
      refreshCards();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAdminClick={handleAdminClick} />
      <SearchBar />
      <HeroBanner />
      <FeatureGrid cards={featureCards} />
      <BottomNavigation />
    </div>
  );
}