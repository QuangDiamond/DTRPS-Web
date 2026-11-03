import type { BusinessProfile, BusinessProfileStatus } from '@/client/api/types';
import type { BadgeTone } from '@/client/ui/Blocks';

export const PROFILE_STATUS: Record<BusinessProfileStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ duyệt', tone: 'pending' },
  ACTIVE: { label: 'Đang hoạt động', tone: 'approved' },
  INACTIVE: { label: 'Bị từ chối', tone: 'rejected' },
  SUSPENDED: { label: 'Tạm khóa', tone: 'locked' },
};

/** Mã hồ sơ hiển thị, ví dụ BO-0012 */
export const profileCode = (profile: BusinessProfile): string =>
  `BO-${String(profile.id).padStart(4, '0')}`;

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
