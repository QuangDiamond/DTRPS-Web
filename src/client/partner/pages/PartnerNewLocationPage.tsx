import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import type { CategoryGroup, ReferenceItem } from '@/client/api/types';
import ListingForm from '@/client/partner/components/ListingForm';
import { CLIENT_ROUTES, partnerLocationPath } from '@/client/routePaths';
import { FormAlert, Heading, Spinner } from '@/client/ui/Blocks';
import { SecondaryButton } from '@/client/ui/Buttons';

/** /partner/locations/new — đăng ký thêm một địa điểm */
export default function PartnerNewLocationPage() {
  const navigate = useNavigate();
  const [refs, setRefs] = useState<{ groups: CategoryGroup[]; provinces: ReferenceItem[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([referenceApi.categories(), referenceApi.provinces()])
      .then(([groups, provinces]) => {
        if (!active) return;
        setRefs({ groups, provinces });
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  if (error) {
    return (
      <div className="mx-auto max-w-md">
        <FormAlert message={error} />
        <SecondaryButton onClick={() => setRetry((n) => n + 1)}>Thử lại</SecondaryButton>
      </div>
    );
  }
  if (!refs) return <Spinner />;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={CLIENT_ROUTES.PARTNER_LOCATIONS}
        className="mb-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#007A73] hover:underline"
      >
        <Icon name="arrow_back" className="text-[18px]" /> Địa điểm của tôi
      </Link>
      <Heading
        eyebrow="THÔNG TIN ĐỊA ĐIỂM"
        title="Đăng ký địa điểm mới"
        description="Điền thông tin địa điểm để gửi Admin xét duyệt. Địa điểm hiển thị với du khách sau khi được phê duyệt."
      />
      <ListingForm
        mode="create"
        listing={null}
        groups={refs.groups}
        provinces={refs.provinces}
        onSaved={(listing) => navigate(partnerLocationPath(listing.id), { replace: true })}
        onCancel={() => navigate(CLIENT_ROUTES.PARTNER_LOCATIONS)}
      />
    </div>
  );
}
