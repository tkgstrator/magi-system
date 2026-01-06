// MAGIシステムの型定義

export type MagiVote = 'YES' | 'NO' | 'PENDING'

export type MagiStatus = 'PENDING' | 'THINKING' | 'COMPLETED' | 'ERROR'

export type MagiUnit = {
  name: string
  fullName: string
  role: string
  modelName: string
  modelId: string
  vote: MagiVote
  confidence: number
  reason: string
  status: MagiStatus
  revealed: boolean
}

export type MagiUnitApiResponse = {
  vote: 'YES' | 'NO'
  confidence: number
  reason: string
}

export type MagiApiResponse = {
  melchior: MagiUnitApiResponse
  balthasar: MagiUnitApiResponse
  casper: MagiUnitApiResponse
  question: string
}

// 最終結果の種類
// 可決: 全員YES
// 否決: 1つでもNOあり
// 審議中: まだ結果が出てない
export type MagiFinalResult = 'AGREE' | 'DENY' | 'PENDING'
