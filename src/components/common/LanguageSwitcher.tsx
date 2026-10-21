import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, SUPPORTED_LANGUAGES } from '@/config/i18n';
import type { Language } from '@/types';

/** Cờ vẽ bằng SVG — emoji cờ không hiển thị trên Windows */
function FlagIcon({ language }: { language: Language }) {
  if (language === 'vi') {
    return (
      <svg viewBox="0 0 30 20" className="h-3 w-[18px] shrink-0 rounded-[2px]" aria-hidden="true">
        <rect width="30" height="20" fill="#da251d" />
        <polygon
          fill="#ffff00"
          points="15,4 16.18,7.62 19.98,7.62 16.9,9.86 18.08,13.48 15,11.24 11.92,13.48 13.1,9.86 10.02,7.62 13.82,7.62"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 30" className="h-3 w-[18px] shrink-0 rounded-[2px]" aria-hidden="true">
      <clipPath id="flag-gb-clip">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#flag-gb-clip)"
        stroke="#c8102e"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}

/** Nút chuyển ngôn ngữ VI / EN trên Header — đổi ngay, không tải lại trang */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = getCurrentLanguage();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex items-center rounded-full bg-surface-container-lowest p-1 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
    >
      {SUPPORTED_LANGUAGES.map((language) => {
        const active = current === language;
        return (
          <button
            key={language}
            type="button"
            title={t(`language.${language}`)}
            aria-pressed={active}
            onClick={() => {
              if (!active) void i18n.changeLanguage(language);
            }}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm uppercase ${
              active
                ? 'bg-primary font-semibold text-on-primary'
                : 'font-medium text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FlagIcon language={language} />
            {language}
          </button>
        );
      })}
    </div>
  );
}
