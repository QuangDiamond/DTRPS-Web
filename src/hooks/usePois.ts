import { useContext } from 'react';
import { PoisContext, type PoisContextValue } from '../contexts/pois';

export function usePois(): PoisContextValue {
  const context = useContext(PoisContext);
  if (!context) {
    throw new Error('usePois phải được dùng bên trong <PoisProvider>');
  }
  return context;
}
