import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { HIDE_REASONS } from '../../../constants/listing';
import type { Listing } from '../../../types/admin';

interface HideListingModalProps {
  /** Các địa điểm sẽ bị tạm ẩn (1 hoặc nhiều) */
  targets: Listing[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function HideListingModal({ targets, onConfirm, onClose }: HideListingModalProps) {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const single = targets.length === 1 ? targets[0] : null;

  return (
    <Modal
      title={single ? 'Tạm ẩn địa điểm' : `Tạm ẩn đồng loạt ${targets.length} địa điểm`}
      description={
        single
          ? `${single.name} (${single.id}) sẽ ngừng hiển thị trên ứng dụng du khách`
          : 'Các địa điểm đã chọn sẽ ngừng hiển thị trên ứng dụng du khách'
      }
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onConfirm(trimmed)}
            className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-all hover:bg-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="visibility_off" className="text-[18px]" /> Xác nhận tạm ẩn
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {!single && (
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {targets.map((listing) => (
              <span
                key={listing.id}
                className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface"
              >
                {listing.name}
              </span>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            Lý do tạm ẩn *
          </span>
          <input
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="VD: Sửa chữa mặt bằng"
            className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {HIDE_REASONS.map((quickReason) => (
            <button
              key={quickReason}
              type="button"
              onClick={() => setReason(quickReason)}
              className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              {quickReason}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
