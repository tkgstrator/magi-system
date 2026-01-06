// MAGIコンポーネントのエクスポート
export { ConfigBox } from './ConfigBox'
export { MagiQueryInput } from './MagiQueryInput'
export { MagiUnitCard } from './MagiUnitCard'

// 型のエクスポート
export type {
  MagiApiResponse,
  MagiFinalResult,
  MagiStatus,
  MagiUnit,
  MagiUnitApiResponse,
  MagiVote
} from './types'

// ユーティリティのエクスポート
export {
  COLORS,
  getCardBackgroundColor,
  getCardBorderColor,
  getFinalResult,
  getFinalResultEnglish,
  getFinalResultText,
  getResultColor,
  getStatusText,
  getVoteColor,
  getVoteText,
  getVoteTextEnglish
} from './utils'
