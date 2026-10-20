import Icon from '../../../components/common/Icon';
import { POI_CATEGORY_OPTIONS } from '../../../constants/poi';
import type { PoiFormValues } from '../../../types/admin';
import type { PoiFieldChange, PoiFormErrors } from '../poiFormUtils';
import PoiDescriptionEditor from './PoiDescriptionEditor';
import PoiSectionCard from './PoiSectionCard';
import PoiTextField, { POI_INPUT_CLASS } from './PoiTextField';

const DEFAULT_AI_NOTE =
  'Được AI tính toán dựa trên số điểm dừng bên trong khu vực và lộ trình di chuyển phổ biến.';

interface PoiBasicInfoSectionProps {
  values: PoiFormValues;
  errors: PoiFormErrors;
  onChange: PoiFieldChange;
}

export default function PoiBasicInfoSection({
  values,
  errors,
  onChange,
}: PoiBasicInfoSectionProps) {
  return (
    <PoiSectionCard
      icon="info"
      title="1. Thông tin cơ bản POI"
      description="Dữ liệu định danh, danh mục hiển thị và thời lượng khám phá"
      badge={
        <span className="rounded-full bg-surface-container-low px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-primary">
          Bắt buộc
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <PoiTextField
          className="md:col-span-2"
          label="Tên điểm đến POI"
          required
          value={values.name}
          placeholder="Ví dụ: Phố cổ Hội An (Hoi An Ancient Town)"
          error={errors.name}
          onChange={(name) => onChange('name', name)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 font-label-md text-label-md font-semibold text-on-surface">
            Danh mục chính <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value={values.category}
              onChange={(event) => {
                const next = POI_CATEGORY_OPTIONS.find(
                  (option) => option.value === event.target.value,
                );
                if (next) onChange('category', next.value);
              }}
              className={`${POI_INPUT_CLASS} cursor-pointer appearance-none px-space-md`}
            >
              {POI_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute top-3 right-3 text-[20px] text-outline"
            />
          </div>
        </div>

        <PoiTextField
          label="Danh mục phụ / Tag gợi ý AI"
          value={values.tags}
          placeholder="Phân tách bằng dấu phẩy"
          onChange={(tags) => onChange('tags', tags)}
        />

        <PoiDescriptionEditor
          value={values.description}
          onChange={(description) => onChange('description', description)}
        />

        <PoiTextField
          label="Mức giá vé tham quan (Quy chuẩn VNĐ)"
          icon="payments"
          value={values.price}
          placeholder="Ví dụ: 120,000 VNĐ / vé"
          onChange={(price) => onChange('price', price)}
        />
        <PoiTextField
          label="Khung giờ mở cửa"
          icon="schedule"
          value={values.openingHours}
          placeholder="Ví dụ: 07:00 - 21:30 hàng ngày"
          onChange={(openingHours) => onChange('openingHours', openingHours)}
        />

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
            <span>Thời gian tham quan gợi ý cho AI Engine</span>
            <span className="text-label-sm font-bold text-primary">
              {values.aiRecommendedHours > 0
                ? `Khuyến nghị tối ưu: ${values.aiRecommendedHours}h`
                : 'AI sẽ phân tích sau khi lưu'}
            </span>
          </label>
          <div className="flex items-center gap-space-md">
            <input
              type="text"
              value={values.suggestedDuration}
              placeholder="Ví dụ: 3 - 4 giờ"
              onChange={(event) => onChange('suggestedDuration', event.target.value)}
              className={`${POI_INPUT_CLASS} max-w-[240px] px-space-md placeholder:text-outline`}
            />
            <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
              <Icon name="auto_awesome" className="text-[16px] text-tertiary" />
              <span>{values.aiDurationNote ?? DEFAULT_AI_NOTE}</span>
            </div>
          </div>
        </div>
      </div>
    </PoiSectionCard>
  );
}
