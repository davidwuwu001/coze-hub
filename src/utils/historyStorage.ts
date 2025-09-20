/**
 * 工作流历史记录存储工具类
 * 使用LocalStorage进行本地存储
 */

/**
 * 历史记录项接口
 */
export interface HistoryItem {
  id: string;
  cardId: string;
  cardTitle: string;
  inputs: Record<string, any>;
  result?: {
    id: string;
    status: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
    output?: any;
    error?: {
      code: number;
      msg: string;
    };
    debug_url?: string;
    created_at: number;
    updated_at: number;
    execution_time?: number;
  };
  timestamp: number;
  executionTime?: number;
}

/**
 * 历史记录查询选项
 */
export interface HistoryQueryOptions {
  cardId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'executionTime';
  sortOrder?: 'asc' | 'desc';
  status?: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
}

/**
 * 历史记录统计信息
 */
export interface HistoryStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  cancelled: number;
  avgExecutionTime?: number;
}

class HistoryStorage {
  private readonly STORAGE_KEY = 'workflow_history';
  private readonly MAX_ITEMS = 1000; // 最大存储条目数

  /**
   * 获取所有历史记录
   */
  private getAllItems(): HistoryItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const items = JSON.parse(data) as HistoryItem[];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('读取历史记录失败:', error);
      return [];
    }
  }

  /**
   * 保存所有历史记录
   */
  private saveAllItems(items: HistoryItem[]): void {
    try {
      // 限制存储数量，保留最新的记录
      const limitedItems = items
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_ITEMS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedItems));
    } catch (error) {
      console.error('保存历史记录失败:', error);
      // 如果存储空间不足，尝试清理旧记录
      this.cleanup();
    }
  }

  /**
   * 添加新的历史记录
   */
  addItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): string {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const items = this.getAllItems();
    items.unshift(newItem); // 添加到开头
    this.saveAllItems(items);
    
    return newItem.id;
  }

  /**
   * 更新历史记录项
   */
  updateItem(id: string, updates: Partial<HistoryItem>): boolean {
    const items = this.getAllItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items[index] = { ...items[index], ...updates };
    this.saveAllItems(items);
    
    return true;
  }

  /**
   * 获取单个历史记录
   */
  getItem(id: string): HistoryItem | null {
    const items = this.getAllItems();
    return items.find(item => item.id === id) || null;
  }

  /**
   * 查询历史记录
   */
  queryItems(options: HistoryQueryOptions = {}): HistoryItem[] {
    let items = this.getAllItems();
    
    // 按卡片ID过滤
    if (options.cardId) {
      items = items.filter(item => item.cardId === options.cardId);
    }
    
    // 按状态过滤
    if (options.status) {
      items = items.filter(item => item.result?.status === options.status);
    }
    
    // 排序
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';
    
    items.sort((a, b) => {
      let aValue: number, bValue: number;
      
      if (sortBy === 'timestamp') {
        aValue = a.timestamp;
        bValue = b.timestamp;
      } else if (sortBy === 'executionTime') {
        aValue = a.executionTime || 0;
        bValue = b.executionTime || 0;
      } else {
        return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    // 分页
    const offset = options.offset || 0;
    const limit = options.limit;
    
    if (limit) {
      return items.slice(offset, offset + limit);
    }
    
    return items.slice(offset);
  }

  /**
   * 删除历史记录项
   */
  deleteItem(id: string): boolean {
    const items = this.getAllItems();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // 没有找到要删除的项
    }
    
    this.saveAllItems(filteredItems);
    return true;
  }

  /**
   * 批量删除历史记录
   */
  deleteItems(ids: string[]): number {
    const items = this.getAllItems();
    const idsSet = new Set(ids);
    const filteredItems = items.filter(item => !idsSet.has(item.id));
    
    const deletedCount = items.length - filteredItems.length;
    this.saveAllItems(filteredItems);
    
    return deletedCount;
  }

  /**
   * 清空所有历史记录
   */
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 清理旧记录（保留最新的500条）
   */
  cleanup(): void {
    const items = this.getAllItems();
    const cleanedItems = items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 500);
    
    this.saveAllItems(cleanedItems);
  }

  /**
   * 获取历史记录统计信息
   */
  getStats(cardId?: string): HistoryStats {
    const items = cardId 
      ? this.getAllItems().filter(item => item.cardId === cardId)
      : this.getAllItems();
    
    const stats: HistoryStats = {
      total: items.length,
      completed: 0,
      failed: 0,
      running: 0,
      cancelled: 0
    };
    
    let totalExecutionTime = 0;
    let executionTimeCount = 0;
    
    items.forEach(item => {
      if (item.result?.status) {
        switch (item.result.status) {
          case 'Completed':
            stats.completed++;
            break;
          case 'Failed':
            stats.failed++;
            break;
          case 'Running':
            stats.running++;
            break;
          case 'Cancelled':
            stats.cancelled++;
            break;
        }
      }
      
      if (item.executionTime) {
        totalExecutionTime += item.executionTime;
        executionTimeCount++;
      }
    });
    
    if (executionTimeCount > 0) {
      stats.avgExecutionTime = totalExecutionTime / executionTimeCount;
    }
    
    return stats;
  }

  /**
   * 导出历史记录
   */
  exportHistory(cardId?: string): string {
    const items = cardId 
      ? this.getAllItems().filter(item => item.cardId === cardId)
      : this.getAllItems();
    
    return JSON.stringify(items, null, 2);
  }

  /**
   * 导入历史记录
   */
  importHistory(data: string, merge: boolean = true): boolean {
    try {
      const importedItems = JSON.parse(data) as HistoryItem[];
      
      if (!Array.isArray(importedItems)) {
        throw new Error('导入数据格式错误');
      }
      
      // 验证数据结构
      const validItems = importedItems.filter(item => 
        item.id && item.cardId && item.timestamp
      );
      
      if (merge) {
        const existingItems = this.getAllItems();
        const existingIds = new Set(existingItems.map(item => item.id));
        
        // 只添加不存在的项
        const newItems = validItems.filter(item => !existingIds.has(item.id));
        const mergedItems = [...existingItems, ...newItems];
        
        this.saveAllItems(mergedItems);
      } else {
        this.saveAllItems(validItems);
      }
      
      return true;
    } catch (error) {
      console.error('导入历史记录失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      
      // 估算可用空间（大多数浏览器限制为5-10MB）
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// 创建单例实例
export const historyStorage = new HistoryStorage();

// 导出类型和实例
export default historyStorage;