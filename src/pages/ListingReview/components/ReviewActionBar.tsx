import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { Listing } from '@/types';

interface ReviewActionBarProps {
  listing: Listing;
  note: string;
  onNoteChange: (note: string) => void;
  verifiedDocs: number;
  totalDocs: number;
  /** Đủ checklist + tài liệu thì mới được phê duyệt */
  canApprove: boolean;
  approveBlockedReason: string;
  hasNextPending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onNext: () => void;
}

/** Thanh hành động cố định ở đáy màn hình */
export default function ReviewActionBar({
  listing,
  note,
  onNoteChange,
  verifiedDocs,
  totalDocs,
  canApprove,
  approveBlockedReason,
  hasNextPending,
  onApprove,
  onReject,
  onNext,
}: ReviewActionBarProps) {
  const { t } = useTranslation();
  const isPending = listing.status === 'pending';
  const docsComplete = verifiedDocs === totalDocs;

  return (
    <div className="fixed right-0 bottom-0 left-72 z-50 border-t border-surface-container-high bg-surface-container-lowest/95 px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-container-high bg-surface-container text-on-surface-variant">
            <Icon name="edit_note" className="text-[20px]" />
          </div>
          <input
            type="text"
            value={isPending ? note : (listing.reviewNote ?? '')}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={!isPending}
            placeholder={
              isPending
                ? t('listingReview.reviewActionBar.enterInternalModerationNote')
                : t('listingReview.reviewActionBar.noModerationNote')
            }
            className="h-10 w-full flex-1 rounded-xl border border-surface-container-high bg-surface-container-low px-4 text-[13px] font-medium text-on-surface shadow-inner transition-all placeholder:text-outline hover:border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
          <div
            className={`hidden shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold xl:flex ${
              docsComplete
                ? 'border-secondary-fixed-dim/50 bg-secondary-container/30 text-on-secondary-fixed-variant'
                : 'border-tertiary-fixed bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'
            }`}
          >
            <Icon name={docsComplete ? 'verified' : 'pending_actions'} className="text-[17px]" />
            <span>
              {t('listingReview.reviewActionBar.verifiedValidDocuments', {
                verifiedDocs,
                totalDocs,
              })}
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-3 md:w-auto">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={onReject}
                className="flex h-11 items-center gap-2 rounded-xl border border-error-container bg-error-container/40 px-5 text-[13px] font-bold text-on-error-container shadow-2xs transition-all hover:bg-error-container/70 active:scale-95"
              >
                <Icon name="cancel" className="text-[19px]" />
                <span>{t('listingReview.reviewActionBar.rejectPlace')}</span>
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={!canApprove}
                title={canApprove ? undefined : approveBlockedReason}
                className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[13px] font-extrabold tracking-wide text-on-primary shadow-[0_4px_14px_rgba(0,104,95,0.35)] transition-all hover:bg-on-primary-fixed-variant hover:shadow-[0_6px_20px_rgba(0,104,95,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <Icon name="verified" filled className="text-[20px]" />
                <span>{t('listingReview.reviewActionBar.approvePlace')}</span>
              </button>
            </>
          ) : (
            <>
              <span
                className={`flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-extrabold ${
                  listing.status === 'approved'
                    ? 'bg-secondary-container/30 text-on-secondary-fixed-variant'
                    : 'bg-error-container/40 text-on-error-container'
                }`}
              >
                <Icon
                  name={listing.status === 'approved' ? 'done_all' : 'block'}
                  className="text-[20px]"
                />
                {listing.status === 'approved'
                  ? t('listingReview.reviewActionBar.approvedSuccessfully')
                  : t('listingReview.reviewActionBar.submissionRejected')}
              </span>
              {hasNextPending && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-bold text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant"
                >
                  <span>{t('listingReview.reviewActionBar.nextPendingSubmission')}</span>
                  <Icon name="arrow_forward" className="text-[19px]" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
