import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * 输入配置接口
 */
export interface InputConfig {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * 动态输入组件属性接口
 */
interface DynamicInputProps {
  config: InputConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

/**
 * 动态输入组件
 * 根据配置动态渲染不同类型的输入控件
 */
const DynamicInput: React.FC<DynamicInputProps> = ({
  config,
  value,
  onChange,
  error
}) => {
  const { id, name, type, label, placeholder, required, options, validation } = config;

  /**
   * 处理输入值变化
   */
  const handleChange = (newValue: any) => {
    onChange(name, newValue);
  };

  /**
   * 验证输入值
   */
  const validateValue = (val: any): string | undefined => {
    if (required && (!val || val.toString().trim() === '')) {
      return `${label}是必填项`;
    }

    if (validation) {
      if (type === 'number') {
        const numVal = Number(val);
        if (validation.min !== undefined && numVal < validation.min) {
          return `${label}不能小于${validation.min}`;
        }
        if (validation.max !== undefined && numVal > validation.max) {
          return `${label}不能大于${validation.max}`;
        }
      }

      if (type === 'text' || type === 'textarea' || type === 'url') {
        const strVal = val?.toString() || '';
        if (validation.min !== undefined && strVal.length < validation.min) {
          return `${label}长度不能少于${validation.min}个字符`;
        }
        if (validation.max !== undefined && strVal.length > validation.max) {
          return `${label}长度不能超过${validation.max}个字符`;
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(strVal)) {
          if (type === 'url') {
            return `请输入有效的URL地址`;
          }
          return `${label}格式不正确`;
        }
      }
    }

    return undefined;
  };

  /**
   * 渲染基础样式类
   */
  const baseInputClass = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
  `;

  /**
   * 渲染不同类型的输入控件
   */
  const renderInput = () => {
    switch (type) {
      case 'text':
      case 'url':
        return (
          <input
            id={id}
            type={type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`${baseInputClass} resize-vertical`}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            id={id}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={placeholder}
            min={validation?.min}
            max={validation?.max}
            className={baseInputClass}
            required={required}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={required}
          >
            <option value="">{placeholder || '请选择...'}</option>
            {options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <input
            id={id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleChange(file);
            }}
            className={`${baseInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
            required={required}
          />
        );

      default:
        return (
          <input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {/* 标签 */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 输入控件 */}
      {renderInput()}

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{error}</span>
        </div>
      )}

      {/* 帮助文本 */}
      {validation && (
        <div className="mt-1 text-xs text-gray-500">
          {type === 'number' && (
            <span>
              {validation.min !== undefined && validation.max !== undefined
                ? `范围: ${validation.min} - ${validation.max}`
                : validation.min !== undefined
                ? `最小值: ${validation.min}`
                : validation.max !== undefined
                ? `最大值: ${validation.max}`
                : ''}
            </span>
          )}
          {(type === 'text' || type === 'textarea') && (
            <span>
              {validation.min !== undefined && validation.max !== undefined
                ? `长度: ${validation.min} - ${validation.max} 个字符`
                : validation.min !== undefined
                ? `最少 ${validation.min} 个字符`
                : validation.max !== undefined
                ? `最多 ${validation.max} 个字符`
                : ''}
            </span>
          )}
          {type === 'url' && (
            <span>请输入完整的URL地址，如: https://example.com</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicInput;