import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  ErrorState,
  Icon,
  NotFoundState,
  PageHeader,
  PageLoader,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useListingReview, useToast } from '@/hooks';
import { ApiError } from '@/services/httpClient';
import { listingReviewService } from '@/services/listingReviewService';
import type { RevisionDetail, RevisionRejectCode, RevisionStatus } from '@/types';
import { getErrorMessage } from '@/utils/error';
import CompareMap from '@/components/common/CompareMap';
import { distanceMeters } from '@/components/common/mapTypes';
import PlaceContentView, { Row, Section } from './components/PlaceContentView';
import RevisionCompare from './components/RevisionCompare';
import { ApproveDialog, RejectRevisionDialog } from './components/ReviewDialogs';
import { RevisionStatusBadge } from './components/StatusBadges';
import { displayDate, REJECT_CODE_KEY } from './placeReviewUtils';

const NOTICE: Record<
  RevisionStatus,
  {
    tone: string;
    icon: string;
    key: 'pendingNotice' | 'approvedNotice' | 'rejectedNotice' | 'cancelledNotice';
  }
> = {
  pending: {
    tone: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
    icon: 'pending_actions',
    key: 'pendingNotice',
  },
  approved: {
    tone: 'bg-secondary-container text-on-secondary-container',
    icon: 'verified',
    key: 'approvedNotice',
  },
  rejected: {
    tone: 'bg-error-container text-on-error-container',
    icon: 'block',
    key: 'rejectedNotice',
  },
  cancelled: {
    tone: 'bg-surface-container-high text-on-surface',
    icon: 'undo',
    key: 'cancelledNotice',
  },
};

function RevisionReviewContent({
  detail,
  onChanged,
}: {
  detail: RevisionDetail;
  onChanged: (detail: RevisionDetail) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const review = useListingReview();
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null);
  const [busy, setBusy] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const { revision, current } = detail;
  const moved = distanceMeters(current, revision.proposed);
  const notice = NOTICE[revision.status];

  const approve = async (note: string) => {
    setBusy(true);
    try {
      onChanged(await review.approveRevision(revision.id, note));
      setDialog(null);
      showToast(t('placeReview.toast.revisionApproved', { name: revision.proposed.name }));
    } catch (error) {
      showToast(t('placeReview.toast.failed', { message: getErrorMessage(error) }), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reject = async (code: RevisionRejectCode, feedback: string, note: string) => {
    setBusy(true);
    try {
      const updated = await review.rejectRevision(revision.id, code, feedback, note);
      onChanged({ ...detail, revision: updated });
      setDialog(null);
      showToast(t('placeReview.toast.revisionRejected', { name: current.name }));
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
            {
              label: t('nav.listings'),
              icon: 'store_mall_directory',
              to: `${ROUTES.LISTINGS}?tab=revisions`,
            },
            { label: current.name },
          ]}
          title={t('placeReview.revision.title', { name: current.name })}
          titleBadge={<RevisionStatusBadge status={revision.status} />}
          description={`${t('placeReview.revision.code', { id: revision.id })} · ${revision.businessName}`}
          actions={
            revision.status === 'pending' ? (
              <>
                <Button variant="danger" icon="block" onClick={() => setDialog('reject')}>
                  {t('placeReview.actions.reject')}
                </Button>
                <Button icon="verified" onClick={() => setDialog('approve')}>
                  {t('placeReview.actions.approveRevision')}
                </Button>
              </>
            ) : undefined
          }
        />
      </div>

      <div className={`flex items-start gap-3 rounded-2xl p-4 ${notice.tone}`}>
        <Icon name={notice.icon} className="text-[22px]" />
        <p className="flex-1 font-body-md text-body-md">
          {t(`placeReview.revision.${notice.key}`)}
        </p>
        <Link
          to={listingReviewPath(current.id)}
          className="flex items-center gap-1 font-label-md text-label-md font-semibold underline-offset-2 hover:underline"
        >
          {t('placeReview.revision.viewListing')}
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RevisionCompare
            current={current}
            proposed={revision.proposed}
            applied={revision.status === 'approved'}
          />
          <div className="mt-6">
            <Section icon="map" title={t('placeReview.revision.mapTitle')}>
              <div className="overflow-hidden rounded-xl border border-surface-container">
                <CompareMap
                  current={current}
                  proposed={revision.proposed}
                  currentLabel={t('placeReview.revision.mapCurrent')}
                  proposedLabel={t('placeReview.revision.mapProposed')}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-body-sm text-body-sm">
                {moved >= 1 && (
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <Icon name="location_on" filled className="text-[18px] text-[#8A979C]" />
                    {t('placeReview.revision.mapCurrent')}
                  </span>
                )}
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <Icon name="location_on" filled className="text-[18px] text-[#0F766E]" />
                  {t('placeReview.revision.mapProposed')}
                </span>
                <span
                  className={`ml-auto font-semibold ${moved >= 1 ? 'text-tertiary' : 'text-on-surface-variant'}`}
                >
                  {moved >= 1
                    ? t('placeReview.revision.moved', {
                        distance:
                          moved >= 1000
                            ? `${(moved / 1000).toFixed(1)} km`
                            : `${Math.round(moved)} m`,
                      })
                    : t('placeReview.revision.notMoved')}
                </span>
              </div>
            </Section>
          </div>
        </div>
        <div className="xl:col-span-4">
          <Section icon="fact_check" title={t('placeReview.detail.review')}>
            <dl>
              <Row label={t('placeReview.detail.business')} value={revision.businessName} />
              <Row
                label={t('placeReview.detail.submittedAt')}
                value={displayDate(revision.createdAt)}
              />
              {revision.reviewedAt && (
                <Row
                  label={t('placeReview.revision.reviewedAt')}
                  value={displayDate(revision.reviewedAt)}
                />
              )}
              {revision.rejectReasonCode && (
                <Row
                  label={t('placeReview.revision.reason')}
                  value={t(REJECT_CODE_KEY[revision.rejectReasonCode])}
                />
              )}
              {revision.partnerFeedback && (
                <Row label={t('placeReview.revision.feedback')} value={revision.partnerFeedback} />
              )}
              {revision.reviewNote && (
                <Row label={t('placeReview.revision.note')} value={revision.reviewNote} />
              )}
            </dl>
          </Section>
        </div>
      </div>

      <div>
        <Button variant="secondary" onClick={() => setShowFull((open) => !open)}>
          <Icon name={showFull ? 'expand_less' : 'expand_more'} className="text-[20px]" />
          {t(showFull ? 'placeReview.revision.hideFull' : 'placeReview.revision.showFull')}
        </Button>
      </div>
      {showFull && (
        <div className="flex flex-col gap-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {t('placeReview.revision.fullTitle')}
          </h2>
          <PlaceContentView place={revision.proposed} />
        </div>
      )}

      {dialog === 'approve' && (
        <ApproveDialog
          kind="revision"
          name={current.name}
          busy={busy}
          onConfirm={(note) => void approve(note)}
          onClose={() => !busy && setDialog(null)}
        />
      )}
      {dialog === 'reject' && (
        <RejectRevisionDialog
          name={current.name}
          busy={busy}
          onConfirm={(code, feedback, note) => void reject(code, feedback, note)}
          onClose={() => !busy && setDialog(null)}
        />
      )}
    </div>
  );
}

/** Xét duyệt bản sửa: /admin/listings/revisions/:id — dữ liệu thật */
export default function RevisionReviewPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const { version } = useListingReview();
  const [detail, setDetail] = useState<RevisionDetail | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    listingReviewService
      .getRevision(id)
      .then((next) => {
        if (!active) return;
        setDetail(next);
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
        backTo={`${ROUTES.LISTINGS}?tab=revisions`}
        backLabel={t('placeReview.detail.backQueue')}
      />
    );
  }
  if (error && !detail) {
    return (
      <ErrorState
        title={t('placeReview.detail.loadError')}
        message={error.message}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!detail || detail.revision.id !== id) return <PageLoader />;
  return <RevisionReviewContent detail={detail} onChanged={setDetail} />;
}
