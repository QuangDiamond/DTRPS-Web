import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/common';
import type { ReportInsight } from '@/types';
import { formatTimestamp } from '@/utils/format';

interface AiInsightsModalProps {
  insights: ReportInsight[];
  generatedAt: string;
  scopeLabel: string;
  onClose: () => void;
}

const TONE_CLASSES: Record<ReportInsight['tone'], string> = {
  primary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  error: 'bg-error-container text-on-error-container',
};

export default function AiInsightsModal({
  insights,
  generatedAt,
  scopeLabel,
  onClose,
}: AiInsightsModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('reports.aiInsightsModal.aiAnalysis')}
      description={t('reports.aiInsightsModal.automatedInsightsCompiledAt', {
        scopeLabel,
        generatedAt: formatTimestamp(generatedAt),
      })}
      size="lg"
      onClose={onClose}
      footer={<Button onClick={onClose}>{t('reports.aiInsightsModal.gotIt')}</Button>}
    >
      <ul className="flex flex-col gap-3">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="flex items-start gap-3 rounded-2xl border border-surface-container bg-surface-container-low/60 p-4"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[insight.tone]}`}
            >
              <Icon name={insight.icon} className="text-[19px]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-md text-[14px] font-semibold text-on-surface">
                {insight.title}
              </span>
              <span className="font-body-sm text-[13px] text-on-surface-variant">
                {insight.detail}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
