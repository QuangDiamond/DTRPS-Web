import type {
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
  NotificationRules,
  NotificationTab,
} from '../types/admin';

export const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'listings', label: 'Niêm yết & Đối tác' },
  { id: 'users', label: 'Người dùng & Báo cáo' },
  { id: 'system', label: 'Cảnh báo kỹ thuật & AI' },
];

export const NOTIFICATION_PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; dotClass: string }
> = {
  urgent: { label: 'Khẩn cấp', dotClass: 'bg-error' },
  high: { label: 'Cao', dotClass: 'bg-tertiary' },
  normal: { label: 'Bình thường', dotClass: 'bg-primary' },
  low: { label: 'Thấp', dotClass: 'bg-outline' },
};

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['urgent', 'high', 'normal', 'low'];

export const NOTIFICATION_CHANNEL_CONFIG: Record<
  NotificationChannel,
  { label: string; icon: string }
> = {
  app: { label: 'Trong ứng dụng quản trị', icon: 'notifications' },
  email: { label: 'Email', icon: 'mail' },
  telegram: { label: 'Telegram', icon: 'send' },
  sms: { label: 'SMS', icon: 'sms' },
};

export const NOTIFICATION_EVENT_CONFIG: Record<
  NotificationEvent,
  { label: string; description: string; icon: string }
> = {
  newListing: {
    label: 'Hồ sơ niêm yết mới / bổ sung',
    description: 'Khi đối tác gửi hồ sơ mới hoặc tải lên giấy tờ bổ sung',
    icon: 'assignment',
  },
  newPartner: {
    label: 'Đăng ký đối tác mới',
    description: 'Khi doanh nghiệp hoàn tất đăng ký và ký quỹ bảo chứng',
    icon: 'corporate_fare',
  },
  complaint: {
    label: 'Khiếu nại & phản ánh của du khách',
    description: 'Phản ánh sai lệch giá, chất lượng dịch vụ, gian lận',
    icon: 'flag',
  },
  aiLoad: {
    label: 'Tải trọng AI vượt ngưỡng',
    description: 'Theo dõi tần suất yêu cầu AI Planner theo cụm máy chủ',
    icon: 'smart_toy',
  },
  dataSync: {
    label: 'Đồng bộ dữ liệu POI & GPS',
    description: 'Kết quả đồng bộ dữ liệu quốc gia và độ trễ GPS',
    icon: 'sync_saved_locally',
  },
  security: {
    label: 'Bảo mật & tài khoản',
    description: 'Khóa tài khoản, đăng nhập bất thường, vi phạm chính sách',
    icon: 'shield',
  },
};

export const DEFAULT_NOTIFICATION_RULES: NotificationRules = {
  urgentChannelsEnabled: true,
  aiLoadThreshold: 85,
  channels: { app: true, email: true, telegram: true, sms: true },
  events: {
    newListing: true,
    newPartner: true,
    complaint: true,
    aiLoad: true,
    dataSync: true,
    security: true,
  },
};

export const NOTIFICATION_PAGE_SIZE = 7;
export const AI_LOAD_THRESHOLD_RANGE = { min: 50, max: 100, step: 5 };
