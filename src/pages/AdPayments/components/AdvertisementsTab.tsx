import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, FilterSelect, Pagination } from '@/components/common';
import { placeDetailPath } from '@/constants/routes';
import { useToast } from '@/hooks';
import {
  ADVERTISEMENT_STATUS_CLASS,
  ADVERTISEMENT_STATUSES,
  PAGE_SIZE,
  SEARCH_DELAY_MS,
} from '@/pages/AdPayments/adPaymentUtils';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { adAdminService } from '@/services/adAdminService';
import type { AdminAdvertisement, Paged, SelectOption } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { EmptyRow, Pill, ReasonModal, SearchBox, TableCard } from './AdParts';

/** Tab Quảng cáo: gỡ / bật lại địa điểm đang quảng cáo, bắt buộc có lý do */
export default function AdvertisementsTab({
  reload,
  onChanged,
}: {
  reload: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [result, setResult] = useState<Paged<AdminAdvertisement> | null>(null);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminAdvertisement | null>(null);
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
      .advertisements({ keyword: search, status, page: page - 1, size: PAGE_SIZE })
      .then((next) => active && setResult(next))
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'));
    return () => {
      active = false;
    };
  }, [search, status, page, reload, showToast]);

  const statusOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('adAdmin.all') },
      ...ADVERTISEMENT_STATUSES.map((value) => ({
        value,
        label: t(`adAdmin.advertisements.status.${value}`),
      })),
    ],
    [t],
  );

  const change = async (reason: string) => {
    if (!target) return;
    setBusy(true);
    try {
      await adAdminService.changeAdStatus(
        target.id,
        target.status === 'PUBLISHED' ? 'SUSPENDED' : 'PUBLISHED',
        reason,
      );
      showToast(t('adAdmin.advertisements.changed'));
      setTarget(null);
      onChanged();
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  const th = 'px-4 py-4 font-semibold';
  const hiding = target?.status === 'PUBLISHED';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-end">
        <SearchBox
          value={keyword}
          placeholder={t('adAdmin.advertisements.search')}
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
              itemLabel={t('adAdmin.advertisements.items')}
              pageSizeOptions={[PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          )
        }
      >
        <thead>
          <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            <th className={th}>{t('adAdmin.advertisements.place')}</th>
            <th className={th}>{t('adAdmin.partner')}</th>
            <th className={th}>{t('adAdmin.package')}</th>
            <th className={th}>{t('adAdmin.subscriptions.period')}</th>
            <th className={th}>{t('adAdmin.statusLabel')}</th>
            <th className={`${th} text-right`}>{t('adAdmin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {result?.items.length === 0 && <EmptyRow colSpan={6} />}
          {result?.items.map((ad) => (
            <tr key={ad.id} className="align-top hover:bg-surface-container-low/60">
              <td className="px-4 py-3">
                <Link
                  to={placeDetailPath(String(ad.placeId))}
                  className="font-body-md text-body-md font-semibold text-primary hover:underline"
                >
                  {ad.placeName}
                </Link>
              </td>
              <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                {ad.businessName}
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">
                {ad.packageName}
              </td>
              <td className="px-4 py-3 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                {displayDate(ad.startAt)} – {displayDate(ad.endAt)}
              </td>
              <td className="px-4 py-3">
                <Pill
                  label={t(`adAdmin.advertisements.status.${ad.status}`)}
                  className={ADVERTISEMENT_STATUS_CLASS[ad.status]}
                />
                {ad.suspendReason && (
                  <p className="mt-1.5 max-w-[220px] font-body-sm text-[12px] text-on-surface-variant">
                    {ad.suspendReason}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {ad.status !== 'EXPIRED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={ad.status === 'PUBLISHED' ? 'visibility_off' : 'visibility'}
                    onClick={() => setTarget(ad)}
                  >
                    {t(
                      ad.status === 'PUBLISHED'
                        ? 'adAdmin.advertisements.suspend'
                        : 'adAdmin.advertisements.restore',
                    )}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {target && (
        <ReasonModal
          title={target.placeName}
          description={t('adAdmin.advertisements.reasonHint')}
          confirmLabel={t(
            hiding ? 'adAdmin.advertisements.suspend' : 'adAdmin.advertisements.restore',
          )}
          danger={hiding}
          busy={busy}
          onConfirm={(reason) => void change(reason)}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
