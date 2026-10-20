import Icon from '../../../components/common/Icon';
import type { Listing, ListingDetail } from '../../../types/admin';
import { getMapsUrl } from '../reviewUtils';
import ReviewSection from './ReviewSection';

interface LocationSectionProps {
  listing: Listing;
  detail: ListingDetail;
}

export default function LocationSection({ listing, detail }: LocationSectionProps) {
  const { coordinates, mapImageUrl, areaNote, accuracy } = detail.location;

  return (
    <ReviewSection
      number="02"
      title="Vị trí & Tọa độ bản đồ"
      subtitle={
        <span className="font-mono">
          {coordinates
            ? `Tọa độ: ${coordinates.lat}° N, ${coordinates.lng}° E`
            : 'Đối tác chưa ghim tọa độ GPS'}
        </span>
      }
      action={
        <a
          href={getMapsUrl(listing, detail)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-full border border-surface-container-high bg-surface-container px-3 py-1.5 text-[12px] font-bold text-primary transition-all hover:bg-surface-container-high"
        >
          <Icon name="open_in_new" className="text-[16px]" />
          <span>Google Maps</span>
        </a>
      }
    >
      <div
        className="relative h-48 w-full overflow-hidden rounded-xl border border-surface-container-high bg-primary-fixed/20 bg-cover bg-center shadow-2xs"
        style={mapImageUrl ? { backgroundImage: `url('${mapImageUrl}')` } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-inverse-surface/60 via-transparent to-transparent" />

        {/* Ghim vị trí */}
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="mb-1 flex items-center gap-1.5 rounded-full border border-surface-container-high bg-surface-container-lowest px-2.5 py-1 text-on-surface shadow-md">
            <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
            <span className="max-w-[220px] truncate text-[11px] font-bold">{listing.name}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-error text-on-primary shadow-lg ring-4 ring-error-container">
            <Icon name="location_on" className="text-[22px]" />
          </div>
        </div>

        <div className="absolute right-3 bottom-2.5 left-3 flex items-center justify-between gap-2">
          <div className="truncate rounded-md border border-surface-container-high bg-surface-container-lowest/95 px-2.5 py-1 text-[11px] font-semibold text-on-surface shadow-xs backdrop-blur-md">
            {areaNote}
          </div>
          {accuracy && (
            <div className="shrink-0 rounded-md border border-surface-container-high bg-surface-container-lowest/95 px-2.5 py-1 font-mono text-[11px] font-medium text-on-surface-variant shadow-xs backdrop-blur-md">
              Độ chính xác: {accuracy}
            </div>
          )}
        </div>
      </div>
    </ReviewSection>
  );
}
