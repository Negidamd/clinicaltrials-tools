import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const footerLinks = {
  Product: [
    { href: "/calculators", label: "Sample Size Calculators" },
    { href: "/design-advisor", label: "Design Advisor" },
    { href: "/endpoints", label: "Endpoint Library" },
    { href: "/pricing", label: "Pricing" },
  ],
  Resources: [
    { href: "/blog", label: "Blog" },
    { href: "/blog/guide-sample-size-calculation", label: "Guides" },
    { href: "/calculators", label: "Free Tools" },
    { href: "/about", label: "About Us" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-[#1B2A4A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#0D7377" />
                <path d="M10 28L16 12L22 22L28 16L30 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="12" r="2" fill="white" />
                <circle cx="22" cy="22" r="2" fill="white" />
                <circle cx="28" cy="16" r="2" fill="white" />
              </svg>
              <span className="font-bold text-xl" style={{ fontFamily: "var(--font-heading-custom)" }}>
                <span className="text-[#14B8A6]">ClinicalTrials</span>
                <span className="text-white">.Tools</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              The all-in-one platform for clinical trial design, sample size calculation, and statistical planning.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ClinicalTrials.Tools. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Not a substitute for professional biostatistical consultation.
          </p>
        </div>
      </div>
    </footer>
  );
}
