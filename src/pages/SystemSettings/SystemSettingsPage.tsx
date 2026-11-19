import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  ConfirmModal,
  ErrorState,
  Icon,
  PageHeader,
  UnsavedChangesDialog,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { useLiveRefresh, useUnsavedChangesGuard } from '@/hooks';
import { systemAdminService } from '@/services/systemAdminService';
import type { PlatformSettingsView } from '@/types';
import { getErrorMessage } from '@/utils/error';
import AnnouncementTab from './components/AnnouncementTab';
import AuditLogTab from './components/AuditLogTab';
import GeneralTab from './components/GeneralTab';
import IntegrationsTab from './components/IntegrationsTab';
import RulesTab from './components/RulesTab';
import { FORM_TABS, isSystemTab, SYSTEM_TABS, type SystemTab } from './systemSettingsUtils';

const LIVE_EVENTS = ['SETTINGS_UPDATED'];

/** Cài đặt hệ thống: /admin/settings — nhật ký, dịch vụ ngoài, quy tắc, banner, thông tin chung */
export default function SystemSettingsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: SystemTab = isSystemTab(tabParam) ? tabParam : 'audit';
  const [view, setView] = useState<PlatformSettingsView | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<SystemTab | null>(null);
  const { blocker } = useUnsavedChangesGuard(dirty);

  const loadSettings = useCallback(() => {
    setLoadError('');
    systemAdminService
      .settings()
      .then(setView)
      .catch((failure: unknown) => setLoadError(getErrorMessage(failure)));
  }, []);

  useEffect(loadSettings, [loadSettings]);

  // Admin khác lưu cài đặt → tải bản mới; form đang sửa sẽ báo "có bản mới" thay vì ghi đè
  useLiveRefresh(LIVE_EVENTS, loadSettings);

  const refresh = () => {
    loadSettings();
    setReload((n) => n + 1);
  };

  const openTab = (next: SystemTab) => {
    if (next === tab) return;
    if (dirty && FORM_TABS.includes(tab)) {
      setPendingTab(next);
      return;
    }
    setDirty(false);
    setParams(next === 'audit' ? {} : { tab: next }, { replace: true });
  };

  const onDirtyChange = useCallback((value: boolean) => setDirty(value), []);

  const formTab = FORM_TABS.includes(tab);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.settings'), icon: 'settings' }]}
          eyebrow={t('systemSettings.eyebrow')}
          title={t('systemSettings.title')}
          description={t('systemSettings.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={refresh}>
              {t('adAdmin.header.refresh')}
            </Button>
          }
        />
      </div>

      <div
        role="tablist"
        aria-label={t('systemSettings.title')}
        className="flex gap-2 overflow-x-auto rounded-2xl bg-surface-container-lowest p-2 shadow-sm"
      >
        {SYSTEM_TABS.map(({ value, icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => openTab(value)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-label-md text-label-md font-semibold whitespace-nowrap transition-colors ${
              tab === value
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Icon name={icon} className="text-[19px]" />
            {t(`systemSettings.tabs.${value}`)}
            {tab === value && dirty && formTab && (
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            )}
          </button>
        ))}
      </div>

      {tab === 'audit' && <AuditLogTab reload={reload} />}
      {tab === 'integrations' && <IntegrationsTab key={reload} />}

      {formTab &&
        (loadError ? (
          <ErrorState
            title={t('systemSettings.form.loadFailed')}
            message={loadError}
            onRetry={loadSettings}
          />
        ) : !view ? (
          <div className="h-80 animate-pulse rounded-2xl bg-surface-container-lowest shadow-sm" />
        ) : tab === 'rules' ? (
          <RulesTab view={view} onSaved={setView} onDirtyChange={onDirtyChange} />
        ) : tab === 'announcement' ? (
          <AnnouncementTab view={view} onSaved={setView} onDirtyChange={onDirtyChange} />
        ) : (
          <GeneralTab view={view} onSaved={setView} onDirtyChange={onDirtyChange} />
        ))}

      {pendingTab && (
        <ConfirmModal
          title={t('systemSettings.form.leaveTabTitle')}
          confirmLabel={t('systemSettings.form.leaveTabConfirm')}
          confirmIcon="undo"
          onConfirm={() => {
            const next = pendingTab;
            setPendingTab(null);
            setDirty(false);
            setParams(next === 'audit' ? {} : { tab: next }, { replace: true });
          }}
          onClose={() => setPendingTab(null)}
        >
          {t('systemSettings.form.leaveTab')}
        </ConfirmModal>
      )}

      <UnsavedChangesDialog blocker={blocker}>{t('systemSettings.form.leavePage')}</UnsavedChangesDialog>
    </div>
  );
}
