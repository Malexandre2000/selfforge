import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — SelfForge",
};

const EFFECTIVE_DATE = "July 27, 2026";
const CONTACT_EMAIL = "matthew.duchatellier@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex flex-1 flex-col bg-white pt-32 pb-24">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
          <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink-500">Effective {EFFECTIVE_DATE}</p>

          <div className="mt-10 space-y-8 text-ink-700 [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink-950 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:leading-relaxed">
            <section>
              <p>
                This Privacy Policy describes how SelfForge (&quot;we,&quot; &quot;us,&quot;
                or &quot;our&quot;) collects, uses, and shares information when you use our
                website, web application, and mobile application (together, the
                &quot;Service&quot;).
              </p>
            </section>

            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect the following categories of information:</p>
              <ul>
                <li>
                  <strong>Account information:</strong> your email address and
                  authentication details, handled by our authentication provider, Clerk.
                </li>
                <li>
                  <strong>Profile and onboarding data:</strong> information you provide
                  about yourself to personalize your plan, such as age, height, weight,
                  goals, and stated habits.
                </li>
                <li>
                  <strong>Progress data:</strong> measurements, weight logs, habit
                  completions, and progress photos you choose to add.
                </li>
                <li>
                  <strong>AI Coach conversations:</strong> messages you send to and receive
                  from the AI Coach.
                </li>
                <li>
                  <strong>Billing information:</strong> subscription status and payment
                  metadata. Your card details are collected and processed directly by
                  Stripe; we never see or store your full card number.
                </li>
                <li>
                  <strong>Usage information:</strong> basic technical logs (such as request
                  timestamps) used to operate rate limiting and keep the Service secure.
                </li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and personalize the Service, including AI-generated plans and coaching responses;</li>
                <li>Process payments and manage subscriptions;</li>
                <li>Maintain the security and integrity of the Service, including detecting abuse and enforcing rate limits;</li>
                <li>Communicate with you about your account or the Service;</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Share Information</h2>
              <p>
                We do not sell your personal information. We share information only with
                the service providers necessary to operate SelfForge, each of which
                processes data under its own privacy terms:
              </p>
              <ul>
                <li><strong>Clerk</strong> — authentication and account management;</li>
                <li><strong>Stripe</strong> — payment processing and subscription billing;</li>
                <li><strong>Anthropic</strong> — powers the AI Coach and AI-generated plans; your onboarding profile and chat messages are sent to Anthropic&apos;s API to generate responses;</li>
                <li><strong>Neon</strong> (PostgreSQL hosting) and <strong>Vercel</strong> (application hosting) — store and serve application data;</li>
              </ul>
              <p>
                We may also disclose information if required by law or to protect the
                rights, safety, or property of SelfForge or others.
              </p>
            </section>

            <section>
              <h2>4. Cookies</h2>
              <p>
                We use only strictly necessary cookies required for authentication (set by
                Clerk) and payment/session handling (set by Stripe during checkout). We do
                not use advertising or third-party analytics/tracking cookies.
              </p>
            </section>

            <section>
              <h2>5. Data Retention</h2>
              <p>
                We retain your account and profile data for as long as your account is
                active. If you delete your account, we delete or anonymize your personal
                data within a reasonable period, except where retention is required for
                legal, tax, or fraud-prevention purposes.
              </p>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>
                Depending on where you live, you may have the right to access, correct,
                export, or delete your personal information. To make such a request, email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-ink-950">
                  {CONTACT_EMAIL}
                </a>{" "}
                and we will respond within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2>7. Children&apos;s Privacy</h2>
              <p>
                The Service is not directed to, and is not intended for use by, anyone
                under 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2>8. Security</h2>
              <p>
                We use reasonable technical and organizational measures, including
                encryption in transit, access controls, and rate limiting, to protect your
                information. No method of transmission or storage is completely secure, and
                we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will
                be reflected by an updated effective date on this page.
              </p>
            </section>

            <section>
              <h2>10. Contact</h2>
              <p>
                Questions about this Privacy Policy can be sent to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-ink-950">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
