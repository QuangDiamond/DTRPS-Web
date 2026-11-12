import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { placeReviewApi } from '@/client/api/placeReviewApi';
import { ConfirmDialog } from '@/client/ui/Overlay';

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

/** Nhận xét một địa điểm — 1-5 sao + bình luận + tối đa 5 ảnh tải lên, lưu thật vào Backend. */
export default function StopReviewCard({
  stopTitle,
  placeId,
}: {
  stopTitle: string;
  placeId: number;
}) {
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const newPhotoPreviews = useObjectUrls(newPhotos);

  // Tải đánh giá đã có (nếu có) mỗi khi chuyển sang địa điểm khác.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    placeReviewApi
      .mine(placeId)
      .then((result) => {
        if (!active) return;
        setReviewId(result.reviewId);
        setRating(result.rating);
        setComment(result.comment ?? '');
        setExistingImageUrls(result.imageUrls);
        setNewPhotos([]);
        setEditing(false);
        setExpanded(false);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        if (caught instanceof ClientApiError && caught.status === 404) {
          setReviewId(null);
          setRating(0);
          setComment('');
          setExistingImageUrls([]);
          setNewPhotos([]);
          setEditing(true);
          setExpanded(false);
        } else {
          setError(errorMessage(caught));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [placeId]);

  const remainingSlots = MAX_PHOTOS - existingImageUrls.length - newPhotos.length;

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    event.target.value = '';
    setNewPhotos((previous) => [...previous, ...files].slice(0, MAX_PHOTOS - existingImageUrls.length));
  };

  const removeExistingPhoto = (url: string) =>
    setExistingImageUrls((previous) => previous.filter((item) => item !== url));

  const removeNewPhoto = (index: number) =>
    setNewPhotos((previous) => previous.filter((_, i) => i !== index));

  const cancelEdit = () => {
    if (reviewId === null) {
      setExpanded(false);
      return;
    }
    placeReviewApi
      .mine(placeId)
      .then((result) => {
        setRating(result.rating);
        setComment(result.comment ?? '');
        setExistingImageUrls(result.imageUrls);
      })
      .catch(() => {
        // Giữ nguyên dữ liệu hiện có nếu tải lại thất bại.
      });
    setNewPhotos([]);
    setEditing(false);
    setExpanded(false);
    setError(null);
  };

  const submit = () => {
    if (rating === 0) {
      setError('Hãy chọn số sao cho địa điểm này.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const action =
      reviewId === null
        ? placeReviewApi.create(placeId, { rating, comment, photos: newPhotos })
        : placeReviewApi.update(placeId, {
            rating,
            comment,
            photos: newPhotos,
            keepImageUrls: existingImageUrls,
          });

    action
      .then((result) => {
        setReviewId(result.reviewId);
        setRating(result.rating);
        setComment(result.comment ?? '');
        setExistingImageUrls(result.imageUrls);
        setNewPhotos([]);
        setEditing(false);
        setExpanded(false);
      })
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  const confirmDelete = () => {
    setSubmitting(true);
    placeReviewApi
      .remove(placeId)
      .then(() => {
        setReviewId(null);
        setRating(0);
        setComment('');
        setExistingImageUrls([]);
        setNewPhotos([]);
        setEditing(true);
        setExpanded(false);
      })
      .catch((caught: unknown) => setError(errorMessage(caught)))
      .finally(() => {
        setSubmitting(false);
        setConfirmingDelete(false);
      });
  };

  if (loading) {
    return (
      <div className="rounded-[14px] bg-[#F3F6FC] px-3 py-2.5 text-center text-[11px] text-[#75879A]">
        Đang tải đánh giá...
      </div>
    );
  }

  if (!editing && reviewId !== null) {
    return (
      <div className="rounded-[14px] bg-[#F3F6FC] px-3 py-2.5">
        <div className="flex items-center gap-1">
          <Icon name="verified" filled className="text-[17px] text-[#006B67]" />
          <span className="text-[12px] font-extrabold text-[#006B67]">Đã nhận xét</span>
          <span className="ml-1.5 flex" aria-label={`${rating} sao`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Icon
                key={value}
                name="star"
                filled={value <= rating}
                className="text-[14px] text-[#F2B01E]"
              />
            ))}
          </span>
          {existingImageUrls.length > 0 && (
            <span className="ml-1 text-[10.5px] text-[#75879A]">
              · {existingImageUrls.length} ảnh
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
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="pl-2.5 text-[11.5px] font-extrabold text-client-danger"
          >
            Xóa
          </button>
        </div>
        {comment && (
          <p className="mt-1 line-clamp-2 text-[11px] text-[#526C7D] italic">“{comment}”</p>
        )}
        {existingImageUrls.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {existingImageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-[48px] w-[48px] shrink-0 rounded-[10px] object-cover"
              />
            ))}
          </div>
        )}
        <p className="mt-1 text-[10px] text-[#75879A]">Cảm ơn bạn đã đánh giá “{stopTitle}”.</p>

        {confirmingDelete && (
          <ConfirmDialog
            title="Xóa đánh giá"
            message="Xóa đánh giá của bạn cho địa điểm này? Không thể hoàn tác."
            confirmLabel="Xóa"
            danger
            onConfirm={confirmDelete}
            onClose={() => setConfirmingDelete(false)}
          />
        )}
      </div>
    );
  }

  const showForm = expanded || rating > 0;
  return (
    <div className="rounded-[14px] bg-[#F3F6FC] px-3 py-2.5">
      <div className="flex items-center">
        <span className="flex-1 text-[12.5px] font-extrabold text-[#17344A]">
          Nhận xét địa điểm này
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
          <Icon name="add_photo_alternate" className="text-[15px]" />
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
            placeholder="Chia sẻ cảm nhận của bạn về địa điểm này..."
            aria-label="Cảm nhận về địa điểm"
            className="mt-1.5 w-full resize-none rounded-[11px] border border-[#E3E9EF] bg-white px-2.5 py-2 text-[12px] text-[#17344A] placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <div className="flex gap-2 overflow-x-auto pt-2">
            {remainingSlots > 0 && (
              <button
                type="button"
                onClick={() => libraryRef.current?.click()}
                className="flex h-[54px] w-[62px] shrink-0 flex-col items-center justify-center rounded-[11px] border-[1.5px] border-dashed border-[#9FD9CF] bg-[#E6F8F4] text-[#006B67]"
              >
                <Icon name="add_photo_alternate" className="text-[20px]" />
                <span className="mt-0.5 text-[9px] font-bold">Thêm ảnh</span>
              </button>
            )}
            {existingImageUrls.map((url) => (
              <span key={url} className="relative shrink-0">
                <img src={url} alt="" className="h-[54px] w-[54px] rounded-[11px] object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(url)}
                  aria-label="Xoá ảnh"
                  className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#17344A]/85 text-white"
                >
                  <Icon name="close" className="text-[12px]" />
                </button>
              </span>
            ))}
            {newPhotoPreviews.map((uri, index) => (
              <span key={uri} className="relative shrink-0">
                <img src={uri} alt="" className="h-[54px] w-[54px] rounded-[11px] object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(index)}
                  aria-label="Xoá ảnh"
                  className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#17344A]/85 text-white"
                >
                  <Icon name="close" className="text-[12px]" />
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
          <p className="mt-1 text-[10px] text-[#75879A]">
            {existingImageUrls.length + newPhotos.length}/{MAX_PHOTOS} ảnh
            {remainingSlots === 0 ? ' · đã đủ' : ''}
          </p>
          {error && <p className="mt-1 text-[11px] text-client-danger">{error}</p>}
          <div className="mt-2.5 flex gap-2">
            {reviewId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={submitting}
                className="flex h-[38px] flex-1 items-center justify-center rounded-[11px] bg-white text-[12px] font-extrabold text-[#006B67] disabled:opacity-50"
              >
                Hủy
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={rating === 0 || submitting}
              className={`flex h-[38px] flex-[2] items-center justify-center gap-1.5 rounded-[11px] bg-[#006B67] text-[12px] font-extrabold text-white ${
                rating === 0 || submitting ? 'opacity-50' : ''
              }`}
            >
              <Icon name="send" className="text-[15px]" />
              {submitting ? 'Đang gửi...' : 'Gửi nhận xét'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
