import dayjs from 'dayjs'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'
import { balthasar, casper, melchior } from '@/lib/magi-instances'
import type { MagiHistoryEntry, MagiResponse } from '@/schemas/magi.dto'
import { CACHE_TTL_SECONDS, generateCacheKey } from '@/utils/magi'

// Redisクライアント（遅延接続）
let redisClient: ReturnType<typeof createClient> | null = null

const getRedisClient = async () => {
  if (!process.env.REDIS_URL) return null

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL })
    redisClient.on('error', (err) => console.error('Redis error:', err))
    await redisClient.connect()
  }
  return redisClient
}

export const POST = async (request: NextRequest) => {
  const body = await request.json()
  const question = body.question as string

  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const cacheKey = generateCacheKey(question)

  // キャッシュをチェック
  try {
    const redis = await getRedisClient()
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        console.log('Cache hit for:', question)
        // キャッシュヒット時は履歴に保存せず、そのまま返す
        return NextResponse.json(JSON.parse(cached) as MagiResponse)
      }
    }
  } catch (error) {
    // Redisが利用できない場合はスキップ
    console.warn('Redis cache check failed:', error)
  }

  console.log('Cache miss for:', question)

  // 3つのMAGIユニットに並列で問い合わせ
  const [melchiorResult, balthasarResult, casperResult] = await Promise.all([
    melchior.judge(question),
    balthasar.judge(question),
    casper.judge(question)
  ])

  const response: MagiResponse = {
    melchior: melchiorResult,
    balthasar: balthasarResult,
    casper: casperResult,
    question
  }

  // キャッシュと履歴に保存
  try {
    const redis = await getRedisClient()
    if (redis) {
      // キャッシュに保存（7日間）
      await redis.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(response))
      console.log('Cached result for:', question)

      // 履歴IDとして質問のハッシュを使用（重複防止）
      const historyId = `history:${cacheKey}`
      const historyEntry: MagiHistoryEntry = {
        ...response,
        timestamp: dayjs().toISOString(),
        id: historyId
      }

      // 既存の履歴から同じ質問を削除
      const existingIndex = await redis.lPos('history:index', historyId)
      if (existingIndex !== null) {
        await redis.lRem('history:index', 1, historyId)
      }

      // 履歴エントリーを保存
      await redis.set(historyId, JSON.stringify(historyEntry))

      // 履歴インデックスの先頭に追加（最新100件まで保持）
      await redis.lPush('history:index', historyId)
      await redis.lTrim('history:index', 0, 99)

      console.log('Saved to history:', historyId)
    }
  } catch (error) {
    // Redisが利用できない場合はスキップ
    console.warn('Redis save failed:', error)
  }

  return NextResponse.json(response)
}
