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
            agentType: 'user-story',
            processingTime: 0,
            confidence: 0,
          }
        },
        { status: 400 }
      );
    }

    // Mock response for user story generation
    const mockResponse = {
      userStories: [
        {
          id: 'us-1',
          title: 'User Registration',
          description: 'As a new user, I want to create an account so that I can access personalized features',
          acceptanceCriteria: [
            'User can enter email and password',
            'System validates email format',
            'User receives confirmation email',
            'Account is created successfully'
          ],
          priority: 'high' as const,
          storyPoints: 5
        },
        {
          id: 'us-2',
          title: 'Dashboard View',
          description: 'As a logged-in user, I want to see a dashboard so that I can quickly access key features',
          acceptanceCriteria: [
            'Dashboard shows user statistics',
            'Quick action buttons are visible',
            'Recent activity is displayed',
            'Navigation is intuitive'
          ],
          priority: 'high' as const,
          storyPoints: 8
        },
        {
          id: 'us-3',
          title: 'Settings Management',
          description: 'As a user, I want to manage my settings so that I can customize my experience',
          acceptanceCriteria: [
            'User can update profile information',
            'Notification preferences can be changed',
            'Theme selection is available',
            'Changes are saved automatically'
          ],
          priority: 'medium' as const,
          storyPoints: 3
        }
      ],
      personas: [
        {
          name: 'Alex the Product Manager',
          role: 'Primary User',
          goals: [
            'Streamline product planning process',
            'Improve team collaboration',
            'Reduce time to market'
          ],
          painPoints: [
            'Manual documentation takes too long',
            'Multiple tools create friction',
            'Communication gaps with engineering'
          ]
        },
        {
          name: 'Sam the Developer',
          role: 'Secondary User',
          goals: [
            'Clear requirements understanding',
            'Efficient development workflow',
            'Quality code delivery'
          ],
          painPoints: [
            'Unclear requirements',
            'Frequent scope changes',
            'Inadequate technical documentation'
          ]
        }
      ]
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: mockResponse,
      metadata: {
        agentType: 'user-story',
        processingTime,
        confidence: 0.89,
        sessionId: sessionId || `session-${Date.now()}`,
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