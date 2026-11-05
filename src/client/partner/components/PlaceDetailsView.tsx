import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import PlaceMap from '@/components/common/PlaceMap';
import TypeChips from '@/components/common/TypeChips';
import { placeTypesOf } from '@/components/common/typePickerUtils';
import type { PlaceContent } from '@/client/api/types';
import PartnerSection from '@/client/partner/components/PartnerSection';
import { formatMoney, hourText, DAY_LABELS, priceLabel } from '@/client/partner/placeFormat';

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-t border-[#E9EEEE] py-2.5 first:border-t-0">
      <dt className="shrink-0 text-[12px] text-client-muted">{label}</dt>
      <dd className="text-right text-[13px] font-semibold break-words text-client-ink">{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[12px] text-client-muted italic">{text}</p>;
}

/**
 * Nội dung một địa điểm — cùng bố cục với trang xem/duyệt bên admin:
 * cột trái Hình ảnh, Mô tả, Giờ mở cửa + Bảng giá; cột phải Thông tin địa điểm + bản đồ.
 * Dùng cho bản đang hiển thị lẫn bản đề xuất. {@code emptyHint}: gợi ý cách bổ sung mục còn trống.
 */
export default function PlaceDetailsView({
  place,
  emptyHint,
}: {
  place: PlaceContent;
  emptyHint?: string;
}) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  const images = [...place.images].sort((a, b) => Number(b.primary) - Number(a.primary));
  const [cover, ...rest] = images;
  const hours = [...place.openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const withHint = (text: string) => (emptyHint ? `${text}. ${emptyHint}` : `${text}.`);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        <PartnerSection icon="photo_library" title="Hình ảnh">
          {cover ? (
            <>
              <a
                href={cover.url}
                target="_blank"
                rel="noreferrer"
                className="relative block overflow-hidden rounded-xl"
              >
                <img src={cover.url} alt="" className="h-60 w-full object-cover md:h-72" />
                <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">
                  Ảnh bìa
                </span>
              </a>
              {rest.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {rest.map((image) => (
                    <a
                      key={image.url}
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-lg"
                    >
                      <img src={image.url} alt="" className="h-16 w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-client-field py-10 text-client-muted">
              <Icon name="hide_image" className="text-[34px]" />
              <span className="text-[12px]">{withHint('Chưa có ảnh')}</span>
            </div>
          )}
        </PartnerSection>

        <PartnerSection icon="description" title="Mô tả">
          {place.description ? (
            <p className="text-[13px] leading-[20px] whitespace-pre-line text-client-ink">
              {place.description}
            </p>
          ) : (
            <Empty text={withHint('Chưa có mô tả')} />
          )}
        </PartnerSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PartnerSection icon="schedule" title="Giờ mở cửa">
            {hours.length === 0 ? (
              <Empty text={withHint('Chưa khai báo giờ mở cửa')} />
            ) : (
              <dl>
                {hours.map((hour) => (
                  <Row
                    key={hour.dayOfWeek}
                    label={DAY_LABELS[hour.dayOfWeek]}
                    value={
                      <span className={hour.closed ? 'text-client-danger' : undefined}>
                        {hourText(hour)}
                      </span>
                    }
                  />
                ))}
              </dl>
            )}
          </PartnerSection>
          <PartnerSection icon="payments" title="Bảng giá">
            {place.prices.length === 0 ? (
              <Empty text={withHint('Chưa khai báo giá')} />
            ) : (
              <dl>
                {place.prices.map((price, index) => (
                  <Row
                    key={index}
                    label={priceLabel(price)}
                    value={formatMoney(price.amount, price.currency)}
                  />
                ))}
              </dl>
            )}
          </PartnerSection>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <PartnerSection icon="category" title="Dịch vụ & loại hình">
          <TypeChips {...placeTypesOf(place)} />
        </PartnerSection>
        <PartnerSection icon="storefront" title="Thông tin địa điểm">
          <dl>
            <Row label="Tỉnh/thành" value={place.province?.name ?? '—'} />
            <Row label="Địa chỉ" value={place.address} />
            <Row label="Số điện thoại" value={place.phone ?? '—'} />
            <Row
              label="Website"
              value={
                place.website ? (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {place.website}
                  </a>
                ) : (
                  '—'
                )
              }
            />
          </dl>
          <div className="mt-3 overflow-hidden rounded-xl border border-client-line">
            <PlaceMap latitude={place.latitude} longitude={place.longitude} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-client-muted tabular-nums">
              {place.latitude}, {place.longitude}
            </span>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-primary hover:underline"
            >
              <Icon name="open_in_new" className="text-[16px]" />
              Mở Google Maps
            </a>
          </div>
        </PartnerSection>
      </div>
    </div>
  );
}
