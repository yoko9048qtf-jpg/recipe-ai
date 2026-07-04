import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api へのリクエストを Express バックエンド(8787)へ転送する
// ポートは PORT 環境変数があればそれを使い（プレビューツールの自動割当に対応）、
// 無ければ手動起動用に 5173 をデフォルトとする。
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
