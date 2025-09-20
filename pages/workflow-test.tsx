import React, { useState } from 'react';

/**
 * MVP测试页面 - 测试Coze工作流API调用
 * 功能：输入抖音视频链接，调用工作流并显示结果
 */
const WorkflowTest: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('https://v.douyin.com/ipT9jS1Z7nc/');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  /**
   * 使用原生fetch API调用Coze工作流
   */

  /**
   * 执行工作流调用
   */
  const handleExecuteWorkflow = async () => {
    if (!inputUrl.trim()) {
      setError('请输入有效的URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');
    setDebugInfo([]);

    try {
      console.log('开始调用工作流API...');
      setDebugInfo(prev => [...prev, '开始调用工作流API...']);
      
      // 调用Coze工作流API - 使用正确的API端点
      const requestBody = {
        workflow_id: '7549776785002283060',
        parameters: {
          input: inputUrl
        }
      };
      
      console.log('请求参数:', JSON.stringify(requestBody, null, 2));
      setDebugInfo(prev => [...prev, `请求参数: ${JSON.stringify(requestBody)}`]);
      
      const response = await fetch('https://api.coze.cn/v1/workflow/run', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sat_2Tbrpr7NNNHzijmBA0u2WFIwURfdnJX3XSYOUyH6tIErlnA7DNSP32Dp6k5tCidP',
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
        // 详细错误信息
        const errorDetail = result.msg || result.message || result.error || '未知错误';
        console.error('API错误详情:', errorDetail);
        setDebugInfo(prev => [...prev, `API错误详情: ${errorDetail}`]);
        throw new Error(`HTTP ${response.status}: ${errorDetail}`);
      }

      setDebugInfo(prev => [...prev, `API响应状态: ${result.code === 0 ? '成功' : '失败'}`]);

      if (result.code === 0) {
        // 成功获取结果
        const workflowResult = result.data || '工作流执行完成';
        console.log('工作流结果:', workflowResult);
        setResult(typeof workflowResult === 'string' ? workflowResult : JSON.stringify(workflowResult, null, 2));
        setDebugInfo(prev => [...prev, '工作流执行成功，已获取结果']);
      } else {
        // API调用失败
        const errorMsg = result.msg || '未知错误';
        console.error('API调用失败:', errorMsg);
        setError(`API调用失败: ${errorMsg}`);
        setDebugInfo(prev => [...prev, `API调用失败: ${errorMsg}`]);
        return;
      }

      // 同步API调用已完成，结果已在上面处理

    } catch (err: any) {
      console.error('工作流执行失败:', err);
      setError(`执行失败: ${err.message || '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 清空结果
   */
  const handleClear = () => {
    setResult('');
    setError('');
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coze工作流MVP测试
          </h1>
          <p className="text-gray-600">
            测试抖音视频链接处理工作流
          </p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">输入测试数据</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                抖音视频链接
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入抖音视频链接"
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleExecuteWorkflow}
                disabled={isLoading || !inputUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '执行中...' : '确认生成'}
              </button>
              
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                清空结果
              </button>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">工作流执行中，请稍候...</span>
            </div>
          </div>
        )}

        {/* 调试信息 */}
        {debugInfo.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-2 text-yellow-800">执行状态</h3>
            <div className="max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-sm text-yellow-700 mb-1">
                  {index + 1}. {info}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">错误：{error}</span>
            </div>
          </div>
        )}

        {/* 结果显示区域 */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">执行结果</h2>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                复制结果
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {result}
              </pre>
            </div>
          </div>
        )}

        {/* 工作流信息 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">测试信息</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>工作流ID:</strong> 7549776785002283060</p>
            <p><strong>API端点:</strong> https://api.coze.cn</p>
            <p><strong>测试URL:</strong> {inputUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTest;