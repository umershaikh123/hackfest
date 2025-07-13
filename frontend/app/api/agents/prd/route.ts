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
            agentType: 'prd',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Mock PRD response
    const mockResponse = {
      prdId: `prd-${Date.now()}`,
      notionPageId: 'mock-notion-page-id',
      notionUrl: 'https://notion.so/mock-prd-page',
      sections: [
        'Executive Summary',
        'Problem Statement', 
        'Target Audience',
        'Features & Requirements',
        'Success Metrics',
        'Technical Overview',
        'Timeline & Milestones'
      ],
      wordCount: 2500
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: mockResponse,
      metadata: {
        agentType: 'prd',
        processingTime,
        confidence: 0.94,
        sessionId: sessionId || `session-${Date.now()}`,
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