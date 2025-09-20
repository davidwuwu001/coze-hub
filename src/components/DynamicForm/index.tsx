import React, { useState, useEffect } from 'react';
import DynamicInput, { InputConfig } from '../DynamicInput';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * 表单数据接口
 */
export interface FormData {
  [key: string]: any;
}

/**
 * 表单错误接口
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * 动态表单组件属性接口
 */
interface DynamicFormProps {
  configs: InputConfig[];
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onDataChange?: (data: FormData) => void;
  loading?: boolean;
  submitText?: string;
  className?: string;
}

/**
 * 动态表单组件
 * 根据配置动态生成表单，支持验证和提交
 */
const DynamicForm: React.FC<DynamicFormProps> = ({
  configs,
  initialData = {},
  onSubmit,
  onDataChange,
  loading = false,
  submitText = '提交',
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    const initData: FormData = {};
    configs.forEach(config => {
      if (initialData[config.name] !== undefined) {
        initData[config.name] = initialData[config.name];
      } else {
        // 设置默认值
        switch (config.type) {
          case 'number':
            initData[config.name] = config.validation?.min || 0;
            break;
          case 'select':
            initData[config.name] = '';
            break;
          default:
            initData[config.name] = '';
        }
      }
    });
    setFormData(initData);
  }, [configs, initialData]);

  /**
   * 验证单个字段
   */
  const validateField = (config: InputConfig, value: any): string | undefined => {
    const { name, type, label, required, validation } = config;

    // 必填验证
    if (required && (!value || value.toString().trim() === '')) {
      return `${label}是必填项`;
    }

    // 跳过空值的其他验证
    if (!value || value.toString().trim() === '') {
      return undefined;
    }

    // 类型特定验证
    if (validation) {
      if (type === 'number') {
        const numVal = Number(value);
        if (isNaN(numVal)) {
          return `${label}必须是数字`;
        }
        if (validation.min !== undefined && numVal < validation.min) {
          return `${label}不能小于${validation.min}`;
        }
        if (validation.max !== undefined && numVal > validation.max) {
          return `${label}不能大于${validation.max}`;
        }
      }

      if (type === 'text' || type === 'textarea' || type === 'url') {
        const strVal = value.toString();
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
   * 验证所有字段
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    configs.forEach(config => {
      const error = validateField(config, formData[config.name]);
      if (error) {
        newErrors[config.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * 处理字段值变化
   */
  const handleFieldChange = (name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // 实时验证已触摸的字段
    if (touched[name]) {
      const config = configs.find(c => c.name === name);
      if (config) {
        const error = validateField(config, value);
        setErrors(prev => ({
          ...prev,
          [name]: error || ''
        }));
      }
    }

    // 通知父组件数据变化
    onDataChange?.(newFormData);
  };

  /**
   * 处理字段失焦
   */
  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // 验证当前字段
    const config = configs.find(c => c.name === name);
    if (config) {
      const error = validateField(config, formData[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allTouched: { [key: string]: boolean } = {};
    configs.forEach(config => {
      allTouched[config.name] = true;
    });
    setTouched(allTouched);

    // 验证表单
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  /**
   * 清空表单
   */
  const handleClear = () => {
    const clearedData: FormData = {};
    configs.forEach(config => {
      switch (config.type) {
        case 'number':
          clearedData[config.name] = config.validation?.min || 0;
          break;
        default:
          clearedData[config.name] = '';
      }
    });
    setFormData(clearedData);
    setErrors({});
    setTouched({});
    onDataChange?.(clearedData);
  };

  /**
   * 检查表单是否有效
   */
  const isFormValid = () => {
    return configs.every(config => {
      const error = validateField(config, formData[config.name]);
      return !error;
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* 渲染所有输入字段 */}
      {configs.map(config => (
        <div
          key={config.id}
          onBlur={() => handleFieldBlur(config.name)}
        >
          <DynamicInput
            config={config}
            value={formData[config.name]}
            onChange={handleFieldChange}
            error={touched[config.name] ? errors[config.name] : undefined}
          />
        </div>
      ))}

      {/* 表单操作按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${loading || !isFormValid()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>处理中...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{submitText}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          清空
        </button>
      </div>

      {/* 表单状态提示 */}
      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>请检查并修正表单中的错误</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;