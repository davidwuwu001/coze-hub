import React, { useState, useCallback } from 'react';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { SensitiveOperation } from '../utils/authUtils';

interface SensitiveOperationGuardProps {
  operation: SensitiveOperation;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

/**
 * 敏感操作守卫组件
 * 在执行敏感操作前进行权限验证
 */
export const SensitiveOperationGuard: React.FC<SensitiveOperationGuardProps> = ({
  operation,
  children,
  fallback,
  onUnauthorized
}) => {
  const { checkSensitiveOperation, user } = useOptimizedAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  /**
   * 检查权限
   */
  const checkPermission = useCallback(async () => {
    if (!user) {
      setHasPermission(false);
      onUnauthorized?.();
      return;
    }

    setIsChecking(true);
    try {
      const permitted = await checkSensitiveOperation(operation);
      setHasPermission(permitted);
    } catch (error) {
      console.warn('权限检查失败:', error);
      setHasPermission(false);
      onUnauthorized?.();
    } finally {
      setIsChecking(false);
    }
  }, [user, checkSensitiveOperation, operation, onUnauthorized]);

  // 初始权限检查
  React.useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">验证权限中...</span>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="text-center p-4">
        {fallback || (
          <div className="text-red-600">
            <div className="text-lg font-medium mb-2">权限不足</div>
            <div className="text-sm text-gray-600">您没有权限执行此操作</div>
          </div>
        )}
      </div>
    );
  }

  if (hasPermission === true) {
    return <>{children}</>;
  }

  return null;
};

export default SensitiveOperationGuard;