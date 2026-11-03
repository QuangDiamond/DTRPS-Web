import { createContext, useContext } from 'react';
import type { BusinessProfile } from '@/client/api/types';

export interface PartnerProfileValue {
  /** undefined: đang tải lần đầu; null: user chưa đăng ký hồ sơ đối tác */
  profile: BusinessProfile | null | undefined;
  error: string | null;
  reload: () => void;
  /** Cập nhật ngay sau khi gửi / sửa hồ sơ thành công */
  setProfile: (profile: BusinessProfile) => void;
}

export const PartnerProfileContext = createContext<PartnerProfileValue | null>(null);

export function usePartnerProfile(): PartnerProfileValue {
  const value = useContext(PartnerProfileContext);
  if (!value) throw new Error('usePartnerProfile phải nằm trong PartnerProfileProvider');
  return value;
}
