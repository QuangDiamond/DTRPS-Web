import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { Heading } from '@/client/ui/Blocks';

/** Trang giữ chỗ cho các màn sẽ chuyển từ mobile lên web ở các bước sau */
export default function ComingSoonPage({
  eyebrow,
  title,
  description,
  backTo,
  backLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <div>
      <Heading eyebrow={eyebrow} title={title} description={description} />
      <div className="flex flex-col items-center rounded-[20px] border border-dashed border-[#A4CFC8] bg-white px-6 py-12 text-center">
        <Icon name="construction" className="text-[40px] text-client-teal" />
        <p className="mt-3 text-[15px] font-bold text-client-ink">Màn hình đang được phát triển</p>
        <p className="mt-1 max-w-sm text-[12px] text-client-muted">
          Giao diện đã có trên app mobile và sẽ được đưa lên web cùng API ở các bước tiếp theo.
        </p>
        <Link
          to={backTo}
          className="mt-5 rounded-full bg-[#E3F3EF] px-5 py-2.5 text-[12px] font-bold text-primary"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
