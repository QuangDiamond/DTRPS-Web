import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { USER_LOCK_REASONS } from '../../../constants/user';
import type { AppUser } from '../../../types/admin';

interface LockUserModalProps {
  /** Các tài khoản sẽ bị khóa (1 hoặc nhiều) */
  targets: AppUser[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function LockUserModal({ targets, onConfirm, onClose }: LockUserModalProps) {
  const [reason, setReason] = useState(USER_LOCK_REASONS[0]);
  const [note, setNote] = useState('');
  const single = targets.length === 1 ? targets[0] : null;

  return (
    <Modal
      title={single ? 'Khóa tài khoản người dùng' : `Khóa đồng loạt ${targets.length} tài khoản`}
      description={
        single
          ? `${single.name} (${single.id}) sẽ không thể đăng nhập và tạo chuyến đi mới`
          : 'Các tài khoản đã chọn sẽ không thể đăng nhập và tạo chuyến đi mới'
      }
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note.trim() ? `${reason} — ${note.trim()}` : reason)}
            className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-all hover:bg-on-error-container"
          >
            <Icon name="lock" className="text-[18px]" /> Xác nhận khóa
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {!single && (
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {targets.map((user) => (
              <span
                key={user.id}
                className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface"
              >
                {user.name}
              </span>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            Lý do khóa tài khoản
          </span>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-10 w-full cursor-pointer rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-error focus:outline-none"
          >
            {USER_LOCK_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ghi chú thêm cho bộ phận CSKH (không bắt buộc)..."
          className="w-full resize-none rounded-xl bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-error focus:outline-none"
        />
      </div>
    </Modal>
  );
}
