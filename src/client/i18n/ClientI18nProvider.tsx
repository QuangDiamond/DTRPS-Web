import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ClientI18nContext } from './clientI18nContext';
import { translateClientViToEn, type ClientLanguage } from './clientTranslations';

const STORAGE_KEY = 'smarttravel.client.language';

function readInitialLanguage(): ClientLanguage {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    // ignore storage errors
  }
  return 'vi';
}

export function ClientI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<ClientLanguage>(readInitialLanguage);

  const setLang = useCallback((next: ClientLanguage) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next: ClientLanguage = current === 'vi' ? 'en' : 'vi';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Đồng bộ ngôn ngữ giữa các tab trình duyệt
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'en' || event.newValue === 'vi')) {
        setLangState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = useCallback(
    (viText: string) => (lang === 'en' ? translateClientViToEn(viText) : viText),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <ClientI18nContext.Provider value={value}>{children}</ClientI18nContext.Provider>;
}
