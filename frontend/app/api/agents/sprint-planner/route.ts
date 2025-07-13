import { NextRequest, NextResponse } from 'next/server';
import { sprintPlannerAgent } from '@/src/mastra/agents/sprintPlannerAgent';

export async function POST(request: NextRequest) {
  try {
    const { productIdea, userStories, sessionId } = await request.json();

    if (!productIdea || !userStories) {
      return NextResponse.json(
        { error: 'Product idea and user stories are required' },
        { status: 400 }
      );
    }

    const result = await sprintPlannerAgent.generate(
      `Please generate sprint plan for this product: ${JSON.stringify(productIdea)} with user stories: ${JSON.stringify(userStories)}`,
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
    console.error('Sprint planning error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate sprint plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}