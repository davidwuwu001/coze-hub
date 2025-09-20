/**
 * URL检测和处理工具函数
 */

/**
 * 检测文本中的URL链接
 * @param text 要检测的文本
 * @returns 是否包含URL
 */
export const containsUrl = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return urlRegex.test(text);
};

/**
 * 提取文本中的所有URL
 * @param text 要提取的文本
 * @returns URL数组
 */
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex) || [];
};

/**
 * 将文本中的URL转换为可点击的链接
 * @param text 原始文本
 * @returns 包含链接的JSX元素数组
 */
export const convertUrlsToLinks = (text: string): (string | JSX.Element)[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-all duration-200 font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            window.open(part, '_blank', 'noopener,noreferrer');
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>{part}</span>
        </a>
      );
    }
    return part;
  });
};

/**
 * 在新标签页打开URL
 * @param url 要打开的URL
 */
export const openUrlInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * 验证URL格式是否正确
 * @param url 要验证的URL
 * @returns 是否为有效URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 格式化显示URL（截断过长的URL）
 * @param url 原始URL
 * @param maxLength 最大显示长度
 * @returns 格式化后的URL
 */
export const formatUrlForDisplay = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) {
    return url;
  }
  return url.substring(0, maxLength - 3) + '...';
};