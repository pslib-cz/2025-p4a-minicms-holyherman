import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import CookieConsent from "@/app/components/CookieConsent";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import { Suspense } from "react";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | MiniCMS",
    default: "MiniCMS - A modern content management system",
  },
  description: "A fast, SEO-friendly CMS built with Next.js 16 and Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <Navbar />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
