import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import { useToast } from '@/hooks';
import { money } from '@/pages/AdPayments/adPaymentUtils';
import { adAdminService } from '@/services/adAdminService';
import type { AdminAdPackage, AdPackageInput } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { EmptyRow, Pill, TableCard } from './AdParts';

interface Draft {
  id: number | null;
  name: string;
  description: string;
  price: string;
  durationDays: string;
  maxPlaces: string;
  sortOrder: string;
}

type NumberKey = 'price' | 'durationDays' | 'maxPlaces' | 'sortOrder';
type FieldKey = 'name' | NumberKey;
type FieldErrors = Partial<Record<FieldKey, string>>;

/** Giới hạn khớp với BE (AdDtos.PackageRequest) */
const LIMITS: Record<NumberKey, { min: number; max: number }> = {
  price: { min: 1000, max: 1_000_000_000 },
  durationDays: { min: 1, max: 3650 },
  maxPlaces: { min: 1, max: 100 },
  sortOrder: { min: 1, max: 9999 },
};

/** Chỉ nhận số nguyên viết liền: 1.1, 1,5, 1e3, -2 đều không hợp lệ */
const isWholeInRange = (value: string, key: NumberKey): boolean => {
  const text = value.trim();
  if (!/^\d+$/.test(text)) return false;
  const number = Number(text);
  return number >= LIMITS[key].min && number <= LIMITS[key].max;
};

const fieldClass = (error?: string) =>
  `h-11 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:outline-none ${
    error ? 'ring-2 ring-error' : 'focus:ring-primary'
  }`;

/** Tab Bảng giá: thêm, sửa, bật / tắt gói. Gói đã bán chỉ tắt, không xoá. */
export default function PackagesTab({ reload }: { reload: number }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminAdPackage[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    adAdminService
      .packages()
      .then((next) => active && setItems(next))
      .catch((failure: unknown) => active && showToast(getErrorMessage(failure), 'error'));
    return () => {
      active = false;
    };
  }, [reload, version, showToast]);

  /** Gói mới mặc định đứng cuối danh sách */
  const add = () => {
    setFormError('');
    setErrors({});
    const lastOrder = Math.max(0, ...(items ?? []).map((item) => item.sortOrder));
    setDraft({
      id: null,
      name: '',
      description: '',
      price: '',
      durationDays: '30',
      maxPlaces: '3',
      sortOrder: String(lastOrder + 1),
    });
  };

  const edit = (item: AdminAdPackage) => {
    setFormError('');
    setErrors({});
    setDraft({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      price: String(Math.round(item.price)),
      durationDays: String(item.durationDays),
      maxPlaces: String(item.maxPlaces),
      sortOrder: String(item.sortOrder),
    });
  };

  const validate = (value: Draft): FieldErrors => {
    const next: FieldErrors = {};
    const others = (items ?? []).filter((item) => item.id !== value.id);
    const name = value.name.trim();
    if (!name) next.name = t('adAdmin.packages.errors.nameRequired');
    else if (others.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      next.name = t('adAdmin.packages.errors.nameDuplicate');
    }
    if (!isWholeInRange(value.price, 'price')) next.price = t('adAdmin.packages.errors.price');
    if (!isWholeInRange(value.durationDays, 'durationDays')) {
      next.durationDays = t('adAdmin.packages.errors.durationDays');
    }
    if (!isWholeInRange(value.maxPlaces, 'maxPlaces')) {
      next.maxPlaces = t('adAdmin.packages.errors.maxPlaces');
    }
    if (!isWholeInRange(value.sortOrder, 'sortOrder')) {
      next.sortOrder = t('adAdmin.packages.errors.sortOrder');
    } else {
      const taken = others.find((item) => item.sortOrder === Number(value.sortOrder));
      if (taken) {
        next.sortOrder = t('adAdmin.packages.errors.sortOrderDuplicate', { name: taken.name });
      }
    }
    return next;
  };

  const save = async () => {
    if (!draft) return;
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;
    const input: AdPackageInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      price: Number(draft.price),
      durationDays: Number(draft.durationDays),
      maxPlaces: Number(draft.maxPlaces),
      sortOrder: Number(draft.sortOrder),
    };
    setBusy(true);
    try {
      if (draft.id === null) await adAdminService.createPackage(input);
      else await adAdminService.updatePackage(draft.id, input);
      showToast(t('adAdmin.packages.saved'));
      setDraft(null);
      setVersion((n) => n + 1);
    } catch (failure) {
      setFormError(getErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (item: AdminAdPackage) => {
    try {
      await adAdminService.changePackageStatus(
        item.id,
        item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      );
      setVersion((n) => n + 1);
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    }
  };

  const set = (key: keyof Draft, value: string) => {
    setFormError('');
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDraft((current) => current && { ...current, [key]: value });
  };

  const th = 'px-4 py-4 font-semibold';
  const fieldError = (key: FieldKey) =>
    errors[key] && (
      <span className="font-body-sm text-[12px] font-normal text-error">{errors[key]}</span>
    );
  // Ô chữ thay vì type="number": trình duyệt không tự nuốt các giá trị như 1.1 hay 1e3
  const numberField = (key: NumberKey) => (
    <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
      {t(`adAdmin.packages.fields.${key}`)}
      <input
        inputMode="numeric"
        aria-invalid={Boolean(errors[key])}
        value={draft?.[key] ?? ''}
        onChange={(event) => set(key, event.target.value)}
        className={fieldClass(errors[key])}
      />
      {fieldError(key)}
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t('adAdmin.packages.hint')}
        </p>
        <Button icon="add" onClick={add}>
          {t('adAdmin.packages.add')}
        </Button>
      </div>

      <TableCard>
        <thead>
          <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            <th className={th}>{t('adAdmin.package')}</th>
            <th className={th}>{t('adAdmin.packages.fields.price')}</th>
            <th className={th}>{t('adAdmin.packages.fields.durationDays')}</th>
            <th className={th}>{t('adAdmin.packages.fields.maxPlaces')}</th>
            <th className={th}>{t('adAdmin.statusLabel')}</th>
            <th className={`${th} text-right`}>{t('adAdmin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {items?.length === 0 && <EmptyRow colSpan={6} />}
          {items?.map((item) => (
            <tr key={item.id} className="align-top hover:bg-surface-container-low/60">
              <td className="px-4 py-3 font-body-md text-body-md font-semibold text-on-surface">
                {item.name}
                {item.description && (
                  <span className="block max-w-sm font-body-sm text-body-sm font-normal text-on-surface-variant">
                    {item.description}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-body-md text-body-md whitespace-nowrap text-on-surface">
                {money(item.price)}
              </td>
              <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                {item.durationDays}
              </td>
              <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                {item.maxPlaces}
              </td>
              <td className="px-4 py-3">
                <Pill
                  label={t(`adAdmin.packages.status.${item.status}`)}
                  className={
                    item.status === 'ACTIVE'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" icon="edit" onClick={() => edit(item)}>
                    {t('adAdmin.packages.edit')}
                  </Button>
                  <Button size="sm" variant="neutral" onClick={() => void toggle(item)}>
                    {t(
                      item.status === 'ACTIVE'
                        ? 'adAdmin.packages.disable'
                        : 'adAdmin.packages.enable',
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {draft && (
        <Modal
          title={t(draft.id === null ? 'adAdmin.packages.add' : 'adAdmin.packages.edit')}
          description={t('adAdmin.packages.editHint')}
          onClose={busy ? () => undefined : () => setDraft(null)}
          footer={
            <>
              <Button variant="neutral" onClick={() => setDraft(null)} disabled={busy}>
                {t('actions.cancel')}
              </Button>
              <Button loading={busy} onClick={() => void save()}>
                {t('adAdmin.packages.save')}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
              {t('adAdmin.packages.fields.name')}
              <input
                value={draft.name}
                maxLength={150}
                autoFocus
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => set('name', event.target.value)}
                className={fieldClass(errors.name)}
              />
              {fieldError('name')}
            </label>
            <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
              {t('adAdmin.packages.fields.description')}
              <textarea
                rows={2}
                maxLength={2000}
                value={draft.description}
                onChange={(event) => set('description', event.target.value)}
                className="w-full resize-none rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 items-start gap-3">
              {numberField('price')}
              {numberField('durationDays')}
              {numberField('maxPlaces')}
              {numberField('sortOrder')}
            </div>
            {formError && <p className="font-body-sm text-body-sm text-error">{formError}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
