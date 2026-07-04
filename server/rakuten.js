import https from "node:https";

// 楽天レシピAPI（新仕様）。openapi.rakuten.co.jp。
// 認証: applicationId(UUID) + accessKey(pk_) をクエリで渡し、
// さらに Referer / Origin ヘッダーがアプリの許可ドメインと一致している必要がある。
// （Node の fetch は Referer を禁止ヘッダーとして除去するため node:https を使う）
const HOST = "openapi.rakuten.co.jp";

function cfg() {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const referer = process.env.RAKUTEN_REFERER || "http://example.com/";
  if (!appId || !accessKey) {
    throw new Error(
      "RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が設定されていません（server/.env を確認してください）"
    );
  }
  let origin;
  try {
    origin = new URL(referer).origin;
  } catch {
    origin = "http://example.com";
  }
  return { appId, accessKey, referer, origin };
}

function rakutenGet(path) {
  const { referer, origin } = cfg();
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: HOST,
        path,
        headers: { Referer: referer, Origin: origin, Accept: "application/json" },
        timeout: 20000,
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(d);
          } catch {
            /* noop */
          }
          if (res.statusCode === 200 && json) {
            resolve(json);
          } else {
            const msg =
              json?.errors?.errorMessage ||
              json?.error_description ||
              `HTTP ${res.statusCode}`;
            reject(new Error(`楽天API エラー (${res.statusCode}): ${msg}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("楽天APIタイムアウト")));
  });
}

function authQuery(extra) {
  const { appId, accessKey } = cfg();
  const p = new URLSearchParams({
    applicationId: appId,
    accessKey,
    formatVersion: "2",
    ...extra,
  });
  return p.toString();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- カテゴリ一覧（プロセス内キャッシュ。ほぼ変化しない） ---
let _catCache = null;
export async function getCategories() {
  if (_catCache) return _catCache;
  const data = await rakutenGet(
    `/recipems/api/Recipe/CategoryList/20170426?${authQuery({ categoryType: "large" })}`
  );
  _catCache = data.result?.large || [];
  return _catCache;
}

// --- カテゴリ別ランキング（カテゴリ単位で1時間キャッシュ） ---
const _rankCache = new Map(); // categoryId -> { at, recipes }
const RANK_TTL = 60 * 60 * 1000;

export async function getRanking(categoryId) {
  const hit = _rankCache.get(categoryId);
  if (hit && Date.now() - hit.at < RANK_TTL) return hit.recipes;

  const data = await rakutenGet(
    `/recipems/api/Recipe/CategoryRanking/20170426?${authQuery({ categoryId })}`
  );
  const recipes = data.result || [];
  _rankCache.set(categoryId, { at: Date.now(), recipes });
  return recipes;
}

/**
 * 複数カテゴリのランキングを順次取得して結合する。
 * レート制限を避けるため少し間隔を空け、失敗カテゴリはスキップする。
 */
export async function getRankings(categoryIds) {
  const all = [];
  let ok = 0;
  let lastErr = null;
  for (let i = 0; i < categoryIds.length; i++) {
    try {
      const recipes = await getRanking(categoryIds[i]);
      // 取得元カテゴリを付与（バリエーション制御に使う）。キャッシュ元は汚さないようコピー。
      for (const r of recipes) all.push({ ...r, _cat: categoryIds[i] });
      ok++;
    } catch (err) {
      lastErr = err;
      console.warn(`[rakuten] category ${categoryIds[i]} 取得失敗: ${err.message}`);
    }
    if (i < categoryIds.length - 1) await sleep(400);
  }
  // 全カテゴリで失敗した場合は、原因（キー未設定・認証エラー等）を呼び出し元へ伝播する
  if (ok === 0 && lastErr) throw lastErr;
  return all;
}
