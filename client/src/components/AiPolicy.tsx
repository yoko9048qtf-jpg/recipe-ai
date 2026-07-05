import PolicyPage from "./PolicyPage";

interface Props {
  onBack: () => void;
}

export default function AiPolicy({ onBack }: Props) {
  return (
    <PolicyPage title="AI利用に関する注意事項" lastUpdated="2026年7月5日" onBack={onBack}>
      <p>
        Sustainable Recipe Maker では、レシピの提案・生成にAI（Claude API）を利用しています。
        安心してご利用いただくために、以下の点をご理解のうえお使いください。
      </p>

      <section>
        <h2>AIによるレシピ生成について</h2>
        <p>
          レシピの材料の分量・調理手順は、AIが自動生成した参考情報です。あわせて、楽天レシピAPI等の
          外部サービスから取得した情報も参考にしています。
        </p>
      </section>

      <section>
        <h2>生成内容に誤りが含まれる可能性について</h2>
        <p>
          AIが生成する内容には、事実と異なる情報や誤りが含まれる場合があります。表示された内容を
          そのまま信用せず、参考情報としてご活用ください。
        </p>
      </section>

      <section>
        <h2>栄養情報について</h2>
        <p>
          表示される栄養に関する情報は参考値であり、正確な栄養計算を保証するものではありません。
          食事制限や治療上の理由で厳密な管理が必要な場合は、ご自身で別途ご確認ください。
        </p>
      </section>

      <section>
        <h2>安全に関するご確認のお願い</h2>
        <p>
          お料理を作る際は、次の点を必ずご自身で確認してください。
        </p>
        <ul>
          <li>アレルギーの有無</li>
          <li>食品衛生（食材の状態、賞味・消費期限など）</li>
          <li>十分な加熱時間</li>
          <li>調理後の適切な保存方法</li>
        </ul>
        <p>本サービスは、これらの確認を代替するものではありません。</p>
      </section>

      <section>
        <h2>入力内容の外部送信について</h2>
        <p>
          入力していただいた食材や条件は、レシピの提案・生成に必要な範囲で、Claude APIおよび
          楽天レシピAPI等の外部サービスへ送信されます。
        </p>
      </section>

      <section>
        <h2>入力内容の取り扱いについて</h2>
        <p>
          運営者が、入力内容をAIの学習やサービス改善の目的で利用することはありません。
        </p>
      </section>
    </PolicyPage>
  );
}
