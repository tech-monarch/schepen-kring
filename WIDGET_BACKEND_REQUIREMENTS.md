# 🔧 Backend API Developer Requirements

## 📋 **What You Need to Implement**

Based on the widget system specification, here are the **backend requirements** that need to be implemented in your Laravel application:

---

## 🗄️ **Database Schema**

### **1. Widget Settings Table**
```sql
CREATE TABLE widget_settings (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    public_key VARCHAR(255) UNIQUE NOT NULL,
    allowed_domains JSON NOT NULL,
    theme JSON NOT NULL,
    behavior JSON NOT NULL,
    features JSON NOT NULL,
    i18n JSON NOT NULL,
    integrations JSON NOT NULL,
    visibility_rules JSON NOT NULL,
    rate_limit_per_min INT DEFAULT 60,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_public_key (public_key)
);
```

### **2. Key Rotation Log Table**
```sql
CREATE TABLE widget_key_rotations (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    old_public_key VARCHAR(255) NOT NULL,
    new_public_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id)
);
```

### **3. Widget Analytics Table**
```sql
CREATE TABLE widget_analytics (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    public_key VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_public_key (public_key),
    INDEX idx_event_type (event_type)
);
```

---

## 🏗️ **Laravel Models**

### **1. WidgetSettings Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetSettings extends Model
{
    protected $fillable = [
        'company_id',
        'public_key',
        'allowed_domains',
        'theme',
        'behavior',
        'features',
        'i18n',
        'integrations',
        'visibility_rules',
        'rate_limit_per_min',
        'version'
    ];

    protected $casts = [
        'allowed_domains' => 'array',
        'theme' => 'array',
        'behavior' => 'array',
        'features' => 'array',
        'i18n' => 'array',
        'integrations' => 'array',
        'visibility_rules' => 'array'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
```

### **2. WidgetKeyRotation Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetKeyRotation extends Model
{
    protected $fillable = [
        'company_id',
        'old_public_key',
        'new_public_key'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
```

### **3. WidgetAnalytics Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetAnalytics extends Model
{
    protected $fillable = [
        'company_id',
        'public_key',
        'event_type',
        'event_data',
        'user_agent',
        'ip_address'
    ];

    protected $casts = [
        'event_data' => 'array'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
```

---

## 🎯 **Laravel Controllers**

### **1. WidgetConfigController**
```php
<?php

namespace App\Http\Controllers;

use App\Models\WidgetSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class WidgetConfigController extends Controller
{
    public function getConfig(Request $request): JsonResponse
    {
        $publicKey = $request->query('key');
        
        if (!$publicKey) {
            return response()->json(['error' => 'Public key is required'], 400);
        }

        $settings = WidgetSettings::where('public_key', $publicKey)->first();
        
        if (!$settings) {
            return response()->json(['error' => 'Invalid public key'], 404);
        }

        // Validate domain
        if (!$this->validateDomain($request, $settings->allowed_domains)) {
            return response()->json(['error' => 'Domain not allowed'], 403);
        }

        // Check rate limiting
        if (!$this->checkRateLimit($publicKey, $request->ip())) {
            return response()->json(['error' => 'Rate limit exceeded'], 429);
        }

        $response = [
            'company' => [
                'id' => $settings->company_id,
                'name' => $settings->company->name ?? 'Unknown Company',
                'brand' => $settings->company->brand ?? 'Unknown Brand'
            ],
            'theme' => $settings->theme,
            'behavior' => $settings->behavior,
            'features' => $settings->features,
            'i18n' => $settings->i18n,
            'integrations' => $settings->integrations,
            'visibility_rules' => $settings->visibility_rules,
            'cdn' => [
                'assetsVersion' => $settings->version
            ]
        ];

        $responseBody = json_encode($response);
        $signature = $this->generateSignature($responseBody, $publicKey);

        return response($responseBody)
            ->header('Content-Type', 'application/json')
            ->header('Cache-Control', 'public, max-age=300')
            ->header('ETag', '"' . $settings->version . '-' . substr($signature, 0, 8) . '"')
            ->header('X-Answer24-Signature', $signature)
            ->header('X-Answer24-Version', $settings->version);
    }

    private function validateDomain(Request $request, array $allowedDomains): bool
    {
        $origin = $request->header('origin');
        $host = $request->header('host');
        $referer = $request->header('referer');
        
        $requestDomain = $origin ?: $host ?: ($referer ? parse_url($referer, PHP_URL_HOST) : null);
        
        if (!$requestDomain) return false;
        
        foreach ($allowedDomains as $domain) {
            if (str_starts_with($domain, '*.')) {
                $baseDomain = substr($domain, 2);
                if (str_ends_with($requestDomain, $baseDomain) || $requestDomain === $baseDomain) {
                    return true;
                }
            } elseif ($requestDomain === $domain) {
                return true;
            }
        }
        
        return false;
    }

    private function checkRateLimit(string $publicKey, string $ip): bool
    {
        $key = "widget_rate_limit:{$publicKey}:{$ip}";
        $current = Cache::get($key, 0);
        
        if ($current >= 60) { // 60 requests per minute
            return false;
        }
        
        Cache::put($key, $current + 1, 60);
        return true;
    }

    private function generateSignature(string $body, string $publicKey): string
    {
        $secret = config('app.widget_signing_secret') . $publicKey;
        return hash_hmac('sha256', $body, $secret);
    }
}
```

### **2. WidgetSettingsController**
```php
<?php

namespace App\Http\Controllers;

use App\Models\WidgetSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class WidgetSettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        
        $settings = WidgetSettings::where('company_id', $companyId)->first();
        
        if (!$settings) {
            return response()->json(['error' => 'Widget settings not found'], 404);
        }

        return response()->json(['settings' => $settings]);
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $updates = $request->all();

        $settings = WidgetSettings::where('company_id', $companyId)->first();
        
        if (!$settings) {
            // Create new settings
            $settings = WidgetSettings::create([
                'id' => Str::uuid(),
                'company_id' => $companyId,
                'public_key' => 'PUB_' . Str::random(32),
                'allowed_domains' => $updates['allowed_domains'] ?? ['localhost:3000'],
                'theme' => $updates['theme'] ?? $this->getDefaultTheme(),
                'behavior' => $updates['behavior'] ?? $this->getDefaultBehavior(),
                'features' => $updates['features'] ?? $this->getDefaultFeatures(),
                'i18n' => $updates['i18n'] ?? $this->getDefaultI18n(),
                'integrations' => $updates['integrations'] ?? [],
                'visibility_rules' => $updates['visibility_rules'] ?? $this->getDefaultVisibilityRules(),
                'rate_limit_per_min' => $updates['rate_limit_per_min'] ?? 60,
                'version' => 1
            ]);
        } else {
            // Update existing settings
            $settings->update([
                ...$updates,
                'version' => $settings->version + 1
            ]);
        }

        return response()->json([
            'ok' => true,
            'version' => $settings->version,
            'public_key' => $settings->public_key,
            'settings' => [
                'theme' => $settings->theme,
                'behavior' => $settings->behavior,
                'features' => $settings->features,
                'i18n' => $settings->i18n,
                'integrations' => $settings->integrations,
                'visibility_rules' => $settings->visibility_rules
            ]
        ]);
    }

    private function getDefaultTheme(): array
    {
        return [
            'mode' => 'auto',
            'primary' => '#0059ff',
            'foreground' => '#0f172a',
            'background' => '#ffffff',
            'radius' => 14,
            'fontFamily' => 'Inter, ui-sans-serif'
        ];
    }

    private function getDefaultBehavior(): array
    {
        return [
            'position' => 'right',
            'openOnLoad' => false,
            'openOnExitIntent' => true,
            'openOnInactivityMs' => 0,
            'zIndex' => 2147483000
        ];
    }

    private function getDefaultFeatures(): array
    {
        return [
            'chat' => true,
            'wallet' => false,
            'offers' => false,
            'leadForm' => false
        ];
    }

    private function getDefaultI18n(): array
    {
        return [
            'default' => 'en-US',
            'strings' => []
        ];
    }

    private function getDefaultVisibilityRules(): array
    {
        return [
            'includePaths' => ['/'],
            'excludePaths' => [],
            'minCartValue' => 0
        ];
    }
}
```

### **3. WidgetKeyRotationController**
```php
<?php

namespace App\Http\Controllers;

use App\Models\WidgetSettings;
use App\Models\WidgetKeyRotation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class WidgetKeyRotationController extends Controller
{
    public function rotate(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        
        $settings = WidgetSettings::where('company_id', $companyId)->first();
        
        if (!$settings) {
            return response()->json(['error' => 'Widget settings not found'], 404);
        }

        $oldKey = $settings->public_key;
        $newKey = 'PUB_' . Str::random(32);

        // Update public key
        $settings->update([
            'public_key' => $newKey,
            'version' => $settings->version + 1
        ]);

        // Log rotation
        WidgetKeyRotation::create([
            'id' => Str::uuid(),
            'company_id' => $companyId,
            'old_public_key' => $oldKey,
            'new_public_key' => $newKey
        ]);

        return response()->json([
            'ok' => true,
            'old_public_key' => $oldKey,
            'new_public_key' => $newKey,
            'version' => $settings->version,
            'grace_period_hours' => 24,
            'message' => 'Public key rotated successfully. Old key will remain valid for 24 hours.'
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        
        $rotations = WidgetKeyRotation::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'rotations' => $rotations->map(function ($rotation) {
                return [
                    'old_key' => $rotation->old_public_key,
                    'new_key' => $rotation->new_public_key,
                    'timestamp' => $rotation->created_at->toISOString()
                ];
            }),
            'total_rotations' => $rotations->count()
        ]);
    }
}
```

---

## 🛣️ **Laravel Routes**

Add these routes to your `routes/api.php`:

```php
Route::prefix('v1/widget')->group(function () {
    // Public routes (no auth required)
    Route::get('/config', [WidgetConfigController::class, 'getConfig']);
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/settings', [WidgetSettingsController::class, 'index']);
        Route::post('/settings', [WidgetSettingsController::class, 'store']);
        Route::post('/rotate-key', [WidgetKeyRotationController::class, 'rotate']);
        Route::get('/rotate-key', [WidgetKeyRotationController::class, 'history']);
    });
});
```

---

## ⚙️ **Environment Configuration**

Add these to your `.env` file:

```bash
# Widget Configuration
WIDGET_SIGNING_SECRET=your-widget-signing-secret-here
WIDGET_CDN_URL=https://cdn.answer24.nl
WIDGET_API_URL=https://api.answer24.nl

# AI Service Configuration
AI_SERVICE_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-openai-api-key-here

# Redis Configuration (for rate limiting)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

---

## 🔧 **Additional Requirements**

### **1. Redis Setup**
Install and configure Redis for rate limiting:

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### **2. CORS Configuration**
Update your CORS configuration to allow widget domains:

```php
// config/cors.php
'allowed_origins' => [
    'https://cdn.answer24.nl',
    'https://api.answer24.nl',
    // Add your widget domains here
],
```

### **3. Cache Configuration**
Ensure Redis is configured for caching:

```php
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),
```

---

## 🧪 **Testing Endpoints**

### **1. Test Config Endpoint**
```bash
curl -X GET "https://api.answer24.nl/v1/widget/config?key=PUB_abc123" \
  -H "Accept: application/json"
```

### **2. Test Settings Endpoint**
```bash
curl -X POST "https://api.answer24.nl/v1/widget/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme": {"primary": "#ff0000"}}'
```

### **3. Test Key Rotation**
```bash
curl -X POST "https://api.answer24.nl/v1/widget/rotate-key" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 **Monitoring & Analytics**

### **1. Track Widget Events**
```php
// In your WidgetAnalytics model
public function trackEvent(string $companyId, string $publicKey, string $eventType, array $eventData = []): void
{
    $this->create([
        'id' => Str::uuid(),
        'company_id' => $companyId,
        'public_key' => $publicKey,
        'event_type' => $eventType,
        'event_data' => $eventData,
        'user_agent' => request()->userAgent(),
        'ip_address' => request()->ip()
    ]);
}
```

### **2. Analytics Dashboard**
Create endpoints to retrieve analytics data:

```php
public function getAnalytics(Request $request): JsonResponse
{
    $companyId = $request->user()->company_id;
    
    $analytics = WidgetAnalytics::where('company_id', $companyId)
        ->selectRaw('event_type, COUNT(*) as count, DATE(created_at) as date')
        ->groupBy('event_type', 'date')
        ->orderBy('date', 'desc')
        ->get();

    return response()->json(['analytics' => $analytics]);
}
```

---

## ✅ **Implementation Checklist**

- [ ] Create database tables
- [ ] Implement models
- [ ] Create controllers
- [ ] Add routes
- [ ] Configure environment variables
- [ ] Set up Redis
- [ ] Test all endpoints
- [ ] Implement analytics tracking
- [ ] Set up monitoring
- [ ] Deploy to production

---

## 🆘 **Support**

If you encounter any issues:

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Verify database connections
3. Test Redis connectivity
4. Check API endpoint responses
5. Verify JWT token validation

The widget system is now ready for backend implementation! 🚀
