import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { businessListingApi } from '@/client/api/businessListingApi';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import type {
  BusinessListing,
  CategoryGroup,
  ListingRevision,
  ListingStatus,
  ReferenceItem,
} from '@/client/api/types';
import ListingForm from '@/client/partner/components/ListingForm';
import PlaceDetailsView from '@/client/partner/components/PlaceDetailsView';
import RevisionHistory from '@/client/partner/components/RevisionHistory';
import { formatDate } from '@/client/partner/profileStatus';
import {
  type BadgeTone,
  Card,
  CardTitle,
  FormAlert,
  Heading,
  Notice,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';

const LISTING_STATUS: Record<ListingStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ duyệt', tone: 'pending' },
  APPROVED: { label: 'Đang hiển thị', tone: 'approved' },
  REJECTED: { label: 'Bị từ chối', tone: 'rejected' },
  SUSPENDED: { label: 'Tạm ẩn', tone: 'locked' },
};

interface PageData {
  listing: BusinessListing | null;
  revisions: ListingRevision[];
  groups: CategoryGroup[];
  provinces: ReferenceItem[];
}

type View = 'summary' | 'edit' | 'revision';

async function loadPage(): Promise<PageData> {
  const [listing, groups, provinces] = await Promise.all([
    businessListingApi.getOwn(),
    referenceApi.categories(),
    referenceApi.provinces(),
  ]);
  const revisions = listing?.status === 'APPROVED' ? await businessListingApi.revisions() : [];
  return { listing, revisions, groups, provinces };
}

function ListingSummary({
  listing,
  pendingRevision,
  onEdit,
  onPropose,
}: {
  listing: BusinessListing;
  pendingRevision: ListingRevision | undefined;
  onEdit: () => void;
  onPropose: () => void;
}) {
  const status = LISTING_STATUS[listing.status];
  const approved = listing.status === 'APPROVED';

  return (
    <>
      {listing.status === 'PENDING' && (
        <Notice tone="warning">
          Admin đang xem xét địa điểm. Bạn vẫn có thể chỉnh sửa trong lúc chờ.
        </Notice>
      )}
      {listing.status === 'REJECTED' && (
        <Notice tone="danger">
          <strong>Lý do từ chối:</strong> {listing.statusNote ?? 'Admin không ghi lý do.'}
        </Notice>
      )}
      {listing.status === 'SUSPENDED' && (
        <Notice tone="danger">Địa điểm đang bị tạm ẩn. Vui lòng liên hệ Admin để biết thêm.</Notice>
      )}
      {approved &&
        (pendingRevision ? (
          <Notice tone="warning">
            Đề xuất chỉnh sửa #{pendingRevision.id} đang chờ Admin duyệt. Du khách vẫn thấy thông
            tin hiện tại bên dưới.
          </Notice>
        ) : (
          <Notice>
            Địa điểm đang hiển thị với du khách. Mọi thay đổi được gửi dưới dạng đề xuất và chỉ áp
            dụng sau khi Admin duyệt.
          </Notice>
        ))}
      <Card className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <CardTitle>{listing.name}</CardTitle>
            <p className="mt-1 text-[12px] text-client-muted">
              Gửi {formatDate(listing.createdAt)}
              {listing.approvedAt && ` · Duyệt ${formatDate(listing.approvedAt)}`}
            </p>
          </div>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <PlaceDetailsView place={listing} />
      </Card>
      <div className="mt-4">
        {listing.status === 'REJECTED' && (
          <PrimaryButton onClick={onEdit}>Chỉnh sửa và gửi lại</PrimaryButton>
        )}
        {listing.status === 'PENDING' && (
          <SecondaryButton onClick={onEdit}>Chỉnh sửa thông tin</SecondaryButton>
        )}
        {approved && (
          <PrimaryButton onClick={onPropose} disabled={Boolean(pendingRevision)}>
            <Icon name="edit_note" className="text-[19px]" />
            {pendingRevision ? 'Đang có đề xuất chờ duyệt' : 'Đề xuất chỉnh sửa'}
          </PrimaryButton>
        )}
      </div>
    </>
  );
}

/** /partner/location — đăng ký, theo dõi duyệt, sửa và đề xuất chỉnh sửa địa điểm duy nhất */
export default function PartnerLocationPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('summary');
  const [retry, setRetry] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadPage()
      .then((loaded) => {
        if (!active) return;
        setData(loaded);
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
  if (!data) return <Spinner />;

  const backToSummary = () => {
    setView('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saved = (listing: BusinessListing) => {
    setData({ ...data, listing });
    backToSummary();
  };

  const proposed = (revision: ListingRevision) => {
    setData({ ...data, revisions: [revision, ...data.revisions] });
    backToSummary();
  };

  const cancelRevision = async (revision: ListingRevision) => {
    if (!window.confirm(`Rút lại đề xuất #${revision.id}? Bạn có thể gửi đề xuất mới sau đó.`)) {
      return;
    }
    setCancellingId(revision.id);
    setActionError(null);
    try {
      const cancelled = await businessListingApi.cancelRevision(revision.id);
      setData(
        (current) =>
          current && {
            ...current,
            revisions: current.revisions.map((item) =>
              item.id === cancelled.id ? cancelled : item,
            ),
          },
      );
    } catch (cancelError) {
      setActionError(errorMessage(cancelError));
    } finally {
      setCancellingId(null);
    }
  };

  const { listing, revisions } = data;
  const pendingRevision = revisions.find((revision) => revision.status === 'PENDING');
  const title = !listing
    ? 'Đăng ký địa điểm'
    : view === 'edit'
      ? 'Chỉnh sửa địa điểm'
      : view === 'revision'
        ? 'Đề xuất chỉnh sửa'
        : 'Địa điểm của tôi';

  return (
    <div className="mx-auto max-w-3xl">
      <Heading
        eyebrow="THÔNG TIN ĐỊA ĐIỂM"
        title={title}
        description="Mỗi đối tác quản lý duy nhất một địa điểm. Địa điểm hiển thị với du khách sau khi Admin phê duyệt."
      />
      {!listing ? (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4">
            <Icon name="add_location_alt" className="text-[28px] text-primary" />
            <p className="text-[13px] text-client-muted">
              Bạn chưa có địa điểm. Điền thông tin bên dưới để gửi Admin xét duyệt.
            </p>
          </div>
          <ListingForm
            key="new"
            mode="create"
            listing={null}
            groups={data.groups}
            provinces={data.provinces}
            onSaved={saved}
          />
        </>
      ) : view === 'summary' ? (
        <>
          <ListingSummary
            listing={listing}
            pendingRevision={pendingRevision}
            onEdit={() => setView('edit')}
            onPropose={() => setView('revision')}
          />
          {listing.status === 'APPROVED' && (
            <div className="mt-6">
              {actionError && <FormAlert message={actionError} />}
              <RevisionHistory
                revisions={revisions}
                cancellingId={cancellingId}
                onCancel={(revision) => void cancelRevision(revision)}
              />
            </div>
          )}
        </>
      ) : (
        <ListingForm
          key={`${view}-${listing.id}`}
          mode={view}
          listing={listing}
          groups={data.groups}
          provinces={data.provinces}
          onSaved={saved}
          onProposed={proposed}
          onCancel={backToSummary}
        />
      )}
    </div>
  );
}
