import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { LoginCredentials } from '../types/auth';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

/**
 * 登录表单组件
 * 支持用户名/邮箱/手机号登录
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error, onClearError }) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.identifier.trim()) {
      errors.identifier = '请输入用户名、邮箱或手机号';
    }

    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少6位';
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

    await onSubmit(formData);
  };

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
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
   * 处理忘记密码点击事件
   */
  const handleForgotPassword = () => {
    // 这里可以添加忘记密码的逻辑
    // 比如跳转到忘记密码页面或显示重置密码对话框
    window.location.href = '/auth/forgot-password';
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

      {/* 用户名/邮箱/手机号输入 */}
      <div className="space-y-2">
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
          用户名/邮箱/手机号
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="identifier"
            type="text"
            value={formData.identifier}
            onChange={(e) => handleInputChange('identifier', e.target.value)}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              fieldErrors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            placeholder="请输入用户名、邮箱或手机号"
            disabled={loading}
          />
        </div>
        {fieldErrors.identifier && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {fieldErrors.identifier}
          </motion.p>
        )}
      </div>

      {/* 密码输入 */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            placeholder="请输入密码"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {fieldErrors.password && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm"
          >
            {fieldErrors.password}
          </motion.p>
        )}
      </div>

      {/* 记住登录 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => handleInputChange('remember', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            disabled={loading}
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            记住登录状态
          </label>
        </div>
        <div className="text-sm">
          <button 
            type="button"
            onClick={handleForgotPassword}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            忘记密码？
          </button>
        </div>
      </div>

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
            登录中...
          </div>
        ) : (
          '登录'
        )}
      </motion.button>
    </form>
  );
};

export default LoginForm;