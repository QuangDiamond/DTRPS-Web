/**
 * Mô phỏng tìm kiếm ngữ nghĩa pgvector ở chế độ mock.
 * Server thật: embedding câu truy vấn → `ORDER BY embedding <=> $query LIMIT k` (cosine distance).
 * Ở đây ước lượng độ tương đồng bằng trùng khớp từ khóa có trọng số + từ đồng nghĩa Anh ↔ Việt.
 */
import type { SemanticDocument, SemanticMatch, SemanticSearchRequest } from '@/types';

const normalize = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

const STOPWORDS = new Set([
  'tim',
  'cho',
  'cac',
  'nhung',
  'mot',
  'va',
  'o',
  'tai',
  'co',
  'the',
  'la',
  'de',
  'nao',
  'gan',
  'find',
  'show',
  'me',
  'the',
  'a',
  'an',
  'in',
  'at',
  'for',
  'with',
  'and',
  'of',
  'to',
  'near',
  'some',
  'place',
  'places',
]);

/** Từ đồng nghĩa (đã bỏ dấu) — cho phép truy vấn tiếng Anh khớp dữ liệu tiếng Việt */
const SYNONYMS: Record<string, string[]> = {
  beach: ['bien', 'bai'],
  sea: ['bien'],
  island: ['dao'],
  bay: ['vinh'],
  cave: ['hang'],
  mountain: ['nui'],
  river: ['song'],
  lake: ['ho'],
  nature: ['thien', 'nhien'],
  sunset: ['hoang', 'hon'],
  food: ['am', 'thuc', 'an'],
  eat: ['an'],
  restaurant: ['nha', 'hang', 'quan'],
  seafood: ['hai', 'san'],
  street: ['pho'],
  night: ['dem'],
  market: ['cho'],
  coffee: ['cafe', 'ca', 'phe'],
  heritage: ['di', 'san'],
  ancient: ['co'],
  old: ['co'],
  town: ['pho'],
  history: ['lich', 'su'],
  temple: ['chua', 'den'],
  pagoda: ['chua'],
  spiritual: ['tam', 'linh'],
  museum: ['bao', 'tang'],
  hotel: ['khach', 'san'],
  resort: ['nghi', 'duong'],
  stay: ['luu', 'tru'],
  homestay: ['homestay'],
  craft: ['lang', 'nghe'],
  pottery: ['gom'],
  lantern: ['den', 'long'],
  shopping: ['mua', 'sam'],
  family: ['gia', 'dinh'],
  couple: ['cap', 'doi'],
  kids: ['tre', 'em'],
  free: ['mien', 'phi'],
  cheap: ['re', 'mien', 'phi'],
  photo: ['chup', 'anh'],
  romantic: ['lang', 'man'],
};

const tokenize = (text: string): string[] =>
  normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));

/** Độ tương đồng 0 - 1 giữa câu truy vấn và một tài liệu */
function similarity(queryTokens: string[], document: SemanticDocument): number {
  const body = new Set(tokenize(document.text));
  const title = new Set(tokenize(document.title));
  let matched = 0;
  let titleBonus = 0;
  for (const token of queryTokens) {
    const variants = [token, ...(SYNONYMS[token] ?? [])];
    if (variants.some((variant) => title.has(variant))) {
      matched += 1;
      titleBonus += 0.04;
    } else if (variants.some((variant) => body.has(variant))) {
      matched += 1;
    }
  }
  if (matched === 0) return 0;
  const coverage = matched / queryTokens.length;
  return Math.min(0.99, 0.52 + coverage * 0.4 + titleBonus);
}

export function mockSemanticSearch(
  request: SemanticSearchRequest,
  corpus: SemanticDocument[],
): SemanticMatch[] {
  const queryTokens = tokenize(request.query);
  if (queryTokens.length === 0) return [];
  return corpus
    .filter((document) => document.indexed)
    .map((document) => ({
      id: document.id,
      score: Math.round(similarity(queryTokens, document) * 100),
    }))
    .filter((match) => match.score >= request.minSimilarity)
    .sort((a, b) => b.score - a.score)
    .slice(0, request.topK);
}
