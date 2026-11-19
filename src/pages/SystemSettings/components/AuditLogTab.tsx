import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, FilterSelect, Icon, Pagination } from '@/components/common';
import {
  listingReviewPath,
  partnerDetailPath,
  placeDetailPath,
  ROUTES,
  userDetailPath,
} from '@/constants/routes';
import { useToast } from '@/hooks';
import { SearchBox, TableCard } from '@/pages/AdPayments/components/AdParts';
import {
  actionGroup,
  humanize,
  inputClass,
  todayInput,
  validateAuditRange,
} from '@/pages/SystemSettings/systemSettingsUtils';
import { systemAdminService } from '@/services/systemAdminService';
import type { AuditFilters, AuditLogItem, Paged, SelectOption, TranslationKey } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatTimestamp } from '@/utils/format';
import i18n from 'i18next';

const PAGE_SIZE = 20;
const SEARCH_DELAY_MS = 400;

/** Trang admin mở được cho từng loại đối tượng; loại khác chỉ hiện chữ */
const TARGET_LINK: Record<string, (id: number) => string> = {
  places: (id) => placeDetailPath(String(id)),
  users: (id) => userDetailPath(String(id)),
  business_profiles: (id) => partnerDetailPath(String(id)),
  business_listings: (id) => listingReviewPath(String(id)),
  listings: (id) => listingReviewPath(String(id)),
  payments: () => ROUTES.PAYMENTS,
  payment_issues: () => `${ROUTES.PAYMENTS}?tab=issues`,
  subscriptions: () => `${ROUTES.PAYMENTS}?tab=subscriptions`,
  advertisements: () => `${ROUTES.PAYMENTS}?tab=advertisements`,
  ad_packages: () => `${ROUTES.PAYMENTS}?tab=packages`,
  place_reviews: () => ROUTES.REVIEWS,
  place_categories: () => ROUTES.PLACE_CATEGORIES,
};

/** Nhãn đã dịch nếu có, không thì tự đọc từ mã (LISTING_APPROVED → Listing Approved) */
function useLabel() {
  const { t } = useTranslation();
  return (prefix: string, code: string) => {
    const key = `${prefix}.${code}`;
    return i18n.exists(key) ? t(key as TranslationKey) : humanize(code);
  };
}

/** Mô tả dài thu gọn, bấm để xem hết */
function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140;
  return (
    <div className="max-w-[420px] font-body-sm text-[12px] leading-[18px] text-on-surface-variant">
      <span className={`break-words whitespace-pre-line ${open || !long ? '' : 'line-clamp-2'}`}>
        {text}
      </span>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-0.5 font-semibold text-primary hover:underline"
        >
          {open ? '−' : '+'}
        </button>
      )}
    </div>
  );
}

/** Nhật ký hoạt động: ai làm gì, lúc nào, với đối tượng nào, lý do */
export default function AuditLogTab({ reload }: { reload: number }) {
  const { t } = useTranslation();
  const label = useLabel();
  const { showToast } = useToast();
  const [result, setResult] = useState<Paged<AuditLogItem> | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({ actions: [], actors: [] });
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [actor, setActor] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const rangeError = validateAuditRange(from, to);
  const today = todayInput();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(keyword.trim().slice(0, 100));
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    systemAdminService
      .auditFilters()
      .then(setFilters)
      .catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    if (rangeError) return;
    let active = true;
    setLoading(true);
    systemAdminService
      .auditLogs({
        keyword: search,
        action: action === 'all' ? undefined : action,
        actorId: actor === 'all' ? undefined : Number(actor),
        from,
        to,
        page: page - 1,
        size: PAGE_SIZE,
      })
      .then((next) => active && setResult(next))
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // rangeError là kết quả tính từ from/to
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, action, actor, from, to, page, reload, showToast]);

  const actionOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('systemSettings.audit.all') },
      ...filters.actions.map((value) => ({
        value,
        label: label('systemSettings.audit.actions', actionGroup(value)),
      })),
    ],
    // label đổi theo ngôn ngữ qua t
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.actions, t],
  );

  const actorOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('systemSettings.audit.all') },
      ...filters.actors.map((item) => ({
        value: String(item.id),
        label: item.name || item.email || `#${item.id}`,
      })),
    ],
    [filters.actors, t],
  );

  const filtered = keyword || action !== 'all' || actor !== 'all' || from || to;
  const clear = () => {
    setKeyword('');
    setSearch('');
    setAction('all');
    setActor('all');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const th = 'px-4 py-4 font-semibold';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <SearchBox
            value={keyword}
            placeholder={t('systemSettings.audit.search')}
            onChange={(value) => setKeyword(value.slice(0, 100))}
          />
          <div className="lg:w-56">
            <FilterSelect
              label={t('systemSettings.audit.action')}
              icon="bolt"
              value={action}
              options={actionOptions}
              onChange={(value) => {
                setAction(value);
                setPage(1);
              }}
            />
          </div>
          <div className="lg:w-56">
            <FilterSelect
              label={t('systemSettings.audit.actor')}
              icon="person"
              value={actor}
              options={actorOptions}
              onChange={(value) => {
                setActor(value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {(
            [
              ['audit-from', 'systemSettings.audit.from', from, setFrom],
              ['audit-to', 'systemSettings.audit.to', to, setTo],
            ] as const
          ).map(([id, labelKey, value, setValue]) => (
            <label key={id} htmlFor={id} className="flex flex-col gap-1 sm:w-48">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
                {t(labelKey)}
              </span>
              <input
                id={id}
                type="date"
                max={today}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setPage(1);
                }}
                aria-invalid={Boolean(rangeError)}
                className={inputClass(Boolean(rangeError))}
              />
            </label>
          ))}
          {filtered && (
            <Button variant="ghost" icon="filter_alt_off" onClick={clear}>
              {t('systemSettings.audit.clear')}
            </Button>
          )}
          {rangeError && (
            <p role="alert" className="flex items-center gap-1 font-body-sm text-[12px] text-error sm:pb-3">
              <Icon name="error" className="text-[14px]" />
              {t(rangeError.key)}
            </p>
          )}
        </div>
      </div>

      <TableCard
        footer={
          result && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={result.total}
              itemLabel={t('systemSettings.audit.items')}
              pageSizeOptions={[PAGE_SIZE]}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          )
        }
      >
        <thead>
          <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            <th className={th}>{t('systemSettings.audit.time')}</th>
            <th className={th}>{t('systemSettings.audit.actor')}</th>
            <th className={th}>{t('systemSettings.audit.action')}</th>
            <th className={th}>{t('systemSettings.audit.target')}</th>
            <th className={th}>{t('systemSettings.audit.detail')}</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y divide-surface-container transition-opacity ${loading ? 'opacity-60' : ''}`}
        >
          {result?.items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-14 text-center">
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <Icon name="manage_search" className="text-[40px] text-outline" />
                  <span className="font-title-md text-title-md">{t('systemSettings.audit.empty')}</span>
                </div>
              </td>
            </tr>
          )}
          {result?.items.map((log) => {
            const link =
              log.entityName && log.entityId !== null
                ? TARGET_LINK[log.entityName]?.(log.entityId)
                : undefined;
            const target = log.entityName
              ? `${label('systemSettings.audit.entities', log.entityName)}${
                  log.entityId !== null ? ` #${log.entityId}` : ''
                }`
              : '—';
            return (
              <tr key={log.id} className="align-top hover:bg-surface-container-low/60">
                <td className="px-4 py-3 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                  {formatTimestamp(log.createdAt)}
                </td>
                <td className="px-4 py-3 font-body-sm text-body-sm">
                  {log.actorId ? (
                    <>
                      <span className="block font-semibold text-on-surface">
                        {log.actorName || `#${log.actorId}`}
                      </span>
                      {log.actorEmail && (
                        <span className="block text-[12px] text-on-surface-variant">
                          {log.actorEmail}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-on-surface-variant italic">
                      {t('systemSettings.audit.system')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    title={log.action}
                    className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 font-label-sm text-[12px] font-semibold whitespace-nowrap text-primary"
                  >
                    {label('systemSettings.audit.actions', actionGroup(log.action))}
                    {log.action.startsWith('USER_STATUS_') &&
                      ` → ${log.action.slice('USER_STATUS_'.length)}`}
                  </span>
                </td>
                <td className="px-4 py-3 font-body-sm text-body-sm whitespace-nowrap">
                  {link ? (
                    <Link to={link} className="font-semibold text-primary hover:underline">
                      {target}
                    </Link>
                  ) : (
                    <span className="text-on-surface">{target}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {log.description ? (
                    <Description text={log.description} />
                  ) : (
                    <span className="text-outline">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableCard>
    </div>
  );
}
