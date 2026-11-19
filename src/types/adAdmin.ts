/** Gói quảng cáo & thanh toán của đối tác (admin) */

export type AdPackageStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminAdPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  maxPlaces: number;
  status: AdPackageStatus;
  sortOrder: number;
}

export interface AdPackageInput {
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  maxPlaces: number;
  sortOrder: number;
}

export type AdPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type AdPaymentType = 'INITIAL' | 'RENEWAL';

export interface AdminAdPayment {
  id: number;
  orderCode: string;
  businessId: number;
  businessName: string;
  packageName: string;
  amount: number;
  type: AdPaymentType;
  status: AdPaymentStatus;
  gatewayStatus: string | null;
  bankReference: string | null;
  needsReview: boolean;
  reviewNote: string | null;
  refundReference: string | null;
  refundReason: string | null;
  refundedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface AdPaymentStats {
  revenueThisMonth: number;
  success: number;
  pending: number;
  needsReview: number;
  /** Phiếu sự cố đang chờ xử lý */
  openIssues: number;
}

export type PaymentIssueStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export interface AdminPaymentIssue {
  id: number;
  paymentId: number;
  orderCode: string;
  paymentStatus: AdPaymentStatus;
  businessId: number;
  businessName: string;
  packageName: string;
  /** Số tiền của đơn */
  amount: number;
  /** Số tiền đối tác báo đã chuyển */
  transferredAmount: number;
  transferredAt: string;
  bankReference: string;
  note: string | null;
  receiptUrl: string;
  status: PaymentIssueStatus;
  resolutionNote: string | null;
  handledAt: string | null;
  createdAt: string;
}

export type AdSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface AdminAdSubscription {
  id: number;
  businessId: number;
  businessName: string;
  packageName: string;
  price: number;
  maxPlaces: number;
  usedSlots: number;
  status: AdSubscriptionStatus;
  startDate: string;
  endDate: string;
  daysLeft: number;
  cancelReason: string | null;
  /** Có khi admin kích hoạt tay từ phiếu sự cố (PayOS không ghi nhận) */
  manualActivation: ManualActivation | null;
}

export interface ManualActivation {
  paymentId: number;
  orderCode: string;
  bankReference: string | null;
  issueId: number | null;
  reason: string | null;
  handledBy: string | null;
  activatedAt: string | null;
}

export type AdvertisementStatus = 'PUBLISHED' | 'SUSPENDED' | 'EXPIRED';

export interface AdminAdvertisement {
  id: number;
  placeId: number;
  placeName: string;
  businessId: number;
  businessName: string;
  packageName: string;
  status: AdvertisementStatus;
  suspendReason: string | null;
  startAt: string;
  endAt: string;
}

export interface AdListQuery {
  keyword?: string;
  status?: string;
  type?: string;
  review?: boolean;
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}
