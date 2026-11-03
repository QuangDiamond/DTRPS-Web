/** Quản lý người dùng (admin) — luôn gọi API thật /admin/users */
import type {
  AdminUser,
  AdminUserQuery,
  AdminUserRole,
  AdminUserStats,
  AdminUserStatus,
  Paged,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  createdAt: string | null;
  statusNote: string | null;
}

interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

function toUser(user: ApiUser): AdminUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl,
    status: user.status.toLowerCase() as AdminUserStatus,
    roles: user.roles.map((role) => role.toLowerCase() as AdminUserRole),
    createdAt: user.createdAt,
    statusNote: user.statusNote,
  };
}

function query(params: AdminUserQuery): string {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  if (params.keyword?.trim()) search.set('keyword', params.keyword.trim());
  if (params.role && params.role !== 'all') search.set('role', params.role.toUpperCase());
  if (params.status && params.status !== 'all') search.set('status', params.status.toUpperCase());
  return search.toString();
}

export const adminUserService = {
  list: async (params: AdminUserQuery): Promise<Paged<AdminUser>> => {
    const page = await apiRequest<ApiPage<ApiUser>>(
      `${ENDPOINTS.adminUsers.list}?${query(params)}`,
    );
    return { ...page, items: page.items.map(toUser) };
  },

  stats: () => apiRequest<AdminUserStats>(ENDPOINTS.adminUsers.stats),

  get: async (userId: string) =>
    toUser(await apiRequest<ApiUser>(ENDPOINTS.adminUsers.detail(userId))),

  /** Khóa (kèm lý do) hoặc mở khóa tài khoản */
  setStatus: async (userId: string, status: AdminUserStatus, reason?: string) =>
    toUser(
      await apiRequest<ApiUser>(ENDPOINTS.adminUsers.status(userId), {
        method: 'PUT',
        body: { status: status.toUpperCase(), reason: reason?.trim() || undefined },
      }),
    ),
};
