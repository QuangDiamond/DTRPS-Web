import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ConfirmModal,
  ErrorState,
  Icon,
  Modal,
  PageHeader,
  PageLoader,
  ToggleSwitch,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { useToast } from '@/hooks/useToast';
import { placeCategoryService } from '@/services/placeCategoryService';
import type { PlaceCategory, PlaceCategoryGroup } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { FormField } from '@/pages/PlaceCatalog/components/EditorSection';
import { INPUT_CLASS } from '@/pages/PlaceCatalog/placeEditorUtils';

interface Draft {
  /** undefined = thêm mới */
  category?: PlaceCategory;
  groupCode: string;
  code: string;
  name: string;
  description: string;
}

const CODE_PATTERN = /^[a-z0-9_]{2,50}$/;

/**
 * /admin/place-categories — loại địa điểm dưới 4 nhóm dịch vụ cố định.
 * Thêm, sửa, bật / tắt loại; mã và tên không được trùng; mã không đổi sau khi tạo.
 */
export default function PlaceCategoriesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [groups, setGroups] = useState<PlaceCategoryGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftError, setDraftError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  /** Loại hình đang chờ xác nhận xoá */
  const [deleting, setDeleting] = useState<PlaceCategory | null>(null);

  useEffect(() => {
    let active = true;
    placeCategoryService
      .list()
      .then((next) => {
        if (!active) return;
        setGroups(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  if (error && !groups) {
    return (
      <ErrorState
        title={t('placeCategories.loadError')}
        message={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!groups) return <PageLoader />;

  const replace = (updated: PlaceCategory, groupCode: string) =>
    setGroups((current) =>
      (current ?? []).map((group) => {
        const types = group.types.filter((type) => type.id !== updated.id);
        return group.code === groupCode
          ? { ...group, types: [...types, updated].sort((a, b) => Number(a.id) - Number(b.id)) }
          : { ...group, types };
      }),
    );

  const remove = async (category: PlaceCategory) => {
    setDeleting(null);
    try {
      await placeCategoryService.remove(category.id);
      setGroups((current) =>
        (current ?? []).map((group) => ({
          ...group,
          types: group.types.filter((type) => type.id !== category.id),
        })),
      );
      showToast(t('placeCategories.deleted', { name: category.name }));
    } catch (removeError) {
      showToast(getErrorMessage(removeError), 'error');
    }
  };

  const toggle = async (category: PlaceCategory, groupCode: string) => {
    setToggling(category.id);
    try {
      const next = category.status === 'active' ? 'inactive' : 'active';
      replace(await placeCategoryService.changeStatus(category.id, next), groupCode);
      showToast(
        next === 'active'
          ? t('placeCategories.enabled', { name: category.name })
          : t('placeCategories.disabled', { name: category.name }),
      );
    } catch (toggleError) {
      showToast(getErrorMessage(toggleError), 'error');
    } finally {
      setToggling(null);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const code = draft.code.trim();
    if (!draft.category && !CODE_PATTERN.test(code)) {
      setDraftError(t('placeCategories.errors.code'));
      return;
    }
    if (draft.name.trim().length < 2) {
      setDraftError(t('placeCategories.errors.name'));
      return;
    }
    setSaving(true);
    setDraftError('');
    const input = {
      groupCode: draft.groupCode,
      code,
      name: draft.name.trim(),
      description: draft.description.trim() || null,
    };
    try {
      const saved = draft.category
        ? await placeCategoryService.update(draft.category.id, input)
        : await placeCategoryService.create(input);
      replace(saved, draft.groupCode);
      showToast(draft.category ? t('placeCategories.saved') : t('placeCategories.created'));
      setDraft(null);
    } catch (saveError) {
      setDraftError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const openNew = (groupCode: string) => {
    setDraftError('');
    setDraft({ groupCode, code: '', name: '', description: '' });
  };

  const openEdit = (category: PlaceCategory, groupCode: string) => {
    setDraftError('');
    setDraft({
      category,
      groupCode,
      code: category.code,
      name: category.name,
      description: category.description ?? '',
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.placeCategories'), icon: 'category' }]}
          title={t('placeCategories.title')}
          description={t('placeCategories.description')}
        />
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
        <Icon name="info" className="text-[20px] text-primary" />
        <p className="font-body-sm text-body-sm">{t('placeCategories.deleteNote')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.code}
            className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                {group.name}
                <span className="ml-2 font-label-md text-label-md font-normal text-outline">
                  {t('placeCategories.count', { count: group.types.length })}
                </span>
              </h2>
              <Button size="sm" variant="secondary" icon="add" onClick={() => openNew(group.code)}>
                {t('placeCategories.addShort')}
              </Button>
            </div>
            {group.types.length === 0 ? (
              <p className="font-body-sm text-body-sm text-outline italic">
                {t('placeCategories.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-surface-container">
                {group.types.map((type) => (
                  <li key={type.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-label-md text-label-md font-semibold ${
                          type.status === 'active' ? 'text-on-surface' : 'text-outline line-through'
                        }`}
                      >
                        {type.name}
                      </span>
                      <span className="block truncate font-body-sm text-body-sm text-outline">
                        <code>{type.code}</code> ·{' '}
                        {t('placeCategories.places', { count: type.placeCount })}
                        {type.description && ` · ${type.description}`}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={t('placeCategories.edit')}
                      onClick={() => openEdit(type, group.code)}
                      className="text-outline hover:text-primary"
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                    {type.placeCount === 0 && (
                      <button
                        type="button"
                        aria-label={t('placeCategories.delete')}
                        title={t('placeCategories.delete')}
                        onClick={() => setDeleting(type)}
                        className="text-outline hover:text-error"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    )}
                    <ToggleSwitch
                      checked={type.status === 'active'}
                      disabled={toggling === type.id}
                      onChange={() => void toggle(type, group.code)}
                      label={
                        type.status === 'active'
                          ? t('placeCategories.active')
                          : t('placeCategories.inactive')
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {deleting && (
        <ConfirmModal
          title={t('placeCategories.deleteTitle')}
          confirmLabel={t('placeCategories.delete')}
          confirmIcon="delete"
          onConfirm={() => void remove(deleting)}
          onClose={() => setDeleting(null)}
        >
          {t('placeCategories.deleteMessage', { name: deleting.name, code: deleting.code })}
        </ConfirmModal>
      )}

      {draft && (
        <Modal
          onClose={() => !saving && setDraft(null)}
          title={draft.category ? t('placeCategories.editTitle') : t('placeCategories.addTitle')}
        >
          <form onSubmit={(event) => void save(event)} noValidate className="flex flex-col gap-4">
            <FormField label={t('placeCategories.fields.group')} required>
              <select
                value={draft.groupCode}
                onChange={(event) => setDraft({ ...draft, groupCode: event.target.value })}
                className={INPUT_CLASS}
              >
                {groups.map((group) => (
                  <option key={group.code} value={group.code}>
                    {group.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label={t('placeCategories.fields.code')}
              required={!draft.category}
              hint={
                draft.category
                  ? t('placeCategories.fields.codeFixed')
                  : t('placeCategories.fields.codeHint')
              }
            >
              <input
                value={draft.code}
                disabled={Boolean(draft.category)}
                maxLength={50}
                placeholder="hot_spring"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    code: event.target.value.toLowerCase().replace(/\s+/g, '_'),
                  })
                }
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label={t('placeCategories.fields.name')} required>
              <input
                value={draft.name}
                maxLength={100}
                placeholder={t('placeCategories.fields.namePlaceholder')}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label={t('placeCategories.fields.description')}>
              <textarea
                rows={3}
                value={draft.description}
                maxLength={1000}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className={`${INPUT_CLASS} resize-y`}
              />
            </FormField>
            {draftError && <p className="font-label-sm text-label-sm text-error">{draftError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="neutral" disabled={saving} onClick={() => setDraft(null)}>
                {t('placeEditor.cancel')}
              </Button>
              <Button type="submit" icon="save" loading={saving}>
                {t('placeEditor.save')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
