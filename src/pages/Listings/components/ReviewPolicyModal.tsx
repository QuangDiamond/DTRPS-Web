import { useTranslation } from 'react-i18next';
import { Icon, Modal } from '@/components/common';
import { REVIEW_POLICIES } from '@/constants/listing';

export default function ReviewPolicyModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('listings.reviewPolicyModal.listingModerationPolicy')}
      description={t('listings.reviewPolicyModal.standardsAppliedWhenReviewing')}
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
