import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  formatDistance,
  NEARBY_CATEGORIES,
  NEARBY_PLACES,
  type NearbyCategory,
  type NearbyPlace,
} from '@/client/traveller/data/nearbyPlaces';
import { normalizeText } from '@/client/traveller/data/places';
import { useTraveller } from '@/client/traveller/travellerContext';
import { ConfirmDialog } from '@/client/ui/Overlay';
import PageBar from '@/client/ui/PageBar';

type TimeSlotId = 'morning' | 'afternoon' | 'evening';

const TIME_SLOTS: { id: TimeSlotId; label: string; time: string }[] = [
  { id: 'morning', label: 'Sáng', time: '09:00' },
  { id: 'afternoon', label: 'Chiều', time: '14:00 (Sau bữa trưa)' },
  { id: 'evening', label: 'Tối', time: '19:00 (Sau bữa tối)' },
];

function NearbyPlaceCard({
  place,
  day,
  added,
  onToggle,
}: {
  place: NearbyPlace;
  day: number;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-white">
      <div className="relative h-[150px]">
        <img src={place.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-2.5 top-2.5 flex justify-between">
          <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white">
            <Icon name="navigation" filled className="text-[13px]" />
            Cách {formatDistance(place.distance)}
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#13364A]">
            <Icon name="star" filled className="text-[13px] text-[#E0A100]" />
            {place.rating}
            <span className="font-normal text-[#72818C]">({place.reviews})</span>
          </span>
        </div>
      </div>
      <div className="px-4 pt-3 pb-4">
        <p className="line-clamp-2 text-[15px] font-extrabold text-[#13364A]">{place.name}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1 text-[11px] text-[#72818C]">
          <Icon name={place.categoryIcon} className="text-[15px]" />
          {place.categoryLabel}
          <Icon name="schedule" className="ml-2 text-[14px]" />
          {place.duration}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#087A78]">
          <Icon name="confirmation_number" className="text-[15px]" />
          {place.price}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <p className="line-clamp-2 min-w-0 flex-1 text-[11px] text-[#72818C] italic">
            {place.note}
          </p>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={added}
            className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-4 text-[12px] font-bold ${
              added ? 'bg-[#C3F8F0] text-[#075C66]' : 'bg-[#075C66] text-white hover:bg-primary'
            }`}
          >
            <Icon name={added ? 'check' : 'add'} className="text-[17px]" />
            {added ? 'Đã thêm' : `Thêm vào Ngày ${day}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Thêm địa điểm vào lịch trình — theo AddLocationScreen của mobile */
export default function AddLocationPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips } = useTraveller();
  const trip = trips.find((item) => item.id === tripId);
  const [position, setPosition] = useState<{ day: number; slot: TimeSlotId }>({
    day: 1,
    slot: 'afternoon',
  });
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<NearbyCategory>('nearest');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const visiblePlaces = useMemo(() => {
    const keyword = normalizeText(query);
    const filtered = NEARBY_PLACES.filter(
      (place) =>
        (category === 'nearest' || place.category === category) &&
        (!keyword || normalizeText(`${place.name} ${place.categoryLabel}`).includes(keyword)),
    );
    // "Gần đây nhất" sắp theo khoảng cách
    return category === 'nearest'
      ? [...filtered].sort((a, b) => a.distance - b.distance)
      : filtered;
  }, [query, category]);

  if (!trip) return <Navigate to={CLIENT_ROUTES.TRIPS} replace />;

  const currentSlot = TIME_SLOTS.find((slot) => slot.id === position.slot)!;
  const toggle = (id: string) =>
    setAddedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  const leave = () => navigate(CLIENT_ROUTES.TRIPS);
  const done = () =>
    navigate(CLIENT_ROUTES.TRIPS, {
      state: {
        notice: `Đã thêm ${addedIds.length} địa điểm vào Ngày ${position.day} – ${currentSlot.label}.`,
      },
    });

  return (
    <div className="mx-auto max-w-4xl pb-28 md:pb-4">
      <PageBar
        title="Thêm địa điểm"
        onBack={() => (addedIds.length > 0 ? setConfirmLeave(true) : leave())}
      />

      <div className="rounded-[20px] bg-[#E7F8F5] p-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-[0.04em] text-[#087A78]">
            <Icon name="edit_calendar" className="text-[15px]" />
            LỊCH TRÌNH ĐANG CHỈNH SỬA
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#075C66]">
            {trip.days}N{Math.max(trip.days - 1, 0)}Đ
          </span>
        </div>
        <p className="mt-1 text-[18px] font-extrabold text-[#13364A]">{trip.title}</p>

        <button
          type="button"
          onClick={() => setShowPicker((previous) => !previous)}
          aria-expanded={showPicker}
          className="mt-2.5 flex w-full items-center rounded-2xl bg-white px-3 py-2.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C3F8F0] text-[#087A78]">
            <Icon name="schedule" className="text-[19px]" />
          </span>
          <span className="ml-2.5 min-w-0 flex-1">
            <span className="block text-[10px] text-[#72818C]">Vị trí chèn vào</span>
            <span className="block truncate text-[13px] font-bold text-[#13364A]">
              Ngày {position.day}: {currentSlot.label} {currentSlot.time}
            </span>
          </span>
          <Icon name={showPicker ? 'expand_less' : 'tune'} className="text-[20px] text-[#087A78]" />
        </button>

        {showPicker && (
          <div className="mt-2 rounded-2xl bg-white p-3">
            <p className="text-[11px] font-bold text-[#72818C]">Chọn ngày</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {Array.from({ length: trip.days }, (_, index) => index + 1).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setPosition((previous) => ({ ...previous, day }))}
                  aria-pressed={day === position.day}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
                    day === position.day ? 'bg-[#075C66] text-white' : 'bg-[#EBEDFF] text-[#13364A]'
                  }`}
                >
                  Ngày {day}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold text-[#72818C]">Chọn khung giờ</p>
            <div className="mt-1.5 flex gap-2">
              {TIME_SLOTS.map((slot) => {
                const selected = slot.id === position.slot;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setPosition((previous) => ({ ...previous, slot: slot.id }));
                      setShowPicker(false);
                    }}
                    aria-pressed={selected}
                    className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                      selected ? 'bg-[#075C66] text-white' : 'bg-[#EBEDFF] text-[#13364A]'
                    }`}
                  >
                    <span className="text-[12px] font-bold">{slot.label}</span>
                    <span
                      className={`text-[10px] ${selected ? 'text-[#D7FBF3]' : 'text-[#72818C]'}`}
                    >
                      {slot.time.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex h-11 items-center rounded-full bg-white px-3.5 focus-within:ring-2 focus-within:ring-primary/30">
        <Icon name="search" className="text-[20px] text-[#72818C]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm tên địa điểm, quán ăn, danh lam..."
          aria-label="Tìm địa điểm"
          className="ml-2 h-full flex-1 bg-transparent text-[13px] text-[#13364A] placeholder:text-[#9AA6AD] focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Xoá từ khoá">
            <Icon name="cancel" filled className="text-[18px] text-[#B4BEC4]" />
          </button>
        )}
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {NEARBY_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            aria-pressed={item.id === category}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ${
              item.id === category ? 'bg-[#075C66] text-white' : 'bg-white text-[#13364A]'
            }`}
          >
            <Icon name={item.icon} className="text-[16px]" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#13364A]">Gợi ý địa điểm lân cận</h2>
          <p className="text-[11px] text-[#72818C]">Tối ưu thời gian di chuyển từ điểm trước</p>
        </div>
        <span className="text-[12px] font-bold text-[#087A78]">
          {visiblePlaces.length} địa điểm
        </span>
      </div>

      {visiblePlaces.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlaces.map((place) => (
            <NearbyPlaceCard
              key={place.id}
              place={place}
              day={position.day}
              added={addedIds.includes(place.id)}
              onToggle={() => toggle(place.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[22px] bg-white px-6 py-10">
          <Icon name="travel_explore" className="text-[36px] text-[#087A78]" />
          <p className="mt-2 text-[13px] font-bold text-[#13364A]">
            Không tìm thấy địa điểm phù hợp
          </p>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[#EBEDFF] px-3.5 py-3 text-[11px] text-[#445577]">
        <Icon name="info" className="text-[17px] text-[#087A78]" />
        <span>
          Địa điểm đã chọn sẽ tự động xếp vào khung giờ phù hợp trên lịch trình{' '}
          <b>Ngày {position.day}</b>.
        </span>
      </p>

      {addedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-[62px] z-20 flex items-center gap-3 bg-white px-4 pt-3 pb-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:sticky md:bottom-4 md:mt-4 md:rounded-[20px]">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold text-[#13364A]">
              Đã chọn {addedIds.length} địa điểm
            </p>
            <p className="text-[11px] text-[#72818C]">
              Ngày {position.day} • {currentSlot.label}
            </p>
          </div>
          <button
            type="button"
            onClick={done}
            className="flex h-11 items-center gap-1.5 rounded-full bg-[#075C66] px-5 text-[13px] font-bold text-white hover:bg-primary"
          >
            Lưu vào lịch trình <Icon name="check" className="text-[17px]" />
          </button>
        </div>
      )}

      {confirmLeave && (
        <ConfirmDialog
          title="Bỏ địa điểm đã chọn?"
          message={`Bạn đã chọn ${addedIds.length} địa điểm nhưng chưa lưu vào lịch trình.`}
          cancelLabel="Ở lại"
          confirmLabel="Bỏ chọn"
          danger
          onConfirm={leave}
          onClose={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
