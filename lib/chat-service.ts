"use client";

import { User, Chat, Message } from "@/types/chat";
import { tokenUtils } from "@/utils/auth";
import { getApiUrl, getApiHeaders } from "@/lib/api-config";

// Client-side chat service that can access localStorage
export class ChatService {
  private static instance: ChatService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private initializeAuth() {
    this.token = tokenUtils.getToken();
    this.user = tokenUtils.getUser();
  }

  private ensureAuth() {
    if (!this.token) {
      this.initializeAuth();
    }
    if (!this.token) {
      throw new Error("No authentication token found");
    }
    return this.token;
  }

  async getChats(): Promise<Chat[]> {
    try {
      const token = this.ensureAuth();

      console.log(
        "ChatService.getChats: Making request to:",
        getApiUrl("/chats"),
      );
      console.log(
        "ChatService.getChats: Using token:",
        token.substring(0, 20) + "...",
      );

      const response = await fetch(getApiUrl("/chats"), {
        method: "GET",
        headers: getApiHeaders(token),
      });

      console.log("ChatService.getChats: Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ChatService.getChats: Error response:", errorText);
        throw new Error(
          `Failed to fetch chats: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("ChatService.getChats: Response data:", data);
      return data.chats || [];
    } catch (error) {
      console.error("ChatService.getChats: Error:", error);
      return [];
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const token = this.ensureAuth();

      console.log(
        "ChatService.getChatMessages: Making request to:",
        getApiUrl(`/chats/${chatId}/messages`),
      );

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
      console.error("ChatService.getChatMessages: Error:", error);
      return [];
    }
  }

  async sendMessage(
    chatId: string,
    content: string,
    senderId: string,
    type: "text" | "image" | "file" = "text",
    attachments?: File[],
  ): Promise<Message> {
    try {
      const token = this.ensureAuth();

      console.log(
        "ChatService.sendMessage: Making request to:",
        getApiUrl(`/chats/${chatId}/messages`),
      );
      console.log(
        "ChatService.sendMessage: Using token:",
        token.substring(0, 20) + "...",
      );

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", type);

      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append("attachments[]", file);
        });
      }

      console.log("ChatService.sendMessage: FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(getApiUrl(`/chats/${chatId}/messages`), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      console.log("ChatService.sendMessage: Response status:", response.status);
      console.log(
        "ChatService.sendMessage: Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ChatService.sendMessage: Error response:", errorText);
        throw new Error(
          `Failed to send message: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("ChatService.sendMessage: Response data:", data);
      return data.message;
    } catch (error) {
      console.error("ChatService.sendMessage: Error:", error);
      throw error;
    }
  }

  async createChat(participantIds: string[], title?: string): Promise<Chat> {
    try {
      const token = this.ensureAuth();

      console.log(
        "ChatService.createChat: Making request to:",
        getApiUrl("/chats"),
      );
      console.log(
        "ChatService.createChat: Using token:",
        token.substring(0, 20) + "...",
      );

      const requestBody = {
        participants: participantIds,
        title: title || "New Chat",
        type: "user_to_user",
      };
      console.log("ChatService.createChat: Request body:", requestBody);

      const response = await fetch(getApiUrl("/chats"), {
        method: "POST",
        headers: {
          ...getApiHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("ChatService.createChat: Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ChatService.createChat: Error response:", errorText);
        throw new Error(
          `Failed to create chat: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("ChatService.createChat: Response data:", data);
      return data.chat;
    } catch (error) {
      console.error("ChatService.createChat: Error:", error);
      throw error;
    }
  }

  async createHelpdeskChat(): Promise<Chat> {
    try {
      const token = this.ensureAuth();

      console.log(
        "ChatService.createHelpdeskChat: Making request to:",
        getApiUrl("/chats"),
      );
      console.log(
        "ChatService.createHelpdeskChat: Using token:",
        token.substring(0, 20) + "...",
      );

      const requestBody = {
        type: "helpdesk",
        title: "Helpdesk Support",
        participants: [this.user?.id || "1"], // Include current user as participant
      };
      console.log("ChatService.createHelpdeskChat: Request body:", requestBody);

      const response = await fetch(getApiUrl("/chats"), {
        method: "POST",
        headers: {
          ...getApiHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(
        "ChatService.createHelpdeskChat: Response status:",
        response.status,
      );
      console.log(
        "ChatService.createHelpdeskChat: Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "ChatService.createHelpdeskChat: Error response:",
          errorText,
        );
        throw new Error(
          `Failed to create helpdesk chat: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("ChatService.createHelpdeskChat: Response data:", data);
      return data.chat;
    } catch (error) {
      console.error("ChatService.createHelpdeskChat: Error:", error);
      throw error;
    }
  }

  async generateAIResponse(chatId: string, message: string): Promise<Message> {
    try {
      const token = this.ensureAuth();

      const response = await fetch(getApiUrl(`/chats/${chatId}/ai`), {
        method: "POST",
        headers: {
          ...getApiHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate AI response: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("ChatService.generateAIResponse: Error:", error);
      throw error;
    }
  }

  async toggleAIForChat(chatId: string, enabled: boolean): Promise<void> {
    try {
      const token = this.ensureAuth();

      const response = await fetch(getApiUrl(`/chats/${chatId}`), {
        method: "PUT",
        headers: {
          ...getApiHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ai_enabled: enabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle AI: ${response.status}`);
      }
    } catch (error) {
      console.error("ChatService.toggleAIForChat: Error:", error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const token = this.ensureAuth();

      const response = await fetch(getApiUrl(`/messages/${messageId}/read`), {
        method: "POST",
        headers: getApiHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.status}`);
      }
    } catch (error) {
      console.error("ChatService.markMessageAsRead: Error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();

// Export individual functions for easy use
export const getChats = () => chatService.getChats();
export const getChatMessages = (chatId: string) =>
  chatService.getChatMessages(chatId);
export const sendMessage = (
  chatId: string,
  content: string,
  senderId: string,
  type?: "text" | "image" | "file",
  attachments?: File[],
) => chatService.sendMessage(chatId, content, senderId, type, attachments);
export const createChat = (participantIds: string[], title?: string) =>
  chatService.createChat(participantIds, title);
export const createHelpdeskChat = () => chatService.createHelpdeskChat();
export const generateAIResponse = (chatId: string, message: string) =>
  chatService.generateAIResponse(chatId, message);
export const toggleAIForChat = (chatId: string, enabled: boolean) =>
  chatService.toggleAIForChat(chatId, enabled);
export const markMessageAsRead = (messageId: string) =>
  chatService.markMessageAsRead(messageId);
