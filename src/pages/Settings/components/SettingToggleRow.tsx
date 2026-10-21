import { useTranslation } from 'react-i18next';
import { Icon, ToggleSwitch } from '@/components/common';

interface SettingToggleRowProps {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Hiện nhãn "Đã kích hoạt" / "Đã tắt" cạnh công tắc */
  showStatus?: boolean;
}

export default function SettingToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
  showStatus = false,
}: SettingToggleRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md">
      <div className="flex items-start gap-space-sm">
        <Icon name={icon} className="mt-0.5 text-[20px] text-primary" />
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-semibold text-on-surface">{title}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{description}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {showStatus && (
          <span
            className={`hidden font-label-sm text-label-sm font-bold sm:inline ${checked ? 'text-primary' : 'text-outline'}`}
          >
            {checked
              ? t('settings.settingToggleRow.enabled')
              : t('settings.settingToggleRow.disabled')}
          </span>
        )}
        <ToggleSwitch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}
