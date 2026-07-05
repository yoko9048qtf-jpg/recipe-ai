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

---

### 2026-07-05 / v1.4.2

- **実施内容**: お問い合わせフォームへの誘導ボタンの視認性が低いというフィードバックを受け、
  緑背景+白文字から白背景+濃い緑文字+緑枠線へ変更（ページ背景は変更なし）
- **対象機能**: `client/src/index.css`（`.contact-form-btn`）
- **コミットメッセージ**: `fix: お問い合わせフォームボタンの視認性を改善`（`865cea0`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）

---

### 2026-07-05 / v1.4.3

- **実施内容**: ホーム画面アイコンを、トップページ左上で使用中のブランドロゴ画像（`icon.png`）を元にした
  正式なマルチサイズPWAアイコンに変更
  1. ロゴ原本（1254x1254、既に余白込みの角丸正方形デザイン）から192x192・512x512・180x180（Apple Touch Icon）
     のPNGを生成（一時的に`sharp`を作業ディレクトリ外にインストールして使用。プロジェクトの依存関係には追加せず）
  2. `manifest.webmanifest`の`icons`を、原本1枚参照から192/512サイズ参照（any/maskable各2件）に変更
  3. `index.html`のfavicon・Apple Touch Iconのリンクを、原本直参照から新規生成した最適サイズ画像への参照に変更
  4. ヘッダーのロゴ表示（40x40、`Header.tsx`）は変更なし。旧アイコン画像・旧参照は元々存在しなかったため削除対象なし
- **対象機能**: `client/public/icons/`（新規: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`）,
  `client/public/manifest.webmanifest`, `client/index.html`
- **コミットメッセージ**: `feat: ホーム画面アイコンをブランドロゴベースのマルチサイズPWAアイコンに変更`（`9bdc35c`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）

---

### 2026-07-05 / v1.5.0

- **実施内容**: 食品ロス削減コンセプトの導線として、特設ページ（`/food-loss`、現時点では未実装のため
  Coming Soon表示）へのリンクUIを3箇所に追加
  1. ヘッダー右上に常時表示の導線ボタン（🌱アイコン＋ラベル「食品ロスを減らそう」必須、`FoodLossIcon`として
     アイコンのみ差し替え可能にコンポーネント化）
  2. トップページ・ヒーロー直下のカード型バナー（写真背景想定。写真アセット未用意のため当面はCSSグラデーション
     で代替し、`BackgroundImage`の`image` propsで実写真に差し替え可能な構造にした）
  3. レシピ詳細ページ最下部のさらに控えめなカード型バナー（②と同じ`BackgroundImage`を再利用、
     高さ・余白・フォントサイズをさらに縮小）
  - UI文言はすべて`constants.ts`の`FOOD_LOSS_*`に集約し、遷移先（`handleFoodLossClick`）も1箇所に統一。
    将来、外部の特集ページ等に差し替える際は定数とこの関数のみ変更すればよい設計
  - 配色は新規デザイントークン`--food-loss-green`（#22c55e）で統一し、アプリ本体の`--accent`とは分離
  - **レビュー指摘を受けた修正（同日中に反映）**: (a) ヘッダーボタンのラベルが640px以下でCSSにより
    非表示になっていた問題を修正し、`icon`/`label`を`FoodLossButton`の必須propsに変更。
    (b) UIレイヤー構造「Hero(最重要) ＞ FoodLossBanner(第2導線) ＞ RecipeFooterBanner(第3・最も控えめ)」を
    明確化するため、`FoodLossBanner`をHeroと同じ全幅・edge-to-edge配置から`.app`内（max-width 720px）の
    角丸カード配置に変更し、min-height撤廃・padding/フォントサイズ縮小・オーバーレイをrgba(0,0,0,0.4)の
    フラットな暗さに変更。`RecipeFooterBanner`もさらに一段階小さいカードに調整（詳細:
    [decision-log.md](./decision-log.md) 参照）
- **対象機能**:
  - 新規: `client/src/components/{FoodLossIcon,FoodLossButton,BackgroundImage,FoodLossBanner,
    RecipeFooterBanner,FoodLossPage}.tsx`
  - `client/src/constants.ts`（`FOOD_LOSS_*`定数群）, `types.ts`（`SpecialView`追加）
  - `client/src/App.tsx`（ルーティング・`handleFoodLossClick`追加、`FoodLossBanner`の配置変更）,
    `Header.tsx`/`RecipeDetail.tsx`（props追加・バナー組み込み）, `index.css`
- **コミットメッセージ**: `feat: 食品ロス特設ページへの導線UIを3箇所に追加`（`56a5609`）
- **ステータス**: 完了（コミット・push・本番デプロイ済み）
