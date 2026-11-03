import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Brand } from '@/client/ui/Brand';
import { TextLink } from '@/client/ui/Buttons';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80';

const FEATURES = ['Không cần prompt', 'Tối ưu chi phí', 'Hỗ trợ offline'];

/** Màn chào mừng cho khách chưa đăng nhập — theo WelcomeScreen của mobile */
export default function WelcomePage() {
  useEffect(() => {
    document.title = 'Chào mừng · SmartTravel';
  }, []);

  return (
    <div className="min-h-screen bg-client-bg">
      <div className="relative flex h-[300px] items-start justify-center overflow-hidden bg-[#DDF7F3] md:h-[360px]">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <p className="relative mx-4 mt-6 rounded-full bg-white px-5 py-2 text-center text-[11px] font-extrabold text-[#006D67]">
          KHÁM PHÁ VIỆT NAM CÙNG Smart Travel - Ứng dụng du lịch thông minh
        </p>
      </div>

      <div className="relative mx-auto -mt-16 w-full max-w-[440px] px-5 pb-10">
        <div className="rounded-3xl bg-client-bg pt-4">
          <Brand />
        </div>
        <div className="min-h-[215px] rounded-3xl bg-white p-5">
          <p className="text-[11px] font-extrabold text-[#007F76]">✦ TỐI ƯU & TINH TUYỂN</p>
          <h1 className="mt-3 text-[21px] font-extrabold text-[#1E3443]">
            Trải nghiệm du lịch thông minh
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-[#5D6F7B]">
            Tiết kiệm 90% thời gian lên kế hoạch, chỉ dẫn ẩm thực bản địa chuẩn vị và cập nhật giá
            đẹp tránh đông đúc theo thời gian thực.
          </p>
          <p className="mt-6 text-center text-[#007E76]" aria-hidden="true">
            ● ○ ○
          </p>
        </div>
        <div className="my-6 flex justify-between gap-2">
          {FEATURES.map((feature) => (
            <span key={feature} className="text-[11px] text-[#567782]">
              ✦ {feature}
            </span>
          ))}
        </div>
        <Link
          to={CLIENT_ROUTES.REGISTER}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-extrabold text-white hover:bg-primary-container"
        >
          Bắt đầu ngay <Icon name="arrow_forward" className="text-[19px]" />
        </Link>
        <TextLink to={CLIENT_ROUTES.LOGIN}>Đã có tài khoản hành trình? Đăng nhập</TextLink>
      </div>
    </div>
  );
}
