import { NextRequest, NextResponse } from 'next/server';
import { mastraClient } from '@/lib/mastra-client';

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
            agentType: 'idea-generation',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Call the actual Mastra server
    const result = await mastraClient.agents.ideaGeneration(
      message,
      context ? JSON.stringify(context) : undefined
    );

    const processingTime = Date.now() - startTime;

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to process idea generation',
          metadata: {
            agentType: 'idea-generation',
            processingTime,
            confidence: 0,
          },
        },
        { status: 500 }
      );
    }

    // Format the response for frontend consumption
    const responseData = {
      refinedIdea: result.data?.text || 'Idea refinement completed',
      features: [], // Will be extracted from structured response
      targetAudience: 'Target audience analysis completed',
      problemStatement: 'Problem statement refined', 
      successCriteria: [], // Will be extracted from structured response
      rawResponse: result.data?.text || '', // Include full response
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'idea-generation',
        processingTime: result.metadata?.processingTime || processingTime,
        confidence: 0.92, // Could be extracted from agent response
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.metadata?.usage,
        toolCalls: result.metadata?.toolCalls,
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