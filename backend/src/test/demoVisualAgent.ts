// Demo Visual Design Agent Capabilities
import "dotenv/config"
import { visualDesignAgent } from "../mastra/agents/visualDesignAgent.js"

async function demoVisualDesignAgent() {
  console.log("🎨 VISUAL DESIGN AGENT DEMO")
  console.log("🚀 Showcasing Enhanced Capabilities")
  console.log("=" .repeat(60))

  // Demo 1: E-commerce Platform with Complex User Journey
  console.log("\n📱 Demo 1: E-commerce Platform - Complex User Journey")
  console.log("-".repeat(50))
  
  const ecommerceDemo = `
    I'm building a revolutionary e-commerce platform called "EcoShop" that focuses on sustainable products. 

    Key Features:
    1. AI-powered sustainability scoring for products (High Priority)
    2. Carbon footprint calculator for purchases (High Priority) 
    3. Community-driven product reviews with eco-impact ratings (Medium Priority)
    4. Subscription box for eco-friendly products (Medium Priority)
    5. Marketplace for local sustainable vendors (Low Priority)

    Target Users:
    - Emma (Environmental Advocate, 28): Tech-savvy professional who prioritizes sustainability
    - David (Conscious Parent, 35): Family-focused buyer seeking safe, eco-friendly products for kids
    - Sarah (Green Business Owner, 42): Small business owner looking to source sustainable products

    User Stories:
    - As Emma, I want to quickly see the environmental impact of my purchases so I can make informed decisions
    - As David, I want to find products that are safe for my children and good for the planet
    - As Sarah, I want to discover local sustainable vendors to support my business values

    Please create a comprehensive visual design that includes:
    - Beautiful user journey maps showing the emotional experience
    - Process workflow diagrams for the key features
    - Persona cards with rich visual details
    - Flow diagrams showing decision points and user paths

    Make it visually stunning with modern design elements, professional styling, and engaging visual hierarchy!
  `

  try {
    console.log("🎯 Creating comprehensive visual design for EcoShop...")
    
    const result1 = await visualDesignAgent.generate(ecommerceDemo, {
      conversationId: "ecoshop-demo"
    })

    console.log("\n✅ EcoShop Visual Design Complete!")
    console.log("🎨 Agent Response:")
    console.log(result1.text)
    console.log("\n" + "=".repeat(60))

  } catch (error) {
    console.error("❌ Demo 1 failed:", error.message)
  }

  // Demo 2: SaaS Product with Technical Workflows  
  console.log("\n💼 Demo 2: SaaS Platform - Technical Process Mapping")
  console.log("-".repeat(50))

  const saasDemo = `
    I'm designing a project management SaaS called "TeamFlow" for remote teams.

    Core Features:
    1. Real-time collaboration boards with AI task assignment (High Priority)
    2. Automated sprint planning with team capacity analysis (High Priority)
    3. Integration hub connecting 50+ tools (Medium Priority)
    4. Advanced analytics dashboard with predictive insights (Medium Priority)
    5. Custom workflow builder with no-code automation (Low Priority)

    User Personas:
    - Alex (Scrum Master, 32): Experienced agile practitioner managing distributed teams
    - Maria (Product Manager, 29): Data-driven PM juggling multiple projects
    - James (Developer, 26): Full-stack engineer who values efficient workflows

    Key User Stories:
    - As Alex, I want automated sprint planning so I can focus on team coaching instead of admin work
    - As Maria, I want predictive analytics to identify project risks before they become problems  
    - As James, I want seamless tool integration so I don't have to context-switch constantly

    Create beautiful process diagrams showing:
    - System architecture and data flows
    - User onboarding and feature discovery journeys
    - Team collaboration workflows
    - Integration and automation processes

    Focus on professional, enterprise-grade visual design with clean layouts and modern aesthetics!
  `

  try {
    console.log("🎯 Creating technical process mapping for TeamFlow...")
    
    const result2 = await visualDesignAgent.generate(saasDemo, {
      conversationId: "teamflow-demo"  
    })

    console.log("\n✅ TeamFlow Visual Design Complete!")
    console.log("🎨 Agent Response:")
    console.log(result2.text)
    console.log("\n" + "=".repeat(60))

  } catch (error) {
    console.error("❌ Demo 2 failed:", error.message)
  }

  // Demo 3: Mobile App with User Experience Focus
  console.log("\n📱 Demo 3: Mobile App - User Experience Design")
  console.log("-".repeat(50))

  const mobileDemo = `
    I'm creating a wellness mobile app called "MindfulMe" for mental health and mindfulness.

    Key Features:
    1. Personalized meditation programs with AI coach (High Priority)
    2. Mood tracking with insights and trends (High Priority)
    3. Community support groups and challenges (Medium Priority)
    4. Integration with wearables for stress monitoring (Medium Priority)
    5. Expert-led live sessions and workshops (Low Priority)

    Target Users:
    - Lisa (Busy Executive, 34): High-stress professional seeking quick stress relief
    - Tom (College Student, 20): Anxious student learning coping mechanisms
    - Rachel (New Mom, 31): Sleep-deprived parent needing emotional support

    User Stories:
    - As Lisa, I want 5-minute meditation sessions that fit into my busy schedule
    - As Tom, I want to track my anxiety patterns and learn what triggers them
    - As Rachel, I want to connect with other new moms going through similar experiences

    Design focus areas:
    - Emotional user journey mapping with mood states
    - Mobile-first user flows and interaction patterns
    - Onboarding experience that builds trust and engagement
    - Visual representation of wellness progress and achievements

    Create calming, beautiful designs that reflect the wellness theme with soothing colors and mindful layouts!
  `

  try {
    console.log("🎯 Creating wellness-focused UX design for MindfulMe...")
    
    const result3 = await visualDesignAgent.generate(mobileDemo, {
      conversationId: "mindfulme-demo"
    })

    console.log("\n✅ MindfulMe Visual Design Complete!")
    console.log("🎨 Agent Response:")
    console.log(result3.text)

  } catch (error) {
    console.error("❌ Demo 3 failed:", error.message)
  }

  console.log("\n" + "=".repeat(60))
  console.log("🎉 VISUAL DESIGN AGENT DEMO COMPLETE!")
  console.log("🎨 Key Capabilities Demonstrated:")
  console.log("  ✅ Complex user journey mapping")
  console.log("  ✅ Technical process workflow diagrams")
  console.log("  ✅ Beautiful persona cards and user stories")
  console.log("  ✅ Mobile-first UX design thinking")
  console.log("  ✅ Professional Miro board creation")
  console.log("  ✅ Modern visual design with rich styling")
  console.log("  ✅ Multi-domain expertise (E-commerce, SaaS, Mobile)")
  console.log("  ✅ Stakeholder-ready visual artifacts")
  console.log("\n🔗 Check the generated Miro boards for full visual experience!")
}

// Run the demo
demoVisualDesignAgent().catch(console.error)