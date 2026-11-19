import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import type { PlaceSummary } from '@/client/api/types';
import { placePath } from '@/client/routePaths';

const PAGE_SIZE = 8;
const DEBOUNCE_MS = 300;

/**
 * Ô tìm địa điểm theo tên ở trang chủ (GET /api/places?keyword=).
 * Không phân biệt dấu/hoa thường ("chua huong" → Chùa Hương), gợi ý ngay khi gõ, bấm để mở chi tiết.
 */
export default function HomePlaceSearch() {
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<PlaceSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const keyword = query.trim();

  // Tìm lại từ trang đầu mỗi khi từ khóa đổi (chờ người dùng ngừng gõ).
  useEffect(() => {
    if (!keyword) {
      setResults([]);
      setTotal(0);
      setError('');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      placesApi
        .list({ keyword, page: 0, size: PAGE_SIZE })
        .then((result) => {
          if (!active) return;
          setResults(result.items);
          setTotal(result.total);
          setPage(0);
          setActiveIndex(0);
        })
        .catch((caught) => {
          if (active) setError(errorMessage(caught));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [keyword]);

  // Đóng danh sách khi bấm ra ngoài.
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setLoading(true);
    placesApi
      .list({ keyword, page: next, size: PAGE_SIZE })
      .then((result) => {
        setResults((current) => [...current, ...result.items]);
        setTotal(result.total);
        setPage(next);
      })
      .catch((caught) => setError(errorMessage(caught)))
      .finally(() => setLoading(false));
  };

  const openPlace = (place: PlaceSummary) => {
    setOpen(false);
    navigate(placePath(String(place.id)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const place = results[activeIndex] ?? results[0];
      if (place) openPlace(place);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && keyword.length > 0;

  return (
    <div ref={boxRef} className="relative mt-4">
      <div className="flex items-center rounded-2xl bg-white px-3 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
        <Icon name="search" className="text-[23px] text-primary" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="home-place-search-results"
          aria-autocomplete="list"
          placeholder="Tìm địa điểm theo tên, ví dụ: Chùa Hương, Hồ Tây…"
          className="ml-2 h-9 flex-1 bg-transparent text-[13px] text-client-ink placeholder:text-[#87918F] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            aria-label="Xóa từ khóa"
            className="rounded-full p-1 text-[#87918F] hover:bg-[#F1F4F4]"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id="home-place-search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-[#E7EBEF] bg-white p-2 shadow-xl"
        >
          {error && <p className="px-3 py-4 text-center text-[12px] text-client-danger">{error}</p>}

          {!error && !loading && results.length === 0 && (
            <p className="px-3 py-4 text-center text-[12px] text-client-muted">
              Không tìm thấy địa điểm nào có tên “{keyword}”.
            </p>
          )}

          {results.map((place, index) => (
            <button
              key={place.id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => openPlace(place)}
              className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${
                index === activeIndex ? 'bg-[#EEF8F6]' : 'hover:bg-[#F6F8F8]'
              }`}
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#DCEFEB]">
                {place.coverUrl ? (
                  <img src={place.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Icon name="landscape" className="text-[20px] text-[#73B8AD]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-client-ink">{place.name}</p>
                <p className="truncate text-[11px] text-client-muted">
                  {[place.category?.name, place.province?.name].filter(Boolean).join(' · ') ||
                    place.address ||
                    'Địa điểm du lịch'}
                </p>
              </div>
              <Icon name="chevron_right" className="text-[18px] text-[#B5BFC4]" />
            </button>
          ))}

          {loading && (
            <p role="status" className="px-3 py-3 text-center text-[12px] text-client-muted">
              Đang tìm…
            </p>
          )}

          {!loading && results.length > 0 && results.length < total && (
            <button
              type="button"
              onClick={loadMore}
              className="mt-1 w-full rounded-xl py-2 text-[12px] font-bold text-primary hover:bg-[#F1FAF8]"
            >
              Xem thêm kết quả ({total - results.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
