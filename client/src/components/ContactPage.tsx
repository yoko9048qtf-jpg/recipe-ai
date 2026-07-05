import { GOOGLE_FORM_URL } from "../constants";
import PolicyPage from "./PolicyPage";

interface Props {
  onBack: () => void;
}

export default function ContactPage({ onBack }: Props) {
  return (
    <PolicyPage title="お問い合わせ" lastUpdated="2026年7月5日" onBack={onBack}>
      <section>
        <h2>お問い合わせ内容</h2>
        <p>以下のようなお問い合わせを受け付けています。</p>
        <ul>
          <li>サービスへのご意見・ご要望</li>
          <li>不具合のご報告</li>
          <li>著作権に関するお問い合わせ</li>
          <li>その他のお問い合わせ</li>
        </ul>
      </section>

      <section>
        <h2>お問い合わせフォーム</h2>
        <p>お問い合わせは、以下のフォームより承っております。</p>
        <a
          className="contact-form-btn"
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noreferrer"
        >
          お問い合わせフォームはこちら
        </a>
      </section>

      <section>
        <h2>ご注意事項</h2>
        <p>
          お問い合わせへの返信には、お時間をいただく場合があります。また、内容によってはお答えできない
          場合がありますので、あらかじめご了承ください。
        </p>
      </section>
    </PolicyPage>
  );
}
