interface AIConfig {
  service: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private config: AIConfig;

  constructor() {
    this.config = {
      service: process.env.NEXT_PUBLIC_AI_SERVICE || 'openai',
      apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '',
      model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || '0.7'),
    };
  }

  async generateResponse(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.config.apiKey || this.config.apiKey === 'your_openai_api_key_here') {
      return this.getFallbackResponse();
    }

    try {
      switch (this.config.service.toLowerCase()) {
        case 'openai':
          return await this.callOpenAI(messages);
        case 'anthropic':
          return await this.callAnthropic(messages);
        case 'cohere':
          return await this.callCohere(messages);
        default:
          return this.getFallbackResponse();
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse();
    }
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  private async callAnthropic(messages: ChatMessage[]): Promise<AIResponse> {
    // Convert messages to Anthropic format
    const lastMessage = messages[messages.length - 1];
    const systemMessage = messages.find(m => m.role === 'system');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage?.content || 'You are a helpful assistant for answer24.',
        messages: [
          {
            role: 'user',
            content: lastMessage.content,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage,
    };
  }

  private async callCohere(messages: ChatMessage[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: lastMessage.content,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.generations[0].text,
    };
  }

  private getFallbackResponse(): AIResponse {
    const fallbackResponses = [
      "Thanks for your message! I'm here to help with any questions you have about answer24.",
      "I understand you're looking for assistance. Let me help you with that!",
      "Great question! I can provide information about our services and support.",
      "I'm processing your request. Is there anything specific you'd like to know?",
      "Thanks for reaching out! I'm ready to assist you with whatever you need.",
    ];

    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
    };
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiKey !== 'your_openai_api_key_here');
  }

  getServiceName(): string {
    return this.config.service;
  }
}

export const aiService = new AIService();
export type { ChatMessage, AIResponse };
