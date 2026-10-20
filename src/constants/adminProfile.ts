import type {
  AdminAccountDetails,
  AdminActivity,
  AdminSession,
  AdminSessionStatus,
  SecurityKey,
} from '../types/admin';

const daysAgoAt = (days: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

/** IP + vị trí giả lập của phiên hiện tại — khi có backend lấy từ server */
export const CURRENT_SESSION_NETWORK = { ip: '118.70.12.84', location: 'Đà Nẵng, Việt Nam' };

export const MOCK_ADMIN_DETAILS: AdminAccountDetails = {
  id: 'ADM-VN-001',
  fullName: 'Nguyễn Hoàng Nam',
  socAlertEmail: 'nam.nguyen@smarttravel.vn',
  hotline: '0905 888 999',
  jobTitle: 'Giám đốc Điều hành Kỹ thuật & Vận hành Nền tảng',
  department: 'Trung tâm Vận hành Quốc gia Smart Travel (Đà Nẵng & Hà Nội)',
  passwordChangedAt: daysAgoAt(21, 9, 0),
  totpEnabledAt: '2024-01-12T08:00:00+07:00',
  backupCodes: [
    '4821-7735',
    '9013-2268',
    '5547-0912',
    '3376-8841',
    '7702-1459',
    '6185-3307',
    '2294-6670',
    '8839-5126',
  ],
};

/** Các phiên trước phiên hiện tại (phiên hiện tại được tạo khi đăng nhập) */
export const MOCK_PAST_SESSIONS: AdminSession[] = [
  {
    id: 'SES-0418',
    device: 'Safari trên iPhone 15 Pro',
    icon: 'phone_iphone',
    ip: '14.162.190.11',
    location: 'Hà Nội, Việt Nam',
    signedInAt: daysAgoAt(1, 21, 4),
    status: 'expired',
  },
  {
    id: 'SES-0412',
    device: 'Safari trên MacBook Air M2',
    icon: 'laptop_mac',
    ip: '118.70.12.84',
    location: 'Đà Nẵng, Việt Nam',
    signedInAt: daysAgoAt(4, 9, 30),
    status: 'closed',
  },
  {
    id: 'SES-0397',
    device: 'Firefox trên Windows 11 Workstation',
    icon: 'desktop_windows',
    ip: '125.235.4.19',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    signedInAt: daysAgoAt(7, 16, 12),
    status: 'closed',
  },
  {
    id: 'SES-0385',
    device: 'Smart Travel Admin App (iOS)',
    icon: 'phone_iphone',
    ip: '118.70.12.84',
    location: 'Đà Nẵng, Việt Nam',
    signedInAt: daysAgoAt(9, 11, 45),
    status: 'closed',
  },
];

export const SESSION_STATUS_LABELS: Record<AdminSessionStatus, string> = {
  current: 'Phiên này',
  expired: 'Hết hạn',
  closed: 'Đã đóng',
  revoked: 'Đã thu hồi',
};

export const MOCK_SECURITY_KEYS: SecurityKey[] = [
  {
    id: 'KEY-01',
    name: 'YubiKey 5 NFC',
    serial: 'YBK-992-814',
    addedAt: '2024-01-12T08:30:00+07:00',
  },
];

export const MAX_SECURITY_KEYS = 5;
/** Khuyến nghị đổi mật khẩu định kỳ (ISO 27001) */
export const PASSWORD_ROTATION_DAYS = 60;
/** Mã TOTP demo cho bước xác minh cấu hình lại 2FA */
export const MOCK_TOTP_CODE = '842915';
export const MOCK_TOTP_SECRET = 'JBSW Y3DP EHPK 3PXP STVN ADM1';

export const MOCK_ADMIN_ACTIVITIES: AdminActivity[] = [
  {
    id: 'ACT-9005',
    icon: 'verified',
    title: 'Phê duyệt niêm yết',
    detail: 'Duyệt hồ sơ Hoi An Garden Homestay (POI-94812)',
    createdAt: daysAgoAt(0, 9, 12),
    ip: '118.70.12.84',
  },
  {
    id: 'ACT-9004',
    icon: 'block',
    title: 'Khóa tài khoản người dùng',
    detail: 'Tạm khóa USR-5401 do vi phạm chính sách đặt phòng ảo (#AUD-00921-SEC)',
    createdAt: daysAgoAt(2, 15, 40),
    ip: '118.70.12.84',
  },
  {
    id: 'ACT-9003',
    icon: 'settings',
    title: 'Cập nhật cấu hình hệ thống',
    detail: 'Điều chỉnh tần suất đồng bộ bản đồ quốc gia sang mỗi 6 tiếng',
    createdAt: daysAgoAt(4, 10, 5),
    ip: '118.70.12.84',
  },
  {
    id: 'ACT-9002',
    icon: 'login',
    title: 'Đăng nhập từ thiết bị mới',
    detail: 'Firefox trên Windows 11 Workstation • TP. Hồ Chí Minh',
    createdAt: daysAgoAt(7, 16, 12),
    ip: '125.235.4.19',
  },
];

export const ADMIN_PERMISSION_SUMMARY: {
  icon: string;
  title: string;
  level: string;
  description: string;
  tone: 'primary' | 'tertiary';
}[] = [
  {
    icon: 'group',
    title: 'Quản lý người dùng',
    level: 'Full Control',
    description: 'Tạo lập, phân quyền, khóa tài khoản và kiểm toán dữ liệu',
    tone: 'primary',
  },
  {
    icon: 'store_mall_directory',
    title: 'Đối tác & Niêm yết',
    level: 'Toàn quyền duyệt/hủy',
    description: 'Phê duyệt đối tác du lịch, khách sạn và điểm đến toàn quốc',
    tone: 'primary',
  },
  {
    icon: 'analytics',
    title: 'Báo cáo tài chính & KPI',
    level: 'Toàn quyền xuất',
    description: 'Truy xuất doanh thu đặt chỗ, hoa hồng và tăng trưởng người dùng',
    tone: 'primary',
  },
  {
    icon: 'neurology',
    title: 'Cấu hình hệ thống & AI',
    level: 'Master Access',
    description: 'Điều chỉnh thuật toán gợi ý hành trình AI và API Keys Gateway',
    tone: 'tertiary',
  },
];
