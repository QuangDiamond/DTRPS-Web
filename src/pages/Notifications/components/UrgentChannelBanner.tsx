import { useTranslation } from 'react-i18next';
import { Icon, ToggleSwitch } from '@/components/common';

interface UrgentChannelBannerProps {
  enabled: boolean;
  aiLoadThreshold: number;
  onToggle: (enabled: boolean) => void;
}

/** Banner bật/tắt kênh cảnh báo khẩn (Telegram & SMS) */
export default function UrgentChannelBanner({
  enabled,
  aiLoadThreshold,
  onToggle,
}: UrgentChannelBannerProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col justify-between gap-space-md rounded-2xl bg-primary-fixed/30 p-space-md sm:flex-row sm:items-center lg:col-span-2">
      <div className="flex items-center gap-space-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
          <Icon
            name={enabled ? 'notifications_active' : 'notifications_off'}
            className="text-[20px]"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-title-md text-title-md font-semibold text-on-surface">
            {t('notifications.urgentChannelBanner.urgentAlertChannelsTelegram')}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('notifications.urgentChannelBanner.automaticallyAlertsWhenAi', { aiLoadThreshold })}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
        <span
          className={`font-label-sm text-label-sm font-semibold ${enabled ? 'text-primary' : 'text-outline'}`}
        >
          {enabled
            ? t('notifications.urgentChannelBanner.enabled')
            : t('notifications.urgentChannelBanner.paused')}
        </span>
        <ToggleSwitch
          checked={enabled}
          onChange={onToggle}
          label={t('notifications.urgentChannelBanner.urgentAlertChannels')}
        />
      </div>
    </div>
  );
}
