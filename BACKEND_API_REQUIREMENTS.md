# 🚀 Backend API Requirements for Multi-Tenant Chat Widget

## 📋 **Database Schema (Laravel Migrations)**

### **1. User Companies Table**
```php
// Migration: create_user_companies_table.php
Schema::create('user_companies', function (Blueprint $table) {
    $table->id();
    $table->string('company_id')->unique(); // e.g., '123', '456'
    $table->string('company_name');
    $table->string('email');
    $table->string('phone')->nullable();
    $table->string('website')->nullable();
    $table->string('logo_url')->nullable();
    $table->json('settings')->nullable(); // Widget settings
    $table->json('ai_config')->nullable(); // AI configuration
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### **2. Widget Settings Table**
```php
// Migration: create_widget_settings_table.php
Schema::create('widget_settings', function (Blueprint $table) {
    $table->id();
    $table->string('company_id');
    $table->string('primary_color')->default('#007bff');
    $table->string('secondary_color')->default('#6c757d');
    $table->string('text_color')->default('#ffffff');
    $table->string('background_color')->default('#ffffff');
    $table->integer('border_radius')->default(12);
    $table->string('company_name');
    $table->string('company_logo')->nullable();
    $table->text('welcome_message');
    $table->string('placeholder_text')->default('Type your message...');
    $table->enum('position', ['bottom-right', 'bottom-left', 'top-right', 'top-left'])->default('bottom-right');
    $table->boolean('auto_open')->default(false);
    $table->boolean('show_typing_indicator')->default(true);
    $table->text('ai_personality')->default('friendly and helpful assistant');
    $table->decimal('ai_temperature', 2, 1)->default(0.7);
    $table->integer('max_tokens')->default(500);
    $table->timestamps();
    
    $table->foreign('company_id')->references('company_id')->on('user_companies');
});
```

### **3. Chat Conversations Table**
```php
// Migration: create_chat_conversations_table.php
Schema::create('chat_conversations', function (Blueprint $table) {
    $table->id();
    $table->string('company_id');
    $table->string('user_id'); // Anonymous user ID
    $table->string('session_id');
    $table->json('messages'); // Array of messages
    $table->json('metadata')->nullable(); // Additional data
    $table->timestamp('last_activity_at');
    $table->timestamps();
    
    $table->index(['company_id', 'user_id']);
    $table->index(['company_id', 'session_id']);
});
```

### **4. Pinecone Vectors Table**
```php
// Migration: create_pinecone_vectors_table.php
Schema::create('pinecone_vectors', function (Blueprint $table) {
    $table->id();
    $table->string('company_id');
    $table->string('vector_id'); // Pinecone vector ID
    $table->text('content'); // Original content
    $table->json('metadata')->nullable(); // Additional metadata
    $table->string('source')->nullable(); // Source of the content
    $table->timestamps();
    
    $table->index('company_id');
    $table->unique(['company_id', 'vector_id']);
});
```

## 🔧 **Laravel Controllers**

### **1. Widget Settings Controller**
```php
// app/Http/Controllers/WidgetSettingsController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WidgetSettings;
use App\Models\UserCompany;

class WidgetSettingsController extends Controller
{
    public function getSettings($companyId)
    {
        $settings = WidgetSettings::where('company_id', $companyId)->first();
        
        if (!$settings) {
            // Create default settings
            $settings = WidgetSettings::create([
                'company_id' => $companyId,
                'company_name' => 'Your Company',
                'welcome_message' => 'Hi! How can I help you today?',
            ]);
        }
        
        return response()->json(['settings' => $settings]);
    }
    
    public function updateSettings(Request $request, $companyId)
    {
        $request->validate([
            'company_name' => 'string|max:255',
            'primary_color' => 'string|max:7',
            'welcome_message' => 'string|max:1000',
            'ai_personality' => 'string|max:500',
            // Add other validation rules
        ]);
        
        $settings = WidgetSettings::updateOrCreate(
            ['company_id' => $companyId],
            $request->all()
        );
        
        return response()->json([
            'settings' => $settings,
            'message' => 'Settings updated successfully'
        ]);
    }
}
```

### **2. Partner Chat Controller**
```php
// app/Http/Controllers/PartnerChatController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WidgetSettings;
use App\Models\ChatConversation;
use App\Services\PineconeService;
use App\Services\AIService;

class PartnerChatController extends Controller
{
    protected $pineconeService;
    protected $aiService;
    
    public function __construct(PineconeService $pineconeService, AIService $aiService)
    {
        $this->pineconeService = $pineconeService;
        $this->aiService = $aiService;
    }
    
    public function sendMessage(Request $request, $companyId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'user_id' => 'string|nullable',
            'history' => 'array|nullable'
        ]);
        
        // Get company settings
        $settings = WidgetSettings::where('company_id', $companyId)->first();
        if (!$settings) {
            return response()->json(['error' => 'Company not found'], 404);
        }
        
        // Search Pinecone for relevant context
        $context = $this->pineconeService->searchContext(
            $companyId, 
            $request->message
        );
        
        // Generate AI response
        $aiResponse = $this->aiService->generateResponse([
            'message' => $request->message,
            'context' => $context,
            'company_settings' => $settings,
            'history' => $request->history ?? []
        ]);
        
        // Save conversation
        $this->saveConversation($companyId, $request->user_id, $request->message, $aiResponse);
        
        return response()->json([
            'message' => $aiResponse,
            'company_id' => $companyId,
            'context_used' => !empty($context)
        ]);
    }
    
    private function saveConversation($companyId, $userId, $userMessage, $aiResponse)
    {
        $sessionId = $userId ?? 'anonymous_' . uniqid();
        
        ChatConversation::updateOrCreate(
            [
                'company_id' => $companyId,
                'user_id' => $userId ?? 'anonymous',
                'session_id' => $sessionId
            ],
            [
                'messages' => [
                    'user' => $userMessage,
                    'bot' => $aiResponse,
                    'timestamp' => now()
                ],
                'last_activity_at' => now()
            ]
        );
    }
}
```

## 🔌 **Services**

### **1. Pinecone Service**
```php
// app/Services/PineconeService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PineconeService
{
    protected $apiKey;
    protected $environment;
    protected $baseUrl;
    
    public function __construct()
    {
        $this->apiKey = config('services.pinecone.api_key');
        $this->environment = config('services.pinecone.environment');
        $this->baseUrl = "https://{$this->environment}.pinecone.io";
    }
    
    public function searchContext($companyId, $query, $topK = 5)
    {
        try {
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/query", [
                'vector' => $this->embedQuery($query),
                'topK' => $topK,
                'includeMetadata' => true,
                'filter' => [
                    'company_id' => $companyId
                ]
            ]);
            
            if ($response->successful()) {
                $matches = $response->json()['matches'] ?? [];
                return collect($matches)->pluck('metadata.content')->join('. ');
            }
            
            return '';
        } catch (\Exception $e) {
            \Log::error('Pinecone search error: ' . $e->getMessage());
            return '';
        }
    }
    
    public function addVector($companyId, $content, $metadata = [])
    {
        try {
            $vectorId = uniqid();
            $embedding = $this->embedText($content);
            
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/vectors/upsert", [
                'vectors' => [
                    [
                        'id' => $vectorId,
                        'values' => $embedding,
                        'metadata' => array_merge($metadata, [
                            'company_id' => $companyId,
                            'content' => $content
                        ])
                    ]
                ]
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            \Log::error('Pinecone upsert error: ' . $e->getMessage());
            return false;
        }
    }
    
    private function embedQuery($query)
    {
        // Use OpenAI embeddings or your preferred embedding service
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/embeddings', [
            'input' => $query,
            'model' => 'text-embedding-ada-002'
        ]);
        
        return $response->json()['data'][0]['embedding'] ?? [];
    }
    
    private function embedText($text)
    {
        return $this->embedQuery($text);
    }
}
```

### **2. AI Service**
```php
// app/Services/AIService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AIService
{
    public function generateResponse($data)
    {
        $settings = $data['company_settings'];
        $context = $data['context'] ?? '';
        $message = $data['message'];
        $history = $data['history'] ?? [];
        
        $systemPrompt = $this->buildSystemPrompt($settings, $context);
        $messages = $this->buildMessages($systemPrompt, $history, $message);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => $messages,
            'max_tokens' => $settings->max_tokens ?? 500,
            'temperature' => $settings->ai_temperature ?? 0.7
        ]);
        
        if ($response->successful()) {
            return $response->json()['choices'][0]['message']['content'];
        }
        
        return 'I apologize, but I\'m having trouble processing your request right now.';
    }
    
    private function buildSystemPrompt($settings, $context)
    {
        return "You are a {$settings->ai_personality} for {$settings->company_name}.
        
        Company Context: {$context}
        
        Guidelines:
        - Be helpful and professional
        - Use the company's tone and personality
        - Provide accurate information based on the context
        - If you don't know something, suggest contacting support
        - Keep responses concise and relevant";
    }
    
    private function buildMessages($systemPrompt, $history, $currentMessage)
    {
        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        
        // Add history
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['sender'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['text']
            ];
        }
        
        // Add current message
        $messages[] = ['role' => 'user', 'content' => $currentMessage];
        
        return $messages;
    }
}
```

## 🛣️ **API Routes**

### **Add to routes/api.php**
```php
// Widget Settings API
Route::get('/widget-settings/{companyId}', [WidgetSettingsController::class, 'getSettings']);
Route::post('/widget-settings/{companyId}', [WidgetSettingsController::class, 'updateSettings']);
Route::put('/widget-settings/{companyId}', [WidgetSettingsController::class, 'updateSettings']);

// Partner Chat API
Route::post('/partner-chat/{companyId}', [PartnerChatController::class, 'sendMessage']);

// Admin API for managing companies
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('companies', CompanyController::class);
    Route::post('/companies/{company}/pinecone-data', [CompanyController::class, 'addPineconeData']);
});
```

## ⚙️ **Configuration**

### **Add to config/services.php**
```php
'pinecone' => [
    'api_key' => env('PINECONE_API_KEY'),
    'environment' => env('PINECONE_ENVIRONMENT', 'us-west1-gcp'),
    'index_name' => env('PINECONE_INDEX_NAME', 'answer24'),
],

'openai' => [
    'api_key' => env('OPENAI_API_KEY'),
],
```

### **Add to .env**
```bash
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=answer24
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 **Deployment Steps**

1. **Run Migrations**
   ```bash
   php artisan migrate
   ```

2. **Create Seeders** (optional)
   ```bash
   php artisan make:seeder CompanySeeder
   php artisan db:seed --class=CompanySeeder
   ```

3. **Test API Endpoints**
   ```bash
   # Test widget settings
   curl -X GET http://your-domain.com/api/widget-settings/123
   
   # Test chat
   curl -X POST http://your-domain.com/api/partner-chat/123 \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, I need help"}'
   ```

4. **Update Frontend Widget**
   - Change API_BASE_URL in `/public/widget.js` to your Laravel backend
   - Deploy the widget.js file to your CDN or static hosting

## 📊 **Admin Panel (Optional)**

Create an admin panel to:
- Manage companies
- Upload training data to Pinecone
- Monitor conversations
- View analytics

This backend will support the multi-tenant widget system with proper data isolation and AI integration!
