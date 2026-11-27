import { createContext, useContext } from 'react';
import type { ClientLanguage } from './clientTranslations';

export interface ClientI18nValue {
  lang: ClientLanguage;
  setLang: (next: ClientLanguage) => void;
  toggleLang: () => void;
  t: (viText: string) => string;
}

export const ClientI18nContext = createContext<ClientI18nValue>({
  lang: 'vi',
  setLang: () => undefined,
  toggleLang: () => undefined,
  t: (text) => text,
});

export function useClientI18n(): ClientI18nValue {
  return useContext(ClientI18nContext);
}
