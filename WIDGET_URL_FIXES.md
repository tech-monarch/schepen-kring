# 🔧 Widget URL Configuration Fixes

## ✅ **Hardcoded URLs Removed**

### **What Was Fixed:**

1. **Widget Script (`public/widget-v2.js`)**
   - ❌ **Before**: `https://cdn.answer24.nl/widget/v1/answer24.js` (hardcoded)
   - ✅ **After**: Uses `window.Answer24Config?.CDN_BASE_URL || window.location.origin`

2. **Configuration (`lib/widget-config.ts`)**
   - ❌ **Before**: `https://cdn.answer24.nl` (hardcoded)
   - ✅ **After**: Uses your existing `NEXT_PUBLIC_API_BASE_URL` to derive CDN URL

3. **Admin Dashboard (`WidgetManagementClient.tsx`)**
   - ❌ **Before**: `https://cdn.answer24.nl/widget/v1/answer24.js` (hardcoded)
   - ✅ **After**: Uses `process.env.NEXT_PUBLIC_API_BASE_URL` to generate embed code

4. **Documentation**
   - ❌ **Before**: All examples used `https://cdn.answer24.nl`
   - ✅ **After**: All examples use your existing API domain

---

## 🎯 **How It Works Now**

### **Widget Script URL Generation:**
```javascript
// Uses your existing environment variables
const API_BASE_URL = window.Answer24Config?.API_BASE_URL || 'https://answer24_backend.test/api/v1';
const CDN_BASE_URL = window.Answer24Config?.CDN_BASE_URL || window.location.origin;
```

### **Embed Code Generation:**
```html
<!-- Now uses your existing API domain -->
<script src="https://answer24_backend.test/widget/v1/answer24.js" data-public-key="PUB_abc123"></script>
```

### **Configuration Mapping:**
```typescript
// Uses your existing .env.local
API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://answer24_backend.test/api/v1'
CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')
```

---

## 🚀 **Benefits**

- ✅ **No hardcoded URLs** - Everything uses your existing configuration
- ✅ **Environment-specific** - Works with your local, staging, and production URLs
- ✅ **Flexible** - Can be overridden via `window.Answer24Config`
- ✅ **Consistent** - Uses the same domain as your API

---

## 🧪 **Testing**

### **Local Development:**
```html
<script src="http://localhost:3000/widget/v1/answer24.js" data-public-key="PUB_abc123"></script>
```

### **Staging:**
```html
<script src="https://staging.answer24.nl/widget/v1/answer24.js" data-public-key="PUB_abc123"></script>
```

### **Production:**
```html
<script src="https://answer24_backend.test/widget/v1/answer24.js" data-public-key="PUB_abc123"></script>
```

---

## 🎉 **Ready to Use!**

The widget system now uses your existing environment configuration instead of hardcoded URLs. Just deploy and it will work with your current setup! 🚀
