import { NextRequest, NextResponse } from "next/server";
import { aiService, ChatMessage } from "@/lib/ai-service";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [
    { companyId: "company1" },
    { companyId: "company2" },
    { companyId: "company3" },
  ];
}

interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  user_id?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  try {
    const { companyId } = await params;
    const {
      message,
      history = [],
      user_id,
    }: ChatRequest = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Get company-specific settings
    const settingsResponse = await fetch(
      `${request.nextUrl.origin}/api/widget-settings/${companyId}`,
    );
    const { settings } = await settingsResponse.json();

    // Get company-specific Pinecone configuration
    const pineconeConfig = await getPineconeConfig(companyId);

    // Search for relevant context from Pinecone
    const relevantContext = await searchPineconeContext(
      message,
      pineconeConfig,
      companyId,
    );

    // Prepare messages with company-specific context
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a ${settings.ai_personality} for ${settings.company_name}. 
        
        Company Context: ${relevantContext}
        
        Guidelines:
        - Be helpful and professional
        - Use the company's tone and personality
        - Provide accurate information based on the context
        - If you don't know something, suggest contacting support
        - Keep responses concise and relevant`,
      },
      ...history.slice(
        -parseInt(process.env.NEXT_PUBLIC_CHATBOT_MAX_HISTORY || "10"),
      ),
      {
        role: "user",
        content: message,
      },
    ];

    // Get AI response with company-specific settings
    const response = await aiService.generateResponse(messages);

    // Log conversation for analytics (optional)
    await logConversation(companyId, user_id, message, response.content);

    return NextResponse.json({
      message: response.content,
      usage: response.usage,
      service: aiService.getServiceName(),
      configured: aiService.isConfigured(),
      company_id: companyId,
      context_used: relevantContext ? "Yes" : "No",
    });
  } catch (error) {
    console.error("Partner Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        message:
          "I'm sorry, I'm having trouble right now. Please try again later or contact our support team.",
      },
      { status: 500 },
    );
  }
}

async function getPineconeConfig(companyId: string): Promise<PineconeConfig> {
  // In production, fetch from your database
  // For now, return mock config
  return {
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "us-west1-gcp",
    indexName: `answer24-${companyId}`, // Each company has its own index
  };
}

async function searchPineconeContext(
  message: string,
  config: PineconeConfig,
  companyId: string,
): Promise<string> {
  try {
    if (!config.apiKey) {
      return ""; // No Pinecone configured
    }

    // Mock Pinecone search - in production, use actual Pinecone SDK
    const mockContexts = {
      "123": [
        "We sell premium electronics and gadgets",
        "Free shipping on orders over $50",
        "Our return policy is 30 days",
        "We offer 24/7 customer support",
      ],
      "456": [
        "We specialize in organic skincare products",
        "All products are cruelty-free and vegan",
        "Free samples with every order",
        "We ship worldwide within 3-5 business days",
      ],
    };

    const contexts = mockContexts[companyId as keyof typeof mockContexts] || [];

    // Simple keyword matching for demo
    const relevantContexts = contexts.filter(
      (context) =>
        message.toLowerCase().includes("product") ||
        message.toLowerCase().includes("shipping") ||
        message.toLowerCase().includes("return") ||
        message.toLowerCase().includes("support"),
    );

    return relevantContexts.join(". ");
  } catch (error) {
    console.error("Pinecone search error:", error);
    return "";
  }
}

async function logConversation(
  companyId: string,
  userId: string | undefined,
  userMessage: string,
  aiResponse: string,
): Promise<void> {
  try {
    // In production, save to your database
    console.log("Conversation Log:", {
      company_id: companyId,
      user_id: userId,
      user_message: userMessage,
      ai_response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log conversation:", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await params;

  return NextResponse.json({
    company_id: companyId,
    status: "active",
    pinecone_configured: !!process.env.PINECONE_API_KEY,
    ai_service: process.env.NEXT_PUBLIC_AI_SERVICE || "openai",
  });
}
