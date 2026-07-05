# coding-rules.md

> 明文化されたスタイルガイド（ESLint/Prettier設定等）は現状**存在しない**。以下は既存コードから読み取れる
> 暗黙の規約であり、今後の実装もこれに揃えることを推奨する。「（推測）」がない項目は既存コード全体で
> 一貫して観測できたパターン。

## 1. 言語・型付けの使い分け

- **フロントエンド（`client/`）**: TypeScript + `strict: true`、`noUnusedLocals`/`noUnusedParameters` 有効。
  型エラーを出さないことが必須条件（過去の依頼でも明示的に要求されている）
- **バックエンド（`server/`, `api/`）**: 素のESM JavaScript（`.js`、`"type": "module"`）。TypeScriptビルドは
  行わず、代わりに JSDoc コメント（`@param`, `@returns`）で関数シグネチャを補足するスタイル
  （例: [server/rakuten.js](../server/rakuten.js), [server/steps.js](../server/steps.js)）
- ESLintは client/server いずれにも設定ファイルが存在しない。Prettier/EditorConfigも同様。
  型チェックは `tsc -b`（client の `npm run build` に含まれる）のみが実質的な静的検証手段

## 2. 命名規則

- ファイル名: Reactコンポーネントは `PascalCase.tsx`、それ以外（ユーティリティ・設定）は `camelCase.ts(x)`/`lowercase.js`
- 関数名: `camelCase`。真偽値を返す判定関数は `isXxx`/`looksXxx`（例: `isPantryJa`, `looksMain`, `isSectionHeader`）
- 定数: 全体設定値は `UPPER_SNAKE_CASE`（例: `RESULT_COUNT`, `GENRE_BONUS`, `PANTRY_EXACT`, `HISTORY_LIMIT`）
- Reactの内部stateやprops: `camelCase`。boolean stateは `loading`/`error`のような名詞、あるいは`peopleValid`のような形容詞的名前
- 日本語コメントで「なぜそうしているか（WHY）」を書く文化が徹底されている（下記5項目参照）

## 3. TypeScriptルール（client）

- `interface` でProps・データ型を定義（`type` はUnion型やRecordの別名定義に限定して使用。例: `Cuisine`）
- APIレスポンス型（`Recipe`, `RecipesResponse`, `RecipeDetailData` 等）は `client/src/types.ts` に集約
- コンポーネントのProps型はコンポーネントファイル内に直接定義（別ファイルへの切り出しはしない）
- `any` の使用は原則禁止。やむを得ない箇所（動的importの戻り値型付け等）は
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any` を明示コメント付きで最小範囲に限定
  （[RecipeDetail.tsx](../client/src/components/RecipeDetail.tsx)）

## 4. ディレクトリルール

- `client/src/components/` にUIコンポーネント、`client/src/utils/` にDOM/ブラウザAPIに依存する
  ロジック（localStorage操作等）を切り出す
- `server/utils/` にはExpressルートから独立して再利用可能な純粋関数（例: Fisher-Yates Shuffle）を配置する
- 差し替え可能な画像アセット（ヒーロー背景・ロゴ等）は `client/public/assets/images/` に配置し、
  コンポーネントからは固定パス（例: `/assets/images/hero.png`）で参照する。ファイルを差し替えるだけで
  見た目を更新できるようにする（[Header.tsx](../client/src/components/Header.tsx),
  [Hero.tsx](../client/src/components/Hero.tsx)）
- APIエンドポイント定義（ルーティング）は `server/app.js` に集約し、外部サービス連携（楽天API・Claude）は
  個別ファイル（`rakuten.js`, `vision.js`, `steps.js`）に分離する。ルート定義側は「呼び出し・整形・エラー処理」に徹し、
  外部通信の詳細（リトライ、ヘッダー、キャッシュ等）は各連携ファイル内に閉じる

## 5. Hooks利用方針

- 標準の `useState`/`useEffect`/`useMemo`/`useRef` のみを使用。カスタムHooksは現状存在しない
  （ロジックの再利用は「素のユーティリティ関数 + コンポーネント内state」で行う方針と読み取れる）
- `useEffect` 内非同期処理は必ず「マウント中フラグ（`active`）」でレース条件・アンマウント後のstate更新を防止する
  （[RecipeDetail.tsx](../client/src/components/RecipeDetail.tsx) 参照。今後の非同期Effectもこのパターンに揃えること）

## 6. Server Component / Client Componentの使い分け

該当なし。Next.js等のサーバーコンポーネント機構は使用しておらず、Vite製のクライアントサイドSPA + 独立した
Express/サーバーレスAPIという明確な分離構成（[architecture.md](./architecture.md) 参照）。

## 7. エラーハンドリング

- **サーバー側**: 各ルートは `try/catch` で全体を囲み、`errorMessage(err)` ヘルパーで日本語メッセージに変換して
  `500` で返す。入力不備は個別に `400` + 具体的な日本語メッセージ（例:「食材を1つ以上指定してください。」）
- 楽天APIキー・認証系のエラーは正規表現でメッセージを判定し、「環境変数のキーと許可ドメイン設定を確認してください」
  という運用者向けの案内文に変換する（`errorMessage()`）
- 補完的なデータ取得（supplementカテゴリ等）の失敗は握りつぶして `console.warn` に留め、メイン処理は継続する。
  一方、主たる取得（primaryカテゴリ全滅時など）は例外を上位に伝播させ、確実にエラーレスポンスを返す
- **クライアント側**: `api.ts` の `handle<T>()` がレスポンス失敗時にサーバーの `error` フィールドを
  `Error.message` として投げ、各コンポーネントは `err instanceof Error ? err.message : "..."` の形で
  ユーザー向け日本語メッセージへフォールバックする（型ガードを必ず通す）

## 8. バリデーション

- 入力チェックは境界（APIエンドポイントの入口）でのみ行う。例: `Array.isArray()` チェック、人数の整数・範囲チェック
- 「未入力ではAI生成しない」という業務ルールをサーバー側でも二重にチェックする（クライアントのdisabled制御を
  過信せず、サーバー側でも400を返す）
- フロントエンドの送信ボタンは、業務ルールを満たさない間 `disabled` にしてユーザーに即座にフィードバックする
  （人数バリデーション、食材0件時など）

## 9. UI設計方針

- モバイル最優先のレイアウト（`.app { max-width: 720px; margin: 0 auto }`、PWA対応、`safe-area-inset` 考慮）
- スタイリングはプレーンCSS + CSS変数によるテーマ管理（`:root` に `--bg`, `--accent` 等）。CSS-in-JSや
  Tailwind等のユーティリティCSSフレームワークは未使用
- 日本語UI文言に絵文字を添える一貫したトーン（見出しの①②③、🍳🍚🍴等）
- 買い物リスト・不足材料は常に「🛒」、達成済みは「✓」等、視覚記号を意味づけて使う

## 10. コメントの書き方の慣習

- 「何をしているか」よりも「なぜそうしているか」を日本語コメントで残す文化が徹底している
  （例: `api/index.js` の EdgeRuntime 回避策、`rakuten.js` の Referer ヘッダー除去回避策）
- 既知の制約・注意点はコード内コメントとREADMEの両方に記載する傾向がある

## 11. テストについて

- 現時点でテストコード・テスト基盤（Jest/Vitest等）は存在しない。品質担保は型チェック（`tsc -b`）と
  手動でのブラウザ動作確認に依存している（[todo.md](./todo.md) の技術的負債として記録）

## 12. 見出し階層（h1〜h4）の規約

- 各「画面」（`view`）につき、その画面のメインタイトルを`h1`とし、以降は`h2`→`h3`→`h4`の順で
  1段ずつ深くする（レベルを飛ばさない）。Lighthouseの `heading-order` 監査に抵触しないための規約
- 例: 入力画面は `Hero` の見出し（h1）→ `IngredientInput` のカードタイトル（h2）→ ①〜⑤の各セクション
  （h3）→ `CommonIngredients` のカテゴリ見出し（h4）
- 一覧・詳細・ポリシーページのように `Hero` を伴わない画面では、その画面自身の主見出しが `h1` になる
  （`RecipeList`/`RecipeDetailView`/`PolicyPage` 参照）
- 見出しタグの変更で見た目のサイズが変わらないよう、CSSでは可能な限りクラスセレクタ（`.panel h3`等）で
  明示的に `font-size` を指定し、ブラウザのデフォルトサイズに依存しない

## 13. ルーティングの規約

- ルーティングライブラリ（React Router等）は追加せず、`window.history.pushState`/`popstate` を使った
  自前の軽量ルーターで完結させる（[architecture.md](./architecture.md) 6節参照）
- URLを持つのは静的なポリシーページ（`/privacy`等）のみ。動的な画面遷移（一覧・詳細）はURLを変えない
- 画面遷移用のリンクは実際の `<a href>` を用い、クリックイベントで通常クリックのみ `preventDefault` して
  SPA内遷移に差し替える（中クリック・Ctrl+クリック等の標準操作を壊さないため）
