import type { AuthBrandContent, PasswordRule } from '../types/auth';

export const OTP_LENGTH = 6;
/** Mã OTP hết hạn sau 5 phút */
export const OTP_TTL_SECONDS = 300;
export const MAX_OTP_ATTEMPTS = 5;

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Tối thiểu 8 ký tự', test: (value) => value.length >= 8 },
  { id: 'upper', label: 'Có chữ in hoa (A-Z)', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Có chữ số (0-9)', test: (value) => /\d/.test(value) },
  {
    id: 'special',
    label: 'Có ký tự đặc biệt (!@#...)',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const STATUS_TEXT = 'Cơ sở hạ tầng v3.8.4 hoạt động ổn định';

export const LOGIN_BRAND_CONTENT: AuthBrandContent = {
  statusText: STATUS_TEXT,
  title: 'Hệ thống Điều hành & Quản lý Toàn diện',
  description:
    'Kiến trúc điều phối thông minh trung tâm du lịch Việt Nam, trao quyền kiểm soát và phân tích thời gian thực cho ban quản trị chuyên trách.',
  features: [
    {
      icon: 'security',
      title: 'Bảo mật đa tầng & Mã hoá Zero-Trust',
      description: 'Xác thực chứng chỉ phần cứng, ghi log hoạt động chống xâm nhập thời gian thực.',
    },
    {
      icon: 'insights',
      title: 'Quản lý Dữ liệu Thời gian Thực',
      description:
        'Đồng bộ luồng khách du lịch quốc tế, tỷ lệ phủ buồng và giao dịch tại 63 tỉnh thành.',
    },
    {
      icon: 'verified',
      title: 'Duyệt đối tác & Niêm yết tự động',
      description:
        'Quy trình thẩm định khách sạn, đơn vị lữ hành và trải nghiệm ứng dụng AI phân loại.',
    },
  ],
};

export const RECOVERY_BRAND_CONTENT: AuthBrandContent = {
  statusText: STATUS_TEXT,
  title: 'Bảo mật & Khôi phục Tài khoản Quản trị',
  description:
    'Quy trình xác thực đa lớp và mã hóa an toàn bảo vệ quyền điều phối hệ thống du lịch thông minh toàn quốc.',
  features: [
    {
      icon: 'pin',
      title: 'Mã OTP 6 số bảo mật cao',
      description: 'Thời hạn hiệu lực ngắn, tự động vô hiệu hóa sau 5 phút',
    },
    {
      icon: 'lock_clock',
      title: 'Khóa tạm thời khi nhập sai quá 5 lần',
      description: 'Bảo vệ tài khoản quản trị trước nguy cơ dò mã',
    },
    {
      icon: 'shield_person',
      title: 'Xác thực 2 yếu tố (2FA / Zero-Trust)',
      description: 'Đảm bảo chỉ đúng chủ tài khoản được cấp quyền truy cập',
    },
  ],
};
