import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotFoundState, UnsavedChangesDialog } from '@/components/common';
import { EMPTY_POI_VALUES } from '@/constants/poi';
import { poiEditPath, ROUTES } from '@/constants/routes';
import { useAuth, usePois, useToast, useUnsavedChangesGuard } from '@/hooks';
import type { Poi, PoiFormValues, PoiPhoto } from '@/types';
import { shortPoiName } from '@/utils/poi';
import PoiAiSearchSection from './components/PoiAiSearchSection';
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
  type PoiFieldChange,
  type PoiFormErrors,
  toPoiFormValues,
  validatePoi,
} from './poiFormUtils';

const REINDEX_DELAY_MS = 900;

/** Các trường dùng để sinh embedding tìm kiếm ngữ nghĩa */
const SEMANTIC_FIELDS = new Set<keyof PoiFormValues>([
  'name',
  'category',
  'subCategory',
  'highlight',
  'tags',
  'description',
  'address',
  'personas',
  'peakSeason',
  'idealTime',
]);

/** Màn Thêm / Chỉnh sửa POI: /admin/locations/new và /admin/locations/:id/edit */
export default function PoiEditorPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { id } = useParams();
  const { pois } = usePois();

  if (!id) return <PoiEditorForm key="new" poi={null} />;

  const poi = pois.find((item) => item.id === id);
  if (!poi) {
    return (
      <NotFoundState
        icon="wrong_location"
        title={t('poiEditor.page.destinationNotFound', { id })}
        backTo={ROUTES.POIS}
        backLabel={t('poiEditor.page.backPoiList')}
      />
    );
  }

  return <PoiEditorForm key={poi.id} poi={poi} />;
}

function PoiEditorForm({ poi }: { poi: Poi | null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { createPoi, updatePoi, reindexPois } = usePois();
  const { showToast } = useToast();

  const savedValues = poi ? toPoiFormValues(poi) : EMPTY_POI_VALUES;
  const [values, setValues] = useState<PoiFormValues>(savedValues);
  const [errors, setErrors] = useState<PoiFormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<PoiPhoto | null>(null);
  const isDirty = !isSamePoiValues(values, savedValues);
  const uploader = admin?.role ?? t('common.administrator');

  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  const [reindexing, setReindexing] = useState(false);

  const handleChange = useCallback<PoiFieldChange>((key, value) => {
    // Nội dung ngữ nghĩa thay đổi → embedding cũ không còn đúng, cần index lại
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(SEMANTIC_FIELDS.has(key) ? { vectorEmbedded: false } : {}),
    }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as keyof PoiFormErrors];
      return next;
    });
  }, []);

  const handleReindex = () => {
    setReindexing(true);
    window.setTimeout(() => {
      setValues((current) => ({ ...current, vectorEmbedded: true }));
      if (poi && isSamePoiValues({ ...values, vectorEmbedded: poi.vectorEmbedded }, savedValues)) {
        reindexPois([poi.id]);
      }
      setReindexing(false);
      showToast(t('poiEditor.aiSearchSection.reindexed'));
    }, REINDEX_DELAY_MS);
  };

  const handleSave = () => {
    const nextErrors = validatePoi(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast(t('poiEditor.page.pleaseCheckInvalidFields'), 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const cleaned: PoiFormValues = { ...values, name: values.name.trim() };
    if (!poi) {
      const created = createPoi(cleaned);
      // Vừa lưu xong — cho phép chuyển sang trang sửa của POI mới (isDirty chưa kịp cập nhật)
      allowNextNavigation();
      showToast(
        t('poiEditor.page.createdDestination', {
          name: shortPoiName(created.name),
          id: created.id,
        }),
        'success',
      );
      navigate(poiEditPath(created.id), { replace: true });
      return;
    }

    if (!isDirty) {
      showToast(t('poiEditor.page.thereNoChangesSave'), 'info');
      return;
    }
    updatePoi(poi.id, cleaned);
    showToast(t('poiEditor.page.savedChangesPoi', { id: poi.id }), 'success');
  };

  // Điều hướng về danh sách; nếu còn thay đổi chưa lưu, useBlocker sẽ hỏi xác nhận
  const handleCancel = () => navigate(ROUTES.POIS);

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
            poiCode={poi?.id ?? t('poiEditor.page.newPoi')}
            values={values}
            onChange={handleChange}
          />
          <PoiAiSearchSection
            values={values}
            onChange={handleChange}
            onReindex={handleReindex}
            reindexing={reindexing}
          />
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

      <UnsavedChangesDialog blocker={blocker}>
        {poi ? (
          <>
            <Trans
              i18nKey="poiEditor.page.changesPoiHaveNot"
              values={{ id: poi.id }}
              components={{ c0: <strong /> }}
            />
          </>
        ) : (
          t('poiEditor.page.changesNewPoiHave')
        )}
      </UnsavedChangesDialog>
    </div>
  );
}
