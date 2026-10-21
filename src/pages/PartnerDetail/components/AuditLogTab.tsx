import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { PartnerAuditEntry } from '@/types';
import { formatDayTime } from '@/utils/format';

export default function AuditLogTab({ entries }: { entries: PartnerAuditEntry[] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {t('partnerDetail.auditLogTab.auditLog')}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t('partnerDetail.auditLogTab.everyActionPartnerAccount')}
          </p>
        </div>
        <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {t('partnerDetail.auditLogTab.events', { count: entries.length })}
        </span>
      </div>

      <ol className="relative space-y-5 pl-8 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-surface-container-high">
        {entries.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute top-0 -left-8 flex h-7 w-7 items-center justify-center rounded-full bg-primary-container/10 text-primary ring-4 ring-surface-container-lowest">
              <Icon name={entry.icon} className="text-[16px]" />
            </span>
            <p className="font-body-md text-body-md text-on-surface">{entry.text}</p>
            <div className="mt-0.5 flex items-center gap-2 font-label-sm text-label-sm text-outline">
              <span>{formatDayTime(entry.time)}</span>
              <span>•</span>
              <span>{entry.actor}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
