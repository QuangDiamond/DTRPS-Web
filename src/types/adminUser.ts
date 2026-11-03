/** Tài khoản người dùng trên trang admin (bảng users) — dữ liệu thật */
export type AdminUserStatus = 'active' | 'suspended';

/** Vai trò trong hệ thống: du khách, chủ doanh nghiệp (đối tác), quản trị viên */
export type AdminUserRole = 'traveller' | 'business_owner' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  status: AdminUserStatus;
  roles: AdminUserRole[];
  createdAt: string | null;
  /** Lý do khóa (chỉ admin thấy) khi đang bị khóa */
  statusNote: string | null;
}

export interface AdminUserStats {
  total: number;
  active: number;
  suspended: number;
  travellers: number;
  businessOwners: number;
  admins: number;
  newThisMonth: number;
}

export interface AdminUserQuery {
  keyword?: string;
  role?: AdminUserRole | 'all';
  status?: AdminUserStatus | 'all';
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}
