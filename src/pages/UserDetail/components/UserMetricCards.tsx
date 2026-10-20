import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { UserProfile } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';

interface MetricCardProps {
  label: string;
  icon: string;
  iconClass: string;
  iconFilled?: boolean;
  value: string;
  unit: string;
  unitClass?: string;
  footer: ReactNode;
}

function MetricCard({
  label,
  icon,
  iconClass,
  iconFilled,
  value,
  unit,
  unitClass,
  footer,
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
          {label}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>
          <Icon name={icon} filled={iconFilled} className="text-[22px]" />
        </div>
      </div>
      <div className="mt-space-md">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display-lg text-display-lg font-bold text-on-surface">{value}</span>
          <span
            className={`font-title-md text-title-md ${unitClass ?? 'font-medium text-on-surface-variant'}`}
          >
            {unit}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function UserMetricCards({ profile }: { profile: UserProfile }) {
  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Chuyến đi đã tạo"
        icon="route"
        iconClass="bg-surface-container text-primary"
        value={formatNumber(profile.tripSummary.total)}
        unit="Lịch trình"
        footer={
          <>
            <span className="font-semibold text-primary">
              {profile.tripSummary.completed} hoàn thành
            </span>
            <span>•</span>
            <span className="font-semibold text-tertiary">
              {profile.tripSummary.upcoming} sắp khởi hành
            </span>
          </>
        }
      />
      <MetricCard
        label="Địa điểm yêu thích (Saved)"
        icon="bookmark"
        iconFilled
        iconClass="bg-secondary-container/50 text-secondary"
        value={formatNumber(profile.savedPois)}
        unit="POI đã lưu"
        footer={
          <>
            <Icon name="share_location" className="text-[16px] text-primary" />
            <span>{profile.savedNote}</span>
          </>
        }
      />
      <MetricCard
        label="Đánh giá & Review"
        icon="reviews"
        iconClass="bg-tertiary-fixed/60 text-tertiary"
        value={formatNumber(profile.reviewCount)}
        unit="Đánh giá"
        footer={
          <>
            <Icon name="star" filled className="text-[16px] text-tertiary" />
            <span>
              Điểm trung bình{' '}
              <strong className="text-on-surface">{profile.avgRating.toFixed(1)} / 5.0</strong>
            </span>
          </>
        }
      />
      <MetricCard
        label="Chi tiêu qua hệ thống"
        icon="payments"
        iconClass="bg-surface-container text-primary"
        value={formatNumber(profile.totalSpend)}
        unit="đ"
        unitClass="font-bold text-primary"
        footer={
          <>
            <Icon name="hotel" className="text-[16px] text-primary" />
            <span>{profile.spendNote}</span>
          </>
        }
      />
    </div>
  );
}
