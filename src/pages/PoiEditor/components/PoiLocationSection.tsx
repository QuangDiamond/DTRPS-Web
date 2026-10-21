import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { POI_CLUSTER_RADIUS, POI_PROVINCE_OPTIONS } from '@/constants/poi';
import { useToast } from '@/hooks';
import {
  googleMapsUrl,
  openStreetMapEmbedUrl,
  type PoiFieldChange,
} from '@/pages/PoiEditor/poiFormUtils';
import type { PoiFormValues } from '@/types';
import PoiCoordinateInput from './PoiCoordinateInput';
import PoiRangeBar from './PoiRangeBar';
import PoiSectionCard from './PoiSectionCard';

interface PoiLocationSectionProps {
  poiCode: string;
  values: PoiFormValues;
  onChange: PoiFieldChange;
}

export default function PoiLocationSection({ poiCode, values, onChange }: PoiLocationSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { latitude, longitude, mapImageUrl, clusterRadius, clusterPois } = values;

  const changeCoordinate = (key: 'latitude' | 'longitude', value: number) => {
    onChange(key, value);
    // Ảnh bản đồ tĩnh chỉ đúng với tọa độ cũ → chuyển sang bản đồ trực tuyến
    if (mapImageUrl) onChange('mapImageUrl', undefined);
  };

  return (
    <PoiSectionCard
      compact
      icon="explore"
      title={t('poiEditor.poiLocationSection.n4GeographicCoordinatesDigital')}
      description={t('poiEditor.poiLocationSection.pinpointExactDestinationLocation')}
    >
      <div className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-semibold text-on-surface">
          {t('poiEditor.poiLocationSection.provinceCity')}
        </span>
        <div className="relative">
          <select
            value={values.province}
            onChange={(event) => {
              const next = POI_PROVINCE_OPTIONS.find(
                (option) => option.value === event.target.value,
              );
              if (next) onChange('province', next.value);
            }}
            className="w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low px-space-sm py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            {POI_PROVINCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute top-2.5 right-3 text-[20px] text-outline"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-semibold text-on-surface">
          {t('poiEditor.poiLocationSection.detailedAddress')}
        </span>
        <label className="flex items-start gap-2 rounded-lg bg-surface-container-low p-space-sm font-body-md text-body-md text-on-surface focus-within:ring-2 focus-within:ring-primary/30">
          <Icon name="place" className="mt-0.5 shrink-0 text-[20px] text-primary" />
          <textarea
            rows={2}
            value={values.address}
            placeholder={t('poiEditor.poiLocationSection.houseNumberStreetWard')}
            onChange={(event) => onChange('address', event.target.value)}
            className="w-full resize-none bg-transparent placeholder:text-outline focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <PoiCoordinateInput
          label={t('poiEditor.poiLocationSection.latitude')}
          axis="lat"
          value={latitude}
          onChange={(value) => changeCoordinate('latitude', value)}
          onInvalid={(message) => showToast(message, 'error')}
        />
        <PoiCoordinateInput
          label={t('poiEditor.poiLocationSection.longitude')}
          axis="lng"
          value={longitude}
          onChange={(value) => changeCoordinate('longitude', value)}
          onInvalid={(message) => showToast(message, 'error')}
        />
      </div>

      {/* Khung bản đồ với ghim ở giữa */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-surface-container shadow-sm">
        {mapImageUrl ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${mapImageUrl}')` }}
          />
        ) : (
          <iframe
            title={t('poiEditor.poiLocationSection.map', { poiCode })}
            src={openStreetMapEmbedUrl(latitude, longitude)}
            loading="lazy"
            className="pointer-events-none h-full w-full border-0"
          />
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            <Icon
              name="location_on"
              filled
              className="animate-bounce text-[36px] text-error drop-shadow-md"
            />
            <span className="-mt-1 rounded bg-on-surface px-space-xs py-0.5 font-label-sm text-[10px] text-on-primary shadow-sm">
              {poiCode}
            </span>
          </div>
        </div>
      </div>

      <a
        href={googleMapsUrl(latitude, longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-low py-2.5 font-label-md text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
      >
        <Icon name="map" className="text-[18px]" />
        <span>{t('poiEditor.poiLocationSection.checkCoordinatesGoogleMaps')}</span>
      </a>

      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-space-md">
        <div className="flex items-center justify-between font-label-sm text-label-sm">
          <span className="font-semibold text-on-surface">
            {t('poiEditor.poiLocationSection.surroundingClusterRadius')}
          </span>
          <span className="font-bold text-secondary">
            {t('poiEditor.poiLocationSection.meters', { clusterRadius })}
          </span>
        </div>
        <PoiRangeBar
          label={t('poiEditor.poiLocationSection.clusterRadius')}
          heightClass="h-1.5"
          value={clusterRadius}
          min={POI_CLUSTER_RADIUS.min}
          max={POI_CLUSTER_RADIUS.max}
          step={POI_CLUSTER_RADIUS.step}
          onChange={(value) => onChange('clusterRadius', value)}
        />
        <p className="mt-1 font-body-sm text-body-sm leading-snug text-outline">
          {clusterPois.length > 0 ? (
            <>
              <Trans
                i18nKey="poiEditor.poiLocationSection.autoLinkedCluster"
                values={{ join: clusterPois.join(', ') }}
                components={{ c0: <span className="font-medium text-on-surface" /> }}
              />
            </>
          ) : (
            t('poiEditor.poiLocationSection.noDestinationsLinkedWithin')
          )}
        </p>
      </div>
    </PoiSectionCard>
  );
}
