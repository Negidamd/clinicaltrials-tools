import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ClinicalTrials.Tools collects, uses, and protects your personal information and research data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-muted-foreground">
            Last updated: February 20, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-muted-foreground leading-relaxed">
          {/* 1. Introduction */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              1. Introduction
            </h2>
            <p>
              ClinicalTrials.Tools (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to
              protecting your privacy. This Privacy Policy describes how we collect,
              use, store, and share your information when you use our website, sample
              size calculators, design advisor, and related services (collectively,
              the &quot;Service&quot;).
            </p>
            <p>
              By using the Service, you agree to the practices described in this
              policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              2. Information We Collect
            </h2>
            <h3 className="font-semibold text-[#1B2A4A] mt-4 mb-2">
              Account Information
            </h3>
            <p>
              When you create an account, we collect your name, email address,
              institutional affiliation (if provided), and authentication credentials.
              If you sign in via Google or ORCID, we receive your profile information
              from those providers.
            </p>
            <h3 className="font-semibold text-[#1B2A4A] mt-4 mb-2">
              Usage Data
            </h3>
            <p>
              We automatically collect information about how you interact with the
              Service, including pages viewed, calculators used, features accessed,
              timestamps, IP address, browser type, and device information.
            </p>
            <h3 className="font-semibold text-[#1B2A4A] mt-4 mb-2">
              Calculation Inputs and Outputs
            </h3>
            <p>
              When you run a sample size calculation or use the AI design advisor,
              we process and may store the parameters you enter and the results
              generated. Saved calculations are associated with your account and
              project.
            </p>
            <h3 className="font-semibold text-[#1B2A4A] mt-4 mb-2">
              Payment Information
            </h3>
            <p>
              If you subscribe to a paid plan, payment is processed by Stripe. We
              do not store your full credit card number. Stripe provides us with a
              token, the last four digits of your card, and billing details.
            </p>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide, maintain, and improve the Service.</li>
              <li>To authenticate your identity and manage your account.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To save your projects, calculations, and preferences.</li>
              <li>To provide AI-powered design recommendations via our design advisor.</li>
              <li>To send transactional emails (account confirmations, password resets, billing receipts).</li>
              <li>To analyze usage patterns and improve our calculators and tools.</li>
              <li>To detect and prevent fraud, abuse, and security incidents.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          {/* 4. Data Storage and Security */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              4. Data Storage and Security
            </h2>
            <p>
              Your data is stored in encrypted PostgreSQL databases hosted on
              secure, SOC 2-compliant infrastructure. All data in transit is
              protected with TLS/SSL encryption. We implement access controls,
              regular backups, and monitoring to safeguard your information.
            </p>
            <p>
              While we take reasonable measures to protect your data, no method of
              electronic storage or transmission is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              5. Third-Party Services
            </h2>
            <p>
              We use the following third-party services to operate the platform:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Stripe</strong> &mdash; Payment processing and subscription
                management. Stripe&apos;s privacy policy applies to payment data they
                process.
              </li>
              <li>
                <strong>Google Authentication</strong> &mdash; OAuth sign-in. Google
                provides us with your name and email when you choose to authenticate
                via Google.
              </li>
              <li>
                <strong>ORCID</strong> &mdash; OAuth sign-in for researchers. ORCID
                provides your name and ORCID iD when you choose to authenticate.
              </li>
              <li>
                <strong>Anthropic AI</strong> &mdash; Powers our AI design advisor.
                Inputs you provide to the advisor are sent to Anthropic&apos;s API
                for processing. Anthropic&apos;s usage policies apply to data
                processed by their models.
              </li>
            </ul>
            <p className="mt-2">
              We encourage you to review the privacy policies of these third-party
              providers.
            </p>
          </section>

          {/* 6. Cookie Policy */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              6. Cookie Policy
            </h2>
            <p>
              We use cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Essential cookies</strong> &mdash; Required for
                authentication, session management, and security.
              </li>
              <li>
                <strong>Analytics cookies</strong> &mdash; Help us understand how
                visitors use the Service so we can improve it. These may be provided
                by third-party analytics services.
              </li>
              <li>
                <strong>Preference cookies</strong> &mdash; Remember your settings
                and preferences across sessions.
              </li>
            </ul>
            <p className="mt-2">
              You can control cookies through your browser settings. Disabling
              essential cookies may impair the functionality of the Service.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              7. Data Retention
            </h2>
            <p>
              We retain your account information and saved data for as long as your
              account is active or as needed to provide the Service. If you delete
              your account, we will remove your personal information and saved
              projects within 30 days, unless we are required to retain it for legal
              or compliance purposes.
            </p>
            <p>
              Anonymized, aggregated usage data may be retained indefinitely for
              analytics and product improvement.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              8. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Access</strong> &mdash; Request a copy of the personal data
                we hold about you.
              </li>
              <li>
                <strong>Correction</strong> &mdash; Request correction of inaccurate
                or incomplete data.
              </li>
              <li>
                <strong>Deletion</strong> &mdash; Request deletion of your personal
                data and account.
              </li>
              <li>
                <strong>Portability</strong> &mdash; Request an export of your data
                in a machine-readable format (JSON or CSV).
              </li>
              <li>
                <strong>Restriction</strong> &mdash; Request that we limit the
                processing of your data under certain circumstances.
              </li>
              <li>
                <strong>Objection</strong> &mdash; Object to processing of your data
                for specific purposes.
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at the email
              address below.
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for individuals under the age of 18. We
              do not knowingly collect personal information from children. If you
              believe we have inadvertently collected such data, please contact us
              and we will promptly delete it.
            </p>
          </section>

          {/* 10. Changes to This Policy */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of material changes by posting the updated policy on this page
              and updating the &quot;Last updated&quot; date. Your continued use of the
              Service after changes are posted constitutes acceptance of the
              updated policy.
            </p>
          </section>

          {/* 11. Contact */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              11. Contact Us
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our
              data practices, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:privacy@clinicaltrials.tools"
                className="text-[#0D7377] hover:underline"
              >
                privacy@clinicaltrials.tools
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
