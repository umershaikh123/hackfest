import { NextRequest, NextResponse } from 'next/server';
import { mastraAgents } from '@/lib/mastra-client';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, context, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message is required',
          metadata: {
            agentType: 'feedback',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Get the feedback router agent from Mastra
    const agent = await mastra.getAgent('feedbackRouterAgent');
    
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found',
          metadata: {
            agentType: 'feedback',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 404 }
      );
    }

    // Route feedback using the actual Mastra agent
    const result = await agent.generate(`
      Please analyze this user feedback and determine the best routing:
      
      Feedback: "${message}"
      ${context ? `\nWorkflow Context: ${JSON.stringify(context)}` : ''}
      
      Please determine:
      - Which agent should handle this feedback (idea-generation, user-story, prd, sprint-planner, visual-design)
      - Confidence level in the routing decision
      - Reasoning for the routing choice
      - Suggested action to take
      - Whether approval is required before proceeding
      
      Use the feedback router tool to provide routing decision.
    `, {
      maxSteps: 5 // Allow the agent to use tools
    });

    const processingTime = Date.now() - startTime;

    // Format the response - agent tools may provide structured data in the future
    const responseData = {
      routedAgent: 'idea-generation' as const, // Default, should be parsed from agent response
      confidence: 0.85,
      reasoning: result.text,
      suggestedAction: 'See full response for suggested action',
      requiresApproval: false,
      rawResponse: result.text,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'feedback',
        processingTime,
        confidence: 0.85,
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.usage,
        toolCalls: result.toolCalls,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Feedback routing API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process feedback',
        metadata: {
          agentType: 'feedback',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}