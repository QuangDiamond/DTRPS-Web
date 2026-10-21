import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { MessageChannel, MessageTemplate } from '@/types';
import Button from './Button';
import Icon from './Icon';
import Modal from './Modal';

interface SendMessageModalProps {
  title: string;
  /** Người nhận, ví dụ "Hoi An Hospitality • contact@..." */
  recipient: string;
  templates: MessageTemplate[];
  /** Không truyền = chỉ gửi qua email, ẩn phần chọn kênh */
  channels?: MessageChannel[];
  defaultChannelIds?: string[];
  onSend: (subject: string, channelLabels: string[]) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  'w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none';

/** Soạn & gửi thông báo / email tới đối tác hoặc người dùng */
export default function SendMessageModal({
  title,
  recipient,
  templates,
  channels,
  defaultChannelIds = [],
  onSend,
  onClose,
}: SendMessageModalProps) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState<string[]>(defaultChannelIds);
  const canSend =
    subject.trim().length > 0 && body.trim().length > 0 && (!channels || selected.length > 0);

  const toggleChannel = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const handleSend = () => {
    const labels = channels
      ? channels.filter((channel) => selected.includes(channel.id)).map((channel) => channel.label)
      : ['Email'];
    onSend(subject.trim(), labels);
  };

  return (
    <Modal
      title={title}
      description={recipient}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="send" disabled={!canSend} onClick={handleSend}>
            {t('components.sendMessageModal.send')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {templates.map((template) => (
            <button
              key={template.title}
              type="button"
              onClick={() => {
                setSubject(template.title);
                setBody(template.body);
              }}
              className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="auto_fix_high" className="text-[14px]" /> {template.title}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('components.sendMessageModal.subject')}
          </span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={t('components.sendMessageModal.enterSubject')}
            className={`h-10 ${INPUT_CLASS}`}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('components.sendMessageModal.message')}
          </span>
          <textarea
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t('components.sendMessageModal.enterYourMessage')}
            className={`resize-none py-2 ${INPUT_CLASS}`}
          />
        </label>
        {channels && (
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
              {t('components.sendMessageModal.deliveryChannels')}
            </span>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const active = selected.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-label-md text-label-md transition-all ${
                      active
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Icon name={active ? 'check_box' : channel.icon} className="text-[18px]" />
                    {channel.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
