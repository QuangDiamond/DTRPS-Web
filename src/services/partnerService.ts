/**
 * Đối tác = hồ sơ doanh nghiệp. Luôn gọi API thật (/api/admin/business-profiles), không có dữ liệu mẫu.
 */
import type { Partner, PartnerPage, PartnerStats, PartnerStatus } from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

type ApiStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

/** Dạng dữ liệu backend trả về (BusinessProfileResponse) */
interface ApiBusinessProfile {
  id: number;
  userId: number;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  taxCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: ApiStatus;
  statusNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const FROM_API: Record<ApiStatus, PartnerStatus> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'rejected',
};

const TO_API: Record<PartnerStatus, ApiStatus> = {
  pending: 'PENDING',
  active: 'ACTIVE',
  suspended: 'SUSPENDED',
  rejected: 'INACTIVE',
};

function toPartner(profile: ApiBusinessProfile): Partner {
  return {
    id: String(profile.id),
    name: profile.businessName,
    taxCode: profile.taxCode ?? '',
    email: profile.contactEmail ?? '',
    phone: profile.contactPhone ?? '',
    ownerId: String(profile.userId),
    ownerName: profile.ownerName,
    ownerEmail: profile.ownerEmail,
    status: FROM_API[profile.status],
    statusNote: profile.statusNote ?? undefined,
    joinedAt: profile.createdAt,
    approvedAt: profile.approvedAt ?? undefined,
    updatedAt: profile.updatedAt,
  };
}

export interface PartnerQuery {
  status: PartnerStatus | 'all';
  keyword: string;
  /** Trang bắt đầu từ 0 */
  page: number;
  size: number;
}

export const partnerService = {
  /** Danh sách có phân trang, mới nhất trước */
  list: async (query: PartnerQuery): Promise<PartnerPage> => {
    const result = await apiRequest<ApiPage<ApiBusinessProfile>>(ENDPOINTS.partners.list, {
      query: {
        status: query.status === 'all' ? undefined : TO_API[query.status],
        keyword: query.keyword.trim() || undefined,
        page: query.page,
        size: query.size,
      },
    });
    return { ...result, items: result.items.map(toPartner) };
  },

  stats: () => apiRequest<PartnerStats>(ENDPOINTS.partners.stats),

  get: async (id: string): Promise<Partner> =>
    toPartner(await apiRequest<ApiBusinessProfile>(ENDPOINTS.partners.detail(id))),

  /** PENDING → ACTIVE, cấp vai trò BUSINESS_OWNER */
  approve: async (id: string): Promise<Partner> =>
    toPartner(
      await apiRequest<ApiBusinessProfile>(ENDPOINTS.partners.approve(id), { method: 'POST' }),
    ),

  /** PENDING → INACTIVE (bị từ chối), lý do hiển thị cho đối tác */
  reject: async (id: string, reason: string): Promise<Partner> =>
    toPartner(
      await apiRequest<ApiBusinessProfile>(ENDPOINTS.partners.reject(id), {
        method: 'POST',
        body: { reason },
      }),
    ),

  /** ACTIVE → SUSPENDED (cần lý do) */
  lock: async (id: string, reason: string): Promise<Partner> =>
    toPartner(
      await apiRequest<ApiBusinessProfile>(ENDPOINTS.partners.status(id), {
        method: 'PUT',
        body: { status: 'SUSPENDED', reason },
      }),
    ),

  /** SUSPENDED → ACTIVE */
  unlock: async (id: string): Promise<Partner> =>
    toPartner(
      await apiRequest<ApiBusinessProfile>(ENDPOINTS.partners.status(id), {
        method: 'PUT',
        body: { status: 'ACTIVE' },
      }),
    ),
};
