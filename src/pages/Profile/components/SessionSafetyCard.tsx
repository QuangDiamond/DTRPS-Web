import Icon from '../../../components/common/Icon';
import type { SecurityCheckItem } from '../../../types/admin';
import { securityScore, securityTier } from '../profileUtils';

interface SessionSafetyCardProps {
  checks: SecurityCheckItem[];
  onReview: () => void;
}

/** Thẻ "Chỉ số an toàn phiên" — điểm tính từ bộ kiểm tra bảo mật */
export default function SessionSafetyCard({ checks, onReview }: SessionSafetyCardProps) {
  const score = securityScore(checks);
  const failed = checks.filter((check) => !check.passed);

  return (
    <div
      className={`relative flex flex-col gap-space-sm overflow-hidden rounded-2xl p-space-lg shadow-sm ${
        failed.length === 0
          ? 'bg-primary-container text-on-primary-container'
          : 'bg-tertiary-container text-on-tertiary-container'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md font-semibold tracking-wide uppercase">
          Chỉ số an toàn phiên
        </span>
        <Icon name={failed.length === 0 ? 'encrypted' : 'gpp_maybe'} className="text-[20px]" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display-sm text-display-sm font-bold">{score}%</span>
        <span className="font-label-sm text-label-sm opacity-90">{securityTier(score)}</span>
      </div>
      {failed.length === 0 ? (
        <p className="font-body-sm text-body-sm leading-relaxed opacity-85">
          Tài khoản được bảo vệ bởi khóa phần cứng FIDO2 cùng cơ chế phân tích địa chỉ IP tĩnh nội
          bộ. Không phát hiện bất kỳ dấu hiệu truy cập bất thường nào trong 90 ngày.
        </p>
      ) : (
        <>
          <p className="font-body-sm text-body-sm leading-relaxed opacity-90">
            Phát hiện {failed.length} mục cần xử lý: {failed.map((check) => check.label).join('; ')}
            .
          </p>
          <button
            type="button"
            onClick={onReview}
            className="self-start rounded-full bg-on-tertiary-container/15 px-space-md py-1.5 font-label-sm text-label-sm font-semibold hover:bg-on-tertiary-container/25"
          >
            Xem chi tiết kiểm tra
          </button>
        </>
      )}
    </div>
  );
}
