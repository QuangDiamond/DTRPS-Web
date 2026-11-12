import { useState } from 'react';
import { Icon } from '@/components/common';
import { Dialog } from '@/client/ui/Overlay';
import { errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type TripFeedbackResponse,
} from '@/client/api/tripFlowApi';

const MAX_COMMENT = 2000;
const RATING_LABELS = ['', 'Tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

/** Modal đánh giá chuyến đi (1-5 sao + nhận xét) — hiện tự động khi kế hoạch COMPLETED */
export default function TripFeedbackModal({
  planId,
  onClose,
  onSubmitted,
}: {
  planId: number;
  onClose: () => void;
  onSubmitted?: (feedback: TripFeedbackResponse) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (rating === 0) {
      setError('Hãy chọn số sao đánh giá.');
      return;
    }

    setError(null);
    setSubmitting(true);

    tripFlowApi
      .createFeedback(planId, {
        rating,
        comment: comment.trim() || null,
      })
      .then((feedback) => {
        setDone(true);
        onSubmitted?.(feedback);
      })
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  if (done) {
    return (
      <Dialog label="Đánh giá chuyến đi" onClose={onClose} className="max-w-sm">
        <div className="flex flex-col items-center p-6 text-center">
          <Icon name="favorite" filled className="text-[40px] text-[#F2385A]" />

          <p className="mt-3 text-[15px] font-extrabold text-client-ink">
            Cảm ơn bạn đã đánh giá!
          </p>

          <p className="mt-1 text-[12px] leading-5 text-client-muted">
            Nhận xét của bạn giúp chúng tôi cải thiện trải nghiệm chuyến đi.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 h-11 w-full rounded-full bg-primary text-[13px] font-bold text-white"
          >
            Đóng
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog label="Đánh giá chuyến đi" onClose={onClose} className="max-w-sm">
      <div className="relative p-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-client-soft text-client-muted"
        >
          <Icon name="close" className="text-[18px]" />
        </button>

        <p className="pr-8 text-[17px] font-extrabold text-client-ink">
          Đánh giá chuyến đi
        </p>

        <p className="mt-1 text-[12px] leading-5 text-client-muted">
          Chuyến đi của bạn đã hoàn thành. Hãy chấm sao và chia sẻ cảm nhận của bạn.
        </p>

        <div
          className="mt-4 flex justify-center gap-1"
          role="radiogroup"
          aria-label="Số sao"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} sao`}
              onClick={() => setRating(value)}
            >
              <Icon
                name="star"
                filled={value <= rating}
                className={`text-[32px] ${value <= rating ? 'text-[#F2B01E]' : 'text-[#D7DEE5]'}`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="mt-1 text-center text-[12px] font-bold text-[#B07A00]">
            {RATING_LABELS[rating]}
          </p>
        )}

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={MAX_COMMENT}
          rows={3}
          placeholder="Chia sẻ cảm nhận của bạn về chuyến đi này..."
          aria-label="Nhận xét chuyến đi"
          className="mt-4 w-full resize-none rounded-2xl border border-[#E3E9EF] px-3 py-2.5 text-[13px] text-client-ink placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />

        {error && (
          <p className="mt-2 text-[11px] text-client-danger">{error}</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-11 flex-1 rounded-full bg-client-soft text-[13px] font-bold text-client-ink disabled:opacity-50"
          >
            Để sau
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || rating === 0}
            className="h-11 flex-1 rounded-full bg-primary text-[13px] font-bold text-white disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
