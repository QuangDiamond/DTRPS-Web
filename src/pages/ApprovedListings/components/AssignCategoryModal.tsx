import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import { LISTING_CATEGORY_CONFIG } from '@/constants/listing';
import {
  getSubTypeLabel,
  LISTING_SUBTYPE_CONFIG,
  LISTING_SUBTYPES_BY_CATEGORY,
} from '@/constants/listingMap';
import type { ListingCategory, ListingSubType } from '@/types';

interface AssignCategoryModalProps {
  count: number;
  onConfirm: (subType: ListingSubType) => void;
  onClose: () => void;
}

const CATEGORIES = Object.keys(LISTING_SUBTYPES_BY_CATEGORY) as ListingCategory[];

/** Gán nhóm & loại hình con cho nhiều địa điểm đã chọn */
export default function AssignCategoryModal({
  count,
  onConfirm,
  onClose,
}: AssignCategoryModalProps) {
  const { t } = useTranslation();
  const [subType, setSubType] = useState<ListingSubType | null>(null);

  return (
    <Modal
      title={t('approvedListings.assignCategoryModal.assignCategory')}
      description={t('approvedListings.assignCategoryModal.applyNewCategorySelected', { count })}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="category" disabled={!subType} onClick={() => subType && onConfirm(subType)}>
            {t('approvedListings.assignCategoryModal.assignCategory')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {CATEGORIES.map((category) => {
          const config = LISTING_CATEGORY_CONFIG[category];
          return (
            <div key={category} className="flex flex-col gap-2">
              <span className="flex items-center gap-2 font-label-md text-label-md font-semibold text-on-surface">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.iconBoxClass}`}
                >
                  <Icon name={config.defaultIcon} className="text-[17px]" />
                </span>
                {config.label}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LISTING_SUBTYPES_BY_CATEGORY[category].map((item) => {
                  const active = item === subType;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSubType(item)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left font-label-md text-label-md transition-all ${
                        active
                          ? 'border-primary bg-primary/5 font-semibold text-primary'
                          : 'border-surface-container text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <Icon
                        name={active ? 'check_circle' : LISTING_SUBTYPE_CONFIG[item].icon}
                        filled={active}
                        className="shrink-0 text-[18px]"
                      />
                      <span className="truncate">{getSubTypeLabel(item)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
