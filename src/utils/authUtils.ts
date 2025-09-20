/**
 * 身份验证工具类
 * 定义敏感操作和验证策略
 */

// 敏感操作类型枚举
export enum SensitiveOperation {
  // 用户管理相关
  DELETE_USER = 'delete_user',
  UPDATE_USER_ROLE = 'update_user_role',
  RESET_PASSWORD = 'reset_password',
  
  // 数据管理相关
  DELETE_CARD = 'delete_card',
  BULK_DELETE = 'bulk_delete',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  
  // 系统配置相关
  UPDATE_SYSTEM_CONFIG = 'update_system_config',
  MANAGE_API_KEYS = 'manage_api_keys',
  
  // 财务相关
  VIEW_FINANCIAL_DATA = 'view_financial_data',
  MODIFY_PRICING = 'modify_pricing',
  
  // 管理员操作
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  VIEW_USER_LIST = 'view_user_list',
  MODIFY_PERMISSIONS = 'modify_permissions'
}

// 操作风险级别
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 敏感操作配置
interface SensitiveOperationConfig {
  operation: SensitiveOperation;
  riskLevel: RiskLevel;
  requireReauth: boolean; // 是否需要重新验证
  maxAge: number; // 验证有效期（毫秒）
  description: string;
}

/**
 * 敏感操作配置表
 */
export const SENSITIVE_OPERATIONS: Record<SensitiveOperation, SensitiveOperationConfig> = {
  [SensitiveOperation.DELETE_USER]: {
    operation: SensitiveOperation.DELETE_USER,
    riskLevel: RiskLevel.CRITICAL,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '删除用户账户'
  },
  [SensitiveOperation.UPDATE_USER_ROLE]: {
    operation: SensitiveOperation.UPDATE_USER_ROLE,
    riskLevel: RiskLevel.HIGH,
    requireReauth: true,
    maxAge: 10 * 60 * 1000, // 10分钟
    description: '修改用户角色'
  },
  [SensitiveOperation.RESET_PASSWORD]: {
    operation: SensitiveOperation.RESET_PASSWORD,
    riskLevel: RiskLevel.HIGH,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '重置密码'
  },
  [SensitiveOperation.DELETE_CARD]: {
    operation: SensitiveOperation.DELETE_CARD,
    riskLevel: RiskLevel.MEDIUM,
    requireReauth: false,
    maxAge: 30 * 60 * 1000, // 30分钟
    description: '删除卡片'
  },
  [SensitiveOperation.BULK_DELETE]: {
    operation: SensitiveOperation.BULK_DELETE,
    riskLevel: RiskLevel.HIGH,
    requireReauth: true,
    maxAge: 10 * 60 * 1000, // 10分钟
    description: '批量删除'
  },
  [SensitiveOperation.EXPORT_DATA]: {
    operation: SensitiveOperation.EXPORT_DATA,
    riskLevel: RiskLevel.MEDIUM,
    requireReauth: false,
    maxAge: 60 * 60 * 1000, // 1小时
    description: '导出数据'
  },
  [SensitiveOperation.IMPORT_DATA]: {
    operation: SensitiveOperation.IMPORT_DATA,
    riskLevel: RiskLevel.HIGH,
    requireReauth: true,
    maxAge: 15 * 60 * 1000, // 15分钟
    description: '导入数据'
  },
  [SensitiveOperation.UPDATE_SYSTEM_CONFIG]: {
    operation: SensitiveOperation.UPDATE_SYSTEM_CONFIG,
    riskLevel: RiskLevel.CRITICAL,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '修改系统配置'
  },
  [SensitiveOperation.MANAGE_API_KEYS]: {
    operation: SensitiveOperation.MANAGE_API_KEYS,
    riskLevel: RiskLevel.CRITICAL,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '管理API密钥'
  },
  [SensitiveOperation.VIEW_FINANCIAL_DATA]: {
    operation: SensitiveOperation.VIEW_FINANCIAL_DATA,
    riskLevel: RiskLevel.HIGH,
    requireReauth: false,
    maxAge: 30 * 60 * 1000, // 30分钟
    description: '查看财务数据'
  },
  [SensitiveOperation.MODIFY_PRICING]: {
    operation: SensitiveOperation.MODIFY_PRICING,
    riskLevel: RiskLevel.CRITICAL,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '修改价格'
  },
  [SensitiveOperation.ACCESS_ADMIN_PANEL]: {
    operation: SensitiveOperation.ACCESS_ADMIN_PANEL,
    riskLevel: RiskLevel.HIGH,
    requireReauth: false,
    maxAge: 60 * 60 * 1000, // 1小时
    description: '访问管理面板'
  },
  [SensitiveOperation.VIEW_USER_LIST]: {
    operation: SensitiveOperation.VIEW_USER_LIST,
    riskLevel: RiskLevel.MEDIUM,
    requireReauth: false,
    maxAge: 60 * 60 * 1000, // 1小时
    description: '查看用户列表'
  },
  [SensitiveOperation.MODIFY_PERMISSIONS]: {
    operation: SensitiveOperation.MODIFY_PERMISSIONS,
    riskLevel: RiskLevel.CRITICAL,
    requireReauth: true,
    maxAge: 5 * 60 * 1000, // 5分钟
    description: '修改权限'
  }
};

/**
 * 身份验证工具类
 */
export class AuthUtils {
  private static readonly AUTH_CACHE_KEY = 'auth_verification_cache';
  
  /**
   * 检查操作是否为敏感操作
   */
  static isSensitiveOperation(operation: string): boolean {
    return Object.values(SensitiveOperation).includes(operation as SensitiveOperation);
  }
  
  /**
   * 获取操作配置
   */
  static getOperationConfig(operation: SensitiveOperation): SensitiveOperationConfig | null {
    return SENSITIVE_OPERATIONS[operation] || null;
  }
  
  /**
   * 检查是否需要重新验证身份
   */
  static requiresReauth(operation: SensitiveOperation): boolean {
    const config = this.getOperationConfig(operation);
    if (!config) return false;
    
    // 检查缓存的验证时间
    const cache = this.getAuthCache();
    const lastAuth = cache[operation];
    
    if (!lastAuth) return config.requireReauth;
    
    const now = Date.now();
    const timeSinceAuth = now - lastAuth;
    
    // 如果超过有效期，需要重新验证
    if (timeSinceAuth > config.maxAge) {
      this.clearAuthCache(operation);
      return config.requireReauth;
    }
    
    return false;
  }
  
  /**
   * 记录验证时间
   */
  static recordAuth(operation: SensitiveOperation): void {
    const cache = this.getAuthCache();
    cache[operation] = Date.now();
    localStorage.setItem(this.AUTH_CACHE_KEY, JSON.stringify(cache));
  }
  
  /**
   * 获取验证缓存
   */
  private static getAuthCache(): Record<string, number> {
    try {
      const cache = localStorage.getItem(this.AUTH_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }
  
  /**
   * 清除特定操作的验证缓存
   */
  static clearAuthCache(operation?: SensitiveOperation): void {
    if (operation) {
      const cache = this.getAuthCache();
      delete cache[operation];
      localStorage.setItem(this.AUTH_CACHE_KEY, JSON.stringify(cache));
    } else {
      localStorage.removeItem(this.AUTH_CACHE_KEY);
    }
  }
  
  /**
   * 获取操作风险级别
   */
  static getRiskLevel(operation: SensitiveOperation): RiskLevel {
    const config = this.getOperationConfig(operation);
    return config?.riskLevel || RiskLevel.LOW;
  }
  
  /**
   * 检查用户是否有权限执行操作
   */
  static hasPermission(userRole: string, operation: SensitiveOperation): boolean {
    const config = this.getOperationConfig(operation);
    if (!config) return true;
    
    // 根据用户角色和操作风险级别判断权限
    switch (userRole) {
      case 'admin':
        return true; // 管理员可以执行所有操作
      case 'moderator':
        return config.riskLevel !== RiskLevel.CRITICAL; // 版主不能执行关键操作
      case 'user':
        return config.riskLevel === RiskLevel.LOW; // 普通用户只能执行低风险操作
      default:
        return false;
    }
  }
  
  /**
   * 获取操作描述
   */
  static getOperationDescription(operation: SensitiveOperation): string {
    const config = this.getOperationConfig(operation);
    return config?.description || '未知操作';
  }
  
  /**
   * 清理过期的验证缓存
   */
  static cleanupExpiredCache(): void {
    const cache = this.getAuthCache();
    const now = Date.now();
    let hasChanges = false;
    
    Object.keys(cache).forEach(operation => {
      const config = this.getOperationConfig(operation as SensitiveOperation);
      if (config) {
        const lastAuth = cache[operation];
        const timeSinceAuth = now - lastAuth;
        
        if (timeSinceAuth > config.maxAge) {
          delete cache[operation];
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      localStorage.setItem(this.AUTH_CACHE_KEY, JSON.stringify(cache));
    }
  }
}

/**
 * 敏感操作验证装饰器
 */
export function requireAuth(operation: SensitiveOperation) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // 检查是否需要重新验证
      if (AuthUtils.requiresReauth(operation)) {
        throw new Error(`操作 "${AuthUtils.getOperationDescription(operation)}" 需要重新验证身份`);
      }
      
      // 记录验证时间
      AuthUtils.recordAuth(operation);
      
      // 执行原方法
      return method.apply(this, args);
    };
  };
}

export default AuthUtils;