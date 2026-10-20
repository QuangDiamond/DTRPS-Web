import { useState } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import NotificationRulesFields from '../../../components/notifications/NotificationRulesFields';
import { countEnabledChannels } from '../../../utils/notificationRules';
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
          <Button variant="neutral" onClick={onClose}>
            Hủy
          </Button>
          <Button
            icon="save"
            disabled={countEnabledChannels(draft) === 0}
            onClick={() => onSave(draft)}
          >
            Lưu quy tắc
          </Button>
        </>
      }
    >
      <NotificationRulesFields rules={draft} onChange={setDraft} />
    </Modal>
  );
}
