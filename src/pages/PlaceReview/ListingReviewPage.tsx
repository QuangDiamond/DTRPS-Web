import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Button,
  ErrorState,
  Icon,
  NotFoundState,
  PageHeader,
  PageLoader,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useListingReview, useToast } from '@/hooks';
import { ApiError } from '@/services/httpClient';
import { listingReviewService } from '@/services/listingReviewService';
import type { ReviewListing } from '@/types';
import { getErrorMessage } from '@/utils/error';
import PlaceContentView, { Row, Section } from './components/PlaceContentView';
import { ApproveDialog, RejectListingDialog } from './components/ReviewDialogs';
import { ListingStatusBadge } from './components/StatusBadges';
import { displayDate } from './placeReviewUtils';

const NOTICE: Record<
  ReviewListing['status'],
  {
    tone: string;
    icon: string;
    key: 'pendingNotice' | 'rejectedNotice' | 'approvedNotice' | 'suspendedNotice';
  }
> = {
  pending: {
    tone: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
    icon: 'pending_actions',
    key: 'pendingNotice',
  },
  rejected: {
    tone: 'bg-surface-container-high text-on-surface',
    icon: 'undo',
    key: 'rejectedNotice',
  },
  approved: {
    tone: 'bg-secondary-container text-on-secondary-container',
    icon: 'verified',
    key: 'approvedNotice',
  },
  suspended: {
    tone: 'bg-error-container text-on-error-container',
    icon: 'visibility_off',
    key: 'suspendedNotice',
  },
};

function ListingReviewContent({
  listing,
  onChanged,
}: {
  listing: ReviewListing;
  onChanged: (listing: ReviewListing) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const review = useListingReview();
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null);
  const [busy, setBusy] = useState(false);
  const notice = NOTICE[listing.status];

  const run = async (
    task: Promise<ReviewListing>,
    toastKey: 'listingApproved' | 'listingRejected',
  ) => {
    setBusy(true);
    try {
      const updated = await task;
      onChanged(updated);
      setDialog(null);
      showToast(t(`placeReview.toast.${toastKey}`, { name: updated.name }));
    } catch (error) {
      showToast(t('placeReview.toast.failed', { message: getErrorMessage(error) }), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('nav.listings'), icon: 'store_mall_directory', to: ROUTES.LISTINGS },
            { label: listing.name },
          ]}
          title={listing.name}
          titleBadge={<ListingStatusBadge status={listing.status} />}
          description={t('placeReview.detail.listingCode', { id: listing.id })}
          actions={
            listing.status === 'pending' ? (
              <>
                <Button variant="danger" icon="block" onClick={() => setDialog('reject')}>
                  {t('placeReview.actions.reject')}
                </Button>
                <Button icon="verified" onClick={() => setDialog('approve')}>
                  {t('placeReview.actions.approveListing')}
                </Button>
              </>
            ) : undefined
          }
        />
      </div>

      <div className={`flex items-start gap-3 rounded-2xl p-4 ${notice.tone}`}>
        <Icon name={notice.icon} className="text-[22px]" />
        <p className="font-body-md text-body-md">{t(`placeReview.detail.${notice.key}`)}</p>
      </div>

      <PlaceContentView
        place={listing}
        aside={
          <Section icon="fact_check" title={t('placeReview.detail.review')}>
            <dl>
              <Row label={t('placeReview.detail.business')} value={listing.businessName} />
              <Row
                label={t('placeReview.detail.submittedAt')}
                value={displayDate(listing.createdAt)}
              />
              <Row
                label={t('placeReview.detail.updatedAt')}
                value={displayDate(listing.updatedAt)}
              />
              {listing.approvedAt && (
                <Row
                  label={t('placeReview.detail.approvedAt')}
                  value={displayDate(listing.approvedAt)}
                />
              )}
              {listing.status === 'rejected' && (
                <Row
                  label={t('placeReview.detail.rejectReason')}
                  value={listing.statusNote ?? t('placeReview.detail.noReason')}
                />
              )}
            </dl>
          </Section>
        }
      />

      {dialog === 'approve' && (
        <ApproveDialog
          kind="listing"
          name={listing.name}
          busy={busy}
          onConfirm={() => void run(review.approveListing(listing.id), 'listingApproved')}
          onClose={() => !busy && setDialog(null)}
        />
      )}
      {dialog === 'reject' && (
        <RejectListingDialog
          name={listing.name}
          busy={busy}
          onConfirm={(reason) =>
            void run(review.rejectListing(listing.id, reason), 'listingRejected')
          }
          onClose={() => !busy && setDialog(null)}
        />
      )}
    </div>
  );
}

/** Xét duyệt địa điểm mới: /admin/listings/:id — dữ liệu thật */
export default function ListingReviewPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const { version } = useListingReview();
  const [listing, setListing] = useState<ReviewListing | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    listingReviewService
      .getListing(id)
      .then((next) => {
        if (!active) return;
        setListing(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const notFound =
          loadError instanceof ApiError && (loadError.status === 404 || loadError.status === 400);
        setError({ message: getErrorMessage(loadError), notFound });
      });
    return () => {
      active = false;
    };
  }, [id, version, retry]);

  if (error?.notFound) {
    return (
      <NotFoundState
        title={t('placeReview.detail.notFound', { id })}
        backTo={ROUTES.LISTINGS}
        backLabel={t('placeReview.detail.backQueue')}
      />
    );
  }
  if (error && !listing) {
    return (
      <ErrorState
        title={t('placeReview.detail.loadError')}
        message={error.message}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!listing || listing.id !== id) return <PageLoader />;
  return <ListingReviewContent listing={listing} onChanged={setListing} />;
}
