import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Velin Studio" },
      { name: "description", content: "The terms governing your use of velinstudiobd.com and any purchase you make." },
      { property: "og:title", content: "Terms & Conditions — Velin Studio" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout title="Terms & Conditions">
      <p>
        These terms apply to your use of velinstudiobd.com and to any order you place with Velin
        Studio. By browsing the site or purchasing a piece, you agree to be bound by them.
      </p>

      <LegalSection title="Use of the site">
        <p>
          You may use the site for personal, non-commercial purposes only. You agree not to misuse
          the site, attempt to access it by automated means, or interfere with its operation. We
          reserve the right to suspend accounts that violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="Orders & pricing">
        <p>
          All orders are subject to acceptance and availability. Prices are shown in your local
          currency where available and may include or exclude taxes and duties depending on the
          shipping destination, as indicated at checkout. We reserve the right to refuse or
          cancel any order, including in cases of suspected fraud or pricing errors.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          All content on the site — including images, text, designs, the Velin Studio name and
          logo — is the property of Velin Studio or its licensors and is protected by intellectual
          property laws. No content may be reproduced, distributed or used commercially without
          prior written consent.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the fullest extent permitted by law, Velin Studio is not liable for indirect,
          incidental or consequential damages arising from the use of the site or our products.
          Nothing in these terms limits any liability that cannot be limited under applicable law,
          including liability for death, personal injury caused by negligence, or fraud.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of France. Any dispute that cannot be resolved
          amicably shall be subject to the exclusive jurisdiction of the courts of Paris, without
          prejudice to mandatory consumer protection rights you may have in your country of
          residence.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms from time to time. The version in force is the one published on
          this page at the moment you place your order.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For any question relating to these terms, please write to clientservices@velinstudiobd.com.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
