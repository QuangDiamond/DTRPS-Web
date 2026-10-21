import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { getTrustLevelKey } from '@/pages/PartnerDetail/partnerProfileUtils';
import type { PartnerProfile } from '@/types';
import { formatDayTime, formatNumber } from '@/utils/format';

const STARS = [5, 4, 3, 2, 1] as const;

/** Tab Đánh giá & Xếp hạng đối tác */
export default function RatingsTab({ profile }: { profile: PartnerProfile }) {
  const { t } = useTranslation();
  const { ratings } = profile;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          {t('partnerDetail.ratingsTab.overview')}
        </h2>
        <div className="flex items-end gap-3">
          <span className="font-display-sm text-[44px] leading-none font-bold text-on-surface">
            {ratings.average.toFixed(1)}
          </span>
          <div className="flex flex-col pb-1">
            <span className="flex text-tertiary">
              {STARS.map((star) => (
                <Icon
                  key={star}
                  name="star"
                  filled={ratings.average >= 6 - star - 0.5}
                  className="text-[18px]"
                />
              ))}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('partnerDetail.ratingsTab.reviewCount', { count: ratings.total })}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {STARS.map((star) => {
            const count = ratings.distribution[star];
            const percent = ratings.total === 0 ? 0 : (count / ratings.total) * 100;
            return (
              <div key={star} className="flex items-center gap-2 font-label-sm text-label-sm">
                <span className="w-6 text-on-surface-variant">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-tertiary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-on-surface-variant">
                  {formatNumber(count)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('partnerDetail.ratingsTab.tier')}
            </span>
            <p className="font-label-md text-label-md font-bold text-on-surface">
              {profile.tierLabel}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('partnerDetail.ratingsTab.aiTrust')}
            </span>
            <p className="font-label-md text-label-md font-bold text-primary">
              {profile.trustScore}/100 • {t(getTrustLevelKey(profile.trustScore))}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
        <h2 className="mb-4 font-headline-sm text-headline-sm text-on-surface">
          {t('partnerDetail.ratingsTab.recentReviews')}
        </h2>
        <ul className="flex flex-col gap-3">
          {ratings.recent.map((review) => (
            <li key={review.id} className="rounded-xl bg-surface-container-low p-4">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {review.author}
                </span>
                <span className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                  <span className="flex text-tertiary">
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Icon key={index} name="star" filled className="text-[14px]" />
                    ))}
                  </span>
                  • {formatDayTime(review.date)}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface">{review.comment}</p>
              <span className="mt-1 inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <Icon name="storefront" className="text-[14px]" /> {review.listingName}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
