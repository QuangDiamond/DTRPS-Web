import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import TypePicker from '@/components/common/TypePicker';
import { checkTypes } from '@/components/common/typePickerUtils';
import LocationPicker, { type LocationPickerLabels } from '@/components/common/LocationPicker';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { placeDetailPath, ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/httpClient';
import { mapService } from '@/services/mapService';
import { placeCatalogService } from '@/services/placeCatalogService';
import type {
  CatalogPlaceDetail,
  CatalogPlaceInput,
  CatalogPlaceStatus,
  CategoryGroupRef,
  OpeningHour,
  RefItem,
} from '@/types';
import { getErrorMessage } from '@/utils/error';
import { DAY_KEYS } from '@/pages/PlaceReview/placeReviewUtils';
import EditorSection, { FormField } from './components/EditorSection';
import HoursEditor from './components/HoursEditor';
import PhotoManager, { type PhotoItem } from './components/PhotoManager';
import PriceManager, { type PriceItem } from './components/PriceManager';
import { CATALOG_STATUSES, STATUS_STYLE } from './placeCatalogUtils';
import {
  cleanWeek,
  fullWeek,
  INPUT_CLASS,
  invalidDay,
  MAX_DESCRIPTION,
  parseNumber,
} from './placeEditorUtils';

interface Values {
  name: string;
  /** Nhóm dịch vụ đã tích (cột trái) */
  groupCodes: string[];
  /** Loại hình đã tích theo thứ tự tích — phần tử đầu là loại hình đại diện */
  categoryCodes: string[];
  provinceCode: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  status: CatalogPlaceStatus;
  hoursEnabled: boolean;
  week: OpeningHour[];
}

type ErrorKey = keyof Values | 'openingHours' | 'prices' | 'images';
type Errors = Partial<Record<ErrorKey, string>>;

const COORDINATE_PAIR = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;

function initialValues(detail: CatalogPlaceDetail | null): Values {
  const content = detail?.content;
  return {
    name: content?.name ?? '',
    groupCodes: (content?.groups ?? (content?.group ? [content.group] : [])).map((g) => g.code),
    categoryCodes: (content?.categories ?? (content?.category ? [content.category] : [])).map(
      (c) => c.code,
    ),
    provinceCode: content?.province?.code ?? '',
    address: content?.address ?? '',
    description: content?.description ?? '',
    latitude: content ? String(content.latitude) : '',
    longitude: content ? String(content.longitude) : '',
    phone: content?.phone ?? '',
    website: content?.website ?? '',
    // Địa điểm mới mặc định Chưa công khai (DRAFT), admin tự bật Đang hiển thị
    status: detail?.place.status ?? 'draft',
    hoursEnabled: true,
    week: fullWeek(content?.openingHours ?? []),
  };
}

/** Thông tin cơ bản gửi lên BE (không gồm ảnh / giờ / giá) */
function basicsInput(values: Values): CatalogPlaceInput {
  return {
    name: values.name.trim(),
    categoryCode: values.categoryCodes[0],
    categoryCodes: values.categoryCodes,
    provinceCode: values.provinceCode,
    address: values.address.trim(),
    description: values.description.trim() || null,
    latitude: parseNumber(values.latitude) ?? 0,
    longitude: parseNumber(values.longitude) ?? 0,
    phone: values.phone.replace(/[\s.-]/g, '') || null,
    website: values.website.trim() || null,
    status: values.status.toUpperCase() as CatalogPlaceInput['status'],
  };
}

/** Lỗi theo ô từ BE: { errors: { "openingHours[2].openTime": "…" } } → gom về ô gốc */
function fieldErrors(error: unknown): Errors {
  if (!(error instanceof ApiError)) return {};
  const details = error.details as { errors?: Record<string, string> } | undefined;
  const mapped: Errors = {};
  for (const [key, message] of Object.entries(details?.errors ?? {})) {
    const root = key.split(/[.[]/)[0] as ErrorKey;
    mapped[root] ??= message;
  }
  return mapped;
}

/**
 * /admin/locations/new — admin thêm địa điểm trực tiếp (không qua đối tác, không cần duyệt).
 * /admin/locations/:id/edit — sửa thông tin cơ bản; ảnh, giờ, giá sửa ở trang chi tiết.
 */
export default function PlaceEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams();
  const creating = !id;

  const [refs, setRefs] = useState<{ groups: CategoryGroupRef[]; provinces: RefItem[] } | null>(
    null,
  );
  const [detail, setDetail] = useState<CatalogPlaceDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const [values, setValues] = useState<Values>(() => initialValues(null));
  const [images, setImages] = useState<PhotoItem[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const nextPriceKey = useRef(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      placeCatalogService.categories(),
      placeCatalogService.provinces(),
      id ? placeCatalogService.get(id) : Promise.resolve(null),
    ])
      .then(([groups, provinces, place]) => {
        if (!active) return;
        setRefs({ groups, provinces });
        setDetail(place);
        setValues(initialValues(place));
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  const mapLabels = useMemo<Partial<LocationPickerLabels>>(
    () => ({
      title: t('placeEditor.map.title'),
      searchPlaceholder: t('placeEditor.map.searchPlaceholder'),
      search: t('placeEditor.map.search'),
      searching: t('placeEditor.map.searching'),
      myLocation: t('placeEditor.map.myLocation'),
      emptyQuery: t('placeEditor.map.emptyQuery'),
      notFound: t('placeEditor.map.notFound'),
      searchFailed: t('placeEditor.map.searchFailed'),
      noGeolocation: t('placeEditor.map.noGeolocation'),
      geolocationDenied: t('placeEditor.map.geolocationDenied'),
      hintWithPoint: t('placeEditor.map.hintWithPoint'),
      hintNoPoint: t('placeEditor.map.hintNoPoint'),
      pinAddress: t('placeEditor.map.pinAddress'),
      useAddress: t('placeEditor.map.useAddress'),
    }),
    [t],
  );

  if (loadError) {
    return (
      <ErrorState
        title={t('placeEditor.loadError')}
        message={loadError}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!refs || (!creating && !detail)) return <PageLoader />;

  if (detail && !detail.editable) {
    return (
      <ErrorState
        title={t('placeEditor.partnerLocked')}
        message={t('placeEditor.partnerLockedHint')}
        onRetry={() => navigate(placeDetailPath(detail.place.id))}
      />
    );
  }

  const update = (key: keyof Values) => (value: string) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Dán "15.8794, 108.335" vào ô vĩ độ → tự tách
      if (key === 'latitude' && COORDINATE_PAIR.test(value)) {
        const [lat, lng] = value.split(',');
        next.latitude = lat.trim();
        next.longitude = lng.trim();
      }
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const latitude = parseNumber(values.latitude);
    const longitude = parseNumber(values.longitude);
    const phone = values.phone.replace(/[\s.-]/g, '');
    if (values.name.trim().length < 2) next.name = t('placeEditor.errors.name');
    const typesError = checkTypes(refs.groups, values.groupCodes, values.categoryCodes, {
      empty: t('placeEditor.errors.category'),
      groupWithoutType: (group) => t('placeEditor.errors.groupWithoutType', { group }),
    });
    if (typesError) next.categoryCodes = typesError;
    if (!values.provinceCode) next.provinceCode = t('placeEditor.errors.province');
    if (!values.address.trim()) next.address = t('placeEditor.errors.address');
    if (latitude === null || Math.abs(latitude) > 90)
      next.latitude = t('placeEditor.errors.latitude');
    if (longitude === null || Math.abs(longitude) > 180)
      next.longitude = t('placeEditor.errors.longitude');
    if (phone && !/^\+?\d{8,15}$/.test(phone)) next.phone = t('placeEditor.errors.phone');
    if (values.website.trim() && !/^https?:\/\/\S+$/.test(values.website.trim()))
      next.website = t('placeEditor.errors.website');
    if (creating && values.hoursEnabled) {
      const bad = invalidDay(values.week);
      if (bad)
        next.openingHours = t('placeEditor.errors.hours', { day: t(DAY_KEYS[bad.dayOfWeek]) });
    }
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) {
      setFormError(t('placeEditor.errors.checkFields'));
      return;
    }
    const input: CatalogPlaceInput = {
      ...basicsInput(values),
      ...(creating && {
        openingHours: values.hoursEnabled ? cleanWeek(values.week) : [],
        prices: prices.map(({ priceType, amount, description }) => ({
          priceType,
          amount,
          description,
        })),
        images: images.map(({ url, primary }) => ({ url, primary })),
      }),
    };
    setSaving(true);
    try {
      const saved = id
        ? await placeCatalogService.update(id, input)
        : await placeCatalogService.create(input);
      showToast(creating ? t('placeEditor.created') : t('placeEditor.saved'));
      navigate(placeDetailPath(saved.place.id), { replace: true });
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(getErrorMessage(error));
      setSaving(false);
    }
  };

  // Lưu riêng vị trí ngay cạnh bản đồ: lấy thông tin đã lưu + tọa độ mới (các ô khác đang sửa dở
  // trong form không bị gửi theo)
  const savedLatitude = detail?.content.latitude;
  const savedLongitude = detail?.content.longitude;
  const newLatitude = parseNumber(values.latitude);
  const newLongitude = parseNumber(values.longitude);
  const locationValid =
    newLatitude !== null &&
    newLongitude !== null &&
    Math.abs(newLatitude) <= 90 &&
    Math.abs(newLongitude) <= 180;
  const locationChanged =
    locationValid && (newLatitude !== savedLatitude || newLongitude !== savedLongitude);

  const saveLocation = async () => {
    if (!id || !detail || !locationChanged) return;
    setSavingLocation(true);
    try {
      const saved = await placeCatalogService.update(id, {
        ...basicsInput(initialValues(detail)),
        latitude: newLatitude,
        longitude: newLongitude,
      });
      setDetail(saved);
      showToast(t('placeEditor.location.saved'));
    } catch (error) {
      setErrors((current) => ({ ...current, ...fieldErrors(error) }));
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSavingLocation(false);
    }
  };

  // Ảnh / giá của form tạo mới: giữ trong state, gửi kèm khi lưu
  const addImage = (url: string) => {
    if (images.some((image) => image.url === url))
      throw new Error(t('placeEditor.photos.duplicate'));
    setImages((list) => [...list, { key: url, url, primary: list.length === 0 }]);
  };
  const removeImage = (item: PhotoItem) =>
    setImages((list) => {
      const next = list.filter((image) => image.key !== item.key);
      if (next.length > 0 && !next.some((image) => image.primary))
        next[0] = { ...next[0], primary: true };
      return next;
    });
  const setCover = (item: PhotoItem) =>
    setImages((list) => list.map((image) => ({ ...image, primary: image.key === item.key })));

  const title = creating ? t('placeEditor.createTitle') : t('placeEditor.editTitle');
  const backTo = detail ? placeDetailPath(detail.place.id) : ROUTES.POIS;

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('placeCatalog.detail.back'), icon: 'location_on', to: ROUTES.POIS },
            ...(detail ? [{ label: detail.place.name, to: backTo }] : []),
            { label: title },
          ]}
          title={title}
          description={creating ? t('placeEditor.createHint') : t('placeEditor.editHint')}
        />
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-xl bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          <Icon name="error" className="text-[20px]" /> {formError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <EditorSection icon="info" title={t('placeEditor.sections.basic')}>
            <FormField label={t('placeEditor.fields.name')} required error={errors.name}>
              <input
                value={values.name}
                onChange={(event) => update('name')(event.target.value)}
                placeholder={t('placeEditor.fields.namePlaceholder')}
                maxLength={255}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label={t('placeEditor.fields.description')} error={errors.description}>
              <textarea
                rows={5}
                value={values.description}
                maxLength={MAX_DESCRIPTION}
                onChange={(event) => update('description')(event.target.value)}
                placeholder={t('placeEditor.fields.descriptionPlaceholder')}
                className={`${INPUT_CLASS} resize-y`}
              />
            </FormField>
          </EditorSection>

          <EditorSection
            icon="category"
            title={t('placeEditor.sections.types')}
            hint={t('placeEditor.sections.typesHint')}
          >
            <TypePicker
              groups={refs.groups}
              groupCodes={values.groupCodes}
              typeCodes={values.categoryCodes}
              onChange={(groupCodes, categoryCodes) => {
                setValues((current) => ({ ...current, groupCodes, categoryCodes }));
                setErrors((current) => ({ ...current, categoryCodes: undefined }));
              }}
              error={errors.categoryCodes}
              labels={{
                groups: t('placeEditor.types.groups'),
                types: t('placeEditor.types.types'),
                pickGroupFirst: t('placeEditor.types.pickGroupFirst'),
                main: t('placeEditor.types.main'),
                selected: t('placeEditor.types.selected'),
                mainPick: t('placeEditor.types.mainPick'),
              }}
            />
          </EditorSection>

          <EditorSection
            icon="map"
            title={t('placeEditor.sections.location')}
            hint={t('placeEditor.sections.locationHint')}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label={t('placeEditor.fields.province')}
                required
                error={errors.provinceCode}
              >
                <select
                  value={values.provinceCode}
                  onChange={(event) => update('provinceCode')(event.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">{t('placeEditor.fields.choose')}</option>
                  {refs.provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t('placeEditor.fields.address')} required error={errors.address}>
                <input
                  value={values.address}
                  onChange={(event) => update('address')(event.target.value)}
                  placeholder={t('placeEditor.fields.addressPlaceholder')}
                  maxLength={500}
                  className={INPUT_CLASS}
                />
              </FormField>
            </div>
            <LocationPicker
              latitude={parseNumber(values.latitude)}
              longitude={parseNumber(values.longitude)}
              address={values.address}
              labels={mapLabels}
              search={mapService}
              onAddress={(address) => update('address')(address)}
              onChange={(latitude, longitude) => {
                setValues((current) => ({
                  ...current,
                  latitude: String(latitude),
                  longitude: String(longitude),
                }));
                setErrors((current) => ({ ...current, latitude: undefined, longitude: undefined }));
              }}
            />
            {!creating && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {locationChanged
                    ? t('placeEditor.location.changed')
                    : t('placeEditor.location.unchanged')}
                </p>
                <Button
                  type="button"
                  size="sm"
                  icon="where_to_vote"
                  loading={savingLocation}
                  disabled={!locationChanged || saving}
                  onClick={() => void saveLocation()}
                >
                  {t('placeEditor.location.save')}
                </Button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label={t('placeEditor.fields.latitude')}
                required
                error={errors.latitude}
                hint={t('placeEditor.fields.coordinateHint')}
              >
                <input
                  inputMode="decimal"
                  value={values.latitude}
                  onChange={(event) => update('latitude')(event.target.value)}
                  className={INPUT_CLASS}
                />
              </FormField>
              <FormField
                label={t('placeEditor.fields.longitude')}
                required
                error={errors.longitude}
              >
                <input
                  inputMode="decimal"
                  value={values.longitude}
                  onChange={(event) => update('longitude')(event.target.value)}
                  className={INPUT_CLASS}
                />
              </FormField>
            </div>
          </EditorSection>

          <EditorSection icon="contact_phone" title={t('placeEditor.sections.contact')}>
            <FormField label={t('placeEditor.fields.phone')} error={errors.phone}>
              <input
                type="tel"
                value={values.phone}
                onChange={(event) => update('phone')(event.target.value)}
                placeholder="0905 128 991"
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label={t('placeEditor.fields.website')} error={errors.website}>
              <input
                type="url"
                value={values.website}
                onChange={(event) => update('website')(event.target.value)}
                placeholder="https://"
                className={INPUT_CLASS}
              />
            </FormField>
          </EditorSection>
          {creating && (
            <>
              <EditorSection
                icon="photo_library"
                title={t('placeEditor.sections.photos')}
                hint={t('placeEditor.sections.photosHint')}
              >
                <PhotoManager
                  images={images}
                  onAdd={addImage}
                  onRemove={removeImage}
                  onSetCover={setCover}
                  onUploadingChange={setUploading}
                />
              </EditorSection>

              <EditorSection
                icon="schedule"
                title={t('placeEditor.sections.hours')}
                hint={t('placeEditor.sections.hoursHint')}
                actions={
                  <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface select-none">
                    <input
                      type="checkbox"
                      checked={values.hoursEnabled}
                      onChange={(event) => {
                        const hoursEnabled = event.target.checked;
                        setValues((current) => ({ ...current, hoursEnabled }));
                        setErrors((current) => ({ ...current, openingHours: undefined }));
                      }}
                      className="h-4 w-4 accent-primary"
                    />
                    {t('placeEditor.hours.declare')}
                  </label>
                }
              >
                {values.hoursEnabled && (
                  <HoursEditor
                    week={values.week}
                    onChange={(week) => {
                      setValues((current) => ({ ...current, week }));
                      setErrors((current) => ({ ...current, openingHours: undefined }));
                    }}
                  />
                )}
                {errors.openingHours && (
                  <p className="font-label-sm text-label-sm text-error">{errors.openingHours}</p>
                )}
              </EditorSection>

              <EditorSection
                icon="payments"
                title={t('placeEditor.sections.prices')}
                hint={t('placeEditor.sections.pricesHint')}
              >
                <PriceManager
                  prices={prices}
                  onAdd={(price) =>
                    setPrices((list) => [
                      ...list,
                      { ...price, currency: 'VND', key: `new-${nextPriceKey.current++}` },
                    ])
                  }
                  onUpdate={(item, price) =>
                    setPrices((list) =>
                      list.map((row) => (row.key === item.key ? { ...row, ...price } : row)),
                    )
                  }
                  onRemove={(item) =>
                    setPrices((list) => list.filter((row) => row.key !== item.key))
                  }
                />
                {errors.prices && (
                  <p className="font-label-sm text-label-sm text-error">{errors.prices}</p>
                )}
              </EditorSection>
            </>
          )}
        </div>

        <div className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
          <EditorSection icon="visibility" title={t('placeEditor.sections.publish')}>
            <FormField
              label={t('placeEditor.fields.status')}
              hint={t('placeEditor.fields.statusHint')}
            >
              <select
                value={values.status}
                onChange={(event) => update('status')(event.target.value)}
                className={INPUT_CLASS}
              >
                {CATALOG_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(STATUS_STYLE[status].labelKey)}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex flex-col gap-2">
              <Button type="submit" icon="save" loading={saving} disabled={uploading}>
                {uploading
                  ? t('placeEditor.photos.uploading')
                  : creating
                    ? t('placeEditor.create')
                    : t('placeEditor.save')}
              </Button>
              <Button variant="neutral" disabled={saving} onClick={() => navigate(backTo)}>
                {t('placeEditor.cancel')}
              </Button>
            </div>
          </EditorSection>
        </div>
      </div>
    </form>
  );
}
