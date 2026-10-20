import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../hooks/useToast';
import { todayIsoDate } from '../../../utils/format';
import { downloadTextFile } from '../profileUtils';

interface BackupCodesModalProps {
  codes: string[];
  accountEmail: string;
  onRegenerate: () => void;
  onClose: () => void;
}

const BUTTON_CLASS =
  'flex items-center gap-2 rounded-full px-4 py-2.5 font-label-md text-label-md font-semibold transition-all';

export default function BackupCodesModal({
  codes,
  accountEmail,
  onRegenerate,
  onClose,
}: BackupCodesModalProps) {
  const { showToast } = useToast();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const content = [
    'Smart Travel Admin — Mã khôi phục 2FA',
    `Tài khoản: ${accountEmail}`,
    `Ngày tạo: ${todayIsoDate()}`,
    'Mỗi mã chỉ dùng được một lần. Cất giữ ở nơi an toàn.',
    '',
    ...codes,
  ].join('\n');

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      showToast('Đã sao chép mã dự phòng', 'info');
    } catch {
      showToast('Không sao chép được, hãy tải file .txt', 'error');
    }
  };

  return (
    <Modal
      title={`Mã khôi phục dự phòng (${codes.length})`}
      description="Dùng khi mất thiết bị xác thực. Mỗi mã chỉ dùng được một lần."
      onClose={onClose}
      footer={
        confirmRegenerate ? (
          <>
            <span className="mr-auto font-body-sm text-body-sm text-error">
              Toàn bộ mã cũ sẽ bị vô hiệu hóa.
            </span>
            <button
              type="button"
              onClick={() => setConfirmRegenerate(false)}
              className={`${BUTTON_CLASS} bg-surface-container-low text-on-surface hover:bg-surface-container-high`}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                onRegenerate();
                setConfirmRegenerate(false);
              }}
              className={`${BUTTON_CLASS} bg-error text-on-error hover:opacity-90`}
            >
              <Icon name="autorenew" className="text-[18px]" /> Xác nhận tạo mới
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirmRegenerate(true)}
              className={`${BUTTON_CLASS} mr-auto text-error hover:bg-error-container/40`}
            >
              <Icon name="autorenew" className="text-[18px]" /> Tạo mã mới
            </button>
            <button
              type="button"
              onClick={copyCodes}
              className={`${BUTTON_CLASS} bg-surface-container-low text-on-surface hover:bg-surface-container-high`}
            >
              <Icon name="content_copy" className="text-[18px]" /> Sao chép
            </button>
            <button
              type="button"
              onClick={() => {
                downloadTextFile(`smarttravel-backup-codes-${todayIsoDate()}.txt`, content);
                showToast('Đã tải xuống file mã dự phòng', 'info');
              }}
              className={`${BUTTON_CLASS} bg-primary text-on-primary shadow-sm hover:bg-primary-container`}
            >
              <Icon name="download" className="text-[18px]" /> Tải .txt
            </button>
          </>
        )
      }
    >
      <div className="grid grid-cols-2 gap-space-sm">
        {codes.map((code, index) => (
          <div
            key={code}
            className="flex items-center gap-2 rounded-xl bg-surface-container-low px-space-md py-2.5"
          >
            <span className="font-label-sm text-label-sm text-outline">{index + 1}.</span>
            <span className="font-mono text-body-md font-semibold tracking-wider text-on-surface">
              {code}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
