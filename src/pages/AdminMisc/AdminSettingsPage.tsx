import { useTranslation } from 'react-i18next';
import { Icon, PageHeader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';

/** Cài đặt hệ thống: /admin/settings — chờ API system_settings */
export default function AdminSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.settings'), icon: 'settings' }]}
          eyebrow={t('adminSettings.eyebrow')}
          title={t('adminSettings.title')}
          description={t('adminSettings.description')}
        />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-16 text-center shadow-sm">
        <Icon name="settings_suggest" className="text-[48px] text-outline" />
        <p className="font-headline-sm text-headline-sm text-on-surface">
          {t('adminSettings.emptyTitle')}
        </p>
        <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
          {t('adminSettings.emptyText')}
        </p>
      </div>
    </div>
  );
}
