import Icon from '../../../components/common/Icon';
import type { ListingDetail, ListingFact } from '../../../types/admin';
import ReviewSection, { FieldLabel } from './ReviewSection';

const FACT_TONE_CLASS: Record<ListingFact['tone'], string> = {
  teal: 'border-primary-fixed bg-primary-fixed/40 text-primary',
  amber: 'border-tertiary-fixed bg-tertiary-fixed/60 text-on-tertiary-fixed',
};

export default function BusinessInfoSection({ detail }: { detail: ListingDetail }) {
  const { business } = detail;
  const isEmpty = business.facts.length === 0 && business.amenities.length === 0;

  return (
    <ReviewSection
      number="04"
      title="Thông tin kinh doanh chuyên sâu"
      subtitle="Quy mô cơ sở lưu trú, tiện nghi và chính sách phòng"
      badge={
        <span className="rounded-full border border-surface-container-high bg-surface-container px-3 py-1 text-[11.5px] font-bold text-on-surface">
          {business.scaleBadge}
        </span>
      }
    >
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-outline-variant py-8 text-outline">
          <Icon name="inventory_2" className="text-[30px]" />
          <span className="text-[12.5px] font-medium">
            Đối tác chưa khai báo thông tin kinh doanh chi tiết
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {business.facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-center gap-3.5 rounded-xl border border-surface-container-high/80 bg-surface-container-low p-3.5"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${FACT_TONE_CLASS[fact.tone]}`}
              >
                <Icon name={fact.icon} className="text-[24px]" />
              </div>
              <div>
                <div className="text-[10.5px] font-bold tracking-wider text-on-surface-variant uppercase">
                  {fact.label}
                </div>
                <div className="text-[14px] font-extrabold text-on-surface">{fact.value}</div>
                <div className="text-[11.5px] text-on-surface-variant">{fact.note}</div>
              </div>
            </div>
          ))}

          {business.amenities.length > 0 && (
            <div className="md:col-span-2">
              <FieldLabel>Hệ thống tiện ích phục vụ khách du lịch</FieldLabel>
              <div className="flex flex-wrap gap-2.5">
                {business.amenities.map((amenity) => (
                  <span
                    key={amenity.label}
                    className="flex items-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-low px-3.5 py-2 text-[12.5px] font-semibold text-on-surface"
                  >
                    <Icon name={amenity.icon} className="text-[19px] text-primary" />
                    {amenity.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {business.policyNote && (
            <div className="rounded-xl border border-surface-container-high/80 bg-surface-container-low p-3.5 md:col-span-2">
              <div className="mb-1 text-[12px] font-bold text-on-surface">
                {business.policyNote.title}
              </div>
              <p className="text-[12px] leading-relaxed text-on-surface-variant">
                {business.policyNote.text}
              </p>
            </div>
          )}
        </div>
      )}
    </ReviewSection>
  );
}
