import { useTranslation } from 'react-i18next';
import { Icon, Modal } from '@/components/common';
import type { ListingDocument } from '@/types';

interface DocumentPreviewModalProps {
  document: ListingDocument;
  onClose: () => void;
}

/** Xem trước tài liệu — prototype chưa có file thật nên hiển thị thông tin văn bản */
export default function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={document.title} description={document.meta} onClose={onClose} size="lg">
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low text-outline">
        <Icon
          name={document.fileType === 'pdf' ? 'picture_as_pdf' : 'image'}
          className="text-[48px]"
        />
        <span className="text-[13px] font-semibold">
          {document.fileType === 'pdf'
            ? t('listingReview.documentPreviewModal.thePdfPreviewWill')
            : t('listingReview.documentPreviewModal.theImagePreviewWill')}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            document.verified
              ? 'bg-secondary-container/60 text-on-secondary-fixed-variant'
              : 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant'
          }`}
        >
          {document.verified
            ? t('listingReview.documentPreviewModal.verifiedAgainstNationalDatabase')
            : t('listingReview.documentPreviewModal.notVerified')}
        </span>
      </div>
    </Modal>
  );
}
