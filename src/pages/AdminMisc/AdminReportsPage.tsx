import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, PageHeader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { useListingReview, usePartners } from '@/hooks';
import { adminUserService } from '@/services/adminUserService';
import { placeCatalogService } from '@/services/placeCatalogService';
import type { AdminUserStats, CatalogStats, CategoryGroupRef } from '@/types';
import { formatNumber } from '@/utils/format';

interface Bar {
  label: string;
  value: number;
  className?: string;
}

function BreakdownCard({ title, icon, bars }: { title: string; icon: string; bars: Bar[] }) {
  const { t } = useTranslation();
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          <Icon name={icon} className="text-[22px] text-primary" />
          {title}
        </h2>
        <span className="font-label-md text-label-md text-on-surface-variant">
          {t('adminReports.total')}: {formatNumber(total)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="w-36 shrink-0 font-body-md text-body-md text-on-surface">
              {bar.label}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container">
              <span
                className={`block h-full rounded-full ${bar.className ?? 'bg-primary'}`}
                style={{ width: `${(bar.value / max) * 100}%` }}
              />
            </span>
            <span className="w-12 text-right font-title-md text-title-md text-on-surface">
              {formatNumber(bar.value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Báo cáo & Thống kê: /admin/reports — số liệu tổng hợp hiện tại từ API thật */
export default function AdminReportsPage() {
  const { t } = useTranslation();
  const { stats: partners } = usePartners();
  const { stats: listings, refreshStats } = useListingReview();
  const [users, setUsers] = useState<AdminUserStats | null>(null);
  const [places, setPlaces] = useState<CatalogStats | null>(null);
  const [groups, setGroups] = useState<CategoryGroupRef[]>([]);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    adminUserService
      .stats()
      .then((next) => active && setUsers(next))
      .catch(() => undefined);
    placeCatalogService
      .stats()
      .then((next) => active && setPlaces(next))
      .catch(() => undefined);
    placeCatalogService
      .categories()
      .then((next) => active && setGroups(next))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [retry]);

  const danger = 'bg-error';
  const warn = 'bg-tertiary';
  const muted = 'bg-outline';

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.reports'), icon: 'bar_chart' }]}
          eyebrow={t('adminReports.eyebrow')}
          eyebrowNote={t('adminReports.eyebrowNote')}
          title={t('adminReports.title')}
          description={t('adminReports.description')}
          actions={
            <Button
              variant="neutral"
              icon="refresh"
              onClick={() => {
                refreshStats();
                setRetry((n) => n + 1);
              }}
            >
              {t('adminReports.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BreakdownCard
          title={t('adminReports.users')}
          icon="group"
          bars={[
            { label: t('adminReports.label.travellers'), value: users?.travellers ?? 0 },
            { label: t('adminReports.label.owners'), value: users?.businessOwners ?? 0 },
            {
              label: t('adminReports.label.admins'),
              value: users?.admins ?? 0,
              className: warn,
            },
          ]}
        />
        <BreakdownCard
          title={t('adminReports.userStatus')}
          icon="manage_accounts"
          bars={[
            { label: t('adminReports.label.active'), value: users?.active ?? 0 },
            {
              label: t('adminReports.label.locked'),
              value: users?.suspended ?? 0,
              className: danger,
            },
          ]}
        />
        <BreakdownCard
          title={t('adminReports.partners')}
          icon="business_center"
          bars={[
            { label: t('adminReports.label.active'), value: partners.active },
            {
              label: t('adminReports.label.pending'),
              value: partners.pending,
              className: warn,
            },
            {
              label: t('adminReports.label.rejected'),
              value: partners.rejected,
              className: danger,
            },
            {
              label: t('adminReports.label.suspended'),
              value: partners.suspended,
              className: muted,
            },
          ]}
        />
        <BreakdownCard
          title={t('adminReports.listings')}
          icon="store_mall_directory"
          bars={[
            { label: t('adminReports.label.approved'), value: listings.approved },
            {
              label: t('adminReports.label.pending'),
              value: listings.pending,
              className: warn,
            },
            {
              label: t('adminReports.label.rejected'),
              value: listings.rejected,
              className: danger,
            },
            {
              label: t('adminReports.label.hidden'),
              value: listings.suspended,
              className: muted,
            },
          ]}
        />
        <BreakdownCard
          title={t('adminReports.placeGroups')}
          icon="donut_large"
          bars={groups.map((group) => ({
            label: group.name,
            value: places?.byGroup[group.code] ?? 0,
          }))}
        />
        <BreakdownCard
          title={t('adminReports.placeStatus')}
          icon="location_on"
          bars={[
            { label: t('adminReports.label.visible'), value: places?.active ?? 0 },
            {
              label: t('adminReports.label.draft'),
              value: places?.draft ?? 0,
              className: warn,
            },
            {
              label: t('adminReports.label.paused'),
              value: places?.paused ?? 0,
              className: muted,
            },
            {
              label: t('adminReports.label.partnerPlaces'),
              value: places?.partner ?? 0,
              className: 'bg-secondary',
            },
            {
              label: t('adminReports.label.adminPlaces'),
              value: places?.admin ?? 0,
              className: 'bg-secondary',
            },
          ]}
        />
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
        <Icon name="info" className="text-[20px] text-primary" />
        <p className="font-body-sm text-body-sm">{t('adminReports.note')}</p>
      </div>
    </div>
  );
}
