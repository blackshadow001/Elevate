import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AccessibilityWidget } from "@/components/layout/AccessibilityWidget";
import { brand } from "@/lib/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4500"),
  title: `${brand.name} — ${brand.tagline}`,
  applicationName: brand.name,
  description: `${brand.tagline} Explore courses, live classes, and career paths taught by experienced instructors.`,
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.tagline,
    images: [{ url: brand.logoPath, width: 1820, height: 1024, alt: `${brand.name} orange ribbon logo and wordmark` }],
  },
  twitter: { card: "summary_large_image", title: `${brand.name} — ${brand.tagline}`, description: brand.tagline, images: [brand.logoPath] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
        <AccessibilityWidget siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4500"} />
      </body>
    </html>
  );
}
