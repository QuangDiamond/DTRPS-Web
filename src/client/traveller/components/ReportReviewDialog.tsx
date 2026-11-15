import { useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import {
  placeReviewApi,
  REPORT_REASONS,
  type PlaceReview,
  type ReviewReportReason,
} from '@/client/api/placeReviewApi';
import { Dialog } from '@/client/ui/Overlay';

const MAX_NOTE_LENGTH = 500;

interface ReportReviewDialogProps {
  placeId: number | string;
  review: PlaceReview;
  onClose: () => void;
  /** Gửi thành công */
  onReported: () => void;
}

/** Báo cáo đánh giá của người khác: chọn một lý do + ghi chú (bắt buộc khi chọn "Khác") */
export default function ReportReviewDialog({
  placeId,
  review,
  onClose,
  onReported,
}: ReportReviewDialogProps) {
  const [reason, setReason] = useState<ReviewReportReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) {
      setError('Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (reason === 'OTHER' && !note.trim()) {
      setError('Vui lòng ghi rõ lý do khi chọn "Khác".');
      return;
    }
    setSending(true);
    setError('');
    try {
      await placeReviewApi.report(placeId, review.reviewId, {
        reason,
        note: note.trim() || null,
      });
      onReported();
    } catch (failure) {
      setError(errorMessage(failure));
      setSending(false);
    }
  };

  return (
    <Dialog label="Báo cáo đánh giá" onClose={sending ? () => undefined : onClose}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-client-danger">
            <Icon name="flag" className="text-[22px]" />
          </span>
          <div>
            <p className="text-[17px] font-extrabold text-client-ink">Báo cáo đánh giá</p>
            <p className="mt-0.5 text-[13px] leading-5 text-client-muted">
              Đánh giá của <b>{review.userName ?? 'Khách Smart Travel'}</b> có vấn đề gì? Admin sẽ
              xem xét và báo kết quả cho bạn.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2" role="radiogroup" aria-label="Lý do báo cáo">
          {REPORT_REASONS.map((option) => {
            const selected = reason === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setReason(option.value);
                  setError('');
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors ${
                  selected
                    ? 'border-primary bg-[#E7F6F4]'
                    : 'border-[#E3E9EE] bg-white hover:bg-[#F6F9FA]'
                }`}
              >
                <Icon
                  name={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                  className={`text-[20px] ${selected ? 'text-primary' : 'text-[#9AA7B4]'}`}
                />
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-client-ink">
                    {option.label}
                  </span>
                  <span className="block text-[12px] text-client-muted">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[12px] font-bold text-[#293E4A]">
            Ghi chú {reason === 'OTHER' ? '(bắt buộc)' : '(không bắt buộc)'}
          </span>
          <textarea
            rows={3}
            maxLength={MAX_NOTE_LENGTH}
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setError('');
            }}
            placeholder="Mô tả thêm để admin xử lý nhanh hơn…"
            className="w-full resize-none rounded-2xl border border-[#E3E9EE] p-3 text-[14px] text-client-ink outline-none focus:border-primary"
          />
          <span className="mt-0.5 block text-right text-[11px] text-client-muted">
            {note.length}/{MAX_NOTE_LENGTH}
          </span>
        </label>

        {error && <p className="mt-1 text-[13px] font-semibold text-client-danger">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="h-11 flex-1 rounded-full bg-client-soft text-[13px] font-bold text-client-ink disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={sending}
            className="h-11 flex-1 rounded-full bg-client-danger text-[13px] font-bold text-white disabled:opacity-60"
          >
            {sending ? 'Đang gửi…' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
