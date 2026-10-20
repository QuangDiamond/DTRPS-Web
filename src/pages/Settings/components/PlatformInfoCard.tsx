import Icon from '../../../components/common/Icon';
import { PLATFORM_INFO, TIMEZONE_OPTIONS } from '../../../constants/settings';
import { useToast } from '../../../hooks/useToast';
import type { SystemSettings } from '../../../types/admin';
import { formatNumber, formatPercent } from '../../../utils/format';
import type { SettingsFieldChange } from '../settingsUtils';
import SettingsCard from './SettingsCard';

const INPUT_CLASS =
  'h-11 w-full rounded-xl bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20';
const LABEL_CLASS = 'mb-1.5 block font-label-md text-label-md text-on-surface-variant';

interface PlatformInfoCardProps {
  values: SystemSettings;
  nameError?: string;
  onChange: SettingsFieldChange;
}

export default function PlatformInfoCard({ values, nameError, onChange }: PlatformInfoCardProps) {
  const { showToast } = useToast();
  const storagePercent = (PLATFORM_INFO.storageUsedGb / PLATFORM_INFO.storageTotalGb) * 100;

  return (
    <SettingsCard
      icon="hub"
      title="Thông tin nền tảng Smart Travel"
      description="Thông số nhận diện và định danh hạt nhân cốt lõi"
      aside={
        <button
          type="button"
          title="Thông tin phiên bản"
          onClick={() =>
            showToast(
              `${values.platformName} • ${PLATFORM_INFO.releaseCode} • ${PLATFORM_INFO.dataCenter}`,
              'info',
            )
          }
          className="text-outline transition-colors hover:text-primary"
        >
          <Icon name="info" />
        </button>
      }
    >
      <div className="space-y-space-md">
        <div>
          <label className={LABEL_CLASS}>Tên hiển thị hệ thống toàn quốc</label>
          <div className="relative">
            <input
              type="text"
              value={values.platformName}
              onChange={(event) => onChange('platformName', event.target.value)}
              aria-invalid={Boolean(nameError)}
              className={`${INPUT_CLASS} pr-10 ${nameError ? 'ring-2 ring-error/40' : ''}`}
            />
            <Icon name="dns" className="absolute top-3 right-3 text-[18px] text-outline" />
          </div>
          {nameError && (
            <span className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-error">
              <Icon name="error" className="text-[14px]" /> {nameError}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Mã phiên bản (Release Code)</label>
            <div className="flex h-11 items-center justify-between rounded-xl bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface">
              <span className="font-semibold text-primary">{PLATFORM_INFO.releaseCode}</span>
              <Icon name="verified_user" className="text-[18px] text-primary" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Múi giờ vận hành (Timezone)</label>
            <div className="relative">
              <select
                value={values.timezone}
                onChange={(event) => {
                  const next = TIMEZONE_OPTIONS.find(
                    (option) => option.value === event.target.value,
                  );
                  if (next) onChange('timezone', next.value);
                }}
                className={`${INPUT_CLASS} cursor-pointer appearance-none pr-9 focus:ring-0`}
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="pointer-events-none absolute top-3 right-3 text-[18px] text-outline"
              />
            </div>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Ngôn ngữ mặc định &amp; Fallback</label>
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
            <div
              title="Ngôn ngữ chính của hệ thống, không thể tắt"
              className="flex items-center justify-between rounded-xl bg-surface-container-low p-space-sm"
            >
              <div className="flex items-center gap-space-sm">
                <span className="flex h-4 w-6 items-center justify-center rounded bg-error/20 text-[10px] font-bold text-error">
                  VN
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Tiếng Việt (Chính)
                </span>
              </div>
              <Icon name="check_circle" className="text-[18px] text-primary" />
            </div>
            <button
              type="button"
              aria-pressed={values.englishFallback}
              onClick={() => onChange('englishFallback', !values.englishFallback)}
              className="flex items-center justify-between rounded-xl bg-surface-container-low p-space-sm text-left transition-colors hover:bg-surface-container-high"
            >
              <div className="flex items-center gap-space-sm">
                <span className="flex h-4 w-6 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary">
                  EN
                </span>
                <span
                  className={`font-label-md text-label-md font-semibold ${values.englishFallback ? 'text-on-surface' : 'text-outline'}`}
                >
                  English (Dự phòng)
                </span>
              </div>
              <Icon
                name={values.englishFallback ? 'check_circle' : 'radio_button_unchecked'}
                className={`text-[18px] ${values.englishFallback ? 'text-primary' : 'text-outline'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low/70 p-space-md">
          <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>Dung lượng lưu trữ Cache POI &amp; Assets CDN</span>
            <span className="font-semibold text-on-surface">
              {formatNumber(PLATFORM_INFO.storageUsedGb)} GB /{' '}
              {formatNumber(PLATFORM_INFO.storageTotalGb)} GB (
              {formatPercent(PLATFORM_INFO.storageUsedGb, PLATFORM_INFO.storageTotalGb)})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
