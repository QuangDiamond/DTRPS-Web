import { useState } from 'react';
import { LISTING_CATEGORY_CONFIG } from '../../constants/listing';
import type { Listing } from '../../types/admin';
import Icon from '../common/Icon';

interface ListingThumbProps {
  listing: Listing;
  /** Kích thước + bo góc, ví dụ "h-14 w-14 rounded-xl" */
  className: string;
  iconClassName?: string;
}

/** Ảnh niêm yết, tự chuyển sang icon danh mục khi không có ảnh hoặc ảnh lỗi */
export default function ListingThumb({
  listing,
  className,
  iconClassName = 'text-[26px]',
}: ListingThumbProps) {
  const [failed, setFailed] = useState(false);

  if (listing.imageUrl && !failed) {
    return (
      <img
        src={listing.imageUrl}
        alt={listing.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`shrink-0 object-cover shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center shadow-sm ${LISTING_CATEGORY_CONFIG[listing.category].iconBoxClass} ${className}`}
    >
      <Icon name={listing.icon} className={iconClassName} />
    </div>
  );
}
