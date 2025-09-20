import React from 'react';
import { AvatarGenerator } from './AvatarGenerator';
import { DefaultAvatar } from './DefaultAvatars';

interface AvatarProps {
  username: string;
  avatarType?: string; // 'initials' | 'gradient-1' | 'gradient-2' | etc.
  size?: number;
  className?: string;
}

/**
 * 统一的头像显示组件
 * 根据avatarType决定显示首字母头像还是默认头像
 */
const Avatar: React.FC<AvatarProps> = ({
  username,
  avatarType = 'initials',
  size = 40,
  className = ''
}) => {
  // 如果是首字母头像或者没有指定类型
  if (!avatarType || avatarType === 'initials') {
    return (
      <AvatarGenerator
        username={username}
        size={size}
        className={className}
      />
    );
  }

  // 如果是默认头像
  return (
    <DefaultAvatar
      avatarId={avatarType}
      username={username}
      size={size}
      className={className}
    />
  );
};

export default Avatar;