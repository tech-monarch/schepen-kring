# 🤖 Schepenkring.nlWidget - External Website Embed Guide

## Quick Start

### 1. Get Your Embed Code

1. Go to **Dashboard → Admin → Widget Management**
   - URL: `http://localhost:3000/nl/dashboard/admin/widget`
2. Click the **"Copy Embed Code"** button
3. Paste the code into your website's HTML before the closing `</body>` tag

### 2. Example Embed Code

```html
<!-- Add this before closing </body> tag on your website -->
<script
  src="http://localhost:3000/widget/answer24-widget.js"
  data-public-key="YOUR_PUBLIC_KEY"
></script>
```

That's it! The widget will automatically load with all your custom settings.

---

## 🎨 How Settings Work

All widget customization is done through your **Schepenkring.nlDashboard**:

### Appearance Settings (Live Preview!)

- **Primary Color**: Changes button and header colors
- **Background Color**: Changes chat window background
- **Border Radius**: Adjusts roundness of widget elements
- **Font Family**: Changes text style

**✨ Live Preview**: Changes appear instantly on the widget - no need to refresh!

### Behavior Settings

- **Position**: Left or right side of screen
- **Open on Load**: Auto-open when page loads
- **Exit Intent**: Show widget when user tries to leave

### Features

- Chat functionality
- Wallet integration
- Special offers
- Lead capture form

---

## 📝 Complete Integration Example

Here's a complete HTML page with the Schepenkring.nlwidget:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Webshop</title>
  </head>
  <body>
    <!-- Your website content -->
    <header>
      <h1>Welcome to My Webshop</h1>
    </header>

    <main>
      <p>Your amazing content here...</p>
    </main>

    <footer>
      <p>&copy; 2025 My Webshop</p>
    </footer>

    <!-- Schepenkring.nlWidget - Add before closing </body> tag -->
    <script
      src="http://localhost:3000/widget/answer24-widget.js"
      data-public-key="YOUR_PUBLIC_KEY"
    ></script>
  </body>
</html>
```

---

## 🎮 JavaScript API (Advanced)

Control the widget programmatically:

```javascript
// Open the widget
Answer24Widget.open();

// Close the widget
Answer24Widget.close();

// Send a message programmatically
Answer24Widget.sendMessage("Hello, I need help!");
```

### Example: Open widget when user clicks a custom button

```html
<button onclick="Answer24Widget.open()">Need Help? Chat with us!</button>
```

---

## 🧪 Testing Your Integration

### Option 1: View Demo Page

1. Open: `http://localhost:3000/widget/demo.html`
2. See the widget in action on a sample page
3. Test all features and interactions

### Option 2: Test on Your Website

1. Add the embed code to your website
2. Open your website in a browser
3. Look for the chat button in the bottom-right (or bottom-left)
4. Click to test the chat functionality

---

## 🎨 Customizing Widget Settings

### Change Colors (Live Preview!)

1. Go to: `http://localhost:3000/nl/dashboard/admin/widget`
2. Click the **"Appearance"** tab
3. **Move the color picker** - watch the widget update in real-time! 🎨
4. Changes apply instantly - no save needed for preview
5. Click **"Save Changes"** to persist to backend

### Example: Change Primary Color

1. Open Widget Management
2. Go to Appearance tab
3. Click the "Primary Color" picker
4. Select your brand color (e.g., `#FF6B6B`)
5. **Watch the widget update instantly!**
6. Save changes

The widget on your external website will automatically update!

---

## 🔄 How Real-Time Updates Work

### The Magic Behind Live Updates

1. **You change a setting** in the dashboard (e.g., primary color)
2. **Settings are saved** to localStorage immediately
3. **Event is broadcast** to all widgets
4. **Widget reloads** with new settings
5. **Changes appear instantly** - no page refresh needed!

### Same-Domain Updates (localhost:3000)

If the widget is embedded on the same domain as your dashboard:

- Updates happen **instantly** via browser events
- Perfect for testing and preview

### Cross-Domain Updates (external websites)

If the widget is on a different domain:

- Widget loads latest settings from localStorage on page load
- Changes appear when user refreshes the external page
- Or implement polling to check for updates periodically

---

## 📱 Responsive Design

The widget is fully responsive and works on:

- ✅ Desktop computers
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (iOS, Android)
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

The widget automatically adjusts:

- Width: Max 90vw on mobile
- Height: Max 70vh to prevent covering content
- Position: Stays accessible on all screen sizes

---

## 🔒 Security & Privacy

### Domain Whitelisting

1. Go to Widget Management → "Allowed Domains"
2. Add domains where widget can be used:
   ```
   example.com
   *.example.com (allows all subdomains)
   ```

### Data Privacy

- Messages are encrypted in transit
- No personal data stored without consent
- GDPR compliant
- Conversation logs can be disabled

---

## 🛠️ Troubleshooting

### Widget Not Appearing?

**Check 1: Script loaded correctly**

```javascript
// Open browser console (F12)
console.log(window.Answer24Widget);
// Should show: {open: ƒ, close: ƒ, sendMessage: ƒ}
```

**Check 2: Public key is correct**

- Copy fresh embed code from dashboard
- Verify the `data-public-key` attribute

**Check 3: JavaScript enabled**

- Widget requires JavaScript to function
- Check browser console for errors

### Widget Not Updating After Color Change?

**Solution 1: Check localStorage**

```javascript
// Open browser console
localStorage.getItem("widget-settings");
// Should show JSON with latest settings
```

**Solution 2: Clear cache**

- Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
- Clear browser cache

**Solution 3: On external domain**

- Refresh the page to load latest settings
- Settings update on page load

### Widget Positioning Issues?

**Change position in dashboard:**

1. Go to Widget Management → Behavior tab
2. Change "Position" to "left" or "right"
3. Widget updates instantly

---

## 📊 Testing Checklist

Before going live, test these scenarios:

- [ ] Widget appears on page load
- [ ] Chat button is clickable
- [ ] Chat window opens/closes properly
- [ ] Messages can be sent
- [ ] Widget works on mobile
- [ ] Colors match your brand
- [ ] Position is correct (left/right)
- [ ] Works on all target browsers
- [ ] Settings changes update correctly

---

## 🚀 Going to Production

### For Production Deployment:

1. **Update API URL** in widget script:

   ```html
   <script
     src="https://your-production-domain.com/widget/answer24-widget.js"
     data-public-key="YOUR_PUBLIC_KEY"
   ></script>
   ```

2. **Configure allowed domains**:
   - Add your production domain to whitelist
   - Remove localhost/test domains

3. **Enable HTTPS**:
   - Widget requires HTTPS in production
   - Use SSL certificate on your domain

4. **Test thoroughly**:
   - Test on staging environment first
   - Verify all features work
   - Check mobile responsiveness

---

## 💡 Best Practices

### 1. Placement

- Place embed code before closing `</body>` tag
- Ensures page content loads first
- Widget loads asynchronously

### 2. Customization

- Match widget colors to your brand
- Use clear, friendly welcome messages
- Test different positions (left vs right)

### 3. User Experience

- Don't auto-open on every page load (can be annoying)
- Enable exit intent for e-commerce sites
- Keep response times fast

### 4. Monitoring

- Check conversation logs regularly
- Monitor response quality
- Update AI training data

---

## 📞 Support

### Need Help?

- **Email**: support@answer24.nl
- **Documentation**: Check WIDGET_EMBED_GUIDE.md
- **Dashboard**: `http://localhost:3000/nl/dashboard/admin/widget`

### Report Issues

- GitHub: [Create an issue](https://github.com/Answer24BV/answer24_frontend/issues)
- Include: Browser version, console errors, screenshots

---

## 🎉 Success!

Your Schepenkring.nlwidget is now embedded and ready to engage with your customers!

**Remember:**

- All customization happens in the dashboard
- Changes apply in real-time (live preview)
- Widget works on any website
- Fully responsive and mobile-friendly

Happy chatting! 🚀
