/** Gói quảng cáo & thanh toán của đối tác (admin) — API thật */
import type {
  AdListQuery,
  AdminAdPackage,
  AdminAdPayment,
  AdminAdSubscription,
  AdminAdvertisement,
  AdPackageInput,
  AdPackageStatus,
  AdPaymentStats,
  Paged,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

const query = ({ keyword, status, type, review, page, size }: AdListQuery) => ({
  page,
  size,
  keyword: keyword?.trim() || undefined,
  status: status && status !== 'all' ? status : undefined,
  type: type && type !== 'all' ? type : undefined,
  review: review || undefined,
});

export const adAdminService = {
  packages: () => apiRequest<AdminAdPackage[]>(ENDPOINTS.ads.packages),
  createPackage: (input: AdPackageInput) =>
    apiRequest<AdminAdPackage>(ENDPOINTS.ads.packages, { method: 'POST', body: input }),
  updatePackage: (id: number, input: AdPackageInput) =>
    apiRequest<AdminAdPackage>(ENDPOINTS.ads.package(id), { method: 'PUT', body: input }),
  changePackageStatus: (id: number, status: AdPackageStatus) =>
    apiRequest<AdminAdPackage>(ENDPOINTS.ads.packageStatus(id), {
      method: 'PUT',
      body: { status },
    }),

  paymentStats: () => apiRequest<AdPaymentStats>(ENDPOINTS.ads.paymentStats),
  payments: (params: AdListQuery) =>
    apiRequest<Paged<AdminAdPayment>>(ENDPOINTS.ads.payments, { query: query(params) }),
  reconcile: (id: number) =>
    apiRequest<AdminAdPayment>(ENDPOINTS.ads.reconcile(id), { method: 'POST' }),
  refund: (id: number, reason: string, reference: string) =>
    apiRequest<AdminAdPayment>(ENDPOINTS.ads.refund(id), {
      method: 'POST',
      body: { reason, reference },
    }),

  subscriptions: (params: AdListQuery) =>
    apiRequest<Paged<AdminAdSubscription>>(ENDPOINTS.ads.subscriptions, { query: query(params) }),
  cancelSubscription: (id: number, reason: string) =>
    apiRequest<void>(ENDPOINTS.ads.cancelSubscription(id), { method: 'POST', body: { reason } }),

  advertisements: (params: AdListQuery) =>
    apiRequest<Paged<AdminAdvertisement>>(ENDPOINTS.ads.advertisements, { query: query(params) }),
  changeAdStatus: (id: number, status: 'PUBLISHED' | 'SUSPENDED', reason: string) =>
    apiRequest<AdminAdvertisement>(ENDPOINTS.ads.advertisementStatus(id), {
      method: 'PUT',
      body: { status, reason },
    }),
};
