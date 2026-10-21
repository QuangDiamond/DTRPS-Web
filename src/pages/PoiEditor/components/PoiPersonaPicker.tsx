import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { POI_PERSONA_SUGGESTIONS } from '@/constants/poi';
import { useDismiss } from '@/hooks';
import { normalizeText } from '@/utils/string';

interface PoiPersonaPickerProps {
  personas: string[];
  onChange: (personas: string[]) => void;
}

/** Danh sách chip đối tượng phù hợp + nút "Thêm" mở gợi ý / nhập tự do */
export default function PoiPersonaPicker({ personas, onChange }: PoiPersonaPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, open, () => setOpen(false));

  const selected = new Set(personas.map(normalizeText));
  const suggestions = POI_PERSONA_SUGGESTIONS.filter(
    (persona) =>
      !selected.has(normalizeText(persona)) &&
      normalizeText(persona).includes(normalizeText(draft)),
  );

  const addPersona = (persona: string) => {
    const value = persona.trim();
    if (!value || selected.has(normalizeText(value))) return;
    onChange([...personas, value]);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm font-semibold text-outline">
        {t('poiEditor.poiPersonaPicker.bestSuited')}
      </span>
      <div ref={containerRef} className="relative flex flex-wrap gap-1.5">
        {personas.map((persona) => (
          <button
            key={persona}
            type="button"
            title={t('poiEditor.poiPersonaPicker.clickRemoveThisAudience')}
            onClick={() => onChange(personas.filter((item) => item !== persona))}
            className="group flex items-center gap-0.5 rounded-full bg-secondary-container/40 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container transition-colors hover:bg-error-container/60 hover:text-on-error-container"
          >
            {persona}
            <Icon name="close" className="hidden text-[14px] group-hover:inline" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-0.5 rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-highest"
        >
          <Icon name="add" className="text-[14px]" />
          {t('poiEditor.poiPersonaPicker.add')}
        </button>

        {open && (
          <div className="absolute top-full right-0 left-0 z-20 mt-2 flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-space-sm shadow-lg ring-1 ring-surface-container-high">
            <input
              autoFocus
              type="text"
              value={draft}
              placeholder={t('poiEditor.poiPersonaPicker.typeNewAudiencePress')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addPersona(draft);
                }
                if (event.key === 'Escape') setOpen(false);
              }}
              className="w-full rounded-lg bg-surface-container-low px-space-sm py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((persona) => (
                <button
                  key={persona}
                  type="button"
                  onClick={() => addPersona(persona)}
                  className="flex items-center gap-0.5 rounded-full bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-secondary-container/40 hover:text-on-secondary-container"
                >
                  <Icon name="add" className="text-[14px]" />
                  {persona}
                </button>
              ))}
              {suggestions.length === 0 && !draft.trim() && (
                <span className="font-body-sm text-body-sm text-outline">
                  {t('poiEditor.poiPersonaPicker.allAvailableSuggestionsHave')}
                </span>
              )}
              {draft.trim() && !selected.has(normalizeText(draft)) && (
                <button
                  type="button"
                  onClick={() => addPersona(draft)}
                  className="flex items-center gap-0.5 rounded-full bg-primary px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary"
                >
                  <Icon name="add" className="text-[14px]" />
                  {t('poiEditor.poiPersonaPicker.add2', { trim: draft.trim() })}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
