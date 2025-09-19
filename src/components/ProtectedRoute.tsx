import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * 路由保护组件
 * 确保用户必须登录才能访问受保护的页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果不需要认证，直接显示内容
    if (!requireAuth) {
      return;
    }

    // 等待认证状态加载完成
    if (loading) {
      return;
    }

    // 如果需要认证但用户未登录，重定向到登录页
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
  }, [isAuthenticated, loading, requireAuth, router, redirectTo]);

  // 如果不需要认证，直接显示内容
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* 加载动画 */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            {/* 加载文本 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-gray-600 text-lg font-medium"
            >
              正在验证身份...
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-400 text-sm mt-2"
            >
              请稍候
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 如果用户未认证，显示重定向提示（实际上会被useEffect重定向）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md mx-4"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            需要登录
          </h2>
          
          <p className="text-gray-600 mb-4">
            您需要登录才能访问此页面
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(redirectTo)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
          >
            前往登录
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 用户已认证，显示受保护的内容
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;