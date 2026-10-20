import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import NotificationRulesFields from '../../../components/notifications/NotificationRulesFields';
import { ROUTES } from '../../../constants/routes';
import type { NotificationRules } from '../../../types/admin';
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
  return (
    <SettingsCard
      icon="notifications_active"
      title="Thông báo & Email cảnh báo"
      description="Sự kiện tạo thông báo, ngưỡng cảnh báo khẩn và kênh tiếp nhận của quản trị viên"
      aside={
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="flex shrink-0 items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:underline"
        >
          Trung tâm thông báo <Icon name="open_in_new" className="text-[14px]" />
        </Link>
      }
    >
      <NotificationRulesFields rules={rules} onChange={onChange} />
    </SettingsCard>
  );
}
