/**
 * Answer24 Embeddable Chat Widget
 * Version: 4.0.0 - SaaS Booking & Slot Management
 * * Usage:
 * <script src="https://yourdomain.com/widget/answer24-widget.js" data-public-key="YOUR_PUBLIC_KEY"></script>
 */

(function () {
  "use strict";

  // --- CONFIGURATION FROM SCRIPT TAG ---
  const scriptTag =
    document.currentScript || document.querySelector("script[data-public-key]");
  const publicKey = scriptTag?.getAttribute("data-public-key");
  let apiBase = scriptTag?.getAttribute("data-api-base");

  if (!apiBase) {
    const currentHost = window.location.host;
    if (currentHost.includes("localhost") || currentHost.startsWith("127.")) {
      apiBase = "https://api.answer24.nl/api/v1";
    } else {
      apiBase = "https://api.answer24.nl/api/v1";
    }
  }

  if (!publicKey) {
    console.error(
      "[Answer24 Widget] Error: data-public-key attribute is required. Continuing with fallback key.",
    );
  }

  console.log("[Answer24 Widget] Initializing with public key:", publicKey);

  // --- BOOKING STATE VARIABLES ---
  let bookingMode = 0; // 0 = Cashback, 1 = Booking
  let merchantId = null;
  let merchantName = "";

  // NEW: Slot Selection State
  let selectedDate = "";
  let selectedTime = "";

  // --- AUTHENTICATION STATE ---
  let auth = {
    isAuthenticated: false,
    userToken: null,
    userId: null,
  };

  function loadAuthState() {
    try {
      const storedAuth = localStorage.getItem("answer24_auth");
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        auth.isAuthenticated = true;
        auth.userToken = parsedAuth.userToken;
        auth.userId = parsedAuth.userId;
        console.log("[Answer24 Widget] User session loaded.");
      }
    } catch (e) {
      console.warn("[Answer24 Widget] Could not load auth state:", e);
    }
  }

  function saveAuthState(token, userId) {
    auth.isAuthenticated = true;
    auth.userToken = token;
    auth.userId = userId;
    localStorage.setItem(
      "answer24_auth",
      JSON.stringify({ userToken: token, userId: userId }),
    );
  }

  window.clearAuthState = function () {
    auth.isAuthenticated = false;
    auth.userToken = null;
    auth.userId = null;
    localStorage.removeItem("answer24_auth");
    switchTab("auth");
    window.toggleWidget(false);
    const logoutBtn = document.getElementById("answer24-logout-button");
    if (logoutBtn) logoutBtn.style.display = "none";
  };

  // --- WIDGET STATE ---
  let widgetSettings = null;
  let isOpen = false;
  let activeTab = "home";
  let messages = [];
  let selectedFile = null;
  let filePreview = null;
  let isMuted = true;
  let isListening = false;
  let pendingAction = null;

  // --- WELCOME OPTIONS ---
  const welcomeOptions = [
    { label: "Request Cashback", icon: "💰", action: "cashback" },
    {
      label: "What is answer24?",
      icon: "❓",
      action: "chat:What is answer24?",
    },
    { label: "Contact support", icon: "💬", action: "chat:Contact support" },
    {
      label: "How to use the cashback?",
      icon: "💡",
      action: "chat:How do I use the cashback feature?",
    },
  ];

  let effectivePublicKey = publicKey;
  if (!effectivePublicKey || effectivePublicKey === "demo-key-123") {
    effectivePublicKey = "PUB_demo_testkey";
    console.warn(
      "[Answer24 Widget] Using fallback demo public key: PUB_demo_testkey",
    );
  }

  // --- DOMAIN INITIALIZATION API ---
  async function initDomain() {
    try {
      const hostname = window.location.hostname;
      const response = await fetch(`${apiBase}/widget/init?domain=${hostname}`);
      if (response.ok) {
        const data = await response.json();
        bookingMode = data.booking_mode || 0;
        merchantId = data.merchant_id;
        merchantName = data.merchant_name || "";

        if (bookingMode === 1) {
          const cashbackOpt = welcomeOptions.find(
            (opt) => opt.action === "cashback",
          );
          if (cashbackOpt) {
            cashbackOpt.label = "Book a Table";
            cashbackOpt.icon = "📅";
          }
        }
      }
    } catch (err) {
      console.warn("[Answer24 Widget] Domain init failed:", err);
    }
  }

  // --- UTILITY: ALERT BOX ---
  function showAlert(message, isError = false) {
    const alertEl = document.getElementById("answer24-alert-box");
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.style.display = "block";
      alertEl.style.backgroundColor = isError ? "#fee2e2" : "#d1fae5";
      alertEl.style.color = isError ? "#991b1b" : "#065f46";
      setTimeout(() => {
        alertEl.style.display = "none";
      }, 4000);
    }
  }

  // --- SETTINGS LOGIC ---
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

  async function loadSettings(forceReload = false) {
    try {
      const cacheBuster = forceReload ? `&_t=${Date.now()}` : "";
      const url = `${apiBase}/widget/config?key=${encodeURIComponent(effectivePublicKey)}${cacheBuster}`;
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
          try {
            localStorage.setItem(
              "widget-settings",
              JSON.stringify(widgetSettings),
            );
          } catch (e) {}

          const existingContainer = document.getElementById(
            "answer24-widget-container",
          );
          if (existingContainer && existingContainer.parentNode) {
            const wasOpen = isOpen;
            existingContainer.remove();
            await initWidget();
            if (wasOpen) {
              const newWindow = document.getElementById("answer24-chat-window");
              if (newWindow) newWindow.classList.add("open");
              isOpen = true;
            }
          } else if (existingContainer) {
            await initWidget();
          }
          return;
        }
      }
    } catch (apiErr) {
      console.warn("[Answer24 Widget] Failed to fetch settings", apiErr);
    }

    try {
      const localSettings = localStorage.getItem("widget-settings");
      if (localSettings) {
        widgetSettings = JSON.parse(localSettings);
        return;
      }
    } catch (e) {}
    widgetSettings = mergeWithDefaults({});
  }

  // --- PAGE CONTEXT LOGIC ---
  function collectPageContext() {
    return { domain: window.location.hostname, pageTitle: document.title };
  }

  // --- GEMINI AI & CHAT LOGIC ---
  const predefinedResponses = {
    "What is answer24?":
      "answer24 is an all-in-one smart widget that provides AI-powered chat support, loyalty features like cashback, and personalized interactions.",
    "Contact support":
      "For direct support, please visit our dedicated help center at [https://support.answer24.nl](https://support.answer24.nl) or email us directly at support@answer24.nl.",
    "How do I use the cashback feature?":
      "Simply click the 'Request Cashback' button, log in, and submit your purchase amount. Once verified, it is added to your account.",
  };

  // async function sendMessage(message, options = {}, pageContext = null) {
  //   const { file } = options;
  //   if (!file && predefinedResponses[message]) {
  //     return { content: predefinedResponses[message] };
  //   }

  //   try {
  //     const url = `${apiBase}/gemini-chat`;
  //     let body;
  //     let headers = {};

  //     if (file) {
  //       const formData = new FormData();
  //       formData.append("message", message || "");
  //       formData.append("file", file);
  //       formData.append("public_key", effectivePublicKey);
  //       if (pageContext) {
  //         formData.append("page_context_domain", pageContext.domain);
  //         formData.append("page_context_title", pageContext.pageTitle);
  //       }
  //       body = formData;
  //     } else {
  //       body = JSON.stringify({
  //         message,
  //         public_key: effectivePublicKey,
  //         ...(pageContext ? { page_context: pageContext } : {}),
  //       });
  //       headers = { "Content-Type": "application/json" };
  //     }

  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: { ...headers, ...(auth.userToken ? { Authorization: `Bearer ${auth.userToken}` } : {}) },
  //       body,
  //     });

  //     if (!response.ok) throw new Error(`API request failed: HTTP ${response.status}`);
  //     const data = await response.json();
  //     return { content: data.content || data.response || "Response received successfully." };
  //   } catch (error) {
  //     console.error("[Answer24 Widget] Error sending message:", error);
  //     return { content: "Sorry, something went wrong connecting to the AI. Please try again." };
  //   }
  // }

  async function sendMessage(message, options = {}, pageContext = null) {
    const { file } = options;
    if (!file && predefinedResponses[message]) {
      return { content: predefinedResponses[message] };
    }

    // --- GEMINI CONFIGURATION ---
    const apiKey = "AIzaSyAduyL7LphdJl5RVHkUuWAuhw_73dX0yqk";
    const model = "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      // 1. Prepare the Identity Training (System Instructions)
      const domain = pageContext?.domain || window.location.hostname;
      const title = pageContext?.pageTitle || document.title;

      const systemInstruction = `
        You are a helpful AI assistant integrated into the website: ${domain} (Title: ${title}).
        
        IDENTITY RULES:
        1. If the user asks about the website, where they are, or what this company does, answer as an assistant for ${domain}. Use the website domain and title to provide context.
        2. If the user asks about 'Answer24', explain that Answer24 is the technology company that provides this AI chat widget and automation tools for businesses.
        3. Keep your tone professional, helpful, and concise.
      `;

      // 2. Build the Payload for Gemini
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `SYSTEM INSTRUCTION: ${systemInstruction}` },
              { text: `USER MESSAGE: ${message}` },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        },
      };

      // 3. Handle File (Multi-modal) if exists
      if (file) {
        // Note: For pure JS file uploads to Gemini, files must be converted to Base64
        // and sent in the 'inline_data' part.
        const base64File = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(file);
        });

        payload.contents[0].parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64File,
          },
        });
      }

      // 4. Execute Fetch
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Extract the text from Gemini's response structure
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response.";

      return { content: aiText };
    } catch (error) {
      console.error("[Answer24 Widget] AI Error:", error);
      return {
        content:
          "Sorry, I am having trouble connecting to my brain. Please check your connection and try again.",
      };
    }
  }

  function addMessage(text, sender = "bot") {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;
    const messageDiv = document.createElement("div");
    messageDiv.className = `answer24-message ${sender}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

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
        iconDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
        fileDiv.appendChild(iconDiv);
      }
      const fileInfoDiv = document.createElement("div");
      fileInfoDiv.className = "answer24-file-info";
      fileInfoDiv.innerHTML = `<div class="answer24-file-name">${fileInfo.name}</div><div class="answer24-file-size">${fileInfo.size}</div>`;
      fileDiv.appendChild(fileInfoDiv);
      messageDiv.appendChild(fileDiv);
    }
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const messagesContainer = document.getElementById("answer24-messages");
    if (!messagesContainer) return;
    const typingDiv = document.createElement("div");
    typingDiv.id = "answer24-typing-indicator";
    typingDiv.className = "answer24-typing";
    typingDiv.innerHTML = `<span></span><span></span><span></span><span class="answer24-typing-text">answer24 is typing…</span>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById("answer24-typing-indicator");
    if (typing) typing.remove();
  }

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

  function updateFilePreview() {
    const inputArea = document.getElementById("answer24-input-area");
    if (!inputArea) return;
    const existingPreview = document.getElementById("answer24-file-preview");
    if (existingPreview) existingPreview.remove();

    if (selectedFile) {
      const previewDiv = document.createElement("div");
      previewDiv.id = "answer24-file-preview";
      previewDiv.style.cssText =
        "position:relative; padding:12px; margin-bottom:8px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:8px;";
      let iconHtml = "";
      if (filePreview) {
        iconHtml = `<img src="${filePreview}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid #e5e7eb;">`;
      } else {
        iconHtml = `<div style="width:40px; height:40px; background:#dbeafe; border-radius:4px; border:1px solid #93c5fd; display:flex; align-items:center; justifyContent:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg></div>`;
      }
      previewDiv.innerHTML = `
        ${iconHtml}
        <div style="display:flex; flex-direction:column;">
            <div style="font-size:14px; font-weight:500; color:#374151; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${selectedFile.name}</div>
            <div style="font-size:12px; color:#6b7280;">${(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
        <button class="answer24-file-remove" style="position:absolute; top:8px; right:8px; background:transparent; border:none; cursor:pointer;" onclick="this.parentElement.remove(); window.clearSelectedFile();">✕</button>
      `;
      window.clearSelectedFile = function () {
        selectedFile = null;
        filePreview = null;
      };
      inputArea.insertBefore(previewDiv, inputArea.firstChild);
    }
  }

  function startSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
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
        setTimeout(() => handleSendMessage(), 100);
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

  function updateVoiceButton() {
    const voiceBtn = document.getElementById("answer24-voice-button");
    if (voiceBtn) {
      if (isListening) voiceBtn.classList.add("listening");
      else voiceBtn.classList.remove("listening");
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById("answer24-input");
    const message = input?.value.trim();
    if (!message && !selectedFile) return;

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
    const fileToSend = selectedFile;
    selectedFile = null;
    filePreview = null;
    updateFilePreview();
    const pageContext = collectPageContext();
    showTyping();
    const response = await sendMessage(
      message,
      { file: fileToSend },
      pageContext,
    );
    hideTyping();
    addMessage(response.content, "bot");
  }

  // --- FEATURE & UI NAVIGATION ---
  window.handleOptionClick = function (action) {
    if (action === "cashback") {
      if (!auth.isAuthenticated) {
        pendingAction = action;
        switchTab("auth");
        showAlert(
          bookingMode === 1
            ? "🔒 Please log in to book"
            : "🔒 Please log in to request cashback",
        );
      } else {
        switchTab("cashback");
        if (bookingMode === 1) window.renderBookingForm();
        else window.renderCashbackForm();
      }
    } else if (action.startsWith("chat:")) {
      const message = action.substring(5);
      switchTab("chat");
      const input = document.getElementById("answer24-input");
      if (input) {
        input.value = message;
        setTimeout(() => handleSendMessage(), 100);
      }
    } else if (action === "chat") {
      switchTab("chat");
    }
  };

  window.handleAuthSubmit = async function (e, type) {
    e.preventDefault();
    const btn = e.target;
    const form = btn.parentElement;
    if (type !== "login") return;

    const originalText = btn.textContent;
    btn.textContent = "Processing...";
    btn.disabled = true;

    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
      const response = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showAlert("❌ Login failed. Please check credentials.", true);
        throw new Error("Auth failed");
      }

      const responseData = data.data || data;
      const token = responseData.token;
      const userId = responseData.user?.id || "unknown";

      if (token) {
        saveAuthState(token, userId);
        showAlert("✅ Success! You are logged in.", false);
        const logoutBtn = document.getElementById("answer24-logout-button");
        if (logoutBtn) logoutBtn.style.display = "block";

        if (pendingAction === "cashback") {
          switchTab("cashback");
          if (bookingMode === 1) window.renderBookingForm();
          else window.renderCashbackForm();
        } else {
          switchTab("home");
        }
        pendingAction = null;
      }
    } catch (error) {
      if (!error.message.includes("Auth failed"))
        showAlert("❌ Network error.", true);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  // --- UPDATED: 15-MINUTE SLOT GENERATOR & CAPACITY CHECK ---
  // window.loadSlots = async function() {
  //     const dateInput = document.getElementById("answer24-booking-date");
  //     const guestsInput = document.getElementById("answer24-booking-guests");
  //     const slotsContainer = document.getElementById("answer24-slots-grid");
  //     const msg = document.getElementById("answer24-slots-msg");

  //     if (!dateInput || !dateInput.value || !guestsInput.value) return;

  //     const selectedDate = dateInput.value;
  //     const currentPartySize = parseInt(guestsInput.value || 2);

  //     slotsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;"><div class="answer24-spinner"></div></div>';
  //     msg.textContent = "Checking availability...";

  //     try {
  //         // IMPORTANT: We add the headers here to prevent Laravel from redirecting to /
  // const currentDomain = window.location.hostname;

  //     const res = await fetch(`${apiBase}/widget/slots?merchant_id=${merchantId}&date=${selectedDate}&party_size=${currentPartySize}&domain=${currentDomain}`, {
  //         method: 'GET',
  //         headers: {
  //             'Accept': 'application/json',
  //             'Content-Type': 'application/json'
  //         }
  //     });

  //     // const data = await res.json();

  //         // If it still tries to redirect, catch it here
  //         if (res.redirected) {
  //             console.error("The API redirected to:", res.url);
  //             throw new Error("API Redirected. Check if the URL is correct and public.");
  //         }

  //         const data = await res.json();

  //         if (data.success && data.slots && data.slots.length > 0) {
  //             const availableSlots = data.slots.filter(s => parseInt(s.remaining) >= currentPartySize);

  //             if (availableSlots.length === 0) {
  //                 slotsContainer.innerHTML = "";
  //                 msg.textContent = `No capacity for ${currentPartySize} guests.`;
  //                 return;
  //             }

  //             msg.textContent = "Select a time:";
  //             slotsContainer.innerHTML = availableSlots.map(slot => `
  //                 <button type="button" class="answer24-slot-btn" onclick="window.selectSlot('${slot.time}', this)">
  //                     ${slot.time}
  //                 </button>
  //             `).join("");
  //         } else {
  //             slotsContainer.innerHTML = "";
  //             msg.textContent = "No slots found for this date.";
  //         }
  //     } catch (err) {
  //         console.error("[Answer24] Slot fetch error:", err);
  //         msg.textContent = "Error connecting to booking server.";
  //         msg.style.color = "red";
  //     }
  // };
  // window.loadSlots = async function() {
  //     const dateInput = document.getElementById("answer24-booking-date");
  //     const guestsInput = document.getElementById("answer24-booking-guests");
  //     const slotsContainer = document.getElementById("answer24-slots-grid");
  //     const msg = document.getElementById("answer24-slots-msg");

  //     if (!dateInput || !dateInput.value || !guestsInput.value) return;

  //     const selectedDate = dateInput.value;
  //     const currentPartySize = parseInt(guestsInput.value || 2);

  //     // Get current time to grey out past slots
  //     const now = new Date();
  //     const isToday = new Date(selectedDate).toDateString() === now.toDateString();
  //     const currentTimeString = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

  //     slotsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;"><div class="answer24-spinner"></div></div>';
  //     msg.textContent = "Checking availability...";

  //     try {
  //         const res = await fetch(`${apiBase}/widget/slots?merchant_id=${merchantId}&date=${selectedDate}&party_size=${currentPartySize}&domain=${window.location.hostname}`, {
  //             method: 'GET',
  //             headers: { 'Accept': 'application/json' }
  //         });

  //         const data = await res.json();

  //         if (data.success && data.slots && data.slots.length > 0) {
  //             const availableSlots = data.slots.filter(s => parseInt(s.remaining) >= currentPartySize);

  //             if (availableSlots.length === 0) {
  //                 slotsContainer.innerHTML = "";
  //                 msg.textContent = `No capacity for ${currentPartySize} guests.`;
  //                 return;
  //             }

  //             msg.textContent = "Select a time:";
  //             slotsContainer.innerHTML = availableSlots.map(slot => {
  //                 // Check if slot has passed
  //                 const hasPassed = isToday && slot.time < currentTimeString;

  //                 return `
  //                     <button
  //                         type="button"
  //                         class="answer24-slot-btn"
  //                         ${hasPassed ? 'disabled style="opacity:0.3; cursor:not-allowed; background:#e2e8f0; color:#94a3b8; border:none;"' : ''}
  //                         onclick="window.selectSlot('${slot.time}', this)"
  //                     >
  //                         ${slot.time}
  //                     </button>
  //                 `;
  //             }).join("");
  //         } else {
  //             slotsContainer.innerHTML = "";
  //             msg.textContent = "Restaurant closed on this date.";
  //         }
  //     } catch (err) {
  //         msg.textContent = "Error loading slots.";
  //     }
  // };
  // // Add this helper to handle the button selection
  // window.selectSlot = function(time, btn) {
  //     // 1. Update UI
  //     document.querySelectorAll('.answer24-slot-btn').forEach(b => {
  //         b.classList.remove('active');
  //         b.style.background = "";
  //         b.style.color = "";
  //     });
  //     btn.classList.add('active');
  //     btn.style.background = "#2563eb";
  //     btn.style.color = "white";

  //     // 2. Update BOTH scopes to be safe
  //     selectedTime = time;        // Updates the local let
  //     window.selectedTime = time; // Updates the window object

  //     const msg = document.getElementById("answer24-slots-msg");
  //     if(msg) msg.textContent = "Time selected: " + time;
  // };

  window.loadSlots = async function () {
    const dateInput = document.getElementById("answer24-booking-date");
    const guestsInput = document.getElementById("answer24-booking-guests");
    const slotsGrid = document.getElementById("answer24-slots-grid");
    const msg = document.getElementById("answer24-slots-msg");

    if (!dateInput?.value || !guestsInput?.value) return;

    // --- CRITICAL: Update global state ---
    selectedDate = dateInput.value;
    selectedTime = null; // Reset time selection when date changes

    const currentPartySize = parseInt(guestsInput.value);

    // SMART LOGIC: Get current time to grey out past slots
    const now = new Date();
    const isToday =
      new Date(selectedDate).toDateString() === now.toDateString();
    const currentTimeStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    slotsGrid.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; padding:20px;"><div class="answer24-spinner"></div></div>';
    msg.textContent = "Checking availability...";

    try {
      const res = await fetch(
        `${apiBase}/widget/slots?merchant_id=${merchantId}&date=${selectedDate}&party_size=${currentPartySize}&domain=${window.location.hostname}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );
      const data = await res.json();

      if (data.success && data.slots && data.slots.length > 0) {
        const availableSlots = data.slots.filter(
          (s) => parseInt(s.remaining) >= currentPartySize,
        );

        if (availableSlots.length === 0) {
          slotsGrid.innerHTML = "";
          msg.textContent = "No capacity for this party size.";
          return;
        }

        msg.textContent = "Select a time:";
        slotsGrid.innerHTML = availableSlots
          .map((slot) => {
            // Check if slot has already passed
            const hasPassed = isToday && slot.time < currentTimeStr;

            return `
                    <button type="button" class="answer24-slot-btn" 
                        ${hasPassed ? 'disabled style="opacity:0.3; cursor:not-allowed; background:#eee;"' : ""}
                        onclick="window.selectSlot('${slot.time}', this)">
                        ${slot.time}
                    </button>
                `;
          })
          .join("");
      } else {
        slotsGrid.innerHTML = "";
        msg.textContent = "No slots available for this date.";
      }
    } catch (err) {
      msg.textContent = "Error loading slots.";
    }
  };

  window.selectSlot = function (time, btn) {
    // 1. UI: Remove active state from others
    document
      .querySelectorAll(".answer24-slot-btn")
      .forEach((b) => b.classList.remove("active"));

    // 2. UI: Add active state to clicked
    btn.classList.add("active");

    // 3. --- CRITICAL: Save to the global variable your submit function uses ---
    selectedTime = time;

    // 4. Update message
    const msg = document.getElementById("answer24-slots-msg");
    if (msg) {
      msg.textContent = "Selected: " + time;
      msg.style.color = widgetSettings.theme.primary;
    }
  };
  // --- NEW: BOOKING UI FORM ---
  function getBookingFormHTML() {
    const theme = widgetSettings.theme;
    return `
      <h3 style="text-align:center; color:${theme.primary}; margin-bottom:10px;">Book a Table</h3>
      <p style="color:#6b7280; font-size:14px; text-align:center; margin-bottom:15px;">
        Reserve your spot at ${merchantName || "the venue"}.
      </p>
      <form class="answer24-form" onsubmit="window.handleBookingSubmit(event)">
        <input type="text" id="answer24-booking-name" placeholder="Guest Name" class="answer24-input-field" required>
        
        <div style="display:flex; gap:10px;">
           <input type="date" id="answer24-booking-date" class="answer24-input-field" style="flex:1" onchange="window.loadSlots()" required>
           <input type="number" id="answer24-booking-guests" placeholder="Pax" value="2" min="1" class="answer24-input-field" style="width:70px" onchange="window.loadSlots()" required>
        </div>

        <p id="answer24-slots-msg" style="text-align:center; font-size:12px; color:#6b7280; margin:5px 0;">Select date to see times</p>
        <div id="answer24-slots-grid" class="answer24-slots-grid"></div>

        <textarea id="answer24-booking-notes" placeholder="Special Requests (Optional)" class="answer24-input-field" style="height:60px; resize:none;"></textarea>
        <button type="submit" class="answer24-primary-btn">Confirm Reservation</button>
      </form>
    `;
  }

  window.renderBookingForm = function () {
    const container = document.getElementById("answer24-cashback-content");
    if (container) container.innerHTML = getBookingFormHTML();
    // Set default date to today for convenience
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("answer24-booking-date");
    if (dateInput) {
      dateInput.min = today;
    }
  };

  // --- NEW: SUBMIT LOGIC (Fixing 422 Error) ---
  window.handleBookingSubmit = async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    if (!selectedTime || !selectedDate) {
      showAlert("❌ Please select a time slot", true);
      return;
    }

    // MANUAL FORMATTING: "YYYY-MM-DD HH:mm:00"
    // This strictly enforces the format Laravel expects, bypassing browser "T" issues.
    const formattedTime = `${selectedDate} ${selectedTime}:00`;

    const payload = {
      user_id: merchantId,
      guest_name: document.getElementById("answer24-booking-name").value,
      party_size: parseInt(
        document.getElementById("answer24-booking-guests").value,
      ),
      reservation_time: formattedTime,
      notes: document.getElementById("answer24-booking-notes").value,
      domain: window.location.hostname,
    };

    const originalText = btn.textContent;
    btn.textContent = "Reserving...";
    btn.disabled = true;

    try {
      const response = await fetch(`${apiBase}/widget/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${auth.userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const container = document.getElementById("answer24-cashback-content");
        container.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                  <h3 style="color:${widgetSettings.theme.primary};">Booking Confirmed!</h3>
                  <p style="color:#6b7280; font-size:14px;">We look forward to seeing you, ${payload.guest_name}.</p>
                  <p style="font-weight:bold; margin-top:5px;">${selectedDate} at ${selectedTime}</p>
                  <button class="answer24-secondary-btn" onclick="window.renderBookingForm()" style="margin-top:20px; width:100%">New Booking</button>
              </div>`;
      } else {
        const errorData = await response.json();
        console.error("Validation Error:", errorData);
        showAlert(
          "❌ Reservation failed: " + (errorData.message || "Invalid data"),
          true,
        );
      }
    } catch (err) {
      console.error("Network Error:", err);
      showAlert("❌ Network error. Please try again.", true);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  // --- CASHBACK LOGIC (UNCHANGED) ---
  function getCashbackFormHTML() {
    const theme = widgetSettings.theme;
    return `
      <h3 style="text-align:center; color:${theme.primary}; margin-bottom:10px;">Request Cashback</h3>
      <p style="color:#6b7280; font-size:14px; text-align:center; width:100%;">Enter your purchase details below to submit a claim for review.</p>
      <form class="answer24-form" onsubmit="window.handleCashbackSubmit(event)">
        <input type="number" id="answer24-cashback-amount" placeholder="Purchase Amount (e.g. 150.99)" class="answer24-input-field" step="0.01" required>
        <input type="text" id="answer24-cashback-txn-id" placeholder="Transaction ID / Receipt Number" class="answer24-input-field" required>
        <button type="submit" class="answer24-primary-btn">Submit Request</button>
      </form>
      <p style="font-size:12px; color:#9ca3af; text-align:center; margin-top:10px;">All requests are subject to verification.</p>
    `;
  }

  window.renderCashbackForm = function () {
    const container = document.getElementById("answer24-cashback-content");
    if (container) container.innerHTML = getCashbackFormHTML();
  };

  function renderCashbackSuccess(amount, transactionId, domainName, status) {
    const container = document.getElementById("answer24-cashback-content");
    const theme = widgetSettings.theme;
    if (container) {
      container.innerHTML = `
          <div style="text-align: center; padding: 20px;">
              <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
              <h3 style="color:${theme.primary}; margin:0 0 10px 0;">Request Received!</h3>
              <p style="color:#6b7280; font-size:14px; margin-bottom:5px;">
                 Your request for <b>$${amount}</b> (ID: <b>${transactionId}</b>) has been recorded.
              </p>
              <button class="answer24-primary-btn" onclick="window.renderCashbackForm()" style="margin-top:20px; width:100%">Request Another Cashback</button>
              <button class="answer24-secondary-btn" onclick="switchTab('home')" style="margin-top:10px; width:100%">Back to Home</button>
          </div>
      `;
    }
  }

  window.handleCashbackSubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const amount = document.getElementById("answer24-cashback-amount").value;
    const transactionId = document.getElementById(
      "answer24-cashback-txn-id",
    ).value;

    if (!auth.isAuthenticated) {
      showAlert("🔒 Log in required.", true);
      switchTab("auth");
      return;
    }

    const originalText = btn.textContent;
    btn.textContent = "Submitting...";
    btn.disabled = true;

    try {
      const response = await fetch(`${apiBase}/cashback/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${auth.userToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          transaction_id: transactionId,
          domain: window.location.hostname,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        clearAuthState();
        showAlert("Session expired.", true);
        return;
      }
      if (!response.ok) throw new Error("Cashback failed");
      renderCashbackSuccess(
        amount,
        transactionId,
        window.location.hostname,
        data.status,
      );
    } catch (error) {
      showAlert("❌ Submission failed.", true);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  window.switchTab = function (tab) {
    if (tab === "home") tab = "welcome";
    activeTab = tab;
    ["welcome", "chat", "auth", "cashback"].forEach((t) => {
      const el = document.getElementById(`answer24-${t}-screen`);
      if (el) el.classList.remove("show");
    });
    const activeEl = document.getElementById(`answer24-${tab}-screen`);
    if (activeEl) activeEl.classList.add("show");
    const backBtn = document.getElementById("answer24-back-button");
    if (backBtn) {
      if (tab === "home" || tab === "welcome") backBtn.classList.remove("show");
      else backBtn.classList.add("show");
    }
    const inputArea = document.getElementById("answer24-input-area");
    if (inputArea) inputArea.style.display = tab === "chat" ? "flex" : "none";
  };

  // --- HTML GENERATION ---
  function createWidgetHTML() {
    const theme = widgetSettings.theme;
    const behavior = widgetSettings.behavior;
    const strings = widgetSettings.i18n.strings;
    const position =
      behavior.position === "left" ? "left: 24px;" : "right: 24px;";

    // SVG Avatars
    const primaryAvatarSVG =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='" +
      encodeURIComponent(theme.primary) +
      "'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
    const secondaryAvatarSVG =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='" +
      encodeURIComponent(theme.primary) +
      "'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white'%3E%F0%9F%91%A5%3C/text%3E%3C/svg%3E";
    const tertiaryAvatarSVG =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='" +
      encodeURIComponent(theme.primary) +
      "'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white'%3E%F0%9F%92%AC%3C/text%3E%3C/svg%3E";

    return `
      <style>
        #answer24-widget-container * { box-sizing: border-box; font-family: ${theme.fontFamily}; }
        @keyframes floaty { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-8px) scale(1.05); } 100% { transform: translateY(0px) scale(1); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        #answer24-chat-button { position: fixed; bottom: 24px; ${position} width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary}, #1e293b); color: ${theme.foreground}; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: ${behavior.zIndex}; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
        #answer24-chat-button:hover { transform: scale(1.05); }
        #answer24-chat-button.open { animation: floaty 3s ease-in-out infinite; }
        #answer24-chat-button .answer24-status-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 3px solid ${theme.primary}; opacity: 0; animation: pulse-ring 2s ease-out infinite; }
        #answer24-chat-button .answer24-icon-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        #answer24-chat-window { position: fixed; bottom: 96px; ${position} width: 360px; height: 80vh; max-height: 600px; background: ${theme.background}; border-radius: ${theme.radius}px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index: ${behavior.zIndex}; display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out; transform: translateY(20px) scale(0.95); opacity: 0; pointer-events: none; }
        #answer24-chat-window.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
        #answer24-chat-header { background: linear-gradient(90deg, ${theme.primary}, #1e293b); color: ${theme.foreground}; padding: 16px; display: flex; flex-direction: column; border-top-left-radius: ${theme.radius}px; border-top-right-radius: ${theme.radius}px; }
        .answer24-header-top { display: flex; align-items: center; width: 100%; }
        .answer24-back-button { background: transparent; border: none; color: ${theme.foreground}; cursor: pointer; padding: 4px; border-radius: 4px; margin-right: 8px; transition: background 0.2s; opacity: 0; pointer-events: none; }
        .answer24-back-button.show { opacity: 1; pointer-events: all; }
        .answer24-avatars { display: flex; gap: -8px; }
        .answer24-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${theme.foreground}; margin-left: -8px; z-index: 1; }
        .answer24-header-title { font-size: 20px; font-weight: bold; margin-left: 8px; }
        .answer24-header-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .answer24-mute-button { background: transparent; border: none; color: ${theme.foreground}; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
        .answer24-mute-button:hover { background: rgba(255,255,255,0.2); }
        .answer24-status-line { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .answer24-status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .answer24-status-text { font-size: 14px; }
        #answer24-content-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .answer24-screen { display: none; flex: 1; flex-direction: column; overflow-y: auto; padding: 16px; }
        .answer24-screen.show { display: flex; }
        #answer24-welcome-screen { padding: 32px 24px; align-items: center; justify-content: flex-start; }
        .answer24-welcome-title { color: ${theme.primary}; font-weight: 600; font-size: 18px; margin-bottom: 4px; }
        .answer24-welcome-subtitle { color: #4b5563; font-size: 14px; margin-bottom: 12px; text-align: center; }
        .answer24-options { width: 100%; max-width: 95%; display: flex; flex-direction: column; gap: 8px; }
        .answer24-option-button { width: 100%; text-align: left; padding: 12px 16px; border-radius: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; }
        .answer24-option-button:hover { background: #e0e7ff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transform: scale(1.02); }
        .answer24-option-icon { font-size: 18px; }
        .answer24-option-arrow { color: ${theme.primary}; font-weight: bold; }
        .answer24-form { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .answer24-input-field { padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; font-size: 16px; }
        .answer24-input-field:focus { border-color: ${theme.primary}; }
        .answer24-primary-btn { padding: 12px; background: ${theme.primary}; color: ${theme.foreground}; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .answer24-primary-btn:hover { background: #1e40af; }
        .answer24-secondary-btn { padding: 8px; background: transparent; color: ${theme.primary}; border: none; font-size: 14px; cursor: pointer; }
        
        /* NEW STYLES FOR SLOT GRID */
        .answer24-slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px; max-height: 200px; overflow-y: auto; }
        .answer24-slot-btn { padding: 8px 4px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 12px; transition: 0.2s; text-align: center; }
        .answer24-slot-btn:hover { border-color: ${theme.primary}; color: ${theme.primary}; }
        .answer24-slot-btn.active { background: ${theme.primary}; color: white; border-color: ${theme.primary}; }
        .answer24-slot-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f3f4f6; }
        /* END NEW STYLES */

        #answer24-messages { display: flex; flex-direction: column; gap: 12px; padding: 16px; overflow-y: auto; flex: 1; }
        .answer24-message { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 15px; line-height: 1.4; word-break: break-word; }
        .answer24-message.bot { background: #f3f4f6; align-self: flex-start; border-bottom-left-radius: 4px; color: #1f2937; }
        .answer24-message.user { background: ${theme.primary}; color: ${theme.foreground}; align-self: flex-end; border-bottom-right-radius: 4px; }
        .answer24-typing { display: flex; align-items: center; padding: 10px 14px; align-self: flex-start; background: #f3f4f6; border-radius: 18px; border-bottom-left-radius: 4px; gap: 4px; }
        .answer24-typing span { width: 6px; height: 6px; background: #9ca3af; border-radius: 50%; animation: typing-blink 1.4s infinite; }
        .answer24-typing span:nth-child(2) { animation-delay: 0.2s; }
        .answer24-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-blink { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .answer24-typing-text { font-size: 12px; color: #6b7280; margin-left: 4px; }
        #answer24-input-area { padding: 16px; border-top: 1px solid #e5e7eb; display: none; flex-direction: column; }
        .answer24-input-wrapper { display: flex; align-items: center; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px 12px; gap: 8px; }
        #answer24-input { flex: 1; border: none; background: transparent; outline: none; font-size: 15px; padding: 4px 0; color: #1f2937; }
        .answer24-icon-btn { background: transparent; border: none; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s; display: flex; align-items: center; justify-content: center; }
        .answer24-icon-btn:hover { color: ${theme.primary}; }
        .answer24-icon-btn.listening { color: #ef4444; animation: pulse-mic 1.5s infinite; }
        @keyframes pulse-mic { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        #answer24-send-button { color: ${theme.primary}; }
        .answer24-file-preview { margin-top: 8px; display: flex; align-items: center; gap: 12px; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 8px; }
        .answer24-file-img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
        .answer24-file-info { flex: 1; }
        .answer24-file-name { font-size: 12px; font-weight: 500; word-break: break-all; }
        .answer24-file-size { font-size: 10px; color: #6b7280; }
        .answer24-branding { padding: 8px; text-align: center; font-size: 12px; color: #9ca3af; }
        .answer24-branding a { color: #6b7280; text-decoration: none; font-weight: 500; }
        #answer24-alert-box { position: absolute; top: 70px; left: 16px; right: 16px; padding: 10px; border-radius: 8px; font-size: 14px; text-align: center; z-index: 10; display: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        #answer24-logout-button { display: ${auth.isAuthenticated ? "block" : "none"}; margin-top: 10px; color: #991b1b; background: transparent; border: none; font-size: 12px; cursor: pointer; text-decoration: underline; }
      </style>

      <div id="answer24-widget-container">
        <button id="answer24-chat-button" onclick="window.toggleWidget()">
          <div class="answer24-status-ring"></div>
          <div class="answer24-icon-container">
            <svg id="answer24-icon-open" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg id="answer24-icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </button>

        <div id="answer24-chat-window">
          <div id="answer24-chat-header">
            <div class="answer24-header-top">
              <button id="answer24-back-button" class="answer24-back-button" onclick="switchTab('home')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <div class="answer24-avatars">
                <img src="${primaryAvatarSVG}" class="answer24-avatar">
                <img src="${secondaryAvatarSVG}" class="answer24-avatar">
                <img src="${tertiaryAvatarSVG}" class="answer24-avatar">
              </div>
              <span class="answer24-header-title">answer24</span>
              <div class="answer24-header-actions">
                <button class="answer24-mute-button" onclick="window.toggleMute()">
                  <svg id="answer24-volume-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  <svg id="answer24-volume-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                </button>
              </div>
            </div>
            <div class="answer24-status-line">
              <div class="answer24-status-dot"></div>
              <span class="answer24-status-text">AI Assistant Online</span>
            </div>
          </div>

          <div id="answer24-content-area">
            <div id="answer24-alert-box"></div>

            <div id="answer24-welcome-screen" class="answer24-screen show">
              <div class="answer24-welcome-title">Welcome to answer24! 👋</div>
              <div class="answer24-welcome-subtitle">How can we help you today?</div>
              <div class="answer24-options">
                ${welcomeOptions
                  .map(
                    (opt) => `
                  <button class="answer24-option-button" onclick="handleOptionClick('${opt.action}')">
                    <span style="display: flex; align-items: center; gap: 12px;">
                      <span class="answer24-option-icon">${opt.icon}</span>${opt.label}
                    </span>
                    <span class="answer24-option-arrow">→</span>
                  </button>`,
                  )
                  .join("")}
                <button class="answer24-option-button" onclick="handleOptionClick('chat')">
                   <span style="display: flex; align-items: center; gap: 12px;">
                      <span class="answer24-option-icon">💬</span>Send us a message
                    </span>
                    <span class="answer24-option-arrow">→</span>
                </button>
              </div>
              <button id="answer24-logout-button" onclick="window.clearAuthState()">Logout from account</button>
            </div>

            <div id="answer24-chat-screen" class="answer24-screen">
              <div id="answer24-messages">
                <div class="answer24-message bot">${strings["chat.welcome"]}</div>
              </div>
            </div>

            <div id="answer24-auth-screen" class="answer24-screen" style="align-items: center; justify-content: center; padding: 24px;">
              <h3 style="color:${theme.primary}; margin-bottom:10px;">Login Required</h3>
              <p style="color:#6b7280; font-size:14px; text-align:center; margin-bottom:20px;">Please log in to your Answer24 account to continue.</p>
              <form class="answer24-form">
                <input type="email" placeholder="Email Address" class="answer24-input-field" required>
                <input type="password" placeholder="Password" class="answer24-input-field" required>
                <button type="submit" class="answer24-primary-btn" onclick="window.handleAuthSubmit(event, 'login')">Log In</button>
              </form>
              <div style="margin-top:20px; font-size:14px; color:#6b7280; text-align:center;">
                  Don't have an account? <br>
                  <a href="https://answer24.nl/register" target="_blank" style="color:${theme.primary}; font-weight:600; text-decoration:none;">Register on our website</a>
              </div>
            </div>

            <div id="answer24-cashback-screen" class="answer24-screen" style="padding: 24px;">
                <div id="answer24-cashback-content"></div>
            </div>
           </div>

          <div id="answer24-input-area">
            <div class="answer24-input-wrapper">
              <button id="answer24-attach-button" class="answer24-icon-btn" title="Attach file">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              </button>
              <input type="file" id="answer24-file-input" style="display: none;" accept="image/*,application/pdf,.doc,.docx,.txt">
              <input type="text" id="answer24-input" placeholder="${strings["chat.placeholder"]}">
              <button id="answer24-voice-button" class="answer24-icon-btn" title="Voice input">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              </button>
             <button id="answer24-send-button" class="answer24-icon-btn" onclick="handleSendMessage()" title="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            <div class="answer24-branding">Powered by <a href="https://answer24.nl" target="_blank">answer24.nl</a></div>
          </div>
        </div>
      </div>
    `;
  }

  window.toggleWidget = function (force) {
    const chatWindow = document.getElementById("answer24-chat-window");
    const chatButton = document.getElementById("answer24-chat-button");
    const iconOpen = document.getElementById("answer24-icon-open");
    const iconClose = document.getElementById("answer24-icon-close");

    if (!chatWindow || !chatButton) return;

    isOpen = force !== undefined ? force : !isOpen;

    if (isOpen) {
      chatWindow.classList.add("open");
      chatButton.classList.add("open");
      iconOpen.style.display = "none";
      iconClose.style.display = "block";
    } else {
      chatWindow.classList.remove("open");
      chatButton.classList.remove("open");
      iconOpen.style.display = "block";
      iconClose.style.display = "none";
    }
  };

  window.toggleMute = function () {
    isMuted = !isMuted;
    const volOn = document.getElementById("answer24-volume-on");
    const volOff = document.getElementById("answer24-volume-off");
    if (volOn && volOff) {
      volOn.style.display = isMuted ? "none" : "block";
      volOff.style.display = isMuted ? "block" : "none";
    }
  };

  async function initWidget() {
    loadAuthState();
    await initDomain();
    await loadSettings();
    const container = document.createElement("div");
    container.id = "answer24-widget-wrapper";
    container.innerHTML = createWidgetHTML();
    document.body.appendChild(container);

    if (bookingMode === 1) {
      window.renderBookingForm();
    } else {
      window.renderCashbackForm();
    }

    // EVENT LISTENERS
    const input = document.getElementById("answer24-input");
    const fileInput = document.getElementById("answer24-file-input");
    const attachButton = document.getElementById("answer24-attach-button");
    const voiceButton = document.getElementById("answer24-voice-button");

    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
      });
    }
    if (fileInput && attachButton) {
      attachButton.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) =>
        handleFileSelect(e.target.files[0]),
      );
    }
    if (voiceButton) {
      voiceButton.addEventListener("click", startSpeechRecognition);
    }
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initWidget();
  } else {
    window.addEventListener("DOMContentLoaded", initWidget);
  }
})();
