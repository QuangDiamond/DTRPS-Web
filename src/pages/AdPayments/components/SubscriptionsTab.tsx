import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, FilterSelect, Icon, Pagination } from '@/components/common';
import { useToast } from '@/hooks';
import {
  money,
  PAGE_SIZE,
  SEARCH_DELAY_MS,
  SUBSCRIPTION_STATUS_CLASS,
  SUBSCRIPTION_STATUSES,
} from '@/pages/AdPayments/adPaymentUtils';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { adAdminService } from '@/services/adAdminService';
import type { AdminAdSubscription, ManualActivation, Paged, SelectOption } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { EmptyRow, Pill, ReasonModal, SearchBox, TableCard } from './AdParts';

/** Ghi chú dưới nhãn: phiếu sự cố, mã giao dịch ngân hàng, ai kích hoạt, lúc nào */
function ManualNote({ activation }: { activation: ManualActivation }) {
  const { t } = useTranslation();
  const parts = [
    activation.bankReference &&
      t('adAdmin.subscriptions.manual.bankRef', { ref: activation.bankReference }),
    activation.handledBy &&
      t('adAdmin.subscriptions.manual.by', { name: activation.handledBy }),
    activation.activatedAt && displayDate(activation.activatedAt),
  ].filter(Boolean);
  return (
    <div className="mt-1.5 max-w-[260px] rounded-lg bg-amber-50 px-2.5 py-1.5 font-body-sm text-[12px] leading-[17px] text-amber-900">
      <Link
        to={`?tab=issues&q=${encodeURIComponent(activation.orderCode)}`}
        className="font-semibold underline-offset-2 hover:underline"
      >
        {activation.issueId
          ? t('adAdmin.subscriptions.manual.issue', {
              id: activation.issueId,
              order: activation.orderCode,
            })
          : t('adAdmin.subscriptions.manual.order', { order: activation.orderCode })}
      </Link>
      {parts.length > 0 && <span className="block">{parts.join(' · ')}</span>}
      {activation.reason && (
        <span className="mt-0.5 block text-amber-800/80 italic">“{activation.reason}”</span>
      )}
    </div>
  );
}

/** Tab Gói đang chạy: thời hạn, lượt đã dùng, huỷ gói */
export default function SubscriptionsTab({
  reload,
  onChanged,
}: {
  reload: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [result, setResult] = useState<Paged<AdminAdSubscription> | null>(null);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminAdSubscription | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(keyword);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    adAdminService
      .subscriptions({ keyword: search, status, page: page - 1, size: PAGE_SIZE })
      .then((next) => active && setResult(next))
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'));
    return () => {
      active = false;
    };
  }, [search, status, page, reload, showToast]);

  const statusOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('adAdmin.all') },
      ...SUBSCRIPTION_STATUSES.map((value) => ({
        value,
        label: t(`adAdmin.subscriptions.status.${value}`),
      })),
      // Lọc gói admin kích hoạt tay, bất kể còn chạy hay đã kết thúc (để đối soát)
      { value: 'MANUAL', label: t('adAdmin.subscriptions.manual.filter') },
    ],
    [t],
  );

  const cancel = async (reason: string) => {
    if (!target) return;
    setBusy(true);
    try {
      await adAdminService.cancelSubscription(target.id, reason);
      showToast(t('adAdmin.subscriptions.cancelled'));
      setTarget(null);
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  const th = 'px-4 py-4 font-semibold';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-end">
        <SearchBox
          value={keyword}
          placeholder={t('adAdmin.subscriptions.search')}
          onChange={setKeyword}
        />
        <div className="lg:w-48">
          <FilterSelect
            label={t('adAdmin.statusLabel')}
            icon="toggle_on"
            value={status}
            options={statusOptions}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <TableCard
        footer={
          result && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={result.total}
              itemLabel={t('adAdmin.subscriptions.items')}
              pageSizeOptions={[PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          )
        }
      >
        <thead>
          <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            <th className={th}>{t('adAdmin.partner')}</th>
            <th className={th}>{t('adAdmin.package')}</th>
            <th className={th}>{t('adAdmin.subscriptions.period')}</th>
            <th className={th}>{t('adAdmin.subscriptions.slots')}</th>
            <th className={th}>{t('adAdmin.statusLabel')}</th>
            <th className={`${th} text-right`}>{t('adAdmin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {result?.items.length === 0 && <EmptyRow colSpan={6} />}
          {result?.items.map((item) => (
            <tr key={item.id} className="align-top hover:bg-surface-container-low/60">
              <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                {item.businessName}
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">
                {item.packageName}
                <span className="block text-on-surface-variant">{money(item.price)}</span>
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                {displayDate(item.startDate)} – {displayDate(item.endDate)}
                {item.status === 'ACTIVE' && (
                  <span className="block font-semibold text-on-surface">
                    {t('adAdmin.subscriptions.daysLeft', { count: item.daysLeft })}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-body-md text-body-md font-semibold text-on-surface">
                {item.usedSlots}/{item.maxPlaces}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill
                    label={t(`adAdmin.subscriptions.status.${item.status}`)}
                    className={SUBSCRIPTION_STATUS_CLASS[item.status]}
                  />
                  {item.manualActivation && (
                    <span
                      title={item.manualActivation.reason ?? undefined}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap text-amber-800"
                    >
                      <Icon name="back_hand" className="text-[14px]" />
                      {t('adAdmin.subscriptions.manual.badge')}
                    </span>
                  )}
                </div>
                {item.manualActivation && (
                  <ManualNote activation={item.manualActivation} />
                )}
                {item.cancelReason && (
                  <p className="mt-1.5 max-w-[220px] font-body-sm text-[12px] text-on-surface-variant">
                    {item.cancelReason}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {item.status === 'ACTIVE' && (
                  <Button size="sm" variant="ghost" icon="block" onClick={() => setTarget(item)}>
                    {t('adAdmin.subscriptions.cancel')}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {target && (
        <ReasonModal
          title={t('adAdmin.subscriptions.cancelTitle', { name: target.businessName })}
          description={t('adAdmin.subscriptions.cancelHint')}
          confirmLabel={t('adAdmin.subscriptions.cancel')}
          danger
          busy={busy}
          onConfirm={(reason) => void cancel(reason)}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
