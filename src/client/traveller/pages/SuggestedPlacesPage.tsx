import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES, suggestionPath } from '@/client/routePaths';
import TravelMap, { type TravelMapHandle } from '@/client/traveller/components/TravelMap';
import {
  rankSuggestions,
  type RankedSuggestion,
  SUGGESTION_CATEGORY_LABELS,
  type SuggestionCategory,
} from '@/client/traveller/data/suggestedPlaces';
import { useTraveller } from '@/client/traveller/travellerContext';
import { ConfirmDialog } from '@/client/ui/Overlay';
import PageBar from '@/client/ui/PageBar';

const FLOW_STEPS = 6;
const CURRENT_FLOW_STEP = 3;

const CARD_CLASS =
  'flex h-[286px] min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_3px_9px_rgba(13,69,67,0.07)]';

function MatchCard({
  place,
  index,
  favorite,
  inPlan,
  active,
  onHover,
  onToggleFavorite,
  onTogglePlan,
}: {
  place: RankedSuggestion;
  index: number;
  favorite: boolean;
  inPlan: boolean;
  active: boolean;
  onHover: () => void;
  onToggleFavorite: () => void;
  onTogglePlan: () => void;
}) {
  return (
    <div
      id={`suggestion-${place.id}`}
      onMouseEnter={onHover}
      className={`${CARD_CLASS} relative border ${active ? 'border-[1.5px] border-[#087A78]' : 'border-[#E7EBEF]'}`}
    >
      <Link to={suggestionPath(place.id)} className="flex flex-1 flex-col">
        <div className="relative h-[122px] shrink-0">
          <img src={place.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/0 to-black/35" />
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1.5 text-[9px] font-extrabold text-[#075C66]">
            <Icon name="auto_awesome" className="text-[12px]" /> AI GỢI Ý
          </span>
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#DAFAF0] px-2.5 py-1.5 text-[10px] font-extrabold text-[#075C66]">
            <Icon name="auto_awesome" className="text-[12px]" /> {place.match}% phù hợp
          </span>
        </div>
        <div className="flex flex-1 flex-col px-[11px] pt-[9px] pb-2">
          <p className="line-clamp-2 h-[37px] text-[13.5px] leading-[18px] font-extrabold text-[#13364A]">
            {place.name}
          </p>
          <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-[#72818C]">
            <Icon name="location_on" className="text-[13px]" />
            <span className="truncate">{place.location}</span>
          </p>
          <p className="mt-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-bold text-[#13364A]">
              <Icon name="star" filled className="text-[14px] text-[#E6A332]" />
              {place.rating.toFixed(1)}
            </span>
            <span className="text-[10px] font-semibold text-[#72818C]">
              #{index + 1} theo sở thích
            </span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={favorite ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
        aria-pressed={favorite}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95"
      >
        <Icon
          name="favorite"
          filled={favorite}
          className={`text-[18px] ${favorite ? 'text-[#E5484D]' : 'text-[#075C66]'}`}
        />
      </button>
      <div className="px-[11px] pb-2.5">
        <button
          type="button"
          onClick={onTogglePlan}
          aria-pressed={inPlan}
          className={`flex h-9 w-full items-center justify-center gap-1 rounded-xl text-[10px] font-extrabold ${
            inPlan ? 'bg-[#DAF5EA] text-[#075C66]' : 'bg-[#075C66] text-white hover:bg-primary'
          }`}
        >
          <Icon name={inPlan ? 'check_circle' : 'add'} className="text-[16px]" />
          {inPlan ? 'Đã thêm' : 'Thêm vào kế hoạch'}
        </button>
      </div>
    </div>
  );
}

/** Gợi ý điểm đến — theo SuggestedPlacesScreen của mobile (bản đồ Leaflet thay react-native-maps) */
export default function SuggestedPlacesPage() {
  const navigate = useNavigate();
  const { plan, togglePlanPlace, savedSuggestions, toggleSavedSuggestion, savePlan } =
    useTraveller();
  const mapRef = useRef<TravelMapHandle>(null);
  const [category, setCategory] = useState<SuggestionCategory | 'all'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const places = useMemo(
    () => (plan ? rankSuggestions(plan.destinationId, plan.interests) : []),
    [plan],
  );

  if (!plan) return <Navigate to={CLIENT_ROUTES.TRIP_PLAN} replace />;

  const categories = [
    { id: 'all' as const, label: 'Tất cả', count: places.length },
    ...Array.from(new Set(places.map((place) => place.category))).map((id) => ({
      id,
      label: SUGGESTION_CATEGORY_LABELS[id],
      count: places.filter((place) => place.category === id).length,
    })),
  ];
  const visiblePlaces =
    category === 'all' ? places : places.filter((place) => place.category === category);
  const currentActive = activeId ?? visiblePlaces[0]?.id ?? null;

  const focusPlace = (place: RankedSuggestion) => {
    setActiveId(place.id);
    mapRef.current?.focus(place.coordinate, 14);
  };

  const selectMarker = (id: string) => {
    const place = visiblePlaces.find((item) => item.id === id);
    if (!place) return;
    focusPlace(place);
    document
      .getElementById(`suggestion-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBack = () =>
    plan.placeIds.length > 0 ? setConfirmLeave(true) : navigate(CLIENT_ROUTES.TRIP_PLAN);

  const save = () => {
    const count = savePlan();
    navigate(CLIENT_ROUTES.TRIPS, {
      replace: true,
      state: { notice: `Đã lưu kế hoạch: thêm ${count} địa điểm vào chuyến đi của bạn.` },
    });
  };

  return (
    <div className="pb-24 md:pb-4">
      <PageBar
        title="Gợi ý điểm đến cho bạn"
        subtitle={`${plan.destinationName} • ${plan.days} ngày • ${plan.members} người`}
        onBack={handleBack}
        actions={
          <Link
            to={CLIENT_ROUTES.TRIP_PLAN_SELECTED}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[12px] font-bold text-[#075C66]"
          >
            <Icon name="assignment" className="text-[18px]" />
            <span className="hidden sm:inline">Kế hoạch</span> ({plan.placeIds.length})
          </Link>
        }
      />

      <div className="mb-3 flex gap-1.5">
        {Array.from({ length: FLOW_STEPS }, (_, index) => (
          <span
            key={index}
            className={`h-[5px] flex-1 rounded-full ${index < CURRENT_FLOW_STEP ? 'bg-[#075C66]' : 'bg-[#E3E8EF]'}`}
          />
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-5">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="relative overflow-hidden rounded-[20px] bg-[#E0EEE9]">
            <TravelMap
              ref={mapRef}
              className="h-[225px] lg:h-[480px]"
              points={visiblePlaces.map((place, index) => ({
                id: place.id,
                coordinate: place.coordinate,
                label: String(index + 1),
                title: place.name,
              }))}
              activeId={currentActive}
              onSelect={selectMarker}
            />
            <span className="pointer-events-none absolute top-3 left-3 z-[400] rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#075C66] shadow">
              {visiblePlaces.length} địa điểm trên bản đồ
            </span>
            <span className="pointer-events-none absolute bottom-2 left-3 z-[400] rounded-lg bg-white/95 px-2 py-1 text-[10px] text-[#65798A]">
              Vị trí tham khảo, không dùng để dẫn đường
            </span>
          </div>
        </div>

        <div>
          <div className="sticky top-16 z-10 -mx-4 mt-3 bg-client-bg px-4 py-3 lg:mt-0 lg:pt-0">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategory(item.id);
                    setActiveId(null);
                  }}
                  aria-pressed={item.id === category}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[12px] font-semibold ${
                    item.id === category ? 'bg-[#075C66] text-white' : 'bg-[#EBEDFF] text-[#13364A]'
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 rounded-2xl border border-[#DDEDE7] bg-[#F4FBF8] p-3">
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#13364A]">
              <Icon name="auto_awesome" className="text-[17px] text-[#075C66]" />
              Địa điểm đề xuất
            </p>
            <p className="mt-1 text-[10px] text-[#72818C]">
              {visiblePlaces.length} địa điểm • Theo sở thích
            </p>
          </div>

          {visiblePlaces.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-8">
              <Icon name="travel_explore" className="text-[32px] text-[#94B5B6]" />
              <p className="mt-2 text-[12px] text-[#72818C]">Chưa có kết quả để hiển thị.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {visiblePlaces.map((place, index) => (
                <MatchCard
                  key={place.id}
                  place={place}
                  index={index}
                  favorite={savedSuggestions.includes(place.id)}
                  inPlan={plan.placeIds.includes(place.id)}
                  active={place.id === currentActive}
                  onHover={() => setActiveId(place.id)}
                  onToggleFavorite={() => toggleSavedSuggestion(place.id)}
                  onTogglePlan={() => togglePlanPlace(place.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[62px] z-20 border-t border-[#EEF1F5] bg-white px-4 pt-2.5 pb-2.5 md:static md:mt-4 md:rounded-[20px] md:border-0">
        <button
          type="button"
          onClick={save}
          disabled={plan.placeIds.length === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#075C66] text-[14px] font-bold text-white hover:bg-primary disabled:bg-[#E3E8EF] disabled:text-[#72818C]"
        >
          <Icon name="save" className="text-[19px]" />
          {plan.placeIds.length > 0
            ? `Lưu kế hoạch (${plan.placeIds.length} địa điểm)`
            : 'Chọn địa điểm để thêm vào kế hoạch'}
        </button>
      </div>

      {confirmLeave && (
        <ConfirmDialog
          title="Bỏ các địa điểm đã chọn?"
          message="Kế hoạch của bạn chưa được lưu."
          cancelLabel="Ở lại"
          confirmLabel="Bỏ"
          danger
          onConfirm={() => navigate(CLIENT_ROUTES.TRIP_PLAN)}
          onClose={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
