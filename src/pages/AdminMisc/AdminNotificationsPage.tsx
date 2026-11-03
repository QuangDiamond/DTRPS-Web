import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, PageHeader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';

/** Thông báo: /admin/notifications — backend chưa có API, hiện trạng thái trống */
export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.notifications'), icon: 'notifications' }]}
          eyebrow={t('adminNotifications.eyebrow')}
          title={t('adminNotifications.title')}
          description={t('adminNotifications.description')}
        />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-16 text-center shadow-sm">
        <Icon name="notifications_off" className="text-[48px] text-outline" />
        <p className="font-headline-sm text-headline-sm text-on-surface">
          {t('adminNotifications.emptyTitle')}
        </p>
        <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
          {t('adminNotifications.emptyText')}
        </p>
        <Button icon="fact_check" onClick={() => navigate(ROUTES.DASHBOARD)}>
          {t('adminNotifications.goReview')}
        </Button>
      </div>
    </div>
  );
}
