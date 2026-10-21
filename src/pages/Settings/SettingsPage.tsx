import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmModal, Icon, UnsavedChangesDialog } from '@/components/common';
import { DEFAULT_NOTIFICATION_RULES } from '@/constants/notification';
import { ROUTES } from '@/constants/routes';
import { DEFAULT_SYSTEM_SETTINGS, PLATFORM_INFO, SETTINGS_TABS } from '@/constants/settings';
import { useNotifications, useSettings, useToast, useUnsavedChangesGuard } from '@/hooks';
import type { NotificationRules, SettingsTab, SystemSettings } from '@/types';
import { countEnabledChannels } from '@/utils/notificationRules';
import AdminIdentityBanner from './components/AdminIdentityBanner';
import ListingSlaCard from './components/ListingSlaCard';
import NotificationSettingsCard from './components/NotificationSettingsCard';
import PermissionMatrixModal from './components/PermissionMatrixModal';
import PlatformInfoCard from './components/PlatformInfoCard';
import SecurityCard from './components/SecurityCard';
import SettingsFooter from './components/SettingsFooter';
import { getDirtyTabs, type SettingsFieldChange } from './settingsUtils';

type ConfirmState = 'reset' | 'disable2fa' | null;

/** Cài đặt Cấu hình Hệ thống: /admin/settings */
export default function SettingsPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { settings, meta, saveSettings } = useSettings();
  const { rules, updateRules } = useNotifications();

  // Bản nháp chỉnh sửa — chỉ áp dụng khi bấm "Lưu thay đổi cấu hình"
  const [draft, setDraft] = useState<SystemSettings>(settings);
  const [draftRules, setDraftRules] = useState<NotificationRules>(rules);
  const [tab, setTab] = useState<SettingsTab>('general');
  const [nameError, setNameError] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const dirtyTabs = getDirtyTabs(draft, settings, draftRules, rules);
  const isDirty = dirtyTabs.size > 0;

  const { blocker } = useUnsavedChangesGuard(isDirty);

  const handleChange = useCallback<SettingsFieldChange>((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === 'platformName') setNameError('');
  }, []);

  const handleSave = () => {
    if (!draft.platformName.trim()) {
      setNameError(t('settings.page.pleaseEnterSystemDisplay'));
      setTab('general');
      showToast(t('settings.page.theSystemDisplayName'), 'error');
      return;
    }
    if (countEnabledChannels(draftRules) === 0) {
      setTab('notifications');
      showToast(t('settings.page.selectAtLeastOne'), 'error');
      return;
    }
    if (!isDirty) {
      showToast(t('settings.page.thereNoChangesSave'), 'info');
      return;
    }
    const next = { ...draft, platformName: draft.platformName.trim() };
    saveSettings(next);
    updateRules(draftRules);
    setDraft(next);
    showToast(t('settings.page.theSmartTravelSystem'));
  };

  const handleCancel = () => {
    if (!isDirty) {
      showToast(t('settings.page.thereNoChangesDiscard'), 'info');
      return;
    }
    setDraft(settings);
    setDraftRules(rules);
    setNameError('');
    showToast(t('settings.page.unsavedChangesDiscarded'), 'info');
  };

  const confirmReset = () => {
    setDraft(DEFAULT_SYSTEM_SETTINGS);
    setDraftRules(DEFAULT_NOTIFICATION_RULES);
    setNameError('');
    setConfirm(null);
    showToast(t('settings.page.defaultsRestoredClickSave'), 'info');
  };

  const confirmDisable2fa = () => {
    handleChange('twoFactorRequired', false);
    setConfirm(null);
  };

  const platformCard = (
    <PlatformInfoCard values={draft} nameError={nameError} onChange={handleChange} />
  );
  const listingCard = <ListingSlaCard values={draft} onChange={handleChange} />;
  const securityCard = (
    <SecurityCard
      values={draft}
      onChange={handleChange}
      onRequestDisable2fa={() => setConfirm('disable2fa')}
    />
  );
  const identityBanner = <AdminIdentityBanner onOpenMatrix={() => setMatrixOpen(true)} />;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Icon name="admin_panel_settings" className="text-[18px]" />
          <span>{t('settings.page.systemAdministration')}</span>
        </Link>
        <Icon name="chevron_right" className="text-[16px] text-outline" />
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Icon name="settings" className="text-[18px]" />
          <span>{t('settings.page.systemSettings')}</span>
        </div>
        <Icon name="chevron_right" className="text-[16px] text-outline" />
        <span className="text-outline">{SETTINGS_TABS.find((item) => item.id === tab)?.label}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col justify-between gap-space-md pb-space-xs xl:flex-row xl:items-center">
        <div className="flex max-w-3xl flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-display-sm text-display-sm tracking-tight text-on-surface">
              {t('settings.page.systemConfigurationSettings')}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-secondary-container px-space-sm py-0.5 font-label-sm text-label-sm font-bold whitespace-nowrap text-on-secondary-container">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {PLATFORM_INFO.productionBadge}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('settings.page.managePlatformOperatingParameters')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm self-start xl:self-auto">
          <button
            type="button"
            onClick={() => setConfirm('reset')}
            className="flex h-10 items-center gap-1.5 rounded-full bg-surface-container-high px-space-md font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest"
          >
            <Icon name="restart_alt" className="text-[18px]" />
            <span>{t('settings.page.restoreDefaults')}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-space-lg font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
          >
            <Icon name="save" className="text-[18px]" />
            <span>{t('settings.page.saveConfigurationChanges')}</span>
          </button>
        </div>
      </header>

      {/* Tabs — chấm cam = nhóm có thay đổi chưa lưu */}
      <div className="overflow-x-auto">
        <div className="flex w-max min-w-full items-center gap-space-xs rounded-2xl bg-surface-container-low p-1.5 lg:min-w-0">
          {SETTINGS_TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-space-md py-2.5 font-label-md text-label-md whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span>{item.label}</span>
                {dirtyTabs.has(item.id) && (
                  <span
                    className="h-2 w-2 rounded-full bg-tertiary"
                    title={t('settings.page.unsavedChanges')}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nội dung theo tab */}
      {tab === 'general' && (
        <>
          <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-2">
            <div className="flex flex-col gap-space-lg">
              {platformCard}
              {listingCard}
            </div>
            <div className="flex flex-col gap-space-lg">{securityCard}</div>
          </div>
          {identityBanner}
        </>
      )}
      {tab === 'listing' && listingCard}
      {tab === 'security' && (
        <>
          {securityCard}
          {identityBanner}
        </>
      )}
      {tab === 'notifications' && (
        <NotificationSettingsCard rules={draftRules} onChange={setDraftRules} />
      )}

      <SettingsFooter
        meta={meta}
        dirtyCount={dirtyTabs.size}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {matrixOpen && <PermissionMatrixModal onClose={() => setMatrixOpen(false)} />}

      {confirm === 'reset' && (
        <ConfirmModal
          title={t('settings.page.restoreDefaultConfiguration')}
          confirmLabel={t('settings.page.restore')}
          confirmIcon="restart_alt"
          onConfirm={confirmReset}
          onClose={() => setConfirm(null)}
        >
          <Trans i18nKey="settings.page.allParametersIncludingIp" components={{ c0: <strong /> }} />
        </ConfirmModal>
      )}

      {confirm === 'disable2fa' && (
        <ConfirmModal
          title={t('settings.page.turnOffTwoFactor')}
          confirmLabel={t('settings.page.turnOff2faAnyway')}
          confirmIcon="lock_open"
          onConfirm={confirmDisable2fa}
          onClose={() => setConfirm(null)}
        >
          {t('settings.page.adminAccountsWillProtected')}
        </ConfirmModal>
      )}

      <UnsavedChangesDialog
        blocker={blocker}
        title={t('settings.page.leaveWithoutSavingConfiguration')}
      >
        {t('settings.page.changesSettingsGroupsHave', { count: dirtyTabs.size })}
      </UnsavedChangesDialog>
    </div>
  );
}
