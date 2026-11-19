import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FilterSelect, Icon, Pagination, StatCard } from '@/components/common';
import { useToast } from '@/hooks';
import {
  money,
  PAGE_SIZE,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUSES,
  SEARCH_DELAY_MS,
} from '@/pages/AdPayments/adPaymentUtils';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { adAdminService } from '@/services/adAdminService';
import type { AdminAdPayment, AdPaymentStats, Paged, SelectOption } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber } from '@/utils/format';
import { EmptyRow, Pill, ReasonModal, SearchBox, TableCard } from './AdParts';

/** Tab Giao dịch: doanh thu, đối soát với PayOS, ghi nhận hoàn tiền */
export default function PaymentsTab({
  reload,
  onChanged,
  initialReview,
}: {
  reload: number;
  onChanged: () => void;
  initialReview: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdPaymentStats | null>(null);
  const [result, setResult] = useState<Paged<AdminAdPayment> | null>(null);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [review, setReview] = useState(initialReview);
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<AdminAdPayment | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(keyword);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    Promise.all([
      adAdminService.paymentStats(),
      adAdminService.payments({
        keyword: search,
        status,
        type,
        review,
        page: page - 1,
        size: PAGE_SIZE,
      }),
    ])
      .then(([nextStats, nextResult]) => {
        if (!active) return;
        setStats(nextStats);
        setResult(nextResult);
      })
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'));
    return () => {
      active = false;
    };
  }, [search, status, type, review, page, reload, showToast]);

  const statusOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('adAdmin.all') },
      ...PAYMENT_STATUSES.map((value) => ({
        value,
        label: t(`adAdmin.payments.status.${value}`),
      })),
    ],
    [t],
  );
  const typeOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('adAdmin.all') },
      { value: 'INITIAL', label: t('adAdmin.payments.type.INITIAL') },
      { value: 'RENEWAL', label: t('adAdmin.payments.type.RENEWAL') },
    ],
    [t],
  );

  const reconcile = async (payment: AdminAdPayment) => {
    setBusyId(payment.id);
    try {
      await adAdminService.reconcile(payment.id);
      showToast(t('adAdmin.payments.reconciled'));
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const refund = async (reason: string, reference: string) => {
    if (!refunding) return;
    setBusyId(refunding.id);
    try {
      await adAdminService.refund(refunding.id, reason, reference);
      showToast(t('adAdmin.payments.refunded'));
      setRefunding(null);
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const th = 'px-4 py-4 font-semibold';
  const hint = (text: string) => (
    <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">{text}</p>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('adAdmin.payments.revenue')}
          value={money(stats?.revenueThisMonth ?? 0)}
          icon="payments"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={hint(t('adAdmin.payments.revenueHint'))}
        />
        <StatCard
          label={t('adAdmin.payments.success')}
          value={formatNumber(stats?.success ?? 0)}
          icon="task_alt"
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          footer={hint(t('adAdmin.payments.successHint'))}
        />
        <StatCard
          label={t('adAdmin.payments.pending')}
          value={formatNumber(stats?.pending ?? 0)}
          icon="hourglass_top"
          iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={hint(t('adAdmin.payments.pendingHint'))}
        />
        <StatCard
          label={t('adAdmin.payments.review')}
          value={formatNumber(stats?.needsReview ?? 0)}
          icon="warning"
          iconClassName="bg-error-container text-on-error-container"
          footer={hint(t('adAdmin.payments.reviewHint'))}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-end">
        <SearchBox
          value={keyword}
          placeholder={t('adAdmin.payments.search')}
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
        <div className="lg:w-48">
          <FilterSelect
            label={t('adAdmin.payments.typeLabel')}
            icon="category"
            value={type}
            options={typeOptions}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
          />
        </div>
        <label className="flex h-10 cursor-pointer items-center gap-2 font-label-md text-label-md text-on-surface">
          <input
            type="checkbox"
            checked={review}
            onChange={(event) => {
              setReview(event.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-[#075C66]"
          />
          {t('adAdmin.payments.reviewOnly')}
        </label>
      </div>

      <TableCard
        footer={
          result && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={result.total}
              itemLabel={t('adAdmin.payments.items')}
              pageSizeOptions={[PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          )
        }
      >
        <thead>
          <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            <th className={th}>{t('adAdmin.payments.order')}</th>
            <th className={th}>{t('adAdmin.partner')}</th>
            <th className={th}>{t('adAdmin.package')}</th>
            <th className={th}>{t('adAdmin.payments.amount')}</th>
            <th className={th}>{t('adAdmin.statusLabel')}</th>
            <th className={th}>{t('adAdmin.payments.time')}</th>
            <th className={`${th} text-right`}>{t('adAdmin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {result?.items.length === 0 && <EmptyRow colSpan={7} />}
          {result?.items.map((payment) => (
            <tr key={payment.id} className="align-top hover:bg-surface-container-low/60">
              <td className="px-4 py-3 font-body-md text-body-md font-semibold text-on-surface">
                #{payment.orderCode}
                {payment.bankReference && (
                  <span className="block font-body-sm text-[12px] font-normal text-on-surface-variant">
                    {payment.bankReference}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                {payment.businessName}
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">
                {payment.packageName}
                <span className="block text-on-surface-variant">
                  {t(`adAdmin.payments.type.${payment.type}`)}
                </span>
              </td>
              <td className="px-4 py-3 font-body-md text-body-md font-semibold whitespace-nowrap text-on-surface">
                {money(payment.amount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill
                    label={t(`adAdmin.payments.status.${payment.status}`)}
                    className={PAYMENT_STATUS_CLASS[payment.status]}
                  />
                  {payment.gatewayStatus === 'MANUAL' && (
                    <span
                      title={t('adAdmin.payments.manualHint')}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap text-amber-800"
                    >
                      <Icon name="back_hand" className="text-[14px]" />
                      {t('adAdmin.payments.manual')}
                    </span>
                  )}
                </div>
                {payment.needsReview && (
                  <p className="mt-1.5 flex max-w-[220px] items-start gap-1 font-body-sm text-[12px] text-error">
                    <Icon name="warning" className="text-[15px]" />
                    {payment.reviewNote}
                  </p>
                )}
                {payment.refundReason && (
                  <p className="mt-1.5 max-w-[220px] font-body-sm text-[12px] text-on-surface-variant">
                    {payment.refundReason} ({payment.refundReference})
                  </p>
                )}
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                {displayDate(payment.paidAt ?? payment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="sync"
                    loading={busyId === payment.id}
                    onClick={() => void reconcile(payment)}
                  >
                    {t('adAdmin.payments.reconcile')}
                  </Button>
                  {payment.status === 'SUCCESS' && (
                    <Button
                      size="sm"
                      variant="neutral"
                      icon="currency_exchange"
                      onClick={() => setRefunding(payment)}
                    >
                      {t('adAdmin.payments.refund')}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {refunding && (
        <ReasonModal
          title={t('adAdmin.payments.refundTitle', { order: refunding.orderCode })}
          description={t('adAdmin.payments.refundHint')}
          confirmLabel={t('adAdmin.payments.refund')}
          danger
          withReference
          busy={busyId === refunding.id}
          onConfirm={(reason, reference) => void refund(reason, reference)}
          onClose={() => setRefunding(null)}
        />
      )}
    </div>
  );
}
