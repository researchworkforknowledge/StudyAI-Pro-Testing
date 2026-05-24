/**
 * StudyAI Pro Google Analytics GA4 Utility
 * Multi-environment safe wrapper supporting type-safe event logging.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const MEASUREMENT_ID = "G-ZE8PEX5WCL";

/**
 * Log a custom Google Analytics page_view event.
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
}

/**
 * Log standard custom structured GA4 engagement events.
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  } else {
    // Elegant development debugging logging
    if (process.env.NODE_ENV !== "production") {
      console.log(`[GA4 Debug Event]: ${eventName}`, parameters);
    }
  }
}
