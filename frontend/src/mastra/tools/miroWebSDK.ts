// Miro Web SDK Integration for Enhanced Visual Design
// This module provides Web SDK methods for use in browser environments

export interface MiroWebSDKConfig {
  boardId?: string
  appId?: string
}

export class MiroWebSDKClient {
  private miro: any
  private board: any

  constructor() {
    // This will be available when running in a Miro app context
    if (typeof window !== "undefined" && (window as any).miro) {
      this.miro = (window as any).miro
      this.board = this.miro.board
    }
  }

  // Check if Web SDK is available
  isAvailable(): boolean {
    return !!this.miro && !!this.board
  }

  // Enhanced sticky note creation with Web SDK
  async createStickyNote(options: {
    content: string
    x: number
    y: number
    style?: {
      fillColor?: string
      textAlign?: "left" | "center" | "right"
      textAlignVertical?: "top" | "middle" | "bottom"
    }
    shape?: "square" | "rectangle"
    width?: number
  }) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    return await this.board.createStickyNote({
      content: `<p>${options.content}</p>`,
      style: {
        fillColor: options.style?.fillColor || "light_yellow",
        textAlign: options.style?.textAlign || "center",
        textAlignVertical: options.style?.textAlignVertical || "middle",
      },
      x: options.x,
      y: options.y,
      shape: options.shape || "square",
      width: options.width || 200,
    })
  }

  // Enhanced shape creation with Web SDK
  async createShape(options: {
    content: string
    x: number
    y: number
    width?: number
    height?: number
    shape?: "rectangle" | "circle" | "triangle" | "star" | "rhombus"
    style?: {
      fillColor?: string
      color?: string
      fontFamily?: string
      fontSize?: number
    }
  }) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    return await this.board.createShape({
      content: `<p>${options.content}</p>`,
      shape: options.shape || "rectangle",
      style: {
        color: options.style?.color || "#1a1a1a",
        fillColor: options.style?.fillColor || "#ffffff",
        fontFamily: options.style?.fontFamily || "arial",
        fontSize: options.style?.fontSize || 14,
      },
      x: options.x,
      y: options.y,
      width: options.width || 200,
      height: options.height || 100,
    })
  }

  // Enhanced text creation with Web SDK
  async createText(options: {
    content: string
    x: number
    y: number
    width?: number
    style?: {
      color?: string
      fontFamily?: string
      fontSize?: number
      textAlign?: "left" | "center" | "right"
    }
    rotation?: number
  }) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    return await this.board.createText({
      content: `<p>${options.content}</p>`,
      style: {
        color: options.style?.color || "#1a1a1a",
        fontFamily: options.style?.fontFamily || "arial",
        fontSize: options.style?.fontSize || 14,
        textAlign: options.style?.textAlign || "left",
      },
      x: options.x,
      y: options.y,
      width: options.width || 300,
      rotation: options.rotation || 0.0,
    })
  }

  // Enhanced connector creation with Web SDK
  async createConnector(options: {
    startItemId: string
    endItemId: string
    shape?: "straight" | "elbowed" | "curved"
    style?: {
      strokeColor?: string
      strokeWidth?: number
      strokeStyle?: "normal" | "dashed" | "dotted"
      startStrokeCap?: "none" | "stealth" | "diamond" | "oval"
      endStrokeCap?: "none" | "stealth" | "diamond" | "oval"
    }
  }) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    return await this.board.createConnector({
      start: {
        item: options.startItemId,
        position: { x: 1.0, y: 0.5 },
      },
      end: {
        item: options.endItemId,
        snapTo: "auto",
      },
      shape: options.shape || "elbowed",
      style: {
        startStrokeCap: options.style?.startStrokeCap || "none",
        endStrokeCap: options.style?.endStrokeCap || "stealth",
        strokeStyle: options.style?.strokeStyle || "normal",
        strokeColor: options.style?.strokeColor || "#1a73e8",
        strokeWidth: options.style?.strokeWidth || 2,
      },
    })
  }

  // Create card with Web SDK
  async createCard(options: {
    title: string
    description?: string
    x: number
    y: number
    style?: {
      fillColor?: string
    }
  }) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    return await this.board.createCard({
      title: options.title,
      description: options.description || "",
      x: options.x,
      y: options.y,
      style: {
        fillColor: options.style?.fillColor || "light_yellow",
      },
    })
  }

  // Batch create multiple items efficiently
  async createBatch(
    items: Array<{
      type: "sticky_note" | "shape" | "text" | "card"
      options: any
    }>
  ) {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available - use REST API fallback")
    }

    const results = []

    for (const item of items) {
      try {
        let result
        switch (item.type) {
          case "sticky_note":
            result = await this.createStickyNote(item.options)
            break
          case "shape":
            result = await this.createShape(item.options)
            break
          case "text":
            result = await this.createText(item.options)
            break
          case "card":
            result = await this.createCard(item.options)
            break
          default:
            console.warn(`Unknown item type: ${item.type}`)
            continue
        }
        results.push(result)
        console.log(`✅ Created ${item.type} with Web SDK`)
      } catch (error) {
        console.warn(`⚠️ Failed to create ${item.type} with Web SDK:`, error)
      }
    }

    return results
  }

  // Get board info
  async getBoardInfo() {
    if (!this.isAvailable()) {
      throw new Error("Miro Web SDK not available")
    }

    return await this.board.getInfo()
  }

  // Center viewport on created content
  async centerViewport(items: any[]) {
    if (!this.isAvailable() || items.length === 0) {
      return
    }

    try {
      await this.miro.board.viewport.zoomTo(items)
    } catch (error) {
      console.warn("Could not center viewport:", error)
    }
  }
}

// Export for use in browser environments
export const miroWebSDK = new MiroWebSDKClient()

// HTML template for Miro app integration
export const generateMiroAppHTML = (boardId: string, appId: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Maestro Visual Design</title>
    <script src="https://miro.com/app/static/sdk/v2/miro.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            background: #f8f9fa;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: #1a73e8;
        }
        .demo-section {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #1a73e8;
        }
        button {
            background: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
            transition: background 0.2s;
        }
        button:hover {
            background: #0d5cbf;
        }
        .status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Product Maestro Visual Design</h1>
            <p>Enhanced Miro Integration with Web SDK</p>
        </div>

        <div class="demo-section">
            <h3>Quick Demo</h3>
            <button onclick="createUserJourney()">Create User Journey</button>
            <button onclick="createPersonas()">Create Personas</button>
            <button onclick="createWorkflow()">Create Process Workflow</button>
            <div id="status"></div>
        </div>

        <div class="demo-section">
            <h3>Advanced Features</h3>
            <button onclick="createComprehensiveBoard()">Create Comprehensive Board</button>
            <button onclick="connectElements()">Add Connectors</button>
            <button onclick="centerView()">Center View</button>
        </div>
    </div>

    <script>
        let createdItems = [];
        
        function updateStatus(message) {
            document.getElementById('status').innerHTML = '<div class="status">' + message + '</div>';
        }

        async function createUserJourney() {
            updateStatus('Creating user journey map...');
            try {
                const journey = await miro.board.createStickyNote({
                    content: '<p>🗺️ USER JOURNEY MAP</p><p>Emotional experience from discovery to success</p>',
                    style: { fillColor: 'light_blue', textAlign: 'center' },
                    x: 0, y: 0, width: 300
                });
                
                const stages = ['Discovery', 'Onboarding', 'First Use', 'Engagement', 'Success'];
                for (let i = 0; i < stages.length; i++) {
                    const stage = await miro.board.createCard({
                        title: stages[i],
                        description: 'Key touchpoints and emotions',
                        x: (i - 2) * 250, y: 200
                    });
                    createdItems.push(stage);
                }
                
                createdItems.push(journey);
                updateStatus('✅ User journey created successfully!');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
            }
        }

        async function createPersonas() {
            updateStatus('Creating user personas...');
            try {
                const personas = [
                    { name: 'Sarah - Busy Professional', x: -300, color: 'light_yellow' },
                    { name: 'Mike - Tech Enthusiast', x: 0, color: 'light_green' },
                    { name: 'Emma - Creative Manager', x: 300, color: 'light_pink' }
                ];
                
                for (const persona of personas) {
                    const card = await miro.board.createCard({
                        title: persona.name,
                        description: 'Demographics, goals, needs, pain points',
                        x: persona.x, y: -200,
                        style: { fillColor: persona.color }
                    });
                    createdItems.push(card);
                }
                
                updateStatus('✅ Personas created successfully!');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
            }
        }

        async function createWorkflow() {
            updateStatus('Creating process workflow...');
            try {
                const steps = ['Start', 'Process', 'Decision', 'Action', 'End'];
                const shapes = ['rectangle', 'rhombus', 'circle', 'triangle', 'rectangle'];
                
                for (let i = 0; i < steps.length; i++) {
                    const shape = await miro.board.createShape({
                        content: '<p>' + steps[i] + '</p>',
                        shape: shapes[i],
                        x: (i - 2) * 200, y: 400,
                        width: 150, height: 100,
                        style: { fillColor: '#e3f2fd', color: '#1565c0' }
                    });
                    createdItems.push(shape);
                }
                
                updateStatus('✅ Workflow created successfully!');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
            }
        }

        async function createComprehensiveBoard() {
            updateStatus('Creating comprehensive design board...');
            try {
                await createUserJourney();
                await createPersonas();
                await createWorkflow();
                updateStatus('✅ Comprehensive board created successfully!');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
            }
        }

        async function connectElements() {
            updateStatus('Adding connectors...');
            try {
                if (createdItems.length < 2) {
                    updateStatus('⚠️ Create some elements first!');
                    return;
                }
                
                for (let i = 0; i < createdItems.length - 1; i++) {
                    if (createdItems[i].type === createdItems[i + 1].type) {
                        await miro.board.createConnector({
                            start: { item: createdItems[i].id },
                            end: { item: createdItems[i + 1].id },
                            style: { strokeColor: '#1a73e8', endStrokeCap: 'stealth' }
                        });
                    }
                }
                
                updateStatus('✅ Connectors added successfully!');
            } catch (error) {
                updateStatus('❌ Error: ' + error.message);
            }
        }

        async function centerView() {
            if (createdItems.length > 0) {
                await miro.board.viewport.zoomTo(createdItems);
                updateStatus('✅ View centered on created elements!');
            } else {
                updateStatus('⚠️ No elements to center on!');
            }
        }

        // Initialize when the page loads
        miro.onReady(() => {
            updateStatus('🎨 Miro Web SDK ready! Click buttons above to create visual designs.');
        });
    </script>
</body>
</html>
`
