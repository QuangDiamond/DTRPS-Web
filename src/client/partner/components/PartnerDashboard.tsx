import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { businessListingApi } from '@/client/api/businessListingApi';
import { useClientLiveRefresh } from '@/client/live/clientLiveContext';
import { errorMessage } from '@/client/api/http';
import type { BusinessListing, BusinessProfile, ListingRevision } from '@/client/api/types';
import { LISTING_STATUS, MAX_IMAGES, REJECT_REASONS } from '@/client/partner/placeFormat';
import { formatDate, PROFILE_STATUS, profileCode } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES, partnerLocationPath } from '@/client/routePaths';
import {
  Card,
  CardTitle,
  FormAlert,
  Heading,
  InfoLine,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { SecondaryButton } from '@/client/ui/Buttons';

/** Một địa điểm cùng các đề xuất của nó (chỉ địa điểm đã duyệt mới có đề xuất) */
interface Place {
  listing: BusinessListing;
  revisions: ListingRevision[];
}

type TodoTone = 'danger' | 'warning' | 'info';
interface Todo {
  tone: TodoTone;
  icon: string;
  text: string;
  action: string;
  to: string;
}

const TODO_STYLE: Record<TodoTone, string> = {
  danger: 'bg-[#FCE4E3] text-[#9A2D2D]',
  warning: 'bg-[#FFF4DD] text-[#7A5410]',
  info: 'bg-[#E5F5F0] text-[#356D64]',
};
const TODO_ORDER: Record<TodoTone, number> = { danger: 0, info: 1, warning: 2 };
const MAX_TODOS = 6;
const MAX_CARDS = 4;

/** Việc cần làm của một địa điểm, suy ra từ trạng thái địa điểm và đề xuất */
function todosOf({ listing, revisions }: Place): Todo[] {
  const to = partnerLocationPath(listing.id);
  const name = `«${listing.name}»`;
  const todos: Todo[] = [];
  if (listing.status === 'REJECTED') {
    todos.push({
      tone: 'danger',
      icon: 'error',
      text: `${name} bị từ chối: ${listing.statusNote ?? 'Admin không ghi lý do.'}`,
      action: 'Sửa và gửi lại',
      to,
    });
  }
  if (listing.status === 'SUSPENDED') {
    todos.push({
      tone: 'danger',
      icon: 'visibility_off',
      text: `${name} đang bị tạm ẩn. Liên hệ Admin để biết thêm.`,
      action: 'Xem',
      to,
    });
  }
  if (listing.status === 'PENDING') {
    todos.push({
      tone: 'info',
      icon: 'schedule',
      text: `${name} đang chờ Admin duyệt.`,
      action: 'Xem / sửa',
      to,
    });
  }

  const pending = revisions.find((revision) => revision.status === 'PENDING');
  const latestReviewed = revisions.find((revision) => revision.status !== 'CANCELLED');
  if (pending) {
    todos.push({
      tone: 'info',
      icon: 'hourglass_top',
      text: `Đề xuất chỉnh sửa ${name} đang chờ Admin duyệt.`,
      action: 'Xem đề xuất',
      to,
    });
  } else if (latestReviewed?.status === 'REJECTED') {
    const reason = latestReviewed.rejectReasonCode
      ? REJECT_REASONS[latestReviewed.rejectReasonCode]
      : 'Bị từ chối';
    todos.push({
      tone: 'danger',
      icon: 'feedback',
      text: `Đề xuất sửa ${name} bị từ chối — ${reason}${
        latestReviewed.partnerFeedback ? `: ${latestReviewed.partnerFeedback}` : ''
      }`,
      action: 'Gửi đề xuất mới',
      to,
    });
  }

  // Thiếu thông tin — gộp thành một dòng cho mỗi địa điểm
  const missing = [
    listing.images.length === 0 && 'ảnh',
    listing.openingHours.length === 0 && 'giờ mở cửa',
    listing.prices.length === 0 && 'bảng giá',
  ].filter(Boolean);
  if (missing.length > 0 && listing.status !== 'SUSPENDED') {
    const via = listing.status === 'APPROVED' ? ' (qua đề xuất chỉnh sửa)' : '';
    todos.push({
      tone: 'warning',
      icon: 'playlist_add',
      text: `${name} chưa có ${missing.join(', ')}. Bổ sung${via} để thu hút du khách.`,
      action: 'Bổ sung',
      to,
    });
  }
  return todos;
}

function PlaceCard({ listing }: { listing: BusinessListing }) {
  const status = LISTING_STATUS[listing.status];
  const cover = listing.images.find((image) => image.primary) ?? listing.images[0];
  const filled = [
    listing.images.length > 0,
    listing.openingHours.length > 0,
    listing.prices.length > 0,
    Boolean(listing.phone || listing.website),
  ].filter(Boolean).length;
  return (
    <Link
      to={partnerLocationPath(listing.id)}
      className="flex gap-3 rounded-2xl border border-client-line bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-client-field">
        {cover ? (
          <img src={cover.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-client-muted">
            <Icon name="image" className="text-[28px]" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[14px] font-bold text-client-ink">{listing.name}</p>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <p className="truncate text-[12px] text-client-muted">
          {[listing.category?.name, listing.province?.name].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-auto text-[11px] text-client-muted">
          {listing.images.length}/{MAX_IMAGES} ảnh · Thông tin đầy đủ {filled}/4
        </p>
      </div>
    </Link>
  );
}

function PlacesPanel({ places }: { places: Place[] }) {
  const listings = places.map((place) => place.listing);
  const count = (status: BusinessListing['status']) =>
    listings.filter((listing) => listing.status === status).length;
  const stats: [string, number][] = [
    ['Tổng địa điểm', listings.length],
    ['Đang hiển thị', count('APPROVED')],
    ['Chờ duyệt', count('PENDING')],
    ['Bị từ chối', count('REJECTED')],
  ];

  return (
    <Card className="mb-0 h-full p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-client-muted uppercase">
            Địa điểm của tôi
          </p>
          <CardTitle>{listings.length} địa điểm</CardTitle>
        </div>
        <Link
          to={CLIENT_ROUTES.PARTNER_LOCATION_NEW}
          className="flex items-center gap-1 rounded-xl bg-[#E3F3EF] px-3 py-2 text-[12px] font-bold text-primary hover:bg-client-pale"
        >
          <Icon name="add" className="text-[16px]" /> Thêm địa điểm
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-client-field px-3 py-2">
            <p className="text-[11px] text-client-muted">{label}</p>
            <p className="text-[18px] font-extrabold text-client-ink">{value}</p>
          </div>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-client-line p-6 text-center">
          <Icon name="add_location_alt" className="text-[36px] text-primary" />
          <p className="text-[13px] text-client-muted">
            Bạn chưa có địa điểm nào. Đăng ký để du khách tìm thấy bạn.
          </p>
          <Link
            to={CLIENT_ROUTES.PARTNER_LOCATION_NEW}
            className="rounded-2xl bg-primary px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-primary-container"
          >
            Đăng ký địa điểm
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-2 xl:grid-cols-2">
            {listings.slice(0, MAX_CARDS).map((listing) => (
              <PlaceCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Link
            to={CLIENT_ROUTES.PARTNER_LOCATIONS}
            className="mt-3 flex items-center justify-end gap-1 text-[13px] font-bold text-[#007A73] hover:underline"
          >
            {listings.length > MAX_CARDS
              ? `Xem tất cả ${listings.length} địa điểm`
              : 'Quản lý địa điểm'}
            <Icon name="chevron_right" className="text-[18px]" />
          </Link>
        </>
      )}
    </Card>
  );
}

function ProfileCard({ profile }: { profile: BusinessProfile }) {
  const status = PROFILE_STATUS[profile.status];
  return (
    <Card className="mb-0 h-full p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-client-muted uppercase">
            Hồ sơ doanh nghiệp
          </p>
          <CardTitle>{profile.businessName}</CardTitle>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>
      <div className="mt-2">
        <InfoLine label="Mã hồ sơ" value={profileCode(profile)} />
        <InfoLine label="Mã số thuế" value={profile.taxCode} />
        <InfoLine label="Email" value={profile.contactEmail} />
        <InfoLine label="Điện thoại" value={profile.contactPhone} />
        <InfoLine label="Ngày duyệt" value={formatDate(profile.approvedAt)} />
      </div>
      <Link
        to={CLIENT_ROUTES.PARTNER_PROFILE}
        className="mt-3 flex items-center justify-end gap-1 text-[13px] font-bold text-[#007A73] hover:underline"
      >
        Xem / sửa hồ sơ <Icon name="chevron_right" className="text-[18px]" />
      </Link>
    </Card>
  );
}

async function loadPlaces(): Promise<Place[]> {
  const listings = await businessListingApi.list();
  return Promise.all(
    listings.map(async (listing) => ({
      listing,
      revisions:
        listing.status === 'APPROVED' ? await businessListingApi.revisions(listing.id) : [],
    })),
  );
}

/** Tổng quan đối tác đã được duyệt: việc cần làm, các địa điểm, hồ sơ — xem nhanh không cần bấm vào */
export default function PartnerDashboard({ profile }: { profile: BusinessProfile }) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [showAllTodos, setShowAllTodos] = useState(false);

  useEffect(() => {
    let active = true;
    loadPlaces()
      .then((loaded) => {
        if (!active) return;
        setPlaces(loaded);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  useClientLiveRefresh(['LISTING_', 'REVISION_'], () => setRetry((n) => n + 1));

  const todos: Todo[] = places
    ? places.length === 0
      ? [
          {
            tone: 'warning',
            icon: 'add_location_alt',
            text: 'Bạn chưa có địa điểm. Đăng ký để du khách tìm thấy bạn.',
            action: 'Đăng ký địa điểm',
            to: CLIENT_ROUTES.PARTNER_LOCATION_NEW,
          },
        ]
      : places.flatMap(todosOf).sort((a, b) => TODO_ORDER[a.tone] - TODO_ORDER[b.tone])
    : [];
  const shownTodos = showAllTodos ? todos : todos.slice(0, MAX_TODOS);

  return (
    <>
      <Heading
        eyebrow="SMARTTRAVEL · BUSINESS OWNER"
        title={`Xin chào, ${profile.businessName}!`}
        description="Tổng quan hoạt động các địa điểm và những việc cần xử lý."
      />

      {error && (
        <div className="max-w-md">
          <FormAlert message={error} />
          <SecondaryButton onClick={() => setRetry((n) => n + 1)}>Thử lại</SecondaryButton>
        </div>
      )}
      {!places && !error && <Spinner />}

      {places && (
        <>
          <p className="mb-3 text-[15px] font-bold text-client-ink">Việc cần làm</p>
          {todos.length === 0 ? (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#E5F5F0] p-4 text-[13px] text-[#356D64]">
              <Icon name="task_alt" className="text-[20px]" />
              Mọi thứ đã sẵn sàng — các địa điểm của bạn đang hiển thị đầy đủ với du khách.
            </div>
          ) : (
            <div className="mb-6 flex flex-col gap-2">
              {shownTodos.map((todo) => (
                <Link
                  key={todo.text}
                  to={todo.to}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-[13px] hover:opacity-90 ${TODO_STYLE[todo.tone]}`}
                >
                  <Icon name={todo.icon} className="text-[20px]" />
                  <span className="flex-1">{todo.text}</span>
                  <span className="flex shrink-0 items-center font-bold">
                    {todo.action} <Icon name="chevron_right" className="text-[18px]" />
                  </span>
                </Link>
              ))}
              {todos.length > MAX_TODOS && (
                <button
                  type="button"
                  onClick={() => setShowAllTodos((value) => !value)}
                  className="self-start text-[12px] font-bold text-[#007A73] hover:underline"
                >
                  {showAllTodos ? 'Thu gọn' : `Xem thêm ${todos.length - MAX_TODOS} việc`}
                </button>
              )}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PlacesPanel places={places} />
            </div>
            <ProfileCard profile={profile} />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[20px] border border-client-line bg-white p-4">
            <span className="flex items-center gap-3">
              <Icon name="campaign" className="text-[22px] text-primary" />
              <span>
                <span className="block text-[14px] font-bold text-client-ink">Quảng cáo</span>
                <span className="text-[12px] text-client-muted">
                  Đẩy địa điểm lên đầu kết quả tìm kiếm — sắp ra mắt.
                </span>
              </span>
            </span>
            <StatusBadge tone="draft">Sắp có</StatusBadge>
          </div>
        </>
      )}
    </>
  );
}
