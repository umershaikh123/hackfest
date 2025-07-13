"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onFirstInteraction: () => void
}

export function ChatInterface({ onFirstInteraction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    if (!hasInteracted) {
      setHasInteracted(true)
      onFirstInteraction()
    }

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Great! I've analyzed your idea and created:

✅ **Refined Product Concept**: ${userMessage.content.slice(0, 50)}... has been structured into a comprehensive product vision.

✅ **User Stories**: Generated comprehensive user stories with acceptance criteria based on your requirements.

✅ **Product Requirements Document**: Compiled a detailed PRD ready for your development team.

Would you like me to also create sprint plans or visual designs? I can help you break down the development timeline and create user journey maps.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">👋 Hello! I'm your AI Product Manager</h3>
              <p className="text-muted-foreground max-w-md">
                Share your product idea and I'll help you create user stories, PRDs, sprint plans, and more!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}
                    >
                      {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-4 ${
                      message.type === "user"
                        ? "chat-gradient text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-muted">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-muted-foreground border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span>AI agents are analyzing</span>
                      <div className="typing-indicator flex space-x-1">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 border-t border-border">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your product idea..."
            className="flex-1 min-h-[60px] resize-none bg-input border-border focus:ring-primary"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="chat-gradient text-primary-foreground hover:opacity-90 transition-opacity px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
