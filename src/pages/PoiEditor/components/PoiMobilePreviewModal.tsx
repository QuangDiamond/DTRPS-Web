import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { POI_CATEGORY_CONFIG } from '../../../constants/poi';
import type { PoiFormValues } from '../../../types/admin';
import { shortPoiName } from '../../../utils/poi';

interface PoiMobilePreviewModalProps {
  values: PoiFormValues;
  title?: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
}

/** Bỏ cú pháp Markdown của trình soạn thảo để xem trước dạng văn bản thuần */
const toPlainText = (markdown: string): string =>
  markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|<\/?u>|(^|\s)_|_(\s|$)/g, '$1$2')
    .replace(/^> /gm, '');

/** Mô phỏng màn chi tiết điểm đến trên App Mobile, dùng dữ liệu đang chỉnh sửa */
export default function PoiMobilePreviewModal({
  values,
  title = 'Xem thử hiển thị App Mobile',
  description = 'Bản xem trước dựa trên dữ liệu đang chỉnh sửa (chưa lưu)',
  footer,
  onClose,
}: PoiMobilePreviewModalProps) {
  const category = POI_CATEGORY_CONFIG[values.category];
  const tags = values.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const infoRows = [
    { icon: 'schedule', label: 'Giờ mở cửa', value: values.openingHours },
    { icon: 'payments', label: 'Giá vé', value: values.price },
    { icon: 'timer', label: 'Thời gian gợi ý', value: values.suggestedDuration },
    { icon: 'sunny', label: 'Mùa đẹp nhất', value: values.peakSeason },
  ].filter((row) => row.value.trim());

  return (
    <Modal title={title} description={description} footer={footer} onClose={onClose}>
      <div className="mx-auto w-[300px] overflow-hidden rounded-[2.5rem] border-[10px] border-inverse-surface bg-surface shadow-xl">
        <div className="relative h-[560px] overflow-y-auto">
          {/* Ảnh bìa */}
          <div className="relative h-52 w-full bg-surface-container">
            {values.cover ? (
              <img
                src={values.cover.url}
                alt={values.cover.caption}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-outline">
                <Icon name={category.icon} className="text-[48px]" />
              </div>
            )}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-sm">
                <Icon name="arrow_back" className="text-[18px]" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-error shadow-sm">
                <Icon name="favorite" className="text-[18px]" />
              </span>
            </div>
          </div>

          <div className="-mt-5 flex flex-col gap-3 rounded-t-3xl bg-surface p-4">
            <span
              className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${category.badgeClass}`}
            >
              <Icon name={category.icon} className="text-[12px]" /> {category.label}
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {shortPoiName(values.name) || 'Tên điểm đến'}
            </h3>
            {values.address && (
              <p className="flex items-start gap-1 text-[12px] text-on-surface-variant">
                <Icon name="place" className="mt-0.5 text-[14px] text-primary" /> {values.address}
              </p>
            )}

            {infoRows.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {infoRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 rounded-xl bg-surface-container-low p-2"
                  >
                    <span className="flex items-center gap-1 text-[10px] text-outline">
                      <Icon name={row.icon} className="text-[12px] text-secondary" /> {row.label}
                    </span>
                    <span className="line-clamp-2 text-[11px] font-semibold text-on-surface">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {values.description && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-on-surface">Giới thiệu</span>
                <p className="text-[12px] leading-relaxed whitespace-pre-line text-on-surface-variant">
                  {toPlainText(values.description)}
                </p>
              </div>
            )}

            {values.gallery.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-on-surface">Thư viện ảnh</span>
                <div className="flex gap-2 overflow-x-auto">
                  {values.gallery.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.caption}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {(tags.length > 0 || values.personas.length > 0) && (
              <div className="flex flex-wrap gap-1">
                {[...values.personas, ...tags].map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-secondary-container/40 px-2 py-0.5 text-[10px] font-semibold text-on-secondary-container"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <span className="mt-1 flex items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-[12px] font-semibold text-on-primary">
              <Icon name="add_location_alt" className="text-[16px]" /> Thêm vào lịch trình AI
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
