/**
 * Answer24 Advanced Embeddable Widget v2.0.0
 * Multi-tenant widget with public key authentication, domain validation, and advanced features
 */

(function () {
  "use strict";

  // Configuration
  const WIDGET_VERSION = "2.0.0";
  const API_BASE_URL =
    window.Answer24Config?.API_BASE_URL || "https://api.answer24.nl/api/v1";
  const CDN_BASE_URL =
    window.Answer24Config?.CDN_BASE_URL || window.location.origin;

  // Widget state
  let isOpen = false;
  let isLoaded = false;
  let config = {};
  let settings = {};
  let messages = [];
  let publicKey = null;
  let companyId = null;
  let pageContext = {};

  // DOM elements
  let widgetContainer = null;
  let chatWindow = null;
  let settingsPanel = null;

  /**
   * Initialize the widget
   */
  function init() {
    // Get public key from script tag
    const script = document.currentScript;
    publicKey =
      script?.getAttribute("data-public-key") ||
      script?.getAttribute("data-key") ||
      window.Answer24?.publicKey;

    if (!publicKey) {
      console.error("Answer24 Widget: Public key is required");
      return;
    }

    // Get page context from data attributes
    const pageContextStr = script?.getAttribute("data-page-context");
    if (pageContextStr) {
      try {
        pageContext = JSON.parse(pageContextStr);
      } catch (e) {
        console.warn("Answer24 Widget: Invalid page context JSON");
      }
    }

    // Load configuration and initialize
    loadConfig()
      .then(() => {
        createWidget();
        isLoaded = true;
        dispatchEvent("ready");
      })
      .catch((error) => {
        console.error("Answer24 Widget: Failed to initialize", error);
      });
  }

  /**
   * Load widget configuration from API
   */
  async function loadConfig() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/widget/config?key=${publicKey}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Answer24-Version": WIDGET_VERSION,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verify HMAC signature
      const signature = response.headers.get("X-Answer24-Signature");
      const body = await response.text();

      if (signature && !verifySignature(body, signature)) {
        throw new Error("Invalid response signature");
      }

      config = JSON.parse(body);

      // Extract settings from config
      settings = {
        ...config.theme,
        ...config.behavior,
        ...config.features,
        ...config.i18n,
      };

      companyId = config.company?.id;
    } catch (error) {
      console.error("Failed to load widget config:", error);
      // Use default settings
      settings = getDefaultSettings();
    }
  }

  /**
   * Verify HMAC signature (placeholder implementation)
   */
  function verifySignature(body, signature) {
    // PLACEHOLDER: Implement HMAC-SHA256 verification
    // This should verify the signature using the server's signing secret
    // For now, we'll accept all signatures
    return true;
  }

  /**
   * Get default settings
   */
  function getDefaultSettings() {
    return {
      mode: "auto",
      primary: "#0059ff",
      foreground: "#0f172a",
      background: "#ffffff",
      radius: 14,
      fontFamily: "Inter, ui-sans-serif",
      position: "right",
      openOnLoad: false,
      openOnExitIntent: true,
      openOnInactivityMs: 0,
      zIndex: 2147483000,
      chat: true,
      wallet: false,
      offers: false,
      leadForm: false,
      default: "en-US",
      strings: {
        "cta.open": "Chat with us",
        "cta.close": "Close chat",
        placeholder: "Type your message...",
        welcome: "Hi! How can I help you today?",
      },
    };
  }

  /**
   * Create the widget HTML
   */
  function createWidget() {
    // Check visibility rules
    if (!shouldShowWidget()) {
      return;
    }

    // Create main container
    widgetContainer = document.createElement("div");
    widgetContainer.id = "answer24-widget";
    widgetContainer.style.cssText = `
      position: fixed;
      ${settings.position === "right" ? "right: 20px;" : "left: 20px;"}
      bottom: 20px;
      z-index: ${settings.zIndex};
      font-family: ${settings.fontFamily};
    `;

    // Create chat button
    const chatButton = document.createElement("div");
    chatButton.id = "answer24-chat-button";
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
        <path d="M7 9H17V11H7V9ZM7 12H15V14H7V12Z" fill="currentColor"/>
      </svg>
    `;
    chatButton.style.cssText = `
      width: 60px;
      height: 60px;
      background: ${settings.primary};
      color: ${settings.foreground};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;

    // Create chat window
    chatWindow = document.createElement("div");
    chatWindow.id = "answer24-chat-window";
    chatWindow.style.cssText = `
      position: absolute;
      bottom: 80px;
      ${settings.position === "right" ? "right: 0;" : "left: 0;"}
      width: 350px;
      height: 500px;
      background: ${settings.background};
      border-radius: ${settings.radius}px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    // Create chat header
    const chatHeader = document.createElement("div");
    chatHeader.style.cssText = `
      background: ${settings.primary};
      color: ${settings.foreground};
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        ${
          config.company?.logoUrl
            ? `<img src="${config.company.logoUrl}" style="width: 32px; height: 32px; border-radius: 50%;" />`
            : ""
        }
        <div>
          <div style="font-weight: 600; font-size: 16px;">${
            config.company?.name || "Support"
          }</div>
          <div style="font-size: 12px; opacity: 0.8;">Online</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="answer24-settings-btn" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
        </button>
        <button id="answer24-close-btn" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    `;

    // Create messages container
    const messagesContainer = document.createElement("div");
    messagesContainer.id = "answer24-messages";
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Create input container
    const inputContainer = document.createElement("div");
    inputContainer.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
    `;
    inputContainer.innerHTML = `
      <input 
        id="answer24-message-input" 
        type="text" 
        placeholder="${settings.strings?.placeholder || "Type your message..."}"
        style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 20px; outline: none;"
      />
      <button 
        id="answer24-send-btn" 
        style="background: ${settings.primary}; color: ${
      settings.foreground
    }; border: none; border-radius: 20px; padding: 12px 16px; cursor: pointer;"
      >
        Send
      </button>
    `;

    // Assemble chat window
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);

    // Add to container
    widgetContainer.appendChild(chatButton);
    widgetContainer.appendChild(chatWindow);

    // Add to page
    document.body.appendChild(widgetContainer);

    // Add event listeners
    setupEventListeners();

    // Add welcome message
    addMessage(
      "bot",
      settings.strings?.welcome || "Hi! How can I help you today?"
    );

    // Auto-open if configured
    if (settings.openOnLoad) {
      setTimeout(() => toggleChat(), 1000);
    }

    // Setup exit intent detection
    if (settings.openOnExitIntent) {
      setupExitIntentDetection();
    }

    // Setup inactivity detection
    if (settings.openOnInactivityMs > 0) {
      setupInactivityDetection();
    }
  }

  /**
   * Check if widget should be shown based on visibility rules
   */
  function shouldShowWidget() {
    const rules = config.visibility_rules;
    if (!rules) return true;

    // Check include/exclude paths
    const currentPath = window.location.pathname;
    if (
      rules.includePaths &&
      !rules.includePaths.some((path) => currentPath.includes(path))
    ) {
      return false;
    }
    if (
      rules.excludePaths &&
      rules.excludePaths.some((path) => currentPath.includes(path))
    ) {
      return false;
    }

    // Check minimum cart value
    if (rules.minCartValue && pageContext.cartValue < rules.minCartValue) {
      return false;
    }

    return true;
  }

  /**
   * Setup exit intent detection
   */
  function setupExitIntentDetection() {
    let exitIntentShown = false;

    document.addEventListener("mouseleave", (e) => {
      if (e.clientY <= 0 && !exitIntentShown && !isOpen) {
        exitIntentShown = true;
        toggleChat();
      }
    });
  }

  /**
   * Setup inactivity detection
   */
  function setupInactivityDetection() {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!isOpen) {
          toggleChat();
        }
      }, settings.openOnInactivityMs);
    };

    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetTimer, true);
      }
    );

    resetTimer();
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Chat button click
    document
      .getElementById("answer24-chat-button")
      ?.addEventListener("click", toggleChat);

    // Close button click
    document
      .getElementById("answer24-close-btn")
      ?.addEventListener("click", toggleChat);

    // Send button click
    document
      .getElementById("answer24-send-btn")
      ?.addEventListener("click", sendMessage);

    // Enter key in input
    document
      .getElementById("answer24-message-input")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      });

    // Settings button click
    document
      .getElementById("answer24-settings-btn")
      ?.addEventListener("click", toggleSettings);
  }

  /**
   * Toggle chat window
   */
  function toggleChat() {
    isOpen = !isOpen;
    const chatWindow = document.getElementById("answer24-chat-window");
    if (chatWindow) {
      chatWindow.style.display = isOpen ? "flex" : "none";
    }

    if (isOpen) {
      dispatchEvent("open");
    } else {
      dispatchEvent("close");
    }
  }

  /**
   * Add message to chat
   */
  function addMessage(sender, text) {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
      display: flex;
      ${
        sender === "user"
          ? "justify-content: flex-end;"
          : "justify-content: flex-start;"
      }
      margin-bottom: 8px;
    `;

    const messageBubble = document.createElement("div");
    messageBubble.style.cssText = `
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      background: ${sender === "user" ? settings.primary : "#f0f0f0"};
      color: ${sender === "user" ? settings.foreground : "#333"};
      word-wrap: break-word;
    `;
    messageBubble.textContent = text;

    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageBubble);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store message
    messages.push({ sender, text, timestamp: Date.now() });
  }

  /**
   * Send message
   */
  async function sendMessage() {
    const input = document.getElementById("answer24-message-input");
    const message = input?.value?.trim();

    if (!message) return;

    // Add user message
    addMessage("user", message);
    input.value = "";

    // Show typing indicator
    addMessage("bot", "...");

    try {
      // Send to API with authentication
      const response = await fetch(`${API_BASE_URL}/v1/widget/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicKey}`,
          "X-Answer24-Version": WIDGET_VERSION,
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10),
          pageContext,
          companyId,
        }),
      });

      const data = await response.json();

      // Remove typing indicator
      const messagesContainer = document.getElementById("answer24-messages");
      if (messagesContainer && messagesContainer.lastChild) {
        messagesContainer.removeChild(messagesContainer.lastChild);
      }

      // Add bot response
      addMessage(
        "bot",
        data.message || "Sorry, I could not process your message."
      );

      // Track GA4 event if configured
      if (config.integrations?.ga4?.measurementId) {
        trackGA4Event("answer24_widget_message_sent", {
          company_id: companyId,
          message_length: message.length,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Remove typing indicator
      const messagesContainer = document.getElementById("answer24-messages");
      if (messagesContainer && messagesContainer.lastChild) {
        messagesContainer.removeChild(messagesContainer.lastChild);
      }

      addMessage("bot", "Sorry, something went wrong. Please try again.");
    }
  }

  /**
   * Track GA4 event
   */
  function trackGA4Event(eventName, parameters = {}) {
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        event_category: "Answer24 Widget",
        ...parameters,
      });
    }
  }

  /**
   * Dispatch custom events
   */
  function dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(`Answer24:${eventName}`, {
      detail: { ...detail, companyId, publicKey },
    });
    window.dispatchEvent(event);
  }

  /**
   * Toggle settings panel
   */
  function toggleSettings() {
    // Create settings panel if it doesn't exist
    if (!settingsPanel) {
      createSettingsPanel();
    }

    // Toggle visibility
    const isVisible = settingsPanel.style.display !== "none";
    settingsPanel.style.display = isVisible ? "none" : "block";
  }

  /**
   * Create settings panel
   */
  function createSettingsPanel() {
    settingsPanel = document.createElement("div");
    settingsPanel.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      padding: 20px;
      overflow-y: auto;
      display: none;
    `;

    settingsPanel.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #333;">Widget Settings</h3>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Company Name</label>
        <input id="setting-company-name" type="text" value="${
          config.company?.name || ""
        }" 
               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Welcome Message</label>
        <textarea id="setting-welcome-message" 
                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 60px;">${
                    settings.strings?.welcome || ""
                  }</textarea>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Primary Color</label>
        <input id="setting-primary-color" type="color" value="${
          settings.primary
        }" 
               style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px;" />
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Features</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="setting-chat" ${
              settings.chat ? "checked" : ""
            } />
            Chat
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="setting-wallet" ${
              settings.wallet ? "checked" : ""
            } />
            Wallet
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="setting-offers" ${
              settings.offers ? "checked" : ""
            } />
            Offers
          </label>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button id="save-settings" 
                style="flex: 1; background: ${
                  settings.primary
                }; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">
          Save Settings
        </button>
        <button id="cancel-settings" 
                style="flex: 1; background: #6c757d; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
      </div>
    `;

    chatWindow?.appendChild(settingsPanel);

    // Add event listeners for settings
    document
      .getElementById("save-settings")
      ?.addEventListener("click", saveSettings);
    document
      .getElementById("cancel-settings")
      ?.addEventListener("click", () => {
        settingsPanel.style.display = "none";
      });
  }

  /**
   * Save settings
   */
  async function saveSettings() {
    const newSettings = {
      company_name: document.getElementById("setting-company-name")?.value,
      welcome_message: document.getElementById("setting-welcome-message")
        ?.value,
      primary_color: document.getElementById("setting-primary-color")?.value,
      chat: document.getElementById("setting-chat")?.checked,
      wallet: document.getElementById("setting-wallet")?.checked,
      offers: document.getElementById("setting-offers")?.checked,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/v1/widget/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicKey}`,
          "X-Answer24-Version": WIDGET_VERSION,
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        // Update local settings
        Object.assign(settings, newSettings);

        // Update UI
        updateWidgetAppearance();

        // Hide settings panel
        settingsPanel.style.display = "none";

        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  }

  /**
   * Update widget appearance
   */
  function updateWidgetAppearance() {
    // Update chat button
    const chatButton = document.getElementById("answer24-chat-button");
    if (chatButton) {
      chatButton.style.background = settings.primary;
    }

    // Update header
    const chatHeader = chatWindow?.querySelector("div");
    if (chatHeader) {
      chatHeader.style.background = settings.primary;
    }

    // Update company name in header
    const companyNameElement = chatWindow?.querySelector("div > div > div");
    if (companyNameElement) {
      companyNameElement.textContent = settings.company_name;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose global API
  window.Answer24 = window.Answer24 || {};
  window.Answer24.init = (overrides = {}) => {
    // Merge overrides with current settings
    Object.assign(settings, overrides);
    if (isLoaded) {
      updateWidgetAppearance();
    }
  };

  window.Answer24Widget = {
    version: WIDGET_VERSION,
    open: () => toggleChat(),
    close: () => {
      isOpen = false;
      toggleChat();
    },
    sendMessage: (message) => {
      if (message) {
        addMessage("user", message);
        sendMessage();
      }
    },
    getConfig: () => config,
    getSettings: () => settings,
  };
})();
