import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmModal, Icon } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useAdminProfile, useAuth, useSettings, useToast } from '@/hooks';
import PermissionMatrixModal from '@/pages/Settings/components/PermissionMatrixModal';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDayTime, todayIsoDate } from '@/utils/format';
import ActivityLogModal from './components/ActivityLogModal';
import AddSecurityKeyModal from './components/AddSecurityKeyModal';
import BackupCodesModal from './components/BackupCodesModal';
import ChangePasswordCard from './components/ChangePasswordCard';
import ContactInfoCard from './components/ContactInfoCard';
import PermissionSummaryCard from './components/PermissionSummaryCard';
import ProfileIdentityCard from './components/ProfileIdentityCard';
import SecurityCheckModal from './components/SecurityCheckModal';
import SessionSafetyCard from './components/SessionSafetyCard';
import TotpSetupModal from './components/TotpSetupModal';
import TwoFactorCard from './components/TwoFactorCard';
import { runSecurityChecks } from './profileUtils';

type ModalName =
  'activity' | 'securityCheck' | 'totp' | 'backupCodes' | 'addKey' | 'revoke' | 'matrix' | null;

const HEADER_BUTTON_CLASS =
  'inline-flex items-center gap-2 rounded-full px-space-md py-2.5 font-label-md text-label-md font-semibold transition-colors';

/** Hồ sơ Cá nhân & Bảo mật Quản trị viên: /admin/profile */
export default function ProfilePage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { admin } = useAuth();
  const { settings } = useSettings();
  const {
    details,
    sessions,
    securityKeys,
    activities,
    reconfigureTotp,
    regenerateBackupCodes,
    addSecurityKey,
    revokeOtherSessions,
  } = useAdminProfile();
  const [modal, setModal] = useState<ModalName>(null);
  const closeModal = useCallback(() => setModal(null), []);

  const checks = useMemo(
    () => runSecurityChecks(details, securityKeys, settings),
    [details, securityKeys, settings],
  );
  const currentSession = sessions.find((session) => session.status === 'current');

  const handleAddKey = useCallback(
    (name: string) => {
      const key = addSecurityKey(name);
      setModal(null);
      showToast(t('profile.page.linkedKey', { name: key.name, serial: key.serial }));
    },
    [addSecurityKey, showToast, t],
  );

  const handleRevoke = () => {
    const count = revokeOtherSessions();
    setModal(null);
    showToast(
      count > 0
        ? t('profile.page.revokedSessionsOtherDevices', { count })
        : t('profile.page.thereNoOtherSessions'),
      count > 0 ? 'success' : 'info',
    );
  };

  const exportActivities = () => {
    downloadCsv(
      `nhat-ky-hoat-dong-${details.id}-${todayIsoDate()}.csv`,
      [
        t('profile.page.code'),
        t('profile.page.time'),
        t('profile.page.active'),
        t('profile.page.details'),
        'IP',
      ],
      activities.map((item) => [
        item.id,
        formatDayTime(item.createdAt),
        item.title,
        item.detail,
        item.ip,
      ]),
    );
    showToast(t('profile.page.exportedActivityLogRows', { count: activities.length }));
  };

  if (!admin) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1 transition-colors hover:text-primary"
        >
          <Icon name="shield_person" className="text-[16px] text-primary" />
          <span>{t('profile.page.systemAdministration')}</span>
        </Link>
        <Icon name="chevron_right" className="text-[14px] text-outline" />
        <div className="flex items-center gap-1">
          <Icon name="account_circle" className="text-[16px]" />
          <span>{t('profile.page.administratorProfile')}</span>
        </div>
        <Icon name="chevron_right" className="text-[14px] text-outline" />
        <span className="font-semibold text-on-surface">
          {t('profile.page.personalInformationAccountSecurity')}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col justify-between gap-space-md pb-space-xs lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              {t('profile.page.administratorProfileSecurity')}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container shadow-sm">
              <Icon name="verified" filled className="text-[15px]" />
              {t('profile.page.rootHighestAdministrativeAuthority', { role: admin.role })}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('profile.page.manageYourIdentitySenior')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setModal('activity')}
            className={`${HEADER_BUTTON_CLASS} bg-surface-container-low text-primary hover:bg-surface-container-high`}
          >
            <Icon name="history" className="text-[18px]" />
            {t('profile.page.activityLog')}
          </button>
          <button
            type="button"
            onClick={() => setModal('securityCheck')}
            className={`${HEADER_BUTTON_CLASS} bg-primary text-on-primary shadow-sm hover:bg-primary-container`}
          >
            <Icon name="security" className="text-[18px]" />
            {t('profile.page.systemSecurityCheck')}
          </button>
        </div>
      </div>

      {/* Bố cục 2 cột: 5 / 7 */}
      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-5">
          <ProfileIdentityCard admin={admin} details={details} currentSession={currentSession} />
          <PermissionSummaryCard onOpenMatrix={() => setModal('matrix')} />
          <SessionSafetyCard checks={checks} onReview={() => setModal('securityCheck')} />
        </div>
        <div className="flex flex-col gap-space-lg lg:col-span-7">
          <ContactInfoCard
            key={JSON.stringify([details.fullName, details.socAlertEmail, details.hotline])}
            roleTitle={admin.role}
          />
          <ChangePasswordCard />
          <TwoFactorCard
            details={details}
            securityKeys={securityKeys}
            sessions={sessions}
            onReconfigureTotp={() => setModal('totp')}
            onShowBackupCodes={() => setModal('backupCodes')}
            onAddKey={() => setModal('addKey')}
            onRevokeOthers={() => setModal('revoke')}
          />
        </div>
      </div>

      {modal === 'activity' && (
        <ActivityLogModal
          activities={activities}
          onExport={exportActivities}
          onClose={closeModal}
        />
      )}
      {modal === 'securityCheck' && <SecurityCheckModal checks={checks} onClose={closeModal} />}
      {modal === 'matrix' && <PermissionMatrixModal onClose={closeModal} />}
      {modal === 'totp' && (
        <TotpSetupModal
          accountEmail={admin.email}
          onClose={closeModal}
          onConfirm={() => {
            reconfigureTotp();
            setModal(null);
            showToast(t('profile.page.the2faAuthenticatorApp'));
          }}
        />
      )}
      {modal === 'backupCodes' && (
        <BackupCodesModal
          codes={details.backupCodes}
          accountEmail={admin.email}
          onClose={closeModal}
          onRegenerate={() => {
            const codes = regenerateBackupCodes();
            showToast(t('profile.page.generatedNewBackupCodes', { length: codes.length }));
          }}
        />
      )}
      {modal === 'addKey' && (
        <AddSecurityKeyModal
          keyCount={securityKeys.length}
          onAdd={handleAddKey}
          onClose={closeModal}
        />
      )}
      {modal === 'revoke' && (
        <ConfirmModal
          title={t('profile.page.signOutAllOther')}
          confirmLabel={t('profile.page.signOutOtherDevices')}
          confirmIcon="devices"
          onConfirm={handleRevoke}
          onClose={closeModal}
        >
          {t('profile.page.allSessionsExceptCurrent', { device: currentSession?.device })}
        </ConfirmModal>
      )}
    </div>
  );
}
