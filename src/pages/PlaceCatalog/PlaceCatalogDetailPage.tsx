import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { listingReviewPath, poiEditPath } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import PlaceContentView, { Row, Section } from '@/pages/PlaceReview/components/PlaceContentView';
import { ListingStatusBadge } from '@/pages/PlaceReview/components/StatusBadges';
import { DAY_KEYS, displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { placeCatalogService } from '@/services/placeCatalogService';
import type { CatalogPlaceDetail, CatalogPlaceStatus, OpeningHour } from '@/types';
import { getErrorMessage } from '@/utils/error';
import CatalogStatusBadge from './components/CatalogStatusBadge';
import EditorSection from './components/EditorSection';
import HoursEditor from './components/HoursEditor';
import PhotoManager from './components/PhotoManager';
import PriceManager from './components/PriceManager';
import {
  CATALOG_STATUSES,
  catalogListPath,
  INPUT_CLASS_SELECT,
  placeCode,
  SOURCE_STYLE,
  STATUS_STYLE,
} from './placeCatalogUtils';
import { cleanWeek, fullWeek, invalidDay } from './placeEditorUtils';

/**
 * Chi tiết một địa điểm trong kho: /admin/locations/:id.
 * Địa điểm do admin tạo: sửa trực tiếp ảnh, giờ mở cửa, bảng giá và trạng thái (mỗi thao tác lưu ngay).
 * Địa điểm đối tác: chỉ xem — thay đổi qua luồng duyệt niêm yết / bản sửa.
 */
export default function PlaceCatalogDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<CatalogPlaceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [week, setWeek] = useState<OpeningHour[] | null>(null);
  // Đang sửa: true = mở cả ngày (gửi tuần rỗng), false = theo giờ từng ngày
  const [allDay, setAllDay] = useState(false);
  const [hoursError, setHoursError] = useState('');
  const [savingHours, setSavingHours] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let active = true;
    placeCatalogService
      .get(id)
      .then((next) => {
        if (!active) return;
        setDetail(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  if (error && !detail) {
    return (
      <ErrorState
        title={t('placeCatalog.detail.loadError')}
        message={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!detail) return <PageLoader />;

  const { place, content, editable } = detail;
  const source = SOURCE_STYLE[place.source];

  /** Mọi thao tác trả về địa điểm mới nhất → thay luôn state */
  const apply = async (action: Promise<CatalogPlaceDetail>, message?: string) => {
    const next = await action;
    setDetail(next);
    if (message) showToast(message);
  };

  const changeStatus = async (status: CatalogPlaceStatus) => {
    setSavingStatus(true);
    try {
      await apply(
        placeCatalogService.changeStatus(place.id, status),
        t('placeEditor.statusChanged', { status: t(STATUS_STYLE[status].labelKey) }),
      );
    } catch (statusError) {
      showToast(getErrorMessage(statusError), 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const saveHours = async (days: OpeningHour[]) => {
    const bad = allDay ? undefined : invalidDay(days);
    if (bad) {
      setHoursError(t('placeEditor.errors.hours', { day: t(DAY_KEYS[bad.dayOfWeek]) }));
      return;
    }
    setSavingHours(true);
    setHoursError('');
    try {
      await apply(
        placeCatalogService.replaceHours(place.id, allDay ? [] : cleanWeek(days)),
        t('placeEditor.hours.saved'),
      );
      setWeek(null);
    } catch (saveError) {
      setHoursError(getErrorMessage(saveError));
    } finally {
      setSavingHours(false);
    }
  };

  const editors = editable
    ? {
        photos: (
          <EditorSection
            icon="photo_library"
            title={t('placeEditor.sections.photos')}
            hint={t('placeEditor.sections.photosHint')}
          >
            <PhotoManager
              images={detail.images.map((image) => ({ ...image, key: image.id }))}
              onAdd={(url) => apply(placeCatalogService.addImage(place.id, url))}
              onRemove={(item) => apply(placeCatalogService.deleteImage(place.id, item.key))}
              onSetCover={(item) => apply(placeCatalogService.setPrimaryImage(place.id, item.key))}
            />
          </EditorSection>
        ),
        hours: (
          <EditorSection
            icon="schedule"
            title={t('placeEditor.sections.hours')}
            hint={t('placeEditor.sections.hoursHint')}
            actions={
              week ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={savingHours}
                    onClick={() => {
                      setWeek(null);
                      setHoursError('');
                    }}
                  >
                    {t('placeEditor.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    icon="save"
                    loading={savingHours}
                    onClick={() => void saveHours(week)}
                  >
                    {t('placeEditor.hours.save')}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  icon="edit_calendar"
                  onClick={() => {
                    setWeek(fullWeek(content.openingHours));
                    setAllDay(content.openingHours.length === 0);
                  }}
                >
                  {content.openingHours.length === 0
                    ? t('placeEditor.hours.declare')
                    : t('placeEditor.hours.edit')}
                </Button>
              )
            }
          >
            {week ? (
              <>
                <div
                  role="radiogroup"
                  aria-label={t('placeEditor.hours.mode')}
                  className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1"
                >
                  {[
                    { value: true, icon: 'all_inclusive', label: t('placeEditor.hours.allDay') },
                    { value: false, icon: 'schedule', label: t('placeEditor.hours.custom') },
                  ].map((option) => (
                    <button
                      key={option.icon}
                      type="button"
                      role="radio"
                      aria-checked={allDay === option.value}
                      disabled={savingHours}
                      onClick={() => setAllDay(option.value)}
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-lg font-label-md text-label-md font-bold transition-colors ${
                        allDay === option.value
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <Icon name={option.icon} className="text-[18px]" />
                      {option.label}
                    </button>
                  ))}
                </div>
                {allDay ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {t('placeEditor.hours.allDayHint')}
                  </p>
                ) : (
                  <HoursEditor week={week} onChange={setWeek} disabled={savingHours} />
                )}
              </>
            ) : content.openingHours.length === 0 ? (
              <p className="flex items-center gap-2 font-body-md text-body-md font-semibold text-primary">
                <Icon name="all_inclusive" className="text-[18px]" />
                {t('placeReview.detail.noHours')}
              </p>
            ) : (
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {content.openingHours.map((hour) => (
                  <Row
                    key={hour.dayOfWeek}
                    label={t(DAY_KEYS[hour.dayOfWeek])}
                    value={
                      <span className={hour.closed ? 'text-error' : undefined}>
                        {hour.closed
                          ? t('placeReview.detail.closed')
                          : `${hour.openTime} – ${hour.closeTime}`}
                      </span>
                    }
                  />
                ))}
              </dl>
            )}
            {hoursError && <p className="font-label-sm text-label-sm text-error">{hoursError}</p>}
          </EditorSection>
        ),
        prices: (
          <EditorSection
            icon="payments"
            title={t('placeEditor.sections.prices')}
            hint={t('placeEditor.sections.pricesHint')}
          >
            <PriceManager
              prices={detail.prices.map((price) => ({ ...price, key: price.id }))}
              onAdd={(price) => apply(placeCatalogService.addPrice(place.id, price))}
              onUpdate={(item, price) =>
                apply(placeCatalogService.updatePrice(place.id, item.key, price))
              }
              onRemove={(item) => apply(placeCatalogService.deletePrice(place.id, item.key))}
            />
          </EditorSection>
        ),
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 border-b border-surface-container-high/60 pb-6">
        {/* Về đúng trang + bộ lọc đang xem trước đó, không phải từ trang 1 */}
        <Button
          variant="neutral"
          size="sm"
          icon="arrow_back"
          className="self-start"
          onClick={() => navigate(catalogListPath())}
        >
          {t('placeCatalog.detail.backToList')}
        </Button>
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('placeCatalog.detail.back'), icon: 'location_on', to: catalogListPath() },
            { label: place.name },
          ]}
          title={place.name}
          titleBadge={<CatalogStatusBadge status={place.status} />}
          description={`${t('placeCatalog.detail.placeCode')}: ${placeCode(place.id)}`}
          actions={
            place.listingId ? (
              <Button
                icon="fact_check"
                onClick={() => navigate(listingReviewPath(place.listingId ?? ''))}
              >
                {t('placeCatalog.detail.openReview')}
              </Button>
            ) : editable ? (
              <Button icon="edit" onClick={() => navigate(poiEditPath(place.id))}>
                {t('placeEditor.editInfo')}
              </Button>
            ) : undefined
          }
        />
      </div>

      <PlaceContentView
        place={content}
        editors={editors}
        aside={
          <Section icon="hub" title={t('placeCatalog.detail.sourceTitle')}>
            <dl>
              <Row
                label={t('placeCatalog.table.source')}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name={source.icon} className="text-[18px] text-primary" />
                    {t(source.labelKey)}
                  </span>
                }
              />
              {place.businessName && (
                <Row label={t('placeCatalog.detail.business')} value={place.businessName} />
              )}
              {place.listingStatus && (
                <Row
                  label={t('placeCatalog.detail.listingStatus')}
                  value={<ListingStatusBadge status={place.listingStatus} />}
                />
              )}
              <Row
                label={t('placeCatalog.detail.status')}
                value={
                  editable ? (
                    <select
                      aria-label={t('placeCatalog.detail.status')}
                      value={place.status}
                      disabled={savingStatus}
                      onChange={(event) =>
                        void changeStatus(event.target.value as CatalogPlaceStatus)
                      }
                      className={INPUT_CLASS_SELECT}
                    >
                      {CATALOG_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(STATUS_STYLE[status].labelKey)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <CatalogStatusBadge status={place.status} />
                  )
                }
              />
              <Row
                label={t('placeCatalog.detail.rating')}
                value={
                  place.rating === null
                    ? t('placeCatalog.table.noRating')
                    : `${place.rating} ★ · ${t('placeCatalog.table.reviews', { count: place.reviewCount })}`
                }
              />
              <Row label={t('placeCatalog.detail.created')} value={displayDate(place.createdAt)} />
              <Row label={t('placeCatalog.detail.updated')} value={displayDate(place.updatedAt)} />
            </dl>
            <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
              {editable ? t('placeCatalog.detail.adminPoi') : t('placeEditor.partnerLockedHint')}
            </p>
          </Section>
        }
      />
    </div>
  );
}
