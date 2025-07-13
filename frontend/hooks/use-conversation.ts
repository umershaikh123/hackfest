/**
 * Conversation management hook for Product Maestro
 * Handles chat state, message history, and conversation flow
 */

import { useState, useCallback, useEffect } from "react"
import { AgentType, AgentResponse } from "@/lib/agents"
import { useSession } from "./use-agents"

export interface Message {
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

export interface ConversationState {
  messages: Message[]
  currentAgent: AgentType | null
  isLoading: boolean
  sessionId: string
  artifacts: {
    idea?: any
    userStories?: any
    prd?: any
    sprints?: any
    visual?: any
  }
}

export function useConversation() {
  const { getCurrentSession, createSession, clearSession } = useSession()

  const [state, setState] = useState<ConversationState>(() => {
    // Clear any corrupted data on initialization
    if (typeof window !== 'undefined') {
      try {
        const sessionId = getCurrentSession()
        const saved = localStorage.getItem(`conversation_${sessionId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate and fix data
          if (parsed.messages && Array.isArray(parsed.messages)) {
            return {
              messages: parsed.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })),
              currentAgent: null,
              isLoading: false,
              sessionId,
              artifacts: parsed.artifacts || {}
            }
          }
        }
      } catch (error) {
        console.error('Failed to load saved conversation:', error)
      }
    }
    
    return {
      messages: [],
      currentAgent: null,
      isLoading: false,
      sessionId: typeof window !== 'undefined' ? getCurrentSession() : `session_${Date.now()}`,
      artifacts: {},
    }
  })

  // Note: We now load conversation in the initial state, so no need for this effect

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (state.messages.length > 0) {
      localStorage.setItem(
        `conversation_${state.sessionId}`,
        JSON.stringify({
          messages: state.messages,
          artifacts: state.artifacts,
          lastUpdated: new Date().toISOString(),
        })
      )
    }
  }, [state.messages, state.artifacts, state.sessionId])

  const addMessage = useCallback(
    (message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }))

      return newMessage
    },
    []
  )

  const addUserMessage = useCallback(
    (content: string) => {
      return addMessage({
        type: "user",
        content,
      })
    },
    [addMessage]
  )

  const addAgentMessage = useCallback(
    (content: string, agentType: AgentType, response?: AgentResponse) => {
      return addMessage({
        type: "agent",
        content,
        agentType,
        metadata: response?.metadata
          ? {
              processingTime: response.metadata.processingTime,
              confidence: response.metadata.confidence,
            }
          : undefined,
      })
    },
    [addMessage]
  )

  const addSystemMessage = useCallback(
    (content: string) => {
      return addMessage({
        type: "system",
        content,
      })
    },
    [addMessage]
  )

  const setCurrentAgent = useCallback((agent: AgentType | null) => {
    setState(prev => ({
      ...prev,
      currentAgent: agent,
    }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }))
  }, [])

  const updateArtifact = useCallback(
    (type: keyof ConversationState["artifacts"], data: any) => {
      setState(prev => ({
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [type]: data,
        },
      }))
    },
    []
  )

  const clearConversation = useCallback(() => {
    const newSessionId = createSession()

    // Clear localStorage (only on client)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`conversation_${state.sessionId}`)
    }

    setState({
      messages: [],
      currentAgent: null,
      isLoading: false,
      sessionId: newSessionId,
      artifacts: {},
    })

    addSystemMessage(
      "New conversation started. How can I help you build your product today?"
    )
  }, [state.sessionId, createSession, addSystemMessage])

  const getLastUserMessage = useCallback(() => {
    const userMessages = state.messages.filter(m => m.type === "user")
    return userMessages[userMessages.length - 1]
  }, [state.messages])

  const getLastAgentMessage = useCallback(
    (agentType?: AgentType) => {
      const agentMessages = state.messages.filter(
        m => m.type === "agent" && (!agentType || m.agentType === agentType)
      )
      return agentMessages[agentMessages.length - 1]
    },
    [state.messages]
  )

  const getConversationContext = useCallback(() => {
    // Return recent conversation context for agent calls
    const recentMessages = state.messages.slice(-5).map(m => ({
      type: m.type,
      content: m.content,
      agentType: m.agentType,
    }))

    return {
      sessionId: state.sessionId,
      recentMessages,
      artifacts: state.artifacts,
      currentAgent: state.currentAgent,
    }
  }, [state])

  const exportConversation = useCallback(() => {
    const exportData = {
      sessionId: state.sessionId,
      messages: state.messages,
      artifacts: state.artifacts,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation_${state.sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state])

  const importConversation = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = e => {
          try {
            const data = JSON.parse(e.target?.result as string)

            setState(prev => ({
              ...prev,
              messages: data.messages || [],
              artifacts: data.artifacts || {},
              sessionId: data.sessionId || getCurrentSession(),
            }))

            addSystemMessage("Conversation imported successfully.")
            resolve()
          } catch (error) {
            reject(
              new Error("Failed to import conversation: Invalid file format")
            )
          }
        }

        reader.onerror = () => {
          reject(new Error("Failed to read file"))
        }

        reader.readAsText(file)
      })
    },
    [getCurrentSession, addSystemMessage]
  )

  // Statistics and insights
  const getConversationStats = useCallback(() => {
    const totalMessages = state.messages.length
    const userMessages = state.messages.filter(m => m.type === "user").length
    const agentMessages = state.messages.filter(m => m.type === "agent").length

    const agentUsage = state.messages
      .filter(m => m.type === "agent" && m.agentType)
      .reduce(
        (acc, m) => {
          const agent = m.agentType!
          acc[agent] = (acc[agent] || 0) + 1
          return acc
        },
        {} as Record<AgentType, number>
      )

    const averageProcessingTime = state.messages
      .filter(m => m.metadata?.processingTime)
      .reduce(
        (sum, m, _, arr) => sum + m.metadata!.processingTime! / arr.length,
        0
      )

    return {
      totalMessages,
      userMessages,
      agentMessages,
      agentUsage,
      averageProcessingTime,
      artifactCount: Object.keys(state.artifacts).length,
      sessionDuration:
        state.messages.length > 0 && state.messages[0].timestamp
          ? Date.now() - (state.messages[0].timestamp instanceof Date 
              ? state.messages[0].timestamp.getTime() 
              : new Date(state.messages[0].timestamp).getTime())
          : 0,
    }
  }, [state])

  return {
    // State
    messages: state.messages,
    currentAgent: state.currentAgent,
    isLoading: state.isLoading,
    sessionId: state.sessionId,
    artifacts: state.artifacts,

    // Message management
    addUserMessage,
    addAgentMessage,
    addSystemMessage,

    // Agent management
    setCurrentAgent,
    setLoading,

    // Artifact management
    updateArtifact,

    // Conversation management
    clearConversation,
    getLastUserMessage,
    getLastAgentMessage,
    getConversationContext,

    // Import/Export
    exportConversation,
    importConversation,

    // Analytics
    getConversationStats,
  }
}
