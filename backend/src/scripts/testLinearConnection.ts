// src/scripts/testLinearConnection.ts - Test Linear API connection
import dotenv from 'dotenv'

dotenv.config()

async function testLinearConnection() {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID
  
  console.log('🔍 Testing Linear API Connection...')
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'}`)
  console.log(`Team ID: ${teamId || 'Not found'}`)
  
  if (!apiKey) {
    console.error('❌ LINEAR_API_KEY not found')
    return
  }

  // Test 1: Simple viewer query
  console.log('\n1️⃣ Testing API authentication...')
  try {
    const viewerQuery = `
      query {
        viewer {
          id
          name
          email
        }
      }
    `

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ query: viewerQuery }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      throw new Error(`GraphQL: ${data.errors[0].message}`)
    }

    console.log('✅ Authentication successful')
    console.log(`👤 User: ${data.data.viewer.name} (${data.data.viewer.email})`)

  } catch (error) {
    console.error('❌ Authentication failed:', error.message)
    return
  }

  // Test 2: Teams query
  console.log('\n2️⃣ Testing teams access...')
  try {
    const teamsQuery = `
      query {
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    `

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ query: teamsQuery }),
    })

    const data = await response.json()
    
    if (data.errors) {
      throw new Error(`GraphQL: ${data.errors[0].message}`)
    }

    const teams = data.data.teams.nodes
    console.log(`✅ Found ${teams.length} teams`)
    
    teams.forEach((team: any) => {
      console.log(`   - ${team.name} (${team.key}): ${team.id}`)
      if (team.id === teamId) {
        console.log('     ⭐ This is your configured team!')
      }
    })

  } catch (error) {
    console.error('❌ Teams query failed:', error.message)
    return
  }

  // Test 3: Verify specific team ID
  if (teamId) {
    console.log('\n3️⃣ Testing specific team access...')
    try {
      const teamQuery = `
        query($teamId: String!) {
          team(id: $teamId) {
            id
            name
            key
            description
          }
        }
      `

      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
        },
        body: JSON.stringify({ 
          query: teamQuery,
          variables: { teamId }
        }),
      })

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`GraphQL: ${data.errors[0].message}`)
      }

      if (data.data.team) {
        console.log('✅ Team access verified')
        console.log(`📋 Team: ${data.data.team.name} (${data.data.team.key})`)
        console.log(`🔗 ID: ${data.data.team.id}`)
      } else {
        console.log('❌ Team not found with the provided ID')
      }

    } catch (error) {
      console.error('❌ Team verification failed:', error.message)
    }
  }

  console.log('\n🎯 Next steps:')
  console.log('If all tests passed, your Linear integration should work!')
  console.log('Run: npm run test:sprint')
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  testLinearConnection()
}

export { testLinearConnection }