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
    className: 'border-red-200 bg-red-100 text-red-700',
  },
  image: {
    icon: 'photo_camera',
    label: 'JPG',
    className: 'border-blue-200 bg-blue-100 text-blue-700',
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
      numberClassName="bg-amber-600"
      title="Tài liệu pháp lý"
      subtitle={`${verifiedCount}/${documents.length} văn bản có mộc đỏ đối chiếu CSDL quốc gia`}
      action={
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-rose-800 uppercase">
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
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3 transition-colors hover:border-slate-300"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border ${fileStyle.className}`}
                >
                  <Icon name={fileStyle.icon} className="text-[20px]" />
                  <span className="font-mono text-[8px] font-extrabold">{fileStyle.label}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[12.5px] font-bold text-slate-900">
                    {document.title}
                  </h3>
                  <div className="truncate font-mono text-[11px] text-slate-600">
                    {document.meta}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPreview(document)}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100"
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
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                      : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
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
