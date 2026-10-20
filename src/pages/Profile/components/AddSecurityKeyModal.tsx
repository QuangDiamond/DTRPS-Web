import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { MAX_SECURITY_KEYS } from '../../../constants/adminProfile';

const TOUCH_WAIT_MS = 1800;

interface AddSecurityKeyModalProps {
  keyCount: number;
  onAdd: (name: string) => void;
  onClose: () => void;
}

/** Mô phỏng quy trình liên kết khóa FIDO2 (WebAuthn) — khi có backend dùng navigator.credentials.create */
export default function AddSecurityKeyModal({
  keyCount,
  onAdd,
  onClose,
}: AddSecurityKeyModalProps) {
  const [name, setName] = useState(`YubiKey dự phòng #${keyCount}`);
  const [waiting, setWaiting] = useState(false);
  const isFull = keyCount >= MAX_SECURITY_KEYS;

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(
      () => onAdd(name.trim() || 'Khóa FIDO2 dự phòng'),
      TOUCH_WAIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [waiting, name, onAdd]);

  return (
    <Modal
      title="Thêm khóa bảo mật dự phòng"
      description="Cắm khóa FIDO2 qua USB-C hoặc chạm NFC, sau đó chạm vào khóa khi được yêu cầu"
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            Hủy
          </Button>
          <Button icon="usb" disabled={waiting || isFull} onClick={() => setWaiting(true)}>
            Bắt đầu liên kết
          </Button>
        </>
      }
    >
      {waiting ? (
        <div className="flex flex-col items-center gap-space-sm py-space-lg text-center">
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Icon name="fingerprint" className="text-[44px] text-primary" />
          </span>
          <span className="font-title-md text-title-md text-on-surface">
            Chạm vào khóa bảo mật...
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Đang chờ xác nhận từ thiết bị "{name.trim() || 'Khóa FIDO2 dự phòng'}"
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            Tên gợi nhớ của khóa
          </label>
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          {isFull ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
              <Icon name="error" className="text-[14px]" /> Đã đạt tối đa {MAX_SECURITY_KEYS} khóa
              cho một tài khoản
            </span>
          ) : (
            <span className="font-body-sm text-body-sm text-outline">
              Đang có {keyCount}/{MAX_SECURITY_KEYS} khóa liên kết. Nên có ít nhất 1 khóa dự phòng
              cất ở nơi an toàn.
            </span>
          )}
        </div>
      )}
    </Modal>
  );
}
