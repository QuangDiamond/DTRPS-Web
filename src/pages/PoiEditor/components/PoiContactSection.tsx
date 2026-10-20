import type { PoiFormValues } from '../../../types/admin';
import type { PoiFieldChange, PoiFormErrors } from '../poiFormUtils';
import PoiSectionCard from './PoiSectionCard';
import PoiTextField from './PoiTextField';

interface PoiContactSectionProps {
  values: PoiFormValues;
  errors: PoiFormErrors;
  onChange: PoiFieldChange;
}

export default function PoiContactSection({ values, errors, onChange }: PoiContactSectionProps) {
  return (
    <PoiSectionCard
      icon="apartment"
      title="3. Thông tin liên hệ & Đơn vị phụ trách"
      description="Đơn vị quản lý di tích, đường dây nóng phục vụ hỗ trợ du khách"
    >
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <PoiTextField
          className="md:col-span-2"
          label="Đơn vị quản lý chính thức"
          value={values.managingUnit}
          onChange={(managingUnit) => onChange('managingUnit', managingUnit)}
        />
        <PoiTextField
          label="Số điện thoại Hotline cứu hộ / hỗ trợ"
          icon="call"
          type="tel"
          value={values.hotline}
          error={errors.hotline}
          onChange={(hotline) => onChange('hotline', hotline)}
        />
        <PoiTextField
          label="Website chính thức"
          icon="language"
          type="url"
          value={values.website}
          placeholder="https://"
          error={errors.website}
          onChange={(website) => onChange('website', website)}
        />
        <PoiTextField
          className="md:col-span-2"
          label="Email tiếp nhận thông tin phản hồi"
          icon="mail"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(email) => onChange('email', email)}
        />
      </div>
    </PoiSectionCard>
  );
}
