import Icon from '../../../components/common/Icon';
import { PLATFORM_INFO } from '../../../constants/settings';
import { useAuth } from '../../../hooks/useAuth';
import { SETTINGS_CARD_SHADOW } from './SettingsCard';

export default function AdminIdentityBanner({ onOpenMatrix }: { onOpenMatrix: () => void }) {
  const { admin } = useAuth();

  return (
    <div
      className={`flex flex-col items-center justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg md:flex-row ${SETTINGS_CARD_SHADOW}`}
    >
      <div className="flex items-center gap-space-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-sm">
          <Icon name="shield_person" className="text-[28px]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-title-md text-title-md font-bold text-on-surface">
              {admin?.role ?? 'Super Admin'} Quyền Lực Cao Nhất
            </span>
            <span className="rounded-full bg-primary/10 px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-primary">
              Root Role
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Tài khoản: <strong>{admin?.email ?? 'admin@smarttravel.vn'}</strong> • Khóa bảo mật phần
            cứng {PLATFORM_INFO.hardwareKey}: <strong>Đã gắn kết</strong>
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenMatrix}
        className="flex items-center gap-1.5 rounded-xl bg-surface-container-low px-space-md py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
      >
        <Icon name="manage_accounts" className="text-[18px]" />
        <span>Xem ma trận phân quyền</span>
      </button>
    </div>
  );
}
