import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components/common';
import { formatAmount, priceTypeLabel } from '@/pages/PlaceReview/placeReviewUtils';
import type { CatalogPriceInput } from '@/types';
import { getErrorMessage } from '@/utils/error';
import {
  INPUT_CLASS,
  MAX_PRICES,
  PRICE_TYPES,
  priceTypeKey,
} from '@/pages/PlaceCatalog/placeEditorUtils';

export interface PriceItem extends CatalogPriceInput {
  /** id giá (trang chi tiết) hoặc khoá tạm (form tạo mới) */
  key: string;
  currency: string;
}

interface Draft {
  priceType: string;
  amount: string;
  description: string;
}

const EMPTY: Draft = { priceType: PRICE_TYPES[0].value, amount: '', description: '' };

/** Bảng giá: thêm, sửa, xoá từng mức giá. Số tiền không âm, tiền tệ mặc định VND. */
export default function PriceManager({
  prices,
  onAdd,
  onUpdate,
  onRemove,
}: {
  prices: PriceItem[];
  onAdd: (price: CatalogPriceInput) => Promise<void> | void;
  onUpdate: (item: PriceItem, price: CatalogPriceInput) => Promise<void> | void;
  onRemove: (item: PriceItem) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  /** key đang sửa, 'new' = dòng thêm mới */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const typeLabel = (type: string) => {
    const key = priceTypeKey(type);
    return key ? t(key) : priceTypeLabel(type);
  };

  const open = (key: string, value: Draft) => {
    setEditing(key);
    setDraft(value);
    setError('');
  };

  const run = async (action: () => Promise<void> | void) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setEditing(null);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusy(false);
    }
  };

  const save = (item?: PriceItem) => {
    if (draft.amount === '') {
      setError(t('placeEditor.prices.amountRequired'));
      return;
    }
    const price: CatalogPriceInput = {
      priceType: draft.priceType,
      amount: Number(draft.amount),
      description: draft.description.trim() || null,
    };
    void run(() => (item ? onUpdate(item, price) : onAdd(price)));
  };

  const editor = (item?: PriceItem) => (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low p-2">
      <select
        aria-label={t('placeEditor.prices.type')}
        value={draft.priceType}
        onChange={(event) => setDraft({ ...draft, priceType: event.target.value })}
        className={`${INPUT_CLASS} w-44 bg-surface-container-lowest`}
      >
        {PRICE_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {t(type.labelKey)}
          </option>
        ))}
        {!priceTypeKey(draft.priceType) && (
          <option value={draft.priceType}>{priceTypeLabel(draft.priceType)}</option>
        )}
      </select>
      <div className="relative">
        <input
          aria-label={t('placeEditor.prices.amount')}
          inputMode="numeric"
          placeholder="150000"
          value={draft.amount}
          onChange={(event) =>
            setDraft({ ...draft, amount: event.target.value.replace(/[^\d]/g, '') })
          }
          className={`${INPUT_CLASS} w-36 bg-surface-container-lowest pr-12`}
        />
        <span className="absolute top-1/2 right-3 -translate-y-1/2 font-label-sm text-label-sm text-outline">
          VND
        </span>
      </div>
      <input
        aria-label={t('placeEditor.prices.note')}
        placeholder={t('placeEditor.prices.notePlaceholder')}
        maxLength={500}
        value={draft.description}
        onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        className={`${INPUT_CLASS} min-w-40 flex-1 bg-surface-container-lowest`}
      />
      <Button size="sm" icon="check" loading={busy} onClick={() => save(item)}>
        {t('placeEditor.prices.save')}
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(null)}>
        {t('placeEditor.cancel')}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {prices.length === 0 && editing !== 'new' && (
        <p className="font-body-sm text-body-sm text-outline">{t('placeEditor.prices.empty')}</p>
      )}
      {prices.map((item) =>
        editing === item.key ? (
          <div key={item.key}>{editor(item)}</div>
        ) : (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-xl border border-surface-container px-3 py-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-label-md text-label-md font-semibold text-on-surface">
                {typeLabel(item.priceType)}
              </span>
              {item.description && (
                <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">
                  {item.description}
                </span>
              )}
            </span>
            <span className="font-title-sm text-title-sm font-bold text-primary">
              {formatAmount({ ...item }, t('placeReview.detail.free'))}
            </span>
            <button
              type="button"
              aria-label={t('placeEditor.prices.edit')}
              disabled={busy || editing !== null}
              onClick={() =>
                open(item.key, {
                  priceType: item.priceType,
                  amount: String(item.amount),
                  description: item.description ?? '',
                })
              }
              className="text-outline hover:text-primary disabled:opacity-40"
            >
              <Icon name="edit" className="text-[18px]" />
            </button>
            <button
              type="button"
              aria-label={t('placeEditor.prices.remove')}
              disabled={busy || editing !== null}
              onClick={() => void run(() => onRemove(item))}
              className="text-outline hover:text-error disabled:opacity-40"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          </div>
        ),
      )}
      {editing === 'new' && editor()}
      {editing === null && prices.length < MAX_PRICES && (
        <button
          type="button"
          onClick={() => open('new', EMPTY)}
          className="flex w-fit items-center gap-1 font-label-sm text-label-sm font-bold text-primary hover:underline"
        >
          <Icon name="add" className="text-[16px]" /> {t('placeEditor.prices.add')}
        </button>
      )}
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}
