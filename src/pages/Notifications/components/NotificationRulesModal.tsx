import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import NotificationRulesFields, {
  countEnabledChannels,
} from '../../../components/notifications/NotificationRulesFields';
import type { NotificationRules } from '../../../types/admin';

interface NotificationRulesModalProps {
  rules: NotificationRules;
  onSave: (rules: NotificationRules) => void;
  onClose: () => void;
}

/** Modal "Cài đặt quy tắc" — loại sự kiện tạo thông báo, ngưỡng AI và kênh nhận */
export default function NotificationRulesModal({
  rules,
  onSave,
  onClose,
}: NotificationRulesModalProps) {
  const [draft, setDraft] = useState<NotificationRules>(rules);

  return (
    <Modal
      title="Cài đặt quy tắc thông báo"
      description="Chọn sự kiện tạo thông báo, ngưỡng cảnh báo AI và kênh tiếp nhận của quản trị viên"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={countEnabledChannels(draft) === 0}
            onClick={() => onSave(draft)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="save" className="text-[18px]" /> Lưu quy tắc
          </button>
        </>
      }
    >
      <NotificationRulesFields rules={draft} onChange={setDraft} />
    </Modal>
  );
}
