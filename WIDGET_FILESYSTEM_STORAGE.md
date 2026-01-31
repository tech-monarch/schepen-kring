# Widget Filesystem Storage Implementation

**Date:** November 1, 2025  
**Status:** ✅ Completed

---

## 🎯 **Objective**

Store widget configuration settings in the local filesystem instead of a database, so changes made in the Widget Management dashboard are persisted and immediately available to the embedded widget.

---

## 📁 **Implementation**

### **Storage Location**
Settings are stored per company in:
```
public/widget/settings/{companyId}.json
```

### **How It Works**

#### **1. Widget Management (Admin)**
When an admin saves widget settings:
- Settings saved to: `public/widget/settings/{companyId}.json`
- Company ID extracted from JWT token
- Each company gets its own settings file

#### **2. Widget Config API**
When embedded widget requests config:
- Searches all JSON files in `public/widget/settings/`
- Matches public key to find correct settings
- Returns widget configuration

#### **3. Example Settings File**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "company_id": "cmp_abc123",
  "public_key": "PUB_oom7icrh7",
  "allowed_domains": ["localhost:3000", "example.com"],
  "theme": {
    "mode": "auto",
    "primary": "#0059ff",
    "foreground": "#0f172a",
    "background": "#ffffff",
    "radius": 14,
    "fontFamily": "Inter, ui-sans-serif",
    "logoUrl": "https://cdn.answer24.nl/assets/logo.svg"
  },
  "behavior": {
    "position": "right",
    "openOnLoad": false,
    "openOnExitIntent": true,
    "openOnInactivityMs": 0,
    "zIndex": 2147483000
  },
  "features": {
    "chat": true,
    "wallet": true,
    "offers": false,
    "leadForm": false
  },
  "i18n": {
    "default": "en-US",
    "strings": {
      "chat.welcome": "Hi! How can I help?",
      "chat.placeholder": "Type your message...",
      "chat.send": "Send"
    }
  },
  "integrations": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  },
  "visibility_rules": {
    "includePaths": ["/"],
    "excludePaths": [],
    "minCartValue": 0
  },
  "rate_limit_per_min": 60,
  "version": 1,
  "created_at": "2025-11-01T10:00:00.000Z",
  "updated_at": "2025-11-01T10:30:00.000Z"
}
```

---

## 🔧 **Technical Details**

### **Files Modified**

#### **1. `app/api/v1/widget/settings/route.ts`**
**Added:**
- File system storage functions
- `loadSettings(companyId)` - Load settings from JSON file
- `saveSettings(companyId, settings)` - Save settings to JSON file
- Directory auto-creation on startup

**Changed:**
- POST: Now saves to file system instead of memory
- GET: Now loads from file system instead of memory

#### **2. `app/api/v1/widget/config/route.ts`**
**Added:**
- File system search function
- `loadSettingsByPublicKey(publicKey)` - Search all files for matching public key

**Changed:**
- GET: Now searches file system for matching public key
- Fallback to demo settings if not found

---

## 🚀 **How to Use**

### **1. Configure Widget Settings**
```
1. Log into dashboard
2. Go to Widget Management
3. Customize colors, behavior, etc.
4. Click "Save Changes"
5. Settings saved to: public/widget/settings/{companyId}.json
```

### **2. Widget Auto-Loads Settings**
```
1. Widget embedded on external site
2. Widget requests: /api/v1/widget/config?key=PUB_XXXXX
3. API searches public/widget/settings/*.json
4. Returns matching settings
5. Widget applies settings immediately
```

---

## ✅ **Benefits**

### **No Database Required**
- Settings stored as JSON files
- Easy to backup (just copy folder)
- Easy to migrate between servers

### **Fast & Simple**
- Direct file I/O
- No database queries
- No connection pooling issues

### **Developer Friendly**
- Can edit settings files directly
- Version control friendly (optional)
- Easy to debug

### **Per-Company Isolation**
- Each company gets its own file
- No cross-contamination
- Clear organization

---

## ⚠️ **Considerations**

### **Limitations**

1. **Not for Production at Scale**
   - File system I/O becomes slow with thousands of companies
   - No concurrent write protection
   - Not distributed (single server only)

2. **No Backup/Recovery**
   - Files can be accidentally deleted
   - Need manual backup strategy
   - No transaction rollback

3. **Security**
   - Ensure `.gitignore` includes settings directory
   - Files should be accessible to web server
   - No automatic encryption

### **When to Use Database Instead**

Switch to database if:
- You have > 100 companies
- You need multi-server deployment
- You need backup/recovery features
- You need audit logs
- You need transaction support

---

## 🔐 **Security Recommendations**

Add to `.gitignore`:
```
public/widget/settings/*.json
```

Keep directory permissions secure:
```bash
chmod 755 public/widget/settings
```

---

## 🧪 **Testing**

### **Test Widget Configuration Flow**

1. **Configure Settings**
   ```bash
   # Log into admin dashboard
   # Change primary color to #ff0000
   # Save changes
   ```

2. **Verify File Created**
   ```bash
   ls -la public/widget/settings/
   # Should see: cmp_XXXXX.json
   ```

3. **Test Widget Loads Settings**
   ```bash
   # Open widget demo
   http://localhost:3000/widget/demo.html
   # Widget should use red color from settings
   ```

4. **Test Public Key Lookup**
   ```bash
   curl "http://localhost:3000/api/v1/widget/config?key=PUB_XXXXX"
   # Should return JSON with saved settings
   ```

---

## 📝 **File Structure**

```
public/
  widget/
    settings/
      cmp_company1.json          # Company 1 settings
      cmp_company2.json          # Company 2 settings
      cmp_abc123.json            # Company ABC settings
      ...
    answer24-widget.js           # Embedded widget script
    demo.html                    # Demo/test page
```

---

## 🔄 **Migration Path**

### **Current State**
✅ File-based storage implemented  
✅ Settings persist per company  
✅ Widget auto-loads from files  

### **Future Enhancements**

If you outgrow filesystem storage:

1. **Option A: SQL Database**
   ```sql
   CREATE TABLE widget_settings (
     id UUID PRIMARY KEY,
     company_id VARCHAR NOT NULL,
     public_key VARCHAR UNIQUE NOT NULL,
     settings JSON NOT NULL,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **Option B: Redis**
   ```javascript
   await redis.set(`widget:${companyId}`, JSON.stringify(settings));
   const settings = await redis.get(`widget:${companyId}`);
   ```

3. **Option C: Hybrid**
   - Use files for local dev
   - Use database for production
   - Switch via environment variable

---

## 📊 **Performance**

### **Expected Performance**

| Operation | File System | Database |
|-----------|-------------|----------|
| Load settings | ~1ms | ~5-20ms |
| Save settings | ~2ms | ~10-30ms |
| Search by public key | ~10ms (100 files) | ~5ms |
| Concurrent reads | Good | Excellent |
| Concurrent writes | Poor | Excellent |

**Verdict:** File system is fine for < 100 companies

---

## ✅ **Summary**

Widget settings are now stored in filesystem at:
- `public/widget/settings/{companyId}.json`
- Settings persist across server restarts
- Widget automatically loads correct settings
- No database required
- Easy to backup and manage

**Ready for development and small-scale production!** 🎉

---

**Version:** 1.0.0  
**Date:** November 1, 2025  
**Status:** Production Ready ✅

