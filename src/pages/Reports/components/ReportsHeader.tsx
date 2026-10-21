import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';

interface ReportsHeaderProps {
  onExportPdf: () => void;
  onExportCsv: () => void;
  onOpenAi: () => void;
}

const TOOL_BUTTON_CLASS =
  'flex h-10 items-center gap-2 rounded-xl border border-surface-container bg-surface-container-lowest px-3.5 shadow-xs transition-all hover:border-primary/40 hover:text-primary';

export default function ReportsHeader({ onExportPdf, onExportCsv, onOpenAi }: ReportsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
          <Link to={ADMIN_ROOT_CRUMB.to ?? '/'} className="hover:text-primary">
            {ADMIN_ROOT_CRUMB.label}
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="font-semibold text-primary">{t('nav.reports')}</span>
        </nav>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-[11px] font-bold tracking-wider text-on-secondary-container uppercase">
            Business Intelligence
          </span>
          <span className="flex items-center gap-1.5 font-body-sm text-[12px] text-on-surface-variant">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            {t('pages.reports.live')}
          </span>
        </div>
        <h1 className="font-display-sm text-[26px] font-bold tracking-tight text-on-surface md:text-[28px]">
          {t('pages.reports.title')}
        </h1>
        <p className="mt-0.5 font-body-md text-[14px] text-on-surface-variant">
          {t('pages.reports.description')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0 lg:flex-nowrap print:hidden">
        <button
          type="button"
          onClick={onExportPdf}
          className={`${TOOL_BUTTON_CLASS} text-on-surface`}
        >
          <Icon name="description" className="text-[19px] text-tertiary" />
          <span className="font-label-md text-[13px] font-medium">
            {t('reports.reportsHeader.exportPdf')}
          </span>
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          className={`${TOOL_BUTTON_CLASS} text-on-surface`}
        >
          <Icon name="table_view" className="text-[19px] text-primary" />
          <span className="font-label-md text-[13px] font-medium">
            {t('reports.reportsHeader.exportCsvExcel')}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenAi}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-medium text-on-primary shadow-sm shadow-primary/20 transition-all hover:bg-primary-container"
        >
          <Icon name="insights" className="text-[19px]" />
          <span className="font-label-md text-[13px]">{t('reports.reportsHeader.aiAnalysis')}</span>
        </button>
      </div>
    </div>
  );
}
