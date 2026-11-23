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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://elevate.courses"),
  title: {
    default: "Elevate — Online Learning Platform | Courses & Career Paths",
    template: "%s — Elevate",
  },
  applicationName: brand.name,
  description: "Elevate is an online learning platform offering courses, live learning, and career paths in AI, technology, and business. Learn from experts and elevate your future.",
  keywords: [
    "Elevate",
    "Elevate Courses",
    "Elevate LMS",
    "Elevate learning platform",
    "online learning platform",
    "practical tech courses",
    "AI courses",
    "Tamil tech courses",
    "career paths",
    "live classes",
  ],
  publisher: "Elevate",
  creator: "Elevate",
  authors: [{ name: "Elevate", url: "https://elevate.courses" }],
  verification: { google: "ouMKC2PNtQk0GIcc8iM2lIsrW5kgDeukZCK5j0wnhj0" },
  alternates: {
    canonical: "https://elevate.courses",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elevate.courses",
    siteName: "Elevate",
    title: "Elevate — Online Learning Platform | Courses & Career Paths",
    description: "Elevate is an online learning platform offering courses, live learning, and career paths in AI, technology, and business.",
    images: [{ url: "/branding/elevate-orange-ribbon-logo.png", width: 1119, height: 337, alt: "Elevate — Online Learning Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevate — Online Learning Platform",
    description: "Elevate is an online learning platform offering courses, live learning, and career paths in AI, technology, and business.",
    images: ["/branding/elevate-orange-ribbon-logo.png"],
  },
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
