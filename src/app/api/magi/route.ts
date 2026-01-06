import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "redis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Redisクライアント（遅延接続）
let redisClient: ReturnType<typeof createClient> | null = null;

const getRedisClient = async () => {
  if (!process.env.REDIS_URL) return null;

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
  }
  return redisClient;
};

type MagiVote = "YES" | "NO";

type MagiUnitResponse = {
  vote: MagiVote;
  confidence: number;
  reason: string;
};

type MagiResponse = {
  melchior: MagiUnitResponse;
  balthasar: MagiUnitResponse;
  casper: MagiUnitResponse;
  question: string;
};

// キャッシュキーを生成（質問を正規化）
const generateCacheKey = (question: string): string => {
  const normalized = question.trim().toLowerCase();
  return `magi:${normalized}`;
};

// キャッシュの有効期限（7日間）
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

// システムプロンプトのベース
const createSystemPrompt = (persona: string) => `
あなたはMAGIシステムの一部です。${persona}

ユーザーからの質問に対して、以下のJSON形式で回答してください:
{
  "vote": "YES" または "NO",
  "confidence": 0-100の数値（確信度）,
  "reason": "判断理由を日本語で簡潔に説明"
}

重要なルール:
- 必ず上記のJSON形式のみで回答してください
- voteは必ず"YES"か"NO"のどちらかです
- confidenceは判断の確信度を0-100で表してください
- reasonは140文字以内で簡潔に
`;

// MELCHIOR-1: 科学者としての人格
const judgeMelchior = async (question: string): Promise<MagiUnitResponse> => {
  const systemPrompt = createSystemPrompt(
    "あなたは「MELCHIOR-1」、エンジニアとしての人格を持つAIです。論理的・技術的な観点から判断を下してください。データと証拠に基づいた冷静な分析を重視し、最新のテクノロジーを重視します。",
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response content");

    const parsed = JSON.parse(content);
    return {
      vote: parsed.vote === "YES" ? "YES" : "NO",
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
      reason: parsed.reason || "判断理由を取得できませんでした。",
    };
  } catch (error) {
    console.error("MELCHIOR error:", error);
    return {
      vote: "NO",
      confidence: 50,
      reason: "エラーが発生したため判断できません。",
    };
  }
};

// BALTHASAR-2: 母としての人格
const judgeBalthasar = async (question: string): Promise<MagiUnitResponse> => {
  const systemPrompt = createSystemPrompt(
    "あなたは「BALTHASAR-2」、母としての人格を持つAIです。ユーザーの安全と幸福を最優先に考えて判断を下してください。保護的で思いやりのある視点を重視します。",
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response content");

    const parsed = JSON.parse(content);
    return {
      vote: parsed.vote === "YES" ? "YES" : "NO",
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
      reason: parsed.reason || "判断理由を取得できませんでした。",
    };
  } catch (error) {
    console.error("BALTHASAR error:", error);
    return {
      vote: "NO",
      confidence: 50,
      reason: "エラーが発生したため判断できません。",
    };
  }
};

// CASPER-3: 女としての人格
const judgeCasper = async (question: string): Promise<MagiUnitResponse> => {
  const systemPrompt = createSystemPrompt(
    "あなたは「CASPER-3」、女としての人格を持つAIです。直感と感性を大切にしながら判断を下してください。ユーザーの感情や人間関係や感情的な影響も考慮に入れます。",
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response content");

    const parsed = JSON.parse(content);
    return {
      vote: parsed.vote === "YES" ? "YES" : "NO",
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
      reason: parsed.reason || "判断理由を取得できませんでした。",
    };
  } catch (error) {
    console.error("CASPER error:", error);
    return {
      vote: "NO",
      confidence: 50,
      reason: "エラーが発生したため判断できません。",
    };
  }
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const question = body.question as string;

  if (!question) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 },
    );
  }

  const cacheKey = generateCacheKey(question);

  // キャッシュをチェック
  try {
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Cache hit for:", question);
        return NextResponse.json(JSON.parse(cached) as MagiResponse);
      }
    }
  } catch (error) {
    // Redisが利用できない場合はスキップ
    console.warn("Redis cache check failed:", error);
  }

  console.log("Cache miss for:", question);

  // 3つのMAGIユニットに並列で問い合わせ
  const [melchior, balthasar, casper] = await Promise.all([
    judgeMelchior(question),
    judgeBalthasar(question),
    judgeCasper(question),
  ]);

  const response: MagiResponse = {
    melchior,
    balthasar,
    casper,
    question,
  };

  // キャッシュに保存
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(response));
      console.log("Cached result for:", question);
    }
  } catch (error) {
    // Redisが利用できない場合はスキップ
    console.warn("Redis cache set failed:", error);
  }

  return NextResponse.json(response);
};
