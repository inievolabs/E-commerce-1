import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Velin Studio" },
      { name: "description", content: "How Velin Studio collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy — Velin Studio" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        Velin Studio ("we", "our", "us") respects your privacy. This policy explains what
        personal data we collect when you visit velinstudio.com or place an order, how we use it,
        and the rights you have over it.
      </p>

      <LegalSection title="Information we collect">
        <p>
          We collect information you provide directly — your name, shipping and billing address,
          email, phone number, and payment details — when you create an account, place an order
          or contact our client services team. We also collect technical information automatically,
          including IP address, device type, browser, and pages visited, through cookies and
          similar technologies.
        </p>
      </LegalSection>

      <LegalSection title="How we use your data">
        <p>We use your data to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>process and deliver your orders, including taxes, duties and returns;</li>
          <li>manage your account and respond to client services enquiries;</li>
          <li>send transactional emails and, where you have opted in, newsletters;</li>
          <li>prevent fraud and comply with our legal obligations;</li>
          <li>improve our site, products and customer experience.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use strictly necessary cookies to operate the site and the shopping bag, and analytics
          cookies (with your consent) to understand how the collection is browsed. You can manage
          cookie preferences in your browser at any time.
        </p>
      </LegalSection>

      <LegalSection title="Third-party sharing">
        <p>
          We share data only with trusted partners that help us run the maison: payment processors,
          shipping carriers, fraud prevention and analytics providers. We never sell your personal
          data. Where data is transferred outside your region, we rely on standard contractual
          clauses or equivalent safeguards.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, delete or port
          your data, and to withdraw consent or object to certain processing. To exercise these
          rights, contact privacy@velinstudio.com. You also have the right to lodge a complaint
          with your local data protection authority.
        </p>
      </LegalSection>

      <LegalSection title="Data retention & security">
        <p>
          We retain personal data for as long as needed to fulfil orders, comply with tax and
          accounting obligations and resolve disputes. Data is stored on secured servers with
          industry-standard encryption.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For any privacy question, please write to privacy@velinstudio.com or Velin Studio,
          12 Rue des Archives, 75004 Paris, France.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
