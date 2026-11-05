import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import TypeChips from '@/components/common/TypeChips';
import { placeTypesOf } from '@/components/common/typePickerUtils';
import {
  DAY_KEYS,
  formatAmount,
  hourText,
  priceTypeLabel,
} from '@/pages/PlaceReview/placeReviewUtils';
import type { PlaceContent, PlaceImage, TranslationKey } from '@/types';

interface CompareRow {
  labelKey: TranslationKey;
  current: string;
  proposed: string;
}

function Images({ images }: { images: PlaceImage[] }) {
  const { t } = useTranslation();
  if (images.length === 0)
    return <span className="text-outline">{t('placeReview.compare.empty')}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {images.map((image) => (
        <a key={image.url} href={image.url} target="_blank" rel="noreferrer" className="relative">
          <img src={image.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
          {image.primary && (
            <span className="absolute bottom-0.5 left-0.5 rounded bg-primary px-1 text-[9px] text-on-primary">
              {t('placeReview.detail.cover')}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function Cell({ text, changed, tone }: { text: ReactNode; changed: boolean; tone: 'old' | 'new' }) {
  const highlight = changed
    ? tone === 'old'
      ? 'bg-error-container/40 text-on-surface'
      : 'bg-secondary-container/60 text-on-surface'
    : 'text-on-surface';
  return (
    <td
      className={`px-4 py-3 align-top font-body-md text-body-md whitespace-pre-line ${highlight}`}
    >
      {text}
    </td>
  );
}

/** Đánh dấu chỗ chèn dòng Dịch vụ & loại hình trong bảng */
const TYPES_ROW = { labelKey: 'placeReview.detail.types', current: '', proposed: '' } as const;

/** Bảng so sánh từng trường: đang công khai ↔ đề xuất (tô màu ô thay đổi) */
export default function RevisionCompare({
  current,
  proposed,
  applied = false,
}: {
  current: PlaceContent;
  proposed: PlaceContent;
  /** Bản sửa đã được áp dụng: thông tin công khai lúc này chính là bản đề xuất */
  applied?: boolean;
}) {
  const { t } = useTranslation();
  const empty = t('placeReview.compare.empty');
  const closed = t('placeReview.detail.closed');
  const typeLabels = {
    main: t('placeReview.detail.typeMain'),
    added: t('placeReview.detail.typeAdded'),
    removed: t('placeReview.detail.typeRemoved'),
    empty: t('placeReview.compare.empty'),
  };
  const value = (text: string | null | undefined) => (text && text.trim() ? text : empty);
  const hours = (place: PlaceContent) =>
    place.openingHours.length === 0
      ? empty
      : place.openingHours
          .map((hour) => `${t(DAY_KEYS[hour.dayOfWeek])}: ${hourText(hour, closed)}`)
          .join('\n');
  const prices = (place: PlaceContent) =>
    place.prices.length === 0
      ? empty
      : place.prices
          .map(
            (price) =>
              `${price.description ?? priceTypeLabel(price.priceType)}: ${formatAmount(price, t('placeReview.detail.free'))}`,
          )
          .join('\n');

  const rows: CompareRow[] = [
    { labelKey: 'placeReview.detail.name', current: current.name, proposed: proposed.name },
    {
      labelKey: 'placeReview.detail.province',
      current: value(current.province?.name),
      proposed: value(proposed.province?.name),
    },
    {
      labelKey: 'placeReview.detail.address',
      current: current.address,
      proposed: proposed.address,
    },
    {
      labelKey: 'placeReview.detail.coordinates',
      current: `${current.latitude}, ${current.longitude}`,
      proposed: `${proposed.latitude}, ${proposed.longitude}`,
    },
    {
      labelKey: 'placeReview.detail.description',
      current: value(current.description),
      proposed: value(proposed.description),
    },
    {
      labelKey: 'placeReview.detail.phone',
      current: value(current.phone),
      proposed: value(proposed.phone),
    },
    {
      labelKey: 'placeReview.detail.website',
      current: value(current.website),
      proposed: value(proposed.website),
    },
    { labelKey: 'placeReview.detail.hours', current: hours(current), proposed: hours(proposed) },
    { labelKey: 'placeReview.detail.prices', current: prices(current), proposed: prices(proposed) },
  ];
  const imagesKey = (place: PlaceContent) =>
    place.images.map((image) => `${image.url}|${image.primary}`).join(',');
  const imagesChanged = imagesKey(current) !== imagesKey(proposed);
  const currentTypes = placeTypesOf(current);
  const proposedTypes = placeTypesOf(proposed);
  const typesKey = (types: { categories: { code: string }[] }) =>
    types.categories.map((type) => type.code).join(',');
  const typesChanged = typesKey(currentTypes) !== typesKey(proposedTypes);
  const changedCount =
    rows.filter((row) => row.current !== row.proposed).length +
    Number(imagesChanged) +
    Number(typesChanged);

  return (
    <section className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
        <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          <Icon name="compare_arrows" className="text-[22px] text-primary" />
          {t('placeReview.compare.title')}
        </h2>
        <span
          className={`rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold ${
            changedCount > 0
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {applied && changedCount === 0
            ? t('placeReview.compare.appliedNote')
            : changedCount > 0
              ? t('placeReview.compare.changedCount', { count: changedCount })
              : t('placeReview.compare.noChanges')}
        </span>
      </div>
      <div className="table-scroll w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="w-44 px-5 py-3 font-semibold">{t('placeReview.compare.field')}</th>
              <th className="px-4 py-3 font-semibold">
                {t(applied ? 'placeReview.compare.currentNow' : 'placeReview.compare.current')}
              </th>
              <th className="px-4 py-3 font-semibold">{t('placeReview.compare.proposed')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {[rows[0], TYPES_ROW, ...rows.slice(1)].map((row) => {
              if (row === TYPES_ROW)
                return (
                  <tr key="types">
                    <th className="px-5 py-3 align-top font-label-md text-label-md text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        {t('placeReview.detail.types')}
                        {typesChanged && <span className="h-2 w-2 rounded-full bg-tertiary" />}
                      </span>
                    </th>
                    <Cell
                      text={<TypeChips {...currentTypes} labels={typeLabels} />}
                      changed={false}
                      tone="old"
                    />
                    <Cell
                      text={
                        <TypeChips
                          {...proposedTypes}
                          previous={typesChanged ? currentTypes : undefined}
                          labels={typeLabels}
                        />
                      }
                      changed={false}
                      tone="new"
                    />
                  </tr>
                );
              const changed = row.current !== row.proposed;
              return (
                <tr key={row.labelKey}>
                  <th className="px-5 py-3 align-top font-label-md text-label-md text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      {t(row.labelKey)}
                      {changed && (
                        <span
                          className="h-2 w-2 rounded-full bg-tertiary"
                          title={t('placeReview.compare.changed')}
                        />
                      )}
                    </span>
                  </th>
                  <Cell text={row.current} changed={changed} tone="old" />
                  <Cell text={row.proposed} changed={changed} tone="new" />
                </tr>
              );
            })}
            <tr>
              <th className="px-5 py-3 align-top font-label-md text-label-md text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  {t('placeReview.detail.photos')}
                  {imagesChanged && <span className="h-2 w-2 rounded-full bg-tertiary" />}
                </span>
              </th>
              <Cell text={<Images images={current.images} />} changed={imagesChanged} tone="old" />
              <Cell text={<Images images={proposed.images} />} changed={imagesChanged} tone="new" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
