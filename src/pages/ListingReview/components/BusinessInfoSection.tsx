import Icon from '../../../components/common/Icon';
import type { ListingDetail, ListingFact } from '../../../types/admin';
import ReviewSection, { FieldLabel } from './ReviewSection';

const FACT_TONE_CLASS: Record<ListingFact['tone'], string> = {
  teal: 'border-teal-200 bg-teal-100/70 text-primary',
  amber: 'border-amber-200 bg-amber-100/70 text-amber-900',
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
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11.5px] font-bold text-slate-800">
          {business.scaleBadge}
        </span>
      }
    >
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-8 text-slate-500">
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
              className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${FACT_TONE_CLASS[fact.tone]}`}
              >
                <Icon name={fact.icon} className="text-[24px]" />
              </div>
              <div>
                <div className="text-[10.5px] font-bold tracking-wider text-slate-600 uppercase">
                  {fact.label}
                </div>
                <div className="text-[14px] font-extrabold text-slate-900">{fact.value}</div>
                <div className="text-[11.5px] text-slate-600">{fact.note}</div>
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
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12.5px] font-semibold text-slate-800"
                  >
                    <Icon name={amenity.icon} className="text-[19px] text-primary" />
                    {amenity.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {business.policyNote && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 md:col-span-2">
              <div className="mb-1 text-[12px] font-bold text-slate-900">
                {business.policyNote.title}
              </div>
              <p className="text-[12px] leading-relaxed text-slate-700">
                {business.policyNote.text}
              </p>
            </div>
          )}
        </div>
      )}
    </ReviewSection>
  );
}
