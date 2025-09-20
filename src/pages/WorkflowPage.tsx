import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Clock, CheckCircle, XCircle, History as HistoryIcon } from 'lucide-react';
import DynamicForm from '../components/DynamicForm';
import ResultDisplay from '../components/ResultDisplay';
import HistoryPanel from '../components/HistoryPanel';
import { executeWorkflow } from '../utils/cozeApi';
import { historyStorage, HistoryItem } from '../utils/historyStorage';

// 类型定义
interface CardConfig {
  id: string;
  title: string;
  description: string;
  workflow_id: string;
  input_config: {
    fields: Array<{
      name: string;
      type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'file';
      label: string;
      required: boolean;
      placeholder?: string;
      options?: string[];
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
      };
    }>;
  };
}

interface WorkflowResult {
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
}

const WorkflowPage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<CardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  /**
   * 加载卡片配置
   */
  useEffect(() => {
    const loadCardConfig = async () => {
      if (!cardId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/cards/${cardId}/config`);
        
        if (!response.ok) {
          throw new Error('卡片配置加载失败');
        }
        
        const data = await response.json();
        setConfig(data);
        
        // 初始化表单数据
        const initialData: Record<string, any> = {};
        data.input_config?.fields?.forEach((field: any) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadCardConfig();
  }, [cardId]);

  /**
   * 处理输入值变化
   */
  const handleInputChange = (inputId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [inputId]: value
    }));
  };

  /**
   * 执行工作流
   */
  const handleExecuteWorkflow = async (inputs: Record<string, any>) => {
    if (!config || !cardId) return;
    
    try {
      setExecuting(true);
      setError(null);
      setResult(null);
      
      // 保存到历史记录（开始执行时）
      const historyId = historyStorage.addItem({
        cardId,
        cardTitle: config.title,
        inputs: { ...inputs }
      });
      
      setCurrentHistoryId(historyId);
      
      // 执行工作流
      const startTime = Date.now();
      const workflowResult = await executeWorkflow(config.workflow_id, inputs);
      const executionTime = (Date.now() - startTime) / 1000;
      
      // 更新结果
      setResult(workflowResult);
      
      // 更新历史记录（执行完成时）
      historyStorage.updateItem(historyId, {
        result: workflowResult,
        executionTime
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '执行失败';
      setError(errorMessage);
      
      // 更新历史记录（执行失败时）
      if (currentHistoryId) {
        const failedResult: WorkflowResult = {
          id: 'failed-' + Date.now(),
          status: 'Failed',
          error: {
            code: -1,
            msg: errorMessage
          },
          created_at: Date.now() / 1000,
          updated_at: Date.now() / 1000
        };
        
        historyStorage.updateItem(currentHistoryId, {
          result: failedResult
        });
      }
    } finally {
      setExecuting(false);
    }
  };

  /**
   * 清空输入
   */
  const handleClearInputs = () => {
    setFormData({});
    setResult(null);
    setError(null);
    setCurrentHistoryId(null);
  };

  /**
   * 从历史记录加载
   */
  const handleLoadFromHistory = (item: HistoryItem) => {
    setFormData(item.inputs);
    setResult(item.result || null);
    setError(null);
    setCurrentHistoryId(item.id);
    setShowHistory(false);
  };

  /**
   * 删除历史记录
   */
  const handleDeleteHistory = (id: string) => {
    historyStorage.deleteItem(id);
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
  };

  /**
   * 清空所有历史记录
   */
  const handleClearHistory = () => {
    historyStorage.clearAll();
    setCurrentHistoryId(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">{config?.title}</h1>
                <p className="text-sm text-gray-600">{config?.description}</p>
              </div>
            </div>
            <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HistoryIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">输入参数</h2>
              <DynamicForm
                fields={config?.input_config?.fields || []}
                values={formData}
                onChange={setFormData}
              />
              
              {/* 操作按钮 */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleExecuteWorkflow(formData)}
                  disabled={executing}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {executing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      执行中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      执行工作流
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearInputs}
                  disabled={executing}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 结果区域 */}
          <div className="space-y-6">
            {result && (
              <ResultDisplay
                result={result}
                onClear={handleClearInputs}
              />
            )}
            
            {executing && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="text-center">
                  <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">正在执行工作流</h3>
                  <p className="text-gray-600">请稍候，AI正在处理您的请求...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600">执行失败</h3>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-red-700">
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 历史记录面板 */}
      {showHistory && (
        <HistoryPanel
          cardId={cardId || ''}
          onClose={() => setShowHistory(false)}
          onLoad={handleLoadFromHistory}
          onDelete={handleDeleteHistory}
          onClear={handleClearHistory}
          currentHistoryId={currentHistoryId}
        />
      )}
    </div>
  );
};

export default WorkflowPage;