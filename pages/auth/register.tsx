import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AuthLayout from '../../src/components/AuthLayout';
import RegisterForm from '../../src/components/RegisterForm';
import useAuth from '../../src/hooks/useAuth';
import { RegisterData } from '../../src/types/auth';

/**
 * 注册页面
 * 用户可以创建新账户
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();

  // 如果用户已登录，重定向到首页
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  /**
   * 处理注册提交
   */
  const handleRegister = async (registerData: RegisterData) => {
    const result = await register(registerData);
    
    if (result.success) {
      toast.success(result.message || '注册成功');
      
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } else {
      toast.error(result.message || '注册失败');
    }
    
    return result;
  };

  // 如果用户已登录，显示加载状态
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">正在跳转...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="创建账户"
      subtitle="加入我们，开始您的旅程"
    >
      <RegisterForm
        onSubmit={handleRegister}
        loading={loading}
        error={error}
        onClearError={clearError}
      />
      
      {/* 登录链接 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600">
          已有账户？{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            立即登录
          </Link>
        </p>
      </motion.div>
      
      {/* 邀请码提示 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <h4 className="text-sm font-medium text-green-900 mb-2">邀请码说明</h4>
        <div className="text-xs text-green-700 space-y-1">
          <p>• 注册需要有效的邀请码</p>
          <p>• 演示邀请码：<span className="font-mono bg-green-100 px-1 rounded">1212</span> 或 <span className="font-mono bg-green-100 px-1 rounded">7777</span></p>
          <p>• 每个邀请码只能使用一次</p>
        </div>
      </motion.div>
      
      {/* 用户协议 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-4 text-center"
      >
        <p className="text-xs text-gray-500">
          注册即表示您同意我们的{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
            服务条款
          </a>
          {' '}和{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
            隐私政策
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;