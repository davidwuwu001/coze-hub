import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 受保护的路由组件
 * 检查用户认证状态，未登录时重定向到登录页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 如果不在加载状态且用户未登录，重定向到登录页面
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，不渲染内容（等待重定向）
  if (!user) {
    return null;
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;