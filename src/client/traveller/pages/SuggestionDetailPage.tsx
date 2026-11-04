import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  getMatchLabel,
  getMatchScore,
  getSuggestedPlace,
  INTEREST_TAG_LABELS,
} from '@/client/traveller/data/suggestedPlaces';
import { useTraveller } from '@/client/traveller/travellerContext';
import { Dialog } from '@/client/ui/Overlay';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

type DetailTab = 'intro' | 'reviews' | 'photos' | 'mentions';
type PhotoFilter = 'all' | 'cover' | 'highlights';

interface PhotoItem {
  id: string;
  uri: string;
  name: string;
  kind: 'cover' | 'highlights';
}

type PhotoViewer =
  { mode: 'gallery' } | { mode: 'preview'; photo: PhotoItem; fromGallery: boolean } | null;

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'intro', label: 'Giới thiệu' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'mentions', label: 'Đề cập' },
];

const PHOTO_FILTERS: { id: PhotoFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả ảnh' },
  { id: 'cover', label: 'Ảnh chính' },
  { id: 'highlights', label: 'Điểm nổi bật' },
];

function RatingStars({ rating, size = 'text-[19px]' }: { rating: number; size?: string }) {
  const score = Math.max(0, Math.min(5, rating));
  return (
    <span className="flex items-center" aria-label={`${score.toFixed(1)} trên 5 sao`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const remaining = score - index;
        const name = remaining >= 0.75 ? 'star' : remaining >= 0.25 ? 'star_half' : 'star';
        return (
          <Icon
            key={index}
            name={name}
            filled={remaining >= 0.25}
            className={`${size} text-[#F59E38]`}
          />
        );
      })}
      <span className="ml-2 text-[14px] font-extrabold text-[#F59E38]">{score.toFixed(1)}</span>
    </span>
  );
}

/** Chi tiết gợi ý điểm đến — theo SuggestionDetailScreen của mobile */
export default function SuggestionDetailPage() {
  const { placeId } = useParams();
  const { plan, togglePlanPlace, savedSuggestions, toggleSavedSuggestion } = useTraveller();
  const place = getSuggestedPlace(placeId);
  const [imageIndex, setImageIndex] = useState(0);
  const [tab, setTab] = useState<DetailTab>('intro');
  const [showInfo, setShowInfo] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all');
  const [viewer, setViewer] = useState<PhotoViewer>(null);

  if (!plan) return <Navigate to={CLIENT_ROUTES.TRIP_PLAN} replace />;
  if (!place) return <Navigate to={CLIENT_ROUTES.TRIP_SUGGESTIONS} replace />;

  const matchScore = getMatchScore(place, plan.interests);
  const favorite = savedSuggestions.includes(place.id);
  const inPlan = plan.placeIds.includes(place.id);

  // Chỉ dùng ảnh của chính địa điểm và các điểm nổi bật
  const photos: PhotoItem[] = [
    { id: 'cover', uri: place.image, name: place.name, kind: 'cover' },
    ...place.highlights.map((item, index) => ({
      id: `highlight-${index}`,
      uri: item.image,
      name: item.name,
      kind: 'highlights' as const,
    })),
  ];
  const filteredPhotos = photos.filter(
    (item) => photoFilter === 'all' || item.kind === photoFilter,
  );
  const [mainPhoto, rightTop, rightBottom] = filteredPhotos;

  const infoRows = [
    { icon: 'schedule', label: 'Giờ mở cửa', value: place.info.openHours },
    { icon: 'confirmation_number', label: 'Giá vé', value: place.info.price },
    { icon: 'hourglass_empty', label: 'Thời gian gợi ý', value: place.info.duration },
    { icon: 'sunny', label: 'Thời điểm đẹp nhất', value: place.info.bestTime },
  ];

  const openPhoto = (photo: PhotoItem, fromGallery = false) =>
    setViewer({ mode: 'preview', photo, fromGallery });
  const closeViewer = () =>
    setViewer(viewer?.mode === 'preview' && viewer.fromGallery ? { mode: 'gallery' } : null);
  const step = (delta: number) =>
    setImageIndex((current) => (current + delta + photos.length) % photos.length);

  return (
    <div className="mx-auto max-w-3xl pb-36 md:pb-4">
      <PageBar
        title="Chi tiết gợi ý điểm đến"
        backTo={CLIENT_ROUTES.TRIP_SUGGESTIONS}
        actions={
          <BarIconButton
            icon="favorite"
            label={favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            active={favorite}
            onClick={() => toggleSavedSuggestion(place.id)}
          />
        }
      />

      <div className="relative h-[300px] overflow-hidden rounded-[24px] bg-[#D8EDE7]">
        <img
          src={photos[imageIndex].uri}
          alt={photos[imageIndex].name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13364A]"
            >
              <Icon name="chevron_left" className="text-[24px]" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Ảnh sau"
              className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13364A]"
            >
              <Icon name="chevron_right" className="text-[24px]" />
            </button>
          </>
        )}
        <div className="absolute right-0 bottom-5 left-0 flex justify-center gap-1.5">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setImageIndex(index)}
              aria-label={`Ảnh ${index + 1}`}
              className={`h-1.5 rounded-full ${index === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      <div
        className="sticky top-16 z-10 mt-3 flex justify-around rounded-2xl border-b border-[#EDF0F5] bg-white px-2"
        role="tablist"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-2.5 py-3.5 text-[12px] font-bold ${
              tab === item.id
                ? 'border-[#087A78] text-[#087A78]'
                : 'border-transparent text-[#13364A]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[350px] rounded-[20px] bg-white px-4 pt-4 pb-8">
        {tab === 'intro' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#F8F8FF] p-3">
                <p className="text-[11px] font-semibold text-[#13364A]">Độ phù hợp với bạn</p>
                <p className="mt-0.5 text-[20px] font-extrabold text-[#075C66]">{matchScore}%</p>
                <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-[#DDE4EC]">
                  <div
                    className="h-full rounded-full bg-[#075C66]"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 rounded-2xl bg-[#E2FAF5] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C3F8F0] text-[#075C66]">
                  <Icon name="auto_awesome" className="text-[18px]" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-[#075C66]">
                    {getMatchLabel(matchScore)}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#72818C]">
                    Dựa trên sở thích, ngân sách và phong cách của bạn
                  </span>
                </span>
              </div>
            </div>

            <h1 className="mt-4 text-[22px] font-extrabold text-[#13364A]">{place.name}</h1>
            <div className="mt-2">
              <RatingStars rating={place.rating} />
            </div>
            <p className="mt-2 flex items-center gap-1 text-[13px] text-[#72818C]">
              <Icon name="location_on" className="text-[17px] text-[#087A78]" />
              {place.location}
            </p>
            <p className="mt-3 text-[13px] leading-5 text-[#4A5A66]">{place.description}</p>

            <h2 className="mt-5 mb-2 text-[15px] font-bold text-[#13364A]">Điểm nổi bật</h2>
            <div className="grid grid-cols-3 gap-2">
              {place.highlights.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  type="button"
                  onClick={() => openPhoto(photos[index + 1])}
                  className="text-center"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="h-[72px] w-full rounded-xl object-cover md:h-24"
                  />
                  <span className="mt-1 line-clamp-2 block text-[11px] text-[#13364A]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>

            <h2 className="mt-5 mb-2 text-[15px] font-bold text-[#13364A]">
              Phù hợp với sở thích của bạn
            </h2>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => {
                const matched = plan.interests.includes(tag);
                return (
                  <span
                    key={tag}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                      matched ? 'bg-[#C3F8F0] text-[#075C66]' : 'bg-[#EBEDFF] text-[#445577]'
                    }`}
                  >
                    <Icon
                      name={matched ? 'check_circle' : 'sell'}
                      filled={matched}
                      className="text-[14px]"
                    />
                    {INTEREST_TAG_LABELS[tag] ?? tag}
                  </span>
                );
              })}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl bg-[#F8F8FF]">
              <button
                type="button"
                onClick={() => setShowInfo((previous) => !previous)}
                aria-expanded={showInfo}
                className="flex w-full items-center justify-between px-4 py-3.5 text-[14px] font-bold text-[#13364A]"
              >
                Thông tin hữu ích
                <Icon name={showInfo ? 'expand_less' : 'expand_more'} className="text-[22px]" />
              </button>
              {showInfo && (
                <div className="px-4 pb-3">
                  {infoRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center border-t border-[#E6E9F2] py-2.5"
                    >
                      <Icon name={row.icon} className="text-[18px] text-[#087A78]" />
                      <span className="ml-2 flex-1 text-[12px] text-[#72818C]">{row.label}</span>
                      <span className="max-w-[55%] text-right text-[12px] font-bold text-[#13364A]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            <h2 className="text-[20px] font-extrabold text-[#13364A]">Đánh giá địa điểm</h2>
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-[#F8F8FF] px-4 py-7">
              <p className="text-[42px] font-extrabold text-[#13364A]">{place.rating.toFixed(1)}</p>
              <RatingStars rating={place.rating} size="text-[24px]" />
            </div>
            <h3 className="mt-6 mb-3 text-[16px] font-bold text-[#13364A]">Nhận xét từ du khách</h3>
            <div className="flex flex-col items-center rounded-2xl border border-[#E8EBF5] px-5 py-8 text-center">
              <Icon name="chat" className="text-[38px] text-[#A7B8C8]" />
              <p className="mt-3 text-[13px] font-semibold text-[#13364A]">
                Chưa có dữ liệu đánh giá thực tế
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#8494A7]">
                Sau khi kết nối dịch vụ dữ liệu địa điểm, các đánh giá và nhận xét sẽ được hiển thị
                tại đây.
              </p>
            </div>
          </div>
        )}

        {tab === 'photos' && (
          <div>
            <h2 className="text-[19px] font-extrabold text-[#13364A]">Hình ảnh {place.name}</h2>
            <p className="mt-1 mb-3 text-[11px] text-[#72818C]">
              {photos.length} hình ảnh từ dữ liệu địa điểm
            </p>
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {PHOTO_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPhotoFilter(filter.id)}
                  aria-pressed={photoFilter === filter.id}
                  className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-semibold ${
                    photoFilter === filter.id
                      ? 'bg-[#DDF7F1] text-[#075C66]'
                      : 'bg-[#EEF0F4] text-[#637184]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {mainPhoto ? (
              <div className="flex h-[260px] gap-2 md:h-[340px]">
                <button
                  type="button"
                  onClick={() => openPhoto(mainPhoto)}
                  className={`overflow-hidden rounded-lg ${rightTop ? 'flex-[2.3]' : 'flex-1'}`}
                >
                  <img
                    src={mainPhoto.uri}
                    alt={mainPhoto.name}
                    className="h-full w-full object-cover"
                  />
                </button>
                {rightTop && (
                  <div className="flex flex-1 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openPhoto(rightTop)}
                      className="flex-1 overflow-hidden rounded-lg"
                    >
                      <img
                        src={rightTop.uri}
                        alt={rightTop.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {rightBottom ? (
                      <div className="relative flex-1 overflow-hidden rounded-lg">
                        <button
                          type="button"
                          onClick={() => openPhoto(rightBottom)}
                          className="h-full w-full"
                        >
                          <img
                            src={rightBottom.uri}
                            alt={rightBottom.name}
                            className="h-full w-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewer({ mode: 'gallery' })}
                          className="absolute right-1 bottom-2 left-1 rounded-full bg-white/95 py-2 text-[10px] font-bold text-[#13364A]"
                        >
                          Xem tất cả ảnh
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewer({ mode: 'gallery' })}
                        className="flex flex-1 flex-col items-center justify-center rounded-lg bg-[#EBEDFF] text-[#075C66]"
                      >
                        <Icon name="photo_library" className="text-[22px]" />
                        <span className="mt-1 text-[11px] font-bold">Xem tất cả ảnh</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-2xl bg-[#F3F4F6] px-4 py-8 text-center text-[13px] text-[#72818C]">
                Chưa có ảnh trong danh mục này.
              </p>
            )}
            <button
              type="button"
              onClick={() => setViewer({ mode: 'gallery' })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#B8EAE3] bg-[#F0FCF9] py-3 text-[13px] font-bold text-[#075C66]"
            >
              <Icon name="photo_library" className="text-[19px]" />
              Xem tất cả {photos.length} ảnh
            </button>
          </div>
        )}

        {tab === 'mentions' && (
          <div>
            <h2 className="text-[20px] font-extrabold text-[#13364A]">Thông tin liên quan</h2>
            <div className="mt-4 rounded-2xl bg-[#F8F8FF] p-4">
              <p className="flex items-center gap-2 text-[15px] font-bold text-[#13364A]">
                <Icon name="article" className="text-[22px] text-[#087A78]" />
                {place.name}
              </p>
              <p className="mt-3 text-[13px] leading-6 text-[#53687A]">{place.description}</p>
            </div>
            <h3 className="mt-5 mb-3 text-[15px] font-bold text-[#13364A]">
              Điểm nổi bật được giới thiệu
            </h3>
            {place.highlights.map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                onClick={() => openPhoto(photos[index + 1])}
                className="mb-3 flex w-full items-center rounded-2xl border border-[#ECEEF6] p-2 text-left hover:bg-[#F8F8FF]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-[66px] w-[72px] rounded-[11px] object-cover"
                />
                <span className="ml-3 flex-1 text-[13px] font-semibold text-[#13364A]">
                  {item.name}
                </span>
                <Icon name="chevron_right" className="text-[21px] text-[#8CA0B1]" />
              </button>
            ))}
            <p className="mt-2 text-[11px] leading-5 text-[#8998A8]">
              Nội dung từ dữ liệu giới thiệu hiện có, chưa phải bài viết hay lượt đề cập từ bên thứ
              ba.
            </p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[62px] z-20 border-t border-[#EDF0F5] bg-white px-4 pt-2.5 pb-2 md:static md:mt-4 md:flex md:gap-3 md:rounded-[20px] md:border-0 md:p-3">
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN_SELECTED}
          className="mb-2.5 flex h-12 items-center justify-center gap-2 rounded-full border border-[#B8EAE3] bg-[#F0FCF9] text-[14px] font-bold text-[#075C66] md:mb-0 md:flex-1"
        >
          <Icon name="assignment" className="text-[20px]" />
          Xem kế hoạch của tôi ({plan.placeIds.length})
          <Icon name="chevron_right" className="text-[20px]" />
        </Link>
        <button
          type="button"
          onClick={() => togglePlanPlace(place.id)}
          aria-pressed={inPlan}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold md:flex-1 ${
            inPlan ? 'bg-[#C3F8F0] text-[#075C66]' : 'bg-[#075C66] text-white hover:bg-primary'
          }`}
        >
          <Icon
            name={inPlan ? 'check_circle' : 'add_location_alt'}
            filled={inPlan}
            className="text-[19px]"
          />
          {inPlan ? 'Đã thêm vào kế hoạch' : 'Thêm vào kế hoạch'}
        </button>
      </div>

      {viewer && (
        <Dialog
          label={viewer.mode === 'gallery' ? 'Tất cả ảnh' : viewer.photo.name}
          onClose={closeViewer}
          className={viewer.mode === 'preview' ? 'max-w-4xl bg-[#101419]!' : 'max-w-3xl'}
        >
          <div
            className={`flex h-[58px] items-center justify-between px-4 ${
              viewer.mode === 'gallery' ? 'border-b border-[#EEF0F5] text-[#13364A]' : 'text-white'
            }`}
          >
            <button
              type="button"
              onClick={closeViewer}
              aria-label={viewer.mode === 'gallery' ? 'Đóng' : 'Quay lại'}
              className="flex h-10 w-10 items-center justify-center"
            >
              <Icon
                name={viewer.mode === 'gallery' ? 'close' : 'arrow_back'}
                className="text-[25px]"
              />
            </button>
            <p className="text-[16px] font-bold">
              {viewer.mode === 'gallery' ? `Tất cả ảnh (${photos.length})` : viewer.photo.name}
            </p>
            <span className="w-10" />
          </div>
          {viewer.mode === 'gallery' ? (
            <div className="grid grid-cols-2 gap-3.5 p-3 md:grid-cols-3">
              {photos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openPhoto(item, true)}
                  className="text-left"
                >
                  <img src={item.uri} alt="" className="h-[150px] w-full rounded-xl object-cover" />
                  <span className="mt-1.5 block truncate text-[11px] text-[#13364A]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-3">
              <img
                src={viewer.photo.uri}
                alt={viewer.photo.name}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
