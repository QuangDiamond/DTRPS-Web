/**
 * Lựa chọn cho màn Sở thích du lịch (UC-006).
 * "Trải nghiệm" lấy từ loại hình địa điểm (GET /api/reference/interests → place_categories),
 * "Yêu cầu đặc biệt" lấy từ GET /api/reference/special-needs; ảnh/icon hiển thị được tra theo
 * mã (code) ở đây. Ngân sách là enum cố định của TravelPreferences nên vẫn khai báo tĩnh.
 */
import type { ReferenceItem } from '@/client/api/types';

export interface ImageOption<T extends string = string> {
  id: T;
  label: string;
  image: string;
}

export interface IconOption<T extends string = string> {
  id: T;
  label: string;
  icon: string;
  note?: string;
}

/** Ảnh địa điểm thật trên Cloudinary của dự án, thu nhỏ còn rộng 600px cho thẻ chọn */
const img = (path: string) =>
  `https://res.cloudinary.com/f3wrjuzb/image/upload/c_fill,w_600,h_300,q_auto,f_auto/${path}`;

/**
 * Bước 1 – Trải nghiệm: mỗi loại hình (place_categories) một ảnh riêng, lấy từ một địa điểm tiêu
 * biểu của đúng loại đó.
 */
const INTEREST_IMAGES: Record<string, string> = {
  // Lưu trú
  hotel: img('v1793798505/dtrps/places/lpiwpivvr1fhhiafnxp5.jpg'), // Sofitel Legend Metropole
  resort: img('v1794472572/dtrps/preferences/resort.png'), // Resort ven biển (ảnh do nhóm chọn)
  homestay: img('v1794472468/dtrps/preferences/homestay.png'), // Homestay trên đồi (ảnh do nhóm chọn)
  villa: img('v1793801036/dtrps/places/ydmb2rfshg2vjra580t4.jpg'), // Six Senses Côn Đảo
  // Ẩm thực
  restaurant: img('v1793801120/dtrps/places/kasz9oscr9pbermbscdv.jpg'), // Chả cá Lã Vọng
  cafe: img('v1793798501/dtrps/places/kf1y33uj0gxbrq9sggep.jpg'), // Cà phê Giảng
  localEatery: img('v1793798496/dtrps/places/ky6iuftcisc37wokrgy4.jpg'), // Bún chả Hương Liên
  barPub: img('v1794472474/dtrps/preferences/barPub.png'), // Rooftop bar Hà Nội (ảnh do nhóm chọn)
  // Vui chơi & Tham quan
  heritage: img('v1793798465/dtrps/places/jurwen5a4ncepkev2kz2.jpg'), // Văn Miếu
  amusementPark: img('v1793798512/dtrps/places/ezqi8rntmvvcelnhtbi7.jpg'), // Sun World Hạ Long
  park: img('v1793801102/dtrps/places/dx614uuehpbpwnbbiyhb.jpg'), // Thảo Cầm Viên
  scenicSpot: img('v1793798515/dtrps/places/sr4nw9a7mgnblp1ruxmz.jpg'), // Tràng An
  checkinSpot: img('v1793801420/dtrps/places/eym64uuih6eayv1dfmjc.jpg'), // Cánh đồng điện gió Bạc Liêu
  beach: img('v1793871966/dtrps/places/nkhvz2ue91qjdef9iwne.jpg'), // Bãi biển Lăng Cô
  // Mua sắm & Đặc sản
  nightMarket: img('v1793798483/dtrps/places/qlpqwt99dlb0atb6gfsj.jpg'), // Chợ đêm phố cổ Hà Nội
  specialtyStore: img('v1793800976/dtrps/places/dmd8pm5fmg80sg1eaqg6.jpg'), // Chợ Đông Ba
  souvenirShop: img('v1794472475/dtrps/preferences/souvenirShop.png'), // Cửa hàng lưu niệm (ảnh do nhóm chọn)
  craftVillage: img('v1793798492/dtrps/places/vhsojsuqq3fpd431hn64.jpg'), // Làng gốm Bát Tràng
};
/** Loại hình admin thêm sau mà chưa có ảnh riêng: ảnh Vịnh Lan Hạ (cảnh du lịch chung) */
const DEFAULT_INTEREST_IMAGE = img('v1793800956/dtrps/places/rx2j27dvo4sggx9fam6n.jpg');

/** Bước 2 – Yêu cầu đặc biệt: icon theo mã của BE */
const SPECIAL_NEED_ICONS: Record<string, string> = {
  vegetarian: 'eco',
  diet: 'no_meals',
  kids: 'child_care',
  elderly: 'elderly',
  pets: 'pets',
  other: 'more_horiz',
};
const DEFAULT_SPECIAL_NEED_ICON = 'info';

export const toInterestOptions = (items: ReferenceItem[]): ImageOption[] =>
  items.map((item) => ({
    id: item.code,
    label: item.name,
    image: INTEREST_IMAGES[item.code] ?? DEFAULT_INTEREST_IMAGE,
  }));

export const toSpecialNeedOptions = (items: ReferenceItem[]): IconOption[] =>
  items.map((item) => ({
    id: item.code,
    label: item.name,
    icon: SPECIAL_NEED_ICONS[item.code] ?? DEFAULT_SPECIAL_NEED_ICON,
  }));
