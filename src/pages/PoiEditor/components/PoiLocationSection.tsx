import Icon from '../../../components/common/Icon';
import { POI_CLUSTER_RADIUS, POI_PROVINCE_OPTIONS } from '../../../constants/poi';
import { useToast } from '../../../hooks/useToast';
import type { PoiFormValues } from '../../../types/admin';
import { googleMapsUrl, openStreetMapEmbedUrl, type PoiFieldChange } from '../poiFormUtils';
import PoiCoordinateInput from './PoiCoordinateInput';
import PoiRangeBar from './PoiRangeBar';
import PoiSectionCard from './PoiSectionCard';

interface PoiLocationSectionProps {
  poiCode: string;
  values: PoiFormValues;
  onChange: PoiFieldChange;
}

export default function PoiLocationSection({ poiCode, values, onChange }: PoiLocationSectionProps) {
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
      title="4. Tọa độ địa lý & Bản đồ số"
      description="Định vị vi mô (Micro-location Pinning)"
    >
      <div className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-semibold text-on-surface">
          Tỉnh / Thành phố
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
          Địa chỉ chi tiết
        </span>
        <label className="flex items-start gap-2 rounded-lg bg-surface-container-low p-space-sm font-body-md text-body-md text-on-surface focus-within:ring-2 focus-within:ring-primary/30">
          <Icon name="place" className="mt-0.5 shrink-0 text-[20px] text-primary" />
          <textarea
            rows={2}
            value={values.address}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            onChange={(event) => onChange('address', event.target.value)}
            className="w-full resize-none bg-transparent placeholder:text-outline focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <PoiCoordinateInput
          label="Vĩ độ (Latitude)"
          axis="lat"
          value={latitude}
          onChange={(value) => changeCoordinate('latitude', value)}
          onInvalid={(message) => showToast(message, 'error')}
        />
        <PoiCoordinateInput
          label="Kinh độ (Longitude)"
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
            title={`Bản đồ ${poiCode}`}
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
        <span>Kiểm tra tọa độ trên Google Maps</span>
      </a>

      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-space-md">
        <div className="flex items-center justify-between font-label-sm text-label-sm">
          <span className="font-semibold text-on-surface">Bán kính cụm kết nối xung quanh</span>
          <span className="font-bold text-secondary">{clusterRadius} mét</span>
        </div>
        <PoiRangeBar
          label="Bán kính cụm kết nối"
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
              Tự động liên kết cụm:{' '}
              <span className="font-medium text-on-surface">{clusterPois.join(', ')}</span>.
            </>
          ) : (
            'Chưa có điểm đến nào được liên kết trong bán kính này.'
          )}
        </p>
      </div>
    </PoiSectionCard>
  );
}
