import Anthropic from "@anthropic-ai/sdk";

// API キー未設定でもサーバー起動は可能にし、呼ばれた時だけ初期化する
let _client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY が設定されていません（server/.env を確認してください）");
  }
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * レシピ名・参考材料・人数から、その人数分の「材料（具体的な分量・単位つき）」と
 * 「調理手順」を生成する。楽天レシピAPIは人数・構造化分量を返さないため、AIで作成する。
 *
 * @param {string} title レシピ名
 * @param {string[]} materials 参考材料（楽天レシピの原文）
 * @param {number} servings 人数（必須）
 * @returns {Promise<{ ingredients: {name:string, amount:string}[], steps: string[] }>}
 */
export async function generateRecipeDetail(title, materials, servings) {
  const res = await getClient().messages.create({
    model: process.env.STEPS_MODEL || "claude-opus-4-8",
    max_tokens: 2000,
    system:
      "あなたは家庭料理のレシピアシスタントです。指定された料理名・参考材料・人数から、" +
      "その人数分の材料リストと調理手順を作成してください。" +
      "材料の分量は必ず指定された人数分にし、g・ml・個・本・大さじ・小さじ などの具体的な単位で記載してください。" +
      "各手順は簡潔で分かりやすい日本語の文にし、調理の順序どおりに並べてください。" +
      "参考材料を尊重しつつ、一般的・標準的な家庭の作り方で構いません。",
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  amount: { type: "string", description: "分量（例: 300g, 大さじ2, 1個）" },
                },
                required: ["name", "amount"],
                additionalProperties: false,
              },
            },
            steps: { type: "array", items: { type: "string" } },
          },
          required: ["ingredients", "steps"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content:
          `料理名: ${title}\n` +
          `参考材料: ${(materials || []).join("、")}\n` +
          `人数: ${servings}人分\n\n` +
          `この料理を${servings}人分作るための材料（具体的な分量・単位つき）と、調理手順をステップごとに作成してください。`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "text");
  try {
    const data = JSON.parse(block.text);
    return {
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      steps: Array.isArray(data.steps) ? data.steps : [],
    };
  } catch {
    return { ingredients: [], steps: [] };
  }
}
