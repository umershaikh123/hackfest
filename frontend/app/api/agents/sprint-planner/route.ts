import { NextRequest, NextResponse } from 'next/server';
import { mastraAgents } from '@/lib/mastra-client';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { message, context, sessionId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message is required',
          metadata: {
            agentType: 'sprint-planner',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Get the sprint planner agent from Mastra
    const agent = await mastra.getAgent('sprintPlannerAgent');
    
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
          metadata: {
            agentType: 'sprint-planner',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 404 }
      );
    }

    // Generate sprint plan using the actual Mastra agent
    const result = await agent.generate(`
      Based on the following product requirements, please create a detailed sprint plan:
      
      Requirements: "${message}"
      ${context ? `\nAdditional context: ${JSON.stringify(context)}` : ''}
      
      Please create a sprint planning structure that includes:
      - Sprint breakdown with clear goals
      - Task definitions with effort estimates
      - Dependencies between tasks
      - Duration estimates for each sprint
      - Integration points with Linear for project management
      
      Structure the response as actionable sprint plans.
    `, {
      maxSteps: 5 // Allow the agent to use tools
    });

    const processingTime = Date.now() - startTime;

    // Format the response - agent tools may provide structured data in the future
    const responseData = {
      sprints: [
        {
          id: 'sprint-generated',
          name: 'Generated Sprint Plan',
          duration: 2,
          tasks: [
            {
              title: 'Sprint Planning Results',
              description: result.text,
              effort: 0,
              dependencies: []
            }
          ]
        }
      ],
      linearCycleId: null, // Will be populated if Linear integration is successful
      linearUrl: null, // Will be populated if Linear integration is successful
      content: result.text,
      rawResponse: result.text,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'sprint-planner',
        processingTime,
        confidence: 0.91,
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.usage,
        toolCalls: result.toolCalls,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Sprint planning API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate sprint plan',
        metadata: {
          agentType: 'sprint-planner',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}