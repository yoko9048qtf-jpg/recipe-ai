# development-history.md

タスク単位の開発履歴。[changelog.md](./changelog.md)がユーザー向けの変更内容であるのに対し、
本ファイルは「いつ・何を・どのコミットで」実施したかの作業記録として管理する。

> `v1.1.0` 以前は履歴管理ルール導入前のコミットを遡って再構築した記録です。

---

### 2026-07-04 / v1.0.0

- **実施内容**: プロジェクト初回実装一式（食材入力・楽天レシピAPI連携・AIレシピ詳細生成・PDF/LINE共有・PWA対応）
- **対象機能**: アプリ全体
- **コミットメッセージ**: `Initial commit: AI×レシピメーカー`
- **コミット**: `df4420c`
- **ステータス**: 完了

### 2026-07-04 / v1.0.1

- **実施内容**: Vercel本番環境でのByteStringエラー調査・修正。原因特定のため一時的にデバッグログを追加し、
  特定後に削除
- **対象機能**: `/api/recipe-detail`（レシピ詳細生成）
- **コミットメッセージ**:
  - `Fix: レシピ詳細生成が本番環境でByteStringエラーになる不具合を修正`（`0a1a4b1`）
  - `temp debug: recipe-detailのエラーにスタックトレースを一時的に含める`（`de8d8d6`）
  - `Revert: 一時デバッグ用のスタックトレース出力を削除`（`1a77fef`）
- **ステータス**: 完了

### 2026-07-04 / v1.1.0

- **実施内容**: ヘッダーのアプリタイトルをクリックすると初期画面に戻れるようにするUI改善
- **対象機能**: `client/src/App.tsx`（画面遷移）
- **コミットメッセージ**: `ヘッダーのタイトルをクリックすると初期画面に戻れるようにする`
- **コミット**: `3ff2547`
- **ステータス**: 完了

---

### 2026-07-05 / v1.2.0

- **実施内容**:
  1. 直近表示レシピの履歴除外＋Fisher-Yates Shuffleによるレシピ提案の多様化を実装
     （① 要件確認 → ② 影響範囲整理 → ③ 実装 → ④ ブラウザでの動作確認 の順で実施。テスト・型チェック実施済み）
  2. `/clear` により失われたプロジェクトコンテキストをコードベースから再構築し、`docs/` 一式・`CLAUDE.md` を新規作成
  3. Git・ドキュメント・バージョン管理の運用ルールを導入し、本ファイルを含む履歴管理基盤（changelog / decision-log /
     development-history / version）を新設
- **対象機能**:
  - レシピ提案API（`server/app.js`）、履歴管理（`client/src/utils/recipeHistory.ts`）、
    シャッフル（`server/utils/shuffle.js`）
  - プロジェクトドキュメント全般（`docs/`, `CLAUDE.md`）
- **コミットメッセージ**:
  - `feat: 直近表示履歴の除外とFisher-Yatesシャッフルでレシピ提案の多様性を改善`（`15b3997`）
  - `docs: プロジェクトドキュメント一式と履歴管理基盤を整備`（`0c3955a`）
- **ステータス**: 完了（コミット・push・本番反映済み）

---

### 2026-07-05 / v1.3.0

- **実施内容**:
  1. トップページのUIをモダンな「料理サービス」風デザインに刷新
     （① 要件確認 → ② 現状構造の確認・実装計画提示 → ③ 実装 → ④ 型チェック・ビルド確認 → ⑤ ローカル
     プレビューでの動作確認 の順で実施。既存のレシピ提案ロジック・API・データ構造・ルーティングは無変更）
  2. ヘッダー（ロゴ＋ブランド名）・ヒーロー（背景写真＋見出し）を新設し、食材入力エリアをカード化、
     食材ボタンにアイコンを追加
  3. ユーザー提供の写真・アイコン画像に順次差し替え（ヒーロー背景、ヘッダーロゴ／favicon／PWAアイコン）
  4. ユーザーフィードバックに基づきヒーローのオーバーレイ濃度を調整（左のテキスト可読性を保ちつつ、
     右側の料理写真がはっきり見えるようグラデーションを修正）
- **対象機能**:
  - `client/src/components/Header.tsx`（新規）, `Hero.tsx`（新規）
  - `client/src/App.tsx`, `IngredientInput.tsx`, `CommonIngredients.tsx`, `index.css`
  - `client/index.html`, `client/public/manifest.webmanifest`（アイコン参照）
  - `client/public/assets/images/hero.png`, `icon.png`（新規画像アセット）
- **コミットメッセージ**:
  - `feat: トップページのUIをモダンな料理サービス風デザインに刷新`（`fb7ab97`）
  - `docs: UI刷新に伴うドキュメント更新`（`9325025`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）

---

### 2026-07-05 / v1.4.0

- **実施内容**:
  1. Web公開に向け、プライバシーポリシー・利用規約・AI利用に関する注意事項・著作権/引用ポリシー・
     お問い合わせの5ページを追加し、Footerから全画面で遷移できるようにした
     （① 要件確認 → ② 影響範囲整理（ルーティング手段の検討） → ③ 外部サービス（Claude API・楽天レシピAPI）
     の利用規約・ブランドガイドラインを調査 → ④ 実装 → ⑤ 見出し階層のアクセシビリティ確認・修正 →
     ⑥ 型チェック・ビルド・ローカルプレビューでの動作確認 の順で実施）
  2. ライブラリを追加しない自前の軽量ルーティング（`pushState`/`popstate`）を新規導入し、
     `vercel.json` にSPAフォールバックのrewriteを追加
  3. 各画面の見出し階層（h1〜h4）をLighthouseのheading-order監査に適合するよう全面的に整理し、
     UI刷新（v1.3.0）時に生じていた未使用CSSも削除
- **対象機能**:
  - `client/src/components/{Footer,PolicyPage,PrivacyPolicy,TermsOfService,AiPolicy,CopyrightPolicy,
    ContactPage}.tsx`（新規）
  - `client/src/constants.ts`（新規）、`types.ts`（`PolicyView`追加）
  - `client/src/App.tsx`（ルーティング導入）、`Hero.tsx`/`IngredientInput.tsx`/`CommonIngredients.tsx`/
    `RecipeList.tsx`/`RecipeDetail.tsx`（見出し階層の整理）、`index.css`
  - `vercel.json`（SPAフォールバック追加）
- **コミットメッセージ**:
  - `feat: プライバシーポリシー等5ページを追加しFooterから遷移できるようにする`（`025e18b`）
  - `docs: ポリシーページ追加に伴うドキュメント更新`（`712d8f4`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）

---

### 2026-07-05 / v1.4.1

- **実施内容**: お問い合わせフォームの`GOOGLE_FORM_URL`を、ユーザーから提供された実際のGoogle Forms
  URLに差し替え（プレースホルダーからの置き換え）
- **対象機能**: `client/src/constants.ts`
- **コミットメッセージ**: `fix: お問い合わせフォームのGoogle Forms URLを本番用に差し替え`（`502b0c1`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）
