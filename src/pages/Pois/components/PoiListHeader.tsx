import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ROUTES } from '@/constants/routes';

interface PoiListHeaderProps {
  syncing: boolean;
  onSync: () => void;
  onExport: () => void;
  onAdd: () => void;
}

const TOOL_BUTTON_CLASS =
  'inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-space-md py-2.5 font-label-md text-label-md font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-70';

export default function PoiListHeader({ syncing, onSync, onExport, onAdd }: PoiListHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-1 text-[13px] text-on-surface-variant">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1.5 text-outline transition-colors hover:text-primary"
        >
          <Icon name="home" className="text-[18px]" />
          <span>{t('pois.poiListHeader.systemAdministration')}</span>
        </Link>
        <span className="mx-2 font-normal text-outline opacity-60">/</span>
        <div className="flex items-center gap-1.5 font-semibold text-on-surface">
          <Icon name="explore" className="mr-1.5 text-[18px] text-primary" />
          <span>{t('pois.poiListHeader.poiDestinations')}</span>
        </div>
      </nav>

      {/* Tiêu đề & thanh công cụ */}
      <div className="flex flex-col justify-between gap-space-md xl:flex-row xl:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
              {t('pois.poiListHeader.travelDestinationDataHub')}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold whitespace-nowrap text-on-secondary-container">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-primary ${syncing ? 'animate-ping' : ''}`}
              />
              {syncing ? t('pois.poiListHeader.syncing') : t('pois.poiListHeader.aiEngineSync')}
            </span>
          </div>
          <p className="max-w-4xl font-body-md text-body-md text-on-surface-variant">
            {t('pois.poiListHeader.nationwideDatabaseLandmarksHeritage')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <button type="button" disabled={syncing} onClick={onSync} className={TOOL_BUTTON_CLASS}>
            <Icon
              name="sync"
              className={`text-[18px] text-primary ${syncing ? 'animate-spin' : ''}`}
            />
            <span>
              {syncing ? t('pois.poiListHeader.syncing') : t('pois.poiListHeader.syncPoiData')}
            </span>
          </button>
          <button type="button" onClick={onExport} className={TOOL_BUTTON_CLASS}>
            <Icon name="file_download" className="text-[18px] text-primary" />
            <span>{t('pois.poiListHeader.exportPoiCatalog')}</span>
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container"
          >
            <Icon name="add_location_alt" className="text-[20px]" />
            <span>{t('pois.poiListHeader.addNewPoi')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
