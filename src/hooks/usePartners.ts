import { useContext } from 'react';
import { PartnersContext, type PartnersContextValue } from '../contexts/partners';

export function usePartners(): PartnersContextValue {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error('usePartners phải được dùng bên trong <PartnersProvider>');
  }
  return context;
}
