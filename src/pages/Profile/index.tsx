import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Icon from '../../components/common/Icon';
import { ROUTES } from '../../constants/routes';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../hooks/useToast';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDayTime, todayIsoDate } from '../../utils/format';
import PermissionMatrixModal from '../Settings/components/PermissionMatrixModal';
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
      showToast(`Đã liên kết khóa ${key.name} (${key.serial})`);
    },
    [addSecurityKey, showToast],
  );

  const handleRevoke = () => {
    const count = revokeOtherSessions();
    setModal(null);
    showToast(
      count > 0
        ? `Đã thu hồi ${count} phiên trên các thiết bị khác. Thiết bị phải đăng nhập lại kèm 2FA.`
        : 'Không còn phiên nào khác cần thu hồi',
      count > 0 ? 'success' : 'info',
    );
  };

  const exportActivities = () => {
    downloadCsv(
      `nhat-ky-hoat-dong-${details.id}-${todayIsoDate()}.csv`,
      ['Mã', 'Thời gian', 'Hoạt động', 'Chi tiết', 'IP'],
      activities.map((item) => [
        item.id,
        formatDayTime(item.createdAt),
        item.title,
        item.detail,
        item.ip,
      ]),
    );
    showToast(`Đã xuất ${activities.length} dòng nhật ký hoạt động`);
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
          <span>Quản trị hệ thống</span>
        </Link>
        <Icon name="chevron_right" className="text-[14px] text-outline" />
        <div className="flex items-center gap-1">
          <Icon name="account_circle" className="text-[16px]" />
          <span>Hồ sơ quản trị viên</span>
        </div>
        <Icon name="chevron_right" className="text-[14px] text-outline" />
        <span className="font-semibold text-on-surface">
          Thông tin cá nhân &amp; Bảo mật tài khoản
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col justify-between gap-space-md pb-space-xs lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              Hồ sơ Cá nhân &amp; Bảo mật Quản trị viên
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container shadow-sm">
              <Icon name="verified" filled className="text-[15px]" />
              {admin.role} Root - Toàn quyền quản trị cao nhất
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Quản lý thông tin định danh, quyền hạn cấp cao trong hệ thống và thiết lập bảo mật 2 lớp
            2FA
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setModal('activity')}
            className={`${HEADER_BUTTON_CLASS} bg-surface-container-low text-primary hover:bg-surface-container-high`}
          >
            <Icon name="history" className="text-[18px]" />
            Nhật ký hoạt động
          </button>
          <button
            type="button"
            onClick={() => setModal('securityCheck')}
            className={`${HEADER_BUTTON_CLASS} bg-primary text-on-primary shadow-sm hover:bg-primary-container`}
          >
            <Icon name="security" className="text-[18px]" />
            Kiểm tra bảo mật hệ thống
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
            showToast('Đã liên kết lại ứng dụng xác thực 2FA thành công');
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
            showToast(`Đã tạo ${codes.length} mã dự phòng mới, mã cũ đã bị vô hiệu`);
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
          title="Đăng xuất khỏi tất cả thiết bị khác?"
          confirmLabel="Đăng xuất thiết bị khác"
          confirmIcon="devices"
          onConfirm={handleRevoke}
          onClose={closeModal}
        >
          Mọi phiên đăng nhập ngoài phiên hiện tại ({currentSession?.device}) sẽ bị thu hồi. Các
          thiết bị đó phải đăng nhập lại bằng mật khẩu và mã 2FA.
        </ConfirmModal>
      )}
    </div>
  );
}
