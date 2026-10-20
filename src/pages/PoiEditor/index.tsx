import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Icon from '../../components/common/Icon';
import { EMPTY_POI_VALUES } from '../../constants/poi';
import { poiEditPath, ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { usePois } from '../../hooks/usePois';
import { useToast } from '../../hooks/useToast';
import type { Poi, PoiFormValues, PoiPhoto } from '../../types/admin';
import { shortPoiName } from '../../utils/poi';
import PoiAiPlannerSection from './components/PoiAiPlannerSection';
import PoiBasicInfoSection from './components/PoiBasicInfoSection';
import PoiContactSection from './components/PoiContactSection';
import PoiEditorFooter from './components/PoiEditorFooter';
import PoiEditorHeader from './components/PoiEditorHeader';
import PoiLocationSection from './components/PoiLocationSection';
import PoiMediaSection from './components/PoiMediaSection';
import PoiMobilePreviewModal from './components/PoiMobilePreviewModal';
import PoiPhotoViewerModal from './components/PoiPhotoViewerModal';
import {
  isSamePoiValues,
  toPoiFormValues,
  validatePoi,
  type PoiFieldChange,
  type PoiFormErrors,
} from './poiFormUtils';

/** Màn Thêm / Chỉnh sửa POI: /admin/locations/new và /admin/locations/:id/edit */
export default function PoiEditorPage() {
  const { id } = useParams();
  const { pois } = usePois();

  if (!id) return <PoiEditorForm key="new" poi={null} />;

  const poi = pois.find((item) => item.id === id);
  if (!poi) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest py-16 text-center shadow-sm">
        <Icon name="wrong_location" className="text-[48px] text-outline" />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Không tìm thấy điểm đến {id}
        </h1>
        <Link
          to={ROUTES.LOCATIONS}
          className="font-label-md text-label-md text-primary hover:underline"
        >
          Quay lại danh sách POI
        </Link>
      </div>
    );
  }

  return <PoiEditorForm key={poi.id} poi={poi} />;
}

function PoiEditorForm({ poi }: { poi: Poi | null }) {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { createPoi, updatePoi } = usePois();
  const { showToast } = useToast();

  const savedValues = poi ? toPoiFormValues(poi) : EMPTY_POI_VALUES;
  const [values, setValues] = useState<PoiFormValues>(savedValues);
  const [errors, setErrors] = useState<PoiFormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<PoiPhoto | null>(null);
  const isDirty = !isSamePoiValues(values, savedValues);
  const uploader = admin?.role ?? 'Quản trị viên';

  // Cho phép rời trang ngay sau khi lưu thành công (lúc đó isDirty chưa kịp cập nhật)
  const allowLeaveRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !allowLeaveRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = useCallback<PoiFieldChange>((key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as keyof PoiFormErrors];
      return next;
    });
  }, []);

  const handleSave = () => {
    const nextErrors = validatePoi(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('Vui lòng kiểm tra lại các trường thông tin chưa hợp lệ', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const cleaned: PoiFormValues = { ...values, name: values.name.trim() };
    if (!poi) {
      const created = createPoi(cleaned);
      allowLeaveRef.current = true;
      showToast(`Đã tạo điểm đến "${shortPoiName(created.name)}" (${created.id})`, 'success');
      navigate(poiEditPath(created.id), { replace: true });
      return;
    }

    if (!isDirty) {
      showToast('Không có thay đổi nào cần lưu', 'info');
      return;
    }
    updatePoi(poi.id, cleaned);
    showToast(`Đã lưu thay đổi cho POI ${poi.id}`, 'success');
  };

  // Điều hướng về danh sách; nếu còn thay đổi chưa lưu, useBlocker sẽ hỏi xác nhận
  const handleCancel = () => navigate(ROUTES.LOCATIONS);

  return (
    <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-space-lg pb-28">
      <PoiEditorHeader
        poiId={poi?.id ?? null}
        poiName={poi ? shortPoiName(poi.name) : ''}
        status={values.status}
        onStatusChange={(status) => handleChange('status', status)}
        onCancel={handleCancel}
        onPreview={() => setShowPreview(true)}
        onSave={handleSave}
      />

      {/* Bố cục 2 cột: form chi tiết (8) / bản đồ & AI (4) */}
      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-8">
          <PoiBasicInfoSection values={values} errors={errors} onChange={handleChange} />
          <PoiMediaSection
            values={values}
            uploader={uploader}
            onChange={handleChange}
            onPreview={setViewingPhoto}
          />
          <PoiContactSection values={values} errors={errors} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-space-lg lg:col-span-4">
          <PoiLocationSection
            poiCode={poi?.id ?? 'POI mới'}
            values={values}
            onChange={handleChange}
          />
          <PoiAiPlannerSection values={values} onChange={handleChange} />
        </div>
      </div>

      <PoiEditorFooter
        isNew={!poi}
        isDirty={isDirty}
        updatedAt={poi?.updatedAt}
        updatedBy={poi?.updatedBy}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {showPreview && (
        <PoiMobilePreviewModal values={values} onClose={() => setShowPreview(false)} />
      )}
      {viewingPhoto && (
        <PoiPhotoViewerModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} />
      )}

      {blocker.state === 'blocked' && (
        <ConfirmModal
          title="Rời trang khi chưa lưu?"
          confirmLabel="Rời trang"
          confirmIcon="logout"
          onConfirm={() => blocker.proceed()}
          onClose={() => blocker.reset()}
        >
          Các thay đổi trên POI {poi ? <strong>{poi.id}</strong> : 'mới'} chưa được lưu và sẽ bị hủy
          nếu bạn rời khỏi trang này.
        </ConfirmModal>
      )}
    </div>
  );
}
