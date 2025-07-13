// src/mastra/tools/visualDesignTool.ts - Visual Design Tool with Miro Integration
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import "dotenv/config"

// Position Manager for better element layout
class PositionManager {
  private currentX = 0
  private currentY = 0
  private columnWidth = 300
  private rowHeight = 250
  private maxColumns = 4

  getNextPosition(
    type: "header" | "persona" | "feature" | "journey" | "process" = "feature"
  ) {
    let position

    switch (type) {
      case "header":
        position = { x: 0, y: -400 }
        break
      case "persona":
        position = { x: this.currentX, y: -200 }
        this.currentX += this.columnWidth
        if (this.currentX >= this.maxColumns * this.columnWidth) {
          this.currentX = 0
          this.currentY += this.rowHeight
        }
        break
      case "journey":
        position = { x: this.currentX, y: 200 }
        this.currentX += this.columnWidth
        break
      case "process":
        position = { x: this.currentX, y: 400 }
        this.currentX += this.columnWidth
        break
      default:
        position = { x: this.currentX, y: this.currentY }
        this.currentX += this.columnWidth
        if (this.currentX >= this.maxColumns * this.columnWidth) {
          this.currentX = 0
          this.currentY += this.rowHeight
        }
    }

    return position
  }

  reset() {
    this.currentX = 0
    this.currentY = 0
  }
}

// Miro API Integration
class MiroAPIClient {
  private apiKey: string
  private baseUrl = "https://api.miro.com/v2"
  private positionManager: PositionManager

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.positionManager = new PositionManager()
  }

  private async request(endpoint: string, method: string = "GET", data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetails = ""
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.context && errorJson.context.fields) {
          errorDetails = errorJson.context.fields
            .map((f: any) => `${f.field}: ${f.message}`)
            .join(", ")
        }
      } catch {
        errorDetails = errorText
      }
      throw new Error(
        `Miro API error: ${response.status} ${response.statusText} - ${errorDetails}`
      )
    }

    return response.json()
  }

  // Create a new board for workflow diagrams
  async createBoard(name: string, description?: string) {
    const payload: any = { name }
    if (description) {
      payload.description = description
    }
    return this.request("/boards", "POST", payload)
  }

  // Create different types of Miro items based on type
  async createWorkflowItems(boardId: string, items: any[]) {
    const results = []
    this.positionManager.reset() // Reset positioning for new board

    for (const item of items) {
      try {
        let result
        const cleanContent =
          item.data.content?.replace(/<[^>]*>/g, "") || item.title || "Element"

        // Use smart positioning if no position provided
        const position =
          item.position ||
          this.positionManager.getNextPosition(item.layoutType || "feature")

        switch (item.type) {
          case "sticky_note":
            result = await this.createStickyNote(boardId, {
              content: cleanContent,
              position: position,
              style: item.style,
            })
            break

          case "shape":
            result = await this.createShape(boardId, {
              content: cleanContent,
              position: position,
              geometry: item.geometry,
              style: item.style,
              shape: item.shape || "rectangle",
            })
            break

          case "text":
            result = await this.createText(boardId, {
              content: cleanContent,
              position: position,
              geometry: item.geometry,
              style: item.style,
            })
            break

          case "card":
            result = await this.createCard(boardId, {
              title: item.title || "Card",
              description: cleanContent,
              position: position,
              style: item.style,
            })
            break

          default:
            // Default to sticky note for unknown types
            result = await this.createStickyNote(boardId, {
              content: cleanContent,
              position: position,
              style: item.style,
            })
        }

        if (result) {
          results.push(result)
          console.log(
            `✅ Created ${item.type || "sticky_note"}: ${cleanContent.substring(0, 30)}...`
          )
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create ${item.type || "item"}:`, error)

        // Fallback to basic sticky note
        try {
          const fallbackResult = await this.createStickyNote(boardId, {
            content: "Visual Element",
            position: item.position,
            style: { fillColor: "#ffeb3b" },
          })
          results.push(fallbackResult)
        } catch (fallbackError) {
          console.error(`❌ Fallback creation failed:`, fallbackError)
        }
      }
    }

    return results
  }

  // Create sticky note
  async createStickyNote(boardId: string, options: any) {
    const payload = {
      data: {
        content: (options.content || "Visual Element").substring(0, 6000), // Miro limit
        shape: "square",
      },
      position: {
        x: options.position.x,
        y: options.position.y,
        origin: "center",
      },
      style: {
        fillColor:
          this.getMiroColor(options.style?.fillColor, "sticky_note") ||
          "light_yellow",
        textAlign: "center",
        textAlignVertical: "top",
      },
    }
    return this.request(`/boards/${boardId}/sticky_notes`, "POST", payload)
  }

  // Map our colors to Miro's supported colors
  getMiroColor(
    color: string,
    elementType: "sticky_note" | "card" | "shape" | "text" = "sticky_note"
  ): string {
    // Miro's supported named colors for sticky notes and cards
    const namedColorMap: Record<string, string> = {
      "#fff9c4": "light_yellow",
      "#ffeb3b": "yellow",
      "#ff9800": "orange",
      "#4caf50": "green",
      "#00bcd4": "cyan",
      "#e91e63": "pink",
      "#9c27b0": "violet",
      "#f44336": "red",
      "#2196f3": "blue",
      "#607d8b": "gray",
      "#ffcdd2": "light_pink",
      "#c8e6c9": "light_green",
      "#bbdefb": "light_blue",
    }

    // For sticky notes and cards, use named colors only
    if (elementType === "sticky_note" || elementType === "card") {
      return namedColorMap[color] || "light_yellow"
    }

    // For shapes and text, prefer hex colors but validate format
    if (color && color.startsWith("#") && /^#[0-9A-F]{6}$/i.test(color)) {
      return color
    }

    // Fallback to mapped color or default
    return namedColorMap[color] || "#ffffff"
  }

  // Create shape
  async createShape(boardId: string, options: any) {
    const payload = {
      data: {
        shape: options.shape || "rectangle",
        content: (options.content || "Shape").substring(0, 6000),
      },
      position: {
        x: options.position.x,
        y: options.position.y,
        origin: "center",
      },
      geometry: {
        width: options.geometry?.width || 200,
        height: options.geometry?.height || 100,
        rotation: 0,
      },
      style: {
        fillColor:
          this.getMiroColor(options.style?.fillColor, "shape") || "#ffffff",
        fillOpacity: 1.0,
        borderColor:
          this.getMiroColor(options.style?.borderColor, "shape") || "#1a73e8",
        borderStyle: "normal",
        borderWidth: Math.min(options.style?.borderWidth || 2, 24),
        fontFamily: "arial",
        fontSize: Math.min(options.style?.fontSize || 14, 96),
        textAlign: "center",
        color: "#1a1a1a",
      },
    }
    return this.request(`/boards/${boardId}/shapes`, "POST", payload)
  }

  // Create text
  async createText(boardId: string, options: any) {
    const payload = {
      data: {
        content: (options.content || "Text").substring(0, 6000),
      },
      position: {
        x: options.position.x,
        y: options.position.y,
        origin: "center",
      },
      geometry: {
        width: options.geometry?.width || 320,
      },
      style: {
        color: "#1a1a1a",
        fillColor:
          this.getMiroColor(options.style?.fillColor, "text") || "#ffffff",
        fillOpacity: 1.0,
        fontFamily: "arial",
        fontSize: Math.min(options.style?.fontSize || 16, 96),
        textAlign: options.style?.textAlign || "center",
      },
    }
    return this.request(`/boards/${boardId}/texts`, "POST", payload)
  }

  // Create card
  async createCard(boardId: string, options: any) {
    const payload = {
      data: {
        title: options.title || "Card",
        description: options.description || options.content || "",
      },
      position: {
        x: options.position.x,
        y: options.position.y,
        origin: "center",
      },
    }
    return this.request(`/boards/${boardId}/cards`, "POST", payload)
  }

  // Get sticky note color for cards (they use the same color system)
  getStickyNoteColor(color: string): string {
    const colorMap: Record<string, string> = {
      "#1a73e8": "blue",
      "#34a853": "green",
      "#9c27b0": "violet",
      "#ff9800": "orange",
      "#f44336": "red",
      "#00bcd4": "cyan",
      "#e91e63": "pink",
      "#607d8b": "gray",
      "#ffeb3b": "yellow",
    }
    return colorMap[color] || "light_yellow"
  }

  // Create connectors between workflow steps
  async createConnectors(boardId: string, connectors: any[]) {
    const results = []

    for (const connector of connectors) {
      try {
        const payload = {
          start: connector.start,
          end: connector.end,
          style: {
            strokeColor: connector.style?.strokeColor || "#1a73e8",
            strokeWidth: connector.style?.strokeWidth || 2,
            strokeStyle: "solid",
          },
          captions: connector.captions || [],
        }

        const result = await this.request(
          `/boards/${boardId}/connectors`,
          "POST",
          payload
        )
        results.push(result)
        console.log(`✅ Created connector`)
      } catch (error) {
        console.warn(`⚠️ Failed to create connector:`, error)
      }
    }

    return results
  }
}

// Visual Design Tool Implementation
export const visualDesignTool = createTool({
  id: "visualDesignTool",
  description: `Creates visual workflows, user flows, and process diagrams from PRD content using Miro API. This tool specializes in user journey mapping, process flow diagrams, workflow visualization, user research artifacts, and system architecture diagrams. Output: Interactive Miro boards with collaborative editing capabilities.`,
  inputSchema: z.object({
    projectTitle: z.string().describe("Project name for the board"),
    designType: z
      .enum(["comprehensive_board", "user_journey", "process_workflow"])
      .describe(
        "Type of visual design to create - comprehensive_board combines multiple elements"
      ),
    prdContent: z.object({
      features: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          acceptanceCriteria: z.array(z.string()),
          priority: z.enum(["high", "medium", "low"]),
        })
      ),
      userPersonas: z
        .array(
          z.object({
            name: z.string(),
            role: z.string(),
            demographics: z.string(),
            needs: z.array(z.string()),
            painPoints: z.array(z.string()),
            goals: z.array(z.string()),
          })
        )
        .optional(),
      userStories: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            persona: z.string(),
            userAction: z.string(),
            benefit: z.string(),
            acceptanceCriteria: z.array(z.string()),
            priority: z.enum(["low", "medium", "high", "critical"]),
          })
        )
        .optional(),
    }),
    boardSettings: z
      .object({
        includePersonas: z.boolean().default(true),
        includeDecisionPoints: z.boolean().default(true),
        includeAlternativePaths: z.boolean().default(false),
        colorScheme: z
          .enum(["blue", "green", "purple", "orange"])
          .default("blue"),
      })
      .optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    miroBoard: z.object({
      id: z.string(),
      name: z.string(),
      viewLink: z.string(),
      editLink: z.string().optional(),
    }),
    visualElements: z.object({
      itemsCreated: z.number(),
      connectorsCreated: z.number(),
      elementsBreakdown: z.record(z.number()),
    }),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const {
        projectTitle,
        designType,
        prdContent,
        boardSettings = {},
      } = context

      // Validate Miro API key
      const miroApiKey = process.env.MIRO_API_KEY
      if (!miroApiKey) {
        console.error("❌ MIRO_API_KEY not found in environment variables")
        console.log("💡 Please add MIRO_API_KEY to your .env file")
        console.log(
          "🔗 Get your API key from: https://miro.com/app/settings/user-profile/apps"
        )
        throw new Error("MIRO_API_KEY not found in environment variables")
      }

      console.log("✅ MIRO_API_KEY found - proceeding with board creation")
      console.log(
        `🔑 API Key: ${miroApiKey.substring(0, 10)}...${miroApiKey.substring(miroApiKey.length - 4)}`
      )

      const miroClient = new MiroAPIClient(miroApiKey)

      console.log(`🎨 Creating ${designType} for ${projectTitle}...`)

      // Create Miro board
      const boardName = `${projectTitle} - ${designType.replace("_", " ").toUpperCase()}`
      const boardDescription = `Generated by Product Maestro: ${designType} visualization for ${projectTitle}`

      const board = await miroClient.createBoard(boardName, boardDescription)
      console.log(`📋 Created Miro board: ${board.name}`)

      // Generate visual elements based on design type
      let items: any[] = []
      let connectors: any[] = []
      let elementsBreakdown: Record<string, number> = {}

      switch (designType) {
        case "comprehensive_board":
          ;({ items, connectors, elementsBreakdown } =
            generateComprehensiveBoard(prdContent, boardSettings))
          break
        case "user_journey":
          ;({ items, connectors, elementsBreakdown } = generateUserJourney(
            prdContent,
            boardSettings
          ))
          break
        case "process_workflow":
          ;({ items, connectors, elementsBreakdown } = generateProcessWorkflow(
            prdContent,
            boardSettings
          ))
          break
        default:
          ;({ items, connectors, elementsBreakdown } =
            generateComprehensiveBoard(prdContent, boardSettings))
      }

      // Create items on Miro board
      const createdItems = await miroClient.createWorkflowItems(board.id, items)
      console.log(`📝 Created ${createdItems.length} visual elements`)

      // Create connectors
      const createdConnectors = await miroClient.createConnectors(
        board.id,
        connectors
      )
      console.log(`🔗 Created ${createdConnectors.length} connectors`)

      // Generate recommendations
      const recommendations = generateRecommendations(
        designType,
        prdContent,
        createdItems.length
      )
      const nextSteps = generateNextSteps(designType, board.viewLink)

      return {
        success: true,
        message: `Successfully created ${designType} visualization with ${createdItems.length} elements`,
        miroBoard: {
          id: board.id,
          name: board.name,
          viewLink: board.viewLink,
          editLink: `https://miro.com/app/board/${board.id}`,
        },
        visualElements: {
          itemsCreated: createdItems.length,
          connectorsCreated: createdConnectors.length,
          elementsBreakdown,
        },
        recommendations,
        nextSteps,
      }
    } catch (error) {
      console.error("❌ Visual Design Tool error:", error)
      throw new Error(`Visual design generation failed: ${error}`)
    }
  },
})

// Helper Functions for Different Design Types

function generateComprehensiveBoard(prdContent: any, settings: any) {
  const items: any[] = []
  const connectors: any[] = []
  const elementsBreakdown: Record<string, number> = {
    overview: 0,
    features: 0,
    personas: 0,
    journeys: 0,
  }

  const colors = {
    blue: "#1a73e8",
    green: "#34a853",
    purple: "#9c27b0",
    orange: "#ff9800",
    red: "#f44336",
    teal: "#00bcd4",
    indigo: "#3f51b5",
    pink: "#e91e63",
  }

  const colorScheme = settings.colorScheme || "blue"
  const primaryColor = colors[colorScheme as keyof typeof colors] || colors.blue

  // Main board title as large text
  items.push({
    type: "text",
    data: {
      content: "🚀 PRODUCT VISION BOARD",
    },
    position: { x: 50, y: 50 },
    geometry: { width: 600, height: 80 },
    style: {
      fontSize: 32,
      textColor: primaryColor,
      textAlign: "center",
    },
  })
  elementsBreakdown.overview++

  // Project description sticky note
  items.push({
    type: "sticky_note",
    data: {
      content: "Complete product strategy and user experience visualization",
    },
    position: { x: 700, y: 50 },
    style: {
      fillColor: primaryColor + "20",
    },
  })
  elementsBreakdown.overview++

  // Section 1: User Personas (top-left)
  const personaSection = generatePersonaMapping(prdContent, {
    ...settings,
    includePersonas: true,
  })
  personaSection.items.forEach(item => {
    items.push({
      ...item,
      position: { x: item.position.x + 50, y: item.position.y + 200 },
    })
  })
  connectors.push(...personaSection.connectors)

  // Section 2: User Journey (top-right)
  const journeySection = generateUserJourney(prdContent, settings)
  journeySection.items.forEach(item => {
    items.push({
      ...item,
      position: { x: item.position.x + 800, y: item.position.y + 200 },
    })
  })
  connectors.push(...journeySection.connectors)

  // Section 3: Process Flow (bottom, spanning full width)
  const processSection = generateProcessDiagram(prdContent, settings)
  processSection.items.forEach(item => {
    items.push({
      ...item,
      position: { x: item.position.x + 100, y: item.position.y + 800 },
    })
  })
  connectors.push(...processSection.connectors)

  // Add section headers as shapes
  items.push({
    type: "shape",
    shape: "rectangle",
    data: {
      content: "USER PERSONAS",
    },
    position: { x: 50, y: 150 },
    geometry: { width: 200, height: 40 },
    style: {
      fillColor: colors.purple + "30",
      borderColor: colors.purple,
      borderWidth: 2,
    },
  })

  items.push({
    type: "shape",
    shape: "rectangle",
    data: {
      content: "USER JOURNEY",
    },
    position: { x: 800, y: 150 },
    geometry: { width: 200, height: 40 },
    style: {
      fillColor: colors.blue + "30",
      borderColor: colors.blue,
      borderWidth: 2,
    },
  })

  items.push({
    type: "shape",
    shape: "rectangle",
    data: {
      content: "PROCESS FLOW",
    },
    position: { x: 100, y: 750 },
    geometry: { width: 200, height: 40 },
    style: {
      fillColor: colors.teal + "30",
      borderColor: colors.teal,
      borderWidth: 2,
    },
  })

  // Merge element breakdowns
  Object.keys(personaSection.elementsBreakdown).forEach(key => {
    elementsBreakdown[key] =
      (elementsBreakdown[key] || 0) + personaSection.elementsBreakdown[key]
  })
  Object.keys(journeySection.elementsBreakdown).forEach(key => {
    elementsBreakdown[key] =
      (elementsBreakdown[key] || 0) + journeySection.elementsBreakdown[key]
  })
  Object.keys(processSection.elementsBreakdown).forEach(key => {
    elementsBreakdown[key] =
      (elementsBreakdown[key] || 0) + processSection.elementsBreakdown[key]
  })

  return { items, connectors, elementsBreakdown }
}

function generateUserJourney(prdContent: any, settings: any) {
  const items: any[] = []
  const connectors: any[] = []
  const elementsBreakdown: Record<string, number> = {
    touchpoints: 0,
    emotions: 0,
    painPoints: 0,
    opportunities: 0,
  }

  const colors = {
    blue: "#1a73e8",
    green: "#34a853",
    purple: "#9c27b0",
    orange: "#ff9800",
    red: "#f44336",
    teal: "#00bcd4",
  }

  const colorScheme = settings.colorScheme || "blue"
  const primaryColor = colors[colorScheme as keyof typeof colors] || colors.blue

  // Title header as text element
  items.push({
    type: "text",
    data: {
      content: "🗺️ USER JOURNEY MAP",
    },
    position: { x: 50, y: 50 },
    geometry: { width: 400, height: 60 },
    style: {
      fontSize: 24,
      textColor: primaryColor,
      textAlign: "center",
    },
  })
  elementsBreakdown.touchpoints++

  // Create user persona cards as proper cards
  if (prdContent.userPersonas && settings.includePersonas) {
    prdContent.userPersonas.forEach((persona: any, index: number) => {
      const personaColors = [colors.blue, colors.green, colors.purple]
      const personaColor = personaColors[index % personaColors.length]

      items.push({
        type: "card",
        title: `👤 ${persona.name}`,
        data: {
          content: `${persona.role} - ${persona.demographics}\\nGoal: ${persona.goals[0] || "Achieve success"}`,
        },
        position: {
          x: 50 + index * 200,
          y: 150,
        },
        style: {
          fillColor: personaColor + "15",
        },
      })
      elementsBreakdown.touchpoints++
    })
  }

  // Create journey stages as shapes with proper flow
  if (prdContent.userStories) {
    const stageEmojis = ["🚀", "⚡", "🎯", "✨", "🏆"]

    prdContent.userStories.forEach((story: any, index: number) => {
      const stageColor = index % 2 === 0 ? primaryColor : colors.teal
      const emoji = stageEmojis[index % stageEmojis.length]

      // Main journey stage as rectangle shape
      items.push({
        type: "shape",
        shape: "rectangle",
        data: {
          content: `${emoji} STAGE ${index + 1}\\n${story.title}\\n${story.userAction}`,
        },
        position: {
          x: 100 + index * 300,
          y: 350,
        },
        geometry: {
          width: 250,
          height: 120,
        },
        style: {
          fillColor: stageColor + "20",
          borderColor: stageColor,
          borderWidth: 3,
        },
      })

      // Emotion as sticky note
      const emotions = [
        "😐 Neutral",
        "😊 Happy",
        "😃 Excited",
        "🤔 Thinking",
        "🎉 Celebrating",
      ]
      items.push({
        type: "sticky_note",
        data: {
          content: emotions[index % emotions.length],
        },
        position: {
          x: 150 + index * 300,
          y: 500,
        },
        style: {
          fillColor: "#fff9c4",
        },
      })
      elementsBreakdown.emotions++

      // Pain point as warning sticky note
      if (
        index < 3 &&
        story.acceptanceCriteria &&
        story.acceptanceCriteria.length > 0
      ) {
        items.push({
          type: "sticky_note",
          data: {
            content: `⚠️ Pain Point\\n${story.acceptanceCriteria[0]}`,
          },
          position: {
            x: 100 + index * 300,
            y: 550,
          },
          style: {
            fillColor: "#ffcdd2",
          },
        })
        elementsBreakdown.painPoints++
      }

      elementsBreakdown.touchpoints++
    })

    // Create connectors between stages
    for (let i = 0; i < prdContent.userStories.length - 1; i++) {
      connectors.push({
        start: {
          item: `stage_${i}`,
          snapTo: "right",
        },
        end: {
          item: `stage_${i + 1}`,
          snapTo: "left",
        },
        style: {
          strokeColor: primaryColor,
          strokeWidth: 3,
        },
        captions: [
          {
            content: "Next",
            position: 0.5,
          },
        ],
      })
    }
  }

  return { items, connectors, elementsBreakdown }
}

function generateUserFlow(prdContent: any, settings: any) {
  const items: any[] = []
  const connectors: any[] = []
  const elementsBreakdown: Record<string, number> = {
    screens: 0,
    decisions: 0,
    actions: 0,
    endpoints: 0,
  }

  // Create flow start
  items.push({
    type: "shape",
    data: {
      content: "<p><strong>Start</strong></p><p>User enters app</p>",
      shape: "circle",
    },
    position: { x: 100, y: 200 },
    geometry: { width: 120, height: 120 },
  })
  elementsBreakdown.screens++

  // Generate flow from user stories
  if (prdContent.userStories) {
    prdContent.userStories.forEach((story: any, index: number) => {
      // Main action screen
      items.push({
        type: "shape",
        data: {
          content: `<p><strong>${story.title}</strong></p><p>${story.userAction}</p>`,
          shape: "rectangle",
        },
        position: {
          x: 300 + index * 200,
          y: 200,
        },
        geometry: {
          width: 160,
          height: 100,
        },
      })
      elementsBreakdown.screens++

      // Decision point (if high priority)
      if (story.priority === "high" || story.priority === "critical") {
        items.push({
          type: "shape",
          data: {
            content: `<p>Success?</p>`,
            shape: "diamond",
          },
          position: {
            x: 300 + index * 200,
            y: 350,
          },
          geometry: {
            width: 100,
            height: 80,
          },
        })
        elementsBreakdown.decisions++
      }
    })
  }

  return { items, connectors, elementsBreakdown }
}

function generateProcessDiagram(prdContent: any, settings: any) {
  const items: any[] = []
  const connectors: any[] = []
  const elementsBreakdown: Record<string, number> = {
    processes: 0,
    decisions: 0,
    data: 0,
    endpoints: 0,
  }

  const colors = {
    blue: "#1a73e8",
    green: "#34a853",
    purple: "#9c27b0",
    orange: "#ff9800",
    red: "#f44336",
    teal: "#00bcd4",
  }

  const colorScheme = settings.colorScheme || "blue"
  const primaryColor = colors[colorScheme as keyof typeof colors] || colors.blue

  // Section header as text
  items.push({
    type: "text",
    data: {
      content: "⚙️ PROCESS DIAGRAM",
    },
    position: { x: 50, y: 50 },
    geometry: { width: 400, height: 60 },
    style: {
      fontSize: 24,
      textColor: colors.teal,
      textAlign: "center",
    },
  })
  elementsBreakdown.processes++

  // Start node as circle
  items.push({
    type: "shape",
    shape: "circle",
    data: {
      content: "START",
    },
    position: { x: 100, y: 150 },
    geometry: { width: 100, height: 100 },
    style: {
      fillColor: colors.green + "30",
      borderColor: colors.green,
      borderWidth: 3,
    },
  })
  elementsBreakdown.processes++

  // Generate workflow from features as process boxes
  prdContent.features.forEach((feature: any, index: number) => {
    const featureColors = [
      colors.blue,
      colors.purple,
      colors.orange,
      colors.teal,
    ]
    const featureColor = featureColors[index % featureColors.length]
    const priority = feature.priority || "medium"
    const priorityEmoji =
      priority === "high" ? "🔥" : priority === "medium" ? "⭐" : "📋"

    // Main process box as rectangle
    items.push({
      type: "shape",
      shape: "rectangle",
      data: {
        content: `${priorityEmoji} ${feature.name}\\n${feature.description}\\n[${priority.toUpperCase()} PRIORITY]`,
      },
      position: {
        x: 250 + index * 300,
        y: 150,
      },
      geometry: {
        width: 200,
        height: 120,
      },
      style: {
        fillColor: featureColor + "20",
        borderColor: featureColor,
        borderWidth: 3,
      },
    })
    elementsBreakdown.processes++

    // Decision diamond for complex features
    if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 2) {
      items.push({
        type: "shape",
        shape: "diamond",
        data: {
          content: `Complete?`,
        },
        position: {
          x: 270 + index * 300,
          y: 300,
        },
        geometry: {
          width: 120,
          height: 80,
        },
        style: {
          fillColor: colors.orange + "20",
          borderColor: colors.orange,
          borderWidth: 2,
        },
      })
      elementsBreakdown.decisions++
    }

    // Acceptance criteria as sticky notes
    feature.acceptanceCriteria
      .slice(0, 3)
      .forEach((criteria: string, subIndex: number) => {
        items.push({
          type: "sticky_note",
          data: {
            content: `✓ ${criteria}`,
          },
          position: {
            x: 180 + index * 300 + subIndex * 80,
            y: 400,
          },
          style: {
            fillColor: featureColor + "40",
          },
        })
      })

    // Create connector from previous step
    if (index === 0) {
      // Connect from START
      connectors.push({
        start: {
          position: { x: 200, y: 200 },
        },
        end: {
          position: { x: 250 + index * 300, y: 210 },
        },
        style: {
          strokeColor: primaryColor,
          strokeWidth: 3,
        },
      })
    } else {
      // Connect from previous feature
      connectors.push({
        start: {
          position: { x: 250 + (index - 1) * 300 + 200, y: 210 },
        },
        end: {
          position: { x: 250 + index * 300, y: 210 },
        },
        style: {
          strokeColor: primaryColor,
          strokeWidth: 3,
        },
      })
    }
  })

  // End node as circle
  const lastFeatureX = 250 + prdContent.features.length * 300
  items.push({
    type: "shape",
    shape: "circle",
    data: {
      content: "END",
    },
    position: { x: lastFeatureX, y: 150 },
    geometry: { width: 100, height: 100 },
    style: {
      fillColor: colors.red + "30",
      borderColor: colors.red,
      borderWidth: 3,
    },
  })
  elementsBreakdown.endpoints++

  // Final connector to END
  if (prdContent.features.length > 0) {
    connectors.push({
      start: {
        position: {
          x: 250 + (prdContent.features.length - 1) * 300 + 200,
          y: 210,
        },
      },
      end: {
        position: { x: lastFeatureX, y: 200 },
      },
      style: {
        strokeColor: primaryColor,
        strokeWidth: 3,
      },
    })
  }

  return { items, connectors, elementsBreakdown }
}

function generateWorkflowMap(prdContent: any, settings: any) {
  return generateProcessDiagram(prdContent, settings) // Similar to process diagram
}

function generatePersonaMapping(prdContent: any, settings: any) {
  const items: any[] = []
  const connectors: any[] = []
  const elementsBreakdown: Record<string, number> = {
    personas: 0,
    needs: 0,
    painPoints: 0,
    journeys: 0,
  }

  const colors = {
    blue: "#1a73e8",
    green: "#34a853",
    purple: "#9c27b0",
    orange: "#ff9800",
    red: "#f44336",
    teal: "#00bcd4",
    indigo: "#3f51b5",
    rose: "#e91e63",
  }

  const colorScheme = settings.colorScheme || "blue"
  const primaryColor = colors[colorScheme as keyof typeof colors] || colors.blue

  // Section header
  items.push({
    data: {
      content: `
        <div style="
          background: linear-gradient(135deg, ${colors.purple}15 0%, ${colors.purple}25 100%);
          padding: 20px;
          text-align: center;
          border-radius: 15px;
          border: 2px solid ${colors.purple};
        ">
          <h2 style="
            color: ${colors.purple};
            margin: 0;
            font-size: 20px;
            font-weight: bold;
          ">👥 USER PERSONAS</h2>
          <p style="
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          ">Target audience analysis</p>
        </div>
      `,
    },
    position: { x: 0, y: -80 },
    geometry: { width: 400, height: 100 },
    style: {
      fillColor: "transparent",
      borderColor: "transparent",
    },
  })
  elementsBreakdown.personas++

  if (prdContent.userPersonas) {
    prdContent.userPersonas.forEach((persona: any, index: number) => {
      const personaColors = [
        colors.blue,
        colors.green,
        colors.purple,
        colors.orange,
        colors.teal,
      ]
      const personaColor = personaColors[index % personaColors.length]
      const avatarEmojis = ["👨‍💼", "👩‍💻", "👨‍🎓", "👩‍🎨", "👨‍🔬", "👩‍⚕️"]
      const avatar = avatarEmojis[index % avatarEmojis.length]

      // Enhanced main persona card as proper card type
      items.push({
        type: "card",
        title: `${avatar} ${persona.name}`,
        data: {
          content: `${persona.role}\\n${persona.demographics}\\nTop Goal: ${persona.goals[0] || "Achieve success"}`,
        },
        position: {
          x: 50 + index * 350,
          y: 50,
        },
        style: {
          fillColor: personaColor + "20",
        },
      })
      elementsBreakdown.personas++

      // Needs as sticky notes
      if (persona.needs && persona.needs.length > 0) {
        persona.needs.slice(0, 3).forEach((need: string, needIndex: number) => {
          items.push({
            type: "sticky_note",
            data: {
              content: `💭 Need: ${need}`,
            },
            position: {
              x: 50 + index * 350,
              y: 330 + needIndex * 85,
            },
            style: {
              fillColor: "light_green",
            },
          })
          elementsBreakdown.needs++
        })
      }

      // Pain points as sticky notes
      if (persona.painPoints && persona.painPoints.length > 0) {
        persona.painPoints
          .slice(0, 2)
          .forEach((pain: string, painIndex: number) => {
            items.push({
              type: "sticky_note",
              data: {
                content: `⚠️ Pain: ${pain}`,
              },
              position: {
                x: 170 + index * 350,
                y: 330 + painIndex * 85,
              },
              style: {
                fillColor: "red",
              },
            })
            elementsBreakdown.painPoints++
          })
      }
    })
  }

  return { items, connectors, elementsBreakdown }
}

function generateProcessWorkflow(prdContent: any, settings: any) {
  return generateProcessDiagram(prdContent, settings) // Process workflow uses same logic as process diagram
}

function generateFeatureFlowchart(prdContent: any, settings: any) {
  return generateProcessDiagram(prdContent, settings) // Default to process diagram
}

function generateRecommendations(
  designType: string,
  prdContent: any,
  itemsCount: number
): string[] {
  const recommendations = [
    `Generated ${itemsCount} visual elements for comprehensive ${designType.replace("_", " ")}`,
    "Share the Miro board with stakeholders for collaborative feedback",
    "Use the board as a reference during development planning",
  ]

  switch (designType) {
    case "user_journey":
      recommendations.push(
        "Conduct user interviews to validate the journey assumptions",
        "Identify key touchpoints for product optimization"
      )
      break
    case "user_flow":
      recommendations.push(
        "Test the flow with real users for usability validation",
        "Consider alternative paths for edge cases"
      )
      break
    case "process_diagram":
      recommendations.push(
        "Review with engineering team for technical feasibility",
        "Identify automation opportunities in the process"
      )
      break
  }

  return recommendations
}

function generateNextSteps(designType: string, boardLink: string): string[] {
  return [
    `Review the generated ${designType.replace("_", " ")} in Miro`,
    "Gather feedback from stakeholders and team members",
    "Iterate on the design based on feedback",
    "Use the visual guide for development planning",
    `Access board: ${boardLink}`,
  ]
}

// Export test function
export async function testVisualDesignTool() {
  console.log("🧪 Testing Visual Design Tool...")

  const testInput = {
    projectTitle: "TaskFlow Pro",
    designType: "user_journey" as const,
    prdContent: {
      features: [
        {
          name: "Task Creation",
          description: "Users can create and organize tasks",
          acceptanceCriteria: [
            "Create task form",
            "Task categorization",
            "Due date setting",
          ],
          priority: "high" as const,
        },
      ],
      userPersonas: [
        {
          name: "Busy Professional",
          role: "Project Manager",
          demographics: "30-45 years, urban professional",
          needs: ["Efficient task management", "Team collaboration"],
          painPoints: ["Too many tools", "Poor organization"],
          goals: ["Increase productivity", "Better work-life balance"],
        },
      ],
      userStories: [
        {
          id: "US001",
          title: "Create new task",
          persona: "Busy Professional",
          userAction: "create a task with details",
          benefit: "I can track my work effectively",
          acceptanceCriteria: ["Task title", "Description", "Due date"],
          priority: "high" as const,
        },
      ],
    },
  }

  try {
    const result = await visualDesignTool.execute({
      context: testInput,
      runtimeContext: undefined as any,
    })

    console.log("✅ Visual Design Tool test passed!")
    console.log(`🎨 Design Type: ${testInput.designType}`)
    console.log(`📊 Items Created: ${result.visualElements.itemsCreated}`)
    console.log(`🔗 Miro Board: ${result.miroBoard.viewLink}`)

    return result
  } catch (error) {
    console.error("❌ Visual Design Tool test failed:", error)
    throw error
  }
}
