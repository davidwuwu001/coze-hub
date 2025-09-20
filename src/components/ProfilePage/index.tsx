import React, { useState, useEffect } from 'react';
import { User, Camera, CreditCard, LogOut, Lock, Edit, Gift, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User as UserType, UpdateProfileData, PointsRecord, PasswordResetData } from '../../types/auth';
import { cn } from '../../lib/utils';
import { AvatarSelector, Avatar } from '../Avatar';

export interface ProfilePageProps {
  className?: string;
}

/**
 * 个人中心页面组件
 * 包含个人资料展示、积分管理、退出登录、密码找回等功能
 */
const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [pointsRecords, setPointsRecords] = useState<PointsRecord[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        await logout();
      } catch (error) {
        console.error('退出登录失败:', error);
      }
    }
  };

  /**
   * 获取积分记录
   */
  const fetchPointsRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/points-records', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setPointsRecords(data.data);
      }
    } catch (error) {
      console.error('获取积分记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPointsModal) {
      fetchPointsRecords();
    }
  }, [showPointsModal]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 pb-20', className)}>
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 pt-12 pb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            {/* 头像 */}
            <div className="relative">
              <Avatar
                username={user.username}
                avatarType={user.avatar}
                size={64}
                className="border-4 border-white/30"
              />
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-white/80 text-sm">{user.email}</p>
              <p className="text-white/80 text-sm">{user.phone}</p>
            </div>
            
            {/* 编辑按钮 */}
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Edit className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 积分卡片 */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">我的积分</h3>
                <p className="text-2xl font-bold text-orange-500">{user.points || 0}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPointsModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                明细
              </button>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                充值
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 密码找回 */}
          <button
            onClick={() => setShowPasswordResetModal(true)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">密码找回</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* 退出登录 */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-medium text-red-600">退出登录</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 编辑个人信息模态框 */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* 积分明细模态框 */}
      {showPointsModal && (
        <PointsRecordsModal
          records={pointsRecords}
          loading={loading}
          onClose={() => setShowPointsModal(false)}
        />
      )}

      {/* 积分充值模态框 */}
      {showRechargeModal && (
        <RechargePointsModal
          onClose={() => setShowRechargeModal(false)}
        />
      )}

      {/* 密码找回模态框 */}
      {showPasswordResetModal && (
        <PasswordResetModal
          onClose={() => setShowPasswordResetModal(false)}
        />
      )}
    </div>
  );
};

/**
 * 编辑个人信息模态框组件
 */
interface EditProfileModalProps {
  user: UserType;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    username: user.username,
    phone: user.phone,
    email: user.email,
    avatar: user.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 处理头像选择
   */
  const handleAvatarSelect = (avatarData: string) => {
    setFormData({ ...formData, avatar: avatarData });
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 确保发送的数据不包含undefined值
      const submitData = {
        username: formData.username || '',
        phone: formData.phone || '',
        email: formData.email || '',
        avatar: formData.avatar && formData.avatar.trim() !== '' ? formData.avatar : null,
      };

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
        window.location.reload(); // 刷新页面以更新用户信息
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">编辑个人信息</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择头像
              </label>
              <AvatarSelector
                username={formData.username}
                selectedAvatarId={formData.avatar}
                onSelect={handleAvatarSelect}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * 积分记录模态框组件
 */
interface PointsRecordsModalProps {
  records: PointsRecord[];
  loading: boolean;
  onClose: () => void;
}

const PointsRecordsModal: React.FC<PointsRecordsModalProps> = ({ records, loading, onClose }) => {
  /**
   * 获取积分类型显示文本
   */
  const getTypeText = (type: string) => {
    switch (type) {
      case 'earn': return '获得';
      case 'spend': return '消费';
      case 'recharge': return '充值';
      default: return type;
    }
  };

  /**
   * 获取积分类型颜色
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'recharge': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">积分明细</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无积分记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{record.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-bold', getTypeColor(record.type))}>
                      {record.type === 'spend' ? '-' : '+'}{record.points}
                    </p>
                    <p className="text-xs text-gray-500">{getTypeText(record.type)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 积分充值模态框组件
 */
interface RechargePointsModalProps {
  onClose: () => void;
}

const RechargePointsModal: React.FC<RechargePointsModalProps> = ({ onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rechargeOptions = [
    { amount: 10, points: 100 },
    { amount: 50, points: 550 },
    { amount: 100, points: 1200 },
    { amount: 200, points: 2500 },
  ];

  /**
   * 处理充值
   */
  const handleRecharge = async () => {
    setLoading(true);
    setError('');

    try {
      const selectedOption = rechargeOptions.find(option => option.amount === selectedAmount);
      if (!selectedOption) return;

      const response = await fetch('/api/profile/recharge-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: selectedOption.amount,
          points: selectedOption.points,
          payment_method: 'alipay', // 默认支付宝
        }),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
        window.location.reload(); // 刷新页面以更新积分
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('充值失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">积分充值</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {rechargeOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => setSelectedAmount(option.amount)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-colors',
                  selectedAmount === option.amount
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">¥{option.amount}</p>
                    <p className="text-sm text-gray-500">获得 {option.points} 积分</p>
                  </div>
                  {option.amount === 50 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                      推荐
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleRecharge}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '充值中...' : `充值 ¥${selectedAmount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 密码找回模态框组件
 */
interface PasswordResetModalProps {
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<PasswordResetData>({
    username: '',
    phone: '',
    email: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * 处理密码找回
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('密码重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">密码重置成功</h3>
            <p className="text-gray-600">您的密码已成功重置，请使用新密码登录</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">密码找回</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            请输入您的用户名、手机号和邮箱进行身份验证，验证通过后可设置新密码。
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;