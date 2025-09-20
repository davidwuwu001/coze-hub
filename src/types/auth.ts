/**
 * 用户信息接口
 */
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  invite_code?: string;
  avatar?: string; // 用户头像URL
  points: number; // 用户积分
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * 注册请求数据接口
 */
export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  invite_code?: string;
}

/**
 * 登录请求数据接口
 */
export interface LoginCredentials {
  identifier: string; // 用户名/邮箱/手机号
  password: string;
  remember?: boolean;
}

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 登录响应数据接口
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * 注册响应数据接口
 */
export interface RegisterResponse {
  userId: number;
}

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * 认证上下文接口
 */
export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * 表单验证错误接口
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * 邀请码信息接口
 */
export interface InviteCode {
  id: number;
  code: string;
  created_by_user_id?: number;
  used_by_user_id?: number;
  created_at: string;
  used_at?: string;
  is_active: boolean;
}

/**
 * 个人信息更新数据接口
 */
export interface UpdateProfileData {
  username?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

/**
 * 积分记录接口
 */
export interface PointsRecord {
  id: number;
  user_id: number;
  points: number;
  type: 'earn' | 'spend' | 'recharge'; // 获得、消费、充值
  description: string;
  created_at: string;
}

/**
 * 积分充值数据接口
 */
export interface RechargePointsData {
  amount: number; // 充值金额
  points: number; // 获得积分
  payment_method: string; // 支付方式
}

/**
 * 密码找回数据接口
 */
export interface PasswordResetData {
  username: string;
  phone: string;
  email: string;
  newPassword: string;
}