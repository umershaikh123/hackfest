"use client"

/**
 * Mastra Integration Test Page
 * Test the connection between frontend and live Mastra server
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useMastraAgents } from "@/hooks/use-mastra-agents"
import { AlertCircle, CheckCircle, Clock, Loader2, Zap } from "lucide-react"

export default function TestMastraPage() {
  const [testIdea, setTestIdea] = useState(
    "A mobile app that helps users track their daily water intake and reminds them to stay hydrated"
  )
  const [testResults, setTestResults] = useState<any[]>([])

  const {
    ideaGeneration,
    userStoryGeneration,
    prdGeneration,
    sprintPlanning,
    visualDesign,
    feedbackRouting,
    workflow,
    health,
    agentList,
    isAnyGenerating,
    resetAll,
  } = useMastraAgents()

  const addTestResult = (
    test: string,
    success: boolean,
    data?: any,
    error?: string
  ) => {
    setTestResults(prev => [
      ...prev,
      {
        test,
        success,
        data,
        error,
        timestamp: new Date(),
      },
    ])
  }

  // Individual agent test functions
  const testIdeaGeneration = async () => {
    console.log("🚀 Testing Idea Generation Agent...")
    try {
      const result = await ideaGeneration.generateIdeaAsync({
        idea: testIdea,
        context:
          "Please provide a comprehensive analysis with structured output including features, personas, and market validation.",
      })
      addTestResult("Idea Generation Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "Idea Generation Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testUserStoryGeneration = async () => {
    console.log("📝 Testing User Story Generation Agent...")
    try {
      // Use the idea from previous result or the test idea
      const productIdea = ideaGeneration.ideaData || {
        title: "Hydration Tracker App",
        description: testIdea,
      }

      const result = await userStoryGeneration.generateUserStoriesAsync({
        productIdea: productIdea,
        userPersonas: [], // Let the agent generate personas
      })
      addTestResult("User Story Generation Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "User Story Generation Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testPRDGeneration = async () => {
    console.log("📋 Testing PRD Generation Agent...")
    try {
      // Use real data from previous results
      const productIdea = ideaGeneration.ideaData || {
        title: "Test Product",
        description: testIdea,
      }
      const userStories = userStoryGeneration.userStoriesData || []

      const result = await prdGeneration.generatePRDAsync({
        productIdea: productIdea,
        userPersonas: [], // Will be extracted from idea or user stories
        userStories: userStories,
      })
      addTestResult("PRD Generation Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "PRD Generation Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testSprintPlanning = async () => {
    console.log("⚡ Testing Sprint Planning Agent...")
    try {
      // Use real user stories from previous results or create mock data
      const userStories = userStoryGeneration.userStoriesData || [
        {
          id: "US001",
          title: "User Registration",
          priority: "critical",
          storyPoints: 3,
          persona: "New User",
          userAction: "I want to create an account with email and password",
          benefit: "So that I can start using the app",
          acceptanceCriteria: ["Email validation works", "Password requirements met", "Account verification email sent"]
        },
        {
          id: "US002", 
          title: "User Login",
          priority: "critical",
          storyPoints: 2,
          persona: "Registered User",
          userAction: "I want to log in with my credentials",
          benefit: "So that I can access my account",
          acceptanceCriteria: ["Login form works", "Remember me option", "Password reset available"]
        }
      ]

      // Get product idea for context
      const productIdea = ideaGeneration.ideaData || {
        title: "Test App",
        description: testIdea
      }

      const result = await sprintPlanning.generateSprintPlanAsync({
        userStories: userStories,
        teamVelocity: 20,
        sprintDuration: 2,
        productTitle: productIdea.title || "Test App",
        features: [
          {
            name: "User Authentication",
            description: "Complete user registration and login system",
            priority: "high",
            acceptanceCriteria: ["Secure password handling", "Email verification", "Session management"]
          }
        ],
        createLinearProject: true,
      })
      addTestResult("Sprint Planning Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "Sprint Planning Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testVisualDesign = async () => {
    console.log("🎨 Testing Visual Design Agent...")
    try {
      // Use real data from previous results
      const prdContent = {
        features: prdGeneration.prdData?.features || [],
        userPersonas: ideaGeneration.ideaData?.userPersonas || [],
        userStories: userStoryGeneration.userStoriesData || [],
      }

      const result = await visualDesign.generateVisualDesignAsync({
        projectTitle: ideaGeneration.ideaData?.title || "Test Project",
        designType: "user_journey",
        prdContent: prdContent,
      })
      addTestResult("Visual Design Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "Visual Design Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testFeedbackRouting = async () => {
    console.log("🧭 Testing Feedback Routing Agent...")
    try {
      const result = await feedbackRouting.routeFeedbackAsync({
        feedback:
          "I want to refine my product idea further and add more advanced features",
        context: {
          currentStep: "idea-generation",
          hasIdea: !!ideaGeneration.ideaData,
          hasUserStories: !!userStoryGeneration.userStoriesData,
          hasPRD: !!prdGeneration.prdData,
        },
      })
      addTestResult("Feedback Routing Agent", true, result.data)
    } catch (error) {
      addTestResult(
        "Feedback Routing Agent",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const runSequentialTests = async () => {
    console.log("🔄 Running sequential agent tests with real data flow...")
    setTestResults([])

    try {
      // Test in sequence so each agent can use real data from previous
      await testIdeaGeneration()
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for completion

      await testUserStoryGeneration()
      await new Promise(resolve => setTimeout(resolve, 2000))

      await testPRDGeneration()
      await new Promise(resolve => setTimeout(resolve, 2000))

      await testSprintPlanning()
      await new Promise(resolve => setTimeout(resolve, 2000))

      await testVisualDesign()
      await new Promise(resolve => setTimeout(resolve, 2000))

      await testFeedbackRouting()
    } catch (error) {
      addTestResult(
        "Sequential Tests",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const runCompleteWorkflow = async () => {
    console.log("🔄 Running complete workflow...")
    setTestResults([])

    try {
      const results = await workflow.runCompleteWorkflow(testIdea)
      addTestResult("Complete Workflow", true, results)
    } catch (error) {
      addTestResult(
        "Complete Workflow",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  const testFrontendAPIRoute = async () => {
    console.log("🔌 Testing frontend API route...")
    setTestResults([])

    try {
      const response = await fetch("/api/agents/idea-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testIdea,
          sessionId: "test-session",
        }),
      })

      if (!response.ok) {
        throw new Error(
          `API route failed: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()
      addTestResult(
        "Frontend API Route",
        result.success,
        result.data,
        result.error
      )
    } catch (error) {
      addTestResult(
        "Frontend API Route",
        false,
        null,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Mastra Integration Test</h1>
        <p className="text-lg text-muted-foreground">
          Test the connection between frontend and live Mastra server at
          localhost:4111
        </p>
      </div>

      {/* Server Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Mastra Server Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {health.isLoading ? (
              <Badge variant="secondary">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </Badge>
            ) : health.data?.status === "healthy" ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-4 h-4 mr-2" />
                Healthy
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-4 h-4 mr-2" />
                Unhealthy
              </Badge>
            )}

            {health.data?.details && (
              <span className="text-sm text-muted-foreground">
                {JSON.stringify(health.data.details)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Available Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {agentList.data &&
              Object.entries(agentList.data).map(
                ([id, agent]: [string, any]) => (
                  <Badge key={id} variant="outline">
                    {agent.name || id}
                  </Badge>
                )
              )}
          </div>
        </CardContent>
      </Card>

      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Product Idea</label>
            <Textarea
              value={testIdea}
              onChange={e => setTestIdea(e.target.value)}
              placeholder="Enter a product idea to test with..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Individual Agent Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Agent Tests</CardTitle>
          <CardDescription>
            Test each AI agent individually with real data flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              onClick={testIdeaGeneration}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {ideaGeneration.isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              🚀 Idea
            </Button>

            <Button
              onClick={testUserStoryGeneration}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {userStoryGeneration.isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              📝 Stories
            </Button>

            <Button
              onClick={testPRDGeneration}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {prdGeneration.isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              📋 PRD
            </Button>

            <Button
              onClick={testSprintPlanning}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {sprintPlanning.isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              ⚡ Sprint
            </Button>

            <Button
              onClick={testVisualDesign}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {visualDesign.isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              🎨 Visual
            </Button>

            <Button
              onClick={testFeedbackRouting}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              {feedbackRouting.isRouting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              🧭 Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Tests</CardTitle>
          <CardDescription>
            Run different types of workflow tests with real data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={runSequentialTests}
              disabled={isAnyGenerating}
              className="w-full"
            >
              {isAnyGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              🔄 Sequential Tests
            </Button>

            <Button
              onClick={runCompleteWorkflow}
              disabled={isAnyGenerating}
              className="w-full"
            >
              {workflow.isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              🚀 Complete Workflow
            </Button>

            <Button
              onClick={testFrontendAPIRoute}
              disabled={isAnyGenerating}
              variant="outline"
              className="w-full"
            >
              🔌 API Route Test
            </Button>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <Button
              onClick={resetAll}
              variant="ghost"
              disabled={isAnyGenerating}
            >
              🔄 Reset All Tests
            </Button>

            {isAnyGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Test in progress...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      {workflow.isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Step: {workflow.currentStep}</span>
                <span>{workflow.completedSteps.length}/5 completed</span>
              </div>
              <Progress value={(workflow.completedSteps.length / 5) * 100} />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Completed Steps:</h4>
              <div className="flex flex-wrap gap-2">
                {workflow.completedSteps.map((step, index) => (
                  <Badge key={index} variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {step}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <Alert
                key={index}
                className={
                  result.success ? "border-green-500" : "border-red-500"
                }
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.test}</h4>
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>

                    {result.error && (
                      <AlertDescription className="text-red-600">
                        {result.error}
                      </AlertDescription>
                    )}

                    {result.data && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agent States Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Agent States (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>🚀 Idea Generation:</strong>
              <div>Loading: {ideaGeneration.isGenerating ? "Yes" : "No"}</div>
              <div>Success: {ideaGeneration.isSuccess ? "Yes" : "No"}</div>
              <div>Has Data: {ideaGeneration.ideaData ? "Yes" : "No"}</div>
              <div>Error: {ideaGeneration.error || "None"}</div>
            </div>

            <div>
              <strong>📝 User Stories:</strong>
              <div>
                Loading: {userStoryGeneration.isGenerating ? "Yes" : "No"}
              </div>
              <div>Success: {userStoryGeneration.isSuccess ? "Yes" : "No"}</div>
              <div>
                Has Data: {userStoryGeneration.userStoriesData ? "Yes" : "No"}
              </div>
              <div>Error: {userStoryGeneration.error || "None"}</div>
            </div>

            <div>
              <strong>📋 PRD:</strong>
              <div>Loading: {prdGeneration.isGenerating ? "Yes" : "No"}</div>
              <div>Success: {prdGeneration.isSuccess ? "Yes" : "No"}</div>
              <div>Has Data: {prdGeneration.prdData ? "Yes" : "No"}</div>
              <div>Error: {prdGeneration.error || "None"}</div>
            </div>

            <div>
              <strong>⚡ Sprint Planning:</strong>
              <div>Loading: {sprintPlanning.isGenerating ? "Yes" : "No"}</div>
              <div>Success: {sprintPlanning.isSuccess ? "Yes" : "No"}</div>
              <div>Has Data: {sprintPlanning.sprintData ? "Yes" : "No"}</div>
              <div>Error: {sprintPlanning.error || "None"}</div>
            </div>

            <div>
              <strong>🎨 Visual Design:</strong>
              <div>Loading: {visualDesign.isGenerating ? "Yes" : "No"}</div>
              <div>Success: {visualDesign.isSuccess ? "Yes" : "No"}</div>
              <div>Has Data: {visualDesign.visualData ? "Yes" : "No"}</div>
              <div>Error: {visualDesign.error || "None"}</div>
            </div>

            <div>
              <strong>🧭 Feedback Routing:</strong>
              <div>Loading: {feedbackRouting.isRouting ? "Yes" : "No"}</div>
              <div>Success: {feedbackRouting.isSuccess ? "Yes" : "No"}</div>
              <div>Has Data: {feedbackRouting.routingData ? "Yes" : "No"}</div>
              <div>Error: {feedbackRouting.error || "None"}</div>
            </div>

            <div>
              <strong>🔄 Workflow:</strong>
              <div>Running: {workflow.isRunning ? "Yes" : "No"}</div>
              <div>Step: {workflow.currentStep || "None"}</div>
              <div>Completed: {workflow.completedSteps.length}/5</div>
              <div>Error: {workflow.error || "None"}</div>
            </div>

            <div>
              <strong>🏥 System Health:</strong>
              <div>Server: {health.data?.status || "Unknown"}</div>
              <div>
                Agents:{" "}
                {agentList.data ? Object.keys(agentList.data).length : 0}
              </div>
              <div>Any Loading: {isAnyGenerating ? "Yes" : "No"}</div>
              <div>Health Loading: {health.isLoading ? "Yes" : "No"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
