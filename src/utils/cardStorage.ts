import { FeatureCardData, CardConfig, StorableCardData } from '../types';
import {
  Mic,
  Image,
  FileText,
  Monitor,
  BarChart3,
  Hash,
  User,
  Video,
  BookOpen,
  MessageCircle,
  Volume2,
  TrendingUp,
  Newspaper,
  Target
} from 'lucide-react';

/**
 * 图标名称到组件的映射表
 */
const iconMap: Record<string, any> = {
  Mic,
  Image,
  FileText,
  Monitor,
  BarChart3,
  Hash,
  User,
  Video,
  BookOpen,
  MessageCircle,
  Volume2,
  TrendingUp,
  Newspaper,
  Target
};

/**
 * 根据图标名称获取图标组件
 * @param iconName 图标名称
 * @returns 图标组件
 */
const getIconByName = (iconName: string) => {
  return iconMap[iconName] || FileText;
};

/**
 * 本地存储键名
 */
const STORAGE_KEY = 'catait_feature_cards';
const CONFIG_VERSION = '1.0.0';

/**
 * 默认卡片数据
 * 与原始硬编码数据保持一致
 */
const defaultCards: FeatureCardData[] = [
  {
    id: '1',
    name: '行业文案创作',
    desc: 'AI智能创作',
    icon: FileText,
    iconName: 'FileText',
    bgColor: 'bg-blue-500',
    order: 0,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '短视频标题',
    desc: '爆款标题生成',
    icon: Video,
    iconName: 'Video',
    bgColor: 'bg-orange-500',
    order: 1,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '小红书笔记',
    desc: '种草文案助手',
    icon: BookOpen,
    iconName: 'BookOpen',
    bgColor: 'bg-red-500',
    order: 2,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: '朋友圈文案',
    desc: '社交媒体文案',
    icon: MessageCircle,
    iconName: 'MessageCircle',
    bgColor: 'bg-green-500',
    order: 3,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '文案配图',
    desc: 'AI图片生成',
    icon: Image,
    iconName: 'Image',
    bgColor: 'bg-pink-500',
    order: 4,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: '克隆声音',
    desc: '声音复制技术',
    icon: Mic,
    iconName: 'Mic',
    bgColor: 'bg-purple-500',
    order: 5,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: '配音',
    desc: 'AI语音合成',
    icon: Volume2,
    iconName: 'Volume2',
    bgColor: 'bg-yellow-500',
    order: 6,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: '热点监控文案',
    desc: '实时热点追踪',
    icon: TrendingUp,
    iconName: 'TrendingUp',
    bgColor: 'bg-cyan-500',
    order: 7,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: '公众号条创作',
    desc: '公众号文章',
    icon: Newspaper,
    iconName: 'Newspaper',
    bgColor: 'bg-red-500',
    order: 8,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: '数字人制作',
    desc: 'AI数字人',
    icon: User,
    iconName: 'User',
    bgColor: 'bg-orange-500',
    order: 9,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '11',
    name: '自媒体IP分析',
    desc: 'IP数据分析',
    icon: BarChart3,
    iconName: 'BarChart3',
    bgColor: 'bg-green-500',
    order: 10,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '12',
    name: '关键词提炼',
    desc: '智能关键词',
    icon: Target,
    iconName: 'Target',
    bgColor: 'bg-yellow-500',
    order: 11,
    enabled: true,
    createdAt: new Date().toISOString()
  }
];

/**
 * 卡片存储管理类
 * 负责卡片数据的本地存储和读取
 */
class CardStorage {
  /**
   * 获取所有卡片数据
   * @returns 卡片数组，按order排序
   */
  getCards(): FeatureCardData[] {
    try {
      if (typeof window === 'undefined') {
        // 服务端渲染时返回默认数据
        return defaultCards;
      }
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // 首次使用，保存默认数据
        this.saveCards(defaultCards);
        return defaultCards;
      }
      
      const config: CardConfig = JSON.parse(stored);
      
      // 验证数据格式
      if (!config.cards || !Array.isArray(config.cards)) {
        console.warn('Invalid card config format, using defaults');
        this.saveCards(defaultCards);
        return defaultCards;
      }
      
      // 恢复图标组件引用
      const cards = config.cards.map(card => ({
        ...card,
        icon: getIconByName(card.iconName)
      }));
      
      // 按order排序
      return cards.sort((a, b) => a.order - b.order);
    } catch (error) {
      // 静默处理localStorage读取错误，使用默认数据
      console.log('Using default cards due to storage error');
      return defaultCards;
    }
  }
  
  /**
   * 保存卡片数据到本地存储
   * @param cards 要保存的卡片数组
   */
  saveCards(cards: FeatureCardData[]): void {
    try {
      if (typeof window === 'undefined') {
        // 服务端渲染时不执行保存
        return;
      }
      
      // 准备存储数据（移除icon组件引用，转换为StorableCardData格式）
      const cardsToStore: StorableCardData[] = cards.map(card => {
        const { icon, ...cardData } = card;
        return cardData;
      });
      
      const config: CardConfig = {
        cards: cardsToStore,
        version: CONFIG_VERSION,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      console.log('Cards saved to storage successfully');
    } catch (error) {
      console.error('Error saving cards to storage:', error);
      throw new Error('保存卡片配置失败');
    }
  }
  
  /**
   * 添加新卡片
   * @param card 新卡片数据
   */
  addCard(card: Omit<FeatureCardData, 'id' | 'createdAt'>): FeatureCardData {
    const newCard: FeatureCardData = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const cards = this.getCards();
    cards.push(newCard);
    this.saveCards(cards);
    
    return newCard;
  }
  
  /**
   * 更新卡片
   * @param cardId 卡片ID
   * @param updates 更新数据
   */
  updateCard(cardId: string, updates: Partial<FeatureCardData>): boolean {
    const cards = this.getCards();
    const index = cards.findIndex(card => card.id === cardId);
    
    if (index === -1) {
      return false;
    }
    
    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveCards(cards);
    return true;
  }
  
  /**
   * 删除卡片
   * @param cardId 卡片ID
   */
  deleteCard(cardId: string): boolean {
    const cards = this.getCards();
    const filteredCards = cards.filter(card => card.id !== cardId);
    
    if (filteredCards.length === cards.length) {
      return false; // 没有找到要删除的卡片
    }
    
    this.saveCards(filteredCards);
    return true;
  }
  
  /**
   * 重新排序卡片
   * @param cardIds 按新顺序排列的卡片ID数组
   */
  reorderCards(cardIds: string[]): void {
    const cards = this.getCards();
    const reorderedCards = cardIds.map((id, index) => {
      const card = cards.find(c => c.id === id);
      if (card) {
        return { ...card, order: index };
      }
      return null;
    }).filter(Boolean) as FeatureCardData[];
    
    this.saveCards(reorderedCards);
  }
  
  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.saveCards(defaultCards);
  }
  
  /**
   * 清空所有数据
   */
  clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  
  /**
   * 导出配置
   * @returns 配置JSON字符串
   */
  exportConfig(): string {
    const cards = this.getCards();
    const config: CardConfig = {
      cards: cards.map(card => {
        const { icon, ...cardData } = card;
        return cardData;
      }),
      version: CONFIG_VERSION,
      lastUpdated: new Date().toISOString()
    };
    
    return JSON.stringify(config, null, 2);
  }
  
  /**
   * 导入配置
   * @param configJson 配置JSON字符串
   */
  importConfig(configJson: string): boolean {
    try {
      const config: CardConfig = JSON.parse(configJson);
      
      if (!config.cards || !Array.isArray(config.cards)) {
        throw new Error('Invalid config format');
      }
      
      // 验证每个卡片的必要字段
      const validCards = config.cards.filter(card => 
        card.id && card.name && card.desc && card.iconName
      );
      
      if (validCards.length === 0) {
        throw new Error('No valid cards found in config');
      }
      
      // 恢复图标组件引用
      const cardsWithIcons = validCards.map(card => ({
        ...card,
        icon: getIconByName(card.iconName),
        updatedAt: new Date().toISOString()
      }));
      
      this.saveCards(cardsWithIcons);
      return true;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }
}

// 导出单例实例
export const cardStorage = new CardStorage();
export default cardStorage;