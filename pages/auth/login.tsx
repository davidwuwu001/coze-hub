import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AuthLayout from '../../src/components/AuthLayout';
import LoginForm from '../../src/components/LoginForm';
import useAuth from '../../src/hooks/useAuth';
import { LoginCredentials } from '../../src/types/auth';

/**
 * 登录页面
 * 用户可以通过用户名/邮箱/手机号和密码登录
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  // 如果用户已登录，重定向到首页
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  /**
   * 处理登录提交
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      toast.success(result.message || '登录成功');
      
      // 获取重定向URL（如果有的话）
      const redirectTo = router.query.redirect as string || '/';
      router.replace(redirectTo);
    } else {
      toast.error(result.message || '登录失败');
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
      title="欢迎回来"
      subtitle="登录您的账户以继续使用"
    >
      <LoginForm
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        onClearError={clearError}
      />
      
      {/* 注册链接 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600">
          还没有账户？{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            立即注册
          </Link>
        </p>
      </motion.div>
      

    </AuthLayout>
  );
};

export default LoginPage;