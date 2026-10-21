import { useContext } from 'react';
import { ListingsContext, type ListingsContextValue } from '@/contexts/listings/listingsContext';

export function useListings(): ListingsContextValue {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings phải được dùng bên trong <ListingsProvider>');
  }
  return context;
}
