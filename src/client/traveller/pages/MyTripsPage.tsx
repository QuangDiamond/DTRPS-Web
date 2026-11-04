import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/common';
import { addLocationPath, CLIENT_ROUTES } from '@/client/routePaths';
import type { Trip } from '@/client/traveller/data/trips';
import { useTraveller } from '@/client/traveller/travellerContext';
import { ConfirmDialog, Dialog, NoticeToast } from '@/client/ui/Overlay';
import { routeNotice, useNotice } from '@/client/ui/useNotice';

type TripFilter = 'upcoming' | 'completed';

const FILTERS: { id: TripFilter; label: string }[] = [
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Đã đi' },
];

const matchFilter = (trip: Trip, filter: TripFilter) =>
  filter === 'upcoming'
    ? trip.status === 'upcoming' || trip.status === 'planned' || trip.status === 'draft'
    : trip.status === 'completed';

const CHIPS: Record<Trip['status'], { icon: string; className: string }> = {
  upcoming: { icon: 'circle', className: 'bg-[#D7FBF3] text-[#06695F]' },
  planned: { icon: 'calendar_today', className: 'bg-white text-[#13364A]' },
  draft: { icon: 'edit', className: 'bg-[#FFE8C7] text-[#8A4B00]' },
  saved: { icon: 'bookmark', className: 'bg-white text-[#087A78]' },
  completed: { icon: 'check_circle', className: 'bg-[#E3F6E5] text-[#23793A]' },
};

function TripImage({ trip, height, onMore }: { trip: Trip; height: string; onMore: () => void }) {
  const chip = CHIPS[trip.status];
  return (
    <div className={`relative overflow-hidden rounded-[18px] ${height}`}>
      <img src={trip.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/5 to-black/65 p-3">
        <div className="flex items-start justify-between">
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${chip.className}`}
          >
            <Icon
              name={chip.icon}
              filled={trip.status === 'upcoming'}
              className={trip.status === 'upcoming' ? 'text-[8px]' : 'text-[13px]'}
            />
            {trip.statusLabel}
          </span>
          <button
            type="button"
            onClick={onMore}
            aria-label="Tùy chọn chuyến đi"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <Icon name="more_vert" className="text-[18px]" />
          </button>
        </div>
        <div>
          <p className="line-clamp-2 text-[17px] font-extrabold text-white">{trip.title}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white">
            <Icon name="location_on" filled className="text-[14px]" />
            {trip.location} • {trip.duration}
          </p>
        </div>
      </div>
    </div>
  );
}

function IconText({ icon, text, bold }: { icon: string; text: string; bold?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#13364A]">
      <Icon name={icon} className="text-[16px] text-[#72818C]" />
      <span className={bold ? 'font-extrabold' : 'font-medium'}>{text}</span>
    </span>
  );
}

function EditButton({ tripId }: { tripId: string }) {
  return (
    <Link
      to={addLocationPath(tripId)}
      aria-label="Chỉnh sửa chuyến đi"
      className="ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBEDFF] text-[#075C66]"
    >
      <Icon name="edit" className="text-[19px]" />
    </Link>
  );
}

function TripCard({ trip, onMore }: { trip: Trip; onMore: () => void }) {
  if (trip.status === 'upcoming') {
    return (
      <div className="rounded-[22px] bg-white p-2.5">
        <TripImage trip={trip} height="h-[170px]" onMore={onMore} />
        <div className="px-1.5 pt-3">
          <div className="flex rounded-2xl bg-[#F3F4FF] px-3 py-2.5">
            {[
              { icon: 'date_range', label: 'Thời gian', value: trip.dateRange },
              { icon: 'groups', label: 'Khách đi', value: trip.guests },
            ].map((item) => (
              <div key={item.label} className="flex flex-1 items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C3F8F0] text-[#087A78]">
                  <Icon name={item.icon} className="text-[17px]" />
                </span>
                <span>
                  <span className="block text-[10px] text-[#72818C]">{item.label}</span>
                  <span className="block text-[12px] font-bold text-[#13364A]">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
          {trip.budget && (
            <div className="mt-3">
              <IconText icon="payments" text={`Dự toán: ${trip.budget}`} bold />
            </div>
          )}
          <div className="mt-2 flex flex-wrap justify-between gap-2">
            <IconText icon="route" text={`${trip.placeCount} địa điểm trong lịch`} />
            {Boolean(trip.hotelBooked) && (
              <IconText icon="bed" text={`Đã đặt ${trip.hotelBooked} khách sạn`} />
            )}
          </div>
          <div className="mt-3.5 mb-1 flex items-center">
            <Link
              to={CLIENT_ROUTES.ITINERARY}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#075C66] text-[13px] font-bold text-white hover:bg-primary"
            >
              Xem chi tiết lịch trình <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
            <EditButton tripId={trip.id} />
          </div>
        </div>
      </div>
    );
  }

  if (trip.status === 'draft') {
    return (
      <div className="rounded-[22px] bg-white p-2.5">
        <TripImage trip={trip} height="h-[135px]" onMore={onMore} />
        <div className="px-1.5 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <IconText icon="calendar_today" text={`${trip.dateRange ?? ''} • ${trip.guests}`} />
            <span className="rounded-full bg-[#EBEDFF] px-2.5 py-1 text-[10px] font-bold text-[#445577]">
              {trip.placeCount} địa điểm đã chọn
            </span>
          </div>
          <Link
            to={addLocationPath(trip.id)}
            className="mt-3 mb-1 flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#EBEDFF] text-[13px] font-bold text-[#075C66]"
          >
            <Icon name="edit_document" className="text-[18px]" />
            Tiếp tục chỉnh sửa
          </Link>
        </div>
      </div>
    );
  }

  const completed = trip.status === 'completed';
  return (
    <div className="rounded-[22px] bg-white p-2.5">
      <TripImage trip={trip} height="h-[145px]" onMore={onMore} />
      <div className="px-1.5 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <IconText
            icon={completed ? 'event_available' : 'groups'}
            text={completed ? (trip.dateRange ?? '') : trip.guests}
          />
          {trip.budget && <IconText icon="payments" text={trip.budget} bold />}
        </div>
        <div className="mt-3 mb-1 flex items-center">
          <Link
            to={CLIENT_ROUTES.ITINERARY}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#9EF0E2] text-[13px] font-bold text-[#075C66]"
          >
            {completed ? 'Xem lại hành trình' : 'Xem chi tiết'}
            <Icon name="chevron_right" className="text-[18px]" />
          </Link>
          {!completed && <EditButton tripId={trip.id} />}
        </div>
      </div>
    </div>
  );
}

/** Chuyến đi của tôi — theo MyTripsScreen của mobile (dữ liệu lưu trên trình duyệt) */
export default function MyTripsPage() {
  const { trips, removeTrip } = useTraveller();
  const [filter, setFilter] = useState<TripFilter>('upcoming');
  const [menuTrip, setMenuTrip] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState<Trip | null>(null);
  const location = useLocation();
  const [notice, showNotice] = useNotice(routeNotice(location.state));

  const counts = {
    // Bản nháp không tính vào số chuyến sắp tới
    upcoming: trips.filter((trip) => trip.status === 'upcoming' || trip.status === 'planned')
      .length,
    completed: trips.filter((trip) => trip.status === 'completed').length,
  };
  const visibleTrips = trips.filter((trip) => matchFilter(trip, filter));

  const share = async (trip: Trip) => {
    const text = `${trip.title} • ${trip.location} • ${trip.duration}\nSmartTravel - Lịch trình du lịch`;
    try {
      if (navigator.share) await navigator.share({ title: trip.title, text });
      else {
        await navigator.clipboard.writeText(text);
        showNotice('Đã sao chép thông tin chuyến đi.');
      }
    } catch {
      // Người dùng huỷ chia sẻ
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-extrabold text-[#13364A]">Chuyến đi của tôi</h1>
          <p className="mt-0.5 text-[12px] text-[#72818C]">
            Sẵn sàng cho những hành trình đáng nhớ
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN}
          aria-label="Tạo chuyến đi mới"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#075C66] text-white hover:bg-primary"
        >
          <Icon name="add" className="text-[26px]" />
        </Link>
      </div>

      <div className="mt-4 flex rounded-full bg-[#EBEDFF] p-1 md:max-w-md" role="tablist">
        {FILTERS.map((item) => {
          const selected = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(item.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-bold ${
                selected ? 'bg-white text-[#075C66]' : 'text-[#72818C]'
              }`}
            >
              {item.label}
              <span
                className={`min-w-[20px] rounded-full px-1.5 text-[11px] ${
                  selected ? 'bg-[#C3F8F0] text-[#075C66]' : 'bg-[#DCDFF5]'
                }`}
              >
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {visibleTrips.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visibleTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onMore={() => setMenuTrip(trip)} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-[22px] bg-white px-6 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C3F8F0] text-[#087A78]">
            <Icon name="luggage" className="text-[30px]" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-[#13364A]">
            {filter === 'upcoming'
              ? 'Bạn chưa có chuyến đi nào sắp tới.'
              : 'Bạn chưa hoàn thành chuyến đi nào.'}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-linear-to-br from-[#E2FCF8] to-[#EEF0FF] p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-[#13364A]">Bạn có dự định mới?</p>
          <p className="mt-0.5 text-[11px] text-[#5D7782]">
            Khám phá thêm điểm đến mới hoặc lên kế hoạch chuyến đi tiếp theo của bạn.
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN}
          className="flex items-center gap-1 rounded-full bg-[#075C66] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-primary"
        >
          Lên lịch mới <Icon name="add" className="text-[16px]" />
        </Link>
      </div>

      {menuTrip && (
        <Dialog label={menuTrip.title} onClose={() => setMenuTrip(null)} className="max-w-sm">
          <div className="p-5">
            <p className="text-[16px] font-extrabold text-client-ink">{menuTrip.title}</p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  void share(menuTrip);
                  setMenuTrip(null);
                }}
                className="flex h-11 items-center gap-2 rounded-2xl bg-client-soft px-4 text-[13px] font-bold text-client-ink"
              >
                <Icon name="share" className="text-[19px] text-primary" /> Chia sẻ
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleting(menuTrip);
                  setMenuTrip(null);
                }}
                className="flex h-11 items-center gap-2 rounded-2xl bg-[#FCE4E3] px-4 text-[13px] font-bold text-[#AD3232]"
              >
                <Icon name="delete" className="text-[19px]" /> Xoá chuyến đi
              </button>
              <button
                type="button"
                onClick={() => setMenuTrip(null)}
                className="h-11 rounded-2xl text-[13px] font-semibold text-client-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="Xoá chuyến đi"
          message={`Bạn chắc chắn muốn xoá "${deleting.title}"?`}
          confirmLabel="Xoá"
          danger
          onConfirm={() => removeTrip(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
      <NoticeToast message={notice} />
    </div>
  );
}
