import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { clientRequest, ClientApiError, errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type ItineraryOverview,
  type ItineraryOverviewDay,
  type ItineraryActivity,
  type PlanStatus,
  type TripFeedbackResponse,
} from '@/client/api/tripFlowApi';
import { placesApi } from '@/client/api/placesApi';
import { referenceApi } from '@/client/api/referenceApi';
import type { PlaceSummary } from '@/client/api/types';
import { CLIENT_ROUTES, itineraryDayPath } from '@/client/routePaths';
import { useClientAuth } from '@/client/auth/clientAuthContext';

import PageBar from '@/client/ui/PageBar';
import Avatar from '@/client/traveller/components/Avatar';
import TripFeedbackModal from '@/client/traveller/components/TripFeedbackModal';
import WeatherForecastStrip from '@/client/traveller/components/WeatherForecastStrip';

/** Thời gian chờ trước khi tự hiện modal đánh giá chuyến đi */
const FEEDBACK_PROMPT_DELAY_MS = 1_000;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

function formatMoney(value: number | null | undefined, currency: string) {
  if (value === null || value === undefined) {
    return 'Chưa ước tính';
  }

  return `${currencyFormatter.format(value)} ${currency}`;
}

function formatDate(value: string) {
  const parts = value?.split('-') ?? [];

  if (parts.length !== 3) {
    return value || 'Chưa cập nhật';
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : '--:--';
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  DRAFT: 'Bản nháp',
  PLANNED: 'Đã lên kế hoạch',
  IN_PROGRESS: 'Đang diễn ra',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#E2EAE8] bg-white p-4 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F1] text-[#087A78]">
        <Icon name={icon} className="text-[22px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#61757A]">{label}</p>
        <p className="mt-1 break-words text-base font-extrabold tracking-tight text-[#123D40] sm:text-lg">
          {value}
        </p>
      </div>
    </div>
  );
}

function BudgetCard({
                      total,
                      budget,
                      currency,
                    }: {
  total: number;
  budget: number | null | undefined;
  currency: string;
}) {
  const difference = budget == null ? null : budget - total;
  const percent = budget != null && budget > 0 ? (total / budget) * 100 : null;
  const overBudget = difference != null && difference < 0;
  return (
    <section className="rounded-[24px] border border-[#E2EAE8] bg-white p-5 shadow-[0_6px_24px_rgba(18,61,64,0.04)]">
      <div className="flex items-center gap-2 text-[#163D42]">
        <Icon name="account_balance_wallet" className="text-[22px] text-[#087A78]" />
        <h3 className="text-base font-extrabold">Ngân sách chuyến đi</h3>
      </div>
      <p className="mt-5 text-xs font-medium text-[#61757A]">Tổng chi phí dự kiến</p>
      <p className="mt-1 break-words text-2xl font-extrabold tracking-tight text-[#123D40]">
        {formatMoney(total, currency)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#61757A]">
        <span>Ngân sách kế hoạch</span>
        <strong className="text-right text-[#163D42]">{formatMoney(budget, currency)}</strong>
      </div>
      {percent !== null && (
        <div className="mt-3">
          <div
            className="h-2.5 overflow-hidden rounded-full bg-[#EAF1EF]"
            role="progressbar"
            aria-label="Tỷ lệ ngân sách dự kiến"
            aria-valuenow={Math.min(100, Math.max(0, percent))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${Math.round(percent)}% ngân sách`}
          >
            <div
              className={`h-full rounded-full transition-all ${overBudget ? 'bg-[#C66B42]' : 'bg-[#087A78]'}`}
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#61757A]">{Math.round(percent)}% ngân sách dự kiến</p>
        </div>
      )}
      {difference !== null && (
        <div
          className={`mt-4 rounded-2xl p-4 ${overBudget ? 'bg-[#FFF1EB] text-[#9A472D]' : 'bg-[#EDF8F3] text-[#086B5F]'}`}
        >
          <p className="text-xs font-semibold">
            {overBudget ? 'Vượt ngân sách dự kiến' : 'Còn lại so với ngân sách'}
          </p>
          <p className="mt-1 break-words text-lg font-extrabold">
            {formatMoney(Math.abs(difference), currency)}
          </p>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-[#61757A]">
        Chi phí chỉ là ước tính; có thể chưa bao gồm lưu trú, ăn uống, đi lại và các dịch vụ chưa có
        giá.
      </p>
    </section>
  );
}

// Hiển thị từng hoạt động theo timeline, không thay đổi dữ liệu Backend.
function DayCard({
                   day,
                   planId,
                   currency,
                   onEdit,
                 }: {
  day: ItineraryOverviewDay;
  planId: number;
  currency: string;
  onEdit?: (activity: ItineraryActivity, mode: EditMode) => void;
}) {
  const activities = [...day.activities].sort((a, b) => a.itemOrder - b.itemOrder);
  const detailUrl = `${itineraryDayPath(day.dayNumber)}?planId=${planId}`;
  return (
    <section
      id={`itinerary-day-${day.dayId}`}
      className="scroll-mt-24 overflow-hidden rounded-[24px] border border-[#E2EAE8] bg-white shadow-[0_6px_26px_rgba(18,61,64,0.04)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EFED] px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0B615F] text-white">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-[#C2EDE3]">
              Ngày
            </span>
            <span className="text-xl font-extrabold leading-6">
              {String(day.dayNumber).padStart(2, '0')}
            </span>
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-extrabold tracking-tight text-[#163D42]">
              {day.title || `Ngày ${day.dayNumber}`}
            </h3>
            <p className="mt-1 text-xs text-[#61757A]">
              {formatDate(day.visitDate)} · {activities.length} hoạt động
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#61757A]">Chi phí dự kiến</p>
          <p className="mt-1 text-sm font-extrabold text-[#087A78]">
            {formatMoney(day.estimatedCost, currency)}
          </p>
        </div>
      </header>
      {day.notes && (
        <p className="mx-5 mt-4 rounded-xl bg-[#F5F8F7] p-3 text-xs leading-5 text-[#506775] sm:mx-6">
          {day.notes}
        </p>
      )}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <Icon name="event_available" className="text-[34px] text-[#8DB4AE]" />
          <p className="text-sm font-bold text-[#163D42]">Chưa có hoạt động</p>
          <p className="text-xs text-[#61757A]">Ngày này chưa được sắp xếp địa điểm.</p>
        </div>
      ) : (
        <ol className="px-4 py-5 sm:px-6">
          {activities.map((activity, index) => (
            <li key={activity.itemId} className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4">
              {index < activities.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[15px] top-8 w-px bg-[#D4E9E3]"
                />
              )}
              <span className="relative z-[1] mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#CDE5DE] bg-[#EDF8F3] text-xs font-extrabold text-[#087A78] ring-4 ring-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {activity.travelTimeMinutes != null && activity.travelTimeMinutes > 0 && (
                  <p className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-[#61757A]">
                    <Icon name="directions_car" className="text-[17px] text-[#087A78]" />
                    <span>
                      Di chuyển ước tính · {activity.travelTimeMinutes} phút
                      {activity.transportModeName ? ` · ${activity.transportModeName}` : ''}
                    </span>
                  </p>
                )}
                <div className="rounded-2xl border border-[#E5EDEB] bg-[#FCFDFD] p-4 transition-colors hover:border-[#B4DBD1] sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E9F5F0] px-2.5 py-1.5 text-xs font-bold tabular-nums text-[#086B60]">
                      <Icon name="schedule" className="text-[16px]" />
                      {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
                    </span>
                    <span className="text-xs font-bold text-[#163D42]">
                      {formatMoney(activity.estimatedCost, currency)}
                    </span>
                  </div>
                  <h4 className="mt-3 break-words text-base font-extrabold leading-snug tracking-tight text-[#163D42] sm:text-lg">
                    {activity.placeName}
                  </h4>
                  {activity.placeAddress && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#61757A]">
                      <Icon
                        name="location_on"
                        className="mt-0.5 shrink-0 text-[17px] text-[#087A78]"
                      />
                      <span>{activity.placeAddress}</span>
                    </p>
                  )}
                  {activity.notes && (
                    <p className="mt-3 rounded-lg bg-[#F0F5F4] p-3 text-xs leading-5 text-[#506775]">
                      {activity.notes}
                    </p>
                  )}
                  {onEdit && activity.status === 'PLANNED' && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5EDEB] pt-3">
                      {(
                        [
                          { mode: 'time', icon: 'schedule', label: 'Đổi giờ' },
                          { mode: 'replace', icon: 'edit_location_alt', label: 'Thay địa điểm' },
                          { mode: 'swap', icon: 'swap_horiz', label: 'Hoán đổi' },
                        ] as const
                      ).map((action) => (
                        <button
                          key={action.mode}
                          type="button"
                          onClick={() => onEdit(activity, action.mode)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE9E5] bg-white px-3 py-2 text-xs font-semibold text-[#086B60] transition-colors hover:border-[#087A78] hover:bg-[#EAF7F3] focus-visible:outline-2 focus-visible:outline-[#087A78]"
                        >
                          <Icon name={action.icon} className="text-[17px]" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <footer className="border-t border-[#E9EFED] px-5 py-3 sm:px-6">
        <Link
          to={detailUrl}
          className="flex items-center justify-between rounded-xl bg-[#F0F7F4] px-4 py-3 text-sm font-bold text-[#086B60] transition-colors hover:bg-[#DDF2E9]"
        >
          <span className="flex items-center gap-2">
            <Icon name="map" className="text-[19px]" />
            Xem chi tiết ngày {day.dayNumber}
          </span>
          <Icon name="arrow_forward" className="text-[19px]" />
        </Link>
      </footer>
    </section>
  );
}

// Chỉnh sửa một hoạt động hoặc hoán đổi 2 khung giờ trong cùng lịch trình.
type EditMode = 'time' | 'replace' | 'swap';

function EditActivityModal({
                             overview,
                             activity,
                             day,
                             initialMode,
                             onClose,
                             onSaved,
                           }: {
  overview: ItineraryOverview;
  activity: ItineraryActivity;
  day: ItineraryOverviewDay;
  initialMode: EditMode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<EditMode>(initialMode);
  const [start, setStart] = useState(activity.startTime?.slice(0, 5) ?? '');
  const [end, setEnd] = useState(activity.endTime?.slice(0, 5) ?? '');
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState<string | null>(null);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [provinceError, setProvinceError] = useState('');
  const [results, setResults] = useState<PlaceSummary[]>([]);
  const [replacement, setReplacement] = useState<PlaceSummary | null>(null);
  const [swapId, setSwapId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const usedIds = useMemo(
    () => new Set(overview.days.flatMap((d) => d.activities.map((a) => a.placeId))),
    [overview],
  );
  const swapOptions = overview.days.flatMap((d) =>
    d.activities
      .filter((a) => a.itemId !== activity.itemId && a.status === 'PLANNED')
      .map((a) => ({ day: d, activity: a })),
  );
  const swapTarget = swapOptions.find((o) => String(o.activity.itemId) === swapId);

  useEffect(() => {
    let active = true;
    referenceApi
      .provinces()
      .then((list) => {
        if (!active) return;
        const destination = overview.destination.trim().toLocaleLowerCase('vi');
        const matched = list.find(
          (p) =>
            p.name.trim().toLocaleLowerCase('vi') === destination ||
            p.code.toLowerCase() === destination,
        );
        if (matched) setProvince(matched.code);
        else setProvinceError('Không xác định được mã tỉnh/thành của chuyến đi.');
      })
      .catch((e) => {
        if (active) setProvinceError(errorMessage(e));
      })
      .finally(() => {
        if (active) setProvinceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [overview.destination]);

  useEffect(() => {
    if (mode !== 'replace' || !province) return;
    let active = true;
    setSearchLoading(true);
    setSearchError('');
    setResults([]);
    const timer = window.setTimeout(() => {
      // Lấy hết mọi địa điểm phù hợp (không giới hạn số lượng), mỗi lần 100 điểm theo giới hạn trang của BE.
      const loadAll = async () => {
        const all: PlaceSummary[] = [];
        for (let page = 0; active; page += 1) {
          const result = await placesApi.list({ province, keyword: keyword.trim(), page, size: 100 });
          all.push(...result.items);
          if (result.items.length === 0 || all.length >= result.total) break;
        }
        return all;
      };
      loadAll()
        .then((items) => {
          if (active) setResults(items.filter((p) => !usedIds.has(p.id)));
        })
        .catch((e) => {
          if (active) setSearchError(errorMessage(e));
        })
        .finally(() => {
          if (active) setSearchLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [mode, province, keyword, usedIds]);

  async function save() {
    if (saving) return;
    setSaveError('');
    if (mode === 'swap' && !swapTarget) {
      setSaveError('Hãy chọn hoạt động cần hoán đổi.');
      return;
    }
    if (mode === 'replace' && !replacement) {
      setSaveError('Hãy chọn địa điểm thay thế.');
      return;
    }
    if (mode !== 'swap' && (!start || !end || start >= end)) {
      setSaveError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    setSaving(true);
    try {
      await clientRequest<void>(
        `/travel-plans/${overview.planId}/itineraries/active/edit-activity`,
        {
          method: 'PUT',
          body: {
            itineraryId: overview.itineraryId,
            itemId: activity.itemId,
            ...(mode === 'swap'
              ? { swapWithItemId: swapTarget!.activity.itemId }
              : {
                startTime: start + ':00',
                endTime: end + ':00',
                ...(mode === 'replace' ? { placeId: replacement!.id } : {}),
              }),
          },
        },
      );
      onSaved();
    } catch (e) {
      setSaveError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#092D32]/55 backdrop-blur-[3px] sm:items-center sm:p-5"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-activity-title"
        className="flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative shrink-0 overflow-hidden bg-[#104C4C] px-5 py-6 text-white sm:px-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[36px] border-white/5"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#C3EADD]">
                Ngày {day.dayNumber} · {formatDate(day.visitDate)}
              </p>
              <h2 id="edit-activity-title" className="mt-2 text-2xl font-extrabold tracking-tight">
                Chỉnh sửa hoạt động
              </h2>
              <p className="mt-2 break-words text-sm font-medium text-[#E0F3EE]">
                {activity.placeName}
              </p>
              <p className="mt-1 text-xs text-[#C3EADD]">
                {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <Icon name="close" className="text-[22px]" />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div
            className="grid grid-cols-3 gap-1 rounded-2xl bg-[#F0F5F3] p-1.5"
            role="group"
            aria-label="Cách chỉnh sửa"
          >
            {(
              [
                { id: 'time', label: 'Đổi giờ', icon: 'schedule' },
                { id: 'replace', label: 'Thay địa điểm', icon: 'place' },
                { id: 'swap', label: 'Hoán đổi', icon: 'swap_horiz' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={saving}
                aria-pressed={mode === option.id}
                onClick={() => {
                  setMode(option.id);
                  setSaveError('');
                }}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-bold transition-colors sm:flex-row sm:gap-2 ${mode === option.id ? 'bg-white text-[#087A78] shadow-sm ring-1 ring-[#D8E7E1]' : 'text-[#61757A] hover:bg-white/60'}`}
              >
                <Icon name={option.icon} className="text-[20px]" />
                {option.label}
              </button>
            ))}
          </div>
          {mode === 'replace' && (
            <div className="mt-6">
              <label htmlFor="replacement-search" className="text-sm font-extrabold text-[#163D42]">
                Tìm địa điểm tại {overview.destination}
              </label>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#DCE8E6] bg-[#F8FBFA] px-3 focus-within:ring-2 focus-within:ring-[#087A78]/25">
                <Icon name="search" className="text-[22px] text-[#087A78]" />
                <input
                  id="replacement-search"
                  value={keyword}
                  disabled={saving || !province}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên địa điểm..."
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#163D42] outline-none"
                />
              </div>
              {replacement && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#EDF8F3] p-3 text-sm font-semibold text-[#086B60]">
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Đã chọn: {replacement.name}</span>
                </div>
              )}
              {provinceError || searchError ? (
                <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {provinceError || searchError}
                </p>
              ) : provinceLoading || searchLoading ? (
                <p role="status" className="py-5 text-sm text-[#61757A]">
                  Đang tìm địa điểm...
                </p>
              ) : (
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                  {results.length === 0 && (
                    <p className="rounded-xl bg-[#F5F8F7] p-4 text-sm text-[#61757A]">
                      Không tìm thấy địa điểm khác. Thử nhập tên cụ thể.
                    </p>
                  )}
                  {results.map((place) => (
                    <button
                      type="button"
                      key={place.id}
                      disabled={saving}
                      aria-pressed={replacement?.id === place.id}
                      onClick={() => setReplacement(place)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${replacement?.id === place.id ? 'border-[#087A78] bg-[#EDF8F3]' : 'border-[#E5EDEB] hover:bg-[#F5F8F7]'}`}
                    >
                      {place.coverUrl ? (
                        <img
                          src={place.coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-14 w-[76px] shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-[76px] shrink-0 items-center justify-center rounded-lg bg-[#EDF8F3] text-[#087A78]">
                          <Icon name="place" className="text-[24px]" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[#163D42]">{place.name}</span>
                        <span className="mt-1 line-clamp-2 text-xs text-[#61757A]">
                          {place.address || overview.destination}
                        </span>
                      </span>
                      <Icon
                        name={
                          replacement?.id === place.id ? 'check_circle' : 'radio_button_unchecked'
                        }
                        className="shrink-0 text-[21px] text-[#087A78]"
                      />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-[#61757A]">
                Các địa điểm đã có trong lịch trình được ẩn khỏi kết quả thay thế.
              </p>
            </div>
          )}
          {mode !== 'swap' ? (
            <div className="mt-6">
              <h3 className="text-sm font-extrabold text-[#163D42]">Khung giờ tham quan</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="min-w-0 rounded-2xl border border-[#E2EAE8] bg-[#F8FBFA] p-3 text-xs font-semibold text-[#61757A]">
                  Giờ bắt đầu
                  <input
                    type="time"
                    required
                    value={start}
                    disabled={saving}
                    onChange={(e) => setStart(e.target.value)}
                    className="mt-2 block min-w-0 w-full rounded-lg border border-[#DCE8E6] bg-white px-2 py-3 text-base font-extrabold tabular-nums text-[#163D42] focus:outline-[#087A78]"
                  />
                </label>
                <label className="min-w-0 rounded-2xl border border-[#E2EAE8] bg-[#F8FBFA] p-3 text-xs font-semibold text-[#61757A]">
                  Giờ kết thúc
                  <input
                    type="time"
                    required
                    value={end}
                    disabled={saving}
                    onChange={(e) => setEnd(e.target.value)}
                    className="mt-2 block min-w-0 w-full rounded-lg border border-[#DCE8E6] bg-white px-2 py-3 text-base font-extrabold tabular-nums text-[#163D42] focus:outline-[#087A78]"
                  />
                </label>
              </div>
              {start && end && start < end && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#EDF8F3] p-3 text-sm font-semibold text-[#086B60]">
                  <Icon name="schedule" className="text-[18px]" />
                  Khung giờ mới: {start} – {end}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <label htmlFor="swap-activity" className="text-sm font-extrabold text-[#163D42]">
                Chọn địa điểm muốn đổi vị trí
              </label>
              <select
                id="swap-activity"
                value={swapId}
                disabled={saving}
                onChange={(e) => setSwapId(e.target.value)}
                className="mt-3 h-12 w-full rounded-xl border border-[#DCE8E6] bg-[#F8FBFA] px-3 text-sm text-[#163D42] focus:outline-[#087A78]"
              >
                <option value="">Chọn ngày và địa điểm...</option>
                {swapOptions.map((o) => (
                  <option key={o.activity.itemId} value={o.activity.itemId}>
                    Ngày {o.day.dayNumber} · {formatTime(o.activity.startTime)} ·{' '}
                    {o.activity.placeName}
                  </option>
                ))}
              </select>
              {!swapOptions.length && (
                <p className="mt-3 text-sm text-[#61757A]">Không có hoạt động khác để hoán đổi.</p>
              )}
              {swapTarget && (
                <div className="mt-4 rounded-2xl border border-[#DCE8E6] bg-[#F8FBFA] p-4">
                  <p className="mb-3 text-xs font-bold text-[#61757A]">VỊ TRÍ SAU KHI HOÁN ĐỔI</p>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold text-[#087A78]">
                      Ngày {day.dayNumber} · {formatTime(activity.startTime)} –{' '}
                      {formatTime(activity.endTime)}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#163D42]">
                      {swapTarget.activity.placeName}
                    </p>
                  </div>
                  <div className="flex justify-center py-2 text-[#087A78]">
                    <Icon name="swap_vert" className="text-[25px]" />
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold text-[#087A78]">
                      Ngày {swapTarget.day.dayNumber} · {formatTime(swapTarget.activity.startTime)}{' '}
                      – {formatTime(swapTarget.activity.endTime)}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#163D42]">
                      {activity.placeName}
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-[#61757A]">
                Hai địa điểm đổi vị trí nhưng giữ nguyên khung giờ. Hệ thống kiểm tra giờ mở cửa và
                thời gian di chuyển trước khi lưu.
              </p>
            </div>
          )}
          {saveError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700"
            >
              {saveError}
            </p>
          )}
        </div>
        <footer className="shrink-0 border-t border-[#E5EDEB] px-5 pb-5 pt-4 sm:px-7">
          <p className="mb-4 flex items-start gap-2 text-xs leading-5 text-[#61757A]">
            <Icon name="info" className="mt-0.5 shrink-0 text-[17px] text-[#087A78]" />
            Thay đổi được kiểm tra trước khi lưu. Chi phí và thời gian di chuyển sẽ được cập nhật
            theo dữ liệu hiện có.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-[#DCE8E6] px-5 py-3 text-sm font-bold text-[#506775] hover:bg-[#F5F8F7]"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={
                saving || (mode === 'replace' && !replacement) || (mode === 'swap' && !swapTarget)
              }
              onClick={() => void save()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B615F] px-4 py-3 text-sm font-bold text-white hover:bg-[#087A78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name={saving ? 'hourglass_empty' : 'check'} className="text-[20px]" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

// =============================================
// TRANG TỔNG QUAN LỊCH TRÌNH
// =============================================

/**
 * BƯỚC 6:
 *
 * Hiển thị lịch trình hoàn chỉnh
 * được Backend tự động sắp xếp.
 *
 * API đọc lịch trình:
 * GET /travel-plans/{planId}/itineraries/active/overview
 *
 * Chỉnh sửa qua PUT /travel-plans/{planId}/itineraries/active/edit-activity.
 * Không sử dụng dữ liệu mẫu.
 * Không dùng AI để xếp lịch.
 */
export default function ItineraryOverviewPage() {
  const { user } = useClientAuth();
  const [searchParams] = useSearchParams();

  // Cảnh báo trả về khi vừa tạo lịch trình (truyền từ màn Địa điểm đã chọn qua navigation state).
  const location = useLocation();
  const [creationWarnings, setCreationWarnings] = useState<string[]>(() => {
    const state = location.state as { itineraryWarnings?: unknown } | null;
    return Array.isArray(state?.itineraryWarnings)
      ? state.itineraryWarnings.filter((w): w is string => typeof w === 'string')
      : [];
  });

  const rawPlanId = searchParams.get('planId');

  const planId = rawPlanId === null ? NaN : Number(rawPlanId);

  const validPlanId = Number.isSafeInteger(planId) && planId > 0;

  const [overview, setOverview] = useState<ItineraryOverview | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [notFound, setNotFound] = useState(false);

  const [retryCount, setRetryCount] = useState(0);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [editTarget, setEditTarget] = useState<{
    day: ItineraryOverviewDay;
    activity: ItineraryActivity;
    mode: EditMode;
  } | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  useEffect(() => {
    setSavedNotice(false);
  }, [planId]);
  const canEdit = planStatus === 'DRAFT' || planStatus === 'PLANNED';

  useEffect(() => {
    setPlanStatus(null);
    setEditTarget(null);
    if (!validPlanId) return;
    let active = true;
    tripFlowApi
      .plan(planId)
      .then((plan) => {
        if (active) setPlanStatus(plan.status);
      })
      .catch(() => {
        if (active) setPlanStatus(null);
      });
    return () => {
      active = false;
    };
  }, [validPlanId, planId, retryCount]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [tripFeedback, setTripFeedback] = useState<TripFeedbackResponse | null>(null);

  const selectedUrl = validPlanId
    ? `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${planId}`
    : CLIENT_ROUTES.TRIP_PLAN;

  // =============================================
  // LẤY LỊCH TRÌNH THẬT TỪ BACKEND
  // =============================================

  useEffect(() => {
    if (!validPlanId) {
      setOverview(null);
      setLoading(false);
      setNotFound(false);
      setError('Thiếu mã kế hoạch hợp lệ. Hãy mở lịch trình từ chuyến đi của bạn.');
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setNotFound(false);
    setOverview(null);

    tripFlowApi
      .overview(planId)
      .then((data) => {
        if (active) {
          setOverview(data);
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;

        if (caught instanceof ClientApiError && caught.status === 404) {
          setNotFound(true);
        } else {
          setError(errorMessage(caught));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [planId, validPlanId, retryCount]);

  // =============================================
  // TỰ ĐỘNG HIỆN MODAL ĐÁNH GIÁ CHUYẾN ĐI
  //
  // Chỉ khi kế hoạch COMPLETED và khách chưa đánh
  // giá kế hoạch này (mỗi khách 1 lần/kế hoạch).
  // =============================================

  useEffect(() => {
    if (!overview || !validPlanId) return;

    let active = true;
    let timer: number | undefined;

    Promise.all([
      tripFlowApi.plan(planId),
      tripFlowApi.feedback(planId).then(
        (result) => result,
        (caught: unknown) => {
          if (caught instanceof ClientApiError && caught.status === 404) {
            return null;
          }
          throw caught;
        },
      ),
    ])
      .then(([plan, feedback]) => {
        if (!active) return;

        setTripFeedback(feedback);

        if (feedback || plan.status !== 'COMPLETED') {
          return;
        }

        timer = window.setTimeout(() => {
          if (active) setShowFeedbackModal(true);
        }, FEEDBACK_PROMPT_DELAY_MS);
      })
      .catch(() => {
        // Không chặn trang nếu kiểm tra đánh giá lỗi
      });

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [overview, planId, validPlanId]);

  // =============================================
  // TỔNG HỢP THÔNG TIN HIỂN THỊ
  // =============================================

  const days = useMemo(
    () => [...(overview?.days ?? [])].sort((a, b) => a.dayNumber - b.dayNumber),
    [overview],
  );

  const totalActivities = useMemo(
    () => days.reduce((sum, day) => sum + day.activities.length, 0),
    [days],
  );

  const totalCost = overview?.totalEstimatedCost ?? 0;

  const budget = overview?.budget;

  const currency = overview?.currency ?? 'VND';

  return (
    <div className="mx-auto max-w-[1240px] pb-28 md:pb-8">
      {/* HEADER */}
      <PageBar
        title="Lịch trình của bạn"
        subtitle={overview?.destination}
        backTo={selectedUrl}
        actions={
          overview ? (
            <Link
              to={CLIENT_ROUTES.TRIPS}
              className="rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#075C66]"
            >
              Chuyến đi của tôi
            </Link>
          ) : undefined
        }
      />

      {/* CẢNH BÁO KHI TẠO LỊCH TRÌNH: không chặn, chỉ nhắc người dùng kiểm tra lại */}
      {creationWarnings.length > 0 && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900"
        >
          <Icon name="warning" className="mt-0.5 text-[20px] text-amber-600" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-extrabold">Lịch trình đã được tạo, nhưng có vài điểm cần lưu ý</p>
            {creationWarnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCreationWarnings([])}
            aria-label="Đóng cảnh báo"
            className="rounded-full p-1 text-amber-700 hover:bg-amber-100"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      {/* ĐANG TẢI */}
      {loading && (
        <div role="status" className="rounded-[20px] bg-white p-9 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />

          <p className="mt-3 text-[13px] font-semibold text-[#087A78]">Đang tải lịch trình ...</p>
        </div>
      )}

      {/* LỖI HOẶC CHƯA CÓ LỊCH TRÌNH */}
      {!loading && (error || notFound) && (
        <div className="flex flex-col items-center rounded-[20px] bg-white px-5 py-10 text-center">
          <Icon name="event_note" className="text-[42px] text-[#94B5B6]" />

          <h2 className="mt-3 text-[16px] font-extrabold text-[#13364A]">
            {notFound ? 'Chưa tìm thấy lịch trình đã tạo' : 'Không thể tải lịch trình'}
          </h2>

          <p role="alert" className="mt-2 max-w-md text-[12px] leading-5 text-[#72818C]">
            {notFound
              ? 'Kế hoạch này chưa có lịch trình ACTIVE, hoặc lịch trình không thể truy cập. Hãy kiểm tra địa điểm đã chọn và tạo lịch trình.'
              : error}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {validPlanId && (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="rounded-full bg-[#E2FAF5] px-5 py-2.5 text-[12px] font-bold text-[#075C66]"
              >
                Thử tải lại
              </button>
            )}

            <Link
              to={selectedUrl}
              className="rounded-full bg-[#075C66] px-5 py-2.5 text-[12px] font-bold text-white"
            >
              {validPlanId ? 'Xem địa điểm đã chọn' : 'Tạo kế hoạch'}
            </Link>
          </div>
        </div>
      )}

      {/* LỊCH TRÌNH BACKEND TRẢ VỀ */}
      {!loading && !error && !notFound && overview && (
        <>
          <section className="relative overflow-hidden rounded-[28px] bg-[#104C4C] px-6 py-8 text-white shadow-[0_12px_30px_rgba(16,76,76,0.12)] sm:px-9 sm:py-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#104C4C] via-[#125E5B] to-[#168579]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full border-[60px] border-white/[0.06]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-40 right-24 h-[330px] w-[330px] rounded-full border-[46px] border-white/[0.06]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-0 max-w-2xl">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#BEE9DF]">
                  <Icon name="route" className="text-[20px]" />
                  HÀNH TRÌNH CỦA BẠN
                </p>
                <h2 className="mt-3 break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-[38px]">
                  {overview.itineraryTitle}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#E0F3EE]">
                  <span className="flex items-center gap-1.5">
                    <Icon name="location_on" className="text-[18px]" />
                    {overview.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="calendar_month" className="text-[18px]" />
                    {formatDate(overview.startDate)} – {formatDate(overview.endDate)}
                  </span>
                </div>
                {overview.itineraryNotes && (
                  <p className="mt-4 text-sm leading-6 text-[#D5EEE8]">{overview.itineraryNotes}</p>
                )}
              </div>
              <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D4EFE6]">
                  <Icon name="event_available" className="text-[18px]" />
                  {planStatus ? STATUS_LABELS[planStatus] : 'Lịch trình của bạn'}
                </p>
                <p className="mt-1 text-xs text-[#C3E8DF]">Phiên bản {overview.versionNumber}</p>
              </div>
            </div>
          </section>

          <WeatherForecastStrip itineraryId={overview.itineraryId} />

          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4">
            <SummaryCard icon="calendar_month" label="Thời lượng" value={`${days.length} ngày`} />
            <SummaryCard icon="place" label="Hoạt động" value={`${totalActivities} địa điểm`} />
            <SummaryCard
              icon="account_balance_wallet"
              label="Chi phí dự kiến"
              value={formatMoney(totalCost, currency)}
            />
            <SummaryCard icon="savings" label="Ngân sách" value={formatMoney(budget, currency)} />
          </div>

          <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px] xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="order-2 min-w-0 lg:order-1">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#163D42]">
                    Lịch trình từng ngày
                  </h2>
                  <p className="mt-1 text-sm text-[#61757A]">
                    {canEdit && overview.status === 'ACTIVE'
                      ? 'Tùy chỉnh từng điểm dừng theo cách của bạn.'
                      : 'Theo dõi các điểm dừng trong hành trình.'}
                  </p>
                </div>
                <Link
                  to={selectedUrl}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#DCE8E6] bg-white px-3 py-2 text-xs font-bold text-[#086B60] hover:bg-[#EDF8F3]"
                >
                  <Icon name="format_list_bulleted" className="text-[18px]" />
                  Địa điểm đã chọn
                </Link>
              </div>
              {days.length > 0 && (
                <nav
                  aria-label="Đi nhanh tới ngày"
                  className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden"
                >
                  {days.map((day) => (
                    <button
                      key={day.dayId}
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(`itinerary-day-${day.dayId}`)
                          ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                      }
                      className="shrink-0 rounded-xl border border-[#DCE8E6] bg-white px-4 py-2 text-xs font-bold text-[#086B60] hover:bg-[#EDF8F3]"
                    >
                      Ngày {day.dayNumber}
                    </button>
                  ))}
                </nav>
              )}
              {savedNotice && (
                <p
                  role="status"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-[#C8E5DC] bg-[#EDF8F3] p-4 text-sm font-semibold text-[#086B60]"
                >
                  <Icon name="check_circle" className="text-[20px]" />
                  Đã lưu thay đổi lịch trình.
                </p>
              )}
              {days.length === 0 ? (
                <div className="rounded-[24px] border border-[#E2EAE8] bg-white p-8 text-center text-sm text-[#61757A]">
                  Lịch trình chưa có ngày hoặc hoạt động nào.
                </div>
              ) : (
                <div className="grid gap-5">
                  {days.map((day) => (
                    <DayCard
                      key={day.dayId}
                      day={day}
                      planId={overview.planId}
                      currency={currency}
                      onEdit={
                        canEdit && overview.status === 'ACTIVE'
                          ? (activity, mode) => setEditTarget({ day, activity, mode })
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            <aside className="order-1 grid min-w-0 gap-4 lg:sticky lg:top-20 lg:order-2">
              <BudgetCard total={totalCost} budget={budget} currency={currency} />
              {days.length > 0 && (
                <section className="hidden rounded-[24px] border border-[#E2EAE8] bg-white p-5 lg:block">
                  <h3 className="text-sm font-extrabold text-[#163D42]">
                    Các ngày trong chuyến đi
                  </h3>
                  <nav
                    aria-label="Danh sách ngày"
                    className="mt-3 max-h-52 space-y-1 overflow-y-auto"
                  >
                    {days.map((day) => (
                      <button
                        key={day.dayId}
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(`itinerary-day-${day.dayId}`)
                            ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                        }
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-[#F0F7F4] focus-visible:outline-[#087A78]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF8F3] text-sm font-extrabold text-[#087A78]">
                          {day.dayNumber}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-[#163D42]">
                            {day.title || `Ngày ${day.dayNumber}`}
                          </span>
                          <span className="mt-1 block text-xs text-[#61757A]">
                            {day.activities.length} hoạt động · {formatDate(day.visitDate)}
                          </span>
                        </span>
                        <Icon
                          name="chevron_right"
                          className="shrink-0 text-[19px] text-[#087A78]"
                        />
                      </button>
                    ))}
                  </nav>
                </section>
              )}
              <div className="flex items-start gap-3 rounded-2xl border border-[#E2EAE8] bg-[#F5F9F7] p-4 text-xs leading-5 text-[#61757A]">
                <Icon name="info" className="mt-0.5 shrink-0 text-[20px] text-[#087A78]" />
                <p>
                  Lịch trình được sắp xếp bằng thuật toán, không phải AI. Thời gian di chuyển là ước
                  lượng.{' '}
                  {canEdit && overview.status === 'ACTIVE'
                    ? 'Bạn có thể đổi giờ, thay địa điểm hoặc hoán đổi các hoạt động trước khi khởi hành.'
                    : 'Chỉnh sửa chỉ khả dụng trước khi chuyến đi bắt đầu.'}
                </p>
              </div>
            </aside>
          </div>

          {/* ĐÁNH GIÁ CỦA BẠN */}
          {tripFeedback && (
            <div className="mt-6 rounded-[24px] border border-[#E2EAE8] bg-white p-5 shadow-[0_6px_24px_rgba(18,61,64,0.04)]">
              <div className="flex items-center gap-2.5">
                <Avatar url={user?.avatarUrl} size={36} iconSize={21} />

                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[#13364A]">
                  {user?.name ?? 'Bạn'}
                </span>

                <span className="flex shrink-0" aria-label={`${tripFeedback.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Icon
                      key={value}
                      name="star"
                      filled={value <= tripFeedback.rating}
                      className="text-[16px] text-[#F2B01E]"
                    />
                  ))}
                </span>
              </div>

              <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold text-[#087A78]">
                <Icon name="verified" filled className="text-[15px]" />
                Đánh giá của bạn
              </p>

              {tripFeedback.comment && (
                <p className="mt-2 text-[12px] leading-5 text-[#506775]">
                  “{tripFeedback.comment}”
                </p>
              )}
            </div>
          )}
        </>
      )}

      {editTarget && overview && canEdit && (
        <EditActivityModal
          overview={overview}
          day={editTarget.day}
          activity={editTarget.activity}
          initialMode={editTarget.mode}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            setSavedNotice(true);
            setRetryCount((count) => count + 1);
          }}
        />
      )}

      {/* MODAL ĐÁNH GIÁ CHUYẾN ĐI */}
      {showFeedbackModal && validPlanId && (
        <TripFeedbackModal
          planId={planId}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitted={(feedback: TripFeedbackResponse) => setTripFeedback(feedback)}
        />
      )}
    </div>
  );
}
