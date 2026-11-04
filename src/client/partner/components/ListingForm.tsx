import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import LocationPicker from '@/components/common/LocationPicker';
import { businessListingApi } from '@/client/api/businessListingApi';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { mapsApi } from '@/client/api/mapsApi';
import type {
  BusinessListing,
  BusinessListingInput,
  CategoryGroup,
  ListingRevision,
  OpeningHour,
  ReferenceItem,
} from '@/client/api/types';
import OpeningHoursEditor from '@/client/partner/components/OpeningHoursEditor';
import PhotoEditor from '@/client/partner/components/PhotoEditor';
import PriceEditor, { type PriceRow } from '@/client/partner/components/PriceEditor';
import { DAY_LABELS, fullWeek } from '@/client/partner/placeFormat';
import { Card, CardTitle, FormAlert, Notice } from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { SelectField, TextAreaField } from '@/client/ui/FormControls';
import { isValidPhone, normalizePhone } from '@/client/utils/validation';

type Values = Omit<
  BusinessListingInput,
  'latitude' | 'longitude' | 'openingHours' | 'prices' | 'phone' | 'website'
> & {
  groupCode: string;
  phone: string;
  website: string;
  latitude: string;
  longitude: string;
  hoursEnabled: boolean;
  week: OpeningHour[];
  prices: PriceRow[];
};
type TextKey =
  | 'name'
  | 'groupCode'
  | 'categoryCode'
  | 'provinceCode'
  | 'address'
  | 'description'
  | 'latitude'
  | 'longitude'
  | 'phone'
  | 'website';
type ErrorKey = TextKey | 'openingHours' | 'prices' | 'images';
type Errors = Partial<Record<ErrorKey, string>>;

/** create: đăng ký mới · edit: sửa khi chờ duyệt / bị từ chối · revision: đề xuất sửa địa điểm đã duyệt */
export type ListingFormMode = 'create' | 'edit' | 'revision';

const MAX_DESCRIPTION = 2000;

function initialValues(listing: BusinessListing | null): Values {
  return {
    name: listing?.name ?? '',
    groupCode: listing?.group?.code ?? '',
    categoryCode: listing?.category?.code ?? '',
    provinceCode: listing?.province?.code ?? '',
    address: listing?.address ?? '',
    description: listing?.description ?? '',
    latitude: listing ? String(listing.latitude) : '',
    longitude: listing ? String(listing.longitude) : '',
    phone: listing?.phone ?? '',
    website: listing?.website ?? '',
    hoursEnabled: (listing?.openingHours.length ?? 0) > 0,
    week: fullWeek(listing?.openingHours ?? []),
    prices: (listing?.prices ?? []).map((price) => ({
      priceType: price.priceType,
      amount: String(price.amount),
      description: price.description ?? '',
    })),
    images: listing?.images ?? [],
  };
}

/** Lỗi từ BE dạng "openingHours[2].openTime" → gom về ô tương ứng */
function mapFieldErrors(fieldErrors: Record<string, string>): Errors {
  const mapped: Errors = {};
  for (const [key, message] of Object.entries(fieldErrors)) {
    const root = key.split(/[.[]/)[0] as ErrorKey;
    mapped[root] ??= message;
  }
  return mapped;
}

const parseNumber = (value: string): number | null => {
  const parsed = Number(value.trim().replace(',', '.'));
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
};

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <CardTitle>{title}</CardTitle>
      {hint && <p className="mt-1 text-[12px] text-client-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </Card>
  );
}

interface ListingFormProps {
  mode: ListingFormMode;
  /** null khi đăng ký mới; khi sửa / đề xuất: dữ liệu hiện tại để điền sẵn */
  listing: BusinessListing | null;
  groups: CategoryGroup[];
  provinces: ReferenceItem[];
  onSaved?: (listing: BusinessListing) => void;
  onProposed?: (revision: ListingRevision) => void;
  onCancel?: () => void;
}

/** Form đăng ký / sửa / đề xuất chỉnh sửa địa điểm duy nhất của doanh nghiệp */
export default function ListingForm({
  mode,
  listing,
  groups,
  provinces,
  onSaved,
  onProposed,
  onCancel,
}: ListingFormProps) {
  const [values, setValues] = useState<Values>(() => initialValues(listing));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const subtypes = useMemo(
    () => groups.find((group) => group.code === values.groupCode)?.subtypes ?? [],
    [groups, values.groupCode],
  );

  const setField = <K extends keyof Values>(key: K, value: Values[K], errorKey: ErrorKey) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [errorKey]: undefined }));
  };

  const update = (key: TextKey) => (value: string) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Đổi nhóm → chọn lại loại con
      if (key === 'groupCode') next.categoryCode = '';
      // Dán "15.8794, 108.335" vào ô vĩ độ → tự tách ra hai ô
      if (key === 'latitude' && /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(value)) {
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
    if (values.name.trim().length < 2) next.name = 'Tên địa điểm phải có ít nhất 2 ký tự';
    if (!values.groupCode) next.groupCode = 'Vui lòng chọn nhóm dịch vụ';
    if (!values.categoryCode) next.categoryCode = 'Vui lòng chọn loại hình';
    if (!values.provinceCode) next.provinceCode = 'Vui lòng chọn tỉnh/thành';
    if (!values.address.trim()) next.address = 'Vui lòng nhập địa chỉ';
    if (latitude === null || Math.abs(latitude) > 90) next.latitude = 'Vĩ độ phải từ -90 đến 90';
    if (longitude === null || Math.abs(longitude) > 180)
      next.longitude = 'Kinh độ phải từ -180 đến 180';
    if (values.phone.trim() && !isValidPhone(values.phone))
      next.phone = 'Số điện thoại không hợp lệ';
    if (values.website.trim() && !/^https?:\/\/\S+$/.test(values.website.trim()))
      next.website = 'Website phải bắt đầu bằng http:// hoặc https://';
    if (values.hoursEnabled) {
      const bad = values.week.find(
        (hour) =>
          !hour.closed && (!hour.openTime || !hour.closeTime || hour.openTime === hour.closeTime),
      );
      if (bad)
        next.openingHours = `${DAY_LABELS[bad.dayOfWeek]}: cần giờ mở và giờ đóng khác nhau (hoặc bỏ chọn "Mở cửa")`;
    }
    if (values.prices.some((price) => price.amount === ''))
      next.prices = 'Vui lòng nhập số tiền cho mọi mức giá (hoặc xóa dòng trống)';
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) {
      setFormError('Vui lòng kiểm tra lại các ô được đánh dấu.');
      return;
    }

    const input: BusinessListingInput = {
      name: values.name.trim(),
      categoryCode: values.categoryCode,
      provinceCode: values.provinceCode,
      address: values.address.trim(),
      description: values.description.trim(),
      latitude: parseNumber(values.latitude) ?? 0,
      longitude: parseNumber(values.longitude) ?? 0,
      phone: normalizePhone(values.phone) || null,
      website: values.website.trim() || null,
      openingHours: values.hoursEnabled
        ? values.week.map((hour) =>
            hour.closed ? { ...hour, openTime: null, closeTime: null } : hour,
          )
        : [],
      prices: values.prices.map((price) => ({
        priceType: price.priceType,
        amount: Number(price.amount),
        description: price.description.trim() || null,
      })),
      images: values.images,
    };
    setBusy(true);
    try {
      if (mode === 'revision') {
        onProposed?.(await businessListingApi.proposeRevision(listing?.id ?? 0, input));
      } else {
        onSaved?.(
          mode === 'edit'
            ? await businessListingApi.update(listing?.id ?? 0, input)
            : await businessListingApi.submit(input),
        );
      }
    } catch (error) {
      if (error instanceof ClientApiError) setErrors(mapFieldErrors(error.fieldErrors));
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  const resubmitting = mode === 'edit' && listing?.status === 'REJECTED';
  const submitLabel =
    mode === 'revision'
      ? 'Gửi đề xuất chỉnh sửa'
      : mode === 'create'
        ? 'Gửi địa điểm xét duyệt'
        : resubmitting
          ? 'Gửi lại để xét duyệt'
          : 'Lưu thay đổi';
  const footerNote =
    mode === 'revision'
      ? 'Du khách vẫn thấy thông tin hiện tại cho đến khi Admin duyệt đề xuất. Mỗi lần chỉ có một đề xuất chờ duyệt.'
      : mode === 'create'
        ? 'Địa điểm chỉ hiển thị với du khách sau khi Admin phê duyệt.'
        : resubmitting
          ? 'Sau khi gửi lại, địa điểm sẽ quay về hàng chờ để Admin xét duyệt.'
          : 'Thông tin cập nhật sẽ được Admin xem khi xét duyệt.';

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      {resubmitting && listing?.statusNote && (
        <Notice tone="danger">
          <strong>Góp ý của Admin:</strong> {listing.statusNote}
        </Notice>
      )}
      {formError && <FormAlert message={formError} />}
      <div className="flex flex-col gap-4">
        <SectionCard title="Thông tin cơ bản">
          <Field
            label="Tên địa điểm"
            icon="storefront"
            placeholder="Hội An Garden Homestay"
            value={values.name}
            onChange={update('name')}
            error={errors.name}
          />
          <div className="grid gap-x-4 md:grid-cols-2">
            <SelectField
              label="Nhóm dịch vụ"
              icon="category"
              placeholder="Chọn nhóm"
              value={values.groupCode}
              onChange={update('groupCode')}
              options={groups.map((group) => ({ value: group.code, label: group.name }))}
              error={errors.groupCode}
            />
            <SelectField
              label="Loại hình"
              icon="sell"
              placeholder={values.groupCode ? 'Chọn loại hình' : 'Chọn nhóm trước'}
              value={values.categoryCode}
              onChange={update('categoryCode')}
              options={subtypes.map((subtype) => ({ value: subtype.code, label: subtype.name }))}
              error={errors.categoryCode}
              disabled={!values.groupCode}
            />
          </div>
          <SelectField
            label="Tỉnh / Thành phố"
            icon="map"
            placeholder="Chọn tỉnh/thành"
            value={values.provinceCode}
            onChange={update('provinceCode')}
            options={provinces.map((province) => ({ value: province.code, label: province.name }))}
            error={errors.provinceCode}
          />
          <Field
            label="Địa chỉ"
            icon="location_on"
            placeholder="12 Trần Phú, phường Hội An"
            value={values.address}
            onChange={update('address')}
            error={errors.address}
          />
          <LocationPicker
            latitude={parseNumber(values.latitude)}
            longitude={parseNumber(values.longitude)}
            address={values.address}
            search={mapsApi}
            onAddress={update('address')}
            onChange={(latitude, longitude) => {
              setValues((current) => ({
                ...current,
                latitude: String(latitude),
                longitude: String(longitude),
              }));
              setErrors((current) => ({ ...current, latitude: undefined, longitude: undefined }));
            }}
          />
          <div className="grid gap-x-4 md:grid-cols-2">
            <Field
              label="Vĩ độ (latitude)"
              icon="my_location"
              inputMode="decimal"
              placeholder="Tự điền khi chọn trên bản đồ"
              value={values.latitude}
              onChange={update('latitude')}
              error={errors.latitude && 'Vui lòng chọn vị trí trên bản đồ'}
              hint="Có thể dán cả cặp “vĩ độ, kinh độ”"
            />
            <Field
              label="Kinh độ (longitude)"
              icon="explore"
              inputMode="decimal"
              placeholder="Tự điền khi chọn trên bản đồ"
              value={values.longitude}
              onChange={update('longitude')}
              error={errors.longitude}
            />
          </div>
          <TextAreaField
            label="Mô tả"
            placeholder="Giới thiệu ngắn về địa điểm, không gian, điểm nổi bật…"
            value={values.description}
            onChange={update('description')}
            maxLength={MAX_DESCRIPTION}
            error={errors.description}
          />
          <div className="grid gap-x-4 md:grid-cols-2">
            <Field
              label="Số điện thoại (không bắt buộc)"
              icon="call"
              type="tel"
              placeholder="0905 128 991"
              value={values.phone}
              onChange={update('phone')}
              error={errors.phone}
            />
            <Field
              label="Website (không bắt buộc)"
              icon="language"
              type="url"
              placeholder="https://"
              value={values.website}
              onChange={update('website')}
              error={errors.website}
            />
          </div>
        </SectionCard>
        <SectionCard title="Hình ảnh" hint="Tối đa 10 ảnh. Ảnh bìa hiển thị đầu tiên với du khách.">
          <PhotoEditor
            images={values.images}
            onChange={(images) => setField('images', images, 'images')}
            onUploadingChange={setUploading}
            error={errors.images}
          />
        </SectionCard>
        <SectionCard title="Giờ mở cửa">
          <OpeningHoursEditor
            enabled={values.hoursEnabled}
            onEnabledChange={(enabled) => setField('hoursEnabled', enabled, 'openingHours')}
            week={values.week}
            onChange={(week) => setField('week', week, 'openingHours')}
            error={errors.openingHours}
          />
        </SectionCard>
        <SectionCard title="Bảng giá tham khảo" hint="Giá tính bằng VND, tối đa 20 mức giá.">
          <PriceEditor
            rows={values.prices}
            onChange={(prices) => setField('prices', prices, 'prices')}
            error={errors.prices}
          />
        </SectionCard>
        <Notice>{footerNote}</Notice>
      </div>
      <PrimaryButton type="submit" loading={busy} disabled={uploading}>
        {uploading ? 'Đang tải ảnh lên…' : submitLabel}
      </PrimaryButton>
      {onCancel && (
        <SecondaryButton className="mt-3" onClick={onCancel} disabled={busy}>
          Hủy
        </SecondaryButton>
      )}
    </form>
  );
}
