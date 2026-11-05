import { useState } from 'react';
import type { ListingRevision, RevisionStatus } from '@/client/api/types';
import PlaceDetailsView from '@/client/partner/components/PlaceDetailsView';
import { REJECT_REASONS } from '@/client/partner/placeFormat';
import { formatDate } from '@/client/partner/profileStatus';
import { type BadgeTone, Card, CardTitle, StatusBadge } from '@/client/ui/Blocks';

const REVISION_STATUS: Record<RevisionStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ duyệt', tone: 'pending' },
  APPROVED: { label: 'Đã áp dụng', tone: 'approved' },
  REJECTED: { label: 'Bị từ chối', tone: 'rejected' },
  CANCELLED: { label: 'Đã rút lại', tone: 'draft' },
};

function RevisionItem({
  revision,
  cancelling,
  onCancel,
}: {
  revision: ListingRevision;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const status = REVISION_STATUS[revision.status];

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-client-ink">
            Đề xuất #{revision.id} · {revision.proposed.name}
          </p>
          <p className="text-[11px] text-client-muted">
            Gửi {formatDate(revision.createdAt)}
            {revision.reviewedAt && ` · Xử lý ${formatDate(revision.reviewedAt)}`}
          </p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>
      {revision.status === 'REJECTED' && (
        <div className="mt-2 rounded-xl bg-[#FCE4E3] p-3 text-[12px] text-[#9A2D2D]">
          <strong>
            {revision.rejectReasonCode ? REJECT_REASONS[revision.rejectReasonCode] : 'Bị từ chối'}
          </strong>
          {revision.partnerFeedback && <p className="mt-1">{revision.partnerFeedback}</p>}
        </div>
      )}
      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-[12px] font-bold text-[#007A73] hover:underline"
        >
          {open ? 'Ẩn nội dung' : 'Xem nội dung đề xuất'}
        </button>
        {revision.status === 'PENDING' && (
          <button
            type="button"
            disabled={cancelling}
            onClick={onCancel}
            className="text-[12px] font-bold text-client-danger hover:underline disabled:opacity-50"
          >
            {cancelling ? 'Đang rút lại…' : 'Rút lại đề xuất'}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-3 rounded-2xl bg-client-field p-3">
          <PlaceDetailsView place={revision.proposed} />
        </div>
      )}
    </div>
  );
}

/** Lịch sử đề xuất chỉnh sửa (mới nhất trước) */
export default function RevisionHistory({
  revisions,
  cancellingId,
  onCancel,
}: {
  revisions: ListingRevision[];
  cancellingId: number | null;
  onCancel: (revision: ListingRevision) => void;
}) {
  return (
    <Card className="p-5">
      <CardTitle>Lịch sử đề xuất chỉnh sửa</CardTitle>
      {revisions.length === 0 ? (
        <p className="mt-2 text-[12px] text-client-muted">Bạn chưa gửi đề xuất nào.</p>
      ) : (
        <div className="divide-y divide-client-line">
          {revisions.map((revision) => (
            <RevisionItem
              key={revision.id}
              revision={revision}
              cancelling={cancellingId === revision.id}
              onCancel={() => onCancel(revision)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
