import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Play,
  Eye,
  MoreVertical
} from 'lucide-react';
import { historyStorage, HistoryItem, HistoryQueryOptions, HistoryStats } from '../../utils/historyStorage';

/**
 * 历史记录面板属性接口
 */
interface HistoryPanelProps {
  cardId?: string;
  onRerun?: (inputs: Record<string, any>) => void;
  onViewResult?: (result: any) => void;
  className?: string;
}

/**
 * 历史记录面板组件
 * 提供历史记录的查看、管理和操作功能
 */
const HistoryPanel: React.FC<HistoryPanelProps> = ({
  cardId,
  onRerun,
  onViewResult,
  className = ''
}) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'executionTime'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  /**
   * 加载历史记录
   */
  const loadHistory = () => {
    setLoading(true);
    
    try {
      const queryOptions: HistoryQueryOptions = {
        cardId,
        sortBy,
        sortOrder,
        status: statusFilter === 'all' ? undefined : statusFilter as any
      };
      
      let allItems = historyStorage.queryItems(queryOptions);
      
      // 搜索过滤
      if (searchTerm) {
        allItems = allItems.filter(item => 
          item.cardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(item.inputs).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setItems(allItems);
      setStats(historyStorage.getStats(cardId));
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除选中的历史记录
   */
  const deleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`确定要删除 ${selectedItems.size} 条历史记录吗？`)) {
      const deletedCount = historyStorage.deleteItems(Array.from(selectedItems));
      setSelectedItems(new Set());
      loadHistory();
      console.log(`已删除 ${deletedCount} 条记录`);
    }
  };

  /**
   * 清空所有历史记录
   */
  const clearAll = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      historyStorage.clearAll();
      loadHistory();
    }
  };

  /**
   * 导出历史记录
   */
  const exportHistory = () => {
    const data = historyStorage.exportHistory(cardId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-history-${cardId || 'all'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 导入历史记录
   */
  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (historyStorage.importHistory(data, true)) {
        loadHistory();
        console.log('历史记录导入成功');
      } else {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return new Date(timestamp).toLocaleDateString('zh-CN');
    }
  };

  /**
   * 获取状态样式
   */
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Running':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', text: '执行中' };
      case 'Completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: '成功' };
      case 'Failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: '失败' };
      case 'Cancelled':
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', text: '取消' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: '未知' };
    }
  };

  /**
   * 切换项目展开状态
   */
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  /**
   * 切换项目选中状态
   */
  const toggleSelected = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  // 组件挂载时加载数据
  useEffect(() => {
    loadHistory();
  }, [cardId, sortBy, sortOrder, statusFilter]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">执行历史</h3>
            {stats && (
              <span className="text-sm text-gray-500">
                共 {stats.total} 条记录
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="筛选"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={loadHistory}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importHistory}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="导入历史记录"
              />
              <Upload className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" />
            </div>
            
            <button
              onClick={exportHistory}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="导出历史记录"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">总计</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">成功</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-500">失败</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{stats.running}</div>
              <div className="text-sm text-gray-500">执行中</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">
                {stats.avgExecutionTime ? `${stats.avgExecutionTime.toFixed(1)}s` : '-'}
              </div>
              <div className="text-sm text-gray-500">平均耗时</div>
            </div>
          </div>
        )}
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">全部状态</option>
                  <option value="Completed">成功</option>
                  <option value="Failed">失败</option>
                  <option value="Running">执行中</option>
                  <option value="Cancelled">已取消</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'executionTime')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="timestamp">按时间</option>
                  <option value="executionTime">按耗时</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序顺序</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* 批量操作 */}
        {selectedItems.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              已选择 {selectedItems.size} 条记录
            </span>
            <div className="flex space-x-2">
              <button
                onClick={deleteSelected}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                删除选中
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                取消选择
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 列表内容 */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-gray-600">加载中...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="w-8 h-8 mx-auto mb-2" />
            <p>暂无历史记录</p>
            <p className="text-sm mt-1">执行工作流后，历史记录将在此处显示</p>
          </div>
        ) : (
          currentItems.map((item) => {
            const statusStyle = getStatusStyle(item.result?.status);
            const StatusIcon = statusStyle.icon;
            const isExpanded = expandedItems.has(item.id);
            const isSelected = selectedItems.has(item.id);
            
            return (
              <div key={item.id} className={`p-4 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                <div className="flex items-start space-x-3">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(item.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  {/* 状态图标 */}
                  <div className={`p-1 rounded-full ${statusStyle.bg} mt-0.5`}>
                    <StatusIcon className={`w-3 h-3 ${statusStyle.color}`} />
                  </div>
                  
                  {/* 主要内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.cardTitle}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{formatTime(item.timestamp)}</span>
                          <span className={statusStyle.color}>{statusStyle.text}</span>
                          {item.executionTime && (
                            <span>{item.executionTime.toFixed(1)}s</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center space-x-1">
                        {onRerun && (
                          <button
                            onClick={() => onRerun(item.inputs)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="重新执行"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {item.result && onViewResult && (
                          <button
                            onClick={() => onViewResult(item.result)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title="查看结果"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          title={isExpanded ? '收起' : '展开'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* 展开内容 */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {/* 输入参数 */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">输入参数</h5>
                          <div className="bg-gray-50 rounded p-3 text-sm">
                            <pre className="whitespace-pre-wrap text-gray-800">
                              {JSON.stringify(item.inputs, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        {/* 执行结果 */}
                        {item.result && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">执行结果</h5>
                            <div className="bg-gray-50 rounded p-3 text-sm">
                              <div className="space-y-2">
                                <div><strong>执行ID:</strong> {item.result.id}</div>
                                <div><strong>状态:</strong> {statusStyle.text}</div>
                                {item.result.execution_time && (
                                  <div><strong>执行时长:</strong> {item.result.execution_time.toFixed(1)}秒</div>
                                )}
                                {item.result.error && (
                                  <div className="text-red-600">
                                    <strong>错误:</strong> {item.result.error.msg}
                                  </div>
                                )}
                                {item.result.debug_url && (
                                  <div>
                                    <strong>调试链接:</strong>
                                    <a
                                      href={item.result.debug_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline ml-1"
                                    >
                                      查看详情
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {startIndex + 1}-{Math.min(endIndex, items.length)} 条，共 {items.length} 条
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
      
      {/* 底部操作 */}
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={items.length > 0 && selectedItems.size === items.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">全选</span>
        </div>
        
        <button
          onClick={clearAll}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          清空所有记录
        </button>
      </div>
    </div>
  );
};

export default HistoryPanel;