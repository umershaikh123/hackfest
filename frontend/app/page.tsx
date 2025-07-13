"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ResultsDashboard } from "@/components/results-dashboard"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { QueryProvider } from "@/components/providers/query-provider"
import { useWorkflow } from "@/hooks/use-agents"
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

  const workflow = useWorkflow()
  const conversation = useConversation()

  // Show results panel when we have any artifacts
  useEffect(() => {
    const hasArtifacts = Object.values(workflow.allResults).some(
      result => result !== undefined
    )
    if (hasArtifacts && !showResults) {
      setShowResults(true)
    }
  }, [workflow.allResults, showResults])

  // Monitor agent responses and add them to conversation
  useEffect(() => {
    console.log("Idea generation effect check:", {
      isSuccess: workflow.ideaGeneration.isSuccess,
      hasData: !!workflow.ideaGeneration.ideaData,
      alreadyProcessed: processedResponses.has("idea-generation"),
      data: workflow.ideaGeneration.ideaData,
    })

    if (
      workflow.ideaGeneration.isSuccess &&
      workflow.ideaGeneration.ideaData &&
      !processedResponses.has("idea-generation")
    ) {
      const response = workflow.ideaGeneration.ideaData
      console.log("Adding idea generation response to conversation:", response)
      const message = conversation.addAgentMessage(
        `✨ I've refined your idea!\n\n**Refined Idea:** ${response.refinedIdea}\n\n**Key Features:**\n${response.features.map(f => `• ${f}`).join("\n")}\n\n**Target Audience:** ${response.targetAudience}\n\n**Problem Statement:** ${response.problemStatement}`,
        "idea-generation"
      )
      console.log("Agent message added:", message)
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("idea-generation"))
    }
  }, [
    workflow.ideaGeneration.isSuccess,
    workflow.ideaGeneration.ideaData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      workflow.userStoryGenerator.isSuccess &&
      workflow.userStoryGenerator.userStories &&
      !processedResponses.has("user-story")
    ) {
      const response = workflow.userStoryGenerator.userStories
      console.log("User stories completed:", response)
      conversation.addAgentMessage(
        `📝 I've generated user stories for your product!\n\n**User Stories:**\n${response.userStories.map(story => `• **${story.title}** (${story.priority} priority, ${story.storyPoints} points)\n  ${story.description}`).join("\n\n")}`,
        "user-story"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("user-story"))
    }
  }, [
    workflow.userStoryGenerator.isSuccess,
    workflow.userStoryGenerator.userStories,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      workflow.prdGenerator.isSuccess &&
      workflow.prdGenerator.prdData &&
      !processedResponses.has("prd")
    ) {
      const response = workflow.prdGenerator.prdData
      console.log("PRD completed:", response)
      conversation.addAgentMessage(
        `📋 I've created a comprehensive PRD for your product!\n\n**PRD ID:** ${response.prdId}\n**Word Count:** ${response.wordCount}\n**Sections:** ${response.sections.join(", ")}\n${response.notionUrl ? `\n**Notion URL:** ${response.notionUrl}` : ""}`,
        "prd"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("prd"))
    }
  }, [
    workflow.prdGenerator.isSuccess,
    workflow.prdGenerator.prdData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      workflow.sprintPlanner.isSuccess &&
      workflow.sprintPlanner.sprintData &&
      !processedResponses.has("sprint-planner")
    ) {
      const response = workflow.sprintPlanner.sprintData
      console.log("Sprint plan completed:", response)
      conversation.addAgentMessage(
        `🎯 I've created a sprint plan for your product!\n\n**Sprints:**\n${response.sprints.map(sprint => `• **${sprint.name}** (${sprint.duration} weeks)\n  ${sprint.tasks.length} tasks planned`).join("\n\n")}\n${response.linearUrl ? `\n**Linear URL:** ${response.linearUrl}` : ""}`,
        "sprint-planner"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("sprint-planner"))
    }
  }, [
    workflow.sprintPlanner.isSuccess,
    workflow.sprintPlanner.sprintData,
    processedResponses,
    conversation.addAgentMessage,
    conversation.setLoading,
  ])

  useEffect(() => {
    if (
      workflow.visualDesign.isSuccess &&
      workflow.visualDesign.visualData &&
      !processedResponses.has("visual-design")
    ) {
      const response = workflow.visualDesign.visualData
      console.log("Visual design completed:", response)
      conversation.addAgentMessage(
        `🎨 I've created visual designs for your product!\n\n**Board ID:** ${response.boardId}\n**Artifacts:** ${response.artifacts.map(a => `${a.type} (${a.elementCount} elements)`).join(", ")}\n\n**Miro Board:** ${response.boardUrl}`,
        "visual-design"
      )
      conversation.setLoading(false)
      setProcessedResponses(prev => new Set(prev).add("visual-design"))
    }
  }, [
    workflow.visualDesign.isSuccess,
    workflow.visualDesign.visualData,
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
        workflow.ideaGeneration.generateIdea({ message, context })
        break
      case "user-story":
        workflow.userStoryGenerator.generateUserStories({ message, context })
        break
      case "prd":
        workflow.prdGenerator.generatePRD({ message, context })
        break
      case "sprint-planner":
        workflow.sprintPlanner.generateSprintPlan({ message, context })
        break
      case "visual-design":
        workflow.visualDesign.generateVisualDesign({ message, context })
        break
      case "feedback":
        // Handle feedback routing
        break
    }
  }

  const handleRunCompleteWorkflow = async (initialIdea: string) => {
    conversation.addUserMessage(initialIdea)
    conversation.addSystemMessage(
      "Starting complete product development workflow..."
    )

    try {
      const results = await workflow.runCompleteWorkflow(initialIdea)
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

  const getProgress = () => {
    const steps = ["idea", "userStories", "prd", "sprints", "visual"] as const
    const completed = steps.filter(step => workflow.allResults[step]).length
    return (completed / steps.length) * 100
  }

  const getCompletedSteps = () => {
    const results = workflow.allResults
    return {
      idea: !!results.idea,
      userStories: !!results.userStories,
      prd: !!results.prd,
      sprints: !!results.sprints,
      visual: !!results.visual,
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
                disabled={workflow.isAnyGenerating}
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
              conversation={conversation}
              isLoading={workflow.isAnyGenerating}
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
                    artifacts={workflow.allResults}
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
    <QueryProvider>
      <ProductMaestroApp />
    </QueryProvider>
  )
}
