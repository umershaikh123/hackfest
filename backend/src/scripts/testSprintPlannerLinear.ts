// src/scripts/testSprintPlannerLinear.ts - Test Sprint Planner with Linear Integration
import dotenv from 'dotenv'

dotenv.config()

async function testSprintPlannerWithLinear() {
  console.log('🚀 Testing Sprint Planner with Linear Integration')
  console.log('=' .repeat(60))

  // Check environment variables
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID

  if (!apiKey || apiKey === 'your_new_api_key_here') {
    console.error('❌ Please set a valid LINEAR_API_KEY in your .env file')
    console.log('Get your API key from: https://linear.app/settings/api')
    return
  }

  if (!teamId) {
    console.error('❌ Please set LINEAR_TEAM_ID in your .env file')
    console.log('Run: npx tsx src/scripts/getLinearTeamId.ts')
    return
  }

  try {
    // Import the sprint planner tool
    const { sprintPlannerTool } = await import('../mastra/tools/sprintPlannerTool.js')

    const testInput = {
      productTitle: "Linear Integration Test",
      features: [
        {
          name: "User Authentication",
          description: "Basic login and registration system",
          acceptanceCriteria: ["Login form", "Registration form", "Password reset"],
          priority: "high" as const,
        },
      ],
      userStories: [
        {
          id: "US001",
          title: "User can log in",
          persona: "App User",
          userAction: "log in with email and password",
          benefit: "I can access my account",
          acceptanceCriteria: ["Email field", "Password field", "Login button", "Error handling"],
          priority: "high" as const,
          storyPoints: 5,
        },
        {
          id: "US002", 
          title: "User can register",
          persona: "New User",
          userAction: "create a new account",
          benefit: "I can start using the app",
          acceptanceCriteria: ["Registration form", "Email verification", "Account creation"],
          priority: "high" as const,
          storyPoints: 8,
        },
      ],
      teamSize: 3,
      sprintLength: "2 weeks" as const,
      totalSprints: 1,
      createLinearProject: true,
      linearTeamId: teamId,
    }

    console.log('🔄 Running sprint planner with Linear integration...')
    console.log(`📋 Team ID: ${teamId}`)
    console.log(`👥 Team Size: ${testInput.teamSize}`)
    console.log(`📝 User Stories: ${testInput.userStories.length}`)

    const result = await sprintPlannerTool.execute({
      context: testInput,
      runtimeContext: {},
    })

    console.log('\n✅ Sprint Planner Results:')
    console.log(`📊 Sprints Generated: ${result.sprints.length}`)
    console.log(`🎯 Sprint Velocity: ${result.summary.sprintVelocity}`)
    console.log(`⏱️  Duration: ${result.summary.estimatedDuration}`)

    if (result.linearIntegration.enabled) {
      console.log('\n🔗 Linear Integration Results:')
      console.log(`✅ Enabled: ${result.linearIntegration.enabled}`)
      console.log(`📅 Cycles Created: ${result.linearIntegration.cyclesCreated?.length || 0}`)
      console.log(`📝 Issues Created: ${result.linearIntegration.issuesCreated?.length || 0}`)

      if (result.linearIntegration.cyclesCreated?.length > 0) {
        console.log('\n📅 Created Cycles:')
        result.linearIntegration.cyclesCreated.forEach(cycle => {
          console.log(`  - ${cycle.cycleName}`)
          console.log(`    ID: ${cycle.cycleId}`)
          if (cycle.linearUrl) {
            console.log(`    URL: ${cycle.linearUrl}`)
          }
        })
      }

      if (result.linearIntegration.issuesCreated?.length > 0) {
        console.log('\n📝 Created Issues:')
        result.linearIntegration.issuesCreated.forEach(issue => {
          console.log(`  - ${issue.issueIdentifier}: ${issue.title}`)
        })
      }

      if (result.linearIntegration.errors?.length > 0) {
        console.log('\n❌ Linear Integration Errors:')
        result.linearIntegration.errors.forEach(error => {
          console.log(`  - ${error}`)
        })
      }
    } else {
      console.log('\n⚠️ Linear Integration: Disabled')
      if (result.linearIntegration.errors?.length > 0) {
        console.log('Errors:')
        result.linearIntegration.errors.forEach(error => {
          console.log(`  - ${error}`)
        })
      }
    }

    console.log('\n🎉 Test completed successfully!')
    return result

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n🔑 API Key Issue:')
      console.log('- Check your LINEAR_API_KEY in .env')
      console.log('- Generate new key at: https://linear.app/settings/api')
    }
    
    if (error.message.includes('Team not found')) {
      console.log('\n👥 Team ID Issue:')
      console.log('- Check your LINEAR_TEAM_ID in .env')
      console.log('- Run: npx tsx src/scripts/getLinearTeamId.ts')
    }
    
    throw error
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSprintPlannerWithLinear()
}

export { testSprintPlannerWithLinear }