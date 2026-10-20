import Icon from '../../../components/common/Icon';
import type { ListingDocument } from '../../../types/admin';
import ReviewSection from './ReviewSection';

interface LegalDocumentsSectionProps {
  documents: ListingDocument[];
  editable: boolean;
  onToggleVerified: (id: string) => void;
  onPreview: (document: ListingDocument) => void;
  onDownloadAll: () => void;
}

const FILE_TYPE_STYLE: Record<
  ListingDocument['fileType'],
  { icon: string; label: string; className: string }
> = {
  pdf: {
    icon: 'picture_as_pdf',
    label: 'PDF',
    className: 'border-error-container bg-error-container/70 text-error',
  },
  image: {
    icon: 'photo_camera',
    label: 'JPG',
    className: 'border-secondary-fixed-dim/50 bg-secondary-container/60 text-secondary',
  },
};

export default function LegalDocumentsSection({
  documents,
  editable,
  onToggleVerified,
  onPreview,
  onDownloadAll,
}: LegalDocumentsSectionProps) {
  const verifiedCount = documents.filter((document) => document.verified).length;

  return (
    <ReviewSection
      accent
      number="05"
      numberClassName="bg-tertiary-container"
      title="Tài liệu pháp lý"
      subtitle={`${verifiedCount}/${documents.length} văn bản có mộc đỏ đối chiếu CSDL quốc gia`}
      action={
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-error-container bg-error-container/70 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-on-error-container uppercase">
            Bắt buộc
          </span>
          <button
            type="button"
            onClick={onDownloadAll}
            className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
          >
            <Icon name="download" className="text-[16px]" />
            Tải ZIP
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-2.5">
        {documents.map((document) => {
          const fileStyle = FILE_TYPE_STYLE[document.fileType];
          return (
            <div
              key={document.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-surface-container-high/80 bg-surface-container-low p-3 transition-colors hover:border-outline-variant"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border ${fileStyle.className}`}
                >
                  <Icon name={fileStyle.icon} className="text-[20px]" />
                  <span className="font-mono text-[8px] font-extrabold">{fileStyle.label}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[12.5px] font-bold text-on-surface">
                    {document.title}
                  </h3>
                  <div className="truncate font-mono text-[11px] text-on-surface-variant">
                    {document.meta}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPreview(document)}
                  className="rounded-lg border border-surface-container-high bg-surface-container-lowest p-1.5 text-on-surface-variant hover:bg-surface-container"
                  title="Xem trước tài liệu"
                >
                  <Icon name="visibility" className="text-[17px]" />
                </button>
                <button
                  type="button"
                  disabled={!editable}
                  onClick={() => onToggleVerified(document.id)}
                  title={editable ? 'Bấm để đổi trạng thái đối chiếu' : undefined}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:cursor-default ${
                    document.verified
                      ? 'border-secondary-fixed-dim/50 bg-secondary-container/60 text-on-secondary-fixed-variant'
                      : 'border-tertiary-fixed bg-tertiary-fixed/30 text-on-tertiary-fixed-variant hover:bg-tertiary-fixed/60'
                  }`}
                >
                  <Icon name={document.verified ? 'check' : 'pending'} className="text-[14px]" />
                  {document.verified ? 'Đã đối chiếu' : 'Chờ đối chiếu'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ReviewSection>
  );
}
