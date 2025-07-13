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
            agentType: 'visual-design',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Get the visual design agent from Mastra
    const agent = await mastra.getAgent('visualDesignAgent');
    
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
          metadata: {
            agentType: 'visual-design',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 404 }
      );
    }

    // Generate visual design using the actual Mastra agent
    const result = await agent.generate(`
      Please create visual design artifacts for the following product:
      
      Product Details: "${message}"
      ${context ? `\nAdditional context: ${JSON.stringify(context)}` : ''}
      
      Please create visual design deliverables including:
      - User journey maps showing key touchpoints
      - Process flow diagrams
      - Wireframes for main screens
      - Integration with Miro for collaborative design
      
      Structure the response with visual design recommendations and Miro board details.
    `, {
      maxSteps: 5 // Allow the agent to use tools
    });

    const processingTime = Date.now() - startTime;

    // Format the response - agent tools may provide structured data in the future
    const responseData = {
      boardId: null, // Will be populated if Miro integration is successful
      boardUrl: null, // Will be populated if Miro integration is successful
      artifacts: [
        {
          type: 'user-journey' as const,
          elementCount: 0,
          description: 'See full response for user journey details'
        },
        {
          type: 'wireframe' as const,
          elementCount: 0,
          description: 'See full response for wireframe details'
        },
        {
          type: 'process-flow' as const,
          elementCount: 0,
          description: 'See full response for process flow details'
        }
      ],
      content: result.text,
      rawResponse: result.text,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'visual-design',
        processingTime,
        confidence: 0.88,
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.usage,
        toolCalls: result.toolCalls,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Visual design API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate visual design',
        metadata: {
          agentType: 'visual-design',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}