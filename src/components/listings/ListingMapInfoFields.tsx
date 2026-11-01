import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  LISTING_AMENITY_CONFIG,
  LISTING_MAP_FIELDS,
  SHOPPING_SERVICE_CONFIG,
} from '@/constants/listingMap';
import type { ListingCategory, ListingMapInfo } from '@/types';

interface ListingMapInfoFieldsProps {
  category: ListingCategory;
  value: ListingMapInfo;
  onChange: (value: ListingMapInfo) => void;
  inputClassName: string;
}

const toggle = <T extends string>(list: T[] | undefined, item: T): T[] =>
  list?.includes(item) ? list.filter((value) => value !== item) : [...(list ?? []), item];

/** Ô nhập thông tin hiển thị trên bản đồ — cùng bộ trường với màn Xem xét & Duyệt */
export default function ListingMapInfoFields({
  category,
  value,
  onChange,
  inputClassName,
}: ListingMapInfoFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {LISTING_MAP_FIELDS[category].map((field) => {
        const label = (
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
            <Icon name={field.icon} className="text-[16px] text-primary" />
            {t(field.labelKey)}
          </span>
        );

        if (field.kind === 'amenities' || field.kind === 'services') {
          return (
            <div key={field.key} className="flex flex-col gap-1.5 sm:col-span-2">
              {label}
              <div className="flex flex-wrap gap-2">
                {field.kind === 'amenities'
                  ? field.options.map((id) => {
                      const active = value.amenities?.includes(id) ?? false;
                      const option = LISTING_AMENITY_CONFIG[id];
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            onChange({ ...value, amenities: toggle(value.amenities, id) })
                          }
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-label-md text-label-md transition-all ${
                            active
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          <Icon name={active ? 'check_box' : option.icon} className="text-[17px]" />
                          {t(option.labelKey)}
                        </button>
                      );
                    })
                  : field.options.map((id) => {
                      const active = value.services?.includes(id) ?? false;
                      const option = SHOPPING_SERVICE_CONFIG[id];
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            onChange({ ...value, services: toggle(value.services, id) })
                          }
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-label-md text-label-md transition-all ${
                            active
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                          }`}
                        >
                          <Icon name={active ? 'check_box' : option.icon} className="text-[17px]" />
                          {t(option.labelKey)}
                        </button>
                      );
                    })}
              </div>
            </div>
          );
        }

        const text = value[field.key] ?? '';
        const update = (next: string) => onChange({ ...value, [field.key]: next });
        return (
          <label
            key={field.key}
            className={`flex flex-col gap-1.5 ${field.kind === 'textarea' ? 'sm:col-span-2' : ''}`}
          >
            {label}
            {field.kind === 'textarea' ? (
              <textarea
                rows={2}
                className={`${inputClassName} h-auto resize-none py-2`}
                value={text}
                onChange={(event) => update(event.target.value)}
                placeholder={t(field.placeholderKey)}
              />
            ) : (
              <input
                className={inputClassName}
                value={text}
                onChange={(event) => update(event.target.value)}
                placeholder={t(field.placeholderKey)}
              />
            )}
          </label>
        );
      })}
    </>
  );
}
