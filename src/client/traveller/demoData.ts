/**
 * Dữ liệu DEMO của trang chủ du khách — giống app mobile (HomeScreen).
 * Quảng cáo / giá / ưu đãi là hardcode, sẽ thay bằng API quảng cáo khi backend có.
 */

export type AdCategory = 'Lưu trú' | 'Ẩm thực' | 'Trải nghiệm';

export interface PartnerAd {
  id: string;
  name: string;
  category: AdCategory;
  location: string;
  image: string;
  offer: string;
  headline: string;
  tagline: string;
  description: string;
  rating: string;
  price: string;
  oldPrice?: string;
  badge: string;
}

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80';

export const PARTNER_ADS: PartnerAd[] = [
  {
    id: 'partner-01',
    name: 'Mây Retreat',
    category: 'Lưu trú',
    location: 'Đà Lạt, Lâm Đồng',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=85',
    offer: 'GIẢM 25%',
    headline: 'Một kỳ nghỉ giữa thiên nhiên',
    tagline: 'Thức dậy giữa rừng thông',
    description: 'Không gian xanh, ấm cúng cho chuyến đi thư giãn.',
    rating: '4.9',
    price: '890.000đ',
    oldPrice: '1.190.000đ',
    badge: 'Ưu đãi nổi bật',
  },
  {
    id: 'partner-02',
    name: 'Sóng Xanh Resort',
    category: 'Lưu trú',
    location: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=85',
    offer: 'GIẢM 30%',
    headline: 'Chạm biển, chạm bình yên',
    tagline: 'Kỳ nghỉ bên bờ biển',
    description: 'Hồ bơi xanh mát, không gian thoáng đãng và yên bình.',
    rating: '4.8',
    price: '1.250.000đ',
    oldPrice: '1.790.000đ',
    badge: 'Được quan tâm',
  },
  {
    id: 'partner-03',
    name: 'Bếp Nhà Hội An',
    category: 'Ẩm thực',
    location: 'Hội An, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85',
    offer: 'TẶNG MÓN',
    headline: 'Trọn vẹn hương vị phố Hội',
    tagline: 'Bữa tối giữa phố cổ',
    description: 'Món ngon địa phương trong không gian thật gần gũi.',
    rating: '4.9',
    price: '199.000đ',
    oldPrice: '249.000đ',
    badge: 'Ẩm thực địa phương',
  },
  {
    id: 'partner-04',
    name: 'Hải Âu Experience',
    category: 'Trải nghiệm',
    location: 'Phú Quốc, An Giang',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1400&q=85',
    offer: 'GIẢM 15%',
    headline: 'Đi tìm những chuyến phiêu lưu',
    tagline: 'Một ngày giữa biển xanh',
    description: 'Trải nghiệm khám phá thiên nhiên cùng người bản địa.',
    rating: '4.8',
    price: '590.000đ',
    oldPrice: '690.000đ',
    badge: 'Trải nghiệm mới',
  },
  {
    id: 'partner-05',
    name: 'Mộc Phố Coffee',
    category: 'Ẩm thực',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&q=85',
    offer: 'MUA 1 TẶNG 1',
    headline: 'Một chút bình yên giữa phố',
    tagline: 'Góc nhỏ cho ngày đẹp trời',
    description: 'Cà phê ấm áp và những cuộc hẹn thật chậm.',
    rating: '4.7',
    price: '49.000đ',
    badge: 'Được yêu thích',
  },
];

export const HOME_CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Tất cả', icon: 'explore' },
  { label: 'Vịnh biển', icon: 'sailing' },
  { label: 'Núi cao', icon: 'landscape' },
  { label: 'Di sản', icon: 'temple_buddhist' },
  { label: 'Ẩm thực', icon: 'restaurant' },
];
