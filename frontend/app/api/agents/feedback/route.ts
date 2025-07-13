import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, context, sessionId } = body;

    if (!message) {
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

    // Mock feedback routing response
    const mockResponse = {
      routedAgent: 'idea-generation' as const,
      confidence: 0.85,
      reasoning: 'Based on the feedback content, this should be routed to the idea generation agent for further refinement.',
      suggestedAction: 'Refine the product concept based on user feedback',
      requiresApproval: false
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: mockResponse,
      metadata: {
        agentType: 'feedback',
        processingTime,
        confidence: 0.85,
        sessionId: sessionId || `session-${Date.now()}`,
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