import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { formatCurrencyVnd } from '@/pages/PartnerDetail/partnerProfileUtils';
import type {
  PartnerTransaction,
  PartnerTransactionStatus,
  PartnerTransactionType,
  TranslationKey,
} from '@/types';
import { formatDayTime } from '@/utils/format';

interface TransactionHistoryTabProps {
  transactions: PartnerTransaction[];
  onViewListings: () => void;
}

const TYPE_CONFIG: Record<
  PartnerTransactionType,
  { labelKey: TranslationKey; icon: string; sign: 1 | -1 }
> = {
  booking: {
    labelKey: 'partnerDetail.historyTab.types.booking',
    icon: 'confirmation_number',
    sign: 1,
  },
  commission: { labelKey: 'partnerDetail.historyTab.types.commission', icon: 'percent', sign: 1 },
  payout: { labelKey: 'partnerDetail.historyTab.types.payout', icon: 'account_balance', sign: -1 },
  refund: { labelKey: 'partnerDetail.historyTab.types.refund', icon: 'undo', sign: -1 },
};

const STATUS_CONFIG: Record<
  PartnerTransactionStatus,
  { labelKey: TranslationKey; className: string }
> = {
  completed: {
    labelKey: 'partnerDetail.historyTab.statuses.completed',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  pending: {
    labelKey: 'partnerDetail.historyTab.statuses.pending',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  failed: {
    labelKey: 'partnerDetail.historyTab.statuses.failed',
    className: 'bg-error-container text-on-error-container',
  },
};

/** Tab Lịch sử hợp tác & Giao dịch */
export default function TransactionHistoryTab({
  transactions,
  onViewListings,
}: TransactionHistoryTabProps) {
  const { t } = useTranslation();
  const completed = transactions.filter((item) => item.status === 'completed');
  const bookingTotal = completed
    .filter((item) => item.type === 'booking')
    .reduce((sum, item) => sum + item.amountVnd, 0);
  const payoutTotal = completed
    .filter((item) => item.type === 'payout')
    .reduce((sum, item) => sum + item.amountVnd, 0);

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {t('partnerDetail.historyTab.title')}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t('partnerDetail.historyTab.description')}
          </p>
        </div>
        <button
          type="button"
          onClick={onViewListings}
          className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 py-2 font-label-md text-label-md font-semibold text-primary hover:bg-surface-container"
        >
          <Icon name="map" className="text-[18px]" />
          {t('partnerDetail.page.viewPartnerSPlaces')}
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-container-low p-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {t('partnerDetail.historyTab.bookingRevenue')}
          </span>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">
            {formatCurrencyVnd(bookingTotal)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {t('partnerDetail.historyTab.paidOut')}
          </span>
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">
            {formatCurrencyVnd(payoutTotal)}
          </p>
        </div>
      </div>

      <div className="table-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-surface-container font-label-sm text-label-sm font-semibold tracking-wider whitespace-nowrap text-on-surface-variant uppercase">
              <th className="py-2.5 pr-3">{t('partnerDetail.historyTab.columns.transaction')}</th>
              <th className="px-3 py-2.5">{t('partnerDetail.historyTab.columns.time')}</th>
              <th className="px-3 py-2.5">{t('partnerDetail.historyTab.columns.reference')}</th>
              <th className="px-3 py-2.5 text-right">
                {t('partnerDetail.historyTab.columns.amount')}
              </th>
              <th className="py-2.5 pl-3 text-right">
                {t('partnerDetail.historyTab.columns.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => {
              const type = TYPE_CONFIG[item.type];
              const status = STATUS_CONFIG[item.status];
              return (
                <tr
                  key={item.id}
                  className="border-b border-surface-container/60 font-body-sm text-body-sm last:border-0"
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
                        <Icon name={type.icon} className="text-[16px]" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{t(type.labelKey)}</span>
                        <span className="font-mono text-[11px] text-outline">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-on-surface-variant">
                    {formatDayTime(item.date)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-on-surface-variant">
                    {item.reference}
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${type.sign > 0 ? 'text-primary' : 'text-on-surface'}`}
                  >
                    {type.sign > 0 ? '+' : '−'}
                    {formatCurrencyVnd(item.amountVnd)}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold whitespace-nowrap ${status.className}`}
                    >
                      {t(status.labelKey)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
