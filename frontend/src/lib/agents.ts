export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
  sessionId?: string;
}

export class AgentClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/agents') {
    this.baseUrl = baseUrl;
  }

  async generateIdea(message: string, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/idea-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });

    return response.json();
  }

  async generateUserStories(productIdea: any, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/user-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIdea, sessionId }),
    });

    return response.json();
  }

  async generatePRD(productIdea: any, userStories: any, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/prd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIdea, userStories, sessionId }),
    });

    return response.json();
  }

  async generateSprintPlan(productIdea: any, userStories: any, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/sprint-planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIdea, userStories, sessionId }),
    });

    return response.json();
  }

  async generateVisualDesign(productIdea: any, userStories: any, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/visual-design`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIdea, userStories, sessionId }),
    });

    return response.json();
  }

  async processFeedback(feedback: string, currentState: any, sessionId?: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback, currentState, sessionId }),
    });

    return response.json();
  }
}

export const agentClient = new AgentClient();