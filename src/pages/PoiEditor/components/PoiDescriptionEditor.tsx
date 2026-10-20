import { useRef } from 'react';
import Icon from '../../../components/common/Icon';
import { formatNumber } from '../../../utils/format';

type DescriptionFormat =
  'bold' | 'italic' | 'underline' | 'bullet' | 'numbered' | 'quote' | 'link' | 'image';

interface FormatResult {
  text: string;
  /** Vùng chọn lại sau khi chèn, tính từ vị trí bắt đầu vùng chọn cũ */
  selectStart: number;
  selectEnd: number;
}

const wrap = (
  selected: string,
  before: string,
  after: string,
  placeholder: string,
): FormatResult => {
  const inner = selected || placeholder;
  return {
    text: `${before}${inner}${after}`,
    selectStart: before.length,
    selectEnd: before.length + inner.length,
  };
};

const prefixLines = (selected: string, prefix: (index: number) => string): FormatResult => {
  const lines = (selected || 'Nội dung').split('\n');
  const text = lines.map((line, index) => `${prefix(index)}${line}`).join('\n');
  return { text, selectStart: 0, selectEnd: text.length };
};

/** Cú pháp Markdown — khi có backend có thể render ra HTML ở App Mobile */
const FORMATTERS: Record<DescriptionFormat, (selected: string) => FormatResult> = {
  bold: (s) => wrap(s, '**', '**', 'chữ đậm'),
  italic: (s) => wrap(s, '_', '_', 'chữ nghiêng'),
  underline: (s) => wrap(s, '<u>', '</u>', 'gạch chân'),
  bullet: (s) => prefixLines(s, () => '• '),
  numbered: (s) => prefixLines(s, (index) => `${index + 1}. `),
  quote: (s) => prefixLines(s, () => '> '),
  link: (s) => {
    const label = s || 'văn bản liên kết';
    const text = `[${label}](https://)`;
    return { text, selectStart: label.length + 3, selectEnd: text.length - 1 };
  },
  image: (s) => {
    const label = s || 'mô tả ảnh';
    const text = `![${label}](https://)`;
    return { text, selectStart: label.length + 4, selectEnd: text.length - 1 };
  },
};

const TEXT_BUTTONS: {
  format: DescriptionFormat;
  label: string;
  className: string;
  title: string;
}[] = [
  { format: 'bold', label: 'B', className: 'font-bold', title: 'In đậm' },
  { format: 'italic', label: 'I', className: 'italic', title: 'In nghiêng' },
  { format: 'underline', label: 'U', className: 'underline', title: 'Gạch chân' },
];

const ICON_GROUPS: { format: DescriptionFormat; icon: string; title: string }[][] = [
  [
    { format: 'bullet', icon: 'format_list_bulleted', title: 'Danh sách dấu chấm' },
    { format: 'numbered', icon: 'format_list_numbered', title: 'Danh sách đánh số' },
    { format: 'quote', icon: 'format_quote', title: 'Trích dẫn' },
  ],
  [
    { format: 'link', icon: 'link', title: 'Chèn liên kết' },
    { format: 'image', icon: 'image', title: 'Chèn ảnh' },
  ],
];

interface PoiDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PoiDescriptionEditor({ value, onChange }: PoiDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (format: DescriptionFormat) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end } = textarea;
    const result = FORMATTERS[format](value.slice(start, end));
    onChange(value.slice(0, start) + result.text + value.slice(end));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + result.selectStart, start + result.selectEnd);
    });
  };

  return (
    <div className="flex flex-col gap-1.5 md:col-span-2">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md font-semibold text-on-surface">
          Mô tả chi tiết điểm đến
        </label>
        <span className="font-label-sm text-label-sm text-outline">
          Đã nhập {formatNumber(value.length)} ký tự • Ngôn ngữ: VI
        </span>
      </div>
      <div className="flex flex-col overflow-hidden rounded-lg bg-surface-container-low">
        {/* Thanh công cụ soạn thảo */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-container-high/60 px-space-sm py-2">
          {TEXT_BUTTONS.map((button) => (
            <button
              key={button.format}
              type="button"
              title={button.title}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFormat(button.format)}
              className={`rounded p-1.5 text-label-md text-on-surface-variant hover:bg-surface-container-lowest ${button.className}`}
            >
              {button.label}
            </button>
          ))}
          {ICON_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-1">
              <span className="mx-1 h-4 w-px bg-outline-variant" />
              {group.map((button) => (
                <button
                  key={button.format}
                  type="button"
                  title={button.title}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyFormat(button.format)}
                  className="flex items-center rounded p-1 text-on-surface-variant hover:bg-surface-container-lowest"
                >
                  <Icon name={button.icon} className="text-[18px]" />
                </button>
              ))}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          rows={4}
          value={value}
          placeholder="Giới thiệu lịch sử, điểm nổi bật và trải nghiệm đáng chú ý của điểm đến..."
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-none bg-transparent p-space-md font-body-md text-body-md leading-relaxed text-on-surface placeholder:text-outline focus:outline-none"
        />
      </div>
    </div>
  );
}
