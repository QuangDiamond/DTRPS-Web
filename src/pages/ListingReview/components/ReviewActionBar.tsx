import Icon from '../../../components/common/Icon';
import type { Listing } from '../../../types/admin';

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
  const isPending = listing.status === 'pending';
  const docsComplete = verifiedDocs === totalDocs;

  return (
    <div className="fixed right-0 bottom-0 left-72 z-50 border-t border-slate-200 bg-white/95 px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600">
            <Icon name="edit_note" className="text-[20px]" />
          </div>
          <input
            type="text"
            value={isPending ? note : (listing.reviewNote ?? '')}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={!isPending}
            placeholder={
              isPending ? 'Nhập ghi chú kiểm duyệt nội bộ...' : 'Không có ghi chú kiểm duyệt'
            }
            className="h-10 w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-500 hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
          <div
            className={`hidden shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold xl:flex ${
              docsComplete
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <Icon name={docsComplete ? 'verified' : 'pending_actions'} className="text-[17px]" />
            <span>
              Đã đối chiếu {verifiedDocs}/{totalDocs} tài liệu hợp lệ
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-3 md:w-auto">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={onReject}
                className="flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 text-[13px] font-bold text-rose-800 shadow-2xs transition-all hover:bg-rose-100 active:scale-95"
              >
                <Icon name="cancel" className="text-[19px]" />
                <span>TỪ CHỐI ĐỊA ĐIỂM</span>
              </button>
              <button
                type="button"
                onClick={onApprove}
                disabled={!canApprove}
                title={canApprove ? undefined : approveBlockedReason}
                className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[13px] font-extrabold tracking-wide text-white shadow-[0_4px_14px_rgba(0,104,95,0.35)] transition-all hover:bg-[#00574f] hover:shadow-[0_6px_20px_rgba(0,104,95,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <Icon name="verified" filled className="text-[20px]" />
                <span>PHÊ DUYỆT ĐỊA ĐIỂM</span>
              </button>
            </>
          ) : (
            <>
              <span
                className={`flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-extrabold ${
                  listing.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                <Icon
                  name={listing.status === 'approved' ? 'done_all' : 'block'}
                  className="text-[20px]"
                />
                {listing.status === 'approved' ? 'ĐÃ PHÊ DUYỆT THÀNH CÔNG' : 'ĐÃ TỪ CHỐI HỒ SƠ'}
              </span>
              {hasNextPending && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#00574f]"
                >
                  <span>Hồ sơ chờ tiếp theo</span>
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
