import type { PartnerAuditEntry, PartnerProfile } from '@/types';

/** Hồ sơ chi tiết theo mã đối tác. Đối tác không có ở đây sẽ dùng hồ sơ dựng tự động. */
/** Hồ sơ gốc — hạn mức, giao dịch, đánh giá được builder bổ sung */
export const MOCK_PARTNER_PROFILES: Record<
  string,
  Omit<PartnerProfile, 'contractLimits' | 'transactions' | 'ratings'>
> = {
  'PTN-0891': {
    tierLabel: 'Gold',
    trustScore: 98,
    trustLabel: 'Rất an toàn',
    verificationLevel: 'Đã đối soát cấp Bộ',
    taxIssuer: 'Sở KH&ĐT Quảng Nam',
    aiSearchHits: 3240,
    legal: {
      fullName: 'Công ty TNHH Dịch vụ & Du lịch Hội An Hospitality',
      foundedAt: '2020-01-10',
      issuer: 'Sở Kế hoạch & Đầu tư Tỉnh Quảng Nam',
      charterCapital: 15_000_000_000,
      headOffice: '128 Nguyễn Tri Phương, Phường Cẩm Châu, TP. Hội An, Tỉnh Quảng Nam',
      legalRepresentative: 'Nguyễn Văn Hùng',
      idNumberMasked: '049088****** (Đã quét Chip)',
      licenseFile: { name: 'GPKD_HoiAnHospitality_Signed.pdf', size: '2.4 MB' },
    },
    contact: {
      name: 'Nguyễn Văn Hùng',
      position: 'Giám đốc điều hành (CEO)',
      email: 'contact@hoianhospitality.vn',
      otpPhone: '0905 123 456',
      twoFactor: true,
      bank: { name: 'Vietcombank - CN Hội An', account: '1018 9988 2231', currency: 'VND' },
      escrow: true,
    },
    certifications: [
      {
        icon: 'local_fire_department',
        title: 'Biên bản thẩm duyệt PCCC & CNCH',
        meta: 'Cấp bởi: Công an PCCC Tỉnh Quảng Nam • Hiệu lực đến: 2026',
        statusLabel: 'Hợp lệ',
        tone: 'valid',
      },
      {
        icon: 'restaurant',
        title: 'Chứng nhận Vệ sinh An toàn Thực phẩm (ATTP)',
        meta: 'Cơ quan cấp: Chi cục ATTP Tỉnh Quảng Nam • Số 89/2024/ATTP',
        statusLabel: 'Đạt chuẩn',
        tone: 'valid',
      },
      {
        icon: 'psychology',
        title: 'Chỉ số tín nhiệm & Tuân thủ AI Escrow',
        meta: 'Điểm đánh giá tự động: 98/100 • Không có biên bản vi phạm',
        statusLabel: 'Rất an toàn',
        tone: 'trust',
      },
    ],
    nextReviewDate: '2026-12-15',
    agreement: {
      type: 'Hợp tác chiến lược cao cấp',
      commission: 8.5,
      activatedAt: '2024-03-15',
      renewAt: '2027-03-15',
      paymentCycle: 'Thanh toán ngày 05 và ngày 20 hàng tháng',
      paymentMode: 'Tự động (Escrow)',
      contractCode: 'HD-2024/STV-HAH-89',
    },
  },
};

/** Nhật ký kiểm toán có sẵn (trước phiên làm việc hiện tại) */
export const MOCK_PARTNER_AUDIT: Record<string, Omit<PartnerAuditEntry, 'id'>[]> = {
  'PTN-0891': [
    {
      time: '2026-09-02T09:15:00+07:00',
      icon: 'verified',
      text: 'Hoàn tất đối soát hồ sơ pháp lý cấp Bộ, nâng hạng đối tác lên Gold',
      actor: 'Hệ thống AI',
    },
    {
      time: '2026-03-15T10:00:00+07:00',
      icon: 'handshake',
      text: 'Gia hạn hợp đồng HD-2024/STV-HAH-89, mức hoa hồng 8.5%',
      actor: 'Quản trị viên',
    },
  ],
};
