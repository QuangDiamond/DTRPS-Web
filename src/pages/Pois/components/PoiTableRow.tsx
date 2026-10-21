import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AiMatchBadge, Icon, VectorIndexBadge } from '@/components/common';
import { POI_CATEGORY_CONFIG, POI_SOURCE_CONFIG, POI_STATUS_CONFIG } from '@/constants/poi';
import type { Poi } from '@/types';
import { formatNumber } from '@/utils/format';
import {
  isFreePrice,
  localizePoiText,
  priceSummary,
  shortLocation,
  shortPoiName,
} from '@/utils/poi';

interface PoiTableRowProps {
  poi: Poi;
  onEdit: (poi: Poi) => void;
  onView: (poi: Poi) => void;
  /** Độ tương đồng AI (%) khi đang dùng tìm kiếm AI */
  matchScore?: number;
}

const ACTION_BUTTON_CLASS =
  'rounded-lg p-1.5 text-on-surface-variant transition-all hover:bg-surface-container hover:text-primary';

export default function PoiTableRow({ poi, matchScore, onEdit, onView }: PoiTableRowProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const category = POI_CATEGORY_CONFIG[poi.category];
  const source = POI_SOURCE_CONFIG[poi.source];
  const status = POI_STATUS_CONFIG[poi.status];
  const thumbnail = poi.thumbnailUrl ?? poi.cover?.url;
  const price = priceSummary(poi.price);

  return (
    <tr className="group transition-colors hover:bg-surface-container-low/60">
      <td className="px-space-lg py-3">
        <div className="flex items-center gap-3">
          {thumbnail && !imageFailed ? (
            <img
              src={thumbnail}
              alt={poi.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover shadow-xs"
            />
          ) : (
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-xs ${category.badgeClass}`}
            >
              <Icon name={category.icon} className="text-[24px]" />
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(poi)}
                className="truncate text-left font-title-md text-title-md font-bold text-on-surface transition-colors group-hover:text-primary"
              >
                {shortPoiName(poi.name)}
              </button>
              {matchScore !== undefined && <AiMatchBadge score={matchScore} />}
            </div>
            <span className="mt-0.5 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <Icon
                name={poi.highlightIcon ?? category.icon}
                className={`text-[14px] ${poi.highlightIconClass ?? 'text-outline'}`}
              />
              {localizePoiText(poi, 'highlight', category.label)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-space-md py-3">
        <span className="rounded bg-surface-container px-2 py-1 font-mono font-label-sm text-label-sm font-semibold whitespace-nowrap text-on-surface-variant">
          {poi.id}
        </span>
      </td>
      <td className="px-space-md py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-label-sm text-label-sm font-medium whitespace-nowrap ${category.badgeClass}`}
        >
          {localizePoiText(poi, 'subCategory', category.shortLabel)}
        </span>
      </td>
      <td className="px-space-md py-3">
        <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
          <Icon name="pin_drop" className="text-[16px] text-primary" />
          <span>{shortLocation(poi.address) || '—'}</span>
        </div>
      </td>
      <td
        className={`px-space-md py-3 font-body-sm text-body-sm font-semibold whitespace-nowrap ${
          isFreePrice(poi.price) ? 'text-secondary' : 'text-on-surface'
        }`}
      >
        {price}
      </td>
      <td className="px-space-md py-3">
        <span
          className={`inline-flex items-center gap-1 font-label-sm text-label-sm whitespace-nowrap ${source.textClass}`}
        >
          <Icon name={source.icon} className={`text-[14px] ${source.iconClass}`} />
          {poi.sourceLabel ?? source.label}
        </span>
      </td>
      <td className="px-space-md py-3">
        {poi.reviewCount > 0 ? (
          <div className="flex items-center gap-1">
            <Icon name="star" filled className="text-[16px] text-tertiary" />
            <span className="font-label-md text-label-md font-bold text-on-surface">
              {poi.rating.toFixed(1)}
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              ({formatNumber(poi.reviewCount)})
            </span>
          </div>
        ) : (
          <span className="font-label-sm text-label-sm text-outline">
            {t('pois.poiTableRow.noReviewsYet')}
          </span>
        )}
      </td>
      <td className="px-space-md py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${status.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </td>
      <td className="px-space-md py-3">
        <VectorIndexBadge indexed={poi.vectorEmbedded} />
      </td>
      <td className="px-space-lg py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title={t('pois.poiTableRow.editPoi')}
            onClick={() => onEdit(poi)}
            className={ACTION_BUTTON_CLASS}
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            type="button"
            title={t('actions.viewDetail')}
            onClick={() => onView(poi)}
            className={ACTION_BUTTON_CLASS}
          >
            <Icon name="visibility" className="text-[18px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
