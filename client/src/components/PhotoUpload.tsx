import { useState } from "react";
import { detectIngredients } from "../api";

interface Props {
  onDetected: (ingredients: string[]) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ onDetected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [lastDetected, setLastDetected] = useState<string[]>([]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    setLastDetected([]);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      const ingredients = await detectIngredients(dataUrl);
      setLastDetected(ingredients);
      onDetected(ingredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析に失敗しました");
    } finally {
      setLoading(false);
      // 同じファイルを連続で選べるようにリセット
      e.target.value = "";
    }
  }

  return (
    <div className="photo-upload">
      <label className="upload-btn">
        📷 写真から食材を読み取る
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={loading}
          hidden
        />
      </label>

      {loading && <p className="hint">画像を解析しています…</p>}
      {error && <p className="error-text">{error}</p>}

      {preview && (
        <div className="photo-preview">
          <img src={preview} alt="アップロードした写真" />
        </div>
      )}

      {lastDetected.length > 0 && (
        <p className="hint">
          抽出した食材: {lastDetected.join("、")}（下のリストに追加しました）
        </p>
      )}
    </div>
  );
}
