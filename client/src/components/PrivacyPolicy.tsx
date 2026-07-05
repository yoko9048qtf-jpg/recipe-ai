import PolicyPage from "./PolicyPage";

interface Props {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <PolicyPage title="プライバシーポリシー" lastUpdated="2026年7月5日" onBack={onBack}>
      <p>
        Sustainable Recipe Maker（以下「本サービス」）は、利用者に安心してご利用いただくため、
        取得する情報とその取り扱いについて、このページで説明します。
      </p>

      <section>
        <h2>取得する情報</h2>
        <p>本サービスでは、以下の情報を取得します。</p>
        <ul>
          <li>アクセスログ（閲覧日時、閲覧ページ、ブラウザの種類など）</li>
          <li>Cookie等の識別情報（アクセス解析のために発行される識別子）</li>
          <li>お問い合わせフォームにご入力いただいた情報</li>
        </ul>
      </section>

      <section>
        <h2>利用目的</h2>
        <p>取得した情報は、以下の目的の範囲内で利用します。</p>
        <ul>
          <li>サービスの改善</li>
          <li>利用状況の分析</li>
          <li>不具合の調査</li>
          <li>お問い合わせへの対応</li>
        </ul>
      </section>

      <section>
        <h2>アクセス解析ツールについて</h2>
        <p>
          本サービスは、アクセス状況を把握するために Google Analytics を利用しています。
          Google Analytics はCookie等を利用してデータを収集しますが、個人を特定する情報は含まれません。
          収集されたデータはGoogle社のプライバシーポリシーに基づいて管理されます。
        </p>
      </section>

      <section>
        <h2>外部サービスの利用について</h2>
        <p>
          本サービスは、レシピの提案・生成のために以下の外部サービスを利用しています。
        </p>
        <ul>
          <li>Claude API（Anthropic社）: 写真からの食材認識、レシピ詳細の生成</li>
          <li>楽天レシピAPI（楽天グループ株式会社）: レシピ情報の取得</li>
        </ul>
        <p>
          入力いただいた食材や条件は、レシピを提案・生成するために必要な範囲で、これらの外部サービスへ
          送信されます。<strong>運営者が、送信された入力内容をサービス改善やAIの学習目的で利用することはありません。</strong>
        </p>
      </section>

      <section>
        <h2>第三者提供について</h2>
        <p>
          取得した情報は、法令に基づく場合を除き、本人の同意なく第三者へ提供することはありません。
        </p>
      </section>

      <section>
        <h2>プライバシーポリシーの改定</h2>
        <p>
          本ポリシーの内容は、法令の変更やサービス内容の変更に応じて改定することがあります。
          改定した場合は、本ページの内容を更新することで通知します。
        </p>
      </section>

      <section>
        <h2>お問い合わせ</h2>
        <p>
          本ポリシーに関するご質問は、<a href="/contact">お問い合わせページ</a>よりご連絡ください。
        </p>
      </section>
    </PolicyPage>
  );
}
