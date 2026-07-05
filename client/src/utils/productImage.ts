// 商品画像の有無判定と、未取得時のプレースホルダー文言をここに集約する。
// ProductCard/ProductModal はこのファイルの関数・定数のみを利用し、
// 画像URLの妥当性チェックを各コンポーネントに直接書かないようにする。

export const PRODUCT_IMAGE_PLACEHOLDER_TEXT = "画像準備中";

/** 商品画像URLが表示可能な値かどうか（未取得・空文字はプレースホルダー表示にする） */
export function hasProductImage(imageUrl: string | undefined): imageUrl is string {
  return typeof imageUrl === "string" && imageUrl.length > 0;
}
