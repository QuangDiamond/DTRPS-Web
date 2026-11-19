import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FilterSelect, Icon, Pagination } from '@/components/common';
import { useToast } from '@/hooks';
import {
  ISSUE_STATUS_CLASS,
  ISSUE_STATUSES,
  money,
  PAGE_SIZE,
  SEARCH_DELAY_MS,
} from '@/pages/AdPayments/adPaymentUtils';
import { adAdminService } from '@/services/adAdminService';
import type { AdminPaymentIssue, Paged, SelectOption } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatTimestamp } from '@/utils/format';
import { EmptyRow, Pill, ReasonModal, SearchBox, TableCard } from './AdParts';

type Action = { issue: AdminPaymentIssue; type: 'activate' | 'reject' };

/** Tab Sự cố: đối tác báo đã chuyển tiền mà đơn chưa được ghi nhận */
export default function IssuesTab({
  reload,
  onChanged,
  initialKeyword = '',
}: {
  /** Mở từ ghi chú kích hoạt tay: tìm sẵn theo mã đơn, xem mọi trạng thái */
  initialKeyword?: string;
  reload: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [result, setResult] = useState<Paged<AdminPaymentIssue> | null>(null);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [search, setSearch] = useState(initialKeyword);
  const [status, setStatus] = useState(initialKeyword ? 'all' : 'OPEN');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<Action | null>(null);
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
    adAdminService
      .paymentIssues({ keyword: search, status, page: page - 1, size: PAGE_SIZE })
      .then((next) => active && setResult(next))
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'));
    return () => {
      active = false;
    };
  }, [search, status, page, reload, showToast]);

  const statusOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('adAdmin.all') },
      ...ISSUE_STATUSES.map((value) => ({ value, label: t(`adAdmin.issues.status.${value}`) })),
    ],
    [t],
  );

  const reconcile = async (issue: AdminPaymentIssue) => {
    setBusyId(issue.id);
    try {
      const next = await adAdminService.reconcileIssue(issue.id);
      showToast(
        t(
          next.status === 'RESOLVED'
            ? 'adAdmin.issues.reconcilePaid'
            : 'adAdmin.issues.reconcileUnpaid',
        ),
        next.status === 'RESOLVED' ? 'success' : 'info',
      );
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirm = async (reason: string, reference: string) => {
    if (!action) return;
    setBusyId(action.issue.id);
    try {
      if (action.type === 'activate') {
        await adAdminService.activateIssue(action.issue.id, reference, reason);
        showToast(t('adAdmin.issues.activated'));
      } else {
        await adAdminService.rejectIssue(action.issue.id, reason);
        showToast(t('adAdmin.issues.rejected'));
      }
      setAction(null);
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const th = 'px-4 py-4 font-semibold';
  const activating = action?.type === 'activate';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
        <Icon name="info" className="text-[20px] text-primary" />
        <p className="font-body-sm text-body-sm">{t('adAdmin.issues.notice')}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-end">
        <SearchBox value={keyword} placeholder={t('adAdmin.issues.search')} onChange={setKeyword} />
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
              itemLabel={t('adAdmin.issues.items')}
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
            <th className={th}>{t('adAdmin.issues.transfer')}</th>
            <th className={th}>{t('adAdmin.issues.receipt')}</th>
            <th className={th}>{t('adAdmin.statusLabel')}</th>
            <th className={`${th} text-right`}>{t('adAdmin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {result?.items.length === 0 && <EmptyRow colSpan={6} />}
          {result?.items.map((issue) => {
            const mismatch = issue.transferredAmount !== issue.amount;
            return (
              <tr key={issue.id} className="align-top hover:bg-surface-container-low/60">
                <td className="px-4 py-3 font-body-md text-body-md font-semibold text-on-surface">
                  #{issue.orderCode}
                  <span className="block font-body-sm text-[12px] font-normal text-on-surface-variant">
                    {issue.packageName} · {money(issue.amount)}
                  </span>
                  <span className="block font-body-sm text-[12px] font-normal text-on-surface-variant">
                    {t(`adAdmin.payments.status.${issue.paymentStatus}`)}
                  </span>
                </td>
                <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                  {issue.businessName}
                </td>
                <td className="max-w-[260px] px-4 py-3 font-body-sm text-body-sm text-on-surface">
                  <span className={`font-semibold ${mismatch ? 'text-error' : ''}`}>
                    {money(issue.transferredAmount)}
                  </span>
                  {mismatch && (
                    <span className="block text-[12px] text-error">
                      {t('adAdmin.issues.amountMismatch')}
                    </span>
                  )}
                  <span className="block text-on-surface-variant">
                    {formatTimestamp(issue.transferredAt)}
                  </span>
                  <span className="block break-all text-on-surface-variant">
                    {issue.bankReference}
                  </span>
                  {issue.note && (
                    <span className="mt-1 block whitespace-pre-line text-on-surface-variant italic">
                      “{issue.note}”
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a href={issue.receiptUrl} target="_blank" rel="noreferrer">
                    <img
                      src={issue.receiptUrl}
                      alt={t('adAdmin.issues.receipt')}
                      className="h-16 w-16 rounded-lg object-cover hover:opacity-80"
                    />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Pill
                    label={t(`adAdmin.issues.status.${issue.status}`)}
                    className={ISSUE_STATUS_CLASS[issue.status]}
                  />
                  {issue.resolutionNote && (
                    <p className="mt-1.5 max-w-[200px] font-body-sm text-[12px] text-on-surface-variant">
                      {issue.resolutionNote}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {issue.status === 'OPEN' && (
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="sync"
                        loading={busyId === issue.id && !action}
                        onClick={() => void reconcile(issue)}
                      >
                        {t('adAdmin.payments.reconcile')}
                      </Button>
                      <Button
                        size="sm"
                        icon="task_alt"
                        onClick={() => setAction({ issue, type: 'activate' })}
                      >
                        {t('adAdmin.issues.activate')}
                      </Button>
                      <Button
                        size="sm"
                        variant="neutral"
                        icon="block"
                        onClick={() => setAction({ issue, type: 'reject' })}
                      >
                        {t('adAdmin.issues.reject')}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableCard>

      {action && (
        <ReasonModal
          title={t(activating ? 'adAdmin.issues.activateTitle' : 'adAdmin.issues.rejectTitle', {
            order: action.issue.orderCode,
          })}
          description={t(activating ? 'adAdmin.issues.activateHint' : 'adAdmin.issues.rejectHint')}
          confirmLabel={t(activating ? 'adAdmin.issues.activate' : 'adAdmin.issues.reject')}
          danger={!activating}
          withReference={activating}
          referenceLabel={t('adAdmin.issues.bankReference')}
          busy={busyId === action.issue.id}
          onConfirm={(reason, reference) => void confirm(reason, reference)}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}
