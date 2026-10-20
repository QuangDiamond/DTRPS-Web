import Icon from './Icon';

interface PagePlaceholderProps {
  title: string;
  icon: string;
}

/** Trang tạm, sẽ thay bằng UI từ Stitch */
export default function PagePlaceholder({ title, icon }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-outline">
      <Icon name={icon} className="text-5xl" />
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">{title}</h1>
      <p className="font-body-md text-body-md">Đang chờ UI từ Stitch</p>
    </div>
  );
}
