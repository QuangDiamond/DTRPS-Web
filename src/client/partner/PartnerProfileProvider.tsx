import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { businessProfileApi } from '@/client/api/businessProfileApi';
import { errorMessage } from '@/client/api/http';
import type { BusinessProfile } from '@/client/api/types';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { PartnerProfileContext } from './partnerProfileContext';

/**
 * Hồ sơ doanh nghiệp của user đang đăng nhập (GET /api/business-profile).
 * Khi hồ sơ đã ACTIVE mà token chưa có vai trò BUSINESS_OWNER (admin vừa duyệt) → tự làm mới token.
 */
export default function PartnerProfileProvider({ children }: { children: ReactNode }) {
  const { hasRole, refreshSession } = useClientAuth();
  const [profile, setProfile] = useState<BusinessProfile | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    businessProfileApi
      .getOwn()
      .then((result) => {
        if (!active) return;
        setProfile(result);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [version]);

  const isActive = profile?.status === 'ACTIVE';
  const missingRole = isActive && !hasRole('BUSINESS_OWNER');
  useEffect(() => {
    if (missingRole) void refreshSession();
  }, [missingRole, refreshSession]);

  const reload = useCallback(() => {
    setError(null);
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo(() => ({ profile, error, reload, setProfile }), [profile, error, reload]);

  return <PartnerProfileContext.Provider value={value}>{children}</PartnerProfileContext.Provider>;
}
