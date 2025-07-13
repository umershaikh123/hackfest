// Debug Miro API directly
import "dotenv/config"

async function debugMiroAPI() {
  console.log("🔍 Debug Miro API Direct Calls")
  
  const miroApiKey = process.env.MIRO_API_KEY
  if (!miroApiKey) {
    console.error("❌ MIRO_API_KEY not found")
    return
  }
  
  console.log(`✅ API Key: ${miroApiKey.substring(0, 10)}...${miroApiKey.substring(miroApiKey.length - 4)}`)
  
  try {
    // Create a test board first
    const boardResponse = await fetch("https://api.miro.com/v2/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${miroApiKey}`,
      },
      body: JSON.stringify({ name: "Debug Test Board" })
    })
    
    if (!boardResponse.ok) {
      console.error("❌ Failed to create board:", boardResponse.status, boardResponse.statusText)
      return
    }
    
    const board = await boardResponse.json()
    console.log(`📋 Created board: ${board.name}`)
    console.log(`🔗 Board ID: ${board.id}`)
    
    // Test sticky note creation
    console.log("\n🧪 Testing sticky note creation...")
    const stickyPayload = {
      data: {
        content: "Test Sticky Note",
        shape: "square"
      },
      position: {
        x: 100,
        y: 100,
        origin: "center"
      },
      style: {
        fillColor: "light_yellow",
        textAlign: "center",
        textAlignVertical: "top"
      }
    }
    
    const stickyResponse = await fetch(`https://api.miro.com/v2/boards/${board.id}/sticky_notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${miroApiKey}`,
      },
      body: JSON.stringify(stickyPayload)
    })
    
    if (stickyResponse.ok) {
      const sticky = await stickyResponse.json()
      console.log(`✅ Created sticky note: ${sticky.id}`)
    } else {
      console.error("❌ Sticky note failed:", stickyResponse.status, await stickyResponse.text())
    }
    
    // Test text creation
    console.log("\n🧪 Testing text creation...")
    const textPayload = {
      data: {
        content: "Test Text Element"
      },
      position: {
        x: 300,
        y: 100,
        origin: "center",
        relativeTo: "canvas_center"
      },
      geometry: {
        width: 320,
        height: 60,
        rotation: 0
      },
      style: {
        color: "#1a1a1a",
        fillColor: "#ffffff",
        fillOpacity: 1.0,
        fontFamily: "arial",
        fontSize: 16,
        textAlign: "center"
      }
    }
    
    const textResponse = await fetch(`https://api.miro.com/v2/boards/${board.id}/texts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${miroApiKey}`,
      },
      body: JSON.stringify(textPayload)
    })
    
    if (textResponse.ok) {
      const text = await textResponse.json()
      console.log(`✅ Created text: ${text.id}`)
    } else {
      console.error("❌ Text creation failed:", textResponse.status, await textResponse.text())
    }
    
    // Test shape creation
    console.log("\n🧪 Testing shape creation...")
    const shapePayload = {
      data: {
        shape: "rectangle",
        content: "Test Shape"
      },
      position: {
        x: 500,
        y: 100,
        origin: "center",
        relativeTo: "canvas_center"
      },
      geometry: {
        width: 200,
        height: 100,
        rotation: 0
      },
      style: {
        fillColor: "#ffffff",
        fillOpacity: 1.0,
        strokeColor: "#1a73e8",
        strokeStyle: "normal",
        strokeWidth: 2,
        fontFamily: "arial",
        fontSize: 14,
        textAlign: "center",
        color: "#1a1a1a"
      }
    }
    
    const shapeResponse = await fetch(`https://api.miro.com/v2/boards/${board.id}/shapes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${miroApiKey}`,
      },
      body: JSON.stringify(shapePayload)
    })
    
    if (shapeResponse.ok) {
      const shape = await shapeResponse.json()
      console.log(`✅ Created shape: ${shape.id}`)
    } else {
      console.error("❌ Shape creation failed:", shapeResponse.status, await shapeResponse.text())
    }
    
    console.log(`\n🔗 View board: ${board.viewLink}`)
    
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

if (import.meta.url.includes(process.argv[1])) {
  debugMiroAPI().catch(console.error)
}

export { debugMiroAPI }