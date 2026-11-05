import Icon from './Icon';

/**
 * Logo SmartTravel dùng chung cho mọi nơi (admin, du khách, đối tác): cùng quả cầu "public",
 * cùng chữ "SmartTravel", cùng ô bo góc — chỉ đổi màu theo nền.
 * light: nền sáng · dark: nền đậm (sidebar admin, top bar du khách) · inverse: nền màu thương hiệu
 * (panel trái trang đăng nhập admin) — ô trắng, quả cầu màu thương hiệu.
 */
export default function BrandMark({
  subtitle,
  tone = 'light',
  size = 'md',
}: {
  subtitle?: string;
  tone?: 'light' | 'dark' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
}) {
  const tile = {
    light: 'bg-brand text-white',
    dark: 'bg-[#14B8A6] text-white',
    inverse: 'bg-white text-brand',
  }[tone];
  const word = {
    light: 'text-[#13364A]',
    dark: 'text-white',
    inverse: 'text-white',
  }[tone];
  const accent = { light: 'text-brand', dark: 'text-[#5EEAD4]', inverse: 'text-[#99F6E4]' }[tone];
  const sub = { light: 'text-brand', dark: 'text-white/60', inverse: 'text-white/75' }[tone];

  if (size === 'lg') {
    return (
      <span className="flex flex-col items-center">
        <span
          className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ${tile}`}
        >
          <Icon name="public" className="text-[38px]" />
        </span>
        <span className={`text-[26px] leading-none font-extrabold ${word}`}>
          Smart<span className={accent}>Travel</span>
        </span>
        {subtitle && (
          <span className={`mt-1.5 text-[10px] font-extrabold tracking-[0.15em] ${sub}`}>
            {subtitle}
          </span>
        )}
      </span>
    );
  }

  const box = size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-10 w-10 rounded-xl';
  const glyph = size === 'sm' ? 'text-[21px]' : 'text-[24px]';
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className={`flex shrink-0 items-center justify-center shadow-sm ${box} ${tile}`}>
        <Icon name="public" className={glyph} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`text-[16px] font-extrabold tracking-tight ${word}`}>
          Smart<span className={accent}>Travel</span>
        </span>
        {subtitle && (
          <span
            className={`mt-1 truncate text-[9.5px] font-bold tracking-[0.18em] uppercase ${sub}`}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
