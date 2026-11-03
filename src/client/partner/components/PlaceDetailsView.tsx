import type { PlaceContent } from '@/client/api/types';
import { formatMoney, hourText, DAY_LABELS, priceLabel } from '@/client/partner/placeFormat';
import { InfoLine } from '@/client/ui/Blocks';

function SubTitle({ children }: { children: string }) {
  return (
    <p className="mt-4 mb-2 text-[11px] font-bold tracking-wide text-client-muted uppercase">
      {children}
    </p>
  );
}

/** Nội dung một địa điểm (thông tin, ảnh, giờ mở cửa, giá) — dùng cho bản hiện tại lẫn bản đề xuất */
export default function PlaceDetailsView({ place }: { place: PlaceContent }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  const images = [...place.images].sort((a, b) => Number(b.primary) - Number(a.primary));
  const hours = [...place.openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image, index) => (
            <a
              key={image.url}
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className={`relative overflow-hidden rounded-xl bg-client-field ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <img
                src={image.url}
                alt=""
                className={`w-full object-cover ${index === 0 ? 'h-full min-h-40' : 'h-20'}`}
              />
              {image.primary && (
                <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  Ảnh bìa
                </span>
              )}
            </a>
          ))}
        </div>
      )}
      <InfoLine
        label="Loại hình"
        value={[place.group?.name, place.category?.name].filter(Boolean).join(' · ') || '—'}
      />
      <InfoLine label="Địa chỉ" value={place.address} />
      <InfoLine label="Tỉnh/thành" value={place.province?.name ?? '—'} />
      <InfoLine
        label="Tọa độ"
        value={
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {place.latitude}, {place.longitude}
          </a>
        }
      />
      <InfoLine label="Số điện thoại" value={place.phone ?? '—'} />
      <InfoLine label="Website" value={place.website ?? '—'} />
      <InfoLine label="Mô tả" value={place.description ?? '—'} />

      <SubTitle>Giờ mở cửa</SubTitle>
      {hours.length === 0 ? (
        <p className="text-[12px] text-client-muted">Chưa khai báo.</p>
      ) : (
        <div className="grid gap-x-6 sm:grid-cols-2">
          {hours.map((hour) => (
            <div key={hour.dayOfWeek} className="flex justify-between py-1 text-[13px]">
              <span className="text-client-muted">{DAY_LABELS[hour.dayOfWeek]}</span>
              <span
                className={hour.closed ? 'text-client-danger' : 'font-semibold text-client-ink'}
              >
                {hourText(hour)}
              </span>
            </div>
          ))}
        </div>
      )}

      <SubTitle>Bảng giá</SubTitle>
      {place.prices.length === 0 ? (
        <p className="text-[12px] text-client-muted">Chưa khai báo.</p>
      ) : (
        <div className="flex flex-col">
          {place.prices.map((price, index) => (
            <div key={index} className="flex justify-between gap-3 py-1 text-[13px]">
              <span className="text-client-muted">{priceLabel(price)}</span>
              <span className="font-semibold text-client-ink">
                {formatMoney(price.amount, price.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
