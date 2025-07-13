// Debug Miro API with basic hardcoded values
import "dotenv/config"

class SimpleMiroClient {
  private apiKey: string
  private baseUrl = "https://api.miro.com/v2"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(endpoint: string, method: string = "GET", data?: any) {
    console.log(`🔄 API Request: ${method} ${this.baseUrl}${endpoint}`)
    console.log(`📤 Payload:`, JSON.stringify(data, null, 2))
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error Response:`, errorText)
      throw new Error(`Miro API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`✅ Response Data:`, JSON.stringify(result, null, 2))
    return result
  }

  async createBoard(name: string) {
    return this.request("/boards", "POST", { name })
  }

  async createBasicStickyNote(boardId: string) {
    const payload = {
      data: {
        content: "Hello World",
        shape: "square"
      },
      position: {
        x: 0,
        y: 0,
        origin: "center"
      },
      style: {
        fillColor: "light_yellow",
        textAlign: "center",
        textAlignVertical: "top"
      }
    }
    return this.request(`/boards/${boardId}/sticky_notes`, "POST", payload)
  }

  async createBasicText(boardId: string) {
    const payload = {
      data: {
        content: "Basic Text"
      },
      position: {
        x: 200,
        y: 0,
        origin: "center"
      },
      geometry: {
        width: 200
      },
      style: {
        color: "#1a1a1a",
        fillColor: "#ffffff",
        fillOpacity: 1.0,
        fontFamily: "arial",
        fontSize: 14,
        textAlign: "center"
      }
    }
    return this.request(`/boards/${boardId}/texts`, "POST", payload)
  }

  async createBasicShape(boardId: string) {
    const payload = {
      data: {
        shape: "rectangle",
        content: "Basic Shape"
      },
      position: {
        x: 400,
        y: 0,
        origin: "center"
      },
      geometry: {
        width: 150,
        height: 80,
        rotation: 0
      },
      style: {
        fillColor: "#ffffff",
        fillOpacity: 1.0,
        borderColor: "#1a73e8",
        borderStyle: "normal",
        borderWidth: 2,
        fontFamily: "arial",
        fontSize: 12,
        textAlign: "center",
        color: "#1a1a1a"
      }
    }
    return this.request(`/boards/${boardId}/shapes`, "POST", payload)
  }
}

async function testBasicMiroAPI() {
  console.log("🧪 Testing Basic Miro API with Hardcoded Values")
  console.log("=" .repeat(60))
  
  const miroApiKey = process.env.MIRO_API_KEY
  if (!miroApiKey) {
    console.error("❌ MIRO_API_KEY not found")
    return
  }

  console.log(`✅ API Key: ${miroApiKey.substring(0, 10)}...${miroApiKey.substring(miroApiKey.length - 4)}`)
  
  const client = new SimpleMiroClient(miroApiKey)
  
  try {
    // Step 1: Create board
    console.log("\n📋 Step 1: Creating Board...")
    const board = await client.createBoard("Debug Test - Basic Elements")
    console.log(`✅ Board created: ${board.id}`)

    // Step 2: Create sticky note
    console.log("\n🟨 Step 2: Creating Sticky Note...")
    try {
      const sticky = await client.createBasicStickyNote(board.id)
      console.log(`✅ Sticky note created: ${sticky.id}`)
    } catch (error) {
      console.error("❌ Sticky note failed:", error.message)
    }

    // Step 3: Create text
    console.log("\n📝 Step 3: Creating Text...")
    try {
      const text = await client.createBasicText(board.id)
      console.log(`✅ Text created: ${text.id}`)
    } catch (error) {
      console.error("❌ Text failed:", error.message)
    }

    // Step 4: Create shape
    console.log("\n🔷 Step 4: Creating Shape...")
    try {
      const shape = await client.createBasicShape(board.id)
      console.log(`✅ Shape created: ${shape.id}`)
    } catch (error) {
      console.error("❌ Shape failed:", error.message)
    }

    console.log(`\n🔗 View board: ${board.viewLink}`)
    
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Run test
testBasicMiroAPI().catch(console.error)