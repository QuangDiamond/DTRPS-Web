import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES, suggestionPath } from '@/client/routePaths';
import {
  getMatchScore,
  getSuggestedPlace,
  INTEREST_TAG_LABELS,
  type SuggestedPlace,
} from '@/client/traveller/data/suggestedPlaces';
import { useTraveller } from '@/client/traveller/travellerContext';
import { ConfirmDialog } from '@/client/ui/Overlay';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

function InfoChip({ icon, title }: { icon: string; title: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-[#EBEDFF] px-3 py-2 text-[11px] font-semibold text-[#506581]">
      <Icon name={icon} className="text-[16px] text-[#42647E]" />
      {title}
    </span>
  );
}

/** Kế hoạch của tôi — theo SelectedPlacesScreen của mobile, hiển thị đúng các điểm đã chọn */
export default function SelectedPlacesPage() {
  const navigate = useNavigate();
  const { plan, togglePlanPlace } = useTraveller();
  const [removing, setRemoving] = useState<SuggestedPlace | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!plan) return <Navigate to={CLIENT_ROUTES.TRIP_PLAN} replace />;

  const places = plan.placeIds
    .map((id) => getSuggestedPlace(id))
    .filter((place): place is SuggestedPlace => Boolean(place));
  const averageMatch = places.length
    ? Math.round(
        places.reduce((sum, place) => sum + getMatchScore(place, plan.interests), 0) /
          places.length,
      )
    : 0;

  const handleContinue = () => {
    if (places.length === 0) {
      setError('Vui lòng chọn ít nhất một địa điểm để tạo lịch trình.');
      return;
    }
    navigate(CLIENT_ROUTES.ITINERARY);
  };

  return (
    <div className="mx-auto max-w-3xl pb-28 md:pb-4">
      <PageBar
        title="Kế hoạch của tôi"
        subtitle={plan.destinationName}
        backTo={CLIENT_ROUTES.TRIP_SUGGESTIONS}
        actions={
          <BarIconButton
            icon="assignment_turned_in"
            label="Tiếp tục tạo lịch trình"
            onClick={handleContinue}
          />
        }
      />

      <div className="rounded-[22px] bg-linear-to-br from-[#E4FAF6] to-[#E2F8F8] p-[17px]">
        <div className="flex items-center">
          <span className="mr-3 flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[#CBF5EF] text-[#087A78]">
            <Icon name="location_on" filled className="text-[34px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-extrabold text-[#075C66]">Gợi ý hành trình của AI</p>
            <p className="mt-1 text-[14px] text-[#7C8DA3]">{places.length} địa điểm đã thêm</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <InfoChip icon="schedule" title={`${plan.days} ngày`} />
          <InfoChip icon="location_on" title="Ưu tiên gần nhau" />
          <InfoChip icon="star" title={`Phù hợp ${averageMatch}%`} />
        </div>
      </div>

      <div className="mt-7 mb-4 flex items-center justify-between">
        <h2 className="text-[21px] font-extrabold text-[#13364A]">Địa điểm đã chọn</h2>
        <span className="rounded-full bg-[#D5F7F1] px-3 py-1 text-[12px] font-bold text-[#075C66]">
          {places.length}
        </span>
      </div>

      {places.length > 0 ? (
        <div className="grid gap-3">
          {places.map((place, index) => (
            <div
              key={place.id}
              className="flex rounded-[20px] border border-[#ECEEFA] bg-white p-2.5 shadow-sm"
            >
              <Link
                to={suggestionPath(place.id)}
                className="relative h-[152px] w-[112px] shrink-0 overflow-hidden rounded-2xl bg-[#DAF2EA]"
              >
                <img src={place.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#10A99B] text-[18px] font-extrabold text-white">
                  {index + 1}
                </span>
              </Link>
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <Link
                    to={suggestionPath(place.id)}
                    className="line-clamp-2 text-[16px] leading-[21px] font-extrabold text-[#13364A] hover:text-primary"
                  >
                    {place.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setRemoving(place)}
                    aria-label={`Xóa ${place.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F1FF] text-[#13364A] hover:text-client-danger"
                  >
                    <Icon name="delete" className="text-[19px]" />
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-[#72818C]">
                  <Icon name="location_on" className="text-[16px] text-[#087A78]" />
                  <span className="truncate">{place.location}</span>
                </p>
                <p className="mt-2 line-clamp-3 text-[11px] leading-[17px] text-[#72818C]">
                  {place.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-[#F0F1FF] px-2 py-1.5 text-[10px] font-medium text-[#516987]"
                    >
                      <Icon name="sell" className="text-[13px] text-[#54708A]" />
                      {INTEREST_TAG_LABELS[tag]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[20px] bg-white px-5 py-10 text-center">
          <Icon name="location_off" className="text-[50px] text-[#91CCC2]" />
          <p className="mt-3 text-[16px] font-bold text-[#13364A]">Chưa có địa điểm nào</p>
          <p className="mt-2 text-[12px] text-[#8191A5]">Hãy thêm địa điểm vào kế hoạch của bạn.</p>
        </div>
      )}

      <div className="mt-3 flex gap-3 rounded-2xl bg-[#F0F1FF] p-4">
        <Icon name="lightbulb" className="text-[24px] text-[#087A78]" />
        <p className="flex-1 text-[12px] leading-[19px] text-[#5C6F87]">
          Bạn có thể bỏ bớt địa điểm hoặc tiếp tục tạo lịch trình dựa trên các địa điểm đã chọn.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-[12px] text-client-danger">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-[62px] z-20 flex gap-2 border-t border-[#EDF0F7] bg-white px-4 py-3 md:static md:mt-4 md:rounded-[20px] md:border-0">
        <Link
          to={CLIENT_ROUTES.TRIP_SUGGESTIONS}
          className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-[#F0F1FF] px-2 text-[12px] font-extrabold text-[#13364A]"
        >
          <Icon name="add_circle" filled className="text-[20px]" />
          Thêm địa điểm
        </Link>
        <button
          type="button"
          onClick={handleContinue}
          className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-[#C3F8F0] px-2 text-[12px] font-extrabold text-[#075C66]"
        >
          <Icon name="arrow_circle_right" filled className="text-[20px]" />
          Tiếp tục tạo lịch trình
        </button>
      </div>

      {removing && (
        <ConfirmDialog
          title="Xóa địa điểm"
          message={`Bạn có chắc muốn xóa "${removing.name}" khỏi kế hoạch?`}
          confirmLabel="Xóa"
          danger
          onConfirm={() => togglePlanPlace(removing.id)}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
