# MAGI SYSTEM

エヴァンゲリオンのMAGIシステムを模したAI意思決定システム。3つのAIユニット（MELCHIOR、BALTHASAR、CASPER）が質問に対して審議し、多数決で結論を出す。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **AI**: OpenAI API (gpt-4o-mini)
- **キャッシュ**: Redis (Upstash推奨)
- **スタイリング**: Tailwind CSS v4
- **アニメーション**: Motion (Framer Motion)
- **デプロイ**: Vercel

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `OPENAI_API_KEY` | ◯ | OpenAI APIキー |
| `REDIS_URL` | - | Redis接続URL (Upstash等) |

### 環境変数の設定方法

**ローカル開発時:**

```bash
cp .env.example .env.local
# .env.local を編集して値を設定
```

**Vercelデプロイ時:**

Vercelダッシュボードの Settings > Environment Variables から設定する。

## キャッシュについて

Redisを設定すると、同じ質問に対する回答が7日間キャッシュされる。

- キャッシュヒット時はAPIコールをスキップしてコスト削減
- `REDIS_URL`が未設定の場合はキャッシュなしで動作
- [Upstash](https://upstash.com/)を使うとVercelとの相性が良い

## ローカル開発

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun dev
```

http://localhost:3000 でアクセス。

## Vercelへのデプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定
3. デプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## ライセンス

MIT
