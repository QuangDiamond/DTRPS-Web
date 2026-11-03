import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES, itineraryDayPath } from '@/client/routePaths';
import StopReviewCard, { type StopReview } from '@/client/traveller/components/StopReviewCard';
import TravelMap, { type TravelMapHandle } from '@/client/traveller/components/TravelMap';
import { ITINERARY } from '@/client/traveller/data/itinerary';
import { ConfirmDialog, NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';

/** Theo dõi hành trình trong ngày — theo TripLiveMapScreen của mobile (GPS của trình duyệt) */
export default function TripLiveMapPage() {
  const params = useParams();
  const navigate = useNavigate();
  const mapRef = useRef<TravelMapHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [gpsMessage, setGpsMessage] = useState('Đang kiểm tra GPS');
  const [reviews, setReviews] = useState<Record<string, StopReview>>({});
  const [dialog, setDialog] = useState<'exit' | 'order' | 'done' | null>(null);
  const [notice, showNotice] = useNotice();

  const dayNumber = Number(params.day);
  const day = ITINERARY.find((item) => item.day === dayNumber);

  // Định vị trong khi màn hình đang mở
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsMessage('Trình duyệt không hỗ trợ GPS');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setMyLocation([position.coords.latitude, position.coords.longitude]);
        setGpsMessage('GPS đã bật');
      },
      (geoError) =>
        setGpsMessage(
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Chưa cấp quyền định vị'
            : 'Không lấy được GPS',
        ),
      { enableHighAccuracy: false, maximumAge: 3000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!day) return <Navigate to={CLIENT_ROUTES.ITINERARY} replace />;

  const stops = day.activities;
  const currentStop = stops[activeIndex];
  const reachedCount = completed ? stops.length : visitedCount;
  const progress = stops.length ? Math.round((reachedCount / stops.length) * 100) : 0;
  const backToDetail = () => navigate(itineraryDayPath(day.day));

  const focusStop = (index: number) => {
    const stop = stops[index];
    if (!stop) return;
    setActiveIndex(index);
    mapRef.current?.focus(stop.coordinate, 15);
  };

  const focusMyPosition = () => {
    if (!myLocation) {
      showNotice(
        gpsMessage === 'Chưa cấp quyền định vị'
          ? 'Bạn cần cấp quyền vị trí cho trình duyệt để dùng chức năng này.'
          : 'Đang lấy tín hiệu GPS, vui lòng thử lại sau.',
      );
      return;
    }
    mapRef.current?.focus(myLocation, 16);
  };

  const markArrived = () => {
    if (completed || stops.length === 0) return;
    if (activeIndex !== visitedCount) {
      setDialog('order');
      return;
    }
    if (activeIndex === stops.length - 1) {
      setVisitedCount(stops.length);
      setCompleted(true);
      setDialog('done');
      return;
    }
    setVisitedCount(activeIndex + 1);
    focusStop(activeIndex + 1);
  };

  // Tìm bằng tên — toạ độ tham khảo, không dùng để dẫn đường thật
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    currentStop.location,
  )}&travelmode=driving`;

  return (
    <div className="-mx-4 -mt-4 md:mx-0 md:mt-0 md:grid md:grid-cols-[1.4fr_1fr] md:gap-4">
      <div className="relative">
        <TravelMap
          ref={mapRef}
          className="h-[45vh] md:h-[calc(100vh-180px)] md:rounded-[20px]"
          center={stops[0].coordinate}
          points={stops.map((stop, index) => ({
            id: stop.id,
            coordinate: stop.coordinate,
            label: String(index + 1),
            title: stop.title,
          }))}
          activeId={currentStop.id}
          visitedIds={stops.slice(0, reachedCount).map((stop) => stop.id)}
          route
          userLocation={myLocation}
          onSelect={(id) => focusStop(stops.findIndex((stop) => stop.id === id))}
        />

        <div className="absolute top-3 right-3 left-3 z-[400] flex items-center rounded-[19px] bg-white/95 p-2.5 shadow-md">
          <button
            type="button"
            onClick={backToDetail}
            aria-label="Quay lại"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-[#F2F5F7] text-[#17344A]"
          >
            <Icon name="arrow_back" className="text-[22px]" />
          </button>
          <div className="min-w-0 flex-1 px-2.5">
            <p className="text-[10px] font-extrabold text-[#006B67]">
              ĐANG THEO DÕI · NGÀY {day.day}
            </p>
            <p className="mt-0.5 truncate text-[14px] font-extrabold text-[#17344A]">{day.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setDialog('exit')}
            aria-label="Thoát hành trình"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-[#F2F5F7] text-[#17344A]"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <div className="absolute right-3.5 bottom-4 z-[400] flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => mapRef.current?.fitAll()}
            aria-label="Xem toàn bộ lộ trình"
            className="flex h-[47px] w-[47px] items-center justify-center rounded-[17px] bg-white text-[#006B67] shadow-md"
          >
            <Icon name="pin_drop" className="text-[23px]" />
          </button>
          <button
            type="button"
            onClick={focusMyPosition}
            aria-label="Vị trí của tôi"
            className="flex h-[47px] w-[47px] items-center justify-center rounded-[17px] bg-white text-[#006B67] shadow-md"
          >
            <Icon name="my_location" className="text-[24px]" />
          </button>
        </div>
      </div>

      <div className="relative z-10 -mt-5 rounded-t-[27px] bg-white px-[17px] pt-2.5 pb-4 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] md:mt-0 md:rounded-[20px] md:shadow-none">
        <span className="mx-auto mb-3.5 block h-[5px] w-[43px] rounded-full bg-[#DCE5E7] md:hidden" />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 rounded-full bg-[#E6F8F4] px-2.5 py-1.5 text-[10px] font-extrabold text-[#006B67]">
            <Icon name={completed ? 'check_circle' : 'navigation'} className="text-[15px]" />
            {completed
              ? 'ĐÃ HOÀN THÀNH'
              : activeIndex === visitedCount
                ? 'ĐIỂM ĐẾN TIẾP THEO'
                : 'ĐIỂM ĐANG XEM'}
          </span>
          <span className="text-[12px] font-bold text-[#75879A]">
            {reachedCount}/{stops.length} điểm
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDF2F2]">
          <div
            className="h-full rounded-full bg-[#087E79] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center">
          <span className="flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-2xl bg-[#006B67] text-[23px] font-extrabold text-white">
            {activeIndex + 1}
          </span>
          <div className="min-w-0 flex-1 pl-3">
            <p className="line-clamp-2 text-[16px] leading-[21px] font-extrabold text-[#17344A]">
              {completed ? 'Đã hoàn thành tất cả điểm dừng!' : currentStop.title}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#75879A]">
              <Icon name="location_on" className="text-[15px]" />
              <span className="truncate">{currentStop.location}</span>
            </p>
          </div>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-[10.5px] font-semibold text-[#526C7D]">
          <Icon name="schedule" className="text-[16px] text-[#006B67]" />
          {currentStop.time} · {currentStop.duration} (dự kiến)
          <span className="mx-1.5 h-4 w-px bg-[#E0E8ED]" />
          <Icon name="my_location" className="text-[15px] text-[#006B67]" />
          {gpsMessage}
        </p>

        <div className="flex gap-2 overflow-x-auto py-3.5">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              onClick={() => focusStop(index)}
              aria-pressed={index === activeIndex}
              className={`shrink-0 rounded-[13px] px-3.5 py-2 text-[11px] font-extrabold ${
                index === activeIndex ? 'bg-[#006B67] text-white' : 'bg-[#EEF2F5] text-[#17344A]'
              }`}
            >
              {index < reachedCount ? '✓' : index + 1} · {stop.time}
            </button>
          ))}
        </div>

        {/* key theo điểm dừng: đổi điểm thì form nhận xét được làm mới */}
        <StopReviewCard
          key={currentStop.id}
          stopId={currentStop.id}
          stopTitle={currentStop.title}
          savedReview={reviews[currentStop.id]}
          onSubmit={(review) => {
            setReviews((previous) => ({ ...previous, [review.stopId]: review }));
            showNotice(`Cảm ơn bạn đã đánh giá "${currentStop.title}".`);
          }}
        />

        <div className="flex gap-2.5 pt-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-[51px] flex-[0.9] items-center justify-center gap-1.5 rounded-2xl bg-[#E6F8F4] text-[12px] font-extrabold text-[#006B67]"
          >
            <Icon name="directions" className="text-[21px]" /> Chỉ đường
          </a>
          <button
            type="button"
            onClick={completed ? backToDetail : markArrived}
            className="flex h-[51px] flex-[1.3] items-center justify-center gap-1.5 rounded-2xl bg-[#006B67] text-[12px] font-extrabold text-white hover:bg-primary"
          >
            <Icon name={completed ? 'arrow_back' : 'check_circle'} className="text-[21px]" />
            {completed ? 'Trở về lịch trình' : 'Đã đến · Tiếp tục'}
          </button>
        </div>
      </div>

      {dialog === 'exit' && (
        <ConfirmDialog
          title="Thoát hành trình?"
          message="Tiến độ hiện chỉ lưu tạm trên màn hình này."
          cancelLabel="Ở lại"
          confirmLabel="Thoát"
          onConfirm={backToDetail}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'order' && (
        <ConfirmDialog
          title="Chưa tới lượt điểm này"
          message="Hãy hoàn thành các điểm dừng theo thứ tự của lịch trình."
          cancelLabel="Đóng"
          confirmLabel="Về điểm kế tiếp"
          onConfirm={() => focusStop(visitedCount)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'done' && (
        <ConfirmDialog
          title="Hoàn thành ngày tham quan"
          message={`Bạn đã đánh dấu hoàn tất ${stops.length} điểm dừng của Ngày ${day.day}.`}
          cancelLabel="Ở lại bản đồ"
          confirmLabel="Về chi tiết lịch trình"
          onConfirm={backToDetail}
          onClose={() => setDialog(null)}
        />
      )}
      <NoticeToast message={notice} />
    </div>
  );
}
