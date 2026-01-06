import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

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

export const GET = async (_request: NextRequest) => {
  try {
    const redis = await getRedisClient()
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 503 })
    }

    // 履歴インデックスから最新100件のIDを取得
    const historyIds = await redis.lRange('history:index', 0, -1)

    if (historyIds.length === 0) {
      return NextResponse.json({ history: [] })
    }

    // 各履歴エントリーを取得
    const historyEntries = await Promise.all(
      historyIds.map(async (id) => {
        const data = await redis.get(id)
        return data ? JSON.parse(data) : null
      })
    )

    // nullを除外
    const history = historyEntries.filter((entry) => entry !== null)

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
