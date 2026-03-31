"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { getConsentStatus } from "./CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consentGiven, setConsentGiven] = useState(false);

  // Listen for consent changes
  useEffect(() => {
    const checkConsent = () => {
      setConsentGiven(getConsentStatus() === "granted");
    };

    checkConsent();
    window.addEventListener("consent-update", checkConsent);
    return () => window.removeEventListener("consent-update", checkConsent);
  }, []);

  // Track page views when route changes
  useEffect(() => {
    if (!consentGiven || !GA_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // gtag might not be loaded yet on first consent
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_ID, { page_path: url });
    }
  }, [pathname, searchParams, consentGiven]);

  if (!consentGiven || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname
          });
        `}
      </Script>
    </>
  );
}
