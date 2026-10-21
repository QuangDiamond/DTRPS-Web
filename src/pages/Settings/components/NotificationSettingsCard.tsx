import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import NotificationRulesFields from '@/components/notifications/NotificationRulesFields';
import { ROUTES } from '@/constants/routes';
import type { NotificationRules } from '@/types';
import SettingsCard from './SettingsCard';

interface NotificationSettingsCardProps {
  rules: NotificationRules;
  onChange: (rules: NotificationRules) => void;
}

/** Tab "Thông báo & Email cảnh báo" — dùng chung quy tắc với Trung tâm Thông báo */
export default function NotificationSettingsCard({
  rules,
  onChange,
}: NotificationSettingsCardProps) {
  const { t } = useTranslation();
  return (
    <SettingsCard
      icon="notifications_active"
      title={t('settings.notificationSettingsCard.notificationsAlertEmails')}
      description={t('settings.notificationSettingsCard.eventsThatCreateNotifications')}
      aside={
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="flex shrink-0 items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:underline"
        >
          {t('settings.notificationSettingsCard.notificationCenter')}{' '}
          <Icon name="open_in_new" className="text-[14px]" />
        </Link>
      }
    >
      <NotificationRulesFields rules={rules} onChange={onChange} />
    </SettingsCard>
  );
}
