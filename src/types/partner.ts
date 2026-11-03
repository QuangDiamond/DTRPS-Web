/** Đối tác (Partners) — hồ sơ doanh nghiệp lấy từ API /admin/business-profiles */

/** Loại hình = nhóm địa điểm: Lưu trú / Ẩm thực / Vui chơi & Tham quan / Mua sắm & Đặc sản (dùng cho niêm yết) */
export type PartnerType = 'hotel' | 'fnb' | 'attraction' | 'shopping';

export type ProvinceCode =
  'quangnam' | 'danang' | 'hanoi' | 'hcm' | 'kiengiang' | 'ninhbinh' | 'quangngai' | 'thanhhoa';

/** Trạng thái địa điểm duy nhất của đối tác (mỗi đối tác chỉ đăng ký 1 địa điểm) */
export type PartnerPlaceStatus = 'none' | 'pending' | 'approved' | 'hidden' | 'rejected';

/**
 * Trạng thái hồ sơ đối tác. Backend: PENDING / ACTIVE / SUSPENDED / INACTIVE (= bị từ chối).
 * pending → (duyệt) active ⇄ (khóa / mở khóa) suspended ; pending → (từ chối) rejected → (đối tác sửa) pending
 */
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Partner {
  /** Mã hồ sơ doanh nghiệp (business_id) */
  id: string;
  /** Tên doanh nghiệp */
  name: string;
  taxCode: string;
  /** Email liên hệ của doanh nghiệp */
  email: string;
  /** Số điện thoại liên hệ */
  phone: string;
  /** Tài khoản đã đăng ký hồ sơ (người đại diện) */
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: PartnerStatus;
  /** Lý do admin đưa ra khi từ chối hoặc khóa */
  statusNote?: string;
  /** ISO datetime — ngày gửi hồ sơ */
  joinedAt: string;
  /** ISO datetime — ngày được duyệt */
  approvedAt?: string;
  /** ISO datetime */
  updatedAt: string;
}

export interface PartnerFilters {
  keyword: string;
  status: PartnerStatus | 'all';
}

/** Số liệu toàn hệ thống (GET /admin/business-profiles/stats) */
export interface PartnerStats {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  rejected: number;
  newThisMonth: number;
}

export interface PartnerPage {
  items: Partner[];
  total: number;
  /** Trang hiện tại, bắt đầu từ 0 */
  page: number;
  size: number;
}
