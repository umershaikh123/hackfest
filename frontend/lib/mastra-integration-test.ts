/**
 * Mastra Integration Test Utility
 * Tests the connection between frontend and live Mastra server
 */

import { mastraClient, type MastraAgentId } from './mastra-client'

export interface IntegrationTestResult {
  success: boolean
  agentId: MastraAgentId
  responseTime: number
  error?: string
  data?: any
}

export interface HealthCheckResult {
  mastraServer: {
    status: 'healthy' | 'unhealthy'
    details?: any
  }
  agents: {
    available: string[]
    tested: IntegrationTestResult[]
  }
  totalTime: number
}

/**
 * Test a specific Mastra agent
 */
export async function testMastraAgent(agentId: MastraAgentId): Promise<IntegrationTestResult> {
  const startTime = Date.now()
  
  try {
    let result
    
    switch (agentId) {
      case 'ideaGenerationAgent':
        result = await mastraClient.agents.ideaGeneration(
          'Test idea: A mobile app for tracking personal productivity habits'
        )
        break
        
      case 'userStoryGeneratorAgent':
        result = await mastraClient.agents.userStoryGeneration(
          { title: 'Test App', description: 'Test description' },
          [{ name: 'Test User', role: 'Test Role', demographics: 'Test Demo', needs: ['Test need'], painPoints: ['Test pain'], goals: ['Test goal'] }]
        )
        break
        
      case 'prdAgent':
        result = await mastraClient.agents.prdGeneration(
          { title: 'Test Product' },
          [],
          []
        )
        break
        
      case 'sprintPlannerAgent':
        result = await mastraClient.agents.sprintPlanning([
          { id: 'test', title: 'Test Story', priority: 'high', storyPoints: 3 }
        ])
        break
        
      case 'visualDesignAgent':
        result = await mastraClient.agents.visualDesign(
          'Test Project',
          'user_journey',
          { features: [], userPersonas: [], userStories: [] }
        )
        break
        
      case 'feedbackRouterAgent':
        result = await mastraClient.agents.feedbackRouting(
          'I want to refine my product idea',
          { currentStep: 'idea-generation' }
        )
        break
        
      default:
        throw new Error(`Unknown agent: ${agentId}`)
    }
    
    const responseTime = Date.now() - startTime
    
    return {
      success: result.success,
      agentId,
      responseTime,
      data: result.data,
      error: result.error,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      success: false,
      agentId,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test all available Mastra agents
 */
export async function testAllMastraAgents(): Promise<IntegrationTestResult[]> {
  const agents: MastraAgentId[] = [
    'ideaGenerationAgent',
    'userStoryGeneratorAgent',
    'prdAgent',
    'sprintPlannerAgent',
    'visualDesignAgent',
    'feedbackRouterAgent',
  ]
  
  console.log('🧪 Testing all Mastra agents...')
  
  const results = await Promise.allSettled(
    agents.map(async (agentId) => {
      console.log(`Testing ${agentId}...`)
      return await testMastraAgent(agentId)
    })
  )
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        agentId: agents[index],
        responseTime: 0,
        error: result.reason?.message || 'Test failed',
      }
    }
  })
}

/**
 * Complete health check of Mastra integration
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  console.log('🏥 Performing Mastra health check...')
  
  // Check server health
  const serverHealth = await mastraClient.health()
  
  // Get available agents
  let availableAgents: string[] = []
  try {
    const agents = await mastraClient.utils.createRequest('test')
    // This will be implemented when we have the actual API
    availableAgents = Object.keys(agents || {})
  } catch (error) {
    console.warn('Could not fetch available agents:', error)
    availableAgents = [
      'ideaGenerationAgent',
      'userStoryGeneratorAgent', 
      'prdAgent',
      'sprintPlannerAgent',
      'visualDesignAgent',
      'feedbackRouterAgent'
    ]
  }
  
  // Test agents
  const testedAgents = await testAllMastraAgents()
  
  const totalTime = Date.now() - startTime
  
  return {
    mastraServer: serverHealth,
    agents: {
      available: availableAgents,
      tested: testedAgents,
    },
    totalTime,
  }
}

/**
 * Run a simple integration test
 */
export async function runQuickIntegrationTest(): Promise<void> {
  console.log('🚀 Running quick Mastra integration test...')
  
  try {
    // Test server connectivity
    const health = await mastraClient.health()
    console.log('Server health:', health)
    
    if (health.status !== 'healthy') {
      throw new Error(`Mastra server is ${health.status}`)
    }
    
    // Test idea generation agent
    console.log('Testing idea generation agent...')
    const ideaResult = await testMastraAgent('ideaGenerationAgent')
    
    if (ideaResult.success) {
      console.log('✅ Idea generation test passed!')
      console.log(`Response time: ${ideaResult.responseTime}ms`)
    } else {
      console.log('❌ Idea generation test failed:', ideaResult.error)
    }
    
    // Test feedback router
    console.log('Testing feedback router agent...')
    const feedbackResult = await testMastraAgent('feedbackRouterAgent')
    
    if (feedbackResult.success) {
      console.log('✅ Feedback router test passed!')
      console.log(`Response time: ${feedbackResult.responseTime}ms`)
    } else {
      console.log('❌ Feedback router test failed:', feedbackResult.error)
    }
    
    console.log('🎉 Quick integration test completed!')
    
  } catch (error) {
    console.error('❌ Integration test failed:', error)
    throw error
  }
}

/**
 * Workflow integration test
 */
export async function testWorkflowIntegration(): Promise<void> {
  console.log('🔄 Testing workflow integration...')
  
  try {
    const workflow = new mastraClient.workflow()
    
    // Test a simple workflow
    const result = await workflow.runCompleteWorkflow(
      'A mobile app that helps users track their daily water intake and reminds them to stay hydrated'
    )
    
    console.log('✅ Workflow test completed!')
    console.log('Results summary:')
    console.log('- Idea:', result.idea ? '✅' : '❌')
    console.log('- User Stories:', result.userStories ? '✅' : '❌')
    console.log('- PRD:', result.prd ? '✅' : '❌')
    console.log('- Sprints:', result.sprints ? '✅' : '❌')
    console.log('- Visual:', result.visual ? '✅' : '❌')
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error)
    throw error
  }
}

/**
 * Frontend API route integration test
 */
export async function testFrontendAPIRoutes(): Promise<void> {
  console.log('🔌 Testing frontend API routes...')
  
  try {
    // Test idea generation API route
    const response = await fetch('/api/agents/idea-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test idea for API route integration',
        sessionId: 'test-session',
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API route failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Frontend API route test passed!')
      console.log('Response:', result.data)
    } else {
      console.log('❌ Frontend API route test failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Frontend API route test failed:', error)
    throw error
  }
}

export default {
  testAgent: testMastraAgent,
  testAllAgents: testAllMastraAgents,
  healthCheck: performHealthCheck,
  quickTest: runQuickIntegrationTest,
  workflowTest: testWorkflowIntegration,
  apiRouteTest: testFrontendAPIRoutes,
}