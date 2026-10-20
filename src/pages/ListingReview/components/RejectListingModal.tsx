import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import {
  MAX_FEEDBACK_LENGTH,
  REJECTION_REASONS,
  type RejectionReason,
} from '../../../constants/listing';
import type { Listing } from '../../../types/admin';
import DecisionModalShell from './DecisionModalShell';

interface RejectListingModalProps {
  listing: Listing;
  onClose: () => void;
  onConfirm: (reason: RejectionReason, feedback: string) => void;
}

function buildTemplate(listing: Listing, reason: RejectionReason): string {
  return `Kính gửi đối tác ${listing.partnerName}, hồ sơ "${listing.name}" (${listing.id}) chưa đủ điều kiện phê duyệt do ${reason.templateCause}. Vui lòng ${reason.templateFix} và gửi lại yêu cầu thẩm định.`;
}

/** Modal Từ chối niêm yết: chọn lý do chính + góp ý chi tiết gửi đối tác */
export default function RejectListingModal({
  listing,
  onClose,
  onConfirm,
}: RejectListingModalProps) {
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const selectedReason = REJECTION_REASONS.find((reason) => reason.id === reasonId);
  const trimmedFeedback = feedback.trim();
  const canConfirm = Boolean(selectedReason) && trimmedFeedback.length > 0;

  return (
    <DecisionModalShell
      listing={listing}
      tone="reject"
      title="Từ chối niêm yết địa điểm"
      subtitle="Yêu cầu hoàn thiện hồ sơ và minh chứng trước khi kích hoạt"
      stripLabel="Xét duyệt từ chối"
      confirmLabel="Xác nhận Từ chối"
      confirmIcon="gavel"
      confirmDisabled={!canConfirm}
      onConfirm={() => selectedReason && onConfirm(selectedReason, trimmedFeedback)}
      onClose={onClose}
    >
      {/* 1. Lý do chính */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
            1. Chọn lý do từ chối chính <span className="text-error">*</span>
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Bắt buộc chọn 1 lý do
          </span>
        </div>
        <div className="space-y-2">
          {REJECTION_REASONS.map((reason) => {
            const checked = reason.id === reasonId;
            return (
              <label
                key={reason.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl transition-all ${
                  checked
                    ? 'bg-surface-container-high/40 p-3.5 hover:bg-surface-container-high'
                    : 'bg-surface-container-lowest p-3 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="rejection_reason"
                  checked={checked}
                  onChange={() => setReasonId(reason.id)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                />
                <div className="flex flex-col">
                  <span
                    className={`font-label-md text-label-md text-on-surface ${checked ? 'font-semibold' : ''}`}
                  >
                    {reason.title}
                  </span>
                  {reason.description && (
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {reason.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Góp ý chi tiết */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="feedback-content"
            className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface"
          >
            2. Góp ý chi tiết &amp; Hướng dẫn sửa đổi cho Đối tác{' '}
            <span className="text-error">*</span>
          </label>
          <button
            type="button"
            disabled={!selectedReason}
            onClick={() => selectedReason && setFeedback(buildTemplate(listing, selectedReason))}
            title={selectedReason ? 'Điền văn bản mẫu theo lý do đã chọn' : 'Chọn lý do trước'}
            className="flex items-center gap-1 rounded px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="auto_fix_high" className="text-[14px]" /> Văn bản mẫu
          </button>
        </div>
        <textarea
          id="feedback-content"
          rows={4}
          maxLength={MAX_FEEDBACK_LENGTH}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Nhập chi tiết yêu cầu bổ sung hoặc giải trình..."
          className="w-full rounded-xl bg-surface-container-low p-3.5 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <span className="text-right font-label-sm text-label-sm text-on-surface-variant">
          {feedback.length} / {MAX_FEEDBACK_LENGTH} ký tự
        </span>
      </div>

      {/* 3. Thông báo hệ thống */}
      <div className="flex items-start gap-3 rounded-xl bg-error-container/20 p-3.5">
        <Icon name="info" className="mt-0.5 shrink-0 text-[20px] text-error" />
        <div className="font-body-sm text-body-sm text-on-surface">
          Trạng thái địa điểm sẽ chuyển thành{' '}
          <strong className="font-semibold text-error">BỊ TỪ CHỐI (REJECTED)</strong>. Đối tác sẽ
          nhận thông báo qua Email &amp; App để bổ sung hồ sơ và gửi lại (Resubmit).
        </div>
      </div>
    </DecisionModalShell>
  );
}
