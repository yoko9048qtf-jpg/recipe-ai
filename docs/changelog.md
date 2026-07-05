# changelog.md

このプロジェクトの変更履歴。[Keep a Changelog](https://keepachangelog.com/) 形式（Added/Changed/Fixed/Removed）で記録する。
バージョニングは [docs/version.md](./version.md) の方針（SemVer）に従う。

> v1.0.0〜v1.1.0 は履歴管理ルール導入前のコミットを遡って再構築した記録です（2026-07-05時点の `git log` を基に作成）。

## [Unreleased]

（次回以降の変更をここに追記）

## v1.4.3 - 2026-07-05 (`9bdc35c`)

### Added
- ホーム画面アイコン用に、既存のブランドロゴ（`icon.png`）から生成した各サイズのPNGを追加
  - `client/public/icons/icon-192.png`（192x192）
  - `client/public/icons/icon-512.png`（512x512）
  - `client/public/icons/apple-touch-icon.png`（180x180、iOSホーム画面追加用）
  - ロゴ自体が余白込みの角丸正方形デザインのため、追加の余白付与は行わずリサイズのみで生成

### Changed
- `manifest.webmanifest` の `icons` を、1254x1254のロゴ原本1枚参照から、上記の192/512サイズのPNG（any/maskable
  各2件、計4件）を参照する構成に変更
- `index.html` のfavicon（`<link rel="icon">`）とApple Touch Icon（`<link rel="apple-touch-icon">`）を、
  ロゴ原本直参照から `client/public/icons/` 配下の最適サイズ画像参照に変更。faviconは192/512の2サイズを
  併記し、ブラウザが表示コンテキストに応じて選択できるようにした
- ヘッダーのロゴ表示（`Header.tsx`が参照する`/assets/images/icon.png`）は変更なし（表示サイズが40x40と小さく、
  原本を直接参照する既存方式のままで問題ないため）

### Fixed
- なし

### Removed
- なし（旧アイコン画像・旧参照は元々存在せず、削除対象なし）

## v1.4.2 - 2026-07-05 (`865cea0`)

### Fixed
- お問い合わせフォームへの誘導ボタンの視認性を改善。緑背景+白文字（コントラスト不足）から、
  白背景+濃い緑文字+緑枠線（他の白背景ボタンと同様のトーン）に変更。ページ背景は変更なし

## v1.4.1 - 2026-07-05 (`502b0c1`)

### Fixed
- お問い合わせフォームの`GOOGLE_FORM_URL`をプレースホルダーから、実際に運用するGoogle FormsのURLに差し替え

## v1.4.0 - 2026-07-05 (`025e18b`, `712d8f4`)

### Added
- 静的ポリシーページ5種を追加し、Footerからすべての画面で遷移できるようにした
  - プライバシーポリシー（`/privacy`）
  - 利用規約（`/terms`）
  - AI利用に関する注意事項（`/ai-policy`）
  - 著作権・引用ポリシー（`/copyright`）
  - お問い合わせ（`/contact`）: Google Formsへの導線ボタン「お問い合わせフォームはこちら」を設置。
    メールアドレスは非表示。フォームURLは `client/src/constants.ts` の `GOOGLE_FORM_URL` で一元管理
- 上記5ページ共通のレイアウトコンポーネント `PolicyPage`（タイトル・最終更新日・本文）
- 全画面共通のFooterコンポーネント（ポリシーページへのリンク、楽天レシピ／Anthropic Claudeのクレジット表記）
- ライブラリを追加しない自前の軽量ルーティング（`window.history.pushState`/`popstate`）を導入し、
  `/privacy`等の実URLでの直接アクセス・リロード・ブラウザの戻る/進むに対応
- `vercel.json` にSPAフォールバックのrewriteを追加（本番で上記URLへの直接アクセスに対応するため）

### Changed
- 各画面の見出し階層を `h1`（画面の主見出し）→ `h2`→`h3`→`h4` の順に整理し、Lighthouseの
  heading-order監査に抵触しないよう修正（例: 一覧画面「おすすめレシピ」がh1、レシピカードのタイトルがh2）
- 前回のUI刷新時に生じていた未使用CSS（旧ヘッダー由来の `.app-header`/`.app-title-btn`/`.tagline`）を削除

### Fixed
- なし

### Removed
- なし

## v1.3.0 - 2026-07-05 (`fb7ab97`, `9325025`)

### Added
- トップページ用の新規UIコンポーネント `Header`（ロゴ＋「Sustainable Recipe Maker」ブランド表示、72px、
  クリックでホームに戻る機能）・`Hero`（背景写真＋オーバーレイ＋見出し「今日の夕飯、もう迷わない」）
- 食材ボタン（定番食材26種）に絵文字アイコンを追加
- ヒーロー・食材入力カードにFadeInアニメーション、入力欄にFocusリング、ボタンにHover効果を追加
- 画像アセット配置用ディレクトリ `client/public/assets/images/`（`hero.png`, `icon.png`）

### Changed
- 食材入力エリア（`IngredientInput`）全体を角丸20px・shadow付きの白カードにデザイン刷新
  （タイトル「冷蔵庫にある食材を入力してください」を追加。内部の入力ロジック・API呼び出しは無変更）
- 生成ボタンを緑背景・角丸16px・高さ56pxのデザインに変更
- ヘッダーロゴ・favicon・PWAアイコンを新アイコン画像に統一（旧`icon.svg`は削除）
- レシピ提案ロジック（食材一致率スコアリング・主菜優先・カテゴリ偏り補正・履歴除外・シャッフル）・API・
  データ構造・ルーティングは**無変更**（UIのみの変更）

### Fixed
- なし

### Removed
- `client/public/icon.svg`（新アイコン画像への差し替えに伴い削除）

## v1.2.0 - 2026-07-05 (`15b3997`, `0c3955a`)

### Added
- 直近表示したレシピIDを `localStorage`（キー: `recipeHistory`）に保存する機能。最大10件・新しい順・重複排除
  （`client/src/utils/recipeHistory.ts`）
- レシピ提案時に表示履歴を参照し、非履歴レシピを優先・不足時のみ履歴レシピで補充する除外ロジック
  （`server/app.js`）
- Fisher-Yates Shuffle ユーティリティ（`server/utils/shuffle.js`）。最終選定後の表示順のみをランダム化
- プロジェクト全体のドキュメント一式（`docs/architecture.md`, `requirements.md`, `directory.md`, `database.md`,
  `api.md`, `components.md`, `coding-rules.md`, `deployment.md`, `todo.md`）と `CLAUDE.md` を新規作成
- 履歴管理・バージョン管理の運用ルールを導入し、`docs/changelog.md`（本ファイル）・`docs/decision-log.md`・
  `docs/development-history.md`・`docs/version.md` を新設

### Changed
- `POST /api/recipes` のリクエストボディに任意フィールド `history`（直近表示レシピID配列）を追加
  （既存の `ingredients`/`cuisine` は変更なし。呼び出し回数・楽天APIカテゴリ数は増加していない）
- レシピ提案のカテゴリ偏り補正ロジックを「`RESULT_COUNT` で早期に打ち切る」実装から
  「ランク順を保ったまま候補全体を並べ替える」実装に変更し、その後段で履歴除外・シャッフルを行うよう処理順を
  `重複除去 → スコアリング → 主菜優先 → カテゴリ補正 → 履歴除外 → シャッフル → 上位N件` に整理
  （スコアリング・主菜優先・カテゴリ補正自体のロジックは変更していない）

### Fixed
- なし

### Removed
- なし

---

## v1.1.0 - 2026-07-04 (`3ff2547`)

### Added
- ヘッダーのアプリタイトルをクリックすると初期画面（食材入力）に戻れる機能

## v1.0.1 - 2026-07-04 (`0a1a4b1`)

### Fixed
- Vercel本番環境でレシピ詳細生成（`/api/recipe-detail`）が `Cannot convert argument to a ByteString` で
  失敗する不具合を修正。Node.jsサーバーレス関数環境でグローバルに定義されうる `EdgeRuntime` を
  `api/index.js` で明示的に無効化することで、`@anthropic-ai/sdk` の誤検知を回避
- （`de8d8d6` で一時的にデバッグ用スタックトレース出力を追加、`1a77fef` で削除。両者は調査目的の一時変更で
  機能への影響はないため、本バージョンの一部として扱う）

## v1.0.0 - 2026-07-04 (`df4420c`)

### Added
- 初回リリース: 食材入力（定番チェック/自由入力/写真認識）、ジャンル選択、人数指定、楽天レシピAPIによる
  レシピ提案（スコアリング・主菜優先・カテゴリ偏り補正）、AIによるレシピ詳細生成（材料・手順）、
  PDF表示・LINE共有、PWA対応
