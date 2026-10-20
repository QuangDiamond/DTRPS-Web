import { useMemo, useState } from 'react';
import OtpInput from '../../../components/auth/OtpInput';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { MOCK_TOTP_CODE, MOCK_TOTP_SECRET } from '../../../constants/adminProfile';
import { OTP_LENGTH } from '../../../constants/auth';
import { useToast } from '../../../hooks/useToast';

const QR_SIZE = 21;

/** Ô QR minh họa (sinh giả từ secret) — khi có backend thay bằng ảnh QR otpauth:// thật */
function buildQrCells(seed: string): boolean[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const isFinder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    const ring = (ox: number, oy: number) => {
      const dx = x - ox;
      const dy = y - oy;
      return (
        dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
      );
    };
    if (inBox(0, 0)) return { inside: true, on: ring(0, 0) };
    if (inBox(QR_SIZE - 7, 0)) return { inside: true, on: ring(QR_SIZE - 7, 0) };
    if (inBox(0, QR_SIZE - 7)) return { inside: true, on: ring(0, QR_SIZE - 7) };
    return { inside: false, on: false };
  };
  return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const x = index % QR_SIZE;
    const y = Math.floor(index / QR_SIZE);
    const finder = isFinder(x, y);
    if (finder.inside) return finder.on;
    state = (state * 1103515245 + 12345) >>> 0;
    return (state >>> 16) % 2 === 0;
  });
}

interface TotpSetupModalProps {
  accountEmail: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function TotpSetupModal({ accountEmail, onConfirm, onClose }: TotpSetupModalProps) {
  const { showToast } = useToast();
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  );
  const [error, setError] = useState('');
  const cells = useMemo(() => buildQrCells(MOCK_TOTP_SECRET + accountEmail), [accountEmail]);
  const code = digits.join('');

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TOTP_SECRET.replace(/\s/g, ''));
      showToast('Đã sao chép khóa bí mật', 'info');
    } catch {
      showToast('Không sao chép được, hãy chọn và sao chép thủ công', 'error');
    }
  };

  const verify = () => {
    if (code.length < OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số`);
      return;
    }
    if (code !== MOCK_TOTP_CODE) {
      setError('Mã xác thực không đúng hoặc đã hết hạn, vui lòng thử mã mới');
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      title="Cấu hình lại Google Authenticator"
      description="Quét mã QR bằng ứng dụng xác thực, sau đó nhập mã 6 số để xác nhận"
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
            onClick={verify}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <Icon name="verified" className="text-[18px]" /> Xác nhận liên kết
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-space-md">
        <svg
          viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
          className="h-40 w-40 rounded-xl bg-surface-container-lowest p-2 shadow-sm ring-1 ring-surface-container-high"
          role="img"
          aria-label="Mã QR liên kết ứng dụng xác thực"
          shapeRendering="crispEdges"
        >
          {cells.map((on, index) =>
            on ? (
              <rect
                key={index}
                x={index % QR_SIZE}
                y={Math.floor(index / QR_SIZE)}
                width="1"
                height="1"
                className="fill-on-surface"
              />
            ) : null,
          )}
        </svg>
        <div className="flex w-full items-center justify-between gap-space-sm rounded-xl bg-surface-container-low px-space-md py-2">
          <div className="flex min-w-0 flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Hoặc nhập khóa bí mật thủ công
            </span>
            <span className="truncate font-mono text-body-sm font-semibold text-on-surface">
              {MOCK_TOTP_SECRET}
            </span>
          </div>
          <button
            type="button"
            title="Sao chép khóa"
            onClick={copySecret}
            className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-surface-container-high"
          >
            <Icon name="content_copy" className="text-[18px]" />
          </button>
        </div>
        <div className="flex w-full flex-col items-center gap-space-xs">
          <OtpInput
            digits={digits}
            onChange={(next) => {
              setDigits(next);
              setError('');
            }}
          />
          {error ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
              <Icon name="error" className="text-[14px]" /> {error}
            </span>
          ) : (
            <span className="font-body-sm text-body-sm text-outline">
              Mã demo: <strong>{MOCK_TOTP_CODE}</strong>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
