"use client"

import React, { useState, useEffect, useRef } from "react"
import { MessageCircle, Bot, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createHelpdeskChat } from "@/app/[locale]/actions/chat"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import type { Chat, Message } from "@/types/chat"

interface HelpdeskChatProps {
  currentUserId: string
}

export function HelpdeskChat({ currentUserId }: HelpdeskChatProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startHelpdeskChat = async () => {
    setIsCreating(true)
    try {
      const newChat = await createHelpdeskChat()
      setChat(newChat)
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        content: "Hello! You're now connected to our helpdesk team. How can we help you today?",
        senderId: "helpdesk",
        timestamp: new Date(),
        type: "text",
        isAiGenerated: false
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error creating helpdesk chat:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!chat) return

    setIsLoading(true)
    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        senderId: currentUserId,
        timestamp: new Date(),
        type: attachments ? "file" : "text",
        attachments: attachments?.map((file, index) => ({
          id: index.toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }))
      }

      setMessages(prev => [...prev, userMessage])

      // Send message to backend
      // await sendMessage(chat.id, content, currentUserId, attachments ? "file" : "text", attachments)

      // Simulate helpdesk response
      setTimeout(() => {
        const helpdeskMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thank you for your message! Our support team will get back to you shortly. In the meantime, you can also try asking our AI assistant for immediate help.",
          senderId: "helpdesk",
          timestamp: new Date(),
          type: "text",
          isAiGenerated: false
        }
        setMessages(prev => [...prev, helpdeskMessage])
        setIsLoading(false)
      }, 2000)

    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const handleAIRequest = async (message: string) => {
    if (!chat) return

    setIsLoading(true)
    try {
      // Generate AI response
      // const aiMessage = await generateAIResponse(chat.id, message)
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Based on your question "${message}", here's what I can help you with:\n\n• Check our FAQ section for common questions\n• Review your account settings\n• Contact our support team for personalized assistance\n\nIs there anything specific you'd like me to explain further?`,
          senderId: "ai_assistant",
          timestamp: new Date(),
          type: "ai_response",
          isAiGenerated: true
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1500)

    } catch (error) {
      console.error("Error generating AI response:", error)
      setIsLoading(false)
    }
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Help from Our Support Team
          </h2>
          
          <p className="text-gray-600 mb-6">
            Start a conversation with our helpdesk team. We're here to help you with any questions or issues you might have.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>24/7 Support Available</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Average Response Time: 2-5 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Bot className="w-4 h-4 text-purple-500" />
              <span>AI Assistant Available</span>
            </div>
          </div>

          <Button 
            onClick={startHelpdeskChat}
            disabled={isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Starting Chat..." : "Start Helpdesk Chat"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Helpdesk Support</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
                <span className="text-xs text-gray-500">
                  Chat ID: {chat.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bot className="w-4 h-4 mr-1" />
              AI Help
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendAIRequest={handleAIRequest}
        isLoading={isLoading}
        aiEnabled={true}
        placeholder="Type your message to our support team..."
      />
    </div>
  )
}
