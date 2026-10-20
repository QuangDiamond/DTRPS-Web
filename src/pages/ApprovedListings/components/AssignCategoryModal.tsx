import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { LISTING_CATEGORY_CONFIG } from '../../../constants/listing';
import type { ListingCategory } from '../../../types/admin';

interface AssignCategoryModalProps {
  count: number;
  onConfirm: (category: ListingCategory) => void;
  onClose: () => void;
}

const CATEGORIES = Object.keys(LISTING_CATEGORY_CONFIG) as ListingCategory[];

export default function AssignCategoryModal({
  count,
  onConfirm,
  onClose,
}: AssignCategoryModalProps) {
  const [category, setCategory] = useState<ListingCategory | null>(null);

  return (
    <Modal
      title="Gán danh mục"
      description={`Áp dụng danh mục mới cho ${count} địa điểm đã chọn`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!category}
            onClick={() => category && onConfirm(category)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="category" className="text-[18px]" /> Gán danh mục
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CATEGORIES.map((item) => {
          const config = LISTING_CATEGORY_CONFIG[item];
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBoxClass}`}
              >
                <Icon name={config.defaultIcon} className="text-[20px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">
                {config.filterLabel}
              </span>
              {active && (
                <Icon name="check_circle" filled className="ml-auto text-[20px] text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
