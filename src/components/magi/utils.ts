import type { MagiFinalResult, MagiStatus, MagiUnit, MagiVote } from "./types";

// 投票結果から最終決定を算出
export const getFinalResult = (units: MagiUnit[]): MagiFinalResult => {
  const pendingCount = units.filter((u) => u.vote === "PENDING").length;
  if (pendingCount > 0) return "PENDING";

  const noCount = units.filter((u) => u.vote === "NO").length;
  if (noCount > 0) return "DENY";

  return "AGREE";
};

// 投票結果を日本語テキストに変換
export const getVoteText = (vote: MagiVote): string => {
  if (vote === "YES") return "承認";
  if (vote === "NO") return "否定";
  return "審議中";
};

// 投票結果を英語テキストに変換
export const getVoteTextEnglish = (vote: MagiVote): string => {
  if (vote === "YES") return "APPROVED";
  if (vote === "NO") return "DENIED";
  return "PENDING";
};

// 最終結果を日本語テキストに変換
export const getFinalResultText = (result: MagiFinalResult): string => {
  if (result === "AGREE") return "可決";
  if (result === "DENY") return "否決";
  return "審議中";
};

// 最終結果の英語表記
export const getFinalResultEnglish = (result: MagiFinalResult): string => {
  if (result === "AGREE") return "APPROVED";
  if (result === "DENY") return "DENIED";
  return "PENDING";
};

// ステータスの英語表記
export const getStatusText = (status: MagiStatus): string => {
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "THINKING") return "THINKING";
  if (status === "ERROR") return "ERROR";
  return "PENDING";
};

// カラーパレット定数
export const COLORS = {
  primary: "#f06800",
  black: "#000000",
  blackBright: "#484848",
  red: "#a00010",
  redBright: "#c80010",
  green: "#409820",
  greenBright: "#50ff10",
  yellow: "#f4b000",
  yellowBright: "#f0f0a0",
  blue: "#5090c8",
  blueBright: "#40c8e8",
  magenta: "#a06090",
  magentaBright: "#b040a0",
  cyan: "#60f0a0",
  cyanBright: "#3cffd0",
  white: "#b0b0b0",
  whiteBright: "#e8e8e8",
} as const;

// 投票結果の色を取得
export const getVoteColor = (vote: MagiVote): string => {
  if (vote === "YES") return COLORS.blueBright;
  if (vote === "NO") return COLORS.redBright;
  return COLORS.primary;
};

// 投票結果に応じたカード背景色を取得
export const getCardBackgroundColor = (vote: MagiVote): string => {
  if (vote === "YES") return COLORS.blue;
  if (vote === "NO") return COLORS.red;
  return COLORS.red;
};

// 投票結果に応じたカードボーダー色を取得
export const getCardBorderColor = (vote: MagiVote): string => {
  if (vote === "YES") return COLORS.blueBright;
  return COLORS.redBright;
};

// 最終結果の色を取得
export const getResultColor = (result: MagiFinalResult): string => {
  if (result === "AGREE") return COLORS.blueBright;
  if (result === "DENY") return COLORS.redBright;
  return COLORS.primary;
};
