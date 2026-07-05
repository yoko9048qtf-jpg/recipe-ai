import { SERVICE_NAME } from "../constants";
import PolicyPage from "./PolicyPage";

interface Props {
  onBack: () => void;
}

export default function CopyrightPolicy({ onBack }: Props) {
  return (
    <PolicyPage title="著作権・引用ポリシー" lastUpdated="2026年7月5日" onBack={onBack}>
      <section>
        <h2>本サービスの著作権について</h2>
        <p>
          {SERVICE_NAME} 内の文章・デザイン等の著作権は、法令上他者に権利が帰属するものを除き、
          運営者に帰属します。
        </p>
      </section>

      <section>
        <h2>AI生成コンテンツについて</h2>
        <p>
          本サービスが表示するレシピには、AI（Claude API）による生成コンテンツが含まれます。
          あわせて、楽天レシピAPI等の外部サービスから取得した情報を参考情報として利用しています。
          元のレシピ等の著作権その他の権利は、それぞれの権利者（楽天レシピ等）に帰属します。
        </p>
      </section>

      <section>
        <h2>引用について</h2>
        <p>
          本サービスの内容は、著作権法の範囲内でご自由に引用いただけます。引用の際は、出典として
          「{SERVICE_NAME}」の名称を明記してください。
        </p>
      </section>

      <section>
        <h2>SNS等への掲載について</h2>
        <p>
          本サービスの画面のスクリーンショットをSNS等へ掲載いただくことは問題ありません。
          ただし、画像の改変や、実際の内容と異なる誤解を招くような利用はご遠慮ください。
        </p>
      </section>

      <section>
        <h2>禁止事項</h2>
        <p>次の行為は禁止します。</p>
        <ul>
          <li>本サービスの内容を無断で転載すること</li>
          <li>本サービスの内容を大量に複製すること</li>
          <li>本サービスと同一・類似のコピーサイトを作成すること</li>
          <li>スクレイピング等により機械的に情報を収集すること</li>
        </ul>
      </section>

      <section>
        <h2>外部サービスのデータについて</h2>
        <p>
          本サービスが表示するレシピ情報は、楽天レシピAPI（楽天グループ株式会社）から取得した情報の提供に
          基づいています。取得した情報を、本サービスでの表示目的以外で複製・転用・再配布することはできません。
        </p>
      </section>
    </PolicyPage>
  );
}
