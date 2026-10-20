import Icon from '../../../components/common/Icon';
import type { Listing, ListingChecklistItem, ListingDetail } from '../../../types/admin';
import { REVIEW_CARD_CLASS } from './ReviewSection';

interface PartnerChecklistCardProps {
  listing: Listing;
  detail: ListingDetail;
  checklist: ListingChecklistItem[];
  editable: boolean;
  onToggleCheck: (id: string) => void;
}

export default function PartnerChecklistCard({
  listing,
  detail,
  checklist,
  editable,
  onToggleCheck,
}: PartnerChecklistCardProps) {
  const { partner } = detail;
  const passedCount = checklist.filter((item) => item.passed).length;
  const allPassed = passedCount === checklist.length;

  const stats = [
    { value: partner.yearsActive, label: 'Hoạt động', className: 'text-slate-900' },
    { value: `${partner.approvedCount} POI`, label: 'Đã duyệt', className: 'text-primary' },
    { value: partner.responseRate, label: 'Phản hồi', className: 'text-emerald-700' },
  ];

  return (
    <div className={REVIEW_CARD_CLASS}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11px] font-extrabold tracking-wider text-slate-600 uppercase">
          Đơn vị gửi hồ sơ
        </span>
        {partner.verified ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            Đối tác đã xác thực
          </span>
        ) : (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            Đối tác mới
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Icon name="business" className="text-[26px]" />
          </div>
          <div>
            <h3 className="text-[15px] leading-snug font-bold text-slate-900">
              {listing.partnerName}
            </h3>
            <p className="text-[12px] font-medium text-slate-600">
              {partner.code} • Đại diện:{' '}
              <strong className="text-slate-800">{partner.representative}</strong>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[10.5px] font-bold text-slate-600 uppercase">
            Hotline đối tác
          </span>
          <span className="block font-mono text-[12.5px] font-bold text-primary">
            {partner.hotline}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-3 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
            <div className={`truncate text-[15px] font-bold ${stat.className}`}>{stat.value}</div>
            <div className="text-[10.5px] font-medium text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Checklist kiểm định */}
      <div className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="fact_check" className="text-[19px] text-primary" />
            <h4 className="text-[13px] font-bold text-slate-900">Checklist kiểm định chuẩn</h4>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
              allPassed
                ? 'border-teal-200 bg-teal-100 text-teal-900'
                : 'border-amber-200 bg-amber-100 text-amber-900'
            }`}
          >
            {passedCount} / {checklist.length} Đạt chuẩn
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!editable}
              onClick={() => onToggleCheck(item.id)}
              title={editable ? 'Bấm để đánh dấu đạt / chưa đạt' : undefined}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors disabled:cursor-default ${
                item.passed
                  ? 'border-emerald-200/70 bg-emerald-50/70'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon
                name={item.passed ? 'check_circle' : 'radio_button_unchecked'}
                filled={item.passed}
                className={`shrink-0 text-[18px] ${item.passed ? 'text-emerald-600' : 'text-slate-400'}`}
              />
              <span className="truncate font-semibold text-slate-800">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
