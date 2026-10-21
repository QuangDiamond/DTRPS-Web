import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { PARTNER_TYPE_CONFIG, PROVINCE_NAMES } from '@/constants/partner';
import { partnerDetailPath } from '@/constants/routes';
import { formatSigned, formatVndCompact, REPORT_CARD_CLASS } from '@/pages/Reports/reportUtils';
import type { PartnerPerformance } from '@/types';
import { formatNumber } from '@/utils/format';
import { getInitials } from '@/utils/string';

interface PartnerPerformanceCardProps {
  partners: PartnerPerformance[];
  /** Đối tác còn tồn tại trong hệ thống (để bật liên kết sang trang chi tiết) */
  knownPartnerIds: ReadonlySet<string>;
}

/** Bảng xếp hạng đối tác theo lượt đặt trong kỳ báo cáo */
export default function PartnerPerformanceCard({
  partners,
  knownPartnerIds,
}: PartnerPerformanceCardProps) {
  const { t } = useTranslation();
  const totalRevenue = partners.reduce((sum, partner) => sum + partner.revenueVnd, 0);

  return (
    <div className={`flex flex-col lg:col-span-7 ${REPORT_CARD_CLASS}`}>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="font-label-sm text-[11px] font-bold tracking-wider text-tertiary uppercase">
            {t('reports.partnerPerformanceCard.partnerPerformance')}
          </span>
          <h2 className="mt-0.5 font-headline-sm text-[17px] font-bold text-on-surface">
            {t('reports.partnerPerformanceCard.topPartnersByBookings')}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-start rounded-xl border border-surface-container bg-surface-container-low px-3 py-1.5 sm:items-end">
          <span className="font-label-sm text-[11px] text-on-surface-variant">
            {t('reports.partnerPerformanceCard.bookingRevenue')}
          </span>
          <span className="font-title-md text-[15px] font-bold text-primary">
            {t('reports.partnerPerformanceCard.vnd', {
              totalRevenue: formatVndCompact(totalRevenue),
            })}
          </span>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-on-surface-variant">
          <Icon name="handshake" className="text-[36px] text-outline" />
          <span className="font-body-md text-[14px]">
            {t('reports.partnerPerformanceCard.noPartnerBookingsThis')}
          </span>
        </div>
      ) : (
        <div className="table-scroll overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-surface-container font-label-sm text-[11px] font-semibold tracking-wider whitespace-nowrap text-on-surface-variant uppercase">
                <th className="py-2.5 pr-3">{t('reports.partnerPerformanceCard.partner')}</th>
                <th className="px-3 py-2.5 text-right">
                  {t('reports.partnerPerformanceCard.bookings')}
                </th>
                <th className="px-3 py-2.5 text-right">Doanh thu</th>
                <th className="px-3 py-2.5 text-center">
                  {t('reports.partnerPerformanceCard.reviews')}
                </th>
                <th className="py-2.5 pl-3 text-right">
                  {t('reports.partnerPerformanceCard.growth')}
                </th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner, index) => {
                const type = PARTNER_TYPE_CONFIG[partner.type];
                const growing = partner.growthPercent >= 0;
                const known = knownPartnerIds.has(partner.partnerId);
                return (
                  <tr
                    key={partner.partnerId}
                    className="border-b border-surface-container/60 transition-colors last:border-0 hover:bg-surface-container-low/60"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-label-sm text-[12px] font-bold text-outline">
                          {index + 1}
                        </span>
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-label-sm text-[12px] font-bold ${type.avatarClass}`}
                        >
                          {getInitials(partner.name)}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          {known ? (
                            <Link
                              to={partnerDetailPath(partner.partnerId)}
                              className="truncate font-label-md text-[13px] font-semibold text-on-surface hover:text-primary"
                            >
                              {partner.name}
                            </Link>
                          ) : (
                            <span className="truncate font-label-md text-[13px] font-semibold text-on-surface">
                              {partner.name}
                            </span>
                          )}
                          <span className="font-body-sm text-[11px] text-on-surface-variant">
                            {type.label} • {PROVINCE_NAMES[partner.province]}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-label-md text-[13px] font-semibold text-on-surface">
                      {formatNumber(partner.bookings)}
                    </td>
                    <td className="px-3 py-3 text-right font-body-sm text-[13px] whitespace-nowrap text-on-surface-variant">
                      {formatVndCompact(partner.revenueVnd)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="mx-auto flex w-fit items-center gap-1 rounded-full bg-surface-container-low px-2 py-0.5 text-tertiary">
                        <Icon name="star" filled className="text-[14px]" />
                        <span className="font-label-sm text-[12px] font-bold">
                          {partner.rating}
                        </span>
                      </span>
                    </td>
                    <td
                      className={`py-3 pl-3 text-right font-label-sm text-[12px] font-bold ${
                        growing ? 'text-secondary' : 'text-error'
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        <Icon
                          name={growing ? 'trending_up' : 'trending_down'}
                          className="text-[15px]"
                        />
                        {formatSigned(partner.growthPercent)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
