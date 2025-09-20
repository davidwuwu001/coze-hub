import { useState, useEffect, useCallback, useRef } from 'react';
import { FeatureCardData } from '../types';
import { cardCacheManager } from '../utils/cacheManager';
import { cardStorage } from '../utils/cardStorage';
import { getIconByName } from '../utils/iconMapping';

/**
 * 优化的卡片数据管理Hook
 * 实现智能缓存、后台同步和快速响应
 */
export const useOptimizedCards = (userId?: string) => {
  const [cards, setCards] = useState<FeatureCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 使用ref来跟踪同步状态
  const isSyncing = useRef(false);
  const lastSyncTime = useRef(0);
  const SYNC_COOLDOWN = 60 * 1000; // 1分钟内不重复同步

  /**
   * 从缓存加载卡片数据
   */
  const loadFromCache = useCallback((): FeatureCardData[] | null => {
    const cached = cardCacheManager.getCachedCards(userId);
    if (cached && cached.length > 0) {
      console.log('✅ 从缓存加载卡片数据，数量:', cached.length);
      return cached;
    }
    return null;
  }, [userId]);

  /**
   * 从localStorage加载卡片数据
   */
  const loadFromStorage = useCallback((): FeatureCardData[] => {
    const stored = cardStorage.getCards();
    console.log('💾 从localStorage加载卡片数据，数量:', stored.length);
    return stored;
  }, []);

  /**
   * 从API加载卡片数据
   */
  const loadFromAPI = useCallback(async (silent: boolean = false): Promise<FeatureCardData[] | null> => {
    try {
      if (!silent) {
        console.log('📡 开始从API加载卡片数据...');
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        if (!silent) {
          console.log('⚠️ 没有token，跳过API请求');
        }
        return null;
      }

      const response = await fetch('/api/cards', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // 转换API数据格式
          const formattedCards = result.data.map((card: any) => ({
            id: card.id,
            name: card.name,
            desc: card.desc,
            icon: getIconByName(card.iconName),
            iconName: card.iconName,
            bgColor: card.bgColor,
            order: card.order || 0,
            enabled: card.enabled !== false,
            createdAt: card.createdAt || new Date().toISOString()
          }));
          
          if (!silent) {
            console.log('✅ API数据加载成功，数量:', formattedCards.length);
          }
          
          return formattedCards;
        }
      } else {
        if (!silent) {
          console.log('❌ API请求失败:', response.status);
        }
      }
    } catch (apiError) {
      if (!silent) {
        console.log('❌ API请求异常:', apiError);
      }
    }
    
    return null;
  }, []);

  /**
   * 后台同步数据
   */
  const syncInBackground = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime.current;
    
    // 检查是否需要同步
    if (isSyncing.current || timeSinceLastSync < SYNC_COOLDOWN) {
      return;
    }
    
    isSyncing.current = true;
    lastSyncTime.current = now;
    
    try {
      const apiCards = await loadFromAPI(true); // 静默加载
      if (apiCards && apiCards.length > 0) {
        // 检查数据是否有变化
        const currentCards = cards.length > 0 ? cards : loadFromCache() || loadFromStorage();
        const hasChanges = JSON.stringify(apiCards) !== JSON.stringify(currentCards);
        
        if (hasChanges) {
          console.log('🔄 检测到数据变化，更新缓存和状态');
          
          // 更新缓存
          cardCacheManager.cacheCards(apiCards, userId);
          
          // 更新状态
          setCards(apiCards);
          
          // 可选：显示更新提示
          // toast.info('数据已更新');
        }
      }
    } catch (error) {
      console.warn('后台同步失败:', error);
    } finally {
      isSyncing.current = false;
    }
  }, [cards, userId, loadFromAPI, loadFromCache, loadFromStorage]);

  /**
   * 加载卡片数据（优化版）
   */
  const loadCards = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // 如果不是强制刷新，优先使用缓存
      if (!forceRefresh) {
        const cachedCards = loadFromCache();
        if (cachedCards) {
          setCards(cachedCards);
          setLoading(false);
          setIsInitialized(true);
          
          // 启动后台同步
          setTimeout(() => syncInBackground(), 100);
          return;
        }
      }
      
      // 尝试从API加载
      const apiCards = await loadFromAPI();
      if (apiCards && apiCards.length > 0) {
        setCards(apiCards);
        
        // 缓存API数据
        cardCacheManager.cacheCards(apiCards, userId);
        
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // API失败，使用localStorage数据
      const storedCards = loadFromStorage();
      setCards(storedCards);
      
      // 如果localStorage有数据，也缓存起来
      if (storedCards.length > 0) {
        cardCacheManager.cacheCards(storedCards, userId);
      }
      
    } catch (error) {
      console.error('加载卡片数据失败:', error);
      setError('加载数据失败');
      
      // 出错时使用localStorage数据
      const storedCards = loadFromStorage();
      setCards(storedCards);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [userId, loadFromCache, loadFromAPI, loadFromStorage, syncInBackground]);

  /**
   * 刷新卡片数据
   */
  const refreshCards = useCallback(() => {
    return loadCards(true);
  }, [loadCards]);

  /**
   * 添加卡片
   */
  const addCard = useCallback((cardData: Omit<FeatureCardData, 'id' | 'createdAt'>) => {
    const newCard = cardStorage.addCard(cardData);
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    
    // 更新缓存
    cardCacheManager.cacheCards(updatedCards, userId);
    
    return newCard;
  }, [cards, userId]);

  /**
   * 更新卡片
   */
  const updateCard = useCallback((cardId: string, updates: Partial<FeatureCardData>) => {
    const success = cardStorage.updateCard(cardId, updates);
    if (success) {
      const updatedCards = cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      );
      setCards(updatedCards);
      
      // 更新缓存
      cardCacheManager.cacheCards(updatedCards, userId);
    }
    return success;
  }, [cards, userId]);

  /**
   * 删除卡片
   */
  const deleteCard = useCallback((cardId: string) => {
    const success = cardStorage.deleteCard(cardId);
    if (success) {
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      
      // 更新缓存
      cardCacheManager.cacheCards(updatedCards, userId);
    }
    return success;
  }, [cards, userId]);

  /**
   * 重新排序卡片
   */
  const reorderCards = useCallback((cardIds: string[]) => {
    cardStorage.reorderCards(cardIds);
    const reorderedCards = cardIds.map(id => cards.find(card => card.id === id)).filter(Boolean) as FeatureCardData[];
    setCards(reorderedCards);
    
    // 更新缓存
    cardCacheManager.cacheCards(reorderedCards, userId);
  }, [cards, userId]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    cardCacheManager.clearCardsCache(userId);
    console.log('🗑️ 已清除卡片缓存');
  }, [userId]);

  // 初始化加载
  useEffect(() => {
    if (!isInitialized) {
      loadCards();
    }
  }, [loadCards, isInitialized]);

  // 定期后台同步（可选）
  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(() => {
      syncInBackground();
    }, 5 * 60 * 1000); // 每5分钟同步一次
    
    return () => clearInterval(interval);
  }, [syncInBackground, isInitialized]);

  // 监听页面可见性变化，页面重新可见时同步数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        syncInBackground();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncInBackground, isInitialized]);

  return {
    cards,
    loading,
    error,
    isInitialized,
    loadCards,
    refreshCards,
    addCard,
    updateCard,
    deleteCard,
    reorderCards,
    clearCache,
    isSyncing: isSyncing.current
  };
};

export default useOptimizedCards;