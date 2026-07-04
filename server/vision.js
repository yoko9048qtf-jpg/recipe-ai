import Anthropic from "@anthropic-ai/sdk";

// API キー未設定でもサーバー起動は可能にし、実際に呼ばれた時だけ初期化する
let _client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY が設定されていません（server/.env を確認してください）");
  }
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * 写真（data URL）から写っている食材を日本語で抽出する。
 * @param {string} dataUrl "data:image/jpeg;base64,...."
 * @returns {Promise<string[]>} 日本語の食材名
 */
export async function detectIngredients(dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/s.exec(dataUrl || "");
  if (!match) {
    throw new Error("画像データの形式が不正です（data URL を渡してください）");
  }
  const mediaType = match[1];
  const base64 = match[2];

  const res = await getClient().messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1000,
    system:
      "あなたは料理アシスタントです。写真に写っている食材・食品を、日本語の一般的な名称で列挙してください。明確に判別できるものだけを含め、推測で曖昧なものは含めないこと。容器や調理器具は含めないこと。",
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            ingredients: { type: "array", items: { type: "string" } },
          },
          required: ["ingredients"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: "この写真に写っている食材を抽出してください。" },
        ],
      },
    ],
  });

  const block = res.content.find((b) => b.type === "text");
  try {
    return JSON.parse(block.text).ingredients ?? [];
  } catch {
    return [];
  }
}
