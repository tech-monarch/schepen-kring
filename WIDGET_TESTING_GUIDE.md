# 🧪 Widget Testing Guide

## 🚀 **Testing URLs & Steps**

### **1. Admin Dashboard (Widget Management)**

**URL:** `https://localhost:3000/en/dashboard/admin/widget`

**Steps:**

1. Go to the admin dashboard
2. Navigate to "Widget" section
3. Configure your widget settings
4. Get your public key
5. Copy the embed code

---

### **2. Widget API Endpoints**

#### **A. Widget Configuration API**

```bash
# Test widget config endpoint
curl "https://localhost:3000/api/v1/widget/config?key=PUB_abc123"
```

#### **B. Widget Settings API**

```bash
# Test settings endpoint (requires authentication)
curl -X POST "https://localhost:3000/api/v1/widget/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme": {"primary": "#ff0000"}}'
```

#### **C. Widget Chat API**

```bash
# Test chat endpoint
curl -X POST "https://localhost:3000/api/v1/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "companyId": "123", "publicKey": "PUB_abc123"}'
```

#### **D. Key Rotation API**

```bash
# Test key rotation (requires authentication)
curl -X POST "https://localhost:3000/api/v1/widget/rotate-key" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### **3. Widget Embed Testing**

#### **A. Create Test HTML File**

Create a file called `test-widget.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Widget Test</title>
  </head>
  <body>
    <h1>Widget Testing Page</h1>
    <p>This page tests the Schepenkring.nlwidget integration.</p>

    <!-- Widget Embed Code -->
    <script
      src="https://localhost:3000/widget/v1/answer24.js"
      async
      data-public-key="PUB_abc123"
      data-locale="en-US"
      data-theme="auto"
      data-color-primary="#0059ff"
      data-position="right"
    ></script>
  </body>
</html>
```

#### **B. Test Widget Loading**

1. Open `test-widget.html` in your browser
2. Check browser console for any errors
3. Look for the widget button (should appear on the right side)
4. Click the widget to test functionality

---

### **4. Complete Testing Workflow**

#### **Step 1: Access Admin Dashboard**

```
URL: https://localhost:3000/en/dashboard/admin/widget
```

#### **Step 2: Configure Widget Settings**

1. Set theme colors
2. Configure features (chat, wallet, offers)
3. Set allowed domains
4. Generate public key

#### **Step 3: Test API Endpoints**

```bash
# Test config endpoint
curl "https://localhost:3000/api/v1/widget/config?key=YOUR_PUBLIC_KEY"

# Test with invalid key (should return error)
curl "https://localhost:3000/api/v1/widget/config?key=invalid"
```

#### **Step 4: Test Widget Embed**

1. Copy the embed code from admin dashboard
2. Create test HTML file with the embed code
3. Open in browser and test widget functionality

#### **Step 5: Test Widget Features**

1. **Chat Feature**: Click widget → Chat tab → Send message
2. **Wallet Feature**: Click widget → Wallet tab → View balance
3. **Settings**: Click widget → Settings → Customize appearance
4. **Responsive**: Test on different screen sizes

---

### **5. Expected Results**

#### **✅ Success Indicators:**

- Widget button appears on page
- No console errors
- API endpoints return proper responses
- Widget opens and functions correctly
- Theme customization works
- Features toggle properly

#### **❌ Common Issues:**

- **404 Error**: Widget script not found → Check URL path
- **CORS Error**: Cross-origin issues → Check domain settings
- **Invalid Key**: Authentication failed → Check public key
- **Widget Not Loading**: Check console for JavaScript errors

---

### **6. Production Testing**

#### **A. Test with Real Domain**

```html
<!-- Production embed code -->
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

#### **B. Test on Different Domains**

1. Add your domain to allowed domains in admin
2. Test widget on your actual website
3. Verify domain validation works
4. Test with unauthorized domains (should be blocked)

---

### **7. Debugging Tools**

#### **A. Browser Console**

```javascript
// Check if widget is loaded
console.log(window.Answer24Widget);

// Check configuration
console.log(window.Answer24Config);

// Check for errors
console.error("Widget errors:", window.Answer24Errors);
```

#### **B. Network Tab**

- Check if widget script loads
- Verify API calls are made
- Check for 404s or CORS errors
- Monitor response times

#### **C. Admin Dashboard Logs**

- Check widget management dashboard
- Monitor API usage
- View error logs
- Track performance metrics

---

## 🎯 **Quick Test Checklist**

- [ ] Admin dashboard accessible
- [ ] Widget settings configurable
- [ ] Public key generated
- [ ] Embed code copied
- [ ] Widget script loads
- [ ] Widget button appears
- [ ] Widget opens correctly
- [ ] Chat feature works
- [ ] Wallet feature works
- [ ] Settings work
- [ ] Theme customization works
- [ ] No console errors
- [ ] API endpoints respond
- [ ] Domain validation works

---

## 🚀 **Ready to Test!**

Your widget system is ready for testing. Start with the admin dashboard and work through each step to ensure everything is working correctly! 🎉
