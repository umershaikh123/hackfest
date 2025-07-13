/**
 * React Query hooks for Product Maestro AI agents
 * Provides optimized API state management with caching, error handling, and loading states
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AgentType, 
  AgentRequest, 
  AgentResponse,
  agentAPI,
  agentQueryKeys,
  IdeaGenerationResponse,
  UserStoryResponse,
  PRDResponse,
  SprintPlannerResponse,
  VisualDesignResponse,
  FeedbackResponse
} from '@/lib/agents';
import { useToast } from '@/hooks/use-toast';

/**
 * Generic agent mutation hook with error handling
 */
function useAgentMutation<T>(
  agentType: AgentType,
  onSuccess?: (data: AgentResponse<T>) => void,
  onError?: (error: Error) => void
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AgentRequest) => {
      const response = await agentAPI[agentType as keyof typeof agentAPI](request);
      
      if (!response.success) {
        throw new Error(response.error || 'Agent request failed');
      }
      
      return response as AgentResponse<T>;
    },
    onSuccess: (data: AgentResponse<T>) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: agentQueryKeys.agent(agentType) });
      
      toast({
        title: "Success",
        description: `${agentType.replace('-', ' ')} completed successfully`,
      });
      
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      
      onError?.(error);
    },
  });
}

/**
 * Idea Generation Agent Hook
 */
export function useIdeaGeneration(onSuccess?: (data: IdeaGenerationResponse) => void) {
  const mutation = useAgentMutation<IdeaGenerationResponse>(
    'idea-generation',
    (data) => {
      console.log('Idea generation onSuccess callback - full response:', data);
      console.log('Idea generation onSuccess callback - data.data:', data.data);
      // Call the provided callback if it exists
      if (onSuccess && data.data) {
        onSuccess(data.data);
      }
    }
  );

  // Log mutation state changes
  useEffect(() => {
    console.log('Idea generation mutation state changed:', {
      isPending: mutation.isPending,
      isSuccess: mutation.isSuccess,
      isError: mutation.isError,
      data: mutation.data,
      error: mutation.error
    });
  }, [mutation.isPending, mutation.isSuccess, mutation.isError, mutation.data, mutation.error]);

  return {
    generateIdea: mutation.mutate,
    isGenerating: mutation.isPending,
    ideaData: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * User Story Generator Hook
 */
export function useUserStoryGenerator() {
  const mutation = useAgentMutation<UserStoryResponse>(
    'user-story',
    (data) => {
      console.log('User stories generated:', data.data);
    }
  );

  return {
    generateUserStories: mutation.mutate,
    isGenerating: mutation.isPending,
    userStories: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * PRD Generator Hook
 */
export function usePRDGenerator() {
  const mutation = useAgentMutation<PRDResponse>(
    'prd',
    (data) => {
      console.log('PRD generated:', data.data);
      if (data.data?.notionUrl) {
        // Optionally open Notion page in new tab
        // window.open(data.data.notionUrl, '_blank');
      }
    }
  );

  return {
    generatePRD: mutation.mutate,
    isGenerating: mutation.isPending,
    prdData: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Sprint Planner Hook
 */
export function useSprintPlanner() {
  const mutation = useAgentMutation<SprintPlannerResponse>(
    'sprint-planner',
    (data) => {
      console.log('Sprint plan generated:', data.data);
      if (data.data?.linearUrl) {
        // Optionally open Linear workspace in new tab
        // window.open(data.data.linearUrl, '_blank');
      }
    }
  );

  return {
    generateSprintPlan: mutation.mutate,
    isGenerating: mutation.isPending,
    sprintData: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Visual Design Hook
 */
export function useVisualDesign() {
  const mutation = useAgentMutation<VisualDesignResponse>(
    'visual-design',
    (data) => {
      console.log('Visual design created:', data.data);
      if (data.data?.boardUrl) {
        // Optionally open Miro board in new tab
        // window.open(data.data.boardUrl, '_blank');
      }
    }
  );

  return {
    generateVisualDesign: mutation.mutate,
    isGenerating: mutation.isPending,
    visualData: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Feedback Router Hook
 */
export function useFeedbackRouter() {
  const mutation = useAgentMutation<FeedbackResponse>(
    'feedback',
    (data) => {
      console.log('Feedback routed:', data.data);
    }
  );

  return {
    routeFeedback: mutation.mutate,
    isRouting: mutation.isPending,
    routingData: mutation.data?.data,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Multi-agent workflow hook for complex operations
 */
export function useWorkflow() {
  const ideaGeneration = useIdeaGeneration();
  const userStoryGenerator = useUserStoryGenerator();
  const prdGenerator = usePRDGenerator();
  const sprintPlanner = useSprintPlanner();
  const visualDesign = useVisualDesign();
  
  // Debug log to check if hooks are working
  useEffect(() => {
    console.log('useWorkflow - hooks status:', {
      ideaGeneration: {
        isGenerating: ideaGeneration.isGenerating,
        isSuccess: ideaGeneration.isSuccess,
        hasData: !!ideaGeneration.ideaData
      }
    });
  }, [ideaGeneration.isGenerating, ideaGeneration.isSuccess, ideaGeneration.ideaData]);

  const isAnyGenerating = 
    ideaGeneration.isGenerating ||
    userStoryGenerator.isGenerating ||
    prdGenerator.isGenerating ||
    sprintPlanner.isGenerating ||
    visualDesign.isGenerating;

  const runCompleteWorkflow = async (initialIdea: string) => {
    return new Promise((resolve, reject) => {
      let completedSteps = 0;
      const totalSteps = 5;
      const results: any = {};

      // Step 1: Generate refined idea
      ideaGeneration.generateIdea({ message: initialIdea });
      
      // Monitor for completion of each step
      const checkCompletion = () => {
        if (ideaGeneration.isSuccess && !results.idea) {
          results.idea = ideaGeneration.ideaData;
          completedSteps++;
          
          // Step 2: Generate user stories
          if (results.idea) {
            userStoryGenerator.generateUserStories({
              message: `Generate user stories for: ${results.idea.refinedIdea}`,
              context: { idea: results.idea }
            });
          }
        }
        
        if (userStoryGenerator.isSuccess && !results.userStories) {
          results.userStories = userStoryGenerator.userStories;
          completedSteps++;
          
          // Step 3: Generate PRD
          if (results.idea && results.userStories) {
            prdGenerator.generatePRD({
              message: `Create PRD for: ${results.idea.refinedIdea}`,
              context: { idea: results.idea, userStories: results.userStories }
            });
          }
        }
        
        if (prdGenerator.isSuccess && !results.prd) {
          results.prd = prdGenerator.prdData;
          completedSteps++;
          
          // Step 4: Generate sprint plan
          if (results.idea && results.userStories && results.prd) {
            sprintPlanner.generateSprintPlan({
              message: `Create sprint plan for: ${results.idea.refinedIdea}`,
              context: { idea: results.idea, userStories: results.userStories, prd: results.prd }
            });
          }
        }
        
        if (sprintPlanner.isSuccess && !results.sprints) {
          results.sprints = sprintPlanner.sprintData;
          completedSteps++;
          
          // Step 5: Generate visual design
          if (results.idea && results.userStories && results.prd && results.sprints) {
            visualDesign.generateVisualDesign({
              message: `Create visual design for: ${results.idea.refinedIdea}`,
              context: {
                idea: results.idea,
                userStories: results.userStories,
                prd: results.prd,
                sprints: results.sprints
              }
            });
          }
        }
        
        if (visualDesign.isSuccess && !results.visual) {
          results.visual = visualDesign.visualData;
          completedSteps++;
        }
        
        // Check for completion
        if (completedSteps === totalSteps) {
          resolve(results);
        }
        
        // Check for errors
        if (ideaGeneration.error || userStoryGenerator.error || prdGenerator.error || 
            sprintPlanner.error || visualDesign.error) {
          reject(new Error('Workflow step failed'));
        }
      };
      
      // Poll for completion
      const interval = setInterval(checkCompletion, 100);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Workflow timeout'));
      }, 300000);
    });
  };

  const resetWorkflow = () => {
    ideaGeneration.reset();
    userStoryGenerator.reset();
    prdGenerator.reset();
    sprintPlanner.reset();
    visualDesign.reset();
  };

  return {
    // Individual agents
    ideaGeneration,
    userStoryGenerator,
    prdGenerator,
    sprintPlanner,
    visualDesign,
    
    // Workflow controls
    runCompleteWorkflow,
    resetWorkflow,
    isAnyGenerating,
    
    // Combined results
    allResults: {
      idea: ideaGeneration.ideaData,
      userStories: userStoryGenerator.userStories,
      prd: prdGenerator.prdData,
      sprints: sprintPlanner.sprintData,
      visual: visualDesign.visualData,
    },
  };
}

/**
 * Session management hook for conversation state
 */
export function useSession() {
  const queryClient = useQueryClient();
  
  const createSession = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session in localStorage (only on client)
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_session_id', sessionId);
    }
    
    return sessionId;
  };

  const getCurrentSession = () => {
    if (typeof window === 'undefined') {
      return `session_${Date.now()}`;
    }
    return localStorage.getItem('current_session_id') || createSession();
  };

  const clearSession = () => {
    const sessionId = getCurrentSession();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_session_id');
    }
    
    // Clear all related queries
    queryClient.removeQueries({ queryKey: agentQueryKeys.all });
    
    return sessionId;
  };

  return {
    createSession,
    getCurrentSession,
    clearSession,
  };
}