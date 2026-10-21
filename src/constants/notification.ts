import i18n from 'i18next';
import type {
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
  NotificationRules,
  NotificationTab,
} from '@/types';

export const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  {
    id: 'all',
    get label() {
      return i18n.t('notifications.constants.all');
    },
  },
  {
    id: 'listings',
    get label() {
      return i18n.t('notifications.constants.listingsPartners');
    },
  },
  {
    id: 'users',
    get label() {
      return i18n.t('notifications.constants.usersReports');
    },
  },
  {
    id: 'system',
    get label() {
      return i18n.t('notifications.constants.technicalAiAlerts');
    },
  },
];

export const NOTIFICATION_PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; dotClass: string }
> = {
  urgent: {
    get label() {
      return i18n.t('notifications.constants.urgent');
    },
    dotClass: 'bg-error',
  },
  high: { label: 'Cao', dotClass: 'bg-tertiary' },
  normal: {
    get label() {
      return i18n.t('notifications.constants.normal');
    },
    dotClass: 'bg-primary',
  },
  low: {
    get label() {
      return i18n.t('notifications.constants.low');
    },
    dotClass: 'bg-outline',
  },
};

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['urgent', 'high', 'normal', 'low'];

export const NOTIFICATION_CHANNEL_CONFIG: Record<
  NotificationChannel,
  { label: string; icon: string }
> = {
  app: {
    get label() {
      return i18n.t('notifications.constants.inAdminApp');
    },
    icon: 'notifications',
  },
  email: { label: 'Email', icon: 'mail' },
  telegram: { label: 'Telegram', icon: 'send' },
  sms: { label: 'SMS', icon: 'sms' },
};

export const NOTIFICATION_EVENT_CONFIG: Record<
  NotificationEvent,
  { label: string; description: string; icon: string }
> = {
  newListing: {
    get label() {
      return i18n.t('notifications.constants.newUpdatedListingSubmissions');
    },
    get description() {
      return i18n.t('notifications.constants.whenPartnerSubmitsNew');
    },
    icon: 'assignment',
  },
  newPartner: {
    get label() {
      return i18n.t('notifications.constants.newPartnerRegistrations');
    },
    get description() {
      return i18n.t('notifications.constants.whenBusinessCompletesRegistration');
    },
    icon: 'corporate_fare',
  },
  complaint: {
    get label() {
      return i18n.t('notifications.constants.travelerComplaintsFeedback');
    },
    get description() {
      return i18n.t('notifications.constants.reportsPriceDiscrepanciesService');
    },
    icon: 'flag',
  },
  aiLoad: {
    get label() {
      return i18n.t('notifications.constants.aiLoadOverThreshold');
    },
    get description() {
      return i18n.t('notifications.constants.trackAiPlannerRequest');
    },
    icon: 'smart_toy',
  },
  dataSync: {
    get label() {
      return i18n.t('notifications.constants.poiGpsDataSync');
    },
    get description() {
      return i18n.t('notifications.constants.nationalDataSyncResults');
    },
    icon: 'sync_saved_locally',
  },
  security: {
    get label() {
      return i18n.t('notifications.constants.securityAccounts');
    },
    get description() {
      return i18n.t('notifications.constants.accountLocksUnusualSign');
    },
    icon: 'shield',
  },
};

export const DEFAULT_NOTIFICATION_RULES: NotificationRules = {
  urgentChannelsEnabled: true,
  aiLoadThreshold: 85,
  channels: { app: true, email: true, telegram: true, sms: true },
  events: {
    newListing: true,
    newPartner: true,
    complaint: true,
    aiLoad: true,
    dataSync: true,
    security: true,
  },
};

export const NOTIFICATION_PAGE_SIZE = 7;
export const AI_LOAD_THRESHOLD_RANGE = { min: 50, max: 100, step: 5 };
