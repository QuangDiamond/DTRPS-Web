/** Thông báo quản trị */

export type NotificationTab = 'all' | 'listings' | 'users' | 'system';

export type NotificationCategory = Exclude<NotificationTab, 'all'>;

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

export type NotificationChannel = 'app' | 'email' | 'telegram' | 'sms';

export type NotificationEvent =
  'newListing' | 'newPartner' | 'complaint' | 'aiLoad' | 'dataSync' | 'security';

/** Một đoạn nội dung thông báo; strong = in đậm tên đối tượng */
export interface NotificationTextPart {
  text: string;
  strong?: boolean;
  /** Màu nhấn cho số liệu cảnh báo */
  tone?: 'tertiary';
}

export interface NotificationMeta {
  text: string;
  icon?: string;
}

export interface NotificationAction {
  label: string;
  icon?: string;
  variant: 'primary' | 'tertiary' | 'neutral';
  /** Đường dẫn trang xử lý */
  to: string;
}

export interface AdminNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  tag: { label: string; className: string; icon?: string };
  icon: string;
  /** Màu nền + màu chữ ô icon */
  iconBoxClass: string;
  /** Màu chấm chưa đọc */
  dotClass: string;
  message: NotificationTextPart[];
  meta: NotificationMeta[];
  action: NotificationAction;
  /** ISO datetime */
  createdAt: string;
  read: boolean;
}

export interface NotificationRules {
  /** Banner "Kênh tiếp nhận cảnh báo khẩn (Telegram & SMS)" */
  urgentChannelsEnabled: boolean;
  /** Ngưỡng tải AI (%) để gửi cảnh báo khẩn */
  aiLoadThreshold: number;
  channels: Record<NotificationChannel, boolean>;
  events: Record<NotificationEvent, boolean>;
}

export interface NotificationStats {
  unread: number;
  newLastHour: number;
  systemAlerts: number;
  systemAlertNote: string;
  resolvedRate: number;
  avgResponseMinutes: number;
  byTab: Record<NotificationTab, number>;
}
