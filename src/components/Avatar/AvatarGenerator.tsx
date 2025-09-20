import React from 'react';

interface AvatarGeneratorProps {
  username: string;
  size?: number;
  className?: string;
}

/**
 * 用户名首字母头像生成组件
 * 根据用户名生成彩色的首字母头像
 */
export const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({
  username,
  size = 40,
  className = ''
}) => {
  /**
   * 根据字符串生成一致的颜色
   * @param str 输入字符串
   * @returns HSL颜色值
   */
  const generateColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 生成饱和度较高、亮度适中的颜色
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  /**
   * 获取用户名的首字母
   * 支持中文和英文
   * @param name 用户名
   * @returns 首字母（大写）
   */
  const getInitials = (name: string): string => {
    if (!name) return '?';
    
    // 去除空格并取第一个字符
    const cleanName = name.trim();
    if (cleanName.length === 0) return '?';
    
    // 如果是中文，直接取第一个字符
    // 如果是英文，取第一个字母并转为大写
    const firstChar = cleanName.charAt(0);
    return /[\u4e00-\u9fa5]/.test(firstChar) ? firstChar : firstChar.toUpperCase();
  };

  const initials = getInitials(username);
  const backgroundColor = generateColor(username);
  
  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor,
    fontSize: `${size * 0.4}px`,
    lineHeight: `${size}px`
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium select-none ${className}`}
      style={avatarStyle}
      title={username}
    >
      {initials}
    </div>
  );
};

export default AvatarGenerator;