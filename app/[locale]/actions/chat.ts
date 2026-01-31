"use server";

import { User, Chat, Message } from "@/types/chat";
import { tokenUtils } from "@/utils/auth";
import { getApiUrl, getApiHeaders } from "@/lib/api-config";

// Real API integration with Laravel backend
export async function getChats(): Promise<Chat[]> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      console.error("getChats: No authentication token found");
      throw new Error("No authentication token found");
    }

    console.log("getChats: Making request to:", getApiUrl("/chats"));
    console.log("getChats: Using token:", token.substring(0, 20) + "...");

    const response = await fetch(getApiUrl("/chats"), {
      method: "GET",
      headers: getApiHeaders(token),
    });

    console.log("getChats: Response status:", response.status);
    console.log(
      "getChats: Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("getChats: Error response:", errorText);
      throw new Error(
        `Failed to fetch chats: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("getChats: Response data:", data);
    return data.chats || [];
  } catch (error) {
    console.error("Error fetching chats:", error);
    // Fallback to empty array on error
    return [];
  }
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(getApiUrl(`/chats/${chatId}/messages`), {
      method: "GET",
      headers: getApiHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(
  chatId: string,
  content: string,
  senderId: string,
  type: "text" | "image" | "file" = "text",
  attachments?: File[],
): Promise<Message> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("type", type);

    // Add file attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await fetch(getApiUrl(`/chats/${chatId}/messages`), {
      method: "POST",
      headers: {
        ...getApiHeaders(token),
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function createChat(
  participantIds: string[],
  title?: string,
): Promise<Chat> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(getApiUrl("/chats"), {
      method: "POST",
      headers: {
        ...getApiHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants: participantIds,
        title,
        type: "user_to_user",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.status}`);
    }

    const data = await response.json();
    return data.chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function createHelpdeskChat(
  token?: string,
  userId?: string,
): Promise<Chat> {
  try {
    console.log(
      "createHelpdeskChat: Starting with token:",
      token ? token.substring(0, 20) + "..." : "NOT PROVIDED",
    );
    console.log("createHelpdeskChat: Starting with userId:", userId);

    // Get token from parameter or from tokenUtils
    const authToken = token || tokenUtils.getToken();
    if (!authToken) {
      console.error("createHelpdeskChat: No authentication token found");
      throw new Error("No authentication token found");
    }

    // Get user ID from parameter or from tokenUtils
    let userIdValue = userId;
    if (!userIdValue) {
      const userData = tokenUtils.getUser();
      console.log("createHelpdeskChat: Retrieved user data:", userData);
      userIdValue = userData?.id;
    }

    console.log("createHelpdeskChat: Final userId:", userIdValue);
    console.log(
      "createHelpdeskChat: User ID is valid:",
      !!userIdValue && userIdValue !== "undefined" && userIdValue !== "null",
    );

    if (!userIdValue || userIdValue === "undefined" || userIdValue === "null") {
      console.error("createHelpdeskChat: No user ID found or invalid user ID");
      throw new Error("User ID not found");
    }

    console.log("createHelpdeskChat: Making request to:", getApiUrl("/chats"));
    console.log(
      "createHelpdeskChat: Using token:",
      authToken.substring(0, 20) + "...",
    );

    const requestBody = {
      participants: [String(userIdValue)], // Ensure user ID is a string
      type: "helpdesk",
      title: "Helpdesk Support",
    };
    console.log("createHelpdeskChat: Request body:", requestBody);
    console.log("createHelpdeskChat: User ID type:", typeof userIdValue);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(getApiUrl("/chats"), {
      method: "POST",
      headers: {
        ...getApiHeaders(authToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("createHelpdeskChat: Response status:", response.status);
    console.log(
      "createHelpdeskChat: Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("createHelpdeskChat: Error response:", errorText);

      // If it's a 500 error, create a fallback chat
      if (response.status === 500) {
        console.log("createHelpdeskChat: Server error, creating fallback chat");
        return {
          id: `fallback-${Date.now()}`,
          participants: [
            {
              id: userIdValue,
              name: "User",
              avatar: "",
              status: "online" as const,
            },
          ],
          type: "helpdesk" as const,
          title: "Helpdesk Support",
          createdAt: new Date(),
          updatedAt: new Date(),
          aiEnabled: true,
        };
      }

      throw new Error(
        `Failed to create helpdesk chat: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("createHelpdeskChat: Response data:", data);
    console.log("createHelpdeskChat: Chat ID from response:", data.chat?.id);
    return data.chat;
  } catch (error) {
    console.error("Error creating helpdesk chat:", error);

    // If it's a network error or timeout, create a fallback chat
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("fetch"))
    ) {
      console.log("createHelpdeskChat: Network error, creating fallback chat");
      const userData = tokenUtils.getUser();
      return {
        id: `fallback-${Date.now()}`,
        participants: [
          {
            id: userData?.id || "unknown",
            name: userData?.name || "User",
            avatar: userData?.profile_picture || "",
            status: "online" as const,
          },
        ],
        type: "helpdesk" as const,
        title: "Helpdesk Support",
        createdAt: new Date(),
        updatedAt: new Date(),
        aiEnabled: true,
      };
    }

    throw error;
  }
}

export async function generateAIResponse(
  chatId: string,
  message: string,
): Promise<Message> {
  const fallbackMessage = (content: string): Message => ({
    id: `fallback-${Date.now()}`,
    senderId: "ai",
    content,
    type: "text" as const,
    timestamp: new Date(),
    isAiGenerated: true,
  });

  try {
    if (!message?.trim()) {
      throw new Error("Message cannot be empty");
    }

    // ⚠️ Hardcoded Gemini API key (replace later with .env)
    const apiKey = "AIzaSyDwfmbbGqI2gPPfhWbD9TK7m2RDB-K_tCA";

    // ✅ Gemini endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // ✅ Gemini payload
    const payload = {
      contents: [
        {
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    console.log("🧠 generateAIResponse → Sending to Gemini:", payload);

    // ✅ Fetch request
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("generateAIResponse → status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("generateAIResponse → Gemini error:", errorText);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("generateAIResponse → response data:", data);

    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini returned no text response.";

    return {
      id: `ai-${Date.now()}`,
      senderId: "ai",
      content: aiText,
      type: "text",
      timestamp: new Date(),
      isAiGenerated: true,
    };
  } catch (error) {
    console.error("❌ generateAIResponse → exception:", error);

    return fallbackMessage(
      error instanceof Error
        ? `Error: ${error.message}`
        : "Unexpected AI error occurred.",
    );
  }
}

export async function toggleAIForChat(
  chatId: string,
  enabled: boolean,
): Promise<void> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(getApiUrl(`/chats/${chatId}`), {
      method: "PUT",
      headers: {
        ...getApiHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ai_enabled: enabled,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle AI: ${response.status}`);
    }
  } catch (error) {
    console.error("Error toggling AI:", error);
    throw error;
  }
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      getApiUrl(`/api/v1/messages/${messageId}/read`),
      {
        method: "POST",
        headers: getApiHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}
