// src/scripts/getLinearTeamId.ts - Helper script to get Linear Team ID
import dotenv from 'dotenv'

dotenv.config()

async function getLinearTeamId() {
  const apiKey = process.env.LINEAR_API_KEY
  
  if (!apiKey) {
    console.error('❌ LINEAR_API_KEY not found in environment variables')
    console.log('Please add your Linear API key to .env file:')
    console.log('LINEAR_API_KEY=your_api_key_here')
    return
  }

  const query = `
    query {
      teams {
        nodes {
          id
          name
          key
          description
        }
      }
    }
  `

  try {
    console.log('🔍 Fetching Linear teams...')
    
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`)
    }

    const teams = data.data.teams.nodes

    if (teams.length === 0) {
      console.log('⚠️ No teams found in your Linear workspace')
      return
    }

    console.log('\n📋 Available Teams:')
    console.log('='.repeat(50))
    
    teams.forEach((team: any, index: number) => {
      console.log(`${index + 1}. ${team.name} (${team.key})`)
      console.log(`   ID: ${team.id}`)
      if (team.description) {
        console.log(`   Description: ${team.description}`)
      }
      console.log()
    })

    console.log('💡 To use sprint planning with Linear:')
    console.log('1. Copy one of the Team IDs above')
    console.log('2. Add it to your .env file:')
    console.log(`   LINEAR_TEAM_ID=${teams[0].id}`)
    console.log('3. Run the sprint planner test again')

    return teams

  } catch (error) {
    console.error('❌ Error fetching Linear teams:', error.message)
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n🔑 API Key Issues:')
      console.log('- Check that your LINEAR_API_KEY is correct')
      console.log('- Make sure the API key has the right permissions')
      console.log('- Generate a new API key at: https://linear.app/settings/api')
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  getLinearTeamId()
}

export { getLinearTeamId }