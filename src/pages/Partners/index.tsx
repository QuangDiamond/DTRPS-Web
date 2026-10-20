import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LockPartnerModal from '../../components/partners/LockPartnerModal';
import { ADMIN_ROOT_CRUMB } from '../../constants/navigation';
import {
  DEFAULT_PARTNER_FILTERS,
  PAGE_SIZE_OPTIONS,
  PARTNER_STATUS_CONFIG,
  PARTNER_TYPE_CONFIG,
  PROVINCE_LABELS,
} from '../../constants/partner';
import { partnerDetailPath, ROUTES } from '../../constants/routes';
import { usePartnerActions } from '../../hooks/usePartnerActions';
import { usePartners } from '../../hooks/usePartners';
import { useToast } from '../../hooks/useToast';
import type { Partner, PartnerFilters, PartnerFormValues } from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDate, todayIsoDate } from '../../utils/format';
import PartnerFilterBar from './components/PartnerFilterBar';
import PartnerFormModal from './components/PartnerFormModal';
import PartnerStatsCards from './components/PartnerStatsCards';
import PartnerTable from './components/PartnerTable';
import { filterAndSortPartners } from './partnerUtils';

interface FormModalState {
  open: boolean;
  partner: Partner | null;
}

export default function PartnersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { partners, stats, createPartner, updatePartner } = usePartners();
  const { lockPartner, unlockPartner, countVisibleListings } = usePartnerActions();

  // draftFilters: giá trị đang nhập; appliedFilters: áp dụng khi bấm "Lọc kết quả" / Enter
  const [draftFilters, setDraftFilters] = useState<PartnerFilters>(DEFAULT_PARTNER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<PartnerFilters>(DEFAULT_PARTNER_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [formModal, setFormModal] = useState<FormModalState>({ open: false, partner: null });
  const [lockingPartner, setLockingPartner] = useState<Partner | null>(null);

  const filteredPartners = useMemo(
    () => filterAndSortPartners(partners, appliedFilters),
    [partners, appliedFilters],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePartners = filteredPartners.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ===== Bộ lọc =====
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_PARTNER_FILTERS);
    setAppliedFilters(DEFAULT_PARTNER_FILTERS);
    setPage(1);
  };

  // ===== Khóa / mở khóa =====
  const confirmLock = (reason: string, note: string) => {
    if (!lockingPartner) return;
    const hidden = lockPartner(lockingPartner, reason, note || undefined);
    showToast(
      `Đã khóa tài khoản ${lockingPartner.name}${hidden ? ` và tạm ẩn ${hidden} địa điểm` : ''}`,
      'error',
    );
    setLockingPartner(null);
  };

  const handleUnlock = (partner: Partner) => {
    const shown = unlockPartner(partner);
    showToast(
      `Đã mở khóa tài khoản ${partner.name}${shown ? `, hiển thị lại ${shown} địa điểm` : ''}`,
    );
  };

  // ===== Thêm / sửa =====
  const closeForm = () => setFormModal({ open: false, partner: null });

  const handleSubmitForm = (values: PartnerFormValues) => {
    const editing = formModal.partner;
    if (editing) {
      updatePartner(editing.id, values);
      showToast(`Đã cập nhật thông tin ${values.name}`);
    } else {
      createPartner(values);
      showToast(`Đã thêm đối tác ${values.name} — đang chờ xác minh`);
    }
    closeForm();
  };

  // ===== Khác =====
  const handleExport = () => {
    downloadCsv(
      `doi-tac-${todayIsoDate()}.csv`,
      [
        'Mã',
        'Đối tác',
        'Cơ sở',
        'Loại hình',
        'Tỉnh/TP',
        'Đại diện',
        'Email',
        'SĐT',
        'Niêm yết',
        'Ngày tham gia',
        'Trạng thái',
      ],
      filteredPartners.map((partner) => [
        partner.id,
        partner.name,
        partner.businessName,
        PARTNER_TYPE_CONFIG[partner.type].label,
        PROVINCE_LABELS[partner.province],
        partner.representative,
        partner.email,
        partner.phone,
        partner.listings.total,
        formatDate(partner.joinedAt),
        PARTNER_STATUS_CONFIG[partner.status].label,
      ]),
    );
    showToast(`Đã xuất ${filteredPartners.length} đối tác ra file Excel (CSV)`);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        breadcrumbs={[ADMIN_ROOT_CRUMB, { label: 'Quản lý đối tác', icon: 'business_center' }]}
        eyebrow="Hệ sinh thái thông minh"
        eyebrowNote="Mạng lưới đối tác B2B"
        title="Quản trị Đối tác Doanh nghiệp"
        description="Giám sát, thẩm định và kết nối các đơn vị cung cấp dịch vụ du lịch trên toàn lãnh thổ Việt Nam."
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high"
            >
              <Icon name="download" className="text-[19px] text-on-surface-variant" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setFormModal({ open: true, partner: null })}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container"
            >
              <Icon name="add_business" className="text-[20px]" />
              <span>+ Thêm đối tác mới</span>
            </button>
          </>
        }
      />

      <PartnerStatsCards stats={stats} />

      <PartnerFilterBar
        filters={draftFilters}
        onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <PartnerTable
        partners={pagePartners}
        onViewDetail={(partner) => navigate(partnerDetailPath(partner.id))}
        onEdit={(partner) => setFormModal({ open: true, partner })}
        onLock={setLockingPartner}
        onUnlock={handleUnlock}
        onViewListings={(partner) => navigate(`${ROUTES.LISTINGS}?partner=${partner.id}`)}
        footer={
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredPartners.length}
            itemLabel="đối tác"
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {lockingPartner && (
        <LockPartnerModal
          partner={lockingPartner}
          affectedListings={countVisibleListings(lockingPartner)}
          onConfirm={confirmLock}
          onClose={() => setLockingPartner(null)}
        />
      )}

      {formModal.open && (
        <PartnerFormModal
          key={formModal.partner?.id ?? 'new'}
          partner={formModal.partner}
          onClose={closeForm}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
}
