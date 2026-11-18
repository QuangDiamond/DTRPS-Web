import type {
  AdPaymentStatus,
  AdSubscriptionStatus,
  AdvertisementStatus,
  PaymentIssueStatus,
} from '@/types';
import { formatNumber } from '@/utils/format';

export const AD_TABS = [
  'payments',
  'issues',
  'subscriptions',
  'advertisements',
  'packages',
] as const;
export type AdTab = (typeof AD_TABS)[number];

export const isAdTab = (value: string | null): value is AdTab =>
  AD_TABS.some((tab) => tab === value);

export const AD_TAB_ICONS: Record<AdTab, string> = {
  payments: 'receipt_long',
  issues: 'report',
  subscriptions: 'workspace_premium',
  advertisements: 'campaign',
  packages: 'sell',
};

export const PAYMENT_STATUSES: AdPaymentStatus[] = [
  'PENDING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
];
export const ISSUE_STATUSES: PaymentIssueStatus[] = ['OPEN', 'RESOLVED', 'REJECTED'];
export const SUBSCRIPTION_STATUSES: AdSubscriptionStatus[] = ['ACTIVE', 'EXPIRED', 'CANCELLED'];
export const ADVERTISEMENT_STATUSES: AdvertisementStatus[] = ['PUBLISHED', 'SUSPENDED', 'EXPIRED'];

const GOOD = 'bg-secondary-container text-on-secondary-container';
const WAITING = 'bg-tertiary-fixed text-on-tertiary-fixed';
const BAD = 'bg-error-container text-on-error-container';
const MUTED = 'bg-surface-container-high text-on-surface-variant';

export const PAYMENT_STATUS_CLASS: Record<AdPaymentStatus, string> = {
  PENDING: WAITING,
  SUCCESS: GOOD,
  FAILED: BAD,
  CANCELLED: MUTED,
  REFUNDED: MUTED,
};
export const ISSUE_STATUS_CLASS: Record<PaymentIssueStatus, string> = {
  OPEN: WAITING,
  RESOLVED: GOOD,
  REJECTED: MUTED,
};
export const SUBSCRIPTION_STATUS_CLASS: Record<AdSubscriptionStatus, string> = {
  ACTIVE: GOOD,
  EXPIRED: MUTED,
  CANCELLED: BAD,
};
export const ADVERTISEMENT_STATUS_CLASS: Record<AdvertisementStatus, string> = {
  PUBLISHED: GOOD,
  SUSPENDED: BAD,
  EXPIRED: MUTED,
};

export const money = (value: number): string => `${formatNumber(Math.round(value))}đ`;

export const PAGE_SIZE = 20;
export const SEARCH_DELAY_MS = 350;
