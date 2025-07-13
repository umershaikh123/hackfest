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
            agentType: 'prd',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Use the Mastra client to call the backend PRD agent
    const result = await mastraAgents.prdGeneration(
      { title: "Product", description: message }, // productIdea
      [], // userPersonas
      [], // userStories
      [] // conversationHistory
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'PRD generation failed',
          metadata: {
            agentType: 'prd',
            processingTime: result.metadata?.processingTime || 0,
            confidence: 0,
          }
        },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    // Format the response using the backend agent result
    const responseData = {
      prdId: `prd-${Date.now()}`,
      notionPageId: result.data?.notionPageId || null,
      notionUrl: result.data?.notionUrl || null,
      sections: result.data?.sections || [
        'Executive Summary',
        'Problem Statement', 
        'User Stories',
        'Features & Requirements',
        'Technical Architecture',
        'Success Metrics',
        'Timeline & Milestones'
      ],
      wordCount: result.data?.wordCount || 0,
      content: result.data?.content || result.data?.text || '',
      rawResponse: result.data?.text || result.data?.content || '',
      text: result.data?.text || result.data?.content || '',
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'prd',
        processingTime,
        confidence: 0.94,
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.metadata?.usage,
        toolCalls: result.metadata?.toolCalls,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('PRD generation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PRD',
        metadata: {
          agentType: 'prd',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}