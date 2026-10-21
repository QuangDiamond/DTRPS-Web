import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import NotificationRulesFields from '@/components/notifications/NotificationRulesFields';
import type { NotificationRules } from '@/types';
import { countEnabledChannels } from '@/utils/notificationRules';

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
  const { t } = useTranslation();
  const [draft, setDraft] = useState<NotificationRules>(rules);

  return (
    <Modal
      title={t('notifications.notificationRulesModal.notificationRuleSettings')}
      description={t('notifications.notificationRulesModal.chooseEventsThatCreate')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            icon="save"
            disabled={countEnabledChannels(draft) === 0}
            onClick={() => onSave(draft)}
          >
            {t('notifications.notificationRulesModal.saveRules')}
          </Button>
        </>
      }
    >
      <NotificationRulesFields rules={draft} onChange={setDraft} />
    </Modal>
  );
}
