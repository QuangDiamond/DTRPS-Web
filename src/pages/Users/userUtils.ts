import type { AppUser, UserFilters, UserJoinedRange } from '../../types/admin';
import { toIsoDate } from '../../utils/format';
import { normalizeText } from '../../utils/string';

/** Ngày bắt đầu (ISO) của khoảng "Ngày đăng ký" */
function getJoinedFrom(range: UserJoinedRange, now: Date): string | null {
  const from = new Date(now);
  switch (range) {
    case 'all':
      return null;
    case '30days':
      from.setDate(now.getDate() - 30);
      break;
    case 'quarter':
      from.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      from.setFullYear(now.getFullYear() - 1);
      break;
  }
  return toIsoDate(from);
}

export function filterUsers(users: AppUser[], filters: UserFilters): AppUser[] {
  const keyword = normalizeText(filters.keyword);
  const joinedFrom = getJoinedFrom(filters.joined, new Date());
  // Số điện thoại so khớp không cần dấu cách
  const digits = filters.keyword.replace(/\D/g, '');

  return users.filter((user) => {
    if (filters.status !== 'all' && user.status !== filters.status) return false;
    if (filters.accountType !== 'all' && user.accountType !== filters.accountType) return false;
    if (joinedFrom && user.joinedAt < joinedFrom) return false;
    if (!keyword) return true;
    if (digits.length >= 3 && user.phone.replace(/\D/g, '').includes(digits)) return true;
    return [user.name, user.email, user.id].some((field) => normalizeText(field).includes(keyword));
  });
}
