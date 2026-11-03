import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { Partner, TranslationKey } from '@/types';
import { toDisplayDate } from '@/pages/Partners/partnerUtils';
import PartnerStatusBadge from './PartnerStatusBadge';

interface PartnerTableProps {
  partners: Partner[];
  loading: boolean;
  onView: (partner: Partner) => void;
  onApprove: (partner: Partner) => void;
  onReject: (partner: Partner) => void;
  onLock: (partner: Partner) => void;
  onUnlock: (partner: Partner) => void;
  footer?: ReactNode;
}

const COLUMNS: { labelKey: TranslationKey; className: string }[] = [
  { labelKey: 'partnerAdmin.table.business', className: 'px-6' },
  { labelKey: 'partnerAdmin.table.taxCode', className: 'px-4' },
  { labelKey: 'partnerAdmin.table.contact', className: 'px-4' },
  { labelKey: 'partnerAdmin.table.submitted', className: 'px-4' },
  { labelKey: 'partnerAdmin.table.status', className: 'px-4' },
  { labelKey: 'partnerAdmin.table.actions', className: 'px-6 text-right' },
];

const ACTION_CLASS =
  'inline-flex h-8 items-center gap-1 rounded-full px-3 font-label-sm text-label-sm font-semibold transition-colors';

export default function PartnerTable({
  partners,
  loading,
  onView,
  onApprove,
  onReject,
  onLock,
  onUnlock,
  footer,
}: PartnerTableProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <div className="table-scroll w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) => (
                <th key={column.labelKey} className={`py-4 font-semibold ${column.className}`}>
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-surface-container transition-opacity ${loading ? 'opacity-50' : ''}`}
          >
            {partners.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('partners.partnerTable.noMatchingPartnersFound')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('partners.partnerTable.tryChangingKeywordOr')}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr
                  key={partner.id}
                  className="group transition-colors hover:bg-surface-container-low/60"
                >
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onView(partner)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                        <Icon name="storefront" className="text-[20px]" />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface group-hover:text-primary">
                          {partner.name}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {t('partnerAdmin.table.owner', { name: partner.ownerName })}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4 font-body-md text-body-md text-on-surface tabular-nums">
                    {partner.taxCode || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col font-body-sm text-body-sm">
                      <span className="text-on-surface">{partner.email || '—'}</span>
                      <span className="text-on-surface-variant">{partner.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-body-sm text-body-sm text-on-surface-variant">
                    {toDisplayDate(partner.joinedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <PartnerStatusBadge status={partner.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {partner.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(partner)}
                            className={`${ACTION_CLASS} bg-primary text-on-primary hover:bg-primary-container`}
                          >
                            <Icon name="verified" className="text-[16px]" />
                            {t('partnerAdmin.actions.approve')}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(partner)}
                            className={`${ACTION_CLASS} bg-error-container text-on-error-container hover:bg-error-container/70`}
                          >
                            {t('partnerAdmin.actions.reject')}
                          </button>
                        </>
                      )}
                      {partner.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => onLock(partner)}
                          className={`${ACTION_CLASS} text-error hover:bg-error-container/50`}
                        >
                          <Icon name="lock" className="text-[16px]" />
                          {t('partnerAdmin.actions.lock')}
                        </button>
                      )}
                      {partner.status === 'suspended' && (
                        <button
                          type="button"
                          onClick={() => onUnlock(partner)}
                          className={`${ACTION_CLASS} text-primary hover:bg-secondary-container/60`}
                        >
                          <Icon name="lock_open" className="text-[16px]" />
                          {t('partnerAdmin.actions.unlock')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onView(partner)}
                        title={t('partnerAdmin.actions.view')}
                        aria-label={t('partnerAdmin.actions.view')}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
