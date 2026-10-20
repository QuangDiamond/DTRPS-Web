import { LISTING_SLA_OPTIONS } from '../../../constants/settings';
import type { SystemSettings } from '../../../types/admin';
import type { SettingsFieldChange } from '../settingsUtils';
import SettingsCard from './SettingsCard';
import SettingToggleRow from './SettingToggleRow';

interface ListingSlaCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
}

const STANDARD_SLA = 24;

export default function ListingSlaCard({ values, onChange }: ListingSlaCardProps) {
  return (
    <SettingsCard
      icon="assignment_turned_in"
      title="Quy chuẩn Thẩm định Niêm yết (Listing SLA)"
      description="Ràng buộc chất lượng dịch vụ du lịch và cơ chế xét duyệt hồ sơ đối tác"
      aside={
        <span className="shrink-0 rounded-full bg-tertiary-fixed px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
          {values.listingSlaHours === STANDARD_SLA
            ? 'SLA Strict'
            : `SLA ${values.listingSlaHours}h`}
        </span>
      }
    >
      <div className="space-y-2">
        <span className="block font-label-md text-label-md text-on-surface-variant">
          Thời gian cam kết xử lý duyệt hồ sơ đối tác (SLA)
        </span>
        <div className="grid grid-cols-3 gap-space-sm">
          {LISTING_SLA_OPTIONS.map((hours) => {
            const selected = values.listingSlaHours === hours;
            return (
              <label
                key={hours}
                className={`flex cursor-pointer flex-wrap items-center justify-center gap-2 rounded-xl p-space-md font-label-md text-label-md transition-all ${
                  selected
                    ? 'bg-secondary-fixed/40 text-on-secondary-fixed-variant shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <input
                  type="radio"
                  name="sla_time"
                  value={hours}
                  checked={selected}
                  onChange={() => onChange('listingSlaHours', hours)}
                  className="h-4 w-4 accent-primary"
                />
                <span className={selected ? 'font-bold' : ''}>{hours} Giờ</span>
                {hours === STANDARD_SLA && (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] text-on-primary">
                    Tiêu chuẩn
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-space-sm pt-2">
        <SettingToggleRow
          icon="policy"
          title="Yêu cầu tối thiểu GPKD & Chứng nhận PCCC"
          description="Tự động từ chối nếu hồ sơ pháp lý đối tác lưu trú/tour chưa có con dấu thẩm quyền"
          checked={values.requireLegalDocs}
          onChange={(checked) => onChange('requireLegalDocs', checked)}
        />
        <SettingToggleRow
          icon="pin_drop"
          title="Kiểm tra trùng lặp tọa độ GPS bán kính < 50m"
          description="Kích hoạt Geofencing AI để gắn cờ các cơ sở duplicate hoặc spam địa điểm"
          checked={values.gpsDuplicateCheck}
          onChange={(checked) => onChange('gpsDuplicateCheck', checked)}
        />
        <SettingToggleRow
          icon="forward_to_inbox"
          title="Tự động gửi email thông báo kết quả cho đối tác"
          description="Kèm theo checklist chi tiết nếu hồ sơ niêm yết yêu cầu chỉnh sửa thông tin"
          checked={values.autoEmailPartnerResult}
          onChange={(checked) => onChange('autoEmailPartnerResult', checked)}
        />
      </div>
    </SettingsCard>
  );
}
