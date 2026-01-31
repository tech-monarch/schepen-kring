/**
 * Widget Configuration
 * Centralized configuration for the Answer24 Widget System
 */

export const WIDGET_CONFIG = {
  // API Configuration - Using your existing API URLs
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.answer24.nl/api/v1",
  CDN_BASE_URL:
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "https://api.answer24.nl",

  // Security - Using your existing API base for signing
  SIGNING_SECRET:
    process.env.WIDGET_SIGNING_SECRET || "your-widget-signing-secret-here",

  // AI Service - Using your existing AI configuration
  AI_SERVICE_URL:
    process.env.NEXT_PUBLIC_AI_SERVICE === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.answer24.nl/ai",
  AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY || "your-openai-api-key-here",

  // Database - Using your existing setup
  DATABASE_URL: process.env.DATABASE_URL || "your-database-url-here",

  // Redis - Optional for rate limiting
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // JWT - Using your existing auth system
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-here",

  // CDN - Optional for cache purging
  CDN_PURGE_URL: process.env.CDN_PURGE_URL || "https://your-cdn.com/purge",
  CDN_PURGE_KEY: process.env.CDN_PURGE_KEY || "your-cdn-purge-key",

  // Analytics - Optional
  GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID || "G-XXXXXXXXXX",

  // Email - Optional for notifications
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "your-email@gmail.com",
  SMTP_PASS: process.env.SMTP_PASS || "your-app-password",

  // Security - Using your existing API domain
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
    "https://api.answer24.nl",
    "https://api.answer24.nl",
    "https://.answer24.nl",
  ],
  RATE_LIMIT_PER_MINUTE: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "60"),

  // Widget Settings
  WIDGET_VERSION: "2.0.0",
  DEFAULT_THEME: {
    mode: "auto",
    primary: "#0059ff",
    foreground: "#0f172a",
    background: "#ffffff",
    radius: 14,
    fontFamily: "Inter, ui-sans-serif",
  },
  DEFAULT_BEHAVIOR: {
    position: "right",
    openOnLoad: false,
    openOnExitIntent: true,
    openOnInactivityMs: 0,
    zIndex: 2147483000,
  },
  DEFAULT_FEATURES: {
    chat: true,
    wallet: false,
    offers: false,
    leadForm: false,
  },
} as const;

/**
 * Get widget configuration for client-side use
 */
export function getWidgetConfig() {
  return {
    API_BASE_URL: WIDGET_CONFIG.API_BASE_URL,
    CDN_BASE_URL: WIDGET_CONFIG.CDN_BASE_URL,
    VERSION: WIDGET_CONFIG.WIDGET_VERSION,
  };
}

/**
 * Get server-side configuration
 */
export function getServerConfig() {
  return {
    SIGNING_SECRET: WIDGET_CONFIG.SIGNING_SECRET,
    AI_SERVICE_URL: WIDGET_CONFIG.AI_SERVICE_URL,
    AI_API_KEY: WIDGET_CONFIG.AI_API_KEY,
    DATABASE_URL: WIDGET_CONFIG.DATABASE_URL,
    REDIS_URL: WIDGET_CONFIG.REDIS_URL,
    JWT_SECRET: WIDGET_CONFIG.JWT_SECRET,
    CDN_PURGE_URL: WIDGET_CONFIG.CDN_PURGE_URL,
    CDN_PURGE_KEY: WIDGET_CONFIG.CDN_PURGE_KEY,
    GA4_MEASUREMENT_ID: WIDGET_CONFIG.GA4_MEASUREMENT_ID,
    SMTP_HOST: WIDGET_CONFIG.SMTP_HOST,
    SMTP_PORT: WIDGET_CONFIG.SMTP_PORT,
    SMTP_USER: WIDGET_CONFIG.SMTP_USER,
    SMTP_PASS: WIDGET_CONFIG.SMTP_PASS,
    CORS_ALLOWED_ORIGINS: WIDGET_CONFIG.CORS_ALLOWED_ORIGINS,
    RATE_LIMIT_PER_MINUTE: WIDGET_CONFIG.RATE_LIMIT_PER_MINUTE,
  };
}
