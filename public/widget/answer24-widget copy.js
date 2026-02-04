/**
 * Schepenkring.nlEmbeddable Chat Widget
 * Version: 3.0.0 - Enhanced with Welcome Screen & Modern Features
 *
 * Usage:
 * <script src="https://yourdomain.com/widget/answer24-widget.js" data-public-key="YOUR_PUBLIC_KEY"></script>
 */

(function () {
  "use strict";

  // Get configuration from script tag
  const scriptTag =
    document.currentScript || document.querySelector("script[data-public-key]");
  const publicKey = scriptTag?.getAttribute("data-public-key");
  let apiBase = scriptTag?.getAttribute("data-api-base");
  if (!apiBase) {
    const currentHost = window.location.host;
    if (currentHost.includes("localhost") || currentHost.startsWith("127.")) {
      // Use local Next.js API for localhost development
      apiBase = "https://kring.answer24.nl/api/v1";
    } else if (currentHost.includes("answer24.nl")) {
      apiBase = "https://kring.answer24.nl/api/v1";
    } else {
      apiBase = "https://kring.answer24.nl/api/v1";
    }
  }

  if (!publicKey) {
    console.error(
      "[Schepenkring.nlWidget] Error: data-public-key attribute is required",
    );
    return;
  }

  console.log(
    "[Schepenkring.nlWidget] Initializing with public key:",
    publicKey,
  );

  // Widget state
  let widgetSettings = null;
  let isOpen = false;
  let activeTab = "home"; // 'home' or 'chat'
  let messages = [];
  let chatId = null;
  let selectedFile = null;
  let filePreview = null;
  let isMuted = true;
  let isListening = false;

  // Welcome options
  const welcomeOptions = [
    { label: "What is answer24?", icon: "❓" },
    { label: "Discover Schepenkring.nlPremium", icon: "💎" },
    { label: "How can I log into my account?", icon: "🔑" },
    { label: "Contact support", icon: "💬" },
  ];

  // Detect demo mode or missing publicKey
  let effectivePublicKey = publicKey;
  if (!effectivePublicKey || effectivePublicKey === "demo-key-123") {
    effectivePublicKey = "PUB_demo_testkey";
    console.warn(
      "[Schepenkring.nlWidget] Using fallback demo public key: PUB_demo_testkey",
    );
  }

  // Merge settings with defaults
  function mergeWithDefaults(apiJson) {
    const defaultSettings = {
      theme: {
        primary: "#2563eb",
        foreground: "#ffffff",
        background: "#ffffff",
        radius: 18,
        fontFamily: "Inter, system-ui, sans-serif",
      },
      behavior: {
        position: "right",
        openOnLoad: false,
        openOnExitIntent: true,
        openOnInactivityMs: 0,
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
      visibility_rules: {},
      cdn: {},
    };

    function mergeSection(api, def) {
      if (!api || typeof api !== "object") return { ...def };
      const merged = { ...def };
      for (const k in def)
        if (Object.hasOwn(def, k))
          merged[k] = api[k] !== undefined ? api[k] : def[k];
      for (const k in api) if (!Object.hasOwn(def, k)) merged[k] = api[k];
      return merged;
    }

    return {
      theme: mergeSection(apiJson.theme, defaultSettings.theme),
      behavior: mergeSection(apiJson.behavior, defaultSettings.behavior),
      features: mergeSection(apiJson.features, defaultSettings.features),
      i18n: apiJson.i18n
        ? {
            ...defaultSettings.i18n,
            ...apiJson.i18n,
            strings: {
              ...defaultSettings.i18n.strings,
              ...((apiJson.i18n || {}).strings || {}),
            },
          }
        : defaultSettings.i18n,
      integrations: apiJson.integrations || {},
      visibility_rules: apiJson.visibility_rules || {},
      cdn: apiJson.cdn || {},
    };
  }

  // Fetch widget settings
  async function loadSettings(forceReload = false) {
    try {
      // Add timestamp to bypass cache when forceReload is true
      const cacheBuster = forceReload ? `&_t=${Date.now()}` : "";
      const url = `${apiBase}/widget/config?key=${encodeURIComponent(
        effectivePublicKey,
      )}${cacheBuster}`;
      const apiResp = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (apiResp.ok) {
        const apiJson = await apiResp.json();
        if (apiJson && typeof apiJson === "object") {
          widgetSettings = mergeWithDefaults(apiJson);
          console.log(
            "[Schepenkring.nlWidget] Loaded settings from API",
            widgetSettings,
          );
          try {
            localStorage.setItem(
              "widget-settings",
              JSON.stringify(widgetSettings),
            );
          } catch (e) {}
          // Re-apply settings to widget if already rendered
          // Reload the widget to apply new settings
          const existingContainer = document.getElementById(
            "answer24-widget-container",
          );
          if (existingContainer && existingContainer.parentNode) {
            const wasOpen = isOpen;
            try {
              // Safe removal
              if (
                existingContainer.parentNode === document.body ||
                existingContainer.parentNode.contains(existingContainer)
              ) {
                existingContainer.remove();
              } else {
                existingContainer.parentNode.removeChild(existingContainer);
              }
            } catch (removeError) {
              console.warn(
                "[Schepenkring.nlWidget] Error removing existing container:",
                removeError,
              );
            }
            await initWidget();
            if (wasOpen) {
              const newWindow = document.getElementById("answer24-chat-window");
              if (newWindow) newWindow.classList.add("open");
              isOpen = true;
            }
          } else if (existingContainer) {
            // Container exists but has no parent, just reinit
            await initWidget();
          }
          return;
        }
      }
    } catch (apiErr) {
      console.warn(
        "[Schepenkring.nlWidget] Failed to fetch settings from API",
        apiErr,
      );
    }

    try {
      const localSettings = localStorage.getItem("widget-settings");
      if (localSettings) {
        widgetSettings = JSON.parse(localSettings);
        console.log(
          "[Schepenkring.nlWidget] Loaded settings from localStorage",
        );
        return;
      }
    } catch (e) {}

    // Final fallback
    widgetSettings = {
      theme: {
        primary: "#2563eb",
        foreground: "#ffffff",
        background: "#ffffff",
        radius: 18,
        fontFamily: "Inter, system-ui, sans-serif",
      },
      behavior: {
        position: "right",
        openOnLoad: false,
        zIndex: 9999,
      },
      features: { chat: true, wallet: false, offers: false, leadForm: false },
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
      visibility_rules: {},
      cdn: {},
    };
  }

  // Create widget HTML
  function createWidgetHTML() {
    const theme = widgetSettings.theme;
    const behavior = widgetSettings.behavior;
    const strings = widgetSettings.i18n.strings;
    const position =
      behavior.position === "left" ? "left: 24px;" : "right: 24px;";

    return `
      <style>
        #answer24-widget-container * {
          box-sizing: border-box;
          font-family: ${theme.fontFamily};
        }
        
        @keyframes floaty {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        #answer24-chat-button {
          position: fixed;
          bottom: 24px;
          ${position}
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}, #1e293b);
          color: ${theme.foreground};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: ${behavior.zIndex};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
          animation: floaty 3s ease-in-out infinite;
        }
        
        #answer24-chat-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}, #1e293b);
          animation: pulse-ring 2s ease-out infinite;
          z-index: -1;
        }
        
        #answer24-chat-button:hover {
          transform: scale(1.1);
        }
        
        #answer24-chat-window {
          position: fixed;
          bottom: 100px;
          ${position}
          width: 400px;
          max-width: 90vw;
          max-height: 70vh;
          min-height: 500px;
          background: ${theme.background};
          border-radius: ${theme.radius}px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          z-index: ${behavior.zIndex};
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        #answer24-chat-window.open {
          display: flex;
        }
        
        #answer24-chat-header {
          background: linear-gradient(135deg, ${theme.primary}, #1e293b);
          color: ${theme.foreground};
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: sticky;
          top: 0;
          z-index: 10;
          border-top-left-radius: ${theme.radius}px;
          border-top-right-radius: ${theme.radius}px;
        }
        
        .answer24-header-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .answer24-back-button {
          display: none;
          background: transparent;
          border: none;
          color: ${theme.foreground};
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          margin-right: 8px;
        }
        
        .answer24-back-button.show {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .answer24-avatars {
          display: flex;
        }
        
        .answer24-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          margin-left: -8px;
        }
        
        .answer24-avatar:first-child {
          margin-left: 0;
        }
        
        .answer24-header-title {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
          margin-left: 8px;
        }
        
        .answer24-header-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .answer24-mute-button {
          background: transparent;
          border: none;
          color: ${theme.foreground};
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .answer24-mute-button:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .answer24-status-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        
        .answer24-status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .answer24-status-text {
          font-size: 14px;
        }
        
        #answer24-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        #answer24-welcome-screen {
          display: none;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 32px 24px;
          overflow-y: auto;
        }
        
        #answer24-welcome-screen.show {
          display: flex;
        }
        
        .answer24-welcome-title {
          color: ${theme.primary};
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 4px;
        }
        
        .answer24-welcome-subtitle {
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .answer24-options {
          width: 100%;
          max-width: 95%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .answer24-option-button {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border-radius: 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .answer24-option-button:hover {
          background: #e0e7ff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: scale(1.02);
        }
        
        .answer24-option-icon {
          font-size: 18px;
        }
        
        .answer24-option-arrow {
          color: ${theme.primary};
          font-weight: bold;
        }
        
        #answer24-chat-screen {
          display: none;
          flex: 1;
          flex-direction: column;
          overflow: hidden;
        }
        
        #answer24-chat-screen.show {
          display: flex;
        }
        
        #answer24-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .answer24-message {
          padding: 12px 16px;
          border-radius: 24px;
          max-width: 85%;
          word-wrap: break-word;
          transition: all 0.2s;
        }
        
        .answer24-message.user {
          background: linear-gradient(135deg, ${theme.primary}, #1e40af);
          color: white;
          margin-left: auto;
          align-self: flex-end;
        }
        
        .answer24-message.bot {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          align-self: flex-start;
        }
        
        .answer24-message:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .answer24-file-preview {
          margin-top: 8px;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .answer24-file-img {
          max-width: 100px;
          max-height: 100px;
          border-radius: 4px;
          object-fit: contain;
        }
        
        .answer24-file-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .answer24-file-info {
          display: flex;
          flex-direction: column;
        }
        
        .answer24-file-name {
          font-size: 12px;
          color: #374151;
          word-break: break-all;
        }
        
        .answer24-file-size {
          font-size: 11px;
          color: #6b7280;
        }
        
        #answer24-input-area {
          padding: 12px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        
        .answer24-file-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        }
        
        .answer24-file-remove:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .answer24-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .answer24-attach-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: ${theme.primary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .answer24-attach-button:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: scale(1.05);
        }
        
        #answer24-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
          background: #f9fafb;
          transition: all 0.2s;
        }
        
        #answer24-input:focus {
          border-color: ${theme.primary};
          background: white;
        }
        
        .answer24-voice-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: ${theme.primary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 18px;
        }
        
        .answer24-voice-button:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: scale(1.05);
        }
        
        .answer24-voice-button.listening {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
          animation: pulse-voice 1s ease-in-out infinite;
        }
        
        @keyframes pulse-voice {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        #answer24-send-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}, #1e293b);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        
        #answer24-send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }
        
        #answer24-send-button:active:not(:disabled) {
          transform: scale(0.95);
        }
        
        #answer24-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .answer24-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          align-items: center;
        }
        
        .answer24-typing span {
          width: 8px;
          height: 8px;
          background: ${theme.primary};
          border-radius: 50%;
          animation: answer24-bounce 1.4s infinite ease-in-out;
        }
        
        .answer24-typing span:nth-child(1) { animation-delay: -0.32s; }
        .answer24-typing span:nth-child(2) { animation-delay: -0.16s; }
        
        .answer24-typing-text {
          margin-left: 8px;
          color: #4b5563;
          font-size: 14px;
        }
        
        @keyframes answer24-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        #answer24-footer {
          position: relative;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .answer24-footer-scroll-btn {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}, #1e293b);
          color: white;
          border: none;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }
        
        .answer24-footer-scroll-btn.show {
          display: flex;
        }
        
        .answer24-footer-scroll-btn:hover {
          transform: translateX(-50%) scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }
        
        .answer24-footer-scroll-btn svg {
          animation: bounce-arrow 2s ease-in-out infinite;
        }
        
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        
        .answer24-footer-chat-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 12px;
          background: linear-gradient(to right, #eff6ff, #eef2ff);
          border: 1px solid #bfdbfe;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.primary};
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
          display: none;
        }
        
        .answer24-footer-chat-btn.show {
          display: flex;
        }
        
        .answer24-footer-chat-btn:hover {
          background: linear-gradient(to right, #dbeafe, #e0e7ff);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: scale(1.02);
        }
        
        .answer24-footer-powered {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .answer24-footer-dot {
          width: 4px;
          height: 4px;
          background: #10b981;
          border-radius: 50%;
          margin-left: 4px;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .answer24-bold {
          font-weight: 600;
        }
        
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      </style>
      
      <div id="answer24-widget-container">
        <button id="answer24-chat-button" aria-label="Open chat">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        
        <div id="answer24-chat-window">
          <div id="answer24-chat-header">
            <div class="answer24-header-top">
              <button class="answer24-back-button" id="answer24-back-button" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div class="answer24-avatars">
                <img src="/Image-1.png" alt="Avatar 1" class="answer24-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'https://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'50\\' r=\\'50\\' fill=\\'%232563eb\\'/%3E%3Ctext x=\\'50\\' y=\\'65\\' font-size=\\'50\\' text-anchor=\\'middle\\' fill=\\'white\\'%3E👤%3C/text%3E%3C/svg%3E'" />
                <img src="/Image-2.png" alt="Avatar 2" class="answer24-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'https://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'50\\' r=\\'50\\' fill=\\'%232563eb\\'/%3E%3Ctext x=\\'50\\' y=\\'65\\' font-size=\\'50\\' text-anchor=\\'middle\\' fill=\\'white\\'%3E👥%3C/text%3E%3C/svg%3E'" />
                <img src="/Image-3.png" alt="Avatar 3" class="answer24-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'https://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'50\\' r=\\'50\\' fill=\\'%232563eb\\'/%3E%3Ctext x=\\'50\\' y=\\'65\\' font-size=\\'50\\' text-anchor=\\'middle\\' fill=\\'white\\'%3E💬%3C/text%3E%3C/svg%3E'" />
              </div>
              <span class="answer24-header-title">Schepenkring.nlChat</span>
              <div class="answer24-header-actions">
                <button class="answer24-mute-button" id="answer24-mute-button" aria-label="Toggle mute">
                  <svg id="answer24-mute-icon-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <line x1="22" y1="2" x2="2" y2="22"></line>
                  </svg>
                  <svg id="answer24-mute-icon-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="answer24-status-line">
              <div class="answer24-status-dot"></div>
              <span class="answer24-status-text">We are online</span>
            </div>
          </div>
          
          <div id="answer24-content-area">
            <div id="answer24-welcome-screen" class="show scrollbar-hide">
              <div class="answer24-welcome-title">Welcome to answer24!</div>
              <div class="answer24-welcome-subtitle">Choose a topic to get started, or chat directly with our AI assistant:</div>
              <div class="answer24-options">
                ${welcomeOptions
                  .map(
                    (opt) => `
                  <button class="answer24-option-button" data-option="${opt.label}">
                    <span class="answer24-option-icon">${opt.icon}</span>
                    <span style="flex: 1; text-align: center;">${opt.label}</span>
                    <span class="answer24-option-arrow">&gt;</span>
                  </button>
                `,
                  )
                  .join("")}
              </div>
              <div style="margin-top: 16px; font-size: 12px; color: #6b7280; text-align: center;">
                Or scroll down for more options
              </div>
            </div>
            
            <div id="answer24-chat-screen" class="scrollbar-hide">
              <div id="answer24-messages"></div>
            </div>
          </div>
          
          <div id="answer24-input-area">
            <input type="file" id="answer24-file-input" accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display: none;">
            <div class="answer24-input-row">
              <button class="answer24-attach-button" id="answer24-attach-button" aria-label="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </button>
              <input 
                type="text" 
                id="answer24-input" 
                placeholder="${strings["chat.placeholder"]}"
                autocomplete="off"
              />
              <button class="answer24-voice-button" id="answer24-voice-button" aria-label="Voice input">
                🎤
              </button>
              <button id="answer24-send-button" aria-label="${
                strings["chat.send"]
              }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
          
          <div id="answer24-footer">
            <button class="answer24-footer-scroll-btn" id="answer24-scroll-btn" aria-label="Scroll down">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="answer24-footer-chat-btn" id="answer24-chat-button-footer">
              Chat with answer24
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
            <div class="answer24-footer-powered">
              <span>Powered by</span>
              <span class="answer24-bold">answer24</span>
              <div class="answer24-footer-dot"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // // Send message to API
  // async function sendMessage(message) {
  //   try {
  //     return new Promise((resolve) => {
  //       setTimeout(() => {
  //         resolve({
  //           content: `Thank you for your message: "${message}". This is a demo response. Connect to your backend API for real AI responses.`
  //         });
  //       }, 1000);
  //     });
  //   } catch (error) {
  //     console.error('[Schepenkring.nlWidget] Error sending message:', error);
  //     return {
  //       content: 'Sorry, something went wrong. Please try again.'
  //     };
  //   }
  // }

  // Send message to API
  async function sendMessage(message, options = {}) {
    const { file } = options;
    try {
      const url = `https://kring.answer24.nl/api/v1/gemini-chat`;

      let body;
      let headers = {};

      if (file) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append("message", message || "");
        formData.append("file", file);
        formData.append("public_key", effectivePublicKey); // Pass public key for backend identification
        body = formData;
        // No Content-Type header for FormData (browser sets multipart/form-data automatically)
      } else {
        // JSON for text-only messages
        body = JSON.stringify({
          message,
          public_key: effectivePublicKey, // Pass public key for backend identification
        });
        headers = { "Content-Type": "application/json" };
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: HTTP ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Assume API returns { content: "response text" } or { response: "text" }
      return {
        content:
          data.content || data.response || "Response received successfully.",
      };
    } catch (error) {
      console.error("[Schepenkring.nlWidget] Error sending message:", error);
      return {
        content: "Sorry, something went wrong. Please try again.",
      };
    }
  }

  // Add message to chat
  function addMessage(text, sender = "bot") {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `answer24-message ${sender}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add file message
  function addFileMessage(text, sender = "bot", fileInfo = null) {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `answer24-message ${sender}`;

    const textDiv = document.createElement("div");
    textDiv.textContent = text;
    messageDiv.appendChild(textDiv);

    if (fileInfo) {
      const fileDiv = document.createElement("div");
      fileDiv.className = "answer24-file-preview";

      if (fileInfo.url && fileInfo.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = fileInfo.url;
        img.className = "answer24-file-img";
        fileDiv.appendChild(img);
      } else {
        const iconDiv = document.createElement("div");
        iconDiv.className = "answer24-file-icon";
        iconDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>`;
        fileDiv.appendChild(iconDiv);
      }

      const fileInfoDiv = document.createElement("div");
      fileInfoDiv.className = "answer24-file-info";
      fileInfoDiv.innerHTML = `
        <div class="answer24-file-name">${fileInfo.name}</div>
        <div class="answer24-file-size">${fileInfo.size}</div>
      `;
      fileDiv.appendChild(fileInfoDiv);

      messageDiv.appendChild(fileDiv);
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;

    const typingDiv = document.createElement("div");
    typingDiv.id = "answer24-typing-indicator";
    typingDiv.className = "answer24-typing";
    typingDiv.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
      <span class="answer24-typing-text">Schepenkring.nlis typing…</span>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typing = document.getElementById("answer24-typing-indicator");
    if (typing) typing.remove();
  }

  // Switch tabs
  function switchTab(tab) {
    activeTab = tab;
    const welcomeScreen = document.getElementById("answer24-welcome-screen");
    const chatScreen = document.getElementById("answer24-chat-screen");
    const backButton = document.getElementById("answer24-back-button");
    const scrollBtn = document.getElementById("answer24-scroll-btn");
    const chatFooterBtn = document.getElementById(
      "answer24-chat-button-footer",
    );

    if (tab === "home") {
      if (welcomeScreen) welcomeScreen.classList.add("show");
      if (chatScreen) chatScreen.classList.remove("show");
      if (backButton) backButton.classList.remove("show");
      if (scrollBtn) scrollBtn.classList.add("show");
      if (chatFooterBtn) chatFooterBtn.classList.add("show");
    } else {
      if (welcomeScreen) welcomeScreen.classList.remove("show");
      if (chatScreen) chatScreen.classList.add("show");
      if (backButton) backButton.classList.add("show");
      if (scrollBtn) scrollBtn.classList.remove("show");
      if (chatFooterBtn) chatFooterBtn.classList.remove("show");
    }
  }

  // Handle file selection
  function handleFileSelect(file) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    selectedFile = file;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        filePreview = reader.result;
        updateFilePreview();
      };
      reader.readAsDataURL(file);
    } else {
      filePreview = null;
      updateFilePreview();
    }
  }

  // Update file preview
  function updateFilePreview() {
    const inputArea = document.getElementById("answer24-input-area");
    if (!inputArea) return;

    // Remove existing preview
    const existingPreview = document.getElementById("answer24-file-preview");
    if (existingPreview) existingPreview.remove();

    if (selectedFile) {
      const previewDiv = document.createElement("div");
      previewDiv.id = "answer24-file-preview";
      previewDiv.style.position = "relative";
      previewDiv.style.padding = "12px";
      previewDiv.style.marginBottom = "8px";
      previewDiv.style.background = "#f9fafb";
      previewDiv.style.borderRadius = "8px";
      previewDiv.style.border = "1px solid #e5e7eb";
      previewDiv.style.display = "flex";
      previewDiv.style.alignItems = "center";
      previewDiv.style.gap = "8px";

      if (filePreview) {
        const img = document.createElement("img");
        img.src = filePreview;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        img.style.border = "1px solid #e5e7eb";
        previewDiv.appendChild(img);
      } else {
        const iconDiv = document.createElement("div");
        iconDiv.style.width = "40px";
        iconDiv.style.height = "40px";
        iconDiv.style.background = "#dbeafe";
        iconDiv.style.borderRadius = "4px";
        iconDiv.style.border = "1px solid #93c5fd";
        iconDiv.style.display = "flex";
        iconDiv.style.alignItems = "center";
        iconDiv.style.justifyContent = "center";
        iconDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>`;
        previewDiv.appendChild(iconDiv);
      }

      const infoDiv = document.createElement("div");
      infoDiv.style.display = "flex";
      infoDiv.style.flexDirection = "column";
      infoDiv.innerHTML = `
        <div style="font-size: 14px; font-weight: 500; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${
          selectedFile.name
        }</div>
        <div style="font-size: 12px; color: #6b7280;">${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)} MB</div>
      `;
      previewDiv.appendChild(infoDiv);

      const removeBtn = document.createElement("button");
      removeBtn.className = "answer24-file-remove";
      removeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      removeBtn.onclick = () => {
        selectedFile = null;
        filePreview = null;
        updateFilePreview();
      };
      previewDiv.appendChild(removeBtn);

      inputArea.insertBefore(previewDiv, inputArea.firstChild);
    }
  }

  // Start speech recognition
  function startSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById("answer24-input");
      if (input) {
        input.value = transcript;
        setTimeout(() => handleSendMessage(true), 100);
      }
      isListening = false;
      updateVoiceButton();
    };

    recognition.onerror = () => {
      isListening = false;
      updateVoiceButton();
    };

    recognition.onend = () => {
      isListening = false;
      updateVoiceButton();
    };

    recognition.start();
    isListening = true;
    updateVoiceButton();
  }

  // Update voice button state
  function updateVoiceButton() {
    const voiceBtn = document.getElementById("answer24-voice-button");
    if (voiceBtn) {
      if (isListening) {
        voiceBtn.classList.add("listening");
      } else {
        voiceBtn.classList.remove("listening");
      }
    }
  }

  // Handle send message
  async function handleSendMessage(fromVoice = false) {
    const input = document.getElementById("answer24-input");
    const message = input?.value.trim();

    if (!message && !selectedFile) return;

    // Add user message
    if (selectedFile) {
      const fileSize = (selectedFile.size / 1024 / 1024).toFixed(2) + " MB";
      addFileMessage(message || "File attachment", "user", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: fileSize,
        url: filePreview,
      });
    } else {
      addMessage(message, "user");
    }

    if (input) input.value = "";
    selectedFile = null;
    filePreview = null;
    updateFilePreview();

    // Show typing
    showTyping();

    // Send to API
    const response = await sendMessage(message);

    // Hide typing and show response
    hideTyping();
    addMessage(response.content, "bot");
  }

  // Handle option click
  function handleOptionClick(option) {
    switchTab("chat");
    addMessage(option, "user");
    showTyping();

    setTimeout(() => {
      hideTyping();
      const responses = {
        "What is answer24?":
          "Schepenkring.nlis your intelligent assistant platform designed to provide instant support and answers to your questions 24/7. We combine AI technology with human expertise to deliver accurate, helpful responses.",
        "Discover Schepenkring.nlPremium":
          "Schepenkring.nlPremium offers advanced features including priority support, extended conversation history, file analysis capabilities, and access to specialized knowledge domains. Would you like to learn more about upgrading?",
        "How can I log into my account?":
          "To log into your Schepenkring.nlaccount, visit our website and click 'Sign In' in the top right corner. You can use your email and password, or sign in with Google or Microsoft. Need help resetting your password?",
        "Contact support":
          "I'm here to help! You can chat with me directly, or if you need human support, you can email us at support@answer24.nl or call our helpline. What specific issue can I assist you with?",
      };

      const response =
        responses[option] || `Here's more information about: ${option}`;
      addMessage(response, "bot");
    }, 1200);
  }

  // Initialize widget
  async function initWidget() {
    await loadSettings();

    const container = document.createElement("div");
    try {
      container.innerHTML = createWidgetHTML();

      // Append style tag and widget container separately
      const styleTag = container.querySelector("style");
      const widgetRoot = container.querySelector("#answer24-widget-container");

      if (styleTag) document.head.appendChild(styleTag);
      if (widgetRoot) document.body.appendChild(widgetRoot);

      if (!widgetRoot) {
        console.error("[Schepenkring.nlWidget] Failed to inject widget");
        return;
      }
    } catch (err) {
      console.error(
        "[Schepenkring.nlWidget] Exception during widget DOM injection",
        err,
      );
      return;
    }

    // Attach event handlers
    const chatButton = document.getElementById("answer24-chat-button");
    const closeButton = document.getElementById("answer24-close-button");
    const chatWindow = document.getElementById("answer24-chat-window");
    const sendButton = document.getElementById("answer24-send-button");
    const input = document.getElementById("answer24-input");
    const fileInput = document.getElementById("answer24-file-input");
    const attachButton = document.getElementById("answer24-attach-button");
    const voiceButton = document.getElementById("answer24-voice-button");
    const muteButton = document.getElementById("answer24-mute-button");
    const backButton = document.getElementById("answer24-back-button");
    const chatFooterBtn = document.getElementById(
      "answer24-chat-button-footer",
    );
    const scrollBtn = document.getElementById("answer24-scroll-btn");
    const optionButtons = document.querySelectorAll(".answer24-option-button");

    if (chatButton && chatWindow) {
      chatButton.addEventListener("click", () => {
        isOpen = !isOpen;
        chatWindow.classList.toggle("open", isOpen);
        if (isOpen && input) input.focus();
      });
    }

    if (closeButton && chatWindow) {
      closeButton.addEventListener("click", () => {
        isOpen = false;
        chatWindow.classList.remove("open");
      });
    }

    if (sendButton) {
      sendButton.addEventListener("click", handleSendMessage);
    }

    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
      });
    }

    if (fileInput && attachButton) {
      attachButton.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        handleFileSelect(e.target.files[0]);
      });
    }

    if (voiceButton) {
      voiceButton.addEventListener("click", startSpeechRecognition);
    }

    if (muteButton) {
      muteButton.addEventListener("click", () => {
        isMuted = !isMuted;
        const iconOn = document.getElementById("answer24-mute-icon-on");
        const iconOff = document.getElementById("answer24-mute-icon-off");
        if (iconOn) iconOn.style.display = isMuted ? "none" : "block";
        if (iconOff) iconOff.style.display = isMuted ? "block" : "none";
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => switchTab("home"));
    }

    if (chatFooterBtn) {
      chatFooterBtn.addEventListener("click", () => switchTab("chat"));
    }

    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        const welcomeScreen = document.getElementById(
          "answer24-welcome-screen",
        );
        if (welcomeScreen) {
          welcomeScreen.scrollBy({ top: 200, behavior: "smooth" });
        }
      });
    }

    optionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const option = btn.dataset.option;
        if (option) handleOptionClick(option);
      });
    });

    // Listen for settings updates (only attach once using a flag)
    if (!window.__answer24_eventListenersAttached) {
      try {
        const handleSettingsUpdate = async () => {
          console.log(
            "[Schepenkring.nlWidget] Settings updated event received, reloading...",
          );
          await loadSettings(true); // Force reload with cache buster

          // Safely remove widget container
          const widgetContainer = document.getElementById(
            "answer24-widget-container",
          );
          if (widgetContainer && widgetContainer.parentNode) {
            const wasOpen = isOpen;
            try {
              // Safe removal - check if it's actually a child before removing
              if (
                widgetContainer.parentNode === document.body ||
                widgetContainer.parentNode.contains(widgetContainer)
              ) {
                widgetContainer.remove();
              } else {
                // Fallback: try to remove via parent
                widgetContainer.parentNode.removeChild(widgetContainer);
              }
            } catch (removeError) {
              console.warn(
                "[Schepenkring.nlWidget] Error removing container:",
                removeError,
              );
              // If removal fails, try to remove any existing container
              if (widgetContainer.parentNode) {
                widgetContainer.parentNode.removeChild(widgetContainer);
              }
            }

            // Reinitialize widget with new settings
            await initWidget();
            if (wasOpen) {
              const newWindow = document.getElementById("answer24-chat-window");
              if (newWindow) newWindow.classList.add("open");
              isOpen = true;
            }
          } else if (widgetContainer) {
            // Container exists but has no parent, just reinit
            await initWidget();
          } else {
            // No container, just reload settings
            await initWidget();
          }
        };

        window.addEventListener(
          "widget-settings-updated",
          handleSettingsUpdate,
        );

        // Also listen for visibility changes to reload settings when demo page is opened
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            console.log(
              "[Schepenkring.nlWidget] Page visible, checking for settings updates...",
            );
            loadSettings(true).catch((err) => {
              console.warn(
                "[Schepenkring.nlWidget] Error reloading settings on visibility change:",
                err,
              );
            });
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Mark as attached
        window.__answer24_eventListenersAttached = true;
      } catch (e) {
        console.error(
          "[Schepenkring.nlWidget] Error setting up event listeners:",
          e,
        );
      }
    }

    console.log("[Schepenkring.nlWidget] Initialized successfully");
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  // Expose global API
  window.Answer24Widget = {
    open: function () {
      const chatWindow = document.getElementById("answer24-chat-window");
      if (chatWindow) {
        isOpen = true;
        chatWindow.classList.add("open");
      }
    },
    close: function () {
      const chatWindow = document.getElementById("answer24-chat-window");
      if (chatWindow) {
        isOpen = false;
        chatWindow.classList.remove("open");
      }
    },
    sendMessage: function (message) {
      const input = document.getElementById("answer24-input");
      if (input) {
        input.value = message;
        handleSendMessage();
      }
    },
  };
})();
