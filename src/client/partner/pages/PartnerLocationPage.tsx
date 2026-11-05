import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { businessListingApi } from '@/client/api/businessListingApi';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import type {
  BusinessListing,
  CategoryGroup,
  ListingRevision,
  ReferenceItem,
} from '@/client/api/types';
import ListingForm from '@/client/partner/components/ListingForm';
import PlaceDetailsView from '@/client/partner/components/PlaceDetailsView';
import RevisionHistory from '@/client/partner/components/RevisionHistory';
import { LISTING_STATUS } from '@/client/partner/placeFormat';
import { formatDate } from '@/client/partner/profileStatus';
import { useClientLiveRefresh } from '@/client/live/clientLiveContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  Card,
  CardTitle,
  FormAlert,
  Heading,
  Notice,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';

interface PageData {
  listing: BusinessListing;
  revisions: ListingRevision[];
  groups: CategoryGroup[];
  provinces: ReferenceItem[];
}

type View = 'summary' | 'edit' | 'revision';

async function loadPage(id: number): Promise<PageData> {
  const [listing, groups, provinces] = await Promise.all([
    businessListingApi.get(id),
    referenceApi.categories(),
    referenceApi.provinces(),
  ]);
  const revisions = listing.status === 'APPROVED' ? await businessListingApi.revisions(id) : [];
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
      <Card className="mb-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{listing.name}</CardTitle>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <p className="mt-1 text-[12px] text-client-muted">
              Gửi {formatDate(listing.createdAt)}
              {listing.approvedAt && ` · Duyệt ${formatDate(listing.approvedAt)}`}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            {listing.status === 'REJECTED' && (
              <PrimaryButton className="px-5" onClick={onEdit}>
                Chỉnh sửa và gửi lại
              </PrimaryButton>
            )}
            {listing.status === 'PENDING' && (
              <SecondaryButton className="px-5" onClick={onEdit}>
                Chỉnh sửa thông tin
              </SecondaryButton>
            )}
            {approved && (
              <PrimaryButton
                className="px-5"
                arrow={false}
                onClick={onPropose}
                disabled={Boolean(pendingRevision)}
              >
                <Icon name="edit_note" className="text-[19px]" />
                {pendingRevision ? 'Đang có đề xuất chờ duyệt' : 'Đề xuất chỉnh sửa'}
              </PrimaryButton>
            )}
          </div>
        </div>
      </Card>
      <PlaceDetailsView
        place={listing}
        emptyHint={
          approved
            ? 'Bấm "Đề xuất chỉnh sửa" để bổ sung.'
            : listing.status === 'SUSPENDED'
              ? undefined
              : 'Bấm "Chỉnh sửa" để bổ sung.'
        }
      />
    </>
  );
}

/** /partner/locations/:id — theo dõi duyệt, sửa và đề xuất chỉnh sửa một địa điểm */
export default function PartnerLocationPage() {
  const listingId = Number(useParams().id);
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('summary');
  const [retry, setRetry] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setView('summary');
    loadPage(listingId)
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
  }, [listingId, retry]);

  // Admin duyệt / từ chối địa điểm hoặc đề xuất của chính địa điểm này → cập nhật tại chỗ
  useClientLiveRefresh(['LISTING_', 'REVISION_'], (event) => {
    if (event.data.listingId !== listingId) return;
    loadPage(listingId)
      .then((loaded) => setData(loaded))
      .catch(() => undefined);
  });

  const backLink = (
    <Link
      to={CLIENT_ROUTES.PARTNER_LOCATIONS}
      className="mb-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#007A73] hover:underline"
    >
      <Icon name="arrow_back" className="text-[18px]" /> Địa điểm của tôi
    </Link>
  );

  if (error) {
    return (
      <div className="mx-auto max-w-md">
        {backLink}
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
  const title =
    view === 'edit'
      ? 'Chỉnh sửa địa điểm'
      : view === 'revision'
        ? 'Đề xuất chỉnh sửa'
        : listing.name;

  return (
    <div className="mx-auto max-w-6xl">
      {backLink}
      <Heading
        eyebrow="THÔNG TIN ĐỊA ĐIỂM"
        title={title}
        description="Địa điểm hiển thị với du khách sau khi Admin phê duyệt."
      />
      {view === 'summary' ? (
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
