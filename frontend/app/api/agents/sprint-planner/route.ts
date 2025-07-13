import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock sprint planner response
    const mockResponse = {
      sprints: [
        {
          id: 'sprint-1',
          name: 'Foundation Sprint',
          duration: 14,
          tasks: [
            {
              title: 'Set up project structure',
              description: 'Initialize repository and basic configuration',
              effort: 8,
              dependencies: []
            },
            {
              title: 'Core authentication system',
              description: 'Implement user login and registration',
              effort: 13,
              dependencies: ['Set up project structure']
            }
          ]
        },
        {
          id: 'sprint-2',
          name: 'Feature Development Sprint',
          duration: 14,
          tasks: [
            {
              title: 'Main dashboard implementation',
              description: 'Build the primary user interface',
              effort: 21,
              dependencies: ['Core authentication system']
            }
          ]
        }
      ],
      linearCycleId: 'cycle-mock-123',
      linearUrl: 'https://linear.app/mock-workspace/cycle/mock-123'
    };

    return NextResponse.json({
      success: true,
      data: mockResponse,
      metadata: {
        agentType: 'sprint-planner',
        processingTime: 2500,
        confidence: 0.85,
        sessionId: sessionId || `session-${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Sprint planning error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate sprint plan',
        metadata: {
          agentType: 'sprint-planner',
          processingTime: 0,
          confidence: 0
        }
      },
      { status: 500 }
    );
  }
}