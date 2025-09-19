import { useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';

/**
 * 认证状态管理Hook
 * 提供用户登录、注册、登出等功能
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 检查用户登录状态
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('检查认证状态失败:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 用户登录
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = '登录失败，请稍后重试';
      setError(errorMessage);
      console.error('登录失败:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 用户注册
   */
  const register = useCallback(async (registerData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = '注册失败，请稍后重试';
      setError(errorMessage);
      console.error('注册失败:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        return { success: true, message: data.message };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = '登出失败，请稍后重试';
      setError(errorMessage);
      console.error('登出失败:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
};

export default useAuth;