import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import type { UserTrip } from '../../../types/admin';
import { formatDate } from '../../../utils/format';
import { formatVnd, TRIP_STATUS_CONFIG } from '../userProfileUtils';

interface TripDetailModalProps {
  trip: UserTrip;
  onClose: () => void;
  onDownload: (trip: UserTrip) => void;
}

/** Xem nhanh chuyến đi — TODO: thay bằng màn Chi tiết chuyến đi khi có thiết kế Stitch */
export default function TripDetailModal({ trip, onClose, onDownload }: TripDetailModalProps) {
  const config = TRIP_STATUS_CONFIG[trip.status];
  const facts = [
    { icon: 'tag', label: 'Mã lộ trình', value: trip.id },
    { icon: 'schedule', label: 'Thời lượng', value: trip.durationLabel },
    { icon: 'event', label: 'Khởi hành', value: formatDate(trip.startDate) },
    { icon: 'event_available', label: 'Kết thúc', value: formatDate(trip.endDate) },
    { icon: 'tour', label: 'Số điểm tham quan', value: `${trip.poiCount} POI` },
    {
      icon: 'payments',
      label: trip.status === 'upcoming' ? 'Kinh phí dự toán' : 'Đã thanh toán',
      value: formatVnd(trip.amount),
    },
  ];

  return (
    <Modal
      title={trip.name}
      description={config.label + (trip.aiPlanned ? ' • Tạo bởi AI Planner' : '')}
      onClose={onClose}
      size="lg"
      footer={
        <button
          type="button"
          onClick={() => onDownload(trip)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
        >
          <Icon name="download" className="text-[18px]" /> Tải file lịch trình
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-start gap-3 rounded-xl bg-surface-container-low/60 p-3"
          >
            <Icon name={fact.icon} className="mt-0.5 text-[18px] text-primary" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                {fact.label}
              </span>
              <span className="font-body-md text-body-md font-medium text-on-surface">
                {fact.value}
              </span>
            </div>
          </div>
        ))}
        {trip.travelers && (
          <div className="flex items-start gap-3 rounded-xl bg-surface-container-low/60 p-3 sm:col-span-2">
            <Icon name="group" className="mt-0.5 text-[18px] text-primary" />
            <span className="font-body-md text-body-md text-on-surface">{trip.travelers}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
