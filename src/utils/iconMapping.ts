import {
  Mic,
  Image,
  FileText,
  Monitor,
  BarChart3,
  Hash,
  User,
  Video,
  BookOpen,
  MessageCircle,
  Volume2,
  TrendingUp,
  Newspaper,
  Target,
  Settings,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Home,
  Search,
  Bell,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  Share,
  Download,
  Upload,
  Camera,
  Music,
  Play,
  Pause,
  Stop,
  LucideIcon
} from 'lucide-react';
import { IconOption } from '../types';

/**
 * 图标名称到组件的映射表
 * 用于从字符串名称获取对应的图标组件
 */
export const iconMap: Record<string, LucideIcon> = {
  // 媒体相关
  Mic,
  Image,
  Video,
  Camera,
  Music,
  Volume2,
  Play,
  Pause,
  Stop,
  
  // 文档相关
  FileText,
  BookOpen,
  Newspaper,
  Edit,
  
  // 社交相关
  MessageCircle,
  Share,
  ThumbsUp,
  Heart,
  Star,
  
  // 分析相关
  BarChart3,
  TrendingUp,
  Target,
  Monitor,
  
  // 用户相关
  User,
  Settings,
  
  // 操作相关
  Plus,
  Trash2,
  Save,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  
  // 导航相关
  Home,
  Search,
  
  // 通讯相关
  Bell,
  Mail,
  Phone,
  
  // 时间相关
  Calendar,
  Clock,
  
  // 文件操作
  Download,
  Upload,
  
  // 其他
  Hash
};

/**
 * 获取图标组件
 * @param iconName 图标名称
 * @returns 对应的图标组件，如果不存在则返回默认图标
 */
export const getIconByName = (iconName: string): LucideIcon => {
  return iconMap[iconName] || FileText;
};

/**
 * 获取所有可用的图标选项
 * @returns 图标选项数组，按分类组织
 */
export const getAvailableIcons = (): IconOption[] => {
  return [
    // 媒体类
    { name: 'Mic', icon: Mic, label: '麦克风', category: '媒体' },
    { name: 'Image', icon: Image, label: '图片', category: '媒体' },
    { name: 'Video', icon: Video, label: '视频', category: '媒体' },
    { name: 'Camera', icon: Camera, label: '相机', category: '媒体' },
    { name: 'Music', icon: Music, label: '音乐', category: '媒体' },
    { name: 'Volume2', icon: Volume2, label: '音量', category: '媒体' },
    { name: 'Play', icon: Play, label: '播放', category: '媒体' },
    
    // 文档类
    { name: 'FileText', icon: FileText, label: '文档', category: '文档' },
    { name: 'BookOpen', icon: BookOpen, label: '书籍', category: '文档' },
    { name: 'Newspaper', icon: Newspaper, label: '新闻', category: '文档' },
    { name: 'Edit', icon: Edit, label: '编辑', category: '文档' },
    
    // 社交类
    { name: 'MessageCircle', icon: MessageCircle, label: '消息', category: '社交' },
    { name: 'Share', icon: Share, label: '分享', category: '社交' },
    { name: 'ThumbsUp', icon: ThumbsUp, label: '点赞', category: '社交' },
    { name: 'Heart', icon: Heart, label: '喜欢', category: '社交' },
    { name: 'Star', icon: Star, label: '收藏', category: '社交' },
    
    // 分析类
    { name: 'BarChart3', icon: BarChart3, label: '图表', category: '分析' },
    { name: 'TrendingUp', icon: TrendingUp, label: '趋势', category: '分析' },
    { name: 'Target', icon: Target, label: '目标', category: '分析' },
    { name: 'Monitor', icon: Monitor, label: '监控', category: '分析' },
    
    // 用户类
    { name: 'User', icon: User, label: '用户', category: '用户' },
    { name: 'Settings', icon: Settings, label: '设置', category: '用户' },
    
    // 导航类
    { name: 'Home', icon: Home, label: '首页', category: '导航' },
    { name: 'Search', icon: Search, label: '搜索', category: '导航' },
    
    // 通讯类
    { name: 'Bell', icon: Bell, label: '通知', category: '通讯' },
    { name: 'Mail', icon: Mail, label: '邮件', category: '通讯' },
    { name: 'Phone', icon: Phone, label: '电话', category: '通讯' },
    
    // 时间类
    { name: 'Calendar', icon: Calendar, label: '日历', category: '时间' },
    { name: 'Clock', icon: Clock, label: '时钟', category: '时间' },
    
    // 文件操作
    { name: 'Download', icon: Download, label: '下载', category: '文件' },
    { name: 'Upload', icon: Upload, label: '上传', category: '文件' },
    
    // 其他
    { name: 'Hash', icon: Hash, label: '标签', category: '其他' }
  ];
};

/**
 * 根据分类获取图标
 * @param category 分类名称
 * @returns 该分类下的所有图标选项
 */
export const getIconsByCategory = (category: string): IconOption[] => {
  return getAvailableIcons().filter(icon => icon.category === category);
};

/**
 * 获取所有图标分类
 * @returns 分类名称数组
 */
export const getIconCategories = (): string[] => {
  const categories = getAvailableIcons().map(icon => icon.category);
  return Array.from(new Set(categories));
};