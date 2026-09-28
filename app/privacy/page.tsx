import type { Metadata } from "next";
import { LegalShell } from "../legal-shell";

export const metadata: Metadata = {
  title: "Privacy — ASCENSION",
  description: "How ASCENSION collects, uses and protects customer information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Customer information / 01" title={<>PRIVACY<br/><span className="text-white/35">POLICY.</span></>} updated="28 September 2026">
      <p>ASCENSION uses personal information only to operate the store, provide member accounts, fulfil orders and improve the customer experience.</p>

      <h2>Information we collect</h2>
      <p>When you sign in or place an order, we may receive your name, email address, account identifier, delivery and billing details, order history, and communications with us. Google sign-in provides basic profile information only after you approve access.</p>

      <h2>How we use information</h2>
      <p>We use this information to authenticate your account, process and manage purchases, provide order updates, respond to support requests, prevent fraud and maintain the security and performance of ASCENSION.</p>

      <h2>Service providers</h2>
      <p>We use trusted infrastructure and authentication providers, including Google and Supabase, to operate account access and store essential account records. These providers process information under their own privacy and security commitments. We do not sell personal information.</p>

      <h2>Cookies and session data</h2>
      <p>Essential cookies and similar storage keep you signed in, protect account sessions and remember necessary site preferences. We may use limited technical data to diagnose errors and improve performance.</p>

      <h2>Retention and security</h2>
      <p>We retain information for as long as it is needed to provide the service, meet legal or accounting obligations, resolve disputes and protect the store. We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security.</p>

      <h2>Your choices</h2>
      <p>You may sign out at any time and ask us to access, correct or delete information associated with your account, subject to legal and operational retention requirements.</p>

      <h2>Contact</h2>
      <p>For privacy questions or requests, email <a href="mailto:skc202618@gmail.com">skc202618@gmail.com</a>.</p>
    </LegalShell>
  );
}
