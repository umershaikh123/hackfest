"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Zap, Rocket } from "lucide-react"
import { AgentType } from "@/lib/agents"

interface Message {
  id: string
  type: "user" | "agent" | "system"
  content: string
  agentType?: AgentType
  timestamp: Date
  metadata?: {
    processingTime?: number
    confidence?: number
    artifacts?: any[]
  }
}

interface ChatInterfaceProps {
  onAgentCall?: (agentType: AgentType, message: string) => void
  onWorkflowRun?: (initialIdea: string) => void
  conversation?: {
    messages: Message[]
    addUserMessage: (content: string) => Message
    addAgentMessage: (
      content: string,
      agentType: AgentType,
      response?: any
    ) => Message
    addSystemMessage: (content: string) => Message
    currentAgent: AgentType | null
    isLoading: boolean
  }
  isLoading?: boolean
  currentAgent?: AgentType | null
  onFirstInteraction?: () => void
}

export function ChatInterface({
  onAgentCall,
  onWorkflowRun,
  conversation,
  isLoading = false,
  currentAgent,
  onFirstInteraction,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [hasInteracted, setHasInteracted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Use conversation messages if provided, otherwise fall back to local state
  const messages = conversation?.messages || []
  const loading = conversation?.isLoading || isLoading

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const detectIntentAndAgent = (
    input: string
  ): { intent: "agent" | "workflow"; agentType?: AgentType } => {
    const lowerInput = input.toLowerCase()

    // Workflow triggers
    if (
      lowerInput.includes("complete workflow") ||
      lowerInput.includes("full process") ||
      lowerInput.includes("end to end")
    ) {
      return { intent: "workflow" }
    }

    // Agent-specific triggers
    if (
      lowerInput.includes("user stor") ||
      lowerInput.includes("acceptance criteria")
    ) {
      return { intent: "agent", agentType: "user-story" }
    }
    if (
      lowerInput.includes("prd") ||
      lowerInput.includes("requirements document")
    ) {
      return { intent: "agent", agentType: "prd" }
    }
    if (
      lowerInput.includes("sprint") ||
      lowerInput.includes("timeline") ||
      lowerInput.includes("development plan")
    ) {
      return { intent: "agent", agentType: "sprint-planner" }
    }
    if (
      lowerInput.includes("visual") ||
      lowerInput.includes("design") ||
      lowerInput.includes("user journey") ||
      lowerInput.includes("miro")
    ) {
      return { intent: "agent", agentType: "visual-design" }
    }

    // Default to idea generation for new product ideas
    return { intent: "agent", agentType: "idea-generation" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userInput = input.trim()
    setInput("")

    if (!hasInteracted) {
      setHasInteracted(true)
      onFirstInteraction?.()
    }

    // Detect intent and route appropriately
    const { intent, agentType } = detectIntentAndAgent(userInput)

    if (intent === "workflow" && onWorkflowRun) {
      onWorkflowRun(userInput)
    } else if (intent === "agent" && agentType && onAgentCall) {
      onAgentCall(agentType, userInput)
    } else {
      // Fallback: add message to conversation if no handlers
      conversation?.addUserMessage(userInput)
      conversation?.addSystemMessage(
        "I understand your request. Please make sure the proper handlers are connected."
      )
    }
  }

  const handleAgentSuggestion = (agentType: AgentType) => {
    if (onAgentCall) {
      const message = `Please help me with ${agentType.replace("-", " ")}`
      onAgentCall(agentType, message)
    }
  }

  const getAgentIcon = (agentType?: AgentType) => {
    switch (agentType) {
      case "idea-generation":
        return "💡"
      case "user-story":
        return "📝"
      case "prd":
        return "📋"
      case "sprint-planner":
        return "🎯"
      case "visual-design":
        return "🎨"
      case "feedback":
        return "🔄"
      default:
        return "🤖"
    }
  }

  return (
    <div className="flex flex-col h-full  ">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 message-enter">
            <Avatar className="w-16 h-16 ">
              <AvatarFallback className="bg-primary text-primary-foreground animated-gradient">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold gradient-text">
                👋 Hello! I'm your AI Product Manager
              </h3>
              <p className="text-muted-foreground max-w-md">
                Share your product idea and I'll help you create user stories,
                PRDs, sprint plans, and more!
              </p>
            </div>
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAgentSuggestion("idea-generation")}
                className="h-auto p-3 flex flex-col items-center gap-2 btn-hover "
              >
                <span className="text-lg ">💡</span>
                <span className="text-xs">Refine Idea</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAgentSuggestion("user-story")}
                className="h-auto p-3 flex flex-col items-center gap-2 btn-hover "
              >
                <span className="text-lg " style={{ animationDelay: "0.1s" }}>
                  📝
                </span>
                <span className="text-xs">User Stories</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAgentSuggestion("prd")}
                className="h-auto p-3 flex flex-col items-center gap-2 btn-hover "
              >
                <span className="text-lg " style={{ animationDelay: "0.2s" }}>
                  📋
                </span>
                <span className="text-xs">Create PRD</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onWorkflowRun?.("Complete product development workflow")
                }
                className="h-auto p-3 flex flex-col items-center gap-2 btn-hover  loading-pulse"
              >
                <Rocket
                  className="w-4 h-4 "
                  style={{ animationDelay: "0.3s" }}
                />
                <span className="text-xs">Full Workflow</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} ${
                  message.type === "user"
                    ? "message-enter-user"
                    : "message-enter"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4" />
                      ) : message.type === "system" ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">
                          {getAgentIcon(message.agentType)}
                        </span>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-4 smooth-transition   ${
                      message.type === "user"
                        ? "chat-gradient text-primary-foreground shadow-lg hover:shadow-xl"
                        : message.type === "system"
                          ? "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                          : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.agentType && message.metadata && (
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {message.agentType}
                        </Badge>
                        {message.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.metadata.confidence * 100)}%
                            confident
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start message-enter">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <Avatar className="w-8 h-8 flex-shrink-0 loading-pulse">
                    <AvatarFallback className="bg-muted animated-gradient">
                      <Bot className="w-4 h-4 " />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-muted-foreground border border-border rounded-lg p-4 loading-pulse">
                    <div className="flex items-center space-x-2">
                      <span className="gradient-text">
                        {currentAgent
                          ? `${getAgentIcon(currentAgent)} ${currentAgent.replace("-", " ")} is processing`
                          : "AI agents are analyzing"}
                      </span>
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

      <div className="p-6 border-t border-border bg-gradient-to-r from-background/50 to-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your product idea or ask for specific help..."
            className="flex-1 min-h-[60px] resize-none bg-input border-border focus:ring-primary smooth-transition hover:border-primary/50 focus:border-primary"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className={`chat-gradient text-primary-foreground px-6 btn-hover ${
              loading ? "loading-pulse" : ""
            } ${input.trim()}`}
          >
            <Send className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </form>
        <div className="mt-2 text-xs text-muted-foreground animate-pulse">
          Try: "Create user stories", "Generate PRD", "Plan sprints", or "Run
          complete workflow"
        </div>
      </div>
    </div>
  )
}
