"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ResultsDashboard } from "@/components/results-dashboard"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useMastraAgents } from "@/hooks/use-mastra-agents"
import { useConversation } from "@/hooks/use-conversation"
import { AgentType } from "@/lib/agents"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function ProductMaestroApp() {
  const [showResults, setShowResults] = useState(false)
  const [currentStep, setCurrentStep] = useState<AgentType | null>(null)
  const [processedResponses, setProcessedResponses] = useState<Set<string>>(
    new Set()
  )

  const mastraAgents = useMastraAgents()
  const conversation = useConversation()

  // Show results panel when we have any artifacts
  useEffect(() => {
    const hasArtifacts = mastraAgents.ideaGeneration.ideaData ||
      mastraAgents.userStoryGeneration.userStoriesData ||
      mastraAgents.prdGeneration.prdData ||
      mastraAgents.sprintPlanning.sprintData ||
      mastraAgents.visualDesign.visualData
    if (hasArtifacts && !showResults) {
      setShowResults(true)
    }
  }, [
    mastraAgents.ideaGeneration.ideaData,
    mastraAgents.userStoryGeneration.userStoriesData,
    mastraAgents.prdGeneration.prdData,
    mastraAgents.sprintPlanning.sprintData,
    mastraAgents.visualDesign.visualData,
    showResults
  ])

  // Monitor agent responses and add them to conversation
  useEffect(() => {
    console.log("Idea generation effect check:", {
      isSuccess: mastraAgents.ideaGeneration.isSuccess,
      hasData: !!mastraAgents.ideaGeneration.ideaData,
      alreadyProcessed: processedResponses.has("idea-generation"),
      data: mastraAgents.ideaGeneration.ideaData,
    })

    if (
      mastraAgents.ideaGeneration.isSuccess &&
      mastraAgents.ideaGeneration.ideaData &&
      !processedResponses.has("idea-generation")
    ) {
      const response = mastraAgents.ideaGeneration.ideaData
      console.log("Adding idea generation response to conversation:", response)
      const message = conversation.addAgentMessage(
        response.text ||
          response.refinedIdea ||
          "I've processed your idea! Here's my analysis:",
        "idea-generation"
      )
      console.log("Agent message added:", message)
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("idea-generation"))
    }
  }, [
    mastraAgents.ideaGeneration.isSuccess,
    mastraAgents.ideaGeneration.ideaData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      mastraAgents.userStoryGeneration.isSuccess &&
      mastraAgents.userStoryGeneration.userStoriesData &&
      !processedResponses.has("user-story")
    ) {
      const response = mastraAgents.userStoryGeneration.userStoriesData
      console.log("User stories completed:", response)
      conversation.addAgentMessage(
        response.text || "I've generated user stories for your product!",
        "user-story"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("user-story"))
    }
  }, [
    mastraAgents.userStoryGeneration.isSuccess,
    mastraAgents.userStoryGeneration.userStoriesData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      mastraAgents.prdGeneration.isSuccess &&
      mastraAgents.prdGeneration.prdData &&
      !processedResponses.has("prd")
    ) {
      const response = mastraAgents.prdGeneration.prdData
      console.log("PRD completed:", response)
      conversation.addAgentMessage(
        response.text ||
          response.content ||
          "I've created a comprehensive PRD for your product!",
        "prd"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("prd"))
    }
  }, [
    mastraAgents.prdGeneration.isSuccess,
    mastraAgents.prdGeneration.prdData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      mastraAgents.sprintPlanning.isSuccess &&
      mastraAgents.sprintPlanning.sprintData &&
      !processedResponses.has("sprint-planner")
    ) {
      const response = mastraAgents.sprintPlanning.sprintData
      console.log("Sprint plan completed:", response)
      conversation.addAgentMessage(
        response.text ||
          response.content ||
          "I've created a sprint plan for your product!",
        "sprint-planner"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("sprint-planner"))
    }
  }, [
    mastraAgents.sprintPlanning.isSuccess,
    mastraAgents.sprintPlanning.sprintData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      mastraAgents.visualDesign.isSuccess &&
      mastraAgents.visualDesign.visualData &&
      !processedResponses.has("visual-design")
    ) {
      const response = mastraAgents.visualDesign.visualData
      console.log("Visual design completed:", response)
      conversation.addAgentMessage(
        response.text ||
          response.content ||
          "I've created visual designs for your product!",
        "visual-design"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("visual-design"))
    }
  }, [
    mastraAgents.visualDesign.isSuccess,
    mastraAgents.visualDesign.visualData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  const handleAgentCall = async (agentType: AgentType, message: string) => {
    setCurrentStep(agentType)
    conversation.setCurrentAgent(agentType)
    conversation.setLoading(true)

    // Add user message first
    conversation.addUserMessage(message)

    try {
      const context = conversation.getConversationContext()
      console.log(`Calling ${agentType} agent with message:`, message)

      // Reset processed responses for this agent type to allow new responses
      setProcessedResponses(prev => {
        const newSet = new Set(prev)
        newSet.delete(agentType)
        return newSet
      })
    } catch (error) {
      console.error("Agent call failed:", error)
      conversation.addSystemMessage(
        `❌ Failed to call ${agentType} agent: ${error}`
      )
    }

    // Actually call the agent (this was missing!)
    const context = conversation.getConversationContext()

    switch (agentType) {
      case "idea-generation":
        console.log("Calling generateIdea with:", { message, context })
        mastraAgents.ideaGeneration.generateIdea({ 
          idea: message, 
          context: JSON.stringify(context)
        })
        break
      case "user-story":
        mastraAgents.userStoryGeneration.generateUserStories({
          productIdea: mastraAgents.ideaGeneration.ideaData || { title: "Product", description: message },
          userPersonas: []
        })
        break
      case "prd":
        mastraAgents.prdGeneration.generatePRD({
          productIdea: mastraAgents.ideaGeneration.ideaData || { title: "Product", description: message },
          userPersonas: [],
          userStories: mastraAgents.userStoryGeneration.userStoriesData || []
        })
        break
      case "sprint-planner":
        mastraAgents.sprintPlanning.generateSprintPlan({
          userStories: mastraAgents.userStoryGeneration.userStoriesData || [],
          teamVelocity: 20,
          sprintDuration: 2
        })
        break
      case "visual-design":
        mastraAgents.visualDesign.generateVisualDesign({
          projectTitle: mastraAgents.ideaGeneration.ideaData?.title || "Product Vision",
          designType: "user_journey",
          prdContent: {
            features: mastraAgents.ideaGeneration.ideaData?.features || [],
            userPersonas: [],
            userStories: mastraAgents.userStoryGeneration.userStoriesData || []
          }
        })
        break
      case "feedback":
        mastraAgents.feedbackRouting.routeFeedback({
          feedback: message,
          context: {
            currentStep: "feedback",
            hasIdea: !!mastraAgents.ideaGeneration.ideaData,
            hasUserStories: !!mastraAgents.userStoryGeneration.userStoriesData,
            hasPRD: !!mastraAgents.prdGeneration.prdData,
          }
        })
        break
    }
  }

  const handleRunCompleteWorkflow = async (initialIdea: string) => {
    conversation.addUserMessage(initialIdea)
    conversation.addSystemMessage(
      "Starting complete product development workflow..."
    )

    try {
      const results = await mastraAgents.workflow.runCompleteWorkflow(initialIdea)
      conversation.addSystemMessage(
        "✅ Complete workflow finished successfully!"
      )

      // Update artifacts in conversation
      if (results && typeof results === "object") {
        Object.entries(results).forEach(([key, value]) => {
          conversation.updateArtifact(key as keyof typeof results, value)
        })
      }
    } catch (error) {
      conversation.addSystemMessage(
        "❌ Workflow failed. Please try individual agents."
      )
      console.error("Workflow failed:", error)
    }
  }

  const handleRunSequentialWorkflow = async (initialIdea: string) => {
    conversation.addUserMessage(initialIdea)
    conversation.addSystemMessage(
      "🔄 Starting sequential agent workflow..."
    )

    try {
      // Step 1: Generate refined idea
      conversation.addSystemMessage("🚀 Step 1: Generating refined idea...")
      await mastraAgents.ideaGeneration.generateIdeaAsync({ 
        idea: initialIdea, 
        context: "Please provide a comprehensive analysis with structured output including features, personas, and market validation."
      })

      // Wait for completion and check result
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (!mastraAgents.ideaGeneration.isSuccess || !mastraAgents.ideaGeneration.ideaData) {
        throw new Error("Idea generation failed")
      }

      // Step 2: Generate user stories
      conversation.addSystemMessage("📝 Step 2: Generating user stories...")
      await mastraAgents.userStoryGeneration.generateUserStoriesAsync({
        productIdea: mastraAgents.ideaGeneration.ideaData,
        userPersonas: []
      })

      await new Promise(resolve => setTimeout(resolve, 2000))
      if (!mastraAgents.userStoryGeneration.isSuccess) {
        throw new Error("User story generation failed")
      }

      // Step 3: Generate PRD
      conversation.addSystemMessage("📋 Step 3: Generating PRD...")
      await mastraAgents.prdGeneration.generatePRDAsync({
        productIdea: mastraAgents.ideaGeneration.ideaData,
        userPersonas: [],
        userStories: mastraAgents.userStoryGeneration.userStoriesData || []
      })

      await new Promise(resolve => setTimeout(resolve, 2000))
      if (!mastraAgents.prdGeneration.isSuccess) {
        throw new Error("PRD generation failed")
      }

      // Step 4: Generate sprint plan
      conversation.addSystemMessage("⚡ Step 4: Generating sprint plan...")
      await mastraAgents.sprintPlanning.generateSprintPlanAsync({
        userStories: mastraAgents.userStoryGeneration.userStoriesData || [],
        teamVelocity: 20,
        sprintDuration: 2
      })

      await new Promise(resolve => setTimeout(resolve, 2000))
      if (!mastraAgents.sprintPlanning.isSuccess) {
        throw new Error("Sprint planning failed")
      }

      // Step 5: Generate visual design
      conversation.addSystemMessage("🎨 Step 5: Generating visual design...")
      await mastraAgents.visualDesign.generateVisualDesignAsync({
        projectTitle: mastraAgents.ideaGeneration.ideaData?.title || "Product Vision",
        designType: "user_journey",
        prdContent: {
          features: mastraAgents.ideaGeneration.ideaData?.features || [],
          userPersonas: [],
          userStories: mastraAgents.userStoryGeneration.userStoriesData || []
        }
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      conversation.addSystemMessage(
        "✅ Sequential workflow completed successfully! All artifacts generated."
      )
    } catch (error) {
      conversation.addSystemMessage(
        `❌ Sequential workflow failed at: ${error}. You can continue with individual agents.`
      )
      console.error("Sequential workflow failed:", error)
    }
  }

  const getProgress = () => {
    const steps = [
      mastraAgents.ideaGeneration.ideaData,
      mastraAgents.userStoryGeneration.userStoriesData,
      mastraAgents.prdGeneration.prdData,
      mastraAgents.sprintPlanning.sprintData,
      mastraAgents.visualDesign.visualData
    ]
    const completed = steps.filter(step => !!step).length
    return (completed / steps.length) * 100
  }

  const getCompletedSteps = () => {
    return {
      idea: !!mastraAgents.ideaGeneration.ideaData,
      userStories: !!mastraAgents.userStoryGeneration.userStoriesData,
      prd: !!mastraAgents.prdGeneration.prdData,
      sprints: !!mastraAgents.sprintPlanning.sprintData,
      visual: !!mastraAgents.visualDesign.visualData,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5  ">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm  ">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 message-enter">
              <h1 className="text-4xl font-bold gradient-text ">
                🚀 Product Maestro
              </h1>
              <h2 className="text-xl text-muted-foreground">
                AI-Powered No-Code IDE for Product Managers
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Transform your raw ideas into structured development plans with
                intelligent AI agents
              </p>
            </div>
            <div
              className="flex items-center gap-4 message-enter"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="smooth-transition  ">
                <ThemeSwitcher />
              </div>
              <Button
                variant="outline"
                onClick={conversation.clearConversation}
                disabled={mastraAgents.isAnyGenerating}
                className="btn-hover"
              >
                New Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      {showResults && (
        <div className="border-b border-border/50 bg-card/30">
          <div className="container mx-auto px-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Development Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round(getProgress())}% Complete
                </span>
              </div>
              <Progress value={getProgress()} className="h-2" />
              <div className="flex gap-2 flex-wrap">
                {Object.entries(getCompletedSteps()).map(
                  ([step, completed]) => (
                    <Badge
                      key={step}
                      variant={completed ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {step === "userStories"
                        ? "User Stories"
                        : step === "prd"
                          ? "PRD"
                          : step.charAt(0).toUpperCase() + step.slice(1)}
                      {completed && " ✓"}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div
          className={`grid gap-8 ${showResults ? "lg:grid-cols-2" : "lg:grid-cols-1"} transition-all duration-500`}
        >
          <div className="glassmorphism rounded-xl border border-border/50 h-[600px] flex flex-col">
            <ChatInterface
              onAgentCall={handleAgentCall}
              onWorkflowRun={handleRunCompleteWorkflow}
              onSequentialWorkflow={handleRunSequentialWorkflow}
              conversation={conversation}
              isLoading={mastraAgents.isAnyGenerating}
              currentAgent={conversation.currentAgent}
            />
          </div>

          {/* Results Dashboard */}
          {showResults && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Generated Artifacts
                  </CardTitle>
                  <CardDescription>
                    View and manage your product development artifacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultsDashboard
                    artifacts={{
                      idea: mastraAgents.ideaGeneration.ideaData,
                      userStories: mastraAgents.userStoryGeneration.userStoriesData,
                      prd: mastraAgents.prdGeneration.prdData,
                      sprints: mastraAgents.sprintPlanning.sprintData,
                      visual: mastraAgents.visualDesign.visualData
                    }}
                    conversation={conversation}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <ProductMaestroApp />
    </>
  )
}
