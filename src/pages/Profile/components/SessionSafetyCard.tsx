import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { securityScore, securityTier } from '@/pages/Profile/profileUtils';
import type { SecurityCheckItem } from '@/types';

interface SessionSafetyCardProps {
  checks: SecurityCheckItem[];
  onReview: () => void;
}

/** Thẻ "Chỉ số an toàn phiên" — điểm tính từ bộ kiểm tra bảo mật */
export default function SessionSafetyCard({ checks, onReview }: SessionSafetyCardProps) {
  const { t } = useTranslation();
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
          {t('profile.sessionSafetyCard.sessionSafetyScore')}
        </span>
        <Icon name={failed.length === 0 ? 'encrypted' : 'gpp_maybe'} className="text-[20px]" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display-sm text-display-sm font-bold">{score}%</span>
        <span className="font-label-sm text-label-sm opacity-90">{securityTier(score)}</span>
      </div>
      {failed.length === 0 ? (
        <p className="font-body-sm text-body-sm leading-relaxed opacity-85">
          {t('profile.sessionSafetyCard.theAccountProtectedBy')}
        </p>
      ) : (
        <>
          <p className="font-body-sm text-body-sm leading-relaxed opacity-90">
            {t('profile.sessionSafetyCard.foundItemsThatNeed', {
              count: failed.length,
              join: failed.map((check) => check.label).join('; '),
            })}
          </p>
          <button
            type="button"
            onClick={onReview}
            className="self-start rounded-full bg-on-tertiary-container/15 px-space-md py-1.5 font-label-sm text-label-sm font-semibold hover:bg-on-tertiary-container/25"
          >
            {t('profile.sessionSafetyCard.viewCheckDetails')}
          </button>
        </>
      )}
    </div>
  );
}
