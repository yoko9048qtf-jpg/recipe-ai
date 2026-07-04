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
