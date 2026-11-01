import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, NotFoundState, PageLoader } from '@/components/common';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useListings, useResource, useToast } from '@/hooks';
import { listingService } from '@/services/listingService';
import type { Listing, ListingDetail, ListingDocument, RejectionReason } from '@/types';
import ApproveListingModal from './components/ApproveListingModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import LegalDocumentsSection from './components/LegalDocumentsSection';
import LocationSection from './components/LocationSection';
import MapInfoSection from './components/MapInfoSection';
import PartnerChecklistCard from './components/PartnerChecklistCard';
import PhotoGallerySection from './components/PhotoGallerySection';
import RejectListingModal from './components/RejectListingModal';
import ReviewActionBar from './components/ReviewActionBar';
import ReviewHeader from './components/ReviewHeader';
import ReviewLogCard from './components/ReviewLogCard';
import { buildReviewLogs } from './reviewUtils';

/** Màn Xem xét & Duyệt địa điểm: /admin/listings/:id */
export default function ListingReviewPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { id } = useParams();
  const { listings } = useListings();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <NotFoundState
        title={t('listingReview.page.submissionNotFound', { id })}
        backTo={ROUTES.LISTINGS}
        backLabel={t('listingReview.page.backListings')}
      />
    );
  }

  // key: reset checklist, tài liệu & ghi chú khi chuyển sang hồ sơ khác
  return <ListingReviewLoader key={listing.id} listing={listing} />;
}

/** Tải hồ sơ thẩm định chi tiết qua listingService (1 lần cho mỗi hồ sơ) */
function ListingReviewLoader({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { listings } = useListings();
  const detail = useResource(
    () => listingService.getDetail(listing, listings),
    () => listingService.peekDetail(listing, listings),
  );

  if (detail.status === 'error') {
    return (
      <ErrorState
        title={t('listingReview.page.couldNotLoadReview')}
        message={detail.error}
        onRetry={detail.reload}
      />
    );
  }
  if (!detail.data) return <PageLoader />;
  return <ListingReviewContent listing={listing} detail={detail.data} />;
}

function ListingReviewContent({ listing, detail }: { listing: Listing; detail: ListingDetail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listings, approveListings, rejectListing } = useListings();

  const [checklist, setChecklist] = useState(detail.checklist);
  const [documents, setDocuments] = useState(detail.documents);
  const [note, setNote] = useState(detail.defaultNote);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<ListingDocument | null>(null);

  const isPending = listing.status === 'pending';
  const logs = useMemo(() => buildReviewLogs(listing, detail), [listing, detail]);
  const nextPending = listings.find((item) => item.status === 'pending' && item.id !== listing.id);

  const failedChecks = checklist.filter((item) => !item.passed).length;
  const verifiedDocs = documents.filter((document) => document.verified).length;
  const pendingDocs = documents.length - verifiedDocs;
  const canApprove = failedChecks === 0 && pendingDocs === 0;
  const approveBlockedReason = [
    failedChecks > 0 && t('listingReview.page.checklistItemsHaveNot', { count: failedChecks }),
    pendingDocs > 0 && t('listingReview.page.documentsHaveNotBeen', { count: pendingDocs }),
  ]
    .filter(Boolean)
    .join(', ');

  // ===== Thao tác kiểm định =====
  const toggleCheck = (itemId: string) => {
    setChecklist((current) =>
      current.map((item) => (item.id === itemId ? { ...item, passed: !item.passed } : item)),
    );
  };

  const toggleDocument = (documentId: string) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId ? { ...document, verified: !document.verified } : document,
      ),
    );
  };

  // ===== Phê duyệt / từ chối =====
  // Modal tự đóng sau hiệu ứng "Đã phê duyệt thành công!"
  const handleApprove = (reviewNote: string) => {
    approveListings([listing.id], reviewNote || undefined);
    setNote(reviewNote);
    showToast(
      t('listingReview.page.approvedPlaceNowLive', {
        name: listing.name,
        partnerName: listing.partnerName,
      }),
    );
  };

  const handleReject = (reason: RejectionReason, feedback: string) => {
    rejectListing(listing.id, reason.title, {
      feedback,
      reasonCode: reason.id,
      note: note.trim() || undefined,
    });
    setRejecting(false);
    showToast(
      t('listingReview.page.rejectedListingEmailNotification', {
        id: listing.id,
        partnerName: listing.partnerName,
      }),
      'error',
    );
  };

  return (
    // pb-28: chừa chỗ cho thanh hành động cố định ở đáy
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 pb-28">
      <div className="flex flex-col">
        <ReviewHeader listing={listing} detail={detail} />
      </div>

      <div className="grid grid-cols-12 items-start gap-6">
        {/* Cột trái: 01 Thông tin địa điểm (bộ trường theo loại dịch vụ), 03 Hình ảnh */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <MapInfoSection listing={listing} />
          <PhotoGallerySection detail={detail} />
        </div>

        {/* Cột phải: Đối tác + Checklist, 02 Vị trí, 04 Pháp lý, Nhật ký */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">
          <PartnerChecklistCard
            listing={listing}
            detail={detail}
            checklist={checklist}
            editable={isPending}
            onToggleCheck={toggleCheck}
          />
          <LocationSection listing={listing} detail={detail} />
          <LegalDocumentsSection
            documents={documents}
            editable={isPending}
            onToggleVerified={toggleDocument}
            onPreview={setPreviewDocument}
            onDownloadAll={() =>
              showToast(
                t('listingReview.page.preparingZipDocuments', {
                  count: documents.length,
                  id: listing.id,
                }),
                'info',
              )
            }
          />
          <ReviewLogCard logs={logs} />
        </div>
      </div>

      <ReviewActionBar
        listing={listing}
        note={note}
        onNoteChange={setNote}
        verifiedDocs={verifiedDocs}
        totalDocs={documents.length}
        canApprove={canApprove}
        approveBlockedReason={t('listingReview.page.cannotApproveYet', { approveBlockedReason })}
        hasNextPending={Boolean(nextPending)}
        onApprove={() => setConfirmApprove(true)}
        onReject={() => setRejecting(true)}
        onNext={() => nextPending && navigate(listingReviewPath(nextPending.id))}
      />

      {confirmApprove && (
        <ApproveListingModal
          listing={listing}
          initialNote={note}
          onClose={() => setConfirmApprove(false)}
          onConfirm={handleApprove}
        />
      )}

      {rejecting && (
        <RejectListingModal
          listing={listing}
          onClose={() => setRejecting(false)}
          onConfirm={handleReject}
        />
      )}

      {previewDocument && (
        <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
      )}
    </div>
  );
}
