# Laravel Chat System Backend Implementation Guide

## 📋 Overview

This document outlines the complete Laravel backend implementation for the Schepenkring.nlchat system. The frontend is already implemented and ready to integrate with these Laravel APIs.

## 🎯 Features to Implement

- ✅ Real-time chat messaging
- ✅ File and image upload support
- ✅ ChatGPT + Pinecone AI integration
- ✅ Admin controls for AI ON/OFF toggle
- ✅ Helpdesk system for all users
- ✅ Analytics and monitoring
- ✅ Multi-user chat support

## 📊 Database Schema

### 1. Chats Table

```php
// Migration: create_chats_table
Schema::create('chats', function (Blueprint $table) {
    $table->id();
    $table->string('type')->default('user_to_user'); // user_to_user, helpdesk, ai_assistant
    $table->string('title')->nullable();
    $table->json('participants'); // Array of user IDs
    $table->boolean('is_active')->default(true);
    $table->boolean('ai_enabled')->default(false); // ChatGPT toggle per chat
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();

    $table->index(['type', 'is_active']);
    $table->index(['created_by']);
});
```

### 2. Messages Table

```php
// Migration: create_messages_table
Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('chat_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->text('content');
    $table->string('type')->default('text'); // text, image, file, ai_response
    $table->json('attachments')->nullable(); // File paths/metadata
    $table->boolean('is_read')->default(false);
    $table->boolean('is_ai_generated')->default(false);
    $table->timestamp('read_at')->nullable();
    $table->timestamps();

    $table->index(['chat_id', 'created_at']);
    $table->index(['user_id', 'is_read']);
});
```

### 3. Chat Settings Table

```php
// Migration: create_chat_settings_table
Schema::create('chat_settings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->boolean('ai_enabled')->default(false);
    $table->json('ai_config')->nullable(); // AI personality, temperature, etc.
    $table->timestamps();

    $table->unique('user_id');
});
```

### 4. Chat Analytics Table

```php
// Migration: create_chat_analytics_table
Schema::create('chat_analytics', function (Blueprint $table) {
    $table->id();
    $table->foreignId('chat_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('action'); // message_sent, ai_response, file_uploaded
    $table->json('metadata')->nullable();
    $table->timestamps();

    $table->index(['chat_id', 'created_at']);
    $table->index(['action']);
});
```

## 🏗️ Models

### Chat Model

```php
// app/Models/Chat.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'title', 'participants', 'is_active', 'ai_enabled', 'created_by'
    ];

    protected $casts = [
        'participants' => 'array',
        'is_active' => 'boolean',
        'ai_enabled' => 'boolean',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'chat_participants');
    }
}
```

### Message Model

```php
// app/Models/Message.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id', 'user_id', 'content', 'type', 'attachments',
        'is_read', 'is_ai_generated', 'read_at'
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_read' => 'boolean',
        'is_ai_generated' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

### ChatSetting Model

```php
// app/Models/ChatSetting.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSetting extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'ai_enabled', 'ai_config'];

    protected $casts = [
        'ai_enabled' => 'boolean',
        'ai_config' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

## 🎮 Controllers

### ChatController

```php
// app/Http/Controllers/Api/ChatController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $chats = Chat::whereJsonContains('participants', $user->id)
            ->with(['lastMessage.sender'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['chats' => $chats]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'participants' => 'array|required',
            'title' => 'string|nullable',
            'type' => 'string|in:user_to_user,helpdesk,ai_assistant'
        ]);

        $user = auth()->user();
        $participants = array_unique([...$request->participants, $user->id]);

        $chat = Chat::create([
            'type' => $request->type ?? 'user_to_user',
            'title' => $request->title,
            'participants' => $participants,
            'created_by' => $user->id,
            'ai_enabled' => $request->type === 'helpdesk' // Auto-enable AI for helpdesk
        ]);

        return response()->json(['chat' => $chat->load('creator')], 201);
    }

    public function show(Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->id, $chat->participants)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['chat' => $chat->load('creator')]);
    }

    public function update(Request $request, Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->id, $chat->participants)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'string|nullable',
            'ai_enabled' => 'boolean'
        ]);

        $chat->update($request->only(['title', 'ai_enabled']));

        return response()->json(['chat' => $chat]);
    }

    public function destroy(Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if ($chat->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $chat->delete();

        return response()->json(['success' => true]);
    }
}
```

### MessageController

```php
// app/Http/Controllers/Api/MessageController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function index(Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->id, $chat->participants)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $chat->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->id, $chat->participants)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string',
            'type' => 'string|in:text,image,file',
            'attachments' => 'array|nullable'
        ]);

        $attachments = [];

        // Handle file uploads
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                $attachments[] = [
                    'id' => uniqid(),
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'url' => Storage::url($path),
                    'path' => $path
                ];
            }
        }

        $message = $chat->messages()->create([
            'user_id' => $user->id,
            'content' => $request->content,
            'type' => $request->type ?? (count($attachments) > 0 ? 'file' : 'text'),
            'attachments' => $attachments,
            'is_ai_generated' => false
        ]);

        // Update chat timestamp
        $chat->touch();

        // Log analytics
        $this->logAnalytics($chat, $user, 'message_sent', [
            'message_type' => $request->type ?? 'text',
            'has_attachments' => count($attachments) > 0
        ]);

        // Broadcast message to other participants (if using real-time)
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json(['message' => $message->load('sender')], 201);
    }

    public function markAsRead(Message $message): JsonResponse
    {
        $user = auth()->user();

        if ($message->user_id !== $user->id) {
            $message->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }

        return response()->json(['success' => true]);
    }

    private function logAnalytics(Chat $chat, $user, string $action, array $metadata = [])
    {
        // Log analytics data
        $chat->analytics()->create([
            'user_id' => $user->id,
            'action' => $action,
            'metadata' => $metadata
        ]);
    }
}
```

### AIChatController

```php
// app/Http/Controllers/Api/AIChatController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIChatController extends Controller
{
    public function generateResponse(Request $request, Chat $chat): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->id, $chat->participants)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$chat->ai_enabled) {
            return response()->json(['error' => 'AI is disabled for this chat'], 403);
        }

        $request->validate(['message' => 'required|string']);

        // Get chat history for context
        $history = $chat->messages()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse();

        // Prepare context for AI
        $context = $this->buildAIContext($history, $request->message, $user);

        // Call AI service (OpenAI, Pinecone, etc.)
        $aiResponse = $this->callAIService($context);

        // Save AI response as message
        $message = $chat->messages()->create([
            'user_id' => 1, // AI user ID or system user
            'content' => $aiResponse,
            'type' => 'ai_response',
            'is_ai_generated' => true
        ]);

        // Update chat timestamp
        $chat->touch();

        // Log analytics
        $this->logAnalytics($chat, $user, 'ai_response', [
            'response_length' => strlen($aiResponse),
            'context_messages' => count($history)
        ]);

        return response()->json(['message' => $message]);
    }

    private function buildAIContext($history, $currentMessage, $user)
    {
        // Build context from chat history and current message
        // This is where you'd integrate with Pinecone for knowledge base

        $context = [
            'user' => $user,
            'chat_history' => $history,
            'current_message' => $currentMessage,
            'system_context' => 'You are Schepen-kring AI Assistant. Help users with their questions about Schepenkring.nlservices.',
            'pinecone_context' => $this->searchPineconeKnowledge($currentMessage)
        ];

        return $context;
    }

    private function callAIService($context)
    {
        // Implement your AI service call here
        // This could be OpenAI, Anthropic, or your custom AI service
        // with Pinecone integration for knowledge base

        try {
            // Example OpenAI integration
            $openai = new \OpenAI\Laravel\Facades\OpenAI();

            $messages = [
                ['role' => 'system', 'content' => $context['system_context']],
                ['role' => 'user', 'content' => $context['current_message']]
            ];

            $response = $openai->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => $messages,
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            return $response->choices[0]->message->content;

        } catch (\Exception $e) {
            // Fallback response
            return "I'm here to help you with any questions about Answer24. How can I assist you today?";
        }
    }

    private function searchPineconeKnowledge($query)
    {
        // Implement Pinecone knowledge base search
        // This would search your Pinecone index for relevant context

        try {
            // Example Pinecone integration
            // $pinecone = new PineconeClient(env('PINECONE_API_KEY'));
            // $index = $pinecone->index(env('PINECONE_INDEX_NAME'));
            // $results = $index->query($query, ['topK' => 3]);

            // For now, return mock context
            return "Schepenkring.nlprovides various services including chat support, user management, and AI assistance.";

        } catch (\Exception $e) {
            return "";
        }
    }

    private function logAnalytics(Chat $chat, $user, string $action, array $metadata = [])
    {
        $chat->analytics()->create([
            'user_id' => $user->id,
            'action' => $action,
            'metadata' => $metadata
        ]);
    }
}
```

### AdminController

```php
// app/Http/Controllers/Api/AdminController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ChatSetting;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin'); // Ensure user has admin role
    }

    public function toggleAI(Request $request, User $user): JsonResponse
    {
        $request->validate(['ai_enabled' => 'required|boolean']);

        $setting = ChatSetting::updateOrCreate(
            ['user_id' => $user->id],
            ['ai_enabled' => $request->ai_enabled]
        );

        return response()->json(['success' => true, 'setting' => $setting]);
    }

    public function analytics(): JsonResponse
    {
        $analytics = [
            'total_chats' => Chat::count(),
            'total_messages' => Message::count(),
            'ai_responses' => Message::where('is_ai_generated', true)->count(),
            'active_users' => User::where('last_activity_at', '>', now()->subDays(7))->count(),
            'avg_response_time' => $this->calculateAvgResponseTime(),
            'file_uploads' => Message::where('type', 'file')->count(),
            'helpdesk_chats' => Chat::where('type', 'helpdesk')->count()
        ];

        return response()->json($analytics);
    }

    public function getUserList(): JsonResponse
    {
        $users = User::with('chatSetting')
            ->select('id', 'name', 'email', 'role', 'last_activity_at')
            ->withCount('messages')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'ai_enabled' => $user->chatSetting?->ai_enabled ?? false,
                    'last_active' => $user->last_activity_at,
                    'total_messages' => $user->messages_count
                ];
            });

        return response()->json(['users' => $users]);
    }

    private function calculateAvgResponseTime()
    {
        // Calculate average AI response time from analytics
        $aiResponses = Message::where('is_ai_generated', true)
            ->where('created_at', '>', now()->subDays(30))
            ->get();

        if ($aiResponses->count() === 0) {
            return 0;
        }

        // This is a simplified calculation
        // In reality, you'd track response times in analytics
        return 2.3; // Mock value in seconds
    }
}
```

## 🛣️ API Routes

```php
// routes/api.php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AIChatController;
use App\Http\Controllers\Api\AdminController;

Route::middleware('auth:sanctum')->group(function () {
    // Chat Management
    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'store']);
    Route::get('/chats/{chat}', [ChatController::class, 'show']);
    Route::put('/chats/{chat}', [ChatController::class, 'update']);
    Route::delete('/chats/{chat}', [ChatController::class, 'destroy']);

    // Messages
    Route::get('/chats/{chat}/messages', [MessageController::class, 'index']);
    Route::post('/chats/{chat}/messages', [MessageController::class, 'store']);
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);

    // AI Chat
    Route::post('/chats/{chat}/ai', [AIChatController::class, 'generateResponse']);

    // Admin Controls
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getUserList']);
        Route::post('/admin/users/{user}/ai-toggle', [AdminController::class, 'toggleAI']);
        Route::get('/admin/chat-analytics', [AdminController::class, 'analytics']);
    });
});
```

## 🔧 Environment Configuration

Add these to your `.env` file:

```env
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=answer24-knowledge-base

# File Storage
FILESYSTEM_DISK=public
```

## 📦 Required Packages

Install these packages:

```bash
composer require openai-php/client
composer require anthropic-php/client
composer require pusher/pusher-php-server  # For real-time features (optional)
```

## 🚀 Installation Steps

1. **Run Migrations:**

   ```bash
   php artisan migrate
   ```

2. **Create Storage Link:**

   ```bash
   php artisan storage:link
   ```

3. **Set up File Storage:**
   - Ensure `storage/app/public` is writable
   - Files will be stored in `storage/app/public/chat-attachments`

4. **Configure AI Services:**
   - Add your API keys to `.env`
   - Test AI integration with a simple request

## 🔒 Security Considerations

1. **Authentication:** All endpoints require `auth:sanctum` middleware
2. **Authorization:** Users can only access chats they participate in
3. **File Upload:** Validate file types and sizes
4. **Rate Limiting:** Consider adding rate limits for AI requests
5. **Data Privacy:** Ensure chat data is properly secured

## 📊 Expected API Responses

### Get Chats Response:

```json
{
  "chats": [
    {
      "id": 1,
      "type": "helpdesk",
      "title": "Helpdesk Support",
      "participants": [1, 2],
      "is_active": true,
      "ai_enabled": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_message": {
        "id": 1,
        "content": "Hello! How can I help you?",
        "sender_id": 2,
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "text"
      }
    }
  ]
}
```

### Send Message Response:

```json
{
  "message": {
    "id": 123,
    "chat_id": 1,
    "user_id": 1,
    "content": "Hello, I need help!",
    "type": "text",
    "attachments": null,
    "is_read": false,
    "is_ai_generated": false,
    "created_at": "2024-01-15T10:30:00Z",
    "sender": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

## 🧪 Testing Endpoints

Use these curl commands to test the API:

```bash
# Get chats
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     http://your-domain.com/api/chats

# Create chat
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"participants": [1, 2], "type": "helpdesk"}' \
     http://your-domain.com/api/chats

# Send message with file
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     -F "content=Hello with file!" \
     -F "type=file" \
     -F "attachments[]=@/path/to/file.jpg" \
     http://your-domain.com/api/chats/1/messages
```

## 📝 Notes for Developer

1. **File Storage:** Files are stored in `storage/app/public/chat-attachments/`
2. **AI Integration:** The AI service is modular - you can switch between OpenAI, Anthropic, etc.
3. **Pinecone:** Knowledge base integration is included but needs your Pinecone setup
4. **Real-time:** Broadcasting is included but commented out - enable if you want real-time features
5. **Analytics:** All user actions are logged for monitoring and analytics
6. **Admin Panel:** Admin endpoints are protected with `admin` middleware

## 🎯 Frontend Integration

The frontend is already built and expects these exact API endpoints. Make sure to:

1. Use the same route structure
2. Return data in the expected format
3. Handle file uploads with FormData
4. Support the chat types: `user_to_user`, `helpdesk`, `ai_assistant`
5. Include proper error responses

## 📞 Support

If you need clarification on any part of this implementation, please contact the frontend developer. The frontend is ready and waiting for these APIs to be implemented.

---

**Happy Coding! 🚀**
