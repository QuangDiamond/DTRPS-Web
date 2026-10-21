import type { NotificationRules } from '@/types';

/** Số kênh nhận thông báo đang bật */
export const countEnabledChannels = (rules: NotificationRules): number =>
  Object.values(rules.channels).filter(Boolean).length;
