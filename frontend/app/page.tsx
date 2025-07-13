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

  const handleAgentCall = async (agentType: AgentType, message: string) => {
    setCurrentStep(agentType)
    conversation.setCurrentAgent(agentType)
    conversation.setLoading(true)

    try {
      const context = conversation.getConversationContext()

      switch (agentType) {
        case "idea-generation":
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

      conversation.addUserMessage(message)
    } catch (error) {
      console.error("Agent call failed:", error)
    } finally {
      conversation.setLoading(false)
      setCurrentStep(null)
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
      if (results && typeof results === 'object') {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold gradient-text">
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
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Button
                variant="outline"
                onClick={conversation.clearConversation}
                disabled={workflow.isAnyGenerating}
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
          {/* Chat Interface */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  💬 AI Assistant
                  {workflow.isAnyGenerating && (
                    <Badge variant="secondary" className="ml-auto">
                      {currentStep
                        ? `${currentStep} processing...`
                        : "Processing..."}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Chat with our AI agents to transform your ideas into product
                  plans
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ChatInterface
                  onAgentCall={handleAgentCall}
                  onWorkflowRun={handleRunCompleteWorkflow}
                  conversation={conversation}
                  isLoading={workflow.isAnyGenerating}
                  currentAgent={conversation.currentAgent}
                />
              </CardContent>
            </Card>
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
