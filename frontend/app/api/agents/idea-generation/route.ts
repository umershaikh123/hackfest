import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

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
            agentType: 'idea-generation',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // For now, we'll call the agent directly until backend API is ready
    // TODO: Replace with actual backend API call when available
    
    // Simulate backend response structure
    const mockResponse = {
      refinedIdea: `Refined product idea: ${message}`,
      features: [
        'Core functionality based on user needs',
        'User-friendly interface design',
        'Scalable architecture',
        'Mobile responsiveness'
      ],
      targetAudience: 'Primary target users who need this solution',
      problemStatement: `The main problem this product solves: ${message}`,
      successCriteria: [
        'User adoption rate > 70%',
        'Customer satisfaction score > 4.5/5',
        'Reduced time to complete core tasks'
      ]
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: mockResponse,
      metadata: {
        agentType: 'idea-generation',
        processingTime,
        confidence: 0.92,
        sessionId: sessionId || `session-${Date.now()}`,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Idea generation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process idea generation',
        metadata: {
          agentType: 'idea-generation',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}