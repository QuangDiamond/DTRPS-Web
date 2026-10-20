import { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/common/Icon';
import { PARTNER_TIER_CONFIG } from '../../../constants/listing';
import type { Listing, ListingDetail } from '../../../types/admin';

interface ApproveListingModalProps {
  listing: Listing;
  detail: ListingDetail;
  /** Ghi chú đang nhập ở thanh hành động — điền sẵn vào ô ghi chú */
  initialNote: string;
  /** Gọi khi xác nhận xong (sau hiệu ứng "Đang kích hoạt...") */
  onConfirm: (reviewNote: string) => void;
  onClose: () => void;
}

const REVIEW_NOTE_MAX_LENGTH = 300;
const ACTIVATING_DELAY_MS = 800;
const SUCCESS_DELAY_MS = 900;

type Phase = 'idle' | 'activating' | 'done';

/** Modal "Xác nhận Phê duyệt địa điểm này?" */
export default function ApproveListingModal({
  listing,
  detail,
  initialNote,
  onConfirm,
  onClose,
}: ApproveListingModalProps) {
  const [note, setNote] = useState(initialNote.slice(0, REVIEW_NOTE_MAX_LENGTH));
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);
  const isBusy = phase !== 'idle';
  const tier = PARTNER_TIER_CONFIG[listing.partnerTier];

  // Dọn timer nếu modal bị đóng giữa chừng
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, onClose]);

  const handleConfirm = () => {
    setPhase('activating');
    timers.current.push(
      window.setTimeout(() => {
        onConfirm(note.trim());
        setPhase('done');
        timers.current.push(window.setTimeout(onClose, SUCCESS_DELAY_MS));
      }, ACTIVATING_DELAY_MS),
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-md transition-opacity duration-300"
        onClick={isBusy ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Xác nhận phê duyệt địa điểm"
        className="relative z-10 flex w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_24px_64px_-12px_rgba(0,104,95,0.22)]"
      >
        {/* Dải màu trang trí */}
        <div className="h-2 w-full bg-linear-to-r from-primary-fixed-dim via-primary to-secondary" />

        {/* Header */}
        <div className="flex items-start gap-5 p-6 md:p-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm">
            <Icon name="check_circle" filled className="text-[32px] text-primary" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
                Xác nhận Phê duyệt địa điểm này?
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                title="Đóng modal"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <p className="mt-1.5 font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Thao tác này sẽ xác nhận toàn bộ hồ sơ kinh doanh và kích hoạt phân phối thông tin địa
              điểm tới du khách.
            </p>
          </div>
        </div>

        {/* Tóm tắt hồ sơ */}
        <div className="flex flex-col gap-4 px-6 md:px-8">
          <div className="flex flex-col gap-3.5 rounded-2xl bg-surface-container-low p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/60 px-4 py-2.5">
              <span className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
                Tên địa điểm
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-title-md text-title-md font-bold text-on-surface">
                  {listing.name}
                </span>
                <span className="shrink-0 rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">
                  {listing.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 font-body-sm text-body-sm md:grid-cols-2">
              <div className="flex flex-col gap-1 px-2">
                <span className="text-on-surface-variant">Đối tác chủ quản:</span>
                <span className="flex flex-wrap items-center gap-1.5 font-semibold text-on-surface">
                  <Icon name="workspace_premium" className="text-[16px] text-tertiary" />
                  {listing.partnerName}
                  <span className={`text-label-sm font-bold ${tier.className}`}>
                    ({tier.label})
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1 px-2">
                <span className="text-on-surface-variant">Danh mục niêm yết:</span>
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <Icon name={listing.categoryIcon} className="text-[16px]" />
                  {listing.categoryLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 px-2 pt-1">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Địa chỉ cơ sở:
              </span>
              <span className="flex items-start gap-1.5 font-body-md text-body-md font-semibold text-on-surface">
                <Icon name="place" className="mt-0.5 shrink-0 text-[18px] text-primary" />
                {detail.fullAddress}
              </span>
            </div>
          </div>

          {/* Lưu ý tác động */}
          <div className="flex items-start gap-3.5 rounded-2xl bg-secondary-container/40 p-4">
            <Icon name="info" filled className="mt-0.5 shrink-0 text-[22px] text-primary" />
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Lưu ý tác động hệ thống
              </span>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Sau khi phê duyệt, địa điểm này sẽ chính thức được kích hoạt và xuất hiện trên toàn
                bộ ứng dụng du khách Smart Travel Vietnam. Thông báo chúc mừng kèm đường dẫn quản lý
                sẽ tự động gửi đến đối tác.
              </p>
            </div>
          </div>

          {/* Ghi chú nội bộ */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reviewNotes"
              className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface"
            >
              <span>Ghi chú duyệt nội bộ (không bắt buộc)</span>
              <span className="font-label-sm text-label-sm font-normal text-outline">
                {note.length} / {REVIEW_NOTE_MAX_LENGTH} ký tự
              </span>
            </label>
            <textarea
              id="reviewNotes"
              rows={3}
              maxLength={REVIEW_NOTE_MAX_LENGTH}
              value={note}
              disabled={isBusy}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nhập lời nhắn hoặc ghi chú lưu trữ nội bộ... (ví dụ: Hồ sơ đầy đủ, đối chiếu bản gốc hợp lệ qua video call)"
              className="w-full resize-none rounded-xl bg-surface-container-low p-3.5 font-body-md text-body-md text-on-surface shadow-sm transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-70"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-end gap-3.5 bg-surface-container-low/60 p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3 font-label-md text-label-md font-semibold text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isBusy}
            className={`flex items-center gap-2 rounded-full px-7 py-3 font-label-md text-label-md font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(0,104,95,0.4)] transition-all active:scale-[0.98] disabled:cursor-default ${
              phase === 'done' ? 'bg-secondary' : 'bg-primary hover:bg-primary-container'
            }`}
          >
            {phase === 'idle' && (
              <>
                <Icon name="check_circle" filled className="text-[20px]" />
                Xác nhận phê duyệt
              </>
            )}
            {phase === 'activating' && (
              <>
                <Icon name="progress_activity" className="animate-spin text-[20px]" />
                Đang kích hoạt...
              </>
            )}
            {phase === 'done' && (
              <>
                <Icon name="check" className="text-[20px]" />
                Đã phê duyệt thành công!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
