import type { Metadata } from "next";
import { LegalShell } from "../legal-shell";

export const metadata: Metadata = {
  title: "Terms — ASCENSION",
  description: "Terms for using the ASCENSION store and member account.",
};

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Store terms / 01" title={<>TERMS<br/><span className="text-white/35">OF USE.</span></>} updated="28 September 2026">
      <p>These terms govern access to the ASCENSION website, member accounts and purchases. By using the site, you agree to these terms and the policies shown during checkout.</p>

      <h2>Accounts</h2>
      <p>You are responsible for maintaining control of the Google account used to sign in and for activity under your ASCENSION account. Information you provide must be accurate and current.</p>

      <h2>Products and availability</h2>
      <p>Product colours and proportions may vary slightly across screens and production runs. Availability, edition quantities and product details can change before an order is confirmed.</p>

      <h2>Prices and orders</h2>
      <p>Prices are displayed in the currency shown on the site. An order is accepted only when ASCENSION confirms it. We may cancel or limit an order when an item is unavailable, information is incorrect, or fraud or misuse is suspected.</p>

      <h2>Delivery, changes and cancellations</h2>
      <p>Estimated delivery details are provided when available and may be affected by circumstances outside our control. Eligible order changes or cancellation requests can be submitted through the member account; a request is not complete until confirmed.</p>

      <h2>Acceptable use</h2>
      <p>Do not misuse the site, interfere with its operation, attempt unauthorised access, automate abusive traffic, or use ASCENSION content or systems in a way that violates law or another person&apos;s rights.</p>

      <h2>Intellectual property</h2>
      <p>ASCENSION names, marks, product designs, photography, copy and site materials are owned by ASCENSION or used with permission. No rights are granted except the limited right to use the store for personal shopping.</p>

      <h2>Changes and contact</h2>
      <p>We may update these terms as the store evolves. The latest version and effective date will remain on this page. Questions may be sent to <a href="mailto:skc202618@gmail.com">skc202618@gmail.com</a>.</p>
    </LegalShell>
  );
}
