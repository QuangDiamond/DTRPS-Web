import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, PageHeader, StatCard } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { listingReviewPath, ROUTES, userDetailPath } from '@/constants/routes';
import { useListingReview, usePartners } from '@/hooks';
import { ListingStatusBadge } from '@/pages/PlaceReview/components/StatusBadges';
import { coverOf, displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { UserAvatar, UserRoleBadges } from '@/pages/UserAdmin/components/UserBadges';
import { adminUserService } from '@/services/adminUserService';
import { listingReviewService } from '@/services/listingReviewService';
import { placeCatalogService } from '@/services/placeCatalogService';
import type {
  AdminUser,
  AdminUserStats,
  CatalogStats,
  CategoryGroupRef,
  ReviewListing,
} from '@/types';
import { formatNumber } from '@/utils/format';

interface Overview {
  users: AdminUserStats | null;
  places: CatalogStats | null;
  groups: CategoryGroupRef[];
  pendingListings: ReviewListing[];
  recentUsers: AdminUser[];
}

const EMPTY: Overview = {
  users: null,
  places: null,
  groups: [],
  pendingListings: [],
  recentUsers: [],
};

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          <Icon name={icon} className="text-[22px] text-primary" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Bảng điều khiển: /admin/dashboard — tổng hợp từ các API thật */
export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats: partnerStats } = usePartners();
  const { stats: reviewStats, refreshStats } = useListingReview();
  const [overview, setOverview] = useState<Overview>(EMPTY);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    // Mỗi nguồn tải độc lập: một nguồn lỗi không làm trống cả trang
    const settle = <T,>(promise: Promise<T>, apply: (value: T) => Partial<Overview>) =>
      promise
        .then((value) => {
          if (active) setOverview((current) => ({ ...current, ...apply(value) }));
        })
        .catch(() => undefined);
    void settle(adminUserService.stats(), (users) => ({ users }));
    void settle(placeCatalogService.stats(), (places) => ({ places }));
    void settle(placeCatalogService.categories(), (groups) => ({ groups }));
    void settle(
      listingReviewService.listListings({ status: 'pending', keyword: '', page: 0, size: 5 }),
      (page) => ({ pendingListings: page.items }),
    );
    void settle(adminUserService.list({ page: 0, size: 5 }), (page) => ({
      recentUsers: page.items,
    }));
    return () => {
      active = false;
    };
  }, [retry]);

  const refresh = () => {
    refreshStats();
    setRetry((n) => n + 1);
  };

  const { users, places, groups, pendingListings, recentUsers } = overview;
  const pendingTotal = partnerStats.pending + reviewStats.pending + reviewStats.pendingRevisions;
  const todos = [
    {
      key: 'partners',
      icon: 'business_center',
      label: t('adminDashboard.todo.partners'),
      count: partnerStats.pending,
      to: ROUTES.PARTNERS,
    },
    {
      key: 'listings',
      icon: 'add_location_alt',
      label: t('adminDashboard.todo.listings'),
      count: reviewStats.pending,
      to: `${ROUTES.LISTINGS}?tab=listings&status=pending`,
    },
    {
      key: 'revisions',
      icon: 'edit_location_alt',
      label: t('adminDashboard.todo.revisions'),
      count: reviewStats.pendingRevisions,
      to: `${ROUTES.LISTINGS}?tab=revisions&status=pending`,
    },
  ];
  const groupMax = Math.max(1, ...Object.values(places?.byGroup ?? {}));
  const hint = (text: string) => (
    <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">{text}</p>
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.dashboard'), icon: 'dashboard' }]}
          eyebrow={t('adminDashboard.header.eyebrow')}
          eyebrowNote={t('adminDashboard.header.eyebrowNote')}
          title={t('adminDashboard.header.title')}
          description={t('adminDashboard.header.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={refresh}>
              {t('adminDashboard.header.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('adminDashboard.kpi.users')}
          value={formatNumber(users?.total ?? 0)}
          icon="group"
          iconClassName="bg-surface-container-high text-primary"
          footer={hint(t('adminDashboard.kpi.usersHint', { count: users?.newThisMonth ?? 0 }))}
        />
        <StatCard
          label={t('adminDashboard.kpi.partners')}
          value={formatNumber(partnerStats.active)}
          icon="business_center"
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          footer={hint(t('adminDashboard.kpi.partnersHint', { count: partnerStats.pending }))}
        />
        <StatCard
          label={t('adminDashboard.kpi.places')}
          value={formatNumber(places?.active ?? 0)}
          icon="location_on"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={hint(
            t('adminDashboard.kpi.placesHint', { total: formatNumber(places?.total ?? 0) }),
          )}
        />
        <StatCard
          label={t('adminDashboard.kpi.pending')}
          value={formatNumber(pendingTotal)}
          icon="pending_actions"
          iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={hint(t('adminDashboard.kpi.pendingHint'))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          <Panel
            title={t('adminDashboard.recentListings.title')}
            icon="fact_check"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`${ROUTES.LISTINGS}?tab=listings&status=pending`)}
              >
                {t('adminDashboard.recentListings.viewAll')}
              </Button>
            }
          >
            {pendingListings.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('adminDashboard.recentListings.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-surface-container">
                {pendingListings.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      to={listingReviewPath(listing.id)}
                      className="flex items-center gap-3 py-3 hover:bg-surface-container-low/60"
                    >
                      {coverOf(listing) ? (
                        <img
                          src={coverOf(listing)}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-outline">
                          <Icon name="image" className="text-[20px]" />
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-title-md text-title-md text-on-surface">
                          {listing.name}
                        </span>
                        <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                          {listing.businessName} · {listing.province?.name ?? '—'} ·{' '}
                          {displayDate(listing.updatedAt)}
                        </span>
                      </span>
                      <ListingStatusBadge status={listing.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t('adminDashboard.groups.title')} icon="donut_large">
            {!places || places.total === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('adminDashboard.groups.empty')}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map((group) => {
                  const count = places.byGroup[group.code] ?? 0;
                  return (
                    <div key={group.code} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 font-body-md text-body-md text-on-surface">
                        {group.name}
                      </span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${(count / groupMax) * 100}%` }}
                        />
                      </span>
                      <span className="w-10 text-right font-title-md text-title-md text-on-surface">
                        {formatNumber(count)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-4">
          <Panel title={t('adminDashboard.todo.title')} icon="pending_actions">
            {pendingTotal === 0 && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('adminDashboard.todo.allDone')}
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {todos.map((todo) => (
                <li key={todo.key}>
                  <Link
                    to={todo.to}
                    className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3 hover:bg-surface-container"
                  >
                    <Icon name={todo.icon} className="text-[20px] text-primary" />
                    <span className="flex-1 font-body-md text-body-md text-on-surface">
                      {todo.label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-label-md text-label-md font-semibold ${
                        todo.count > 0
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {formatNumber(todo.count)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title={t('adminDashboard.recentUsers.title')}
            icon="person_add"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.USERS)}>
                {t('adminDashboard.recentUsers.viewAll')}
              </Button>
            }
          >
            {recentUsers.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('adminDashboard.recentUsers.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-surface-container">
                {recentUsers.map((user) => (
                  <li key={user.id}>
                    <Link
                      to={userDetailPath(user.id)}
                      className="flex items-center gap-3 py-3 hover:bg-surface-container-low/60"
                    >
                      <UserAvatar user={user} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-title-md text-title-md text-on-surface">
                          {user.name}
                        </span>
                        <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                          {user.createdAt ? displayDate(user.createdAt) : user.email}
                        </span>
                      </span>
                      <UserRoleBadges roles={user.roles} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
