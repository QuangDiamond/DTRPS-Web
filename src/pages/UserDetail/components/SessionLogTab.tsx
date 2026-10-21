import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { UserAuditEntry } from '@/types';
import { formatDayTime } from '@/utils/format';

export default function SessionLogTab({ entries }: { entries: UserAuditEntry[] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm">
      <h4 className="mb-space-md font-headline-sm text-headline-sm font-bold text-on-surface">
        {t('userDetail.sessionLogTab.securityLogSessionHistory')}
      </h4>
      <div className="flex flex-col gap-space-sm font-body-sm text-body-sm">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3"
          >
            <span className="flex items-center gap-2 text-on-surface">
              <Icon name={entry.icon} className="text-[18px] text-primary" />
              {entry.text}
            </span>
            <span className="shrink-0 text-outline">{formatDayTime(entry.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
