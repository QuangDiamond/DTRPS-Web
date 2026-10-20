import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import type { RejectionReason } from '../../constants/listing';
import { listingReviewPath, ROUTES } from '../../constants/routes';
import { useListings } from '../../hooks/useListings';
import { useToast } from '../../hooks/useToast';
import type { Listing, ListingDocument } from '../../types/admin';
import ApproveListingModal from './components/ApproveListingModal';
import BasicInfoSection from './components/BasicInfoSection';
import BusinessInfoSection from './components/BusinessInfoSection';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import LegalDocumentsSection from './components/LegalDocumentsSection';
import LocationSection from './components/LocationSection';
import PartnerChecklistCard from './components/PartnerChecklistCard';
import PhotoGallerySection from './components/PhotoGallerySection';
import RejectListingModal from './components/RejectListingModal';
import ReviewActionBar from './components/ReviewActionBar';
import ReviewHeader from './components/ReviewHeader';
import ReviewLogCard from './components/ReviewLogCard';
import { buildReviewLogs, getListingDetail } from './reviewUtils';

/** Màn Xem xét & Duyệt địa điểm: /admin/listings/:id */
export default function ListingReviewPage() {
  const { id } = useParams();
  const { listings } = useListings();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white py-16 text-center shadow-sm">
        <Icon name="search_off" className="text-[48px] text-slate-400" />
        <h1 className="text-[20px] font-extrabold text-slate-900">Không tìm thấy hồ sơ {id}</h1>
        <Link to={ROUTES.LISTINGS} className="text-[13px] font-bold text-primary hover:underline">
          Quay lại danh sách niêm yết
        </Link>
      </div>
    );
  }

  // key: reset checklist, tài liệu & ghi chú khi chuyển sang hồ sơ khác
  return <ListingReviewContent key={listing.id} listing={listing} />;
}

function ListingReviewContent({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listings, approveListings, rejectListing } = useListings();

  // Hồ sơ chi tiết chỉ tính 1 lần cho mỗi hồ sơ (key ở component cha)
  const [detail] = useState(() => getListingDetail(listing, listings));
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
    failedChecks > 0 && `còn ${failedChecks} mục checklist chưa đạt`,
    pendingDocs > 0 && `còn ${pendingDocs} tài liệu chưa đối chiếu`,
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
      `Đã phê duyệt ${listing.name}! Địa điểm đã chính thức hoạt động và thông báo đã gửi tới ${listing.partnerName}.`,
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
      `Đã từ chối niêm yết ${listing.id}. Email và thông báo đã được gửi đến ${listing.partnerName}.`,
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
        {/* Cột trái: 01 Thông tin cơ bản, 03 Hình ảnh, 04 Thông tin kinh doanh */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <BasicInfoSection listing={listing} detail={detail} />
          <PhotoGallerySection detail={detail} />
          <BusinessInfoSection detail={detail} />
        </div>

        {/* Cột phải: Đối tác + Checklist, 02 Bản đồ, 05 Pháp lý, Nhật ký */}
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
                `Đang chuẩn bị file ZIP ${documents.length} tài liệu của ${listing.id}`,
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
        approveBlockedReason={`Chưa thể phê duyệt: ${approveBlockedReason}`}
        hasNextPending={Boolean(nextPending)}
        onApprove={() => setConfirmApprove(true)}
        onReject={() => setRejecting(true)}
        onNext={() => nextPending && navigate(listingReviewPath(nextPending.id))}
      />

      {confirmApprove && (
        <ApproveListingModal
          listing={listing}
          detail={detail}
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
