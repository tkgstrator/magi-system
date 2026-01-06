// キャッシュキーを生成（質問を正規化）
export const generateCacheKey = (question: string): string => {
  const normalized = question.trim().toLowerCase()
  return `magi:${normalized}`
}

// キャッシュの有効期限（7日間）
export const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7
