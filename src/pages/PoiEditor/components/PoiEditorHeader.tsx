import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import { POI_STATUS_CONFIG, POI_STATUS_OPTIONS } from '../../../constants/poi';
import { ROUTES } from '../../../constants/routes';
import type { PoiStatus } from '../../../types/admin';

interface PoiEditorHeaderProps {
  /** null khi đang thêm POI mới */
  poiId: string | null;
  /** Tên rút gọn của POI đã lưu */
  poiName: string;
  status: PoiStatus;
  onStatusChange: (status: PoiStatus) => void;
  onCancel: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export default function PoiEditorHeader({
  poiId,
  poiName,
  status,
  onStatusChange,
  onCancel,
  onPreview,
  onSave,
}: PoiEditorHeaderProps) {
  const statusConfig = POI_STATUS_CONFIG[status];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center text-xs text-slate-500">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1 text-slate-500 transition-colors hover:text-teal-700"
        >
          <Icon name="home" className="text-[16px] text-slate-400" />
          <span>Quản trị hệ thống</span>
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <Link
          to={ROUTES.LOCATIONS}
          className="flex items-center gap-1 text-slate-500 transition-colors hover:text-teal-700"
        >
          <Icon name="pin_drop" className="text-[16px]" />
          <span>Quản lý điểm đến POI</span>
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <div className="flex items-center gap-1 font-semibold text-slate-800">
          <Icon
            name={poiId ? 'edit_location' : 'add_location_alt'}
            className="text-[16px] text-teal-600"
          />
          <span>
            Thêm / Chỉnh sửa POI: {poiId ? poiName : 'POI mới'}{' '}
            {poiId && <span className="text-label-sm font-medium text-outline">(Mã: {poiId})</span>}
          </span>
        </div>
      </div>

      {/* Thanh tiêu đề + thao tác nhanh */}
      <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm xl:flex-row xl:items-center">
        <div className="flex flex-col gap-space-xs">
          <Link
            to={ROUTES.LOCATIONS}
            className="group inline-flex w-fit items-center gap-space-xs font-label-md text-label-md text-primary transition-colors hover:text-surface-tint"
          >
            <Icon
              name="arrow_back"
              className="text-[18px] transition-transform group-hover:-translate-x-0.5"
            />
            <span>Quay lại danh sách POI</span>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              {poiId ? (
                <>
                  Chỉnh sửa thông tin POI: {poiName}{' '}
                  <span className="text-title-md font-medium tracking-normal text-outline">
                    (Mã: {poiId})
                  </span>
                </>
              ) : (
                'Thêm điểm đến POI mới'
              )}
            </h1>
            {/* Badge trạng thái — bấm để đổi trạng thái hiển thị */}
            <label
              title="Đổi trạng thái hiển thị"
              className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-space-sm py-1 font-label-sm text-label-sm font-semibold shadow-xs ${statusConfig.badgeClass}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${status === 'active' ? 'animate-pulse bg-secondary' : statusConfig.dotClass}`}
              />
              {statusConfig.longLabel}
              <Icon name="expand_more" className="text-[14px]" />
              <select
                aria-label="Trạng thái POI"
                value={status}
                onChange={(event) => {
                  const next = POI_STATUS_OPTIONS.find(
                    (option) => option.value === event.target.value,
                  );
                  if (next) onStatusChange(next.value);
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {POI_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-space-sm self-start xl:self-center">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-surface-container-low px-space-md py-2.5 font-label-md text-label-md text-on-surface-variant shadow-xs transition-all hover:bg-surface-container hover:text-on-surface"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-full bg-secondary-container/40 px-space-md py-2.5 font-label-md text-label-md font-semibold text-secondary shadow-xs transition-all hover:bg-secondary-container"
          >
            <Icon name="smartphone" className="text-[18px]" />
            <span>Xem thử hiển thị App Mobile</span>
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-surface-tint"
          >
            <Icon name="save" className="text-[18px]" />
            <span>{poiId ? 'Lưu thay đổi POI' : 'Tạo POI mới'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
