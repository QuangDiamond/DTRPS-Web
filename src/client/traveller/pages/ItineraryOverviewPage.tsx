import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import PageBar from '@/client/ui/PageBar';

/** Lịch trình của bạn (tổng quan) — theo ItineraryOverviewScreen của mobile. Chưa có dữ liệu lịch trình. */
export default function ItineraryOverviewPage() {
  return (
    <div className="mx-auto max-w-4xl pb-24 md:pb-4">
      <PageBar title="Lịch trình của bạn" backTo={CLIENT_ROUTES.TRIPS} />

      <div className="flex flex-col items-center rounded-[20px] bg-white px-4 py-12 text-center">
        <Icon name="event_note" className="text-[40px] text-[#94B5B6]" />
        <p className="mt-3 text-[15px] font-extrabold text-[#14233F]">Chưa có lịch trình</p>
        <p className="mt-1 text-[12px] text-[#7886A5]">
          Lập kế hoạch chuyến đi để tạo lịch trình của bạn.
        </p>
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN}
          className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#006D67] px-6 text-[13px] font-bold text-white hover:bg-primary"
        >
          Lập kế hoạch chuyến đi <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
      </div>
    </div>
  );
}
