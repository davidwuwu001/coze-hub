import { LucideIcon } from 'lucide-react';

/**
 * 功能卡片数据接口
 * 定义每个功能卡片的基本信息
 */
export interface FeatureCardData {
  /** 卡片唯一标识符 */
  id: string;
  /** 功能名称 */
  name: string;
  /** 功能描述 */
  desc: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 图标名称（用于序列化存储） */
  iconName: string;
  /** 背景颜色类名 */
  bgColor: string;
  /** 排序权重 */
  order: number;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 卡片配置管理接口
 * 用于后台管理系统的数据操作
 */
export interface CardConfig {
  /** 所有卡片数据 */
  cards: FeatureCardData[];
  /** 配置版本号 */
  version: string;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * 图标选项接口
 * 用于图标选择器组件
 */
export interface IconOption {
  /** 图标名称 */
  name: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 显示标签 */
  label: string;
  /** 分类 */
  category: string;
}

/**
 * 卡片操作类型枚举
 */
export enum CardActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  REORDER = 'REORDER',
  TOGGLE = 'TOGGLE'
}

/**
 * 卡片操作接口
 */
export interface CardAction {
  type: CardActionType;
  payload: any;
  timestamp: string;
}

/**
 * 管理页面状态接口
 */
export interface AdminPageState {
  /** 是否正在编辑 */
  isEditing: boolean;
  /** 当前编辑的卡片ID */
  editingCardId: string | null;
  /** 是否显示添加卡片对话框 */
  showAddDialog: boolean;
  /** 是否显示图标选择器 */
  showIconPicker: boolean;
  /** 搜索关键词 */
  searchKeyword: string;
  /** 选中的卡片IDs */
  selectedCardIds: string[];
}

/**
 * 拖拽项目接口
 */
export interface DragItem {
  id: string;
  index: number;
  type: string;
}

/**
 * 颜色选项接口
 */
export interface ColorOption {
  name: string;
  value: string;
  label: string;
  preview: string;
}