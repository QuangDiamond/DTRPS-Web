import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  LISTING_AMENITY_CONFIG,
  LISTING_MAP_FIELDS,
  type ListingMapField,
  SHOPPING_SERVICE_CONFIG,
} from '@/constants/listingMap';
import type { ListingCategory, ListingMapInfo } from '@/types';

interface ListingMapInfoViewProps {
  category: ListingCategory;
  info: ListingMapInfo;
}

const CHIP_CLASS =
  'flex items-center gap-1.5 rounded-xl border border-surface-container-high bg-surface-container-low px-3 py-1.5 text-[12.5px] font-semibold text-on-surface';

function FieldValue({ field, info }: { field: ListingMapField; info: ListingMapInfo }) {
  const { t } = useTranslation();
  const empty = (
    <span className="text-[13px] font-medium text-outline">{t('listingMap.notProvided')}</span>
  );

  if (field.kind === 'amenities' || field.kind === 'services') {
    const selected = field.kind === 'amenities' ? (info.amenities ?? []) : (info.services ?? []);
    if (selected.length === 0) return empty;
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((id) => {
          const option =
            field.kind === 'amenities'
              ? LISTING_AMENITY_CONFIG[id as keyof typeof LISTING_AMENITY_CONFIG]
              : SHOPPING_SERVICE_CONFIG[id as keyof typeof SHOPPING_SERVICE_CONFIG];
          return (
            <span key={id} className={CHIP_CLASS}>
              <Icon name={option.icon} className="text-[17px] text-primary" />
              {t(option.labelKey)}
            </span>
          );
        })}
      </div>
    );
  }

  const value = info[field.key]?.trim();
  if (!value) return empty;
  return (
    <p className="text-[13.5px] leading-relaxed font-semibold whitespace-pre-line text-on-surface">
      {value}
    </p>
  );
}

/** Thông tin hiển thị trên bản đồ — chỉ đọc, bộ trường theo nhóm địa điểm */
export default function ListingMapInfoView({ category, info }: ListingMapInfoViewProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {LISTING_MAP_FIELDS[category].map((field) => {
        const wide = field.kind !== 'text';
        return (
          <div
            key={field.key}
            className={`flex gap-3 rounded-xl border border-surface-container-high/80 bg-surface-container-low p-3.5 ${
              wide ? 'md:col-span-2' : ''
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-fixed bg-primary-fixed/40 text-primary">
              <Icon name={field.icon} className="text-[20px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[10.5px] font-bold tracking-wider text-on-surface-variant uppercase">
                {t(field.labelKey)}
              </span>
              <FieldValue field={field} info={info} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
