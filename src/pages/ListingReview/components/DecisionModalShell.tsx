import { Trans, useTranslation } from 'react-i18next';
import { type ReactNode, useEffect } from 'react';
import { Icon } from '@/components/common';
import type { Listing } from '@/types';

interface DecisionModalShellProps {
  listing: Listing;
  tone: 'approve' | 'reject';
  title: string;
  subtitle: string;
  /** Nhãn bên phải dải thông tin hồ sơ, ví dụ "Xét duyệt từ chối" */
  stripLabel: string;
  children: ReactNode;
  confirmLabel: string;
  confirmIcon: string;
  confirmDisabled: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const TONE_STYLE = {
  approve: {
    headerIcon: 'verified',
    headerIconClass: 'bg-secondary-container text-on-secondary-container',
    stripLabelClass: 'bg-secondary-container/70 text-on-secondary-container',
    confirmClass: 'bg-primary text-on-primary hover:bg-primary-container',
  },
  reject: {
    headerIcon: 'cancel',
    headerIconClass: 'bg-error-container text-on-error-container',
    stripLabelClass: 'bg-error-container/60 text-error',
    confirmClass: 'bg-error text-on-error hover:bg-on-error-container',
  },
};

/** Khung chung cho modal Phê duyệt / Từ chối niêm yết */
export default function DecisionModalShell({
  listing,
  tone,
  title,
  subtitle,
  stripLabel,
  children,
  confirmLabel,
  confirmIcon,
  confirmDisabled,
  onConfirm,
  onClose,
}: DecisionModalShellProps) {
  const { t } = useTranslation();
  const style = TONE_STYLE[tone];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-surface-container-low px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${style.headerIconClass}`}
            >
              <Icon name={style.headerIcon} className="text-[24px]" />
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {title}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={t('listingReview.decisionModalShell.closeWindow')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest/60 text-on-surface-variant transition-all hover:bg-surface-container-highest hover:text-on-surface"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto p-6">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-xs">
                <Icon name={listing.icon} className="text-[22px]" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-title-md text-title-md font-semibold text-on-surface">
                  {listing.name}
                </p>
                <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
                  <Trans
                    i18nKey="listingReview.decisionModalShell.codePartner"
                    values={{ id: listing.id, partnerName: listing.partnerName }}
                    components={{ c0: <span className="font-mono font-semibold text-primary" /> }}
                  />
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 font-label-sm text-label-sm font-bold uppercase ${style.stripLabelClass}`}
            >
              {stripLabel}
            </span>
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 bg-surface-container-low px-6 py-4">
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Icon name="lock" className="text-[16px] text-tertiary" />
            {t('listingReview.decisionModalShell.thisActionRecordedAudit')}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-surface-container-highest px-5 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
            >
              {t('listingReview.decisionModalShell.cancel')}
            </button>
            <button
              type="button"
              disabled={confirmDisabled}
              onClick={onConfirm}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 font-label-md text-label-md font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 ${style.confirmClass}`}
            >
              <Icon name={confirmIcon} className="text-[18px]" />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
