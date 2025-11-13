import { GoogleGenerativeAI } from '@google/generative-ai';

// Function definitions for Gemini to call
export const availableFunctions = [
  {
    name: 'logKeplerWalk',
    description: 'Log a walk for Kepler the dog. Use this when user wants to record a walk.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'custom'],
          description: 'Type of walk based on time of day',
        },
        duration: {
          type: 'number',
          description: 'Duration of walk in minutes',
        },
        location: {
          type: 'string',
          description: 'Location where the walk took place',
        },
        notes: {
          type: 'string',
          description: 'Any additional notes about the walk',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'getSchedule',
    description: 'Get calendar events for today or a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in ISO format (YYYY-MM-DD). Defaults to today.',
        },
      },
    },
  },
  {
    name: 'getChores',
    description: 'Get list of chores, optionally filtered by assignee or status',
    parameters: {
      type: 'object',
      properties: {
        assignee: {
          type: 'string',
          description: 'Filter by roommate name (Nick, Alex, Landon, or current user)',
        },
        completed: {
          type: 'boolean',
          description: 'Filter by completion status',
        },
      },
    },
  },
  {
    name: 'completeChore',
    description: 'Mark a chore as completed',
    parameters: {
      type: 'object',
      properties: {
        choreId: {
          type: 'string',
          description: 'The ID of the chore to complete',
        },
      },
      required: ['choreId'],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate to a different section of the dashboard',
    parameters: {
      type: 'object',
      properties: {
        screen: {
          type: 'string',
          enum: [
            'dashboard',
            'traditional',
            'analytics',
            'checkins',
            'rules',
            'kepler',
            'chores',
            'calendar',
            'expenses',
            'notes',
            'photos',
            'settings',
          ],
          description: 'The screen to navigate to',
        },
      },
      required: ['screen'],
    },
  },
  {
    name: 'getKeplerStats',
    description: 'Get statistics about Kepler including walks, health info, etc.',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'week', 'month'],
          description: 'Time period for stats',
        },
      },
    },
  },
  {
    name: 'getHouseRules',
    description: 'Get house rules and guidelines',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category to filter rules',
        },
      },
    },
  },
  {
    name: 'getRoommateInfo',
    description: 'Get information about roommates',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Roommate name (Nick, Alex, Landon)',
        },
      },
    },
  },
];

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface FunctionCall {
  name: string;
  args: any;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private chat: any = null;
  private conversationHistory: ChatMessage[] = [];

  constructor(config: GeminiConfig) {
    if (config.apiKey && config.apiKey !== 'YOUR_GEMINI_API_KEY') {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: config.model || 'gemini-1.5-flash',
      });
      this.initializeChat();
    }
  }

  private initializeChat() {
    if (!this.model) return;

    // Get context from localStorage
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const currentUser = onboardingData.name || 'User';
    
    // Build system context
    const systemContext = `You are a helpful AI assistant for a roommate management dashboard. 

ROOMMATES:
- ${currentUser} (current user)
- Nick
- Alex
- Landon
- Kepler (the dog - a beloved pet who needs regular walks)

YOUR ROLE:
- Help manage the household including chores, schedules, pet care, and communication
- Be friendly, conversational, and proactive
- When users ask to do something, use the available functions to actually perform actions
- Keep responses concise but warm and helpful
- Use the roommates' names when relevant

CAPABILITIES:
- Log and track Kepler's walks (morning, afternoon, evening)
- Check and manage the shared calendar
- View and complete chores
- Get house rules and guidelines
- Navigate to different dashboard sections
- Provide stats and insights

PERSONALITY:
- Friendly and supportive
- Organized and efficient
- Caring about Kepler's wellbeing
- Respectful of all roommates

Remember: You can actually perform actions through function calls, not just give advice.`;

    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood! I\'m ready to help manage your home. I can help with Kepler\'s walks, chores, schedules, and more. What would you like me to do?' }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async sendMessage(userMessage: string): Promise<{
    text: string;
    functionCalls?: FunctionCall[];
  }> {
    if (!this.chat) {
      return {
        text: 'AI is not configured. Please add your Gemini API key in the settings.',
      };
    }

    try {
      // Add context about current data
      const contextMessage = this.buildContextMessage(userMessage);
      
      const result = await this.chat.sendMessage(contextMessage);
      const response = await result.response;
      const text = response.text();

      // Check for function calls (if using function calling)
      const functionCalls = this.extractFunctionCalls(text);

      return {
        text: this.cleanResponse(text),
        functionCalls,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        text: 'Sorry, I encountered an error. Please try again.',
      };
    }
  }

  private buildContextMessage(userMessage: string): string {
    // Add current context from localStorage
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get today's walks
    const walks = JSON.parse(localStorage.getItem('keplerWalks') || '[]');
    const todayWalks = walks.filter((w: any) => w.date === todayStr);
    
    // Get calendar events
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    const todayEvents = events.filter((e: any) => e.date?.startsWith(todayStr));
    
    // Get chores
    const chores = JSON.parse(localStorage.getItem('chores') || '[]');
    const pendingChores = chores.filter((c: any) => !c.completed);

    const context = `
Current Context:
- Time: ${now.toLocaleTimeString()}
- Date: ${now.toLocaleDateString()}
- Kepler's walks today: ${todayWalks.length}
- Calendar events today: ${todayEvents.length}
- Pending chores: ${pendingChores.length}

User message: ${userMessage}`;

    return context;
  }

  private extractFunctionCalls(text: string): FunctionCall[] | undefined {
    // Parse function calls if present (Gemini may return them in JSON format)
    // This is a simplified version - Gemini's actual function calling is more structured
    const functionCalls: FunctionCall[] = [];
    
    // Look for patterns like [FUNCTION: functionName(args)]
    const functionPattern = /\[FUNCTION:\s*(\w+)\((.*?)\)\]/g;
    let match;
    
    while ((match = functionPattern.exec(text)) !== null) {
      const [, name, argsStr] = match;
      try {
        const args = argsStr ? JSON.parse(argsStr) : {};
        functionCalls.push({ name, args });
      } catch (e) {
        console.error('Failed to parse function args:', e);
      }
    }
    
    return functionCalls.length > 0 ? functionCalls : undefined;
  }

  private cleanResponse(text: string): string {
    // Remove function call markers from the response
    return text.replace(/\[FUNCTION:.*?\]/g, '').trim();
  }

  reset() {
    this.conversationHistory = [];
    this.initializeChat();
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export function initializeGemini(apiKey: string): GeminiService {
  geminiService = new GeminiService({ apiKey });
  return geminiService;
}

export function getGeminiService(): GeminiService | null {
  return geminiService;
}

// Function executor
export async function executeFunctionCall(
  functionCall: FunctionCall,
  onNavigate?: (screen: string) => void,
): Promise<string> {
  const { name, args } = functionCall;

  switch (name) {
    case 'logKeplerWalk': {
      const walks = JSON.parse(localStorage.getItem('keplerWalks') || '[]');
      const timeMap = {
        morning: '08:00',
        afternoon: '14:00',
        evening: '18:00',
      };

      const newWalk = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        duration: args.duration || 20,
        location: args.location || 'Neighborhood',
        notes: args.notes || 'Logged via AI Assistant',
        scheduledTime:
          args.type !== 'custom' ? timeMap[args.type as keyof typeof timeMap] : undefined,
      };

      walks.push(newWalk);
      localStorage.setItem('keplerWalks', JSON.stringify(walks));
      window.dispatchEvent(new Event('storage'));

      return `Successfully logged ${args.type} walk for Kepler!`;
    }

    case 'getSchedule': {
      const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
      const targetDate = args.date || new Date().toISOString().split('T')[0];
      const dayEvents = events.filter((e: any) => e.date?.startsWith(targetDate));

      if (dayEvents.length === 0) {
        return 'No events scheduled for this day.';
      }

      return `Events: ${dayEvents.map((e: any) => e.title).join(', ')}`;
    }

    case 'getChores': {
      const chores = JSON.parse(localStorage.getItem('chores') || '[]');
      let filtered = chores;

      if (args.assignee) {
        filtered = filtered.filter((c: any) => c.assignee === args.assignee);
      }

      if (args.completed !== undefined) {
        filtered = filtered.filter((c: any) => c.completed === args.completed);
      }

      if (filtered.length === 0) {
        return 'No chores found matching your criteria.';
      }

      return `Chores: ${filtered.map((c: any) => `${c.task} (${c.assignee})`).join(', ')}`;
    }

    case 'completeChore': {
      const chores = JSON.parse(localStorage.getItem('chores') || '[]');
      const chore = chores.find((c: any) => c.id === args.choreId);

      if (!chore) {
        return 'Chore not found.';
      }

      chore.completed = true;
      chore.completedDate = new Date().toISOString();
      localStorage.setItem('chores', JSON.stringify(chores));
      window.dispatchEvent(new Event('storage'));

      return `Marked "${chore.task}" as completed!`;
    }

    case 'navigate': {
      if (onNavigate) {
        onNavigate(args.screen);
        return `Navigating to ${args.screen}...`;
      }
      return 'Navigation not available.';
    }

    case 'getKeplerStats': {
      const walks = JSON.parse(localStorage.getItem('keplerWalks') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const todayWalks = walks.filter((w: any) => w.date === today);

      return `Kepler has ${todayWalks.length} walks today, totaling ${todayWalks.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)} minutes.`;
    }

    case 'getHouseRules': {
      const rules = JSON.parse(localStorage.getItem('houseRules') || '[]');
      
      if (rules.length === 0) {
        return 'No house rules have been set yet.';
      }

      return `House rules: ${rules.map((r: any) => r.title || r.rule).slice(0, 3).join(', ')}`;
    }

    case 'getRoommateInfo': {
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      return `Roommate info for ${args.name}: This feature is coming soon!`;
    }

    default:
      return `Function ${name} not implemented.`;
  }
}
