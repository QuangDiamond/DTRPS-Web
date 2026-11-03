import type { ListingDetail } from '@/types';

const STITCH_IMAGE_BASE = 'https://lh3.googleusercontent.com/aida-public/';

/** Hồ sơ chi tiết theo mã POI. Niêm yết không có ở đây sẽ dùng hồ sơ dựng tự động. */
export const MOCK_LISTING_DETAILS: Record<string, ListingDetail> = {
  'POI-94812': {
    reviewLevel: 'Khắt khe (Cấp 1)',
    areaLabel: 'Hội An, Quảng Nam',
    completeness: 96,
    photos: [
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuBeD4ilfz8xzNjKbQlonvU4SKhsJLUQUVKG2ycKaP7SZ9tJCOmiyEuVglQZjoC-VtPBC-TafI9MxSnibrctmA0QFk6VhiHb8oQL75R6QdkZHIiHNDYYhP5EQRrdOiUL1Qv3e1G8MZtIavB81OO07-JDWO9r_e757CQ9mhvKFyvKGuzAlR3L-FQa2ZSpLrbEE-ELy9vk-YuKJ-r4OI4IAL0XjDhA1Dlw9_O-0BtfJE_Yyzu3F5ntMFHLig`,
        caption: 'Toàn cảnh khuôn viên sân vườn & hồ bơi',
        meta: '3840 x 2160 px • WEBP',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuBECY3QNkz3ehMpt2KNsnOOhQTqO8bEdTsNOZvoKyQtDlQcfWXeOZu2BQ3EQwmfr3OhgyVwOR9FKnWuAmA36FRwhFx7s3jx8BI2UE_rwR01kS9E42pRlMA7ujmR9rPGS52nuLxkiO74-BOpoMyxh-W_PiXRTEvIEij-l6w_pNscyuQiKQTuob7WcMeLzwL-P03sk3VU10BfPx5sUG8GOP_0DsYoCYeLlRYVJ7R4sIUvvodHn2DsNUre8w`,
        caption: 'Deluxe Garden',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuAafCx7KfEgYy69QUyu83mYLbmK2uAxNugMoEf7Y3c4JtJZ6qR07xXBCT3vBam1APGmlzQLcqdTBU2qfWdt19SqKBrPFmlA2aGS9yDlE8hjaXay7sYuT6nJXAW8gbUPBSFgoz52be2WoPII1p8kgP3zAQpKcXpyzDacktT2grKuAlp3xfCPARPKYbgn68N2vCc7-IvjvwOKfRYygeDAjAMPlFb5M6ymU_pZPCSt8X8sBwjPSKufngEhWA`,
        caption: 'Hồ bơi muối',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuDbtMqHFSiGurUZoxtis8cewf28ToHtSCUl3pKaUeChbDLt8OyYHM4GDLKqRy-Lc96D7lzZPp3gRYTc_pXgHZ9ZOJhSIzXsvsyKPx3dp65srxKoMaCiY9_KaA06Dxf7BSjBFHIF-DTZ3lmm_JmIqylG4U_UZK4ww3MWcxq-oCjHLATuzhdhozEnZJrQTQYO_PMtPbrNMNorVPZ7o0E8d4TFxe2L4u0n7k2GKlkN8ABQu1fm-FxHa9K4ag`,
        caption: 'Sân vườn hữu cơ',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuDQ3oFM-gabnM167OAHzFTUyz2BXSXu_Y5iUW3ghkS8YMpvph8QCxoS-Kczpyw0Xl1aClfWCWvObJQYtCFC99JkdN0jtVi7YCGI6QPX5CP0YB4KJLzWoX-Bgv6z823OJfvhxl8lJGmqbSGKqSsO8rJuC9EI4WHcORXS96Ar4ZLuIPUyy3gW_gtn-04i_oPh9lBDsttQNx08P4Y3PaN8UHFYQcI18ra8LGP1paHm3hYFuDP5BXKH1Wg25g`,
        caption: 'Bữa sáng đặc sản',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuAvnwhs4un9rTh0itiV7hPMqfrgvzc90Q0qOe4sL1QdvnkO9zVbgPvJfiDJGXexrmC-VMWwxSbnzdzAVu9MARvzaIds4O62RmTUEF8Kzcm35t8PtOPC1c1VUzQ2OZmPvhYdNebGW5QDUa0_JbJlRbvjlZQqJvb8PVccx9AlHTA4S7TOGBJAo6HR8KP5MzdhKiHu9ty1rwM0EYZZjBZ5MvU-nqI7aeuZ2tiXmzXUrS5cpxe-6CK4rQvMiA`,
        caption: 'Sảnh tiếp đón',
      },
      {
        url: `${STITCH_IMAGE_BASE}AB6AXuAUk2DaEUt8yoLunLN7JoXjGX7U5_5z6wvScPsdNPXdl3F7hDmEa_Rwemgmk-_GyPNwYZMwlFntQX6UDsM5oOxxvZtga2hgRGIshL8OAvWfoFAAkHiRCRxa9beSMR_taF70BcTKKCdnidERW0JCLMedC_zpWMloarChOTPhFXlwK91fPy_shgt5gH7kZYuI824vkSQ0cpoHDOO06SNSK6OO-JJqdiKGm6iuKOojXppb0XZa0r0SKxoazA`,
        caption: 'Phòng tắm tiện nghi',
      },
    ],
    requiredPhotoCount: 7,
    partner: {
      code: 'PTN-0891',
      representative: 'Nguyễn Văn Hùng',
      hotline: '0905 123 456',
      yearsActive: '1 năm',
      responseRate: '98%',
      verified: true,
    },
    checklist: [
      { id: 'gps', label: 'Tọa độ GPS hợp lệ', passed: true },
      { id: 'zoning', label: 'Vị trí quy hoạch du lịch', passed: true },
      { id: 'photos', label: 'Ảnh đạt độ phân giải chuẩn', passed: true },
      { id: 'license', label: 'Giấy phép còn hiệu lực', passed: true },
    ],
    location: {
      coordinates: { lat: 15.8821, lng: 108.3415 },
      mapImageUrl: `${STITCH_IMAGE_BASE}AB6AXuAuRvfRDVjot76zFf5ezooiRliqHgJd2MMXEiz87VyqdRHw96pzPSUlmWOKZoGMqEdT7eEqy9WDUcJigjufg6gKbXw0N_PFgalRrySgL9sSqh4b3UTBpfoHcvNrUd3bRwXPuGWcUrjZ10bi05xMOp6_fUxrJ6AkAXjud2jVgXMfM1JrfRqL5QoAKugWLEA9nsySTEfcXKtjpK1vG4P61VS-Tte2oQd6SG4m3R2W35vLOy4_2lf949hFsQ`,
      areaNote: 'Cẩm Châu • Ven Phố Cổ Hội An',
      accuracy: '± 1.2m',
    },
    documents: [
      {
        id: 'business-license',
        fileType: 'pdf',
        title: 'Đăng ký Hộ kinh doanh cá thể',
        meta: 'Số: 4001239871 • UBND TP. Hội An',
        verified: true,
      },
      {
        id: 'fire-safety',
        fileType: 'pdf',
        title: 'Điều kiện ANTT & An toàn PCCC',
        meta: 'Số: 89/GCN-PCCC-HA • Hạn 12/2026',
        verified: true,
      },
      {
        id: 'food-safety',
        fileType: 'pdf',
        title: 'Chứng nhận An toàn Vệ sinh Thực phẩm',
        meta: 'TT Y tế TP. Hội An cấp • Hạn 2026',
        verified: true,
      },
      {
        id: 'signboard',
        fileType: 'image',
        title: 'Ảnh thực tế biển hiệu & HĐ thuê đất',
        meta: '128 Nguyễn Tri Phương • HĐ 1492/CC-QN',
        verified: true,
      },
    ],
    logs: [
      {
        minutesAfterSubmit: 5,
        text: 'AI đối chiếu tọa độ bản đồ: Trùng khớp 99.8% với địa chính.',
      },
    ],
    defaultNote:
      'Đã đối chiếu 4/4 tài liệu hợp lệ với dữ liệu địa chính Hội An. Hồ sơ hợp lệ 100%.',
  },
};
