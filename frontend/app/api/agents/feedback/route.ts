import { NextRequest, NextResponse } from 'next/server';
import { feedbackRouterAgent } from '@/src/mastra/agents/feedbackRouterAgent';

export async function POST(request: NextRequest) {
  try {
    const { feedback, currentState, sessionId } = await request.json();

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    const result = await feedbackRouterAgent.generate(
      `Please process this feedback: ${feedback} with current state: ${JSON.stringify(currentState || {})}`,
      {
        threadId: sessionId || `thread-${Date.now()}`
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      sessionId: sessionId || `session-${Date.now()}`
    });

  } catch (error) {
    console.error('Feedback routing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}