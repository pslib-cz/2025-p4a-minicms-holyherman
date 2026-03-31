"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie-consent";

export type ConsentStatus = "granted" | "denied" | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "granted" || value === "denied") return value;
  return null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (!status) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    setVisible(false);
    // Dispatch event so GoogleAnalytics component can react
    window.dispatchEvent(new Event("consent-update"));
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    setVisible(false);
    window.dispatchEvent(new Event("consent-update"));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-surface-lowest rounded-2xl shadow-ambient-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 ghost-border">
        <div className="flex-1">
          <p className="font-[var(--font-display)] font-bold text-on-surface text-sm mb-1">
            This website uses cookies
          </p>
          <p className="text-on-surface-variant text-sm font-[var(--font-body)] leading-relaxed">
            We use analytics cookies to understand how you interact with our website and improve your experience. You can decline and the site will work normally.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-5 py-2 rounded-full ghost-border text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
