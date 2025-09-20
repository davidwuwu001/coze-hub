/**
 * 头像工具函数
 * 提供默认头像生成和管理功能
 */

// 预定义的渐变色头像配置
export const GRADIENT_AVATARS = [
  { id: 'gradient-1', colors: ['#667eea', '#764ba2'] },
  { id: 'gradient-2', colors: ['#f093fb', '#f5576c'] },
  { id: 'gradient-3', colors: ['#4facfe', '#00f2fe'] },
  { id: 'gradient-4', colors: ['#43e97b', '#38f9d7'] },
  { id: 'gradient-5', colors: ['#fa709a', '#fee140'] },
  { id: 'gradient-6', colors: ['#a8edea', '#fed6e3'] },
  { id: 'gradient-7', colors: ['#ff9a9e', '#fecfef'] },
  { id: 'gradient-8', colors: ['#ffecd2', '#fcb69f'] },
  { id: 'gradient-9', colors: ['#a18cd1', '#fbc2eb'] },
  { id: 'gradient-10', colors: ['#fad0c4', '#ffd1ff'] }
];

/**
 * 获取用户名首字母
 * @param username 用户名
 * @returns 首字母（大写）
 */
export function getUserInitials(username: string): string {
  if (!username) return 'U';
  
  // 处理中文用户名，取最后一个字符
  if (/[\u4e00-\u9fa5]/.test(username)) {
    return username.charAt(username.length - 1);
  }
  
  // 处理英文用户名，取首字母
  return username.charAt(0).toUpperCase();
}

/**
 * 根据用户名生成默认头像类型
 * @param username 用户名
 * @returns 头像类型标识符
 */
export function generateDefaultAvatar(username: string): string {
  if (!username) return 'initials';
  
  // 根据用户名哈希选择渐变色
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % GRADIENT_AVATARS.length;
  return GRADIENT_AVATARS[index].id;
}

/**
 * 获取头像显示信息
 * @param avatar 头像类型标识符
 * @param username 用户名
 * @returns 头像显示信息
 */
export function getAvatarInfo(avatar: string | null, username: string) {
  // 如果没有设置头像，使用默认生成的头像
  if (!avatar) {
    avatar = generateDefaultAvatar(username);
  }
  
  if (avatar === 'initials') {
    return {
      type: 'initials',
      initials: getUserInitials(username),
      colors: ['#6366f1', '#8b5cf6'] // 默认渐变色
    };
  }
  
  // 查找对应的渐变色配置
  const gradientConfig = GRADIENT_AVATARS.find(g => g.id === avatar);
  if (gradientConfig) {
    return {
      type: 'gradient',
      initials: getUserInitials(username),
      colors: gradientConfig.colors
    };
  }
  
  // 如果是URL（兼容旧数据）
  if (avatar.startsWith('http')) {
    return {
      type: 'url',
      url: avatar
    };
  }
  
  // 默认返回首字母头像
  return {
    type: 'initials',
    initials: getUserInitials(username),
    colors: ['#6366f1', '#8b5cf6']
  };
}

/**
 * 生成头像CSS样式
 * @param avatarInfo 头像信息
 * @returns CSS样式对象
 */
export function getAvatarStyle(avatarInfo: ReturnType<typeof getAvatarInfo>) {
  if (avatarInfo.type === 'url') {
    return {
      backgroundImage: `url(${avatarInfo.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  return {
    background: `linear-gradient(135deg, ${avatarInfo.colors[0]}, ${avatarInfo.colors[1]})`,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };
}