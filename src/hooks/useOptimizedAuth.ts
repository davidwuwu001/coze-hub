import { useState, useEffect, useCallback, useRef } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { cacheManager } from '../utils/cacheManager';
import { AuthUtils, SensitiveOperation } from '../utils/authUtils';

/**
 * 优化的认证状态管理Hook
 * 减少不必要的身份验证请求，提升性能
 */
export const useOptimizedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 使用ref来跟踪验证状态，避免重复请求
  const isVerifying = useRef(false);
  const lastVerifyTime = useRef(0);
  const VERIFY_COOLDOWN = 30 * 1000; // 30秒内不重复验证

  /**
   * 从缓存获取用户信息
   */
  const getCachedUser = useCallback((): User | null => {
    return cacheManager.get('current_user');
  }, []);

  /**
   * 缓存用户信息
   */
  const cacheUser = useCallback((userData: User | null) => {
    if (userData) {
      cacheManager.set('current_user', userData, 30 * 60 * 1000); // 缓存30分钟
    } else {
      cacheManager.delete('current_user');
    }
  }, []);

  /**
   * 检查是否需要验证身份
   */
  const shouldVerifyAuth = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastVerify = now - lastVerifyTime.current;
    
    // 如果正在验证中，或者距离上次验证时间太短，则跳过
    if (isVerifying.current || timeSinceLastVerify < VERIFY_COOLDOWN) {
      return false;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    // 检查是否有有效的缓存用户信息
    const cachedUser = getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      setIsInitialized(true);
      return false; // 有缓存，不需要验证
    }
    
    return true;
  }, [getCachedUser]);

  /**
   * 检查用户登录状态（优化版）
   */
  const checkAuth = useCallback(async (force: boolean = false) => {
    try {
      // 如果不是强制验证，检查是否需要验证
      if (!force && !shouldVerifyAuth()) {
        if (isInitialized) {
          return;
        }
        // 如果没有token，直接设置为未登录
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }
      }

      setLoading(true);
      setError(null);
      isVerifying.current = true;
      lastVerifyTime.current = Date.now();
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        cacheUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          cacheUser(data.data.user);
        } else {
          setUser(null);
          cacheUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
        cacheUser(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('检查认证状态失败:', err);
      setUser(null);
      cacheUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      setIsInitialized(true);
      isVerifying.current = false;
    }
  }, [shouldVerifyAuth, cacheUser, isInitialized]);

  /**
   * 用户登录（优化版）
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
        cacheUser(data.data.user);
        
        // 保存JWT令牌到localStorage
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        
        // 重置验证时间，允许立即进行下次验证
        lastVerifyTime.current = 0;
        
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
  }, [cacheUser]);

  /**
   * 用户注册
   */
  const register = useCallback(async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
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
   * 用户登出（优化版）
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // 清除本地状态和缓存
      setUser(null);
      cacheUser(null);
      localStorage.removeItem('token');
      
      // 重置验证状态
      lastVerifyTime.current = 0;
      isVerifying.current = false;
      
      // 尝试调用登出API（非阻塞）
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        // 登出API失败不影响本地登出
        console.warn('登出API调用失败:', err);
      }
      
      return { success: true, message: '已成功登出' };
    } catch (err) {
      console.error('登出失败:', err);
      return { success: false, message: '登出失败' };
    } finally {
      setLoading(false);
    }
  }, [cacheUser]);

  /**
   * 强制刷新用户信息
   */
  const refreshUser = useCallback(() => {
    return checkAuth(true);
  }, [checkAuth]);

  /**
   * 检查用户是否已登录（不触发网络请求）
   */
  const isLoggedIn = useCallback((): boolean => {
    if (user) return true;
    
    const cachedUser = getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
      return true;
    }
    
    return !!localStorage.getItem('token');
  }, [user, getCachedUser]);

  // 初始化时检查认证状态
  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [checkAuth, isInitialized]);

  // 监听storage变化，同步登录状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // token被删除，用户登出
          setUser(null);
          cacheUser(null);
        } else if (e.newValue !== e.oldValue) {
          // token发生变化，重新验证
          checkAuth(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth, cacheUser]);

  return {
    user,
    loading,
    error,
    isInitialized,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    isLoggedIn
  };
};

export default useOptimizedAuth;