export interface User {
    id: string
    name: string
    avatar: string
    role?: string
    company?: string
    status: "online" | "offline" | "away"
    joinDate?: string
    lastSeen?: Date
  }
  
  export interface Message {
    id: string
    content: string
    senderId: string
    timestamp: Date
    type: "text" | "image" | "file" | "ai_response"
    isRead?: boolean
    isLoading?: boolean
    role?: string
    receiverId?: string
    attachments?: Attachment[]
    isAiGenerated?: boolean
  }

  export interface Attachment {
    id: string
    name: string
    type: string
    size: number
    url: string
    thumbnail?: string
  }
  
  export interface Chat {
    id: string
    participants: User[]
    lastMessage?: Message
    unreadCount?: number
    updatedAt: Date
    createdAt?: Date
    type: "user_to_user" | "helpdesk" | "ai_assistant"
    title?: string
    isActive?: boolean
    aiEnabled?: boolean
  }
  