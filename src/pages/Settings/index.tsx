import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import UnsavedChangesDialog from '../../components/common/UnsavedChangesDialog';
import Icon from '../../components/common/Icon';
import { countEnabledChannels } from '../../utils/notificationRules';
import { DEFAULT_NOTIFICATION_RULES } from '../../constants/notification';
import { ROUTES } from '../../constants/routes';
import { DEFAULT_SYSTEM_SETTINGS, PLATFORM_INFO, SETTINGS_TABS } from '../../constants/settings';
import { useNotifications } from '../../hooks/useNotifications';
import { useSettings } from '../../hooks/useSettings';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { useToast } from '../../hooks/useToast';
import type { NotificationRules, SettingsTab, SystemSettings } from '../../types/admin';
import { formatRelativeTime } from '../../utils/format';
import AdminIdentityBanner from './components/AdminIdentityBanner';
import AiPlannerCard from './components/AiPlannerCard';
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
      setNameError('Vui lòng nhập tên hiển thị hệ thống');
      setTab('general');
      showToast('Tên hiển thị hệ thống không được để trống', 'error');
      return;
    }
    if (countEnabledChannels(draftRules) === 0) {
      setTab('notifications');
      showToast('Cần chọn ít nhất một kênh tiếp nhận thông báo', 'error');
      return;
    }
    if (!isDirty) {
      showToast('Không có thay đổi nào cần lưu', 'info');
      return;
    }
    const next = { ...draft, platformName: draft.platformName.trim() };
    saveSettings(next);
    updateRules(draftRules);
    setDraft(next);
    showToast('Cấu hình hệ thống Smart Travel đã được cập nhật và đồng bộ đến toàn bộ cluster.');
  };

  const handleCancel = () => {
    if (!isDirty) {
      showToast('Không có thay đổi nào để hủy', 'info');
      return;
    }
    setDraft(settings);
    setDraftRules(rules);
    setNameError('');
    showToast('Đã hủy các thay đổi chưa lưu', 'info');
  };

  const confirmReset = () => {
    setDraft(DEFAULT_SYSTEM_SETTINGS);
    setDraftRules(DEFAULT_NOTIFICATION_RULES);
    setNameError('');
    setConfirm(null);
    showToast('Đã khôi phục giá trị mặc định. Bấm "Lưu thay đổi cấu hình" để áp dụng.', 'info');
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
  const aiCard = <AiPlannerCard values={draft} onChange={handleChange} />;
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
          <span>Quản trị hệ thống</span>
        </Link>
        <Icon name="chevron_right" className="text-[16px] text-outline" />
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Icon name="settings" className="text-[18px]" />
          <span>Cài đặt hệ thống</span>
        </div>
        <Icon name="chevron_right" className="text-[16px] text-outline" />
        <span className="text-outline">{SETTINGS_TABS.find((item) => item.id === tab)?.label}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col justify-between gap-space-md pb-space-xs xl:flex-row xl:items-center">
        <div className="flex max-w-3xl flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-display-sm text-display-sm tracking-tight text-on-surface">
              Cài đặt Cấu hình Hệ thống
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-secondary-container px-space-sm py-0.5 font-label-sm text-label-sm font-bold whitespace-nowrap text-on-secondary-container">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {PLATFORM_INFO.productionBadge}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Quản lý thông số vận hành nền tảng, chính sách thẩm định niêm yết, phân quyền bảo mật và
            tích hợp AI cho mạng lưới du lịch thông minh toàn quốc.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm self-start xl:self-auto">
          <button
            type="button"
            onClick={() => setConfirm('reset')}
            className="flex h-10 items-center gap-1.5 rounded-full bg-surface-container-high px-space-md font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest"
          >
            <Icon name="restart_alt" className="text-[18px]" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-space-lg font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
          >
            <Icon name="save" className="text-[18px]" />
            <span>Lưu thay đổi cấu hình</span>
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
                  <span className="h-2 w-2 rounded-full bg-tertiary" title="Có thay đổi chưa lưu" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trạng thái cụm máy chủ */}
      <div className="flex flex-col items-start justify-between gap-space-md rounded-2xl bg-secondary-fixed/30 p-space-md md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-space-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Icon name="cloud_done" className="text-[22px]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-title-md text-title-md font-semibold text-on-surface">
              Cụm máy chủ điều hành: {PLATFORM_INFO.dataCenter}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {PLATFORM_INFO.networkStatus}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-surface-container-lowest px-space-sm py-1 font-label-sm text-label-sm text-on-surface-variant shadow-sm">
          Cập nhật đồng bộ: <strong>{formatRelativeTime(meta.syncedAt)}</strong>
        </span>
      </div>

      {/* Nội dung theo tab */}
      {tab === 'general' && (
        <>
          <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-2">
            <div className="flex flex-col gap-space-lg">
              {platformCard}
              {listingCard}
            </div>
            <div className="flex flex-col gap-space-lg">
              {securityCard}
              {aiCard}
            </div>
          </div>
          {identityBanner}
        </>
      )}
      {tab === 'listing' && listingCard}
      {tab === 'ai' && aiCard}
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
          title="Khôi phục cấu hình mặc định?"
          confirmLabel="Khôi phục"
          confirmIcon="restart_alt"
          onConfirm={confirmReset}
          onClose={() => setConfirm(null)}
        >
          Toàn bộ thông số (kể cả danh sách IP và quy tắc thông báo) sẽ trở về giá trị khuyến nghị.
          Thay đổi chỉ được áp dụng sau khi bạn bấm <strong>Lưu thay đổi cấu hình</strong>.
        </ConfirmModal>
      )}

      {confirm === 'disable2fa' && (
        <ConfirmModal
          title="Tắt xác thực 2 bước (2FA)?"
          confirmLabel="Vẫn tắt 2FA"
          confirmIcon="lock_open"
          onConfirm={confirmDisable2fa}
          onClose={() => setConfirm(null)}
        >
          Tài khoản quản trị sẽ chỉ được bảo vệ bằng mật khẩu, làm tăng rủi ro chiếm quyền truy cập.
          Chuẩn SOC2 Type II yêu cầu bật 2FA cho toàn bộ quản trị viên.
        </ConfirmModal>
      )}

      <UnsavedChangesDialog blocker={blocker} title="Rời trang khi chưa lưu cấu hình?">
        Các thay đổi ở {dirtyTabs.size} nhóm cấu hình chưa được lưu và sẽ bị hủy nếu bạn rời khỏi
        trang này.
      </UnsavedChangesDialog>
    </div>
  );
}
