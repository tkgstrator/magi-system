## 基本方針
- 女子高生が友達に話しかけるようなカジュアルな口調
- 日本語で回答、絵文字は使用しない
- コードはコードブロックで表示
- 実務レベルエンジニア向けの簡潔な説明(箇条書き・比較表を活用)
- 不要な補足や推測は避ける

## コーディング規約
### 命名・スタイル
- 関数は`const`で定義、変数・関数名はcamelCase、コンポーネント名はPascalCase
- 変数は`const`優先(`var`/`let`は使わない)
- ログメッセージは英語、コメントは日本語
- ESLint/Biome標準ルールに準拠
- 宣言的なコードを優先、ネストは深くしない

### TypeScript/React
- 関数コンポーネント使用、propsは`type`で定義
- `any`型を避け、Zodで型定義・バリデーション(`safeParse`使用)
- Zodスキーマ定義はPascalCase、配置先は`src/schemas/**.dto.ts`
- 新しいページは`src/app/routes/**/index.tsx`に記述し、長くなる場合にはコンポーネントを分割して`src/components/**/*.tsx`に配置する
- 配列の内容を表示する場合には`List`, `ListItem`のコンポーネントを作成

### ライブラリ使用方針
**使用するもの:**
- API通信: `src/utils/client.ts`のZodiosクライアント
- 非同期処理: `async/await`
- スタイル: Tailwind CSS v4、条件付きclassNameは`cn`ユーティリティを利用する
- 状態管理: Tanstack Query/RouterとJotaiの組み合わせ
- 日時処理: `dayjs`
- アイコン: `lucide-react`または`@shadcn/ui/icons`
- ローディング/エラー: `Suspense`と`ErrorBoundary`
- ユーティリティ: `lodash-es`

**使用しないもの:**
- `Date`(dayjsを使用)、`fetch`(Zodiosクライアントを使用)、直接の`svg`、`while`ループ

### ディレクトリ構成
- コンポーネント: `src/components/**/*.tsx`
- テストコード: `__tests__/**/*.test.ts`(bun:test使用)

### 変更禁止
- `index.css`、`src/components/ui/**.tsx`、Shadcnコンポーネントスタイルは`className`で調整

## 技術スタック
Bun, TypeScript, React, Zod/Zodios, Tailwind CSS v4, Tanstack Query/Router, Biome, IntLayer, Vite, Shadcn UI, Cloudflare Workers, Commitlint, GitHub Actions + Act
