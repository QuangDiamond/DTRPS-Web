import type { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { DASHBOARD_CARD_CLASS } from '@/pages/Dashboard/dashboardUtils';
import type { ActivityItem, ActivityKind } from '@/types';
import { formatRelativeTime } from '@/utils/format';

interface ActivityFeedProps {
  activities: ActivityItem[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface ActivityConfig {
  markerClass: string;
  dotClass: string;
  /** Kiểu nhấn mạnh tên đối tượng trong câu (thẻ <bold> / <highlight> trong bản dịch) */
  emphasis: Record<string, ReactElement>;
  meta?: 'businessAccount' | 'published' | 'inQueue';
}

const BOLD = { bold: <span className="font-semibold" /> };
const STRONG = { bold: <strong className="font-semibold" /> };

const ACTIVITY_CONFIG: Record<ActivityKind, ActivityConfig> = {
  partner_registered: {
    markerClass: 'bg-secondary-container',
    dotClass: 'bg-primary',
    emphasis: { highlight: <strong className="font-semibold text-primary" /> },
    meta: 'businessAccount',
  },
  listing_approved: {
    markerClass: 'bg-secondary-container',
    dotClass: 'bg-secondary',
    emphasis: BOLD,
    meta: 'published',
  },
  listing_rejected: {
    markerClass: 'bg-error-container',
    dotClass: 'bg-error',
    emphasis: BOLD,
  },
  listing_submitted: {
    markerClass: 'bg-tertiary-fixed',
    dotClass: 'bg-tertiary',
    emphasis: STRONG,
    meta: 'inQueue',
  },
};

function ActivityMeta({ kind }: { kind: NonNullable<ActivityConfig['meta']> }) {
  const { t } = useTranslation();
  if (kind === 'published') {
    return (
      <span className="inline-flex items-center gap-0.5 font-label-sm text-[11px] font-bold text-primary">
        <Icon name="check" className="text-[14px]" /> {t('dashboard.activity.published')}
      </span>
    );
  }
  if (kind === 'inQueue') {
    return (
      <span className="font-label-sm text-[11px] font-bold text-tertiary">
        {t('dashboard.activity.inQueue')}
      </span>
    );
  }
  return (
    <span className="font-label-sm text-[11px] text-on-surface-variant">
      {t('dashboard.activity.businessAccount')}
    </span>
  );
}

export default function ActivityFeed({ activities, refreshing, onRefresh }: ActivityFeedProps) {
  const { t } = useTranslation();
  return (
    <div className={`${DASHBOARD_CARD_CLASS} flex flex-col justify-between xl:col-span-4`}>
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="history" className="text-[22px] text-primary" />
            <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
              {t('dashboard.activity.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            title={t('dashboard.activity.refresh')}
          >
            <Icon name="refresh" className={`text-[19px] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dòng thời gian */}
        <div className="relative max-h-[420px] space-y-6 overflow-y-auto pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-surface-container-high before:content-['']">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.kind];
            const time = (
              <span className="font-label-sm text-[11px] text-outline">
                {formatRelativeTime(activity.createdAt)}
              </span>
            );
            return (
              <div key={activity.id} className="relative">
                <div
                  className={`absolute top-1 -left-6 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-surface-container-lowest ${config.markerClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                </div>
                <div className="flex flex-col">
                  <p className="font-body-md text-[13px] leading-snug text-on-surface">
                    <Trans
                      i18nKey={`dashboard.activity.${activity.kind}`}
                      values={{ subject: activity.subject }}
                      components={config.emphasis}
                    />
                  </p>
                  {activity.reason && (
                    <p className="mt-1 rounded-lg bg-error-container/40 p-2 font-body-sm text-[12px] leading-relaxed text-error">
                      {t('dashboard.activity.reason', { reason: activity.reason })}
                    </p>
                  )}
                  {config.meta ? (
                    <div className="mt-1 flex items-center gap-2">
                      {time}
                      <span className="text-[11px] text-outline">•</span>
                      <ActivityMeta kind={config.meta} />
                    </div>
                  ) : (
                    <div className="mt-1">{time}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
