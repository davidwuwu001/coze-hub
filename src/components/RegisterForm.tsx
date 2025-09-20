import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Key, Gift } from 'lucide-react';
import { RegisterData } from '../types/auth';
import { isValidEmail, isValidPhone } from '../utils/auth';

// 表单数据接口，包含确认密码字段
interface RegisterFormData extends RegisterData {
  confirm_password: string;
}

interface RegisterFormProps {
  onSubmit: (registerData: RegisterData) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

/**
 * 注册表单组件
 * 包含用户名、手机号、邮箱、邀请码、密码等字段
 */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading, error, onClearError }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    phone: '',
    invite_code: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 用户名验证
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      errors.username = '用户名长度至少3位';
    } else if (formData.username.length > 20) {
      errors.username = '用户名长度不能超过20位';
    } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(formData.username)) {
      errors.username = '用户名只能包含字母、数字、下划线和中文';
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱';
    } else if (!isValidEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 手机号验证
    if (!formData.phone.trim()) {
      errors.phone = '请输入手机号';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = '请输入有效的手机号';
    }

    // 邀请码验证
    if (!formData.invite_code.trim()) {
      errors.invite_code = '请输入邀请码';
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少6位';
    } else if (formData.password.length > 50) {
      errors.password = '密码长度不能超过50位';
    }

    // 确认密码验证
    if (!formData.confirm_password) {
      errors.confirm_password = '请确认密码';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = '两次输入的密码不一致';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onClearError) {
      onClearError();
    }
    
    if (!validateForm()) {
      return;
    }

    // 从表单数据中移除 confirm_password 字段，只传递符合 RegisterData 类型的数据
    const { confirm_password, ...registerData } = formData;
    await onSubmit(registerData);
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 清除全局错误
    if (onClearError) {
      onClearError();
    }
  };

  /**
   * 渲染输入框
   */
  const renderInput = (
    id: keyof RegisterFormData,
    label: string,
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    showPasswordToggle?: boolean
  ) => {
    const isPassword = type === 'password';
    const currentShowPassword = id === 'password' ? showPassword : showConfirmPassword;
    const currentSetShowPassword = id === 'password' ? setShowPassword : setShowConfirmPassword;

    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
          <input
            id={id}
            type={isPassword && !currentShowPassword ? 'password' : 'text'}
            value={formData[id]}
            onChange={(e) => handleInputChange(id, e.target.value)}
            className={`block w-full pl-10 ${showPasswordToggle ? 'pr-12' : 'pr-3'} py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              fieldErrors[id] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            placeholder={placeholder}
            disabled={loading}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => currentSetShowPassword(!currentShowPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {currentShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {fieldErrors[id] && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {fieldErrors[id]}
          </motion.p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 全局错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* 用户名 */}
      {renderInput(
        'username',
        '用户名',
        'text',
        '请输入用户名',
        <User className="h-5 w-5 text-gray-400" />
      )}

      {/* 邮箱 */}
      {renderInput(
        'email',
        '邮箱',
        'email',
        '请输入邮箱地址',
        <Mail className="h-5 w-5 text-gray-400" />
      )}

      {/* 手机号 */}
      {renderInput(
        'phone',
        '手机号',
        'tel',
        '请输入手机号',
        <Phone className="h-5 w-5 text-gray-400" />
      )}

      {/* 邀请码 */}
      {renderInput(
        'invite_code',
        '邀请码',
        'text',
        '请输入邀请码',
        <Gift className="h-5 w-5 text-gray-400" />
      )}

      {/* 密码 */}
      {renderInput(
        'password',
        '密码',
        'password',
        '请输入密码（至少6位）',
        <Key className="h-5 w-5 text-gray-400" />,
        true
      )}

      {/* 确认密码 */}
      {renderInput(
        'confirm_password',
        '确认密码',
        'password',
        '请再次输入密码',
        <Key className="h-5 w-5 text-gray-400" />,
        true
      )}

      {/* 提交按钮 */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            注册中...
          </div>
        ) : (
          '注册'
        )}
      </motion.button>
    </form>
  );
};

export default RegisterForm;