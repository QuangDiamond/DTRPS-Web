import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/common';
import { useAuth, useIdleLogout } from '@/hooks';

/** Còn 60 giây là hết phiên vì không thao tác: hỏi tiếp tục hay đăng xuất */
export default function IdleWarning() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { secondsLeft, stayActive } = useIdleLogout();
  if (secondsLeft === null) return null;
  return (
    <Modal
      title={t('session.warnTitle')}
      onClose={stayActive}
      footer={
        <>
          <Button variant="neutral" icon="logout" onClick={logout}>
            {t('session.warnLogout')}
          </Button>
          <Button icon="play_arrow" onClick={stayActive}>
            {t('session.warnStay')}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Icon name="timer" className="text-[26px]" />
        </span>
        <div className="font-body-md text-body-md text-on-surface-variant">
          <p>{t('session.warnMessage')}</p>
          <p className="mt-2 font-headline-sm text-headline-sm text-on-surface tabular-nums">
            {t('session.warnCountdown', { seconds: secondsLeft })}
          </p>
        </div>
      </div>
    </Modal>
  );
}
