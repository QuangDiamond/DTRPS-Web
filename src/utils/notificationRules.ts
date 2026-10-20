import type { NotificationRules } from '../types/admin';

/** Số kênh nhận thông báo đang bật */
export const countEnabledChannels = (rules: NotificationRules): number =>
  Object.values(rules.channels).filter(Boolean).length;
