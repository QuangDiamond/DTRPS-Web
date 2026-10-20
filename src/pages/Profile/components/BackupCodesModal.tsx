import { useState } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../hooks/useToast';
import { copyText } from '../../../utils/clipboard';
import { downloadTextFile } from '../../../utils/download';
import { todayIsoDate } from '../../../utils/format';

interface BackupCodesModalProps {
  codes: string[];
  accountEmail: string;
  onRegenerate: () => void;
  onClose: () => void;
}

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
    const copied = await copyText(codes.join('\n'));
    showToast(
      copied ? 'Đã sao chép mã dự phòng' : 'Không sao chép được, hãy tải file .txt',
      copied ? 'info' : 'error',
    );
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
            <Button variant="neutral" onClick={() => setConfirmRegenerate(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              icon="autorenew"
              onClick={() => {
                onRegenerate();
                setConfirmRegenerate(false);
              }}
            >
              Xác nhận tạo mới
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              icon="autorenew"
              className="mr-auto text-error hover:bg-error-container/40 hover:text-error"
              onClick={() => setConfirmRegenerate(true)}
            >
              Tạo mã mới
            </Button>
            <Button variant="neutral" icon="content_copy" onClick={copyCodes}>
              Sao chép
            </Button>
            <Button
              icon="download"
              onClick={() => {
                downloadTextFile(`smarttravel-backup-codes-${todayIsoDate()}.txt`, content);
                showToast('Đã tải xuống file mã dự phòng', 'info');
              }}
            >
              Tải .txt
            </Button>
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
