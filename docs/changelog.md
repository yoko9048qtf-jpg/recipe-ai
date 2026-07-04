# changelog.md

このプロジェクトの変更履歴。[Keep a Changelog](https://keepachangelog.com/) 形式（Added/Changed/Fixed/Removed）で記録する。
バージョニングは [docs/version.md](./version.md) の方針（SemVer）に従う。

> v1.0.0〜v1.1.0 は履歴管理ルール導入前のコミットを遡って再構築した記録です（2026-07-05時点の `git log` を基に作成）。

## [Unreleased]

（次回以降の変更をここに追記）

## v1.3.0 - 2026-07-05（予定・承認待ち）

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
