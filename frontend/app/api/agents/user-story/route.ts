import { NextRequest, NextResponse } from 'next/server';
import { userStoryGeneratorAgent } from '@/src/mastra/agents/userStoryGeneratorAgent';

export async function POST(request: NextRequest) {
  try {
    const { productIdea, sessionId } = await request.json();

    if (!productIdea) {
      return NextResponse.json(
        { error: 'Product idea is required' },
        { status: 400 }
      );
    }

    const result = await userStoryGeneratorAgent.generate(
      `Please generate user stories for this product: ${JSON.stringify(productIdea)}`,
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
    console.error('User story generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate user stories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}