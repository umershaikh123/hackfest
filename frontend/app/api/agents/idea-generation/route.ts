import { NextRequest, NextResponse } from 'next/server';
import { ideaGenerationAgent } from '@/src/mastra/agents/ideaGenerationAgent';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const result = await ideaGenerationAgent.generate(
      `Please refine this product idea: ${message}`,
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
    console.error('Idea generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate idea',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}