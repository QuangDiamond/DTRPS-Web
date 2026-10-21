import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { SettingsMeta } from '@/types';
import { formatTimestamp } from '@/utils/format';

interface SettingsFooterProps {
  meta: SettingsMeta;
  dirtyCount: number;
  onCancel: () => void;
  onSave: () => void;
}

/** Thanh xác nhận dính ở đáy màn hình */
export default function SettingsFooter({
  meta,
  dirtyCount,
  onCancel,
  onSave,
}: SettingsFooterProps) {
  const { t } = useTranslation();
  return (
    <footer className="sticky bottom-4 z-30 flex flex-col items-center justify-between gap-space-md rounded-2xl bg-surface-container-lowest/95 p-space-md shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row">
      <div className="flex min-w-0 items-center gap-space-sm">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            dirtyCount > 0
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-secondary-fixed text-on-secondary-fixed'
          }`}
        >
          <Icon name={dirtyCount > 0 ? 'edit_note' : 'update'} className="text-[18px]" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-label-md text-label-md font-semibold text-on-surface">
            {dirtyCount > 0
              ? t('settings.settingsFooter.unsavedChangesSettingsGroups', { count: dirtyCount })
              : t('settings.settingsFooter.lastConfigurationUpdate', {
                  updatedAt: formatTimestamp(meta.updatedAt),
                })}
          </span>
          <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
            {dirtyCount > 0
              ? t('settings.settingsFooter.lastSaved', {
                  updatedAt: formatTimestamp(meta.updatedAt),
                })
              : t('settings.settingsFooter.updatedBy', { updatedBy: meta.updatedBy })}
          </span>
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-space-sm sm:w-auto">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-surface-container-high px-space-md py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          {t('settings.settingsFooter.cancel')}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg"
        >
          <Icon name="check_circle" className="text-[18px]" />
          <span>{t('settings.settingsFooter.saveConfigurationChanges')}</span>
        </button>
      </div>
    </footer>
  );
}
