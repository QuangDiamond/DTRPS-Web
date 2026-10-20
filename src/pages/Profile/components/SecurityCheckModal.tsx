import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { ROUTES } from '../../../constants/routes';
import type { SecurityCheckItem } from '../../../types/admin';
import { securityScore, securityTier } from '../profileUtils';

const SCAN_DURATION_MS = 1200;

interface SecurityCheckModalProps {
  checks: SecurityCheckItem[];
  onClose: () => void;
}

/** Mô phỏng quét bảo mật rồi hiển thị kết quả từng hạng mục */
export default function SecurityCheckModal({ checks, onClose }: SecurityCheckModalProps) {
  const [scanning, setScanning] = useState(true);
  const score = securityScore(checks);
  const failed = checks.filter((check) => !check.passed).length;

  useEffect(() => {
    const timer = window.setTimeout(() => setScanning(false), SCAN_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Modal
      title="Kiểm tra bảo mật hệ thống"
      description="Rà soát cấu hình xác thực, phiên đăng nhập và giới hạn truy cập của cổng quản trị"
      onClose={onClose}
      footer={
        !scanning && failed > 0 ? (
          <Link
            to={ROUTES.SETTINGS}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <Icon name="settings" className="text-[18px]" /> Mở Cài đặt bảo mật
          </Link>
        ) : undefined
      }
    >
      {scanning ? (
        <div className="flex flex-col items-center gap-space-sm py-space-xl text-center">
          <Icon name="radar" className="animate-spin text-[44px] text-primary" />
          <span className="font-title-md text-title-md text-on-surface">
            Đang quét cấu hình bảo mật...
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Kiểm tra {checks.length} hạng mục theo chuẩn SOC2 Type II &amp; ISO 27001
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          <div
            className={`flex items-center justify-between rounded-xl p-space-md ${
              failed === 0 ? 'bg-primary-fixed/40' : 'bg-tertiary-fixed/60'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Điểm an toàn
              </span>
              <span className="font-display-sm text-display-sm font-bold text-on-surface">
                {score}%
              </span>
            </div>
            <span className="max-w-[60%] text-right font-label-md text-label-md text-on-surface">
              {failed === 0 ? 'Không phát hiện rủi ro' : `${failed} hạng mục cần xử lý`}
              <span className="block font-body-sm text-body-sm text-on-surface-variant">
                {securityTier(score)}
              </span>
            </span>
          </div>
          <ul className="flex flex-col gap-space-xs">
            {checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-sm"
              >
                <Icon
                  name={check.passed ? 'check_circle' : 'error'}
                  filled
                  className={`mt-0.5 text-[20px] ${check.passed ? 'text-primary' : 'text-error'}`}
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">{check.label}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {check.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
