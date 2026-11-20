import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { errorMessage } from '@/client/api/http';
import { placeReviewApi, type PlaceReview } from '@/client/api/placeReviewApi';
import Avatar from '@/client/traveller/components/Avatar';

const MAX_PHOTOS = 5;
const MAX_COMMENT = 2000;
const RATING_LABELS = ['', 'Tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

/** Xem trước ảnh mới chọn — tạo/giải phóng object URL theo vòng đời của danh sách file. */
function useObjectUrls(files: File[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return urls;
}

/**
 * Nhận xét một địa điểm — 1-5 sao + bình luận + tối đa 5 ảnh tải lên, lưu thật vào Backend. Mỗi
 * lần thực sự đi địa điểm này (kể cả đi lại) được đánh giá thêm một lần; một đánh giá đã gửi thì
 * không sửa/xóa lại được.
 */
export default function StopReviewCard({
  stopTitle,
  placeId,
  onSubmitted,
}: {
  stopTitle: string;
  placeId: number;
  /** Gửi đánh giá thành công — để trang cha nạp lại danh sách đánh giá công khai. */
  onSubmitted?: (review: PlaceReview) => void;
}) {
  const { user } = useClientAuth();
  // Xác nhận vừa gửi — chỉ hiện tạm trên màn hình, không phải đánh giá "đang có" từ Backend.
  const [justSubmitted, setJustSubmitted] = useState<PlaceReview | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const photoPreviews = useObjectUrls(photos);

  // Có được viết đánh giá cho địa điểm này không mỗi khi chuyển sang địa điểm khác.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setJustSubmitted(null);
    setRating(0);
    setComment('');
    setPhotos([]);
    setExpanded(false);

    placeReviewApi
      .mine(placeId)
      .then((status) => {
        if (active) setCanReview(status.canReview);
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [placeId]);

  const remainingSlots = MAX_PHOTOS - photos.length;

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    event.target.value = '';
    setPhotos((previous) => [...previous, ...files].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) =>
    setPhotos((previous) => previous.filter((_, i) => i !== index));

  const submit = () => {
    if (rating === 0) {
      setError('Hãy chọn số sao cho địa điểm này.');
      return;
    }
    setError(null);
    setSubmitting(true);

    placeReviewApi
      .create(placeId, { rating, comment, photos })
      .then((result) => {
        setJustSubmitted(result);
        setCanReview(false);
        setPhotos([]);
        setExpanded(false);
        onSubmitted?.(result);
      })
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  const AuthorRow = () => (
    <div className="flex items-center gap-2.5">
      <Avatar url={user?.avatarUrl} size={40} iconSize={24} />
      <span className="min-w-0 truncate text-[14px] font-extrabold text-[#17344A]">
        {user?.name ?? 'Bạn'}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#F3F6FC] px-4 py-3.5 text-center text-[13px] text-[#75879A]">
        Đang tải đánh giá...
      </div>
    );
  }

  // Vừa gửi xong: hiện lời cảm ơn tạm thời (đánh giá thật đã nằm trong danh sách công khai).
  if (justSubmitted) {
    return (
      <div className="rounded-2xl bg-[#F3F6FC] px-4 py-3.5">
        <AuthorRow />

        <div className="mt-2.5 flex items-center gap-2">
          <Icon name="verified" filled className="text-[19px] text-[#0E7490]" />
          <span className="text-[13.5px] font-extrabold text-[#0E7490]">Đã gửi nhận xét</span>
          <span className="flex" aria-label={`${justSubmitted.rating} sao`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Icon
                key={value}
                name="star"
                filled={value <= justSubmitted.rating}
                className="text-[18px] text-[#F2B01E]"
              />
            ))}
          </span>
        </div>

        {justSubmitted.comment && (
          <p className="mt-2 text-[14px] leading-[22px] text-[#3B4B57] italic">
            “{justSubmitted.comment}”
          </p>
        )}
        <p className="mt-2 text-[12px] text-[#75879A]">Cảm ơn bạn đã đánh giá “{stopTitle}”.</p>
      </div>
    );
  }

  // Chưa từng đi địa điểm này, hoặc đã đánh giá đủ số lần đã đi: chỉ xem, không tự viết được.
  if (!canReview) {
    return null;
  }

  const showForm = expanded || rating > 0;
  return (
    <div className="rounded-2xl bg-[#F3F6FC] px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <AuthorRow />
        <span className="flex shrink-0 gap-1" role="radiogroup" aria-label="Số sao">
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
                className={`text-[30px] ${value <= rating ? 'text-[#F2B01E]' : 'text-[#B9C4CF]'}`}
              />
            </button>
          ))}
        </span>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2.5 flex items-center gap-1.5 text-[13px] text-[#5D7786]"
        >
          <Icon name="add_photo_alternate" className="text-[18px]" />
          Chấm sao, viết cảm nhận và gửi ảnh
        </button>
      ) : (
        <>
          {rating > 0 && (
            <p className="mt-1 text-right text-[12.5px] font-bold text-[#B07A00]">
              {RATING_LABELS[rating]}
            </p>
          )}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={MAX_COMMENT}
            rows={3}
            placeholder="Chia sẻ cảm nhận của bạn về địa điểm này..."
            aria-label="Cảm nhận về địa điểm"
            className="mt-2 w-full resize-none rounded-2xl border border-[#E3E9EF] bg-white px-3.5 py-3 text-[14px] text-[#17344A] placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-client-primary/30 focus:outline-none"
          />
          <div className="flex gap-2.5 overflow-x-auto pt-3">
            {remainingSlots > 0 && (
              <button
                type="button"
                onClick={() => libraryRef.current?.click()}
                className="flex h-[76px] w-[84px] shrink-0 flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#9CD6DC] bg-[#E5F7F9] text-[#0E7490]"
              >
                <Icon name="add_photo_alternate" className="text-[24px]" />
                <span className="mt-1 text-[11px] font-bold">Thêm ảnh</span>
              </button>
            )}
            {photoPreviews.map((uri, index) => (
              <span key={uri} className="relative shrink-0">
                <img src={uri} alt="" className="h-[76px] w-[76px] rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label="Xoá ảnh"
                  className="absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#17344A]/85 text-white"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </span>
            ))}
          </div>
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            multiple
            onChange={addFiles}
            className="hidden"
          />
          <p className="mt-2 text-[12px] text-[#75879A]">
            {photos.length}/{MAX_PHOTOS} ảnh
            {remainingSlots === 0 ? ' · đã đủ' : ''}
          </p>
          {error && <p className="mt-1.5 text-[13px] text-client-danger">{error}</p>}
          <p className="mt-2 text-[11.5px] text-[#9AA8B5]">
            Đánh giá không sửa/xóa lại được sau khi gửi. Đi lại địa điểm này bạn sẽ đánh giá
            thêm được.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={rating === 0 || submitting}
            className={`mt-2.5 flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E7490] text-[14px] font-extrabold text-white ${
              rating === 0 || submitting ? 'opacity-50' : ''
            }`}
          >
            <Icon name="send" className="text-[18px]" />
            {submitting ? 'Đang gửi...' : 'Gửi nhận xét'}
          </button>
        </>
      )}
    </div>
  );
}
