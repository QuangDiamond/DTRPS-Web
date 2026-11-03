/** Kiểm tra dữ liệu nhập phía client — khớp với ràng buộc của backend */

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Giống PasswordPolicy của backend: 8–72 ký tự, có chữ hoa, chữ thường và số */
export const isValidPassword = (value: string): boolean =>
  value.length >= 8 &&
  value.length <= 72 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value);

export const PASSWORD_HINT = 'Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số';

/** Số điện thoại: 8–15 chữ số, có thể bắt đầu bằng + (bỏ qua dấu cách) */
export const normalizePhone = (value: string): string => value.replace(/\s+/g, '');
export const isValidPhone = (value: string): boolean =>
  /^\+?[0-9]{8,15}$/.test(normalizePhone(value));

/** Mã số thuế: 10 số, hoặc 10 số kèm mã chi nhánh dạng -001 */
export const isValidTaxCode = (value: string): boolean =>
  /^[0-9]{10}(-[0-9]{3})?$/.test(value.trim());
