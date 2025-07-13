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
            agentType: 'user-story',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Use the Mastra client to call the backend user story agent
    const result = await mastraAgents.userStoryGeneration(
      { title: "Product", description: message }, // productIdea
      [], // userPersonas
      [] // conversationHistory
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'User story generation failed',
          metadata: {
            agentType: 'user-story',
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
      userStories: result.data?.userStories || [
        {
          id: 'us-generated',
          title: 'Generated User Stories',
          description: result.data?.text || 'User stories generated',
          acceptanceCriteria: ['See full response for detailed criteria'],
          priority: 'high' as const,
          storyPoints: 5
        }
      ],
      personas: result.data?.personas || [
        {
          name: 'Generated Persona',
          role: 'Primary User',
          goals: ['See full response for persona details'],
          painPoints: ['See full response for pain points']
        }
      ],
      rawResponse: result.data?.text || result.data?.content || '',
      text: result.data?.text || result.data?.content || '',
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        agentType: 'user-story',
        processingTime,
        confidence: 0.89,
        sessionId: sessionId || `session-${Date.now()}`,
        usage: result.metadata?.usage,
        toolCalls: result.metadata?.toolCalls,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('User story generation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate user stories',
        metadata: {
          agentType: 'user-story',
          processingTime,
          confidence: 0,
        },
      },
      { status: 500 }
    );
  }
}