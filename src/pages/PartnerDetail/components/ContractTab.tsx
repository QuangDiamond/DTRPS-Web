import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { formatCurrencyVnd } from '@/pages/PartnerDetail/partnerProfileUtils';
import type { PartnerProfile } from '@/types';
import { formatDate, formatNumber } from '@/utils/format';

interface ContractTabProps {
  profile: PartnerProfile;
  onAdjustCommission: () => void;
}

function UsageBar({
  label,
  used,
  limit,
  format,
}: {
  label: string;
  used: number;
  limit: number;
  format: (value: number) => string;
}) {
  const percent = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const tone = percent >= 90 ? 'bg-error' : percent >= 70 ? 'bg-tertiary' : 'bg-primary';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-label-md text-label-md">
        <span className="font-semibold text-on-surface">{label}</span>
        <span className="text-on-surface-variant">
          {format(used)} / {format(limit)} <strong className="text-on-surface">({percent}%)</strong>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** Tab Hợp đồng & Hạn mức */
export default function ContractTab({ profile, onAdjustCommission }: ContractTabProps) {
  const { t } = useTranslation();
  const { agreement, contractLimits: limits } = profile;
  const facts = [
    { label: t('partnerDetail.contractTab.contractCode'), value: agreement.contractCode },
    { label: t('partnerDetail.contractTab.contractType'), value: agreement.type },
    { label: t('partnerDetail.contractTab.activatedOn'), value: formatDate(agreement.activatedAt) },
    { label: t('partnerDetail.contractTab.renewOn'), value: formatDate(agreement.renewAt) },
    { label: t('partnerDetail.contractTab.paymentCycle'), value: agreement.paymentCycle },
    { label: t('partnerDetail.contractTab.deposit'), value: formatCurrencyVnd(limits.depositVnd) },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="description" className="text-[22px] text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {t('partnerDetail.contractTab.agreement')}
          </h2>
        </div>
        <div className="mb-4 flex items-baseline gap-2 rounded-xl bg-secondary-container/50 p-4">
          <span className="font-display-sm text-[32px] font-bold text-primary">
            {agreement.commission}%
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('partnerDetail.contractTab.commissionRate')}
          </span>
        </div>
        <dl className="flex flex-col gap-3">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-center justify-between gap-3 font-body-sm text-body-sm"
            >
              <dt className="text-on-surface-variant">{fact.label}</dt>
              <dd className="text-right font-semibold text-on-surface">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onAdjustCommission}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
        >
          <Icon name="percent" className="text-[18px]" />
          {t('partnerDetail.contractTab.adjustCommission')}
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <Icon name="speed" className="text-[22px] text-primary" />
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {t('partnerDetail.contractTab.limits')}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t('partnerDetail.contractTab.limitsDescription')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <UsageBar
            label={t('partnerDetail.contractTab.creditLimit')}
            used={limits.creditUsedVnd}
            limit={limits.creditLimitVnd}
            format={formatCurrencyVnd}
          />
          <UsageBar
            label={t('partnerDetail.contractTab.monthlyBookings')}
            used={limits.monthlyBookings}
            limit={limits.monthlyBookingCap}
            format={formatNumber}
          />
          <UsageBar
            label={t('partnerDetail.contractTab.activeListings')}
            used={limits.activeListings}
            limit={limits.maxActiveListings}
            format={formatNumber}
          />
        </div>
      </div>
    </div>
  );
}
