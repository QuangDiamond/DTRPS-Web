import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { businessListingApi } from '@/client/api/businessListingApi';
import { errorMessage } from '@/client/api/http';
import type {
  BusinessListing,
  BusinessProfile,
  ListingRevision,
  ListingStatus,
} from '@/client/api/types';
import { MAX_IMAGES, REJECT_REASONS } from '@/client/partner/placeFormat';
import { formatDate, PROFILE_STATUS, profileCode } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  type BadgeTone,
  Card,
  CardTitle,
  FormAlert,
  Heading,
  InfoLine,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { SecondaryButton } from '@/client/ui/Buttons';

const LISTING_STATUS: Record<ListingStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ duyệt', tone: 'pending' },
  APPROVED: { label: 'Đang hiển thị', tone: 'approved' },
  REJECTED: { label: 'Bị từ chối', tone: 'rejected' },
  SUSPENDED: { label: 'Tạm ẩn', tone: 'locked' },
};

interface Overview {
  listing: BusinessListing | null;
  revisions: ListingRevision[];
}

type TodoTone = 'danger' | 'warning' | 'info';
interface Todo {
  tone: TodoTone;
  icon: string;
  text: string;
  action: string;
}

const TODO_STYLE: Record<TodoTone, string> = {
  danger: 'bg-[#FCE4E3] text-[#9A2D2D]',
  warning: 'bg-[#FFF4DD] text-[#7A5410]',
  info: 'bg-[#E5F5F0] text-[#356D64]',
};

/** Những việc đối tác nên làm, suy ra từ trạng thái địa điểm và đề xuất */
function buildTodos({ listing, revisions }: Overview): Todo[] {
  if (!listing) {
    return [
      {
        tone: 'warning',
        icon: 'add_location_alt',
        text: 'Bạn chưa có địa điểm. Đăng ký để du khách tìm thấy bạn.',
        action: 'Đăng ký địa điểm',
      },
    ];
  }
  const todos: Todo[] = [];
  if (listing.status === 'REJECTED') {
    todos.push({
      tone: 'danger',
      icon: 'error',
      text: `Địa điểm bị từ chối: ${listing.statusNote ?? 'Admin không ghi lý do.'}`,
      action: 'Sửa và gửi lại',
    });
  }
  if (listing.status === 'SUSPENDED') {
    todos.push({
      tone: 'danger',
      icon: 'visibility_off',
      text: 'Địa điểm đang bị tạm ẩn. Liên hệ Admin để biết thêm.',
      action: 'Xem địa điểm',
    });
  }
  if (listing.status === 'PENDING') {
    todos.push({
      tone: 'info',
      icon: 'schedule',
      text: 'Địa điểm đang chờ Admin duyệt. Bạn vẫn có thể bổ sung thông tin.',
      action: 'Xem / sửa',
    });
  }

  const pending = revisions.find((revision) => revision.status === 'PENDING');
  const latestReviewed = revisions.find((revision) => revision.status !== 'CANCELLED');
  if (pending) {
    todos.push({
      tone: 'info',
      icon: 'hourglass_top',
      text: `Đề xuất chỉnh sửa #${pending.id} đang chờ Admin duyệt.`,
      action: 'Xem đề xuất',
    });
  } else if (latestReviewed?.status === 'REJECTED') {
    const reason = latestReviewed.rejectReasonCode
      ? REJECT_REASONS[latestReviewed.rejectReasonCode]
      : 'Bị từ chối';
    todos.push({
      tone: 'danger',
      icon: 'feedback',
      text: `Đề xuất #${latestReviewed.id} bị từ chối — ${reason}${
        latestReviewed.partnerFeedback ? `: ${latestReviewed.partnerFeedback}` : ''
      }`,
      action: 'Gửi đề xuất mới',
    });
  }

  // Thiếu thông tin — gợi ý bổ sung (sau khi duyệt thì qua đề xuất chỉnh sửa)
  const via = listing.status === 'APPROVED' ? ' qua đề xuất chỉnh sửa' : '';
  if (listing.images.length === 0)
    todos.push({
      tone: 'warning',
      icon: 'add_photo_alternate',
      text: `Chưa có ảnh nào. Thêm ảnh${via} để thu hút du khách.`,
      action: 'Thêm ảnh',
    });
  if (listing.openingHours.length === 0)
    todos.push({
      tone: 'warning',
      icon: 'schedule',
      text: `Chưa khai báo giờ mở cửa${via}.`,
      action: 'Khai báo',
    });
  if (listing.prices.length === 0)
    todos.push({
      tone: 'warning',
      icon: 'payments',
      text: `Chưa có bảng giá tham khảo${via}.`,
      action: 'Thêm giá',
    });
  return todos;
}

function Checklist({ listing }: { listing: BusinessListing }) {
  const items: [string, boolean, string][] = [
    ['Ảnh', listing.images.length > 0, `${listing.images.length}/${MAX_IMAGES}`],
    [
      'Giờ mở cửa',
      listing.openingHours.length > 0,
      listing.openingHours.length > 0 ? 'Đã có' : 'Chưa có',
    ],
    [
      'Bảng giá',
      listing.prices.length > 0,
      listing.prices.length > 0 ? `${listing.prices.length} mức` : 'Chưa có',
    ],
    [
      'Liên hệ',
      Boolean(listing.phone || listing.website),
      listing.phone ?? listing.website ?? 'Chưa có',
    ],
  ];
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([label, done, value]) => (
        <div key={label} className="rounded-xl bg-client-field px-3 py-2">
          <p className="flex items-center gap-1 text-[11px] text-client-muted">
            <Icon
              name={done ? 'check_circle' : 'radio_button_unchecked'}
              className={`text-[14px] ${done ? 'text-primary' : ''}`}
            />
            {label}
          </p>
          <p className="truncate text-[13px] font-bold text-client-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}

function LocationCard({ listing }: { listing: BusinessListing | null }) {
  if (!listing) {
    return (
      <Card className="mb-0 flex h-full flex-col items-center justify-center p-6 text-center">
        <Icon name="add_location_alt" className="text-[40px] text-primary" />
        <CardTitle>Chưa có địa điểm</CardTitle>
        <p className="mt-1 mb-4 text-[12px] text-client-muted">
          Mỗi đối tác quản lý một địa điểm. Địa điểm hiển thị với du khách sau khi Admin duyệt.
        </p>
        <Link
          to={CLIENT_ROUTES.PARTNER_LOCATION}
          className="rounded-2xl bg-primary px-5 py-3 text-[13px] font-extrabold text-white hover:bg-primary-container"
        >
          Đăng ký địa điểm
        </Link>
      </Card>
    );
  }
  const status = LISTING_STATUS[listing.status];
  const cover = listing.images.find((image) => image.primary) ?? listing.images[0];
  return (
    <Card className="mb-0 overflow-hidden p-0">
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 shrink-0 bg-client-field sm:h-auto sm:w-56">
          {cover ? (
            <img src={cover.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-client-muted">
              <Icon name="image" className="text-[40px]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-wide text-client-muted uppercase">
                Địa điểm của tôi
              </p>
              <CardTitle>{listing.name}</CardTitle>
              <p className="mt-0.5 text-[12px] text-client-muted">
                {[listing.category?.name, listing.province?.name].filter(Boolean).join(' · ')}
              </p>
            </div>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>
          <p className="mt-2 flex items-start gap-1 text-[13px] text-client-ink">
            <Icon name="location_on" className="text-[16px] text-primary" />
            {listing.address}
          </p>
          <Checklist listing={listing} />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-client-muted">
              {listing.approvedAt
                ? `Duyệt ngày ${formatDate(listing.approvedAt)}`
                : `Gửi ngày ${formatDate(listing.createdAt)}`}
            </span>
            <Link
              to={CLIENT_ROUTES.PARTNER_LOCATION}
              className="flex items-center gap-1 text-[13px] font-bold text-[#007A73] hover:underline"
            >
              Quản lý địa điểm <Icon name="chevron_right" className="text-[18px]" />
            </Link>
          </div>
        </div>
      </div>
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

/** Tổng quan đối tác đã được duyệt: việc cần làm, địa điểm, hồ sơ — xem nhanh không cần bấm vào */
export default function PartnerDashboard({ profile }: { profile: BusinessProfile }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const listing = await businessListingApi.getOwn();
      const revisions = listing?.status === 'APPROVED' ? await businessListingApi.revisions() : [];
      return { listing, revisions };
    })()
      .then((loaded) => {
        if (!active) return;
        setOverview(loaded);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  const todos = overview ? buildTodos(overview) : [];

  return (
    <>
      <Heading
        eyebrow="SMARTTRAVEL · BUSINESS OWNER"
        title={`Xin chào, ${profile.businessName}!`}
        description="Tổng quan hoạt động địa điểm và những việc cần xử lý."
      />

      {error && (
        <div className="max-w-md">
          <FormAlert message={error} />
          <SecondaryButton onClick={() => setRetry((n) => n + 1)}>Thử lại</SecondaryButton>
        </div>
      )}
      {!overview && !error && <Spinner />}

      {overview && (
        <>
          <p className="mb-3 text-[15px] font-bold text-client-ink">Việc cần làm</p>
          {todos.length === 0 ? (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#E5F5F0] p-4 text-[13px] text-[#356D64]">
              <Icon name="task_alt" className="text-[20px]" />
              Mọi thứ đã sẵn sàng — địa điểm của bạn đang hiển thị đầy đủ với du khách.
            </div>
          ) : (
            <div className="mb-6 flex flex-col gap-2">
              {todos.map((todo) => (
                <Link
                  key={todo.text}
                  to={CLIENT_ROUTES.PARTNER_LOCATION}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-[13px] hover:opacity-90 ${TODO_STYLE[todo.tone]}`}
                >
                  <Icon name={todo.icon} className="text-[20px]" />
                  <span className="flex-1">{todo.text}</span>
                  <span className="flex shrink-0 items-center font-bold">
                    {todo.action} <Icon name="chevron_right" className="text-[18px]" />
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LocationCard listing={overview.listing} />
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
