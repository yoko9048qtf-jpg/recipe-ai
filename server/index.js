import "dotenv/config";
import app from "./app.js";

// ローカル開発専用のエントリポイント。
// Express アプリ本体（ルート定義など）は app.js にあり、
// Vercel サーバーレス関数(api/index.js)からも同じ app.js を再利用する。

// API は固定で 8787 を使う（client/vite.config.ts のプロキシ先と一致させる）。
// 注: 開発ツールが注入する PORT 変数を拾わないよう、専用の API_PORT を使う。
const PORT = process.env.API_PORT || 8787;

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} で起動しました`);
});
