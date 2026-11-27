import { API_URL } from '@/services/config';

const CACHE_STORAGE_KEY = 'smarttravel.client.trCache.v1';
const MAX_LOCAL_CACHE = 800;

const VN_DIACRITIC_RE =
  /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]/;

export function hasVietnameseChars(text: string): boolean {
  return VN_DIACRITIC_RE.test(text);
}

const memoryCache = new Map<string, string>();
const inflight = new Set<string>();
const pendingQueue = new Set<string>();
const listeners = new Set<() => void>();
let flushTimer: number | null = null;
let cacheLoaded = false;

function ensureCacheLoaded(): void {
  if (cacheLoaded) return;
  cacheLoaded = true;
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && v) memoryCache.set(k, v);
    }
  } catch {
    // ignore storage errors
  }
}

function persistCache(): void {
  try {
    const entries = [...memoryCache.entries()].slice(-MAX_LOCAL_CACHE);
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // ignore quota errors
  }
}

export function getCachedAutoTranslation(text: string): string | undefined {
  ensureCacheLoaded();
  return memoryCache.get(text);
}

export function subscribeAutoTranslations(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((cb) => cb());
}

async function flushBatch(): Promise<void> {
  flushTimer = null;
  const batch = [...pendingQueue].slice(0, 35);
  if (batch.length === 0) return;
  for (const item of batch) {
    pendingQueue.delete(item);
    inflight.add(item);
  }

  try {
    const res = await fetch(`${API_URL}/translate/vi-en`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: batch }),
    });
    if (res.ok) {
      const data = (await res.json()) as { translations?: Record<string, string> };
      const map = data.translations ?? {};
      let updated = false;
      for (const [src, dst] of Object.entries(map)) {
        if (dst && dst !== src) {
          memoryCache.set(src, dst);
          updated = true;
        } else {
          // Ghi nhận để không gọi lặp lại cho chuỗi không đổi
          memoryCache.set(src, src);
        }
      }
      if (updated) {
        persistCache();
        notifyListeners();
      }
    }
  } catch {
    // Mạng lỗi → giữ nguyên chữ gốc, không làm gián đoạn UI
  } finally {
    for (const item of batch) inflight.delete(item);
    if (pendingQueue.size > 0 && flushTimer === null) {
      flushTimer = window.setTimeout(() => void flushBatch(), 120);
    }
  }
}

/** Đưa một chuỗi tiếng Việt vào hàng đợi dịch theo lô (debounce 80ms) */
export function queueAutoTranslation(text: string): void {
  ensureCacheLoaded();
  const key = text.replace(/\s+/g, ' ').trim();
  if (!key || key.length < 2 || key.length > 1800) return;
  if (!hasVietnameseChars(key)) return;
  if (memoryCache.has(key) || inflight.has(key) || pendingQueue.has(key)) return;
  pendingQueue.add(key);
  if (flushTimer === null) {
    flushTimer = window.setTimeout(() => void flushBatch(), 80);
  }
}
