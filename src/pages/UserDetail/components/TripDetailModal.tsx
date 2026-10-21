import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/common';
import { formatVnd, TRIP_STATUS_CONFIG } from '@/pages/UserDetail/userProfileUtils';
import type { UserTrip } from '@/types';
import { formatDate } from '@/utils/format';

interface TripDetailModalProps {
  trip: UserTrip;
  onClose: () => void;
  onDownload: (trip: UserTrip) => void;
}

/** Xem nhanh chuyến đi — TODO: thay bằng màn Chi tiết chuyến đi khi có thiết kế Stitch */
export default function TripDetailModal({ trip, onClose, onDownload }: TripDetailModalProps) {
  const { t } = useTranslation();
  const config = TRIP_STATUS_CONFIG[trip.status];
  const facts = [
    { icon: 'tag', label: t('userDetail.tripDetailModal.itineraryCode'), value: trip.id },
    {
      icon: 'schedule',
      label: t('userDetail.tripDetailModal.duration'),
      value: trip.durationLabel,
    },
    {
      icon: 'event',
      label: t('userDetail.tripDetailModal.departure'),
      value: formatDate(trip.startDate),
    },
    {
      icon: 'event_available',
      label: t('userDetail.tripDetailModal.end'),
      value: formatDate(trip.endDate),
    },
    {
      icon: 'tour',
      label: t('userDetail.tripDetailModal.attractions'),
      value: `${trip.poiCount} POI`,
    },
    {
      icon: 'payments',
      label:
        trip.status === 'upcoming'
          ? t('userDetail.tripDetailModal.estimatedBudget')
          : t('userDetail.tripDetailModal.paid'),
      value: formatVnd(trip.amount),
    },
  ];

  return (
    <Modal
      title={trip.name}
      description={config.label}
      onClose={onClose}
      size="lg"
      footer={
        <Button icon="download" onClick={() => onDownload(trip)}>
          {t('userDetail.tripDetailModal.downloadItinerary')}
        </Button>
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
