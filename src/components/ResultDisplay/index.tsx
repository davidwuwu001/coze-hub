import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * 工作流执行状态枚举
 */
export type WorkflowStatus = 'Running' | 'Completed' | 'Failed' | 'Cancelled';

/**
 * 结果数据接口
 */
export interface ResultData {
  id: string;
  status: WorkflowStatus;
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

/**
 * 结果展示组件属性接口
 */
interface ResultDisplayProps {
  result: ResultData | null;
  loading?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

/**
 * 结果展示组件
 * 支持多种结果类型的展示和交互
 */
const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  loading = false,
  onRetry,
  onClear,
  className = ''
}) => {
  const [showRawData, setShowRawData] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  /**
   * 复制文本到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加toast提示
      console.log('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  /**
   * 下载文本文件
   */
  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  /**
   * 格式化执行时间
   */
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds.toFixed(1)}秒`;
  };

  /**
   * 获取状态样式
   */
  const getStatusStyle = (status: WorkflowStatus) => {
    switch (status) {
      case 'Running':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: '执行中'
        };
      case 'Completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: '执行成功'
        };
      case 'Failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: '执行失败'
        };
      case 'Cancelled':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: '已取消'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: '未知状态'
        };
    }
  };

  /**
   * 渲染输出内容
   */
  const renderOutput = (output: any) => {
    if (!output) return null;

    // 如果是字符串
    if (typeof output === 'string') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">输出结果</h4>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(output)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadText(output, `result-${Date.now()}.txt`)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {output}
            </pre>
          </div>
        </div>
      );
    }

    // 如果是对象
    if (typeof output === 'object') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">输出结果</h4>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(output, null, 2))}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="复制JSON"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadText(JSON.stringify(output, null, 2), `result-${Date.now()}.json`)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="下载JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="text-gray-500 text-sm">
        输出类型: {typeof output}
      </div>
    );
  };

  /**
   * 渲染错误信息
   */
  const renderError = (error: { code: number; msg: string }) => {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-red-900">错误信息</h4>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-900">错误代码: {error.code}</div>
              <div className="text-red-700 mt-1">{error.msg}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">处理中，请稍候...</span>
        </div>
      </div>
    );
  }

  // 无结果状态
  if (!result) {
    return (
      <div className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p>暂无执行结果</p>
          <p className="text-sm mt-1">提交表单后，结果将在此处显示</p>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(result.status);
  const StatusIcon = statusStyle.icon;

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* 状态头部 */}
      <div className={`p-4 border-b ${statusStyle.bgColor} ${statusStyle.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-5 h-5 ${statusStyle.color}`} />
            <div>
              <h3 className={`font-medium ${statusStyle.color}`}>{statusStyle.text}</h3>
              <p className="text-sm text-gray-600">
                执行ID: {result.id}
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            {result.debug_url && (
              <a
                href={result.debug_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="查看调试信息"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            {result.status === 'Failed' && onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
            )}
            
            {onClear && (
              <button
                onClick={onClear}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </div>
        
        {/* 时间信息 */}
        <div className="mt-3 text-sm text-gray-600 space-y-1">
          <div>开始时间: {formatTime(result.created_at)}</div>
          <div>更新时间: {formatTime(result.updated_at)}</div>
          {result.execution_time && (
            <div>执行时长: {formatDuration(result.execution_time)}</div>
          )}
        </div>
      </div>

      {/* 结果内容 */}
      <div className="p-4 space-y-4">
        {/* 成功结果 */}
        {result.status === 'Completed' && result.output && (
          <div>
            {renderOutput(result.output)}
          </div>
        )}

        {/* 错误信息 */}
        {result.status === 'Failed' && result.error && (
          <div>
            {renderError(result.error)}
          </div>
        )}

        {/* 原始数据查看 */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showRawData ? '隐藏' : '查看'}原始数据</span>
            {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showRawData && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">原始响应数据</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="复制原始数据"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs text-gray-800 font-mono overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;