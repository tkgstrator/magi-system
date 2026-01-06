import { type MagiUnitResponse, MagiUnitResponseSchema } from '@/schemas/magi.dto'
import { openai } from '@/utils/openai-client'

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
  - 自信があるときは積極的に高い値（80-100）を使ってください
  - 確信が強い場合は遠慮なく90以上の値を設定して構いません
  - 迷いや不確実性がある場合のみ低い値にしてください
- reasonは140文字以内で簡潔に
- 「人による」「場合による」「状況次第」などの曖昧な回答は禁止です
- あなたの人格・価値観に基づいて明確にYESかNOを判断してください
- 迷った場合でも、より妥当と思われる方を選んでください

拒否権システム:
- あなたが強い確信を持って否定する場合（confidence >= 90 かつ vote = "NO"）、拒否権が発動します
- 拒否権が発動すると、他の2つのMAGIユニットが承認していても、最終決定は「否決」となります
- 拒否権は重大な決定を防ぐための最後の砦です。慎重に使用してください
`

// MAGIユニットクラス
export class MagiUnit {
  constructor(
    private name: string,
    private persona: string,
    private model: string,
    private temperature: number
  ) {}

  async judge(question: string): Promise<MagiUnitResponse> {
    const systemPrompt = createSystemPrompt(this.persona)

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: this.model.includes('nano') ? 1.0 : this.temperature,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error('No response content')

      const parseResult = MagiUnitResponseSchema.safeParse(JSON.parse(content))

      if (!parseResult.success) {
        console.error(`${this.name} parse error:`, parseResult.error)
        throw new Error('Invalid response format')
      }

      return parseResult.data
    } catch (error) {
      console.error(`${this.name} error:`, error)
      return {
        vote: 'NO',
        confidence: 50,
        reason: 'エラーが発生したため判断できません。'
      }
    }
  }
}
