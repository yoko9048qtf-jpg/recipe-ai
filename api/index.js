// 既知の不具合の回避策: Vercel の Node.js サーバーレス関数環境では、
// グローバルに `EdgeRuntime` という変数が定義されていることがある。
// @anthropic-ai/sdk はプラットフォーム検知時にこれを見つけると、
// 値を検証せずそのまま `X-Stainless-Arch: other:${EdgeRuntime}` という
// HTTPヘッダーに埋め込む（node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs）。
// この値に非Latin1文字（例: 全角記号等）が含まれていると、
// 「Cannot convert argument to a ByteString」という500エラーで
// レシピ詳細生成（/api/recipe-detail）が失敗する。
// このアプリは Edge Runtime を使わない通常の Node.js 関数なので、
// SDKが誤検知しないよう、リクエスト処理が始まる前に無効化しておく。
if (typeof globalThis.EdgeRuntime !== "undefined") {
  delete globalThis.EdgeRuntime;
}

import app from "../server/app.js";

// Vercel サーバーレス関数のエントリポイント。
// Express アプリはそのまま (req, res) => {} として呼び出せるため、
// デフォルトエクスポートするだけで Vercel の Node.js ランタイムが直接呼び出せる。
// （`app.listen()` は呼ばない — Vercel がリクエストごとにこの関数を実行する）
//
// 注: ここでは dotenv を読み込まない。本番の Vercel 環境変数は
// プラットフォームが直接 process.env に注入するため不要で、
// ローカルの `vercel dev` もプロジェクトルートの .env を自動で読み込む。
// （dotenv は server/ 配下にのみインストールされており、api/ からは
//   直接 import できないため、そもそも解決できない点にも注意）
//
// vercel.json の rewrites により /api/* へのリクエストは全てこの関数に転送され、
// 元のパス（例: /api/recipes）は req.url にそのまま残るため、
// server/app.js 側のルート定義（app.post("/api/recipes", ...) 等）は変更不要。
export default app;
