"use client"

import { useState } from "react"
import type { Chat } from "@/types/chat"
import { ChatListSidebar } from "./ChatListSidebar"
import { ChatDetailView } from "./ChatDetailsView"
import { EmptyChatState } from "./EmptyChatState"
import { tokenUtils } from "@/utils/auth"
import { cn } from "@/lib/utils"

export function SimpleChatContainer() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isChatListVisible, setIsChatListVisible] = useState(true)

  // Get current user from auth system
  const currentUserId = tokenUtils.getUser()?.id || "190"

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    if (window.innerWidth < 768) {
      setIsChatListVisible(false)
    }
  }

  const handleBackToList = () => {
    setSelectedChat(null)
    setIsChatListVisible(true)
  }

  const toggleChatList = () => {
    setIsChatListVisible(!isChatListVisible)
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex px-2 overflow-y-hidden">
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-auto",
          isChatListVisible ? "w-full md:w-80 flex-shrink-0" : "w-0 hidden"
        )}
      >
        <ChatListSidebar
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
          currentUserId={currentUserId}
        />
      </div>

        {selectedChat ? (
          <ChatDetailView
            chat={selectedChat}
            currentUserId={currentUserId}
            onBack={handleBackToList}
            onToggleChatList={toggleChatList}
            isChatListVisible={isChatListVisible}
          />
        ) : (
          <EmptyChatState />
        )}
    </div>
  )
}
