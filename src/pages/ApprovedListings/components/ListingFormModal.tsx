import { useState, type FormEvent, type ReactNode } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import {
  LISTING_CATEGORY_CONFIG,
  LISTING_CATEGORY_SELECT_OPTIONS,
} from '../../../constants/listing';
import { PROVINCE_OPTIONS } from '../../../constants/partner';
import type { Listing, ListingCategory, ListingFormValues } from '../../../types/admin';

interface ListingFormModalProps {
  /** null = thêm thủ công, có giá trị = chỉnh sửa */
  listing: Listing | null;
  onSubmit: (values: ListingFormValues) => void;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof ListingFormValues, string>>;

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
      categoryLabel: LISTING_CATEGORY_CONFIG.hotel.filterLabel,
      address: '',
      province: 'quangnam',
    };
  }
  const { name, partnerName, category, categoryLabel, address, province } = listing;
  return { name, partnerName, category, categoryLabel, address, province };
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
  const [values, setValues] = useState<ListingFormValues>(() => toValues(listing));
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = listing !== null;

  const update = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Vui lòng nhập tên địa điểm';
    if (!values.partnerName.trim()) nextErrors.partnerName = 'Vui lòng nhập đối tác sở hữu';
    if (!values.categoryLabel.trim()) nextErrors.categoryLabel = 'Vui lòng nhập nhãn phân loại';
    if (!values.address.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      partnerName: values.partnerName.trim(),
      categoryLabel: values.categoryLabel.trim(),
      address: values.address.trim(),
    });
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa thông tin địa điểm' : 'Thêm địa điểm thủ công'}
      description={
        isEdit
          ? `Cập nhật thông tin hiển thị của ${listing.id}`
          : 'Địa điểm do quản trị viên thêm sẽ được phê duyệt và hiển thị ngay'
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            Hủy
          </Button>
          <Button icon={isEdit ? 'save' : 'add_location_alt'} type="submit" form={FORM_ID}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm địa điểm'}
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
        <Field label="Tên địa điểm *" error={errors.name}>
          <input
            className={INPUT_CLASS}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="VD: Hoi An Garden Homestay"
          />
        </Field>
        <Field label="Đối tác sở hữu *" error={errors.partnerName}>
          <input
            className={INPUT_CLASS}
            value={values.partnerName}
            onChange={(event) => update('partnerName', event.target.value)}
            placeholder="VD: Hoi An Hospitality Ltd."
          />
        </Field>
        <Field label="Danh mục">
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.category}
            onChange={(event) => {
              const option = CATEGORY_OPTIONS.find((item) => item.value === event.target.value);
              if (!option) return;
              update('category', option.value);
              update('categoryLabel', LISTING_CATEGORY_CONFIG[option.value].filterLabel);
            }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nhãn phân loại hiển thị *" error={errors.categoryLabel}>
          <input
            className={INPUT_CLASS}
            value={values.categoryLabel}
            onChange={(event) => update('categoryLabel', event.target.value)}
            placeholder="VD: Resort ven biển"
          />
        </Field>
        <Field label="Địa chỉ *" error={errors.address}>
          <input
            className={INPUT_CLASS}
            value={values.address}
            onChange={(event) => update('address', event.target.value)}
            placeholder="VD: Cẩm Châu, TP. Hội An, Quảng Nam"
          />
        </Field>
        <Field label="Tỉnh / Thành phố">
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
      </form>
    </Modal>
  );
}
