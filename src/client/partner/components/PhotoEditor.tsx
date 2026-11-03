import { type DragEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import type { PlaceImage } from '@/client/api/types';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, uploadApi } from '@/client/api/uploadApi';
import { MAX_IMAGES } from '@/client/partner/placeFormat';

/** Ảnh đang tải lên (xem trước bằng file trong máy) */
interface Pending {
  id: number;
  preview: string;
  error: string | null;
}

/** Kiểm tra trước khi gửi — BE vẫn kiểm tra lại theo nội dung file */
function checkFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Chỉ nhận ảnh jpg, png hoặc webp';
  if (file.size > MAX_IMAGE_BYTES) return 'Ảnh tối đa 5MB';
  return null;
}

/**
 * Ảnh địa điểm: bấm ô "+" (hoặc kéo thả) để chọn ảnh trong máy, ảnh được tải lên Cloudinary qua BE.
 * Ảnh bìa đứng đầu; nếu không chọn, ảnh đầu tiên là ảnh bìa.
 */
export default function PhotoEditor({
  images,
  onChange,
  onUploadingChange,
  error,
}: {
  images: PlaceImage[];
  onChange: (images: PlaceImage[]) => void;
  /** Báo cho form biết đang tải để chặn nút gửi */
  onUploadingChange?: (uploading: boolean) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  // Nhiều ảnh tải xong gần như cùng lúc → luôn cộng vào danh sách mới nhất
  const latest = useRef(images);
  latest.current = images;

  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');

  const uploading = pending.some((item) => item.error === null);
  useEffect(() => onUploadingChange?.(uploading), [uploading, onUploadingChange]);

  const commit = (next: PlaceImage[]) => {
    latest.current = next;
    onChange(next);
  };

  const uploadOne = async (file: File, item: Pending) => {
    try {
      const url = await uploadApi.image(file);
      const current = latest.current;
      commit([...current, { url, primary: !current.some((image) => image.primary) }]);
      URL.revokeObjectURL(item.preview);
      setPending((list) => list.filter((entry) => entry.id !== item.id));
    } catch (uploadError) {
      setPending((list) =>
        list.map((entry) =>
          entry.id === item.id ? { ...entry, error: errorMessage(uploadError) } : entry,
        ),
      );
    }
  };

  const addFiles = (files: FileList | File[]) => {
    setNotice('');
    const slots = MAX_IMAGES - images.length - pending.filter((p) => p.error === null).length;
    const list = Array.from(files);
    if (list.length > slots)
      setNotice(`Chỉ thêm được ${Math.max(slots, 0)} ảnh nữa (tối đa ${MAX_IMAGES}).`);
    list.slice(0, Math.max(slots, 0)).forEach((file) => {
      const item: Pending = {
        id: nextId.current++,
        preview: URL.createObjectURL(file),
        error: checkFile(file),
      };
      setPending((current) => [...current, item]);
      if (item.error === null) void uploadOne(file, item);
    });
  };

  const dismiss = (item: Pending) => {
    URL.revokeObjectURL(item.preview);
    setPending((list) => list.filter((entry) => entry.id !== item.id));
  };

  const setCover = (target: string) =>
    commit(images.map((image) => ({ ...image, primary: image.url === target })));

  const remove = (target: string) => {
    const next = images.filter((image) => image.url !== target);
    if (next.length > 0 && !next.some((image) => image.primary))
      next[0] = { ...next[0], primary: true };
    commit(next);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  };

  const full = images.length + pending.filter((p) => p.error === null).length >= MAX_IMAGES;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-xl transition-colors ${dragging ? 'bg-client-pale ring-2 ring-primary/50' : ''}`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.url}
            className="overflow-hidden rounded-xl border border-client-line bg-white"
          >
            <div className="relative">
              <img src={image.url} alt="" className="h-28 w-full object-cover" />
              {image.primary && (
                <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  Ảnh bìa
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <button
                type="button"
                disabled={image.primary}
                onClick={() => setCover(image.url)}
                className="text-[11px] font-bold text-[#007A73] hover:underline disabled:text-client-muted disabled:no-underline"
              >
                {image.primary ? 'Đang là ảnh bìa' : 'Đặt ảnh bìa'}
              </button>
              <button
                type="button"
                aria-label="Xóa ảnh"
                onClick={() => remove(image.url)}
                className="text-client-muted hover:text-client-danger"
              >
                <Icon name="delete" className="text-[18px]" />
              </button>
            </div>
          </div>
        ))}

        {pending.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-client-line bg-white"
          >
            <div className="relative">
              <img
                src={item.preview}
                alt=""
                className={`h-28 w-full object-cover ${item.error ? 'opacity-40' : 'opacity-60'}`}
              />
              {item.error === null && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/60 border-t-primary" />
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span
                className={`truncate text-[11px] ${item.error ? 'text-client-danger' : 'text-client-muted'}`}
                title={item.error ?? undefined}
              >
                {item.error ?? 'Đang tải lên…'}
              </span>
              {item.error && (
                <button
                  type="button"
                  aria-label="Bỏ ảnh lỗi"
                  onClick={() => dismiss(item)}
                  className="text-client-muted hover:text-client-danger"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[9.5rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-client-line bg-client-field text-client-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="add" className="text-[36px]" />
            <span className="text-[12px] font-bold">Thêm ảnh</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <p className="mt-2 text-[11px] text-[#71838D]">
        {images.length}/{MAX_IMAGES} ảnh · jpg, png, webp · tối đa 5MB/ảnh · có thể kéo thả ảnh vào
        đây
      </p>
      {(notice || error) && <p className="mt-1 text-xs text-client-danger">{notice || error}</p>}
    </div>
  );
}
