import { useTranslation } from 'react-i18next';
import { LISTING_STATUS_STYLE, REVISION_STATUS_STYLE } from '@/pages/PlaceReview/placeReviewUtils';
import type { ReviewListingStatus, RevisionStatus } from '@/types';

const BADGE_CLASS =
  'inline-flex items-center rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold';

export function ListingStatusBadge({ status }: { status: ReviewListingStatus }) {
  const { t } = useTranslation();
  const style = LISTING_STATUS_STYLE[status];
  return <span className={`${BADGE_CLASS} ${style.className}`}>{t(style.labelKey)}</span>;
}

export function RevisionStatusBadge({ status }: { status: RevisionStatus }) {
  const { t } = useTranslation();
  const style = REVISION_STATUS_STYLE[status];
  return <span className={`${BADGE_CLASS} ${style.className}`}>{t(style.labelKey)}</span>;
}
