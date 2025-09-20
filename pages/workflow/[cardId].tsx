import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getIconByName } from '@/utils/iconMapping';
import { convertUrlsToLinks, containsUrl } from '@/utils/urlUtils';

/**
 * 卡片工作流执行页面
 * 根据卡片ID动态加载对应的工作流配置和执行界面
 */

interface CardInfo {
  id: number;
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
  workflowId: string;
  apiToken: string;
}

interface WorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
}

const WorkflowPage: React.FC = () => {
  const router = useRouter();
  const { cardId } = router.query;
  
  // 状态管理
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [executionError, setExecutionError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  /**
   * 获取卡片信息
   */
  useEffect(() => {
    if (!cardId || typeof cardId !== 'string') return;
    
    const fetchCardInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/cards/${cardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '获取卡片信息失败');
        }
        
        setCardInfo(data.data);
        
        // 根据卡片类型设置默认输入值
        setDefaultInputValue(data.data.title);
        
      } catch (err: any) {
        setError(err.message || '获取卡片信息失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCardInfo();
  }, [cardId]);

  /**
   * 根据卡片类型设置默认输入值
   */
  const setDefaultInputValue = (cardTitle: string) => {
    if (cardTitle.includes('抖音') || cardTitle.includes('视频')) {
      setInputValue('https://v.douyin.com/ipT9jS1Z7nc/');
    } else {
      // 对于文案创作和其他类型，不设置默认值，让placeholder正常显示
      setInputValue('');
    }
  };

  /**
   * 获取输入字段的标签和占位符
   */
  const getInputConfig = (cardTitle: string) => {
    if (cardTitle.includes('抖音') || cardTitle.includes('视频')) {
      return {
        label: '视频链接',
        placeholder: '请输入抖音视频链接',
        type: 'url'
      };
    } else if (cardTitle.includes('文案') || cardTitle.includes('创作')) {
      return {
        label: '创作需求',
        placeholder: '请描述您的文案创作需求',
        type: 'textarea'
      };
    } else if (cardTitle.includes('分析') || cardTitle.includes('数据')) {
      return {
        label: '分析内容',
        placeholder: '请输入需要分析的内容或数据',
        type: 'textarea'
      };
    } else {
      return {
        label: '输入内容',
        placeholder: '请输入相关内容',
        type: 'text'
      };
    }
  };

  /**
   * 解析并提取结果中的data字段内容
   */
  const extractDataFromResult = (resultString: string): string => {
    try {
      const parsed = JSON.parse(resultString);
      return parsed.data || resultString;
    } catch {
      return resultString;
    }
  };

  // 复制状态管理
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  /**
   * 复制data内容到剪贴板
   */
  const handleCopyData = async () => {
    try {
      const dataContent = extractDataFromResult(result);
      await navigator.clipboard.writeText(dataContent);
      setCopyStatus('success');
      // 3秒后重置状态
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopyStatus('error');
      // 3秒后重置状态
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  /**
   * 执行工作流
   */
  const handleExecuteWorkflow = async () => {
    if (!inputValue.trim() || !cardInfo) {
      setExecutionError('请输入有效的内容');
      return;
    }

    setIsExecuting(true);
    setExecutionError('');
    setResult('');
    setDebugInfo([]);

    try {
      console.log('开始调用工作流API...');
      setDebugInfo(prev => [...prev, '开始调用工作流API...']);
      
      // 构建请求体
      const requestBody = {
        workflow_id: cardInfo.workflowId,
        parameters: {
          input: inputValue
        }
      };
      
      console.log('请求参数:', JSON.stringify(requestBody, null, 2));
      setDebugInfo(prev => [...prev, `请求参数: ${JSON.stringify(requestBody)}`]);
      
      // 调用Coze工作流API
      const response = await fetch('https://api.coze.cn/v1/workflow/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cardInfo.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('响应状态:', response.status, response.statusText);
      setDebugInfo(prev => [...prev, `响应状态: ${response.status} ${response.statusText}`]);

      const result = await response.json();
      console.log('API响应:', JSON.stringify(result, null, 2));
      setDebugInfo(prev => [...prev, `API响应: ${JSON.stringify(result, null, 2)}`]);

      if (!response.ok) {
        const errorDetail = result.msg || result.message || result.error || '未知错误';
        console.error('API错误详情:', errorDetail);
        setDebugInfo(prev => [...prev, `API错误详情: ${errorDetail}`]);
        throw new Error(`HTTP ${response.status}: ${errorDetail}`);
      }

      setDebugInfo(prev => [...prev, `API响应状态: ${result.code === 0 ? '成功' : '失败'}`]);

      if (result.code === 0) {
        const workflowResult = result.data || '工作流执行完成';
        console.log('工作流结果:', workflowResult);
        setResult(typeof workflowResult === 'string' ? workflowResult : JSON.stringify(workflowResult, null, 2));
        setDebugInfo(prev => [...prev, '工作流执行成功，已获取结果']);
      } else {
        const errorMsg = result.msg || '未知错误';
        console.error('API调用失败:', errorMsg);
        setExecutionError(`API调用失败: ${errorMsg}`);
        setDebugInfo(prev => [...prev, `API调用失败: ${errorMsg}`]);
        return;
      }

    } catch (err: any) {
      console.error('工作流执行失败:', err);
      setExecutionError(`执行失败: ${err.message || '未知错误'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * 清空结果
   */
  const handleClear = () => {
    setResult('');
    setExecutionError('');
    setDebugInfo([]);
  };

  // 加载状态
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f3e8ff 100%)',
          minHeight: '100vh'
        }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-100/30 animate-ping"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">加载中...</h2>
            <p className="text-gray-600">正在获取工作流信息</p>
            <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f3e8ff 100%)',
          minHeight: '100vh'
        }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">加载失败</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span style={{ color: '#ffffff' }}>返回首页</span>
                </div>
              </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cardInfo) {
    return null;
  }

  const inputConfig = getInputConfig(cardInfo.title);

  return (
    <div 
      className="min-h-screen py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f3e8ff 100%)',
        minHeight: '100vh'
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* 返回首页按钮 */}
        <div className="mb-8 animate-fade-in">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-indigo-600 hover:to-purple-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>返回首页</span>
          </Link>
        </div>

        {/* 卡片信息展示 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 transform hover:scale-[1.02] transition-all duration-500 animate-slide-up">
          <div className="flex items-center mb-6">
            <div 
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg transform hover:rotate-12 transition-all duration-300`}
              style={{ 
                backgroundColor: cardInfo.backgroundColor,
                boxShadow: `0 10px 30px ${cardInfo.backgroundColor}40`
              }}
            >
              {React.createElement(getIconByName(cardInfo.icon), { 
                size: 32, 
                className: "text-white",
                style: { color: '#ffffff' }
              })}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                {cardInfo.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">{cardInfo.description}</p>
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 animate-slide-up delay-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:rotate-6 hover:scale-110 transition-all duration-300 relative overflow-hidden group">
              {/* 背景光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* 图标 */}
              <svg className="w-6 h-6 text-white relative z-10 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {/* 装饰性光点 */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">输入内容</h2>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-indigo-600 transition-colors">
                {inputConfig.label}
              </label>
              {inputConfig.type === 'textarea' ? (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all duration-300 hover:border-indigo-300 bg-white/50 backdrop-blur-sm"
                  placeholder={inputConfig.placeholder}
                  disabled={isExecuting}
                  rows={4}
                />
              ) : (
                <input
                  type={inputConfig.type}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-300 bg-white/50 backdrop-blur-sm"
                  placeholder={inputConfig.placeholder}
                  disabled={isExecuting}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || !inputValue.trim()}
                className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 overflow-hidden"
                style={{ color: '#ffffff !important' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>执行中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{ color: '#ffffff' }}>开始执行</span>
                    </>
                  )}
                </div>
              </button>
              
              <button
                onClick={handleClear}
                disabled={isExecuting}
                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 hover:from-gray-700 hover:to-gray-800"
                style={{ color: '#ffffff !important' }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span style={{ color: '#ffffff' }}>清空结果</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isExecuting && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm animate-pulse">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-ping"></div>
              </div>
              <div className="flex-1">
                <span className="text-blue-800 font-semibold text-lg">工作流执行中，请稍候...</span>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* 错误信息 */}
        {executionError && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm animate-shake">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-1">执行错误</h3>
                <p className="text-red-700">{executionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* 结果显示区域 */}
        {result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 animate-slide-up delay-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:rotate-6 hover:scale-110 transition-all duration-300 relative overflow-hidden group">
                  {/* 背景光效 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* 图标 */}
                  <svg className="w-6 h-6 text-white relative z-10 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* 装饰性光点 */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">执行结果</h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* 复制状态提示 */}
                {copyStatus === 'success' && (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-medium animate-bounce">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>复制成功</span>
                  </div>
                )}
                {copyStatus === 'error' && (
                  <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium animate-shake">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>复制失败</span>
                  </div>
                )}
                
                {/* 复制按钮 */}
                <button
                  onClick={handleCopyData}
                  disabled={copyStatus === 'success'}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105 overflow-hidden ${
                    copyStatus === 'success'
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : copyStatus === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="relative z-10">
                    {copyStatus === 'success' ? '已复制' : copyStatus === 'error' ? '重试复制' : '复制结果'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 max-h-96 overflow-y-auto border-2 border-dashed border-gray-300/50 shadow-inner">
              {containsUrl(extractDataFromResult(result)) ? (
                <div className="text-sm text-gray-800 leading-relaxed">
                  {convertUrlsToLinks(extractDataFromResult(result)).map((part, index) => (
                    <span key={index}>{part}</span>
                  ))}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">
                  {extractDataFromResult(result)}
                </pre>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default WorkflowPage;