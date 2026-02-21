import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing your use of ClinicalTrials.Tools, including subscriptions, liability, and intellectual property.",
};

export default function TermsOfServicePage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl font-bold text-[#1B2A4A]"
            style={{ fontFamily: "var(--font-heading-custom)" }}
          >
            Terms of Service
          </h1>
          <p className="mt-3 text-muted-foreground">
            Last updated: February 20, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-muted-foreground leading-relaxed">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using ClinicalTrials.Tools (&quot;the Service&quot;),
              you agree to be bound by these Terms of Service (&quot;Terms&quot;).
              If you do not agree to all of these Terms, you may not use the
              Service. These Terms constitute a legally binding agreement between
              you and ClinicalTrials.Tools.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify you of material changes by posting the updated Terms on this
              page and updating the &quot;Last updated&quot; date. Your continued use
              of the Service after changes are posted constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              2. Description of Service
            </h2>
            <p>
              ClinicalTrials.Tools is a web-based platform that provides clinical
              trial design tools, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Sample size calculators</strong> &mdash; Validated statistical
                tools for computing required sample sizes and statistical power for
                various study designs (t-tests, proportions, survival analysis,
                ANOVA, non-inferiority, cluster randomised trials, crossover designs,
                and more).
              </li>
              <li>
                <strong>AI Design Advisor</strong> &mdash; An AI-powered assistant
                that provides guidance on trial design, endpoint selection, and
                statistical methodology.
              </li>
              <li>
                <strong>Project management</strong> &mdash; Tools for organising
                calculations, generating reports, and collaborating within teams.
              </li>
            </ul>
          </section>

          {/* 3. User Accounts and Responsibilities */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              3. User Accounts and Responsibilities
            </h2>
            <p>
              To access certain features of the Service, you must create an account.
              You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security and confidentiality of your login credentials.</li>
              <li>Promptly notify us of any unauthorised use of your account.</li>
              <li>Accept responsibility for all activity that occurs under your account.</li>
            </ul>
            <p className="mt-2">
              You must not share your account credentials, create accounts under
              false identities, or use the Service for any unlawful purpose.
            </p>
          </section>

          {/* 4. Subscription and Billing */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              4. Subscription and Billing
            </h2>
            <p>
              The Service offers free and paid subscription tiers. Paid
              subscriptions are billed through Stripe on a monthly or annual basis.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Billing cycle</strong> &mdash; Subscriptions automatically
                renew at the end of each billing period unless cancelled before the
                renewal date.
              </li>
              <li>
                <strong>Price changes</strong> &mdash; We may adjust pricing with at
                least 30 days&apos; notice. Price changes take effect at the next
                billing cycle after the notice period.
              </li>
              <li>
                <strong>Refunds</strong> &mdash; Refunds are handled on a case-by-case
                basis. Contact us within 14 days of a charge if you believe a refund
                is warranted.
              </li>
              <li>
                <strong>Cancellation</strong> &mdash; You may cancel your subscription
                at any time from your account settings. You will retain access to paid
                features until the end of your current billing period.
              </li>
            </ul>
          </section>

          {/* 5. Disclaimer */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              5. Disclaimer &mdash; Not Professional Advice
            </h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-amber-900 font-medium">
                IMPORTANT: The Service is provided for informational and educational
                purposes only. The calculators, AI advisor, and all outputs generated
                by the Service are NOT a substitute for professional biostatistical
                consultation, regulatory advice, or independent statistical review.
              </p>
              <p className="text-amber-900 mt-2">
                All results should be independently verified by a qualified
                biostatistician before being used in clinical trial protocols,
                regulatory submissions, or any clinical decision-making.
              </p>
            </div>
            <p className="mt-3">
              We make no warranties that the results produced by the Service are
              error-free, complete, or suitable for any particular clinical
              application. You use the Service and its outputs entirely at your own
              risk.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              6. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CLINICALTRIALS.TOOLS
              AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, INCLUDING
              BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Errors or inaccuracies in calculation results.</li>
              <li>Decisions made based on outputs from the Service.</li>
              <li>Loss of data, revenue, or business opportunities.</li>
              <li>Interruptions to or unavailability of the Service.</li>
            </ul>
            <p className="mt-2">
              Our total cumulative liability to you for all claims arising from or
              relating to the Service shall not exceed the amount you paid us in the
              twelve (12) months preceding the claim.
            </p>
          </section>

          {/* 7. Intellectual Property */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              7. Intellectual Property
            </h2>
            <p>
              All content, branding, software, and design elements of the Service
              are the property of ClinicalTrials.Tools and are protected by
              copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-2">
              You retain ownership of any data you input into the Service. By using
              the Service, you grant us a limited, non-exclusive licence to process
              your inputs solely for the purpose of providing the Service
              functionality (e.g., running calculations, generating reports).
            </p>
            <p className="mt-2">
              You may not reproduce, distribute, modify, or create derivative works
              of the Service or its content without our prior written consent.
            </p>
          </section>

          {/* 8. Acceptable Use */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              8. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the Service.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Scrape, harvest, or collect data from the Service by automated means without permission.</li>
              <li>Impersonate another person or misrepresent your affiliation.</li>
              <li>Upload malicious code, viruses, or other harmful material.</li>
            </ul>
          </section>

          {/* 9. Termination */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              9. Termination
            </h2>
            <p>
              We may suspend or terminate your access to the Service at any time,
              with or without cause, and with or without notice. Grounds for
              termination include violation of these Terms, suspected fraud,
              non-payment, or any conduct we determine to be harmful to other users
              or the Service.
            </p>
            <p className="mt-2">
              Upon termination, your right to use the Service ceases immediately.
              You may request an export of your data within 30 days of termination
              by contacting us.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              10. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the
              laws of the United States. Any disputes arising from these Terms or
              the Service shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          {/* 11. Severability */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              11. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be invalid or
              unenforceable, the remaining provisions shall continue in full force
              and effect.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2
              className="text-xl font-bold text-[#1B2A4A] mb-3"
              style={{ fontFamily: "var(--font-heading-custom)" }}
            >
              12. Contact Us
            </h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:legal@clinicaltrials.tools"
                className="text-[#0D7377] hover:underline"
              >
                legal@clinicaltrials.tools
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
