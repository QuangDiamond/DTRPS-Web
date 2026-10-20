/** Quy tắc kiểm tra dữ liệu dùng chung cho mọi form trong hệ thống */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+$/i;
const TAX_CODE_PATTERN = /^\d{10}(\d{3})?$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Số điện thoại Việt Nam: di động 10 số / cố định 11 số (bắt đầu bằng 0 hoặc +84),
 * hoặc tổng đài 1800/1900. Cho phép khoảng trắng, dấu chấm, gạch nối, ngoặc.
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s.()-]/g, '');
  return /^(\+84|0)\d{9,10}$/.test(digits) || /^1[89]00\d{4,6}$/.test(digits);
}

export function isValidUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}

/** Mã số thuế doanh nghiệp: 10 số, hoặc 13 số với chi nhánh */
export function isValidTaxCode(value: string): boolean {
  return TAX_CODE_PATTERN.test(value.trim());
}

export const VALIDATION_MESSAGES = {
  email: 'Email không hợp lệ',
  phone: 'Số điện thoại không hợp lệ (VD: 0905 888 999)',
  url: 'Website phải bắt đầu bằng http:// hoặc https://',
  taxCode: 'Mã số thuế gồm 10 hoặc 13 số',
} as const;
