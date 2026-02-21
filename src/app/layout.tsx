import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-custom",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading-custom",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-custom",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClinicalTrials.Tools — Sample Size Calculators & Trial Design Platform",
    template: "%s | ClinicalTrials.Tools",
  },
  description:
    "The all-in-one platform for sample size calculation, trial design, power analysis, and statistical planning — trusted by investigators worldwide.",
  keywords: [
    "sample size calculator",
    "clinical trial design",
    "power analysis",
    "clinical trials",
    "biostatistics",
    "sample size determination",
  ],
  authors: [{ name: "ClinicalTrials.Tools" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ClinicalTrials.Tools",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
