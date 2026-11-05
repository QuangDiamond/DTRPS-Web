import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Brand } from '@/client/ui/Brand';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80';

/** Những gì ứng dụng thực sự làm */
const FEATURES: { icon: string; title: string; text: string }[] = [
  {
    icon: 'explore',
    title: 'Khám phá điểm đến',
    text: 'Hàng trăm địa điểm có ảnh, giờ mở cửa, giá và bản đồ.',
  },
  {
    icon: 'tune',
    title: 'Gợi ý theo sở thích',
    text: 'Chọn dịch vụ, loại hình bạn thích để nhận gợi ý phù hợp.',
  },
  {
    icon: 'event_note',
    title: 'Lập lịch trình',
    text: 'Sắp xếp chuyến đi theo ngày, lưu địa điểm yêu thích.',
  },
];

/** Màn chào mừng cho khách chưa đăng nhập — theo WelcomeScreen của mobile */
export default function WelcomePage() {
  useEffect(() => {
    document.title = 'Chào mừng · SmartTravel';
  }, []);

  return (
    <div className="min-h-screen bg-client-bg">
      <div className="relative h-[240px] overflow-hidden bg-[#DDF7F3] md:h-[300px]">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      </div>

      <div className="relative mx-auto -mt-20 w-full max-w-[460px] px-5 pb-10">
        <div className="rounded-3xl border border-[#E8EDF2] bg-white p-6 shadow-[0_10px_30px_rgba(19,54,74,0.06)]">
          <Brand />
          <h1 className="text-center text-[20px] font-extrabold text-[#13364A]">
            Lên kế hoạch du lịch Việt Nam dễ dàng hơn
          </h1>
          <ul className="mt-5 space-y-3.5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4F6F2] text-primary">
                  <Icon name={feature.icon} className="text-[20px]" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-bold text-[#13364A]">
                    {feature.title}
                  </span>
                  <span className="block text-[12.5px] leading-[18px] text-[#62737F]">
                    {feature.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            to={CLIENT_ROUTES.REGISTER}
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-extrabold text-white hover:bg-primary-container"
          >
            Tạo tài khoản <Icon name="arrow_forward" className="text-[19px]" />
          </Link>
          <p className="mt-4 text-center text-[13px] text-[#62737F]">
            Đã có tài khoản?{' '}
            <Link to={CLIENT_ROUTES.LOGIN} className="font-bold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

        <Link
          to={CLIENT_ROUTES.HOME}
          className="group mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#9FD8D1] bg-white px-5 py-2.5 text-[13px] font-bold text-primary shadow-sm transition-colors hover:border-primary hover:bg-[#E8F9F4]"
        >
          <Icon name="explore" className="text-[19px]" />
          Khám phá ngay, chưa cần tài khoản
          <Icon
            name="arrow_forward"
            className="text-[17px] transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
