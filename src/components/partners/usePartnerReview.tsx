import { type ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ConfirmModal } from '@/components/common';
import { usePartners, useToast } from '@/hooks';
import type { Partner, TranslationKey } from '@/types';
import { getErrorMessage } from '@/utils/error';
import LockPartnerModal from './LockPartnerModal';
import RejectPartnerModal from './RejectPartnerModal';

type Dialog = { kind: 'approve' | 'reject' | 'lock'; partner: Partner } | null;

export interface PartnerReview {
  approve: (partner: Partner) => void;
  reject: (partner: Partner) => void;
  lock: (partner: Partner) => void;
  unlock: (partner: Partner) => void;
  /** Hộp thoại xác nhận — đặt một lần trong trang */
  dialogs: ReactNode;
}

/**
 * Thao tác xét duyệt hồ sơ đối tác (gọi API thật), dùng chung cho danh sách & chi tiết.
 * onDone nhận hồ sơ mới nhất sau khi thao tác thành công.
 */
export function usePartnerReview(onDone?: (partner: Partner) => void): PartnerReview {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const partners = usePartners();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  const run = async (task: Promise<Partner>, successKey: TranslationKey) => {
    setBusy(true);
    try {
      const updated = await task;
      showToast(t(successKey, { name: updated.name }));
      setDialog(null);
      onDone?.(updated);
    } catch (error) {
      showToast(t('partnerAdmin.toast.failed', { message: getErrorMessage(error) }), 'error');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (!busy) setDialog(null);
  };

  let dialogs: ReactNode = null;
  if (dialog?.kind === 'approve') {
    dialogs = (
      <ConfirmModal
        title={t('partnerAdmin.approve.title')}
        confirmLabel={t('partnerAdmin.approve.confirm')}
        confirmIcon="verified"
        onConfirm={() =>
          void run(partners.approve(dialog.partner.id), 'partnerAdmin.toast.approved')
        }
        onClose={close}
      >
        <Trans
          i18nKey="partnerAdmin.approve.message"
          values={{ name: dialog.partner.name, email: dialog.partner.ownerEmail }}
          components={{ c0: <strong className="text-on-surface" /> }}
        />
      </ConfirmModal>
    );
  } else if (dialog?.kind === 'reject') {
    dialogs = (
      <RejectPartnerModal
        partner={dialog.partner}
        busy={busy}
        onConfirm={(reason) =>
          void run(partners.reject(dialog.partner.id, reason), 'partnerAdmin.toast.rejected')
        }
        onClose={close}
      />
    );
  } else if (dialog?.kind === 'lock') {
    dialogs = (
      <LockPartnerModal
        partner={dialog.partner}
        affectedListings={0}
        onConfirm={(reason, note) =>
          void run(
            partners.lock(dialog.partner.id, note ? `${reason} — ${note}` : reason),
            'partnerAdmin.toast.locked',
          )
        }
        onClose={close}
      />
    );
  }

  return {
    approve: (partner) => setDialog({ kind: 'approve', partner }),
    reject: (partner) => setDialog({ kind: 'reject', partner }),
    lock: (partner) => setDialog({ kind: 'lock', partner }),
    unlock: (partner) => void run(partners.unlock(partner.id), 'partnerAdmin.toast.unlocked'),
    dialogs,
  };
}
