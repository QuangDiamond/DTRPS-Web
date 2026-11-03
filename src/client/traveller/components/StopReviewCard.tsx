import { type ChangeEvent, useRef, useState } from 'react';
import { Icon } from '@/components/common';

export interface StopReview {
  stopId: string;
  rating: number;
  comment: string;
  /** Ảnh xem trước trên trình duyệt (object URL) — chưa có API lưu nhận xét */
  photos: string[];
}

const MAX_PHOTOS = 5;
const MAX_COMMENT = 300;
const RATING_LABELS = ['', 'Tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

/** Nhận xét một điểm dừng — theo StopReviewCard của mobile */
export default function StopReviewCard({
  stopId,
  stopTitle,
  savedReview,
  onSubmit,
}: {
  stopId: string;
  stopTitle: string;
  savedReview?: StopReview;
  onSubmit: (review: StopReview) => void;
}) {
  const [rating, setRating] = useState(savedReview?.rating ?? 0);
  const [comment, setComment] = useState(savedReview?.comment ?? '');
  const [photos, setPhotos] = useState<string[]>(savedReview?.photos ?? []);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(!savedReview);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_PHOTOS - photos.length;

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    event.target.value = '';
    setPhotos((previous) =>
      [...previous, ...files.map((file) => URL.createObjectURL(file))].slice(0, MAX_PHOTOS),
    );
  };

  const removePhoto = (index: number) =>
    setPhotos((previous) => {
      URL.revokeObjectURL(previous[index]);
      return previous.filter((_, i) => i !== index);
    });

  const submit = () => {
    if (rating === 0) {
      setError('Hãy chọn số sao cho điểm này.');
      return;
    }
    setError(null);
    onSubmit({ stopId, rating, comment: comment.trim(), photos });
    setEditing(false);
    setExpanded(false);
  };

  if (!editing && savedReview) {
    return (
      <div className="rounded-[14px] bg-[#F3F6FC] px-3 py-2.5">
        <div className="flex items-center gap-1">
          <Icon name="verified" filled className="text-[17px] text-[#006B67]" />
          <span className="text-[12px] font-extrabold text-[#006B67]">Đã nhận xét</span>
          <span className="ml-1.5 flex" aria-label={`${savedReview.rating} sao`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Icon
                key={value}
                name="star"
                filled={value <= savedReview.rating}
                className="text-[14px] text-[#F2B01E]"
              />
            ))}
          </span>
          {savedReview.photos.length > 0 && (
            <span className="ml-1 text-[10.5px] text-[#75879A]">
              · {savedReview.photos.length} ảnh
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setExpanded(true);
            }}
            className="ml-auto pl-2.5 text-[11.5px] font-extrabold text-[#006B67]"
          >
            Sửa
          </button>
        </div>
        {savedReview.comment && (
          <p className="mt-1 line-clamp-2 text-[11px] text-[#526C7D] italic">
            “{savedReview.comment}”
          </p>
        )}
        <p className="mt-1 text-[10px] text-[#75879A]">Cảm ơn bạn đã đánh giá “{stopTitle}”.</p>
      </div>
    );
  }

  const showForm = expanded || rating > 0;
  return (
    <div className="rounded-[14px] bg-[#F3F6FC] px-3 py-2.5">
      <div className="flex items-center">
        <span className="flex-1 text-[12.5px] font-extrabold text-[#17344A]">
          Nhận xét điểm này
        </span>
        <span className="flex gap-0.5" role="radiogroup" aria-label="Số sao">
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
                className={`text-[24px] ${value <= rating ? 'text-[#F2B01E]' : 'text-[#B9C4CF]'}`}
              />
            </button>
          ))}
        </span>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[#75879A]"
        >
          <Icon name="add_a_photo" className="text-[15px]" />
          Chấm sao, viết cảm nhận và gửi ảnh
        </button>
      ) : (
        <>
          {rating > 0 && (
            <p className="mt-0.5 text-right text-[10.5px] font-bold text-[#B07A00]">
              {RATING_LABELS[rating]}
            </p>
          )}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={MAX_COMMENT}
            rows={2}
            placeholder="Chia sẻ cảm nhận của bạn về điểm này..."
            aria-label="Cảm nhận về điểm dừng"
            className="mt-1.5 w-full resize-none rounded-[11px] border border-[#E3E9EF] bg-white px-2.5 py-2 text-[12px] text-[#17344A] placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <div className="flex gap-2 overflow-x-auto pt-2">
            {remaining > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex h-[54px] w-[62px] shrink-0 flex-col items-center justify-center rounded-[11px] border-[1.5px] border-dashed border-[#9FD9CF] bg-[#E6F8F4] text-[#006B67]"
                >
                  <Icon name="add_a_photo" className="text-[20px]" />
                  <span className="mt-0.5 text-[9px] font-bold">Chụp ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => libraryRef.current?.click()}
                  className="flex h-[54px] w-[62px] shrink-0 flex-col items-center justify-center rounded-[11px] border-[1.5px] border-dashed border-[#9FD9CF] bg-[#E6F8F4] text-[#006B67]"
                >
                  <Icon name="photo_library" className="text-[20px]" />
                  <span className="mt-0.5 text-[9px] font-bold">Thư viện</span>
                </button>
              </>
            )}
            {photos.map((uri, index) => (
              <span key={uri} className="relative shrink-0">
                <img src={uri} alt="" className="h-[54px] w-[54px] rounded-[11px] object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label="Xoá ảnh"
                  className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#17344A]/85 text-white"
                >
                  <Icon name="close" className="text-[12px]" />
                </button>
              </span>
            ))}
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={addFiles}
            className="hidden"
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            multiple
            onChange={addFiles}
            className="hidden"
          />
          <p className="mt-1 text-[10px] text-[#75879A]">
            {photos.length}/{MAX_PHOTOS} ảnh{remaining === 0 ? ' · đã đủ' : ''}
          </p>
          {error && <p className="mt-1 text-[11px] text-client-danger">{error}</p>}
          <button
            type="button"
            onClick={submit}
            className={`mt-2.5 flex h-[38px] w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#006B67] text-[12px] font-extrabold text-white ${
              rating === 0 ? 'opacity-50' : ''
            }`}
          >
            <Icon name="send" className="text-[15px]" />
            Gửi nhận xét
          </button>
        </>
      )}
    </div>
  );
}
