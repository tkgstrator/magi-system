import { z } from 'zod'

// Zodスキーマ定義
export const MagiVoteSchema = z.enum(['YES', 'NO'])

export const MagiUnitResponseSchema = z.object({
  vote: MagiVoteSchema,
  confidence: z.number().int().min(0).max(100),
  reason: z.string().max(140)
})

export type MagiUnitResponse = z.infer<typeof MagiUnitResponseSchema>

export type MagiResponse = {
  melchior: MagiUnitResponse
  balthasar: MagiUnitResponse
  casper: MagiUnitResponse
  question: string
}

export type MagiHistoryEntry = MagiResponse & {
  timestamp: string
  id: string
}
