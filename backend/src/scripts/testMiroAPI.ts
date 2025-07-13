// src/scripts/testMiroAPI.ts - Debug Miro API Integration
import dotenv from 'dotenv'

dotenv.config()

async function testMiroAPI() {
  console.log("🚀 Starting Miro API Test...")
  
  const apiKey = process.env.MIRO_API_KEY
  
  if (!apiKey) {
    console.error("❌ MIRO_API_KEY not found in environment")
    console.log("Available env vars:", Object.keys(process.env).filter(k => k.includes('MIRO')))
    return
  }

  console.log("🔍 Testing Miro API Integration...")
  console.log("🔑 API Key:", apiKey.substring(0, 20) + "...")
  console.log("🔑 API Key length:", apiKey.length)

  try {
    // Test 1: Basic API connectivity
    console.log("\n1️⃣ Testing API connectivity...")
    const connectivityResponse = await fetch("https://api.miro.com/v2/boards", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    })

    console.log(`Status: ${connectivityResponse.status} ${connectivityResponse.statusText}`)
    
    if (connectivityResponse.ok) {
      const boards = await connectivityResponse.json()
      console.log(`✅ API connectivity successful - found ${boards.data?.length || 0} boards`)
    } else {
      const errorText = await connectivityResponse.text()
      console.log(`❌ API connectivity failed: ${errorText}`)
      return
    }

    // Test 2: Check different board creation endpoints
    console.log("\n2️⃣ Testing board creation...")
    
    const boardCreationTests = [
      {
        name: "v2/boards (minimal payload)",
        url: "https://api.miro.com/v2/boards",
        data: {
          name: "Product Maestro Test Board"
        }
      },
      {
        name: "v2/boards (with description)",
        url: "https://api.miro.com/v2/boards", 
        data: {
          name: "Product Maestro Test Board 2",
          description: "Test board for API validation"
        }
      },
      {
        name: "v1/boards (legacy endpoint)",
        url: "https://api.miro.com/v1/boards",
        data: {
          name: "Product Maestro Test Board Legacy",
          description: "Legacy API test"
        }
      }
    ]

    for (const test of boardCreationTests) {
      console.log(`\n🧪 Testing: ${test.name}`)
      
      try {
        const response = await fetch(test.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(test.data),
        })

        console.log(`Status: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ Success! Board ID: ${result.id}`)
          console.log(`🔗 View link: ${result.viewLink}`)
          console.log("🔄 Continuing with remaining tests...")
          // Don't return early, continue with tests
        } else {
          const errorText = await response.text()
          console.log(`❌ Failed: ${errorText}`)
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`)
      }
    }

    // Test 3: Check user/token permissions
    console.log("\n3️⃣ Testing token permissions...")
    
    try {
      const tokenResponse = await fetch("https://api.miro.com/v2/oauth-token", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      })

      if (tokenResponse.ok) {
        const tokenInfo = await tokenResponse.json()
        console.log("✅ Token info retrieved:")
        console.log(`   User: ${tokenInfo.user?.name || 'Unknown'}`)
        console.log(`   Team: ${tokenInfo.team?.name || 'Unknown'}`)
        console.log(`   Scopes: ${tokenInfo.scopes?.join(', ') || 'Unknown'}`)
      } else {
        console.log(`❌ Token info failed: ${tokenResponse.status}`)
      }
    } catch (error) {
      console.log(`❌ Token info error: ${error.message}`)
    }

    // Test 4: Test item creation on an existing board
    console.log("\n4️⃣ Testing item creation...")
    
    try {
      // Get existing boards to test item creation
      const boardsResponse = await fetch("https://api.miro.com/v2/boards", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      })
      
      if (boardsResponse.ok) {
        const boards = await boardsResponse.json()
        if (boards.data && boards.data.length > 0) {
          const testBoard = boards.data[0]
          console.log(`📋 Testing item creation on board: ${testBoard.name}`)
          
          // Test different item creation endpoints and methods
          const itemTests = [
            {
              name: "v2/boards/{id}/sticky_notes",
              url: `https://api.miro.com/v2/boards/${testBoard.id}/sticky_notes`,
              data: {
                data: {
                  content: "Test sticky note from API"
                },
                position: {
                  x: 100,
                  y: 100
                }
              }
            },
            {
              name: "v2/boards/{id}/shapes",
              url: `https://api.miro.com/v2/boards/${testBoard.id}/shapes`,
              data: {
                data: {
                  content: "Test shape",
                  shape: "rectangle"
                },
                position: {
                  x: 300,
                  y: 100
                },
                geometry: {
                  width: 100,
                  height: 50
                }
              }
            },
            {
              name: "v2/boards/{id}/texts",
              url: `https://api.miro.com/v2/boards/${testBoard.id}/texts`,
              data: {
                data: {
                  content: "Test text item"
                },
                position: {
                  x: 200,
                  y: 100
                }
              }
            },
            {
              name: "v2/boards/{id}/cards",
              url: `https://api.miro.com/v2/boards/${testBoard.id}/cards`,
              data: {
                data: {
                  title: "Test Card",
                  description: "This is a test card"
                },
                position: {
                  x: 400,
                  y: 100
                }
              }
            }
          ]
          
          for (const test of itemTests) {
            console.log(`\n🧪 Testing: ${test.name}`)
            
            try {
              const response = await fetch(test.url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify(test.data),
              })

              console.log(`Status: ${response.status} ${response.statusText}`)
              
              if (response.ok) {
                const result = await response.json()
                console.log(`✅ Success! Item ID: ${result.id}`)
                // Continue testing other endpoints instead of breaking
              } else {
                const errorText = await response.text()
                console.log(`❌ Failed: ${errorText}`)
              }
            } catch (error) {
              console.log(`❌ Error: ${error.message}`)
            }
          }
          
        } else {
          console.log("⚠️ No boards available for item testing")
        }
      }
    } catch (error) {
      console.log(`❌ Item creation test error: ${error.message}`)
    }

  } catch (error) {
    console.error("❌ API test failed:", error)
  }
}

// Run test if executed directly
console.log("🔧 Script executed, checking if main module...")
console.log("import.meta.url:", import.meta.url)
console.log("process.argv[1]:", process.argv[1])

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("✅ Running as main module")
  testMiroAPI().catch(console.error)
} else {
  console.log("ℹ️ Imported as module")
}

// Test Visual Design Tool directly
async function testVisualDesignIntegration() {
  console.log("\n🎨 Testing Visual Design Tool with working Miro API...")
  
  try {
    const { testVisualDesignTool } = await import("../mastra/tools/visualDesignTool.js")
    const result = await testVisualDesignTool()
    console.log("✅ Visual Design Tool test successful!")
    return result
  } catch (error) {
    console.error("❌ Visual Design Tool test failed:", error)
    return null
  }
}

// Always run for testing
console.log("🏃 Running API test and Visual Design test...")
testMiroAPI()
  .then(() => testVisualDesignIntegration())
  .catch(console.error)

export { testMiroAPI }