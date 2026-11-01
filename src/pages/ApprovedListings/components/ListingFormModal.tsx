import { useTranslation } from 'react-i18next';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Button, Modal } from '@/components/common';
import ListingMapInfoFields from '@/components/listings/ListingMapInfoFields';
import { LISTING_CATEGORY_SELECT_OPTIONS } from '@/constants/listing';
import { getSubTypeLabel, LISTING_SUBTYPES_BY_CATEGORY } from '@/constants/listingMap';
import { PROVINCE_OPTIONS } from '@/constants/partner';
import type { Listing, ListingCategory, ListingFormValues, ListingMapInfo } from '@/types';

interface ListingFormModalProps {
  /** null = thêm thủ công, có giá trị = chỉnh sửa */
  listing: Listing | null;
  onSubmit: (values: ListingFormValues) => void;
  onClose: () => void;
}

type FormErrors = Partial<Record<Exclude<keyof ListingFormValues, 'mapInfo'>, string>>;

const FORM_ID = 'listing-form';
const INPUT_CLASS =
  'h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none';

const CATEGORY_OPTIONS = LISTING_CATEGORY_SELECT_OPTIONS.filter(
  (option): option is { value: ListingCategory; label: string } => option.value !== 'all',
);

function toValues(listing: Listing | null): ListingFormValues {
  if (!listing) {
    return {
      name: '',
      partnerName: '',
      category: 'hotel',
      subType: LISTING_SUBTYPES_BY_CATEGORY.hotel[0],
      address: '',
      province: 'quangnam',
      mapInfo: {},
    };
  }
  const { name, partnerName, category, subType, address, province, mapInfo } = listing;
  return { name, partnerName, category, subType, address, province, mapInfo };
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      {children}
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

export default function ListingFormModal({ listing, onSubmit, onClose }: ListingFormModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ListingFormValues>(() => toValues(listing));
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = listing !== null;

  const update = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  // Đổi nhóm địa điểm → chọn loại hình con đầu tiên của nhóm mới
  const changeCategory = (category: ListingCategory) =>
    setValues((current) => ({
      ...current,
      category,
      subType: LISTING_SUBTYPES_BY_CATEGORY[category][0],
    }));

  const trimMapInfo = (info: ListingMapInfo): ListingMapInfo =>
    Object.fromEntries(
      Object.entries(info).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ]),
    );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!values.name.trim())
      nextErrors.name = t('approvedListings.listingFormModal.pleaseEnterPlaceName');
    if (!values.partnerName.trim())
      nextErrors.partnerName = t('approvedListings.listingFormModal.pleaseEnterOwningPartner');
    if (!values.address.trim())
      nextErrors.address = t('approvedListings.listingFormModal.pleaseEnterAddress');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      partnerName: values.partnerName.trim(),
      address: values.address.trim(),
      mapInfo: trimMapInfo(values.mapInfo),
    });
  };

  return (
    <Modal
      title={
        isEdit
          ? t('approvedListings.listingFormModal.editPlaceDetails')
          : t('approvedListings.listingFormModal.addPlaceManually')
      }
      description={
        isEdit
          ? t('approvedListings.listingFormModal.updateDisplayDetails', { id: listing.id })
          : t('approvedListings.listingFormModal.placesAddedByAdministrators')
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon={isEdit ? 'save' : 'add_location_alt'} type="submit" form={FORM_ID}>
            {isEdit
              ? t('approvedListings.listingFormModal.saveChanges')
              : t('approvedListings.listingFormModal.addPlace')}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Field label={t('approvedListings.listingFormModal.placeName')} error={errors.name}>
          <input
            className={INPUT_CLASS}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="VD: Hoi An Garden Homestay"
          />
        </Field>
        <Field
          label={t('approvedListings.listingFormModal.owningPartner')}
          error={errors.partnerName}
        >
          <input
            className={INPUT_CLASS}
            value={values.partnerName}
            onChange={(event) => update('partnerName', event.target.value)}
            placeholder="VD: Hoi An Hospitality Ltd."
          />
        </Field>
        <Field label={t('approvedListings.listingFormModal.category')}>
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.category}
            onChange={(event) => {
              const option = CATEGORY_OPTIONS.find((item) => item.value === event.target.value);
              if (option) changeCategory(option.value);
            }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('approvedListings.listingFormModal.subType')}>
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.subType}
            onChange={(event) => {
              const next = LISTING_SUBTYPES_BY_CATEGORY[values.category].find(
                (item) => item === event.target.value,
              );
              if (next) update('subType', next);
            }}
          >
            {LISTING_SUBTYPES_BY_CATEGORY[values.category].map((subType) => (
              <option key={subType} value={subType}>
                {getSubTypeLabel(subType)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('approvedListings.listingFormModal.address')} error={errors.address}>
          <input
            className={INPUT_CLASS}
            value={values.address}
            onChange={(event) => update('address', event.target.value)}
            placeholder={t('approvedListings.listingFormModal.eGCamChau')}
          />
        </Field>
        <Field label={t('approvedListings.listingFormModal.provinceCity')}>
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.province}
            onChange={(event) => {
              const option = PROVINCE_OPTIONS.find((item) => item.value === event.target.value);
              if (option) update('province', option.value);
            }}
          >
            {PROVINCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Thông tin hiển thị trên bản đồ — bộ trường theo nhóm, giống màn Xem xét & Duyệt */}
        <div className="mt-1 flex flex-col gap-0.5 border-t border-surface-container pt-4 sm:col-span-2">
          <span className="font-title-sm text-title-sm font-semibold text-on-surface">
            {t('listingMap.section.title')}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('listingMap.section.formHint')}
          </span>
        </div>
        <ListingMapInfoFields
          category={values.category}
          value={values.mapInfo}
          onChange={(mapInfo) => update('mapInfo', mapInfo)}
          inputClassName={INPUT_CLASS}
        />
      </form>
    </Modal>
  );
}
