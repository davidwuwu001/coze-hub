import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * 受保护的路由组件
 * 使用优化的身份验证，减少不必要的验证请求
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const router = useRouter();
  const { isAuthenticated, loading, user, checkAuth } = useOptimizedAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!requireAuth) {
        setIsInitialized(true);
        return;
      }

      // 如果已经有用户信息且token有效，直接初始化完成
      if (isAuthenticated && user) {
        setIsInitialized(true);
        return;
      }

      // 尝试验证身份
      try {
        await checkAuth();
      } catch (error) {
        console.log('身份验证失败，跳转到登录页');
        router.push('/login');
        return;
      }

      setIsInitialized(true);
    };

    initAuth();
  }, [requireAuth, isAuthenticated, user, checkAuth, router]);

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 显示加载状态
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">验证身份中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，跳转到登录页
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // 认证成功，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;