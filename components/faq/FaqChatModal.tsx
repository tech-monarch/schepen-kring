"use client"

import { useState, useEffect, useRef } from "react"
import { X, ThumbsUp, ThumbsDown, Loader2, Send, Bot, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

type FeedbackType = 'helpful' | 'not-helpful' | null

type Message = {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface FaqChatModalProps {
  isOpen: boolean
  onClose: () => void
  question: string
  answer: string
  isLoading: boolean
  onFeedback: (isHelpful: boolean) => void
  onNewQuestion?: (question: string) => Promise<void>
}

export function FaqChatModal({
  isOpen,
  onClose,
  question: initialQuestion,
  answer: initialAnswer,
  isLoading,
  onFeedback,
  onNewQuestion,
}: FaqChatModalProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with initial question and answer
  useEffect(() => {
    if (initialQuestion && initialAnswer) {
      setMessages([
        { id: '1', content: initialQuestion, isUser: true, timestamp: new Date() },
        { id: '2', content: initialAnswer, isUser: false, timestamp: new Date() },
      ])
    }
  }, [initialQuestion, initialAnswer])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || !onNewQuestion) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newQuestion,
      isUser: true,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setNewQuestion('')
    setIsAsking(true)
    
    try {
      await onNewQuestion(newQuestion)
    } finally {
      setIsAsking(false)
    }
  }

  useEffect(() => {
    // Handle escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleFeedback = async (isHelpful: boolean) => {
    if (isSubmittingFeedback) return
    
    setIsSubmittingFeedback(true)
    try {
      await onFeedback(isHelpful)
      setFeedback(isHelpful ? 'helpful' : 'not-helpful')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-2xl h-[80vh] bg-background rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/20">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  message.isUser 
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={cn(
                  "text-xs mt-1",
                  message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-muted">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Question Input */}
        {onNewQuestion && (
          <div className="border-t p-4 bg-background">
            <form onSubmit={handleAskQuestion} className="relative">
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask me anything..."
                className="min-h-[60px] max-h-32 pr-12 resize-none"
                disabled={isAsking || isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAskQuestion(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                disabled={!newQuestion.trim() || isAsking || isLoading}
              >
                {isAsking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        )}
        
        {/* Feedback Section */}
        {!onNewQuestion && (
          <div className="border-t p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {feedback ? (
                  <span className="text-green-600">
                    Thank you for your feedback!
                  </span>
                ) : (
                  'Was this helpful?'
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  disabled={feedback !== null || isSubmittingFeedback}
                  className={cn(
                    'flex items-center space-x-1',
                    feedback === 'helpful' ? 'bg-green-500 hover:bg-green-600' : ''
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes</span>
                </Button>
                <Button
                  variant={feedback === 'not-helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  disabled={feedback !== null || isSubmittingFeedback}
                  className={cn(
                    'flex items-center space-x-1',
                    feedback === 'not-helpful' ? 'bg-red-500 hover:bg-red-600' : ''
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No</span>
                </Button>
              </div>
            </div>
            {feedback === 'not-helpful' ? (
              <div className="mt-2 text-sm text-muted-foreground">
                <ThumbsDown className="h-4 w-4 mr-1" />
                We're sorry to hear that. We'll use your feedback to improve.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
