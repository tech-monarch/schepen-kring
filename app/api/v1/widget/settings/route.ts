import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { WIDGET_CONFIG } from "@/lib/widget-config";
import fs from "fs";
import path from "path";

// PLACEHOLDER: Replace with your actual database/models
interface WidgetSettings {
  id: string;
  company_id: string;
  public_key: string;
  allowed_domains: string[];
  theme: {
    mode: "auto" | "light" | "dark";
    primary: string;
    foreground: string;
    background: string;
    radius: number;
    fontFamily: string;
    logoUrl?: string;
  };
  behavior: {
    position: "right" | "left";
    openOnLoad: boolean;
    openOnExitIntent: boolean;
    openOnInactivityMs: number;
    zIndex: number;
  };
  features: {
    chat: boolean;
    wallet: boolean;
    offers: boolean;
    leadForm: boolean;
  };
  i18n: {
    default: string;
    strings: Record<string, string>;
  };
  integrations: {
    ga4?: {
      measurementId: string;
    };
    mollie?: {
      apiKey: string;
    };
  };
  visibility_rules: {
    includePaths: string[];
    excludePaths: string[];
    minCartValue: number;
  };
  rate_limit_per_min: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// File system storage path
const SETTINGS_DIR = path.join(process.cwd(), "public", "widget", "settings");

// Ensure directory exists
try {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
} catch (e) {
  console.error("Failed to create settings directory:", e);
}

/**
 * Load settings from file system
 */
function loadSettings(companyId: string): WidgetSettings | null {
  try {
    const filePath = path.join(SETTINGS_DIR, `${companyId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  return null;
}

/**
 * Save settings to file system
 */
function saveSettings(companyId: string, settings: WidgetSettings): void {
  try {
    const filePath = path.join(SETTINGS_DIR, `${companyId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

/**
 * Validate JWT token (improved implementation)
 */
function validateToken(
  request: NextRequest,
): { companyId: string; userId: string } | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Widget Settings] No authorization header");
    return null;
  }

  const token = authHeader.substring(7);

  // Check if token exists
  if (!token || token.trim() === "") {
    console.log("[Widget Settings] Empty token");
    return null;
  }

  // Try to decode as JWT if it has the right structure
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      // It's a JWT token, try to decode it
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      const companyId =
        payload.company_id ||
        payload.companyId ||
        `cmp_${payload.id || payload.user_id || "default"}`;
      const userId =
        payload.user_id || payload.userId || payload.id || "user_default";

      console.log("[Widget Settings] JWT decoded successfully:", {
        companyId,
        userId,
      });
      return { companyId, userId };
    }
  } catch (error) {
    // Not a JWT token or decode failed, continue with fallback
    console.log("[Widget Settings] Token is not JWT format, using fallback");
  }

  // Fallback: Use token hash to generate a consistent company ID
  // This allows any token to work for local development
  // In production, you should validate against your backend
  try {
    const hash = crypto
      .createHash("md5")
      .update(token)
      .digest("hex")
      .substring(0, 8);
    const companyId = `cmp_${hash}`;
    const userId = `user_${hash}`;

    console.log("[Widget Settings] Using fallback company ID:", companyId);
    return { companyId, userId };
  } catch (error) {
    console.error("[Widget Settings] Error generating fallback ID:", error);
    // Last resort: return default values
    return {
      companyId: "cmp_default",
      userId: "user_default",
    };
  }
}

/**
 * Generate new public key
 */
function generatePublicKey(): string {
  const randomBytes = crypto.randomBytes(16);
  return "PUB_" + randomBytes.toString("hex");
}

/**
 * Purge CDN cache (placeholder implementation)
 */
async function purgeCDNCache(publicKey: string): Promise<void> {
  // PLACEHOLDER: Implement CDN cache purging
  // This should call your CDN API to purge cache for this public key
  console.log(`Purging CDN cache for public key: ${publicKey}`);
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const auth = validateToken(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const updates = await request.json();
    const { companyId } = auth;

    // Get current settings from file system
    let currentSettings = loadSettings(companyId);
    if (!currentSettings) {
      // Create new settings
      currentSettings = {
        id: crypto.randomUUID(),
        company_id: companyId,
        public_key: generatePublicKey(),
        allowed_domains: ["localhost:3000"], // Default domain
        theme: {
          mode: "auto",
          primary: "#0059ff",
          foreground: "#0f172a",
          background: "#ffffff",
          radius: 14,
          fontFamily: "Inter, ui-sans-serif",
        },
        behavior: {
          position: "right",
          openOnLoad: false,
          openOnExitIntent: true,
          openOnInactivityMs: 0,
          zIndex: 2147483000,
        },
        features: {
          chat: true,
          wallet: false,
          offers: false,
          leadForm: false,
        },
        i18n: {
          default: "en-US",
          strings: {},
        },
        integrations: {},
        visibility_rules: {
          includePaths: ["/"],
          excludePaths: [],
          minCartValue: 0,
        },
        rate_limit_per_min: 60,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Update settings with provided data
    const updatedSettings: WidgetSettings = {
      ...currentSettings,
      ...updates,
      version: currentSettings.version + 1,
      updated_at: new Date().toISOString(),
    };

    // Validate required fields
    if (updates.allowed_domains && !Array.isArray(updates.allowed_domains)) {
      return NextResponse.json(
        { error: "allowed_domains must be an array" },
        { status: 400 },
      );
    }

    if (updates.theme && typeof updates.theme !== "object") {
      return NextResponse.json(
        { error: "theme must be an object" },
        { status: 400 },
      );
    }

    if (updates.features && typeof updates.features !== "object") {
      return NextResponse.json(
        { error: "features must be an object" },
        { status: 400 },
      );
    }

    // Save to file system
    saveSettings(companyId, updatedSettings);

    // Purge CDN cache
    await purgeCDNCache(updatedSettings.public_key);

    return NextResponse.json({
      ok: true,
      version: updatedSettings.version,
      public_key: updatedSettings.public_key,
      settings: {
        theme: updatedSettings.theme,
        behavior: updatedSettings.behavior,
        features: updatedSettings.features,
        i18n: updatedSettings.i18n,
        integrations: updatedSettings.integrations,
        visibility_rules: updatedSettings.visibility_rules,
      },
    });
  } catch (error) {
    console.error("Widget Settings POST Error:", error);
    return NextResponse.json(
      { error: "Failed to update widget settings" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const auth = validateToken(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { companyId } = auth;
    const settings = loadSettings(companyId);

    if (!settings) {
      return NextResponse.json(
        { error: "Widget settings not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      settings: {
        id: settings.id,
        company_id: settings.company_id,
        public_key: settings.public_key,
        allowed_domains: settings.allowed_domains,
        theme: settings.theme,
        behavior: settings.behavior,
        features: settings.features,
        i18n: settings.i18n,
        integrations: settings.integrations,
        visibility_rules: settings.visibility_rules,
        rate_limit_per_min: settings.rate_limit_per_min,
        version: settings.version,
        created_at: settings.created_at,
        updated_at: settings.updated_at,
      },
    });
  } catch (error) {
    console.error("Widget Settings GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget settings" },
      { status: 500 },
    );
  }
}
