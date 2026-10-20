import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { AdminAccountDetails, AdminSession, SecurityKey } from '../../../types/admin';
import { formatDate, toIsoDate } from '../../../utils/format';
import ProfileCardHeader, { PROFILE_CARD_CLASS } from './ProfileCardHeader';
import SessionHistoryTable from './SessionHistoryTable';

interface TwoFactorCardProps {
  details: AdminAccountDetails;
  securityKeys: SecurityKey[];
  sessions: AdminSession[];
  onReconfigureTotp: () => void;
  onShowBackupCodes: () => void;
  onAddKey: () => void;
  onRevokeOthers: () => void;
}

const SMALL_BUTTON_CLASS =
  'rounded-full px-space-md py-1.5 font-label-sm text-label-sm font-semibold transition-colors hover:bg-surface-container';

interface MethodBoxProps {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
  description: string;
  actions: ReactNode;
}

function MethodBox({ icon, title, subtitle, status, description, actions }: MethodBoxProps) {
  return (
    <div className="flex flex-col justify-between gap-space-md rounded-2xl bg-surface-container-low p-space-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-xs">
            <Icon name={icon} className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {title}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-container">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {status}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}

export default function TwoFactorCard({
  details,
  securityKeys,
  sessions,
  onReconfigureTotp,
  onShowBackupCodes,
  onAddKey,
  onRevokeOthers,
}: TwoFactorCardProps) {
  const primaryKey = securityKeys[0];

  return (
    <div className={PROFILE_CARD_CLASS}>
      <ProfileCardHeader
        icon="security_update_good"
        title="Bảo mật 2 lớp & Khóa xác thực"
        description="Các phương thức xác thực đa yếu tố bắt buộc đối với tài khoản quản trị cấp cao nhất"
      />
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <MethodBox
          icon="phone_android"
          title="Google Authenticator / 2FA"
          subtitle="Mã xác thực TOTP"
          status="Đang bật"
          description={`Ứng dụng xác minh sinh mã mỗi 30 giây được kích hoạt từ ngày ${formatDate(
            toIsoDate(new Date(details.totpEnabledAt)),
          )}.`}
          actions={
            <>
              <button
                type="button"
                onClick={onReconfigureTotp}
                className={`${SMALL_BUTTON_CLASS} bg-surface-container-lowest text-primary`}
              >
                Cấu hình lại
              </button>
              <button
                type="button"
                onClick={onShowBackupCodes}
                className={`${SMALL_BUTTON_CLASS} text-on-surface-variant`}
              >
                Mã dự phòng ({details.backupCodes.length})
              </button>
            </>
          }
        />
        <MethodBox
          icon="usb"
          title="Khóa phần cứng FIDO2"
          subtitle={primaryKey?.name ?? 'Chưa liên kết'}
          status={`${securityKeys.length} Đã liên kết`}
          description={
            primaryKey
              ? `Serial ${primaryKey.serial}. Khóa cắm trực tiếp qua cổng USB-C trước khi phê duyệt giao dịch nhạy cảm.${
                  securityKeys.length > 1
                    ? ` Có thêm ${securityKeys.length - 1} khóa dự phòng.`
                    : ''
                }`
              : 'Liên kết khóa FIDO2 để phê duyệt giao dịch nhạy cảm.'
          }
          actions={
            <button
              type="button"
              onClick={onAddKey}
              className={`${SMALL_BUTTON_CLASS} bg-surface-container-lowest text-primary`}
            >
              Thêm khóa dự phòng
            </button>
          }
        />
      </div>
      <SessionHistoryTable sessions={sessions} onRevokeOthers={onRevokeOthers} />
    </div>
  );
}
