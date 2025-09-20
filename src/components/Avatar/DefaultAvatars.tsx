import React from 'react';

// 默认头像配置
export const DEFAULT_AVATARS = [
  {
    id: 'gradient-1',
    name: '渐变蓝',
    style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-2', 
    name: '渐变橙',
    style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'gradient-3',
    name: '渐变绿',
    style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'gradient-4',
    name: '渐变紫',
    style: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'gradient-5',
    name: '渐变红',
    style: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  {
    id: 'gradient-6',
    name: '渐变黄',
    style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  }
];

interface DefaultAvatarProps {
  avatarId: string;
  username: string;
  size?: number;
  className?: string;
}

/**
 * 默认头像组件
 * 显示预设的渐变色头像
 */
export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  avatarId,
  username,
  size = 40,
  className = ''
}) => {
  const avatar = DEFAULT_AVATARS.find(a => a.id === avatarId);
  
  if (!avatar) {
    // 如果找不到对应的头像，返回首字母头像
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gray-500 text-white font-medium select-none ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size * 0.4}px`,
          lineHeight: `${size}px`
        }}
      >
        {username.charAt(0).toUpperCase()}
      </div>
    );
  }

  /**
   * 获取用户名的首字母
   */
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const cleanName = name.trim();
    if (cleanName.length === 0) return '?';
    const firstChar = cleanName.charAt(0);
    return /[\u4e00-\u9fa5]/.test(firstChar) ? firstChar : firstChar.toUpperCase();
  };

  const initials = getInitials(username);
  
  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    background: avatar.style,
    fontSize: `${size * 0.4}px`,
    lineHeight: `${size}px`
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium select-none ${className}`}
      style={avatarStyle}
      title={`${username} - ${avatar.name}`}
    >
      {initials}
    </div>
  );
};

interface AvatarSelectorProps {
  username: string;
  selectedAvatarId?: string;
  onSelect: (avatarId: string) => void;
  size?: number;
}

/**
 * 头像选择器组件
 * 让用户选择默认头像或使用首字母头像
 */
export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  username,
  selectedAvatarId,
  onSelect,
  size = 50
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">选择头像</h3>
      
      <div className="grid grid-cols-4 gap-3">
        {/* 首字母头像选项 */}
        <button
          type="button"
          onClick={() => onSelect('initials')}
          className={`p-2 rounded-lg border-2 transition-colors ${
            selectedAvatarId === 'initials' || !selectedAvatarId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div
            className="inline-flex items-center justify-center rounded-full text-white font-medium mx-auto"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: generateInitialsColor(username),
              fontSize: `${size * 0.4}px`,
              lineHeight: `${size}px`
            }}
          >
            {getInitials(username)}
          </div>
          <p className="text-xs text-gray-600 mt-1">首字母</p>
        </button>

        {/* 默认头像选项 */}
        {DEFAULT_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`p-2 rounded-lg border-2 transition-colors ${
              selectedAvatarId === avatar.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className="inline-flex items-center justify-center rounded-full text-white font-medium mx-auto"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: avatar.style,
                fontSize: `${size * 0.4}px`,
                lineHeight: `${size}px`
              }}
            >
              {getInitials(username)}
            </div>
            <p className="text-xs text-gray-600 mt-1">{avatar.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// 辅助函数
function generateInitialsColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20);
  const lightness = 45 + (Math.abs(hash) % 15);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getInitials(name: string): string {
  if (!name) return '?';
  const cleanName = name.trim();
  if (cleanName.length === 0) return '?';
  const firstChar = cleanName.charAt(0);
  return /[\u4e00-\u9fa5]/.test(firstChar) ? firstChar : firstChar.toUpperCase();
}

export default AvatarSelector;