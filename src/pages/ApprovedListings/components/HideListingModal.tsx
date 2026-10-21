import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import { HIDE_REASONS } from '@/constants/listing';
import type { Listing } from '@/types';

interface HideListingModalProps {
  /** Các địa điểm sẽ bị tạm ẩn (1 hoặc nhiều) */
  targets: Listing[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function HideListingModal({ targets, onConfirm, onClose }: HideListingModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const single = targets.length === 1 ? targets[0] : null;

  return (
    <Modal
      title={
        single
          ? t('approvedListings.hideListingModal.hidePlace')
          : t('approvedListings.hideListingModal.hidePlaces', { count: targets.length })
      }
      description={
        single
          ? t('approvedListings.hideListingModal.willNoLongerAppear', {
              name: single.name,
              id: single.id,
            })
          : t('approvedListings.hideListingModal.theSelectedPlacesWill')
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onConfirm(trimmed)}
            className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-all hover:bg-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="visibility_off" className="text-[18px]" />{' '}
            {t('approvedListings.hideListingModal.confirmHide')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {!single && (
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {targets.map((listing) => (
              <span
                key={listing.id}
                className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface"
              >
                {listing.name}
              </span>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('approvedListings.hideListingModal.reasonHiding')}
          </span>
          <input
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('approvedListings.hideListingModal.eGPremisesRenovation')}
            className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {HIDE_REASONS.map((quickReason) => (
            <button
              key={quickReason}
              type="button"
              onClick={() => setReason(t(quickReason))}
              className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              {t(quickReason)}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
