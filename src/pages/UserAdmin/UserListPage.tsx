import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ErrorState,
  FilterSelect,
  Icon,
  PageHeader,
  PageLoader,
  Pagination,
  StatCard,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { PAGE_SIZE_OPTIONS } from '@/constants/partner';
import { userDetailPath } from '@/constants/routes';
import { useAuth } from '@/hooks';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { adminUserService } from '@/services/adminUserService';
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStats,
  AdminUserStatus,
  Paged,
  SelectOption,
} from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber } from '@/utils/format';
import { UserAvatar, UserRoleBadges, UserStatusBadge } from './components/UserBadges';
import { useUserLock } from './components/useUserLock';
import { ROLE_STYLE, STATUS_STYLE, USER_ROLES, USER_STATUSES } from './userAdminUtils';

const SEARCH_DELAY_MS = 350;
const EMPTY_STATS: AdminUserStats = {
  total: 0,
  active: 0,
  suspended: 0,
  travellers: 0,
  businessOwners: 0,
  admins: 0,
  newThisMonth: 0,
};

/** Quản lý người dùng: /admin/users — dữ liệu thật từ /api/admin/users */
export default function UserListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [stats, setStats] = useState<AdminUserStats>(EMPTY_STATS);
  const [role, setRole] = useState<AdminUserRole | 'all'>('all');
  const [status, setStatus] = useState<AdminUserStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [result, setResult] = useState<Paged<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const access = useUserLock(() => setVersion((n) => n + 1));

  useEffect(() => {
    let active = true;
    adminUserService
      .stats()
      .then((next) => active && setStats(next))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [version]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(keyword);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminUserService
      .list({ keyword: search, role, status, page: page - 1, size: pageSize })
      .then((next) => {
        if (!active) return;
        setResult(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, role, status, page, pageSize, version]);

  const roleOptions = useMemo<SelectOption<AdminUserRole | 'all'>[]>(
    () => [
      { value: 'all', label: t('userAdmin.filters.all') },
      ...USER_ROLES.map((value) => ({ value, label: t(ROLE_STYLE[value].labelKey) })),
    ],
    [t],
  );
  const statusOptions = useMemo<SelectOption<AdminUserStatus | 'all'>[]>(
    () => [
      { value: 'all', label: t('userAdmin.filters.all') },
      ...USER_STATUSES.map((value) => ({ value, label: t(STATUS_STYLE[value].labelKey) })),
    ],
    [t],
  );

  const th = 'py-4 font-semibold';
  const hint = (text: string) => (
    <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">{text}</p>
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.users'), icon: 'group' }]}
          eyebrow={t('userAdmin.header.eyebrow')}
          eyebrowNote={t('userAdmin.header.eyebrowNote')}
          title={t('userAdmin.header.title')}
          description={t('userAdmin.header.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={() => setVersion((n) => n + 1)}>
              {t('userAdmin.header.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('userAdmin.stats.total')}
          value={formatNumber(stats.total)}
          icon="group"
          iconClassName="bg-surface-container-high text-primary"
          footer={hint(t('userAdmin.stats.totalHint', { count: stats.newThisMonth }))}
        />
        <StatCard
          label={t('userAdmin.stats.travellers')}
          value={formatNumber(stats.travellers)}
          icon="luggage"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={hint(t('userAdmin.stats.travellersHint'))}
        />
        <StatCard
          label={t('userAdmin.stats.owners')}
          value={formatNumber(stats.businessOwners)}
          icon="storefront"
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          footer={hint(t('userAdmin.stats.ownersHint'))}
        />
        <StatCard
          label={t('userAdmin.stats.suspended')}
          value={formatNumber(stats.suspended)}
          icon="lock"
          iconClassName="bg-error-container text-on-error-container"
          footer={hint(t('userAdmin.stats.suspendedHint'))}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
            {t('userAdmin.filters.searchLabel')}
          </span>
          <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
            <Icon name="search" className="text-[20px] text-outline" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('userAdmin.filters.searchPlaceholder')}
              className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
          </span>
        </label>
        <div className="md:w-52">
          <FilterSelect
            label={t('userAdmin.filters.role')}
            icon="badge"
            value={role}
            options={roleOptions}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          />
        </div>
        <div className="md:w-52">
          <FilterSelect
            label={t('userAdmin.filters.status')}
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

      {error && !result ? (
        <ErrorState
          title={t('userAdmin.detail.loadError')}
          message={error}
          onRetry={() => setVersion((n) => n + 1)}
        />
      ) : !result ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                  <th className={`${th} px-6`}>{t('userAdmin.table.user')}</th>
                  <th className={`${th} px-4`}>{t('userAdmin.table.phone')}</th>
                  <th className={`${th} px-4`}>{t('userAdmin.table.roles')}</th>
                  <th className={`${th} px-4`}>{t('userAdmin.table.joined')}</th>
                  <th className={`${th} px-4`}>{t('userAdmin.table.status')}</th>
                  <th className={`${th} px-6 text-right`}>{t('userAdmin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <Icon name="person_search" className="text-[40px] text-outline" />
                        <span className="font-title-md text-title-md">
                          {t('userAdmin.table.empty')}
                        </span>
                        <span className="font-body-sm text-body-sm">
                          {t('userAdmin.table.emptyHint')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result.items.map((user) => {
                    const isSelf = admin?.email === user.email;
                    return (
                      <tr key={user.id} className="hover:bg-surface-container-low/60">
                        <td className="px-6 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(userDetailPath(user.id))}
                            className="flex items-center gap-3 text-left"
                          >
                            <UserAvatar user={user} />
                            <span className="flex flex-col">
                              <span className="font-title-md text-title-md text-on-surface hover:text-primary">
                                {user.name}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {user.email}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                          {user.phone ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <UserRoleBadges roles={user.roles} />
                        </td>
                        <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                          {user.createdAt ? displayDate(user.createdAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <UserStatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="visibility"
                              onClick={() => navigate(userDetailPath(user.id))}
                            >
                              {t('userAdmin.table.view')}
                            </Button>
                            {!isSelf &&
                              (user.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon="lock"
                                  onClick={() => access.lock(user)}
                                >
                                  {t('userAdmin.table.lock')}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon="lock_open"
                                  onClick={() => access.unlock(user)}
                                >
                                  {t('userAdmin.table.unlock')}
                                </Button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={result.total}
            itemLabel={t('userAdmin.table.items')}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}

      {access.dialogs}
    </div>
  );
}
