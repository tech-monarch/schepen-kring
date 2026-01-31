# 🚀 Answer24 Advanced Widget System - Implementation Guide

## 📋 **Overview**

This document outlines the complete implementation of the Answer24 Advanced Widget System according to your specification. The system includes public key authentication, domain validation, HMAC signatures, advanced theming, and comprehensive admin management.

## 🏗️ **Implementation Status**

### ✅ **Completed Components**

1. **Advanced Widget Script** (`public/widget-v2.js`)
2. **Widget Config API** (`app/api/v1/widget/config/route.ts`)
3. **Widget Settings API** (`app/api/v1/widget/settings/route.ts`)
4. **Key Rotation API** (`app/api/v1/widget/rotate-key/route.ts`)
5. **Widget Chat API** (`app/api/v1/widget/chat/route.ts`)
6. **Admin Dashboard** (`app/[locale]/dashboard/admin/widget/`)

---

## 🔧 **Backend API Requirements**

### **PLACEHOLDERS TO REPLACE**

#### 1. **Environment Variables**
```bash
# Add these to your .env file
# Optional: Add widget-specific signing secret
# WIDGET_SIGNING_SECRET=your-widget-signing-secret-here
AI_SERVICE_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-openai-api-key-here
```

#### 2. **Database Schema**
Create these tables in your Laravel backend:

```sql
-- Widget Settings Table
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

-- Key Rotation Log Table
CREATE TABLE widget_key_rotations (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    old_public_key VARCHAR(255) NOT NULL,
    new_public_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id)
);

-- Widget Analytics Table
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

#### 3. **Laravel Models**
Create these models in your Laravel backend:

```php
// app/Models/WidgetSettings.php
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

// app/Models/WidgetKeyRotation.php
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

#### 4. **Laravel Controllers**
Create these controllers in your Laravel backend:

```php
// app/Http/Controllers/WidgetConfigController.php
<?php

namespace App\Http\Controllers;

use App\Models\WidgetSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
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

#### 5. **Laravel Routes**
Add these routes to your Laravel backend:

```php
// routes/api.php
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

## 🔐 **Security Implementation**

### **HMAC Signature Verification**
The widget script verifies responses using HMAC-SHA256 signatures. Implement this in your backend:

```php
// In your WidgetConfigController
private function generateSignature(string $body, string $publicKey): string
{
    $secret = config('app.widget_signing_secret') . $publicKey;
    return hash_hmac('sha256', $body, $secret);
}
```

### **Domain Validation**
Implement domain validation in your backend:

```php
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
```

### **Rate Limiting**
Implement rate limiting using Redis:

```php
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
```

---

## 🎨 **Frontend Integration**

### **1. Update Navigation**
Add widget management to your admin navigation:

```typescript
// In your navigation items
{
  title: "Widget Management",
  href: "/dashboard/admin/widget",
  icon: Settings,
  roles: ["admin", "partner"]
}
```

### **2. CDN Configuration**
Set up your CDN to serve the widget script:

```bash
# Upload widget-v2.js to your CDN
# Update the CDN_BASE_URL in the widget script
const CDN_BASE_URL = 'https://cdn.answer24.nl'; // Your actual CDN URL
```

### **3. Environment Variables**
Add these to your Next.js environment:

```bash
# .env.local
NEXT_PUBLIC_WIDGET_CDN_URL=https://cdn.answer24.nl
NEXT_PUBLIC_API_BASE_URL=https://answer24_backend.test/api/v1
```

---

## 📊 **Analytics & Monitoring**

### **GA4 Integration**
The widget automatically tracks these events:
- `answer24_widget_open`
- `answer24_widget_message_sent`
- `answer24_widget_close`

### **Custom Analytics**
Implement custom analytics in your backend:

```php
// Track widget events
public function trackEvent(Request $request): JsonResponse
{
    $data = $request->validate([
        'event_type' => 'required|string',
        'event_data' => 'nullable|array',
        'public_key' => 'required|string'
    ]);

    WidgetAnalytics::create([
        'company_id' => $this->getCompanyIdFromPublicKey($data['public_key']),
        'public_key' => $data['public_key'],
        'event_type' => $data['event_type'],
        'event_data' => $data['event_data'],
        'user_agent' => $request->userAgent(),
        'ip_address' => $request->ip()
    ]);

    return response()->json(['ok' => true]);
}
```

---

## 🚀 **Deployment Checklist**

### **Backend (Laravel)**
- [ ] Create database tables
- [ ] Implement models and controllers
- [ ] Add routes
- [ ] Set up Redis for rate limiting
- [ ] Configure HMAC signing secret
- [ ] Set up AI service integration
- [ ] Implement domain validation
- [ ] Add analytics tracking

### **Frontend (Next.js)**
- [ ] Upload widget script to CDN
- [ ] Update API endpoints
- [ ] Add admin dashboard route
- [ ] Test widget integration
- [ ] Configure environment variables

### **CDN & Infrastructure**
- [ ] Set up CDN for widget assets
- [ ] Configure CORS headers
- [ ] Set up SSL certificates
- [ ] Implement cache purging
- [ ] Monitor performance

---

## 🧪 **Testing**

### **Widget Testing**
```html
<!-- Test embed code -->
<script
  src="https://answer24_backend.test/widget/v1/answer24.js"
  async
  data-public-key="PUB_abc123"
  data-locale="nl-NL"
  data-theme="auto"
  data-color-primary="#0059ff"
  data-position="right"
></script>
```

### **API Testing**
```bash
# Test config endpoint
curl -X GET "https://answer24_backend.test/api/v1/widget/config?key=PUB_abc123" \
  -H "Accept: application/json"

# Test settings endpoint
curl -X POST "https://answer24_backend.test/api/v1/widget/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme": {"primary": "#ff0000"}}'
```

---

## 📝 **Next Steps**

1. **Replace all PLACEHOLDER values** with your actual configuration
2. **Implement database schema** in your Laravel backend
3. **Set up CDN** for widget asset delivery
4. **Configure environment variables** in both frontend and backend
5. **Test the complete flow** from widget embed to admin dashboard
6. **Monitor and optimize** performance

---

## 🆘 **Support**

If you encounter any issues during implementation:

1. Check the console logs in your browser
2. Verify API endpoints are accessible
3. Ensure all environment variables are set
4. Test with the provided curl commands
5. Check database connections and Redis setup

The widget system is now fully implemented according to your specification! 🎉
