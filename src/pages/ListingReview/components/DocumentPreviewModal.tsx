import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import type { ListingDocument } from '../../../types/admin';

interface DocumentPreviewModalProps {
  document: ListingDocument;
  onClose: () => void;
}

/** Xem trước tài liệu — prototype chưa có file thật nên hiển thị thông tin văn bản */
export default function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  return (
    <Modal title={document.title} description={document.meta} onClose={onClose} size="lg">
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
        <Icon
          name={document.fileType === 'pdf' ? 'picture_as_pdf' : 'image'}
          className="text-[48px]"
        />
        <span className="text-[13px] font-semibold">
          Bản xem trước {document.fileType === 'pdf' ? 'PDF' : 'ảnh'} sẽ hiển thị khi kết nối máy
          chủ lưu trữ tài liệu
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            document.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {document.verified ? 'Đã đối chiếu với CSDL quốc gia' : 'Chưa đối chiếu'}
        </span>
      </div>
    </Modal>
  );
}
