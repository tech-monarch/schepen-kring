# 🤖 Chatbot AI Service Setup Guide

This guide will help you configure the answer24 chatbot with real AI services.

## 🚀 Quick Setup

### 1. Environment Configuration

The chatbot uses environment variables for configuration. Update your `.env.local` file:

```bash
# AI Chatbot Configuration
NEXT_PUBLIC_AI_SERVICE=openai
NEXT_PUBLIC_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_AI_MAX_TOKENS=500
NEXT_PUBLIC_AI_TEMPERATURE=0.7

# Chatbot Settings
NEXT_PUBLIC_CHATBOT_ENABLED=true
NEXT_PUBLIC_CHATBOT_WELCOME_MESSAGE="Hi there! I'm answer24, your assistant. How can I help you today?"
NEXT_PUBLIC_CHATBOT_MAX_HISTORY=10
NEXT_PUBLIC_CHATBOT_RESPONSE_DELAY=1000
```

### 2. Supported AI Services

#### OpenAI (Recommended)
```bash
NEXT_PUBLIC_AI_SERVICE=openai
NEXT_PUBLIC_AI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_AI_MODEL=gpt-3.5-turbo
```

**Models Available:**
- `gpt-3.5-turbo` (Fast, cost-effective)
- `gpt-4` (More capable, higher cost)
- `gpt-4-turbo` (Latest, most capable)

#### Anthropic Claude
```bash
NEXT_PUBLIC_AI_SERVICE=anthropic
NEXT_PUBLIC_AI_API_KEY=sk-ant-your-anthropic-key
NEXT_PUBLIC_AI_MODEL=claude-3-haiku-20240307
```

**Models Available:**
- `claude-3-haiku-20240307` (Fast, cost-effective)
- `claude-3-sonnet-20240229` (Balanced)
- `claude-3-opus-20240229` (Most capable)

#### Cohere
```bash
NEXT_PUBLIC_AI_SERVICE=cohere
NEXT_PUBLIC_AI_API_KEY=your-cohere-key
NEXT_PUBLIC_AI_MODEL=command
```

**Models Available:**
- `command` (Standard)
- `command-light` (Faster, lighter)

## 🔧 Configuration Options

### AI Service Settings

| Variable | Description | Default | Range |
|----------|-------------|---------|-------|
| `NEXT_PUBLIC_AI_SERVICE` | AI provider | `openai` | `openai`, `anthropic`, `cohere` |
| `NEXT_PUBLIC_AI_API_KEY` | API key for the service | - | Your API key |
| `NEXT_PUBLIC_AI_MODEL` | Model to use | `gpt-3.5-turbo` | Depends on service |
| `NEXT_PUBLIC_AI_MAX_TOKENS` | Max response length | `500` | 1-4000 |
| `NEXT_PUBLIC_AI_TEMPERATURE` | Response creativity | `0.7` | 0.0-2.0 |

### Chatbot Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CHATBOT_ENABLED` | Enable/disable chatbot | `true` |
| `NEXT_PUBLIC_CHATBOT_WELCOME_MESSAGE` | Initial message | `"Hi there! I'm answer24..."` |
| `NEXT_PUBLIC_CHATBOT_MAX_HISTORY` | Conversation memory | `10` |
| `NEXT_PUBLIC_CHATBOT_RESPONSE_DELAY` | Response delay (ms) | `1000` |

## 🧪 Testing the Chatbot

### 1. Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a test"}'
```

### 2. Test in Browser
1. Go to `http://localhost:3000`
2. Look for the chat widget (chat bubble icon)
3. Click to open and send a test message

### 3. Admin Panel Testing
1. Go to admin panel
2. Navigate to Chatbot Configuration
3. Use the "Test Chatbot" button

## 🔒 Security Considerations

### API Key Security
- ✅ API keys are stored in environment variables
- ✅ Keys are not exposed to the client-side
- ✅ All AI requests go through your backend API

### Rate Limiting
Consider implementing rate limiting for the `/api/chat` endpoint:

```typescript
// Example rate limiting middleware
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Chatbot is disabled"
- Check `NEXT_PUBLIC_CHATBOT_ENABLED=true`
- Restart your development server

#### 2. "API key not configured"
- Verify your API key is correct
- Check the service name matches your key type

#### 3. "Failed to process message"
- Check your internet connection
- Verify API key has sufficient credits
- Check API service status

#### 4. Chatbot not visible
- Check if you're on `/dashboard/chat` (chatbot is hidden there)
- Verify the ChatWidget component is imported in ClientLayout

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG_CHATBOT=true
```

## 📊 Monitoring

### Usage Tracking
The chatbot API returns usage information:

```json
{
  "message": "AI response",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  },
  "service": "openai",
  "configured": true
}
```

### Cost Monitoring
- Monitor your API usage through the provider's dashboard
- Set up billing alerts
- Consider implementing usage limits

## 🔄 Fallback Behavior

If the AI service fails, the chatbot will:
1. Show a fallback response
2. Log the error for debugging
3. Continue working with basic responses

## 📝 Customization

### Custom System Prompt
Edit the system prompt in `/app/api/chat/route.ts`:

```typescript
const systemPrompt = `You are a helpful assistant for answer24...`;
```

### Custom Welcome Options
Edit the welcome options in `ChatWidget.tsx`:

```typescript
const welcomeOptions = [
  { label: "What is answer24?", icon: "❓" },
  { label: "How to get started?", icon: "🚀" },
  // Add your custom options
];
```

## 🆘 Support

If you need help:
1. Check the troubleshooting section above
2. Review the API documentation for your chosen service
3. Check the browser console for errors
4. Verify your environment variables are set correctly

---

**Note**: This chatbot implementation is designed to be secure, scalable, and easy to configure. All AI requests are processed server-side to protect your API keys.
