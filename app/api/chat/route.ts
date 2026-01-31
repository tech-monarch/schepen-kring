import { NextRequest, NextResponse } from 'next/server';
import { aiService, ChatMessage } from '@/lib/ai-service';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if chatbot is enabled
    const isEnabled = process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true';
    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Chatbot is disabled' },
        { status: 503 }
      );
    }

    // Prepare messages for AI service
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a helpful assistant for answer24, a platform that helps users with various services. 
        Be friendly, professional, and helpful. Keep responses concise and relevant to the user's question.
        If you don't know something specific about answer24, suggest they contact support or check our FAQ.`
      },
      ...history.slice(-parseInt(process.env.NEXT_PUBLIC_CHATBOT_MAX_HISTORY || '10')),
      {
        role: 'user',
        content: message
      }
    ];

    // Get AI response
    const response = await aiService.generateResponse(messages);

    // Add response delay if configured
    const delay = parseInt(process.env.NEXT_PUBLIC_CHATBOT_RESPONSE_DELAY || '1000');
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return NextResponse.json({
      message: response.content,
      usage: response.usage,
      service: aiService.getServiceName(),
      configured: aiService.isConfigured()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        message: "I'm sorry, I'm having trouble right now. Please try again later or contact our support team."
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    enabled: process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true',
    service: process.env.NEXT_PUBLIC_AI_SERVICE || 'openai',
    configured: aiService.isConfigured(),
    welcomeMessage: process.env.NEXT_PUBLIC_CHATBOT_WELCOME_MESSAGE || "Hi there! I'm answer24, your assistant. How can I help you today?"
  });
}
