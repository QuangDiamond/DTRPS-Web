import { useTranslation } from 'react-i18next';
import { Icon, ToggleSwitch } from '@/components/common';
import {
  AI_LOAD_THRESHOLD_RANGE,
  NOTIFICATION_CHANNEL_CONFIG,
  NOTIFICATION_EVENT_CONFIG,
} from '@/constants/notification';
import type { NotificationChannel, NotificationEvent, NotificationRules } from '@/types';
import { countEnabledChannels } from '@/utils/notificationRules';

interface NotificationRulesFieldsProps {
  rules: NotificationRules;
  onChange: (rules: NotificationRules) => void;
}

const SECTION_TITLE_CLASS =
  'font-label-sm text-label-sm font-bold tracking-wider text-outline uppercase';

/**
 * Các trường cấu hình quy tắc thông báo — dùng chung cho modal "Cài đặt quy tắc" (trang Thông báo)
 * và tab "Thông báo & Email cảnh báo" (trang Cài đặt hệ thống)
 */
export default function NotificationRulesFields({ rules, onChange }: NotificationRulesFieldsProps) {
  const { t } = useTranslation();
  const enabledChannels = countEnabledChannels(rules);

  const toggleEvent = (event: NotificationEvent, enabled: boolean) =>
    onChange({ ...rules, events: { ...rules.events, [event]: enabled } });

  const toggleChannel = (channel: NotificationChannel, enabled: boolean) =>
    onChange({ ...rules, channels: { ...rules.channels, [channel]: enabled } });

  return (
    <div className="flex flex-col gap-space-lg">
      <section className="flex flex-col gap-space-sm">
        <span className={SECTION_TITLE_CLASS}>
          {t('components.notificationRulesFields.notificationEvents')}
        </span>
        <div className="flex flex-col divide-y divide-surface-container rounded-xl bg-surface-container-low/60">
          {(Object.keys(NOTIFICATION_EVENT_CONFIG) as NotificationEvent[]).map((event) => {
            const config = NOTIFICATION_EVENT_CONFIG[event];
            return (
              <div
                key={event}
                className="flex items-center justify-between gap-space-md px-space-md py-3"
              >
                <div className="flex items-start gap-space-sm">
                  <Icon name={config.icon} className="mt-0.5 text-[20px] text-primary" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">
                      {config.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {config.description}
                    </span>
                  </div>
                </div>
                <ToggleSwitch
                  checked={rules.events[event]}
                  onChange={(enabled) => toggleEvent(event, enabled)}
                  label={config.label}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className={SECTION_TITLE_CLASS}>
            {t('components.notificationRulesFields.aiPlannerLoadAlert')}
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-tertiary">
            {rules.aiLoadThreshold}%
          </span>
        </div>
        <input
          type="range"
          aria-label={t('components.notificationRulesFields.aiLoadAlertThreshold')}
          min={AI_LOAD_THRESHOLD_RANGE.min}
          max={AI_LOAD_THRESHOLD_RANGE.max}
          step={AI_LOAD_THRESHOLD_RANGE.step}
          value={rules.aiLoadThreshold}
          disabled={!rules.events.aiLoad}
          onChange={(event) => onChange({ ...rules, aiLoadThreshold: Number(event.target.value) })}
          className="w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {t('components.notificationRulesFields.sendUrgentAlertWhen')}
        </span>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className={SECTION_TITLE_CLASS}>
            {t('components.notificationRulesFields.deliveryChannels')}
          </span>
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
            {t('components.notificationRulesFields.urgentAlertsViaTelegram')}
            <ToggleSwitch
              checked={rules.urgentChannelsEnabled}
              onChange={(enabled) => onChange({ ...rules, urgentChannelsEnabled: enabled })}
              label={t('components.notificationRulesFields.urgentAlertsViaTelegram2')}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          {(Object.keys(NOTIFICATION_CHANNEL_CONFIG) as NotificationChannel[]).map((channel) => {
            const config = NOTIFICATION_CHANNEL_CONFIG[channel];
            const checked = rules.channels[channel];
            return (
              <label
                key={channel}
                className={`flex cursor-pointer items-center gap-space-sm rounded-xl px-space-md py-3 transition-colors ${
                  checked
                    ? 'bg-primary-fixed/40 text-on-surface ring-1 ring-primary/30'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleChannel(channel, event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <Icon name={config.icon} className="text-[18px] text-primary" />
                <span className="font-label-md text-label-md">{config.label}</span>
              </label>
            );
          })}
        </div>
        {enabledChannels === 0 && (
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
            <Icon name="error" className="text-[14px]" />{' '}
            {t('components.notificationRulesFields.selectAtLeastOne')}
          </span>
        )}
      </section>
    </div>
  );
}
