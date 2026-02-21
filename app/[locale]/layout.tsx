import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google"; // Swapped for a luxury pairing
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Head from "./head";
import ClientLayout from "./ClientLayout";
import { Toaster } from "@/components/ui/sonner";
import ReferralTracker from "@/components/ReferralTracker";
import LockscreenOverlay from "@/components/LockscreenOverlay";
// Luxury Sans: For UI, Navigation, and Body
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Luxury Serif: For Headings and Italic accents (The "Champagne" feel)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schepenkring.nl | Elite Maritime Intelligence",
  description:
    "The world's premier digital marketplace for luxury yachts and maritime excellence.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a", // Matches the Obsidian background
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="scroll-smooth">
      <Head />
      <body
        className={`
          ${inter.variable} 
          ${playfair.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-[#ffffff] 
          text-black
          selection:bg-[#c5a572]/30 
          selection:text-[#7278c5]
        `}
      >
        <NextIntlClientProvider locale={locale}>
          <LockscreenOverlay>
            <ClientLayout>
              <ReferralTracker />
              {children}
              {/* Custom styled Toaster for the theme */}
              //{" "}
              <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#141414",
                    border: "1px solid rgba(197, 165, 114, 0.2)",
                    color: "#fff",
                    borderRadius: "0px",
                  },
                }}
              />
            </ClientLayout>
          </LockscreenOverlay>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
