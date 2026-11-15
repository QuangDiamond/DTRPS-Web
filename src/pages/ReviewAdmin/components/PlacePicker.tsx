import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { useDismiss } from '@/hooks/useDismiss';
import { placeCatalogService } from '@/services/placeCatalogService';
import type { CatalogPlace } from '@/types';

const SEARCH_DELAY_MS = 300;
const MAX_SUGGESTIONS = 8;

interface PlacePickerProps {
  /** Địa điểm đang lọc (null = mọi địa điểm) */
  value: { id: string; name: string } | null;
  onChange: (place: { id: string; name: string } | null) => void;
}

/** Ô chọn một địa điểm cụ thể: gõ tên → chọn trong gợi ý (tìm trong Kho địa điểm) */
export default function PlacePicker({ value, onChange }: PlacePickerProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CatalogPlace[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  useDismiss(boxRef, open, () => setOpen(false));

  useEffect(() => {
    const keyword = text.trim();
    if (!keyword) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      placeCatalogService
        .list({ keyword, page: 0, size: MAX_SUGGESTIONS, sort: 'name' })
        .then((result) => active && setSuggestions(result.items))
        .catch(() => active && setSuggestions([]))
        .finally(() => active && setLoading(false));
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [text]);

  const choose = (place: CatalogPlace) => {
    onChange({ id: place.id, name: place.name });
    setText('');
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5" ref={boxRef}>
      <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
        <Icon name="location_on" className="text-[16px] text-primary" />
        {t('reviewAdmin.filters.place')}
      </span>
      {value ? (
        <span className="flex h-10 items-center gap-2 rounded-xl bg-primary-fixed px-3 text-on-primary-fixed">
          <span className="min-w-0 flex-1 truncate font-body-sm text-body-sm font-semibold">
            {value.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-on-primary-fixed/10"
            title={t('reviewAdmin.filters.clearPlace')}
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </span>
      ) : (
        <div className="relative">
          <span className="flex h-10 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
            <Icon name="search" className="text-[18px] text-outline" />
            <input
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={t('reviewAdmin.filters.placePlaceholder')}
              className="h-full min-w-0 flex-1 bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </span>
          {open && text.trim() && (
            <ul className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-xl bg-surface-container-lowest py-1 shadow-lg ring-1 ring-surface-container-high">
              {loading && suggestions.length === 0 ? (
                <li className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                  {t('reviewAdmin.filters.placeSearching')}
                </li>
              ) : suggestions.length === 0 ? (
                <li className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                  {t('reviewAdmin.filters.placeNoMatch')}
                </li>
              ) : (
                suggestions.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => choose(place)}
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-surface-container-low"
                    >
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                        {place.name}
                      </span>
                      <span className="font-body-sm text-[12px] text-on-surface-variant">
                        {[place.category?.name, place.province?.name].filter(Boolean).join(' · ')}
                        {place.reviewCount > 0 &&
                          ` · ${t('reviewAdmin.filters.placeReviews', { count: place.reviewCount })}`}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
