import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Velin Studio" },
      { name: "description", content: "Shipping timelines, costs, return windows, conditions and refund process for Velin Studio orders." },
      { property: "og:title", content: "Shipping & Returns — Velin Studio" },
      { property: "og:url", content: "/shipping-returns" },
    ],
    links: [{ rel: "canonical", href: "/shipping-returns" }],
  }),
  component: ShippingReturns,
});

function ShippingReturns() {
  return (
    <LegalLayout title="Shipping & Returns">
      <p>
        Each Velin Studio piece is dispatched from our atelier outside Florence, beautifully
        packaged in our signature ivory box. We offer complimentary shipping worldwide and a
        considered, transparent return process.
      </p>

      <LegalSection title="Shipping timelines & costs">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Europe</strong> — Standard express, 2–4 business days. Complimentary.</li>
          <li><strong>United Kingdom & Switzerland</strong> — 3–5 business days. Complimentary; duties prepaid.</li>
          <li><strong>United States & Canada</strong> — 3–5 business days. Complimentary; duties prepaid.</li>
          <li><strong>Asia, Middle East, Oceania</strong> — 4–7 business days. Complimentary; duties may apply on delivery.</li>
          <li><strong>Express priority (24–48h within Bangladesh)</strong> — ৳25 at checkout.</li>
        </ul>
        <p>
          Orders are processed within 24 hours on business days. You will receive a tracking link by
          email as soon as your parcel leaves the atelier.
        </p>
      </LegalSection>

      <LegalSection title="Return window">
        <p>
          We accept returns for refund within <strong>30 days</strong> of delivery on full-price
          pieces, and within <strong>14 days</strong> on sale pieces. Final-sale items, personalised
          pieces and intimates (including slippers worn outside) are not eligible.
        </p>
      </LegalSection>

      <LegalSection title="Return conditions">
        <p>To be accepted, returned pieces must be:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>unworn, unaltered and free of marks or scents;</li>
          <li>returned with their dust bag, tags, authentication card and original packaging;</li>
          <li>accompanied by the prepaid return label included in your parcel.</li>
        </ul>
        <p>
          We reserve the right to refuse returns that do not meet these conditions or to apply a
          restocking adjustment.
        </p>
      </LegalSection>

      <LegalSection title="Refund process">
        <p>
          Once your return arrives at the atelier, our team inspects the piece within 3 business
          days. Approved refunds are issued to the original payment method within 5–7 business
          days; depending on your bank, the credit may take an additional cycle to appear.
          Original shipping (where applicable) and duties are non-refundable, in line with EU
          consumer regulations.
        </p>
      </LegalSection>

      <LegalSection title="Exchanges & repairs">
        <p>
          For size or colour exchanges, we recommend placing a new order and returning the
          original. Our atelier also offers complimentary lifetime repairs on manufacturing
          defects — please contact clientservices@velinstudiobd.com.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
