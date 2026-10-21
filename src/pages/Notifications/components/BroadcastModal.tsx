import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import {
  BROADCAST_AUDIENCES,
  BROADCAST_CHANNELS,
  BROADCAST_LIMITS,
} from '@/constants/notification';
import type { BroadcastAudience, BroadcastChannel, BroadcastPayload } from '@/types';
import { formatNumber } from '@/utils/format';

interface BroadcastModalProps {
  /** Số người nhận ước tính của từng nhóm */
  audienceCounts: Record<BroadcastAudience, number>;
  sending: boolean;
  onSend: (payload: BroadcastPayload) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none';

const OPTION_CLASS =
  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all';
const optionTone = (active: boolean) =>
  active
    ? 'border-primary bg-primary/5 text-primary'
    : 'border-surface-container text-on-surface-variant hover:bg-surface-container-low';

/** Modal "Gửi thông báo broadcast" — gửi hàng loạt tới một nhóm người nhận */
export default function BroadcastModal({
  audienceCounts,
  sending,
  onSend,
  onClose,
}: BroadcastModalProps) {
  const { t } = useTranslation();
  const [audience, setAudience] = useState<BroadcastAudience>('allUsers');
  const [channels, setChannels] = useState<BroadcastChannel[]>(['push', 'inApp']);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const canSend =
    title.trim().length > 0 && message.trim().length > 0 && channels.length > 0 && !sending;

  const toggleChannel = (id: BroadcastChannel) =>
    setChannels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <Modal
      title={t('notifications.broadcast.title')}
      description={t('notifications.broadcast.description')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            icon="campaign"
            disabled={!canSend}
            onClick={() =>
              onSend({ audience, channels, title: title.trim(), message: message.trim() })
            }
          >
            {sending
              ? t('notifications.broadcast.sending')
              : t('notifications.broadcast.sendTo', {
                  count: audienceCounts[audience],
                  formatted: formatNumber(audienceCounts[audience]),
                })}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('notifications.broadcast.audience')}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BROADCAST_AUDIENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAudience(item.id)}
                className={`${OPTION_CLASS} ${optionTone(item.id === audience)}`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md font-semibold">
                    {t(item.labelKey)}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    {t('notifications.broadcast.recipients', {
                      count: audienceCounts[item.id],
                      formatted: formatNumber(audienceCounts[item.id]),
                    })}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('notifications.broadcast.channelsLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {BROADCAST_CHANNELS.map((item) => {
              const active = channels.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChannel(item.id)}
                  className={`${OPTION_CLASS} font-label-md text-label-md ${optionTone(active)}`}
                >
                  <Icon name={active ? 'check_box' : item.icon} className="text-[18px]" />
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('notifications.broadcast.titleLabel')}
            <span className="font-normal text-outline">
              {title.length}/{BROADCAST_LIMITS.title}
            </span>
          </span>
          <input
            value={title}
            maxLength={BROADCAST_LIMITS.title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('notifications.broadcast.titlePlaceholder')}
            className={`h-10 ${INPUT_CLASS}`}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('notifications.broadcast.messageLabel')}
            <span className="font-normal text-outline">
              {message.length}/{BROADCAST_LIMITS.message}
            </span>
          </span>
          <textarea
            rows={4}
            value={message}
            maxLength={BROADCAST_LIMITS.message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('notifications.broadcast.messagePlaceholder')}
            className={`resize-none py-2 ${INPUT_CLASS}`}
          />
        </label>
      </div>
    </Modal>
  );
}
