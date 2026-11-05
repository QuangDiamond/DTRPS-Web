import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { businessListingApi } from '@/client/api/businessListingApi';
import { errorMessage } from '@/client/api/http';
import type { BusinessListing, ListingStatus } from '@/client/api/types';
import { LISTING_STATUS } from '@/client/partner/placeFormat';
import { formatDate } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES, partnerLocationPath } from '@/client/routePaths';
import { FormAlert, Heading, Spinner, StatusBadge } from '@/client/ui/Blocks';
import { SecondaryButton } from '@/client/ui/Buttons';

type Filter = 'ALL' | ListingStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'APPROVED', label: 'Đang hiển thị' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'SUSPENDED', label: 'Tạm ẩn' },
];

function LocationCard({ listing }: { listing: BusinessListing }) {
  const status = LISTING_STATUS[listing.status];
  const cover = listing.images.find((image) => image.primary) ?? listing.images[0];
  return (
    <Link
      to={partnerLocationPath(listing.id)}
      className="flex flex-col overflow-hidden rounded-[20px] border border-client-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative h-40 bg-client-field">
        {cover ? (
          <img src={cover.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-client-muted">
            <Icon name="image" className="text-[40px]" />
          </div>
        )}
        <span className="absolute top-3 right-3">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[15px] font-bold text-client-ink">{listing.name}</p>
        <p className="mt-0.5 text-[12px] text-client-muted">
          {[
            ...(listing.categories ?? (listing.category ? [listing.category] : [])).map(
              (type) => type.name,
            ),
            listing.province?.name,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="mt-2 flex items-start gap-1 text-[12px] text-client-ink">
          <Icon name="location_on" className="text-[15px] text-primary" />
          <span className="line-clamp-2">{listing.address}</span>
        </p>
        {listing.status === 'REJECTED' && listing.statusNote && (
          <p className="mt-2 line-clamp-2 rounded-lg bg-[#FCE4E3] px-2 py-1 text-[11px] text-[#9A2D2D]">
            {listing.statusNote}
          </p>
        )}
        <p className="mt-auto pt-3 text-[11px] text-client-muted">
          {listing.approvedAt
            ? `Duyệt ngày ${formatDate(listing.approvedAt)}`
            : `Gửi ngày ${formatDate(listing.createdAt)}`}
          {' · '}
          {listing.images.length} ảnh
        </p>
      </div>
    </Link>
  );
}

/** /partner/locations — tất cả địa điểm của đối tác */
export default function PartnerLocationsPage() {
  const [listings, setListings] = useState<BusinessListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    let active = true;
    businessListingApi
      .list()
      .then((loaded) => {
        if (!active) return;
        setListings(loaded);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  if (error) {
    return (
      <div className="mx-auto max-w-md">
        <FormAlert message={error} />
        <SecondaryButton onClick={() => setRetry((n) => n + 1)}>Thử lại</SecondaryButton>
      </div>
    );
  }
  if (!listings) return <Spinner />;

  const count = (value: Filter) =>
    value === 'ALL' ? listings.length : listings.filter((item) => item.status === value).length;
  const shown = filter === 'ALL' ? listings : listings.filter((item) => item.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Heading
          eyebrow="THÔNG TIN ĐỊA ĐIỂM"
          title="Địa điểm của tôi"
          description="Quản lý tất cả địa điểm của doanh nghiệp. Mỗi địa điểm hiển thị với du khách sau khi Admin phê duyệt."
        />
        <Link
          to={CLIENT_ROUTES.PARTNER_LOCATION_NEW}
          className="mb-6 flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-[13px] font-extrabold text-white hover:bg-primary-container"
        >
          <Icon name="add_location_alt" className="text-[19px]" /> Thêm địa điểm
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-client-line bg-white p-10 text-center">
          <Icon name="add_location_alt" className="text-[44px] text-primary" />
          <p className="text-[15px] font-bold text-client-ink">Bạn chưa có địa điểm nào</p>
          <p className="max-w-md text-[13px] text-client-muted">
            Đăng ký địa điểm đầu tiên để du khách tìm thấy bạn. Bạn có thể thêm nhiều địa điểm (ví
            dụ nhiều chi nhánh).
          </p>
          <Link
            to={CLIENT_ROUTES.PARTNER_LOCATION_NEW}
            className="mt-2 rounded-2xl bg-primary px-5 py-3 text-[13px] font-extrabold text-white hover:bg-primary-container"
          >
            Đăng ký địa điểm
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.filter((item) => item.value === 'ALL' || count(item.value) > 0).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-[12px] font-bold transition-colors ${
                  filter === item.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-client-muted hover:text-primary'
                }`}
              >
                {item.label} ({count(item.value)})
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((listing) => (
              <LocationCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
