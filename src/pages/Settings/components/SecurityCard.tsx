import Icon from '../../../components/common/Icon';
import { PLATFORM_INFO, SESSION_TIMEOUT_OPTIONS } from '../../../constants/settings';
import type { SystemSettings } from '../../../types/admin';
import type { SettingsFieldChange } from '../settingsUtils';
import IpWhitelistField from './IpWhitelistField';
import SettingsCard from './SettingsCard';
import SettingToggleRow from './SettingToggleRow';

interface SecurityCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
  /** Tắt 2FA cần xác nhận ở trang cha */
  onRequestDisable2fa: () => void;
}

export default function SecurityCard({ values, onChange, onRequestDisable2fa }: SecurityCardProps) {
  return (
    <SettingsCard
      icon="shield"
      title="Bảo mật Cổng Quản trị"
      description="Quy tắc xác thực, kiểm soát truy cập và phòng vệ hạ tầng"
      aside={
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-container">
          <Icon name="lock" className="text-[14px]" />
          SOC2 Type II
        </span>
      }
    >
      <div className="space-y-space-md">
        <SettingToggleRow
          icon="password"
          title="Xác thực 2 bước 2FA (TOTP Authenticator)"
          description="Bắt buộc cho toàn bộ Quản trị viên Super Admin, Kiểm duyệt viên & Hỗ trợ"
          checked={values.twoFactorRequired}
          showStatus
          onChange={(checked) =>
            checked ? onChange('twoFactorRequired', true) : onRequestDisable2fa()
          }
        />

        <div>
          <span className="mb-1.5 block font-label-md text-label-md text-on-surface-variant">
            Thời gian tự động đăng xuất khi không thao tác
          </span>
          <div className="grid grid-cols-3 gap-space-sm">
            {SESSION_TIMEOUT_OPTIONS.map((minutes) => {
              const selected = values.sessionTimeoutMinutes === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange('sessionTimeoutMinutes', minutes)}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                    selected
                      ? 'bg-secondary-fixed/40 font-bold text-on-secondary-fixed-variant shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {selected && <Icon name="timer" className="text-[16px]" />}
                  <span>{minutes} Phút</span>
                </button>
              );
            })}
          </div>
        </div>

        <IpWhitelistField
          entries={values.ipWhitelist}
          onChange={(entries) => onChange('ipWhitelist', entries)}
        />

        <div className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md">
          <div className="flex items-center gap-space-sm">
            <Icon name="history_toggle_off" className="text-[20px] text-primary" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Nhật ký kiểm toán bảo mật
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Lưu trữ tự động phân tán, chống sửa đổi
              </span>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-space-sm py-1 font-label-sm text-label-sm font-bold text-primary">
            <Icon name="check" className="text-[14px]" />
            {PLATFORM_INFO.auditLogRetentionDays} ngày (đang bật)
          </span>
        </div>
      </div>
    </SettingsCard>
  );
}
