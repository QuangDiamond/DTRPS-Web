import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES, itineraryDayPath, liveMapPath } from '@/client/routePaths';
import { type Activity, ITINERARY, NOTE_TONES } from '@/client/traveller/data/itinerary';
import { NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

function ActivityImage({ uri, icon }: { uri: string; icon: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E6F4F2] text-[#006B65]">
      {failed ? (
        <Icon name={icon} className="text-[33px]" />
      ) : (
        <img
          src={uri}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}

function TimelineItem({ item, isLast }: { item: Activity; isLast: boolean }) {
  return (
    <li className="relative mb-3.5 pl-[27px]">
      {!isLast && <span className="absolute top-3.5 -bottom-3.5 left-2 w-0.5 bg-[#BDECE5]" />}
      <span
        className={`absolute top-[9px] left-px h-4 w-4 rounded-md border-[3px] border-[#DBF5F0] ${
          item.evening ? 'bg-[#B98122]' : 'bg-[#087F78]'
        }`}
      />
      <div className="rounded-[17px] border border-[#EDF0F8] bg-white p-3">
        <div className="flex items-center justify-between">
          <span
            className={`text-[17px] font-extrabold ${item.evening ? 'text-[#AC771B]' : 'text-[#087F78]'}`}
          >
            {item.time}
          </span>
          <span className="rounded-full bg-[#EFF0FD] px-3 py-1 text-[10px] font-bold text-[#8290B0]">
            {item.duration}
          </span>
        </div>
        <div className="mt-2 flex items-start">
          <ActivityImage uri={item.image} icon={item.icon} />
          <div className="ml-3 min-w-0 flex-1">
            <p className="line-clamp-3 text-[13px] leading-[18px] font-extrabold text-[#14364F]">
              {item.title}
            </p>
            <p className="mt-2 flex items-start gap-1 text-[10.5px] leading-[15px] text-[#7E8DA7]">
              <Icon name="location_on" className="text-[15px] text-[#087F78]" />
              <span className="line-clamp-2 flex-1">{item.location}</span>
            </p>
          </div>
        </div>
        <p
          className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[10.5px] leading-4 font-semibold ${NOTE_TONES[item.noteTone]}`}
        >
          <Icon name={item.noteIcon} className="text-[16px]" />
          <span className="flex-1">{item.note}</span>
        </p>
      </div>
      {item.transfer && (
        <p className="flex items-center gap-2 px-2 pt-3 pb-0.5 text-[10.5px] leading-[15px] text-[#8690AC]">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#ECF0FF] text-[#8394BD]">
            <Icon name="directions_car" className="text-[14px]" />
          </span>
          {item.transfer}
        </p>
      )}
    </li>
  );
}

/** Chi tiết lịch trình theo ngày — theo ItineraryDetailScreen của mobile */
export default function ItineraryDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, showNotice] = useNotice();
  const dayNumber = Number(params.day);
  const currentDay = ITINERARY.find((day) => day.day === dayNumber);

  if (!currentDay) return <Navigate to={CLIENT_ROUTES.ITINERARY} replace />;

  const share = async () => {
    const title = `Ngày ${currentDay.day}: ${currentDay.title}`;
    const text = `${title}\nSmartTravel - Lịch trình du lịch`;
    try {
      if (navigator.share) await navigator.share({ title, text });
      else {
        await navigator.clipboard.writeText(text);
        showNotice('Đã sao chép thông tin lịch trình.');
      }
    } catch {
      // Người dùng huỷ chia sẻ
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-24 md:pb-4">
      <PageBar
        title="Chi Tiết Lịch Trình"
        backTo={CLIENT_ROUTES.ITINERARY}
        actions={
          <>
            <BarIconButton icon="share" label="Chia sẻ lịch trình" onClick={() => void share()} />
            <BarIconButton
              icon="bookmark"
              label="Lưu lịch trình"
              active={bookmarked}
              onClick={() => setBookmarked((previous) => !previous)}
            />
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 rounded-full bg-[#D9F8F0] px-3 py-1.5 text-[11px] font-bold text-[#006B65]">
          <Icon name="location_on" className="text-[16px]" />
          {ITINERARY.length} ngày
        </span>
        <span className="flex items-center gap-1 rounded-full bg-[#FFF0DD] px-3 py-1.5 text-[11px] font-bold text-[#B77923]">
          <Icon name="auto_awesome" className="text-[15px]" /> AI Tối ưu
        </span>
      </div>
      <div className="mt-6 mb-3 flex items-center justify-between">
        <h3 className="text-[17px] font-extrabold text-[#14364F]">Lịch trình chi tiết</h3>
        <span className="text-[11px] font-semibold text-[#087F78]">
          {ITINERARY.length} ngày trong lịch trình
        </span>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4" role="tablist">
        {ITINERARY.map((day) => {
          const active = day.day === dayNumber;
          return (
            <Link
              key={day.day}
              to={itineraryDayPath(day.day)}
              replace
              role="tab"
              aria-selected={active}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-extrabold ${
                active ? 'bg-[#006B65] text-white' : 'bg-[#F0F1FF] text-[#667895]'
              }`}
            >
              <Icon name="today" className="text-[16px]" />
              Ngày {day.day} - {day.title}
            </Link>
          );
        })}
      </div>

      <div className="mb-4">
        <p className="text-[14px] font-extrabold text-[#14364F]">
          Ngày {currentDay.day}: {currentDay.title}
        </p>
        <p className="mt-1 text-[11px] text-[#7E8DA7]">
          {currentDay.description} · {currentDay.activities.length} hoạt động
        </p>
      </div>

      <ol>
        {currentDay.activities.map((activity, index) => (
          <TimelineItem
            key={activity.id}
            item={activity}
            isLast={index === currentDay.activities.length - 1}
          />
        ))}
      </ol>

      <div className="fixed inset-x-0 bottom-[62px] z-20 flex items-center gap-2 border-t border-[#E7EAF5] bg-white px-3 py-2.5 md:static md:mt-4 md:rounded-[20px] md:border-0">
        <button
          type="button"
          onClick={() => showNotice('Chức năng chỉnh sửa lịch trình sẽ được tích hợp sau.')}
          className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-2xl bg-[#EFF0FF] text-[#7283AC]"
        >
          <Icon name="edit" className="text-[20px]" />
          <span className="mt-0.5 text-[9px] font-bold">Sửa</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(liveMapPath(currentDay.day))}
          className="flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#006B65] text-[14px] font-extrabold text-white shadow hover:bg-primary"
        >
          Bắt đầu chuyến đi <Icon name="arrow_forward" className="text-[21px]" />
        </button>
      </div>
      <NoticeToast message={notice} />
    </div>
  );
}
