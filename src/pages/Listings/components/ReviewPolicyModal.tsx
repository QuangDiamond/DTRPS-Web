import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { REVIEW_POLICIES } from '../../../constants/listing';

export default function ReviewPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Quy chế kiểm duyệt niêm yết"
      description="Tiêu chuẩn áp dụng khi thẩm định hồ sơ trước khi công bố lên ứng dụng"
      onClose={onClose}
      size="lg"
    >
      <div className="flex flex-col gap-3">
        {REVIEW_POLICIES.map((policy) => (
          <div
            key={policy.title}
            className="flex items-start gap-3 rounded-xl bg-surface-container-low/60 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
              <Icon name={policy.icon} className="text-[20px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-title-md text-title-md text-on-surface">{policy.title}</span>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
