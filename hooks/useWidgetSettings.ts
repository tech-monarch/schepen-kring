import { useState, useEffect } from "react";

export interface WidgetSettings {
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

const DEFAULT_SETTINGS: WidgetSettings = {
  id: "1",
  company_id: "default",
  public_key: "PUB_default",
  allowed_domains: ["*"],
  theme: {
    mode: "auto",
    primary: "#2563eb",
    foreground: "#ffffff",
    background: "#ffffff",
    radius: 18,
    fontFamily: "Inter, ui-sans-serif",
    logoUrl: "/schepenkring-logo.png",
  },
  behavior: {
    position: "right",
    openOnLoad: false,
    openOnExitIntent: true,
    openOnInactivityMs: 60000, // 60 seconds
    zIndex: 9999,
  },
  features: {
    chat: true,
    wallet: false,
    offers: false,
    leadForm: false,
  },
  i18n: {
    default: "en-US",
    strings: {
      "chat.welcome":
        "Hi there! I'm answer24, your assistant. How can I help you today?",
      "chat.placeholder": "Type your message...",
      "chat.send": "Send",
    },
  },
  integrations: {},
  visibility_rules: {
    includePaths: ["*"],
    excludePaths: [],
    minCartValue: 0,
  },
  rate_limit_per_min: 60,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useWidgetSettings() {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      // Try to load from localStorage first (set by admin)
      const localSettings = localStorage.getItem("widget-settings");
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setSettings(parsed);
          console.log("✅ Widget settings loaded from localStorage");
        } catch (error) {
          console.error("Error parsing widget settings:", error);
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        // Use default settings
        setSettings(DEFAULT_SETTINGS);
        console.log("✅ Using default widget settings");
      }
    } catch (error) {
      console.error("Error loading widget settings:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Listen for widget settings updates
    const handleSettingsUpdate = () => {
      console.log("🔄 Widget settings updated, reloading...");
      loadSettings();
    };

    window.addEventListener("widget-settings-updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener(
        "widget-settings-updated",
        handleSettingsUpdate,
      );
    };
  }, []);

  return { settings, loading };
}
