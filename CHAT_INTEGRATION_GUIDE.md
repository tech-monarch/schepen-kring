# Chat System Integration Guide

## 🚀 Frontend-Backend Integration

The chat system is now ready for integration between the Next.js frontend and Laravel backend!

## 🔧 Configuration Steps

### 1. Environment Variables

Make sure your `.env.local` file has the correct API base URL:

```env
# Chat System API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1

# Or for production:
# NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api/v1
```

### 2. Laravel Backend Setup

Ensure your Laravel backend has:

- ✅ All migrations run
- ✅ Sanctum authentication configured
- ✅ API routes registered
- ✅ OpenAI API key configured (for AI features)
- ✅ File storage configured

### 3. Testing the Integration

1. **Start your Laravel backend:**
   ```bash
   php artisan serve
   ```

2. **Start your Next.js frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to the chat page:**
   ```
   http://localhost:3000/nl/dashboard/chat
   ```

4. **Run the integration tests:**
   - The integration test component is now included at the top of the chat page
   - Click "Run All Tests" to verify the connection
   - Check the results for any errors

## 🧪 Integration Test Features

The integration test will verify:

- ✅ **Authentication** - Token validation
- ✅ **Get Chats** - Fetching chat list
- ✅ **Create Helpdesk Chat** - Creating support chat
- ✅ **Send Message** - Sending messages
- ✅ **AI Response** - AI integration (if enabled)
- ✅ **File Upload** - File attachment support

## 📋 Expected API Endpoints

Your Laravel backend should have these endpoints:

```
GET    /api/v1/chats                    - Get user's chats
POST   /api/v1/chats                    - Create new chat
GET    /api/v1/chats/{id}               - Get specific chat
PUT    /api/v1/chats/{id}               - Update chat
DELETE /api/v1/chats/{id}               - Delete chat

GET    /api/v1/chats/{id}/messages      - Get chat messages
POST   /api/v1/chats/{id}/messages      - Send message
POST   /api/v1/messages/{id}/read       - Mark message as read

POST   /api/v1/chats/{id}/ai            - Generate AI response

GET    /api/v1/admin/users              - Get user list (admin)
POST   /api/v1/admin/users/{id}/ai-toggle - Toggle AI for user (admin)
GET    /api/v1/admin/chat-analytics     - Get analytics (admin)
```

## 🔒 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {your_sanctum_token}
```

## 📁 File Upload Support

The system supports file uploads with:

- **Max file size:** 10MB per file
- **Max files:** 5 files per message
- **Supported types:** Images, documents, any file type
- **Storage:** Files stored in `storage/app/public/chat-attachments/`

## 🤖 AI Integration

AI features require:

- OpenAI API key configured in Laravel `.env`
- Pinecone setup (optional, for knowledge base)
- AI enabled for specific chats/users

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Configure CORS in Laravel for your frontend domain

2. **Authentication Errors:**
   - Verify Sanctum is properly configured
   - Check token is being sent correctly

3. **File Upload Errors:**
   - Ensure `storage/app/public` is writable
   - Run `php artisan storage:link`

4. **AI Response Errors:**
   - Verify OpenAI API key is valid
   - Check AI is enabled for the chat

### Debug Steps:

1. Check browser console for errors
2. Verify API base URL is correct
3. Test endpoints with Postman/curl
4. Check Laravel logs for backend errors

## 📞 Support

If you encounter issues:

1. Run the integration tests first
2. Check the test results for specific errors
3. Verify your Laravel backend is running
4. Check browser network tab for failed requests

## 🎯 Next Steps

Once integration is successful:

1. ✅ Test all chat features
2. ✅ Configure AI settings
3. ✅ Set up file storage
4. ✅ Test admin controls
5. ✅ Deploy to production

---

**Happy Chatting! 🚀**
