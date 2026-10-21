import { LISTING_STATUS_CONFIG } from '@/constants/listing';
import type { ListingStatus } from '@/types';

export default function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const config = LISTING_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-bold whitespace-nowrap shadow-sm ${config.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
