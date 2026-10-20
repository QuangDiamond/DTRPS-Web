import { useEffect, useState } from 'react';
import { PARTNER_LOCK_REASONS } from '../../constants/partner';
import type { Partner } from '../../types/admin';
import Icon from '../common/Icon';

interface LockPartnerModalProps {
  partner: Partner;
  /** Số địa điểm đang hiển thị sẽ bị tạm ẩn theo */
  affectedListings: number;
  onConfirm: (reason: string, note: string) => void;
  onClose: () => void;
}

/** Modal "Xác nhận tạm khóa tài khoản đối tác?" */
export default function LockPartnerModal({
  partner,
  affectedListings,
  onConfirm,
  onClose,
}: LockPartnerModalProps) {
  const [reason, setReason] = useState(PARTNER_LOCK_REASONS[0]);
  const [note, setNote] = useState('');
  const needsNote = reason === PARTNER_LOCK_REASONS[PARTNER_LOCK_REASONS.length - 1];
  const canConfirm = !needsNote || note.trim().length > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_0.2s_ease-out] items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Xác nhận tạm khóa tài khoản đối tác"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <Icon name="warning" className="text-[26px]" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Xác nhận tạm khóa tài khoản đối tác?
            </h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Hành động này sẽ tạm dừng hoạt động hiển thị của{' '}
              <strong>
                {partner.name} ({partner.id})
              </strong>
              {affectedListings > 0 ? (
                <>
                  {' '}
                  và cả <strong>{affectedListings} địa điểm niêm yết liên quan</strong>
                </>
              ) : null}{' '}
              trên ứng dụng Smart Travel Vietnam.
            </p>
          </div>
        </div>

        <div className="mb-5 space-y-2 rounded-xl bg-surface-container-low p-4">
          <label
            htmlFor="lock-reason"
            className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase"
          >
            Lý do khóa tài khoản
          </label>
          <select
            id="lock-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface shadow-sm focus:ring-2 focus:ring-error focus:outline-none"
          >
            {PARTNER_LOCK_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              needsNote
                ? 'Bắt buộc ghi chú chi tiết khi chọn "Khác"...'
                : 'Ghi chú thêm cho bộ phận CSKH và đối tác...'
            }
            className="w-full rounded-lg bg-surface-container-lowest p-2.5 font-body-sm text-body-sm text-on-surface shadow-sm placeholder:text-outline focus:ring-2 focus:ring-error focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container px-5 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm(needsNote ? note.trim() : reason, needsNote ? '' : note.trim())
            }
            className="flex items-center gap-2 rounded-full bg-error px-6 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-md transition-all hover:bg-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="lock" className="text-[18px]" />
            <span>Xác nhận khóa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
