import { clientRequest } from './http';
import type { Paged } from './types';

/** Gói quảng cáo của đối tác, thanh toán PayOS và địa điểm được quảng cáo */
export interface AdPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  maxPlaces: number;
}

export interface AdSubscription {
  id: number;
  packageName: string;
  price: number;
  maxPlaces: number;
  durationDays: number;
  status: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  usedSlots: number;
}

export type AdPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/** Phiếu sự cố mới nhất của đơn */
export interface AdPaymentIssue {
  id: number;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  resolutionNote: string | null;
}

export interface AdPaymentIssueInput {
  transferredAmount: number;
  transferredAt: string;
  bankReference: string;
  note: string | null;
  receiptUrl: string;
}

export interface AdPayment {
  id: number;
  orderCode: string;
  packageName: string;
  amount: number;
  currency: string;
  type: 'INITIAL' | 'RENEWAL';
  status: AdPaymentStatus;
  checkoutUrl: string | null;
  linkExpiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  issue: AdPaymentIssue | null;
}

export interface AdPartnerState {
  subscription: AdSubscription | null;
  pendingPayment: AdPayment | null;
  /** Đang trong 7 ngày cuối, được gia hạn */
  renewable: boolean;
  eligiblePlaces: number;
}

export interface AdSlotPlace {
  listingId: number;
  placeId: number;
  name: string;
  address: string | null;
  province: string | null;
  coverUrl: string | null;
  eligible: boolean;
  ineligibleReason: string | null;
  selected: boolean;
  suspended: boolean;
  suspendReason: string | null;
}

export interface AdSlots {
  maxPlaces: number;
  places: AdSlotPlace[];
}

export interface FeaturedPlace {
  id: number;
  name: string;
  category: string | null;
  province: string | null;
  coverUrl: string | null;
  rating: number | null;
  reviewCount: number;
}

interface Checkout {
  orderCode: string;
  checkoutUrl: string;
}

const BASE = '/partner';

export const adApi = {
  packages: () => clientRequest<AdPackage[]>(`${BASE}/ad-packages`),
  state: () => clientRequest<AdPartnerState>(`${BASE}/ad-subscription`),
  checkout: (packageId: number) =>
    clientRequest<Checkout>(`${BASE}/ad-subscription/checkout`, {
      method: 'POST',
      body: { packageId },
    }),
  renew: () => clientRequest<Checkout>(`${BASE}/ad-subscription/renew`, { method: 'POST' }),
  payments: (page = 0, size = 10) =>
    clientRequest<Paged<AdPayment>>(`${BASE}/payments?page=${page}&size=${size}`),
  /** Backend tự hỏi lại PayOS, không dựa vào tham số trên URL trả về */
  payment: (orderCode: string) =>
    clientRequest<AdPayment>(`${BASE}/payments/${encodeURIComponent(orderCode)}`),
  cancelPayment: (orderCode: string) =>
    clientRequest<AdPayment>(`${BASE}/payments/${encodeURIComponent(orderCode)}/cancel`, {
      method: 'POST',
    }),
  /** "Tôi đã thanh toán": hỏi lại PayOS ngay */
  checkPayment: (orderCode: string) =>
    clientRequest<AdPayment>(`${BASE}/payments/${encodeURIComponent(orderCode)}/check`, {
      method: 'POST',
    }),
  reportIssue: (orderCode: string, input: AdPaymentIssueInput) =>
    clientRequest<void>(`${BASE}/payments/${encodeURIComponent(orderCode)}/issues`, {
      method: 'POST',
      body: input,
    }),
  slots: () => clientRequest<AdSlots>(`${BASE}/ad-slots`),
  saveSlots: (listingIds: number[]) =>
    clientRequest<AdSlots>(`${BASE}/ad-slots`, { method: 'PUT', body: { listingIds } }),
  /** Công khai: địa điểm được tài trợ ở trang chủ */
  featured: (limit = 8) =>
    clientRequest<FeaturedPlace[]>(`/featured-places?limit=${limit}`, { auth: false }),
};
