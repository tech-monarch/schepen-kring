# Answer24 Chat Widget - User Documentation

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Support:** support@answer24.nl

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Installation Guide](#installation-guide)
4. [Widget Customization](#widget-customization)
5. [Features Overview](#features-overview)
6. [Advanced Configuration](#advanced-configuration)
7. [Testing & Troubleshooting](#testing--troubleshooting)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)
10. [Support & Contact](#support--contact)

---

## Introduction

### What is Answer24 Chat Widget?

Answer24 Chat Widget is an AI-powered customer support solution that can be embedded on any website. It provides instant, intelligent responses to customer inquiries 24/7, improving customer satisfaction while reducing support workload.

### Key Benefits

- **24/7 Availability**: Never miss a customer inquiry, even outside business hours
- **Instant Responses**: AI-powered responses provide immediate assistance
- **Easy Integration**: One-line code snippet - works on any website
- **Fully Customizable**: Match your brand colors, fonts, and messaging
- **Live Preview**: See changes instantly as you customize
- **Mobile Responsive**: Works perfectly on all devices
- **No Coding Required**: All customization done through visual dashboard

### Who Should Use This Widget?

- E-commerce store owners
- Service businesses
- SaaS companies
- Corporate websites
- Any business wanting to provide instant customer support

---

## Getting Started

### Prerequisites

- Active Answer24 account
- Access to Answer24 Dashboard
- Access to your website's HTML (ability to add code)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Quick Start (5 Minutes)

1. Log into Answer24 Dashboard
2. Navigate to Widget Management
3. Copy the embed code
4. Paste into your website
5. Done! Widget is live

---

## Installation Guide

### Step 1: Access Widget Management

1. Open your web browser
2. Navigate to: `http://localhost:3000/nl/dashboard/admin/widget`
3. Log in with your Answer24 credentials
4. You'll see the Widget Management dashboard

### Step 2: Get Your Embed Code

**Location:** Widget Management → General Tab → Embed Code section

You'll see code that looks like this:

```html
<!-- Add this before closing </body> tag on your website -->
<script
  src="http://localhost:3000/widget/answer24-widget.js"
  data-public-key="PUB_abc123"
></script>
```

**To copy:**

1. Click the **"Copy Embed Code"** button
2. The code is now in your clipboard

### Step 3: Add Code to Your Website

#### For Standard HTML Websites:

1. Open your website's HTML file in a text editor
2. Scroll to the bottom of the file
3. Find the closing `</body>` tag
4. Paste the embed code **just before** the `</body>` tag
5. Save the file

**Example:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <!-- Your website content -->
    <h1>Welcome to My Store</h1>
    <p>Shop our amazing products...</p>

    <!-- Answer24 Widget - Add here, before </body> -->
    <script
      src="http://localhost:3000/widget/answer24-widget.js"
      data-public-key="PUB_abc123"
    ></script>
  </body>
</html>
```

#### For WordPress:

1. Go to WordPress Dashboard
2. Navigate to: **Appearance → Theme Editor**
3. Find **footer.php** in the file list
4. Paste the code before `</body>` tag
5. Click **Update File**

#### For Shopify:

1. Go to Shopify Admin
2. Navigate to: **Online Store → Themes**
3. Click **Actions → Edit code**
4. Find **theme.liquid** file
5. Paste the code before `</body>` tag
6. Click **Save**

#### For Wix:

1. Go to Wix Editor
2. Click **Settings** in the left sidebar
3. Click **Custom Code**
4. Click **+ Add Custom Code**
5. Paste the widget code
6. Select **Body - end**
7. Click **Apply**

### Step 4: Verify Installation

1. Open your website in a web browser
2. Look for the chat button in the bottom-right corner (or bottom-left, depending on your settings)
3. Click the button to open the chat window
4. If you see the widget, installation is successful! ✓

---

## Widget Customization

All customization is done through the Answer24 Dashboard - no coding required!

### Accessing Customization Settings

**URL:** `http://localhost:3000/nl/dashboard/admin/widget`

The dashboard has several tabs:

- **General**: Public key and embed code
- **Appearance**: Colors, fonts, and styling
- **Behavior**: Widget behavior settings
- **Features**: Enable/disable features
- **Security**: Access control and rate limiting
- **Integrations**: Third-party integrations

---

### Appearance Customization

**Location:** Widget Management → Appearance Tab

#### Primary Color

**What it controls:**

- Chat button color
- Header background color
- Send button color
- User message bubbles

**How to change:**

1. Go to Appearance tab
2. Click on the **Primary Color** picker
3. Select your desired color
4. **Watch the widget update instantly!** (Live preview)
5. Click **Save Changes** to persist

**Recommended colors:**

- Corporate blue: `#2563eb`
- Professional green: `#10b981`
- Warm orange: `#f59e0b`
- Modern purple: `#8b5cf6`

#### Background Color

**What it controls:**

- Chat window background
- Message container background

**How to change:**

1. Click on the **Background Color** picker
2. Select color (usually white `#ffffff` or light gray `#f9fafb`)
3. Preview updates instantly
4. Save changes

#### Border Radius

**What it controls:**

- Roundness of chat window corners
- Message bubble roundness
- Button roundness

**Values:**

- `0` = Square corners (modern, flat)
- `14` = Slightly rounded (recommended)
- `18` = Rounded (friendly)
- `24` = Very rounded (playful)

**How to change:**

1. Find **Border Radius** field
2. Enter a number (0-30)
3. See instant preview
4. Save changes

#### Font Family

**What it controls:**

- All text in the widget

**Common options:**

- `Inter, system-ui, sans-serif` (modern, clean)
- `Arial, sans-serif` (professional)
- `Georgia, serif` (elegant)
- `Roboto, sans-serif` (friendly)

**How to change:**

1. Enter font name in **Font Family** field
2. Preview updates instantly
3. Save changes

---

### Behavior Settings

**Location:** Widget Management → Behavior Tab

#### Position

**Options:**

- **Right**: Bottom-right corner (recommended for most websites)
- **Left**: Bottom-left corner (use if right side is crowded)

**How to change:**

1. Go to Behavior tab
2. Select position from dropdown
3. Widget moves immediately
4. Save changes

#### Open on Load

**What it does:**

- Automatically opens chat window when page loads

**When to enable:**

- Landing pages with special offers
- Support/help pages
- Product launch pages

**When to disable:**

- General website pages (can be intrusive)
- E-commerce product pages
- Blog posts

#### Open on Exit Intent

**What it does:**

- Opens chat when user moves mouse to close the browser tab
- Helps capture abandoning visitors

**Best for:**

- E-commerce checkout pages
- High-value product pages
- Lead generation pages

---

### Features

**Location:** Widget Management → Features Tab

#### Chat

**Description:** Core chat functionality

**When to enable:** Always (this is the main feature)

#### Wallet

**Description:** Display user's A-Points balance

**When to enable:**

- If you have a loyalty/rewards program
- If users can earn/spend points
- E-commerce with customer rewards

#### Offers

**Description:** Show special promotions in widget

**When to enable:**

- Running active promotions
- Want to display exclusive deals
- Holiday/seasonal campaigns

#### Lead Form

**Description:** Collect contact information

**When to enable:**

- Want to capture leads
- Before providing detailed support
- For high-value inquiries

---

### Text Customization

**Location:** Widget Management → General Tab (Advanced)

#### Welcome Message

**Default:** "Hi there! I'm answer24, your assistant. How can I help you today?"

**Customize for:**

- Your brand voice
- Your industry
- Your language

**Examples:**

- E-commerce: "Welcome! Looking for the perfect product? I'm here to help!"
- Tech Support: "Hi! Having technical issues? Let's get them solved together."
- Service Business: "Hello! Ready to book an appointment or have questions?"

#### Placeholder Text

**Default:** "Type your message..."

**Examples:**

- "Ask me anything..."
- "How can we help?"
- "Message us..."

---

## Features Overview

### Live Preview

**What it is:**
Real-time color and styling updates without page refresh

**How it works:**

1. Open Widget Management
2. Open another tab with your website
3. Change a color in Widget Management
4. **Instantly see the change** on your website tab!

**Benefits:**

- Experiment with colors safely
- See exactly how it looks
- No need to refresh page
- Faster customization process

### AI-Powered Responses

**What it does:**
Provides intelligent, context-aware responses to customer questions

**Powered by:**

- Advanced natural language processing
- Your company's knowledge base
- Previous conversation history

**Handles:**

- Product questions
- Order status inquiries
- Technical support
- General information requests

### Conversation History

**Features:**

- All conversations are logged
- Review past interactions
- Identify common questions
- Improve AI responses

**Access:** Dashboard → Chat History

### Mobile Responsiveness

**Automatic adjustments:**

- **Desktop**: Full-sized window (400px × 600px)
- **Tablet**: Optimized width (90% of screen)
- **Mobile**: Full-width, adjusted height

**No configuration needed** - works perfectly on all devices!

---

## Advanced Configuration

### JavaScript API

For developers who want programmatic control:

#### Open Widget

```javascript
Answer24Widget.open();
```

**Use case:** Open widget when user clicks a custom button

**Example:**

```html
<button onclick="Answer24Widget.open()">Need Help? Click Here!</button>
```

#### Close Widget

```javascript
Answer24Widget.close();
```

**Use case:** Close widget programmatically

#### Send Message

```javascript
Answer24Widget.sendMessage("I need help with my order");
```

**Use case:** Pre-populate chat with specific query

**Example:**

```html
<button onclick="Answer24Widget.sendMessage('What is your return policy?')">
  Return Policy Questions
</button>
```

### Domain Whitelisting

**Location:** Widget Management → General Tab → Allowed Domains

**Purpose:** Control which websites can use your widget

**How to add domains:**

1. Enter domain (e.g., `example.com`)
2. Click **Add Domain**
3. Domain appears in list

**Wildcard support:**

- `example.com` - Only exact domain
- `*.example.com` - All subdomains
- `*` - All domains (not recommended for production)

**Recommended setup:**

```
yourdomain.com
*.yourdomain.com
localhost (for testing)
```

### Rate Limiting

**Location:** Widget Management → Security Tab

**What it does:** Limits number of messages per minute to prevent abuse

**Default:** 60 messages per minute

**Recommended values:**

- **High traffic**: 60-100 messages/min
- **Normal traffic**: 30-60 messages/min
- **Low traffic**: 10-30 messages/min

---

## Testing & Troubleshooting

### Testing Your Widget

#### Pre-Launch Checklist

- [ ] Widget appears on all pages
- [ ] Chat button is visible and clickable
- [ ] Chat window opens smoothly
- [ ] Messages can be sent and received
- [ ] Colors match your brand
- [ ] Text is readable on all backgrounds
- [ ] Widget works on mobile devices
- [ ] Widget works on tablets
- [ ] Tested on Chrome browser
- [ ] Tested on Safari browser
- [ ] Tested on Firefox browser
- [ ] Welcome message is correct
- [ ] Position is correct (left/right)

#### Test Demo Page

**URL:** `http://localhost:3000/widget/demo.html`

**What it shows:**

- How widget looks on external website
- All interactive features
- Mobile responsiveness
- Color customization

**How to use:**

1. Open demo page
2. Test all widget features
3. Try on different devices
4. Verify everything works

### Common Issues & Solutions

#### Issue: Widget Not Appearing

**Possible causes:**

1. Embed code not added correctly
2. JavaScript blocked
3. Public key incorrect

**Solutions:**

**Check 1: Verify embed code**

```javascript
// Open browser console (press F12)
// Type this command:
console.log(document.querySelector("script[data-public-key]"));
// Should show the script tag
```

**Check 2: Check for JavaScript errors**

```javascript
// Open browser console (press F12)
// Look for red error messages
// Screenshot and send to support if you see errors
```

**Check 3: Verify public key**

1. Go to Widget Management
2. Copy fresh embed code
3. Replace old code with new code
4. Refresh website

#### Issue: Widget Not Updating After Color Change

**Solution 1: Hard refresh**

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Solution 2: Clear browser cache**

1. Open browser settings
2. Find "Clear browsing data"
3. Select "Cached images and files"
4. Click "Clear data"
5. Refresh website

**Solution 3: On external website**

- Settings update when you refresh the page
- Clear localStorage if needed:

```javascript
// In browser console:
localStorage.removeItem("widget-settings");
```

#### Issue: Widget Position Wrong

**Solution:**

1. Go to Widget Management → Behavior tab
2. Change **Position** setting
3. Select "Right" or "Left"
4. Save changes
5. Widget moves immediately

#### Issue: Colors Don't Match Brand

**Solution:**

1. Get your exact brand color code (e.g., `#FF6B6B`)
2. Go to Widget Management → Appearance tab
3. Click Primary Color picker
4. Enter your exact color code
5. See instant preview
6. Adjust until perfect
7. Save changes

#### Issue: Widget Covers Important Content

**Solutions:**

**Option 1: Change position**

- Switch from right to left (or vice versa)

**Option 2: Adjust z-index** (Advanced)

- Contact support for assistance

**Option 3: Hide on specific pages**

- Add CSS to hide widget on certain pages:

```css
.checkout-page #answer24-widget-container {
  display: none;
}
```

---

## Best Practices

### Design & User Experience

#### Color Selection

**Do:**

- ✓ Use your brand's primary color
- ✓ Ensure good contrast (text readable on background)
- ✓ Test colors on different devices
- ✓ Consider accessibility (color blind users)

**Don't:**

- ✗ Use extremely bright colors (can hurt eyes)
- ✗ Use low contrast combinations (hard to read)
- ✗ Change colors too frequently (confuses users)

#### Welcome Message

**Do:**

- ✓ Keep it friendly and inviting
- ✓ Mention what you can help with
- ✓ Use your brand voice
- ✓ Keep it concise (1-2 sentences)

**Don't:**

- ✗ Write long paragraphs
- ✗ Use technical jargon
- ✗ Sound robotic or impersonal

#### Widget Placement

**Recommended:**

- Bottom-right corner (standard, expected location)
- Bottom-left corner (if right side is crowded)

**Avoid:**

- Top corners (interferes with navigation)
- Center of screen (blocks content)

### Performance Optimization

#### Page Load Speed

**Widget loads asynchronously:**

- Doesn't block page loading
- Loads after main content
- Minimal impact on page speed

**Tip:** Place embed code at bottom of page (before `</body>`)

#### Mobile Optimization

**Automatic features:**

- Responsive sizing
- Touch-friendly buttons
- Optimized layout

**No configuration needed!**

### Customer Engagement

#### When to Use Exit Intent

**Good for:**

- E-commerce checkout pages
- High-value product pages
- Lead generation pages
- Landing pages

**Not recommended for:**

- Blog posts
- Information pages
- About pages

#### When to Auto-Open

**Good for:**

- Special promotion pages
- Support/help pages
- Troubleshooting pages
- FAQ pages

**Not recommended for:**

- Every page (can be annoying)
- Homepage (usually not needed)
- Thank you pages

---

## FAQ

### General Questions

**Q: Do I need coding knowledge to use the widget?**  
A: No! All customization is done through a visual dashboard. Just copy and paste one line of code to install.

**Q: Will the widget slow down my website?**  
A: No. The widget loads asynchronously, meaning it doesn't block your page content. Page load speed is unaffected.

**Q: Can I use the widget on multiple websites?**  
A: Yes! Use the same embed code on all your websites. You can control which domains are allowed in the dashboard.

**Q: Is the widget mobile-friendly?**  
A: Yes! The widget is fully responsive and works perfectly on all devices - phones, tablets, and desktops.

**Q: Can I customize the widget to match my brand?**  
A: Absolutely! Customize colors, fonts, position, messages, and more through the dashboard.

### Technical Questions

**Q: What browsers are supported?**  
A: All modern browsers:

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

**Q: Does the widget work offline?**  
A: The widget requires internet connection for AI responses. The button and interface will display, but messaging requires connectivity.

**Q: Can I control the widget with JavaScript?**  
A: Yes! Use the Answer24Widget API:

```javascript
Answer24Widget.open();
Answer24Widget.close();
Answer24Widget.sendMessage("message");
```

**Q: How do I get my public key?**  
A: Your public key is shown in Widget Management dashboard. It's automatically included in your embed code.

### Customization Questions

**Q: How do I change the widget color?**  
A: Go to Widget Management → Appearance → Primary Color. Click the color picker and select your color. Changes appear instantly!

**Q: Can I change the widget position?**  
A: Yes! Go to Behavior tab and select "Left" or "Right" position.

**Q: Can I change the welcome message?**  
A: Yes! Go to General tab (advanced section) to customize all text strings.

**Q: Do changes require me to update the embed code?**  
A: No! All changes made in the dashboard apply automatically. You never need to update the embed code.

### Troubleshooting Questions

**Q: Why isn't my widget appearing?**  
A: Check these:

1. Embed code added correctly (before `</body>` tag)
2. JavaScript enabled in browser
3. No JavaScript errors in console (press F12)
4. Correct public key in embed code

**Q: Why don't my color changes show up?**  
A: Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear cache. On external websites, refresh the page to load new settings.

**Q: Widget is covering important content - what do I do?**  
A: Switch the position from right to left (or vice versa) in Behavior settings.

**Q: How do I remove the widget temporarily?**  
A: Simply remove the embed code from your website's HTML.

---

## Support & Contact

### Getting Help

#### Documentation

- **This guide**: Complete user manual
- **Technical guide**: `WIDGET_EXTERNAL_EMBED_GUIDE.md`
- **Integration guide**: `WIDGET_EMBED_GUIDE.md`

#### Email Support

- **General inquiries**: support@answer24.nl
- **Technical support**: tech@answer24.nl
- **Sales questions**: sales@answer24.nl

**Response time:** Within 24 hours (usually much faster!)

#### Live Chat

Available in your Answer24 Dashboard

**Hours:**

- Monday-Friday: 9:00 AM - 6:00 PM CET
- Saturday-Sunday: Closed

#### Knowledge Base

Access tutorials, videos, and articles:

- Dashboard → Help → Knowledge Base

### Reporting Issues

When reporting an issue, please include:

1. **Description**: What's happening?
2. **Expected behavior**: What should happen?
3. **Steps to reproduce**: How to recreate the issue?
4. **Browser**: Chrome, Firefox, Safari, Edge?
5. **Device**: Desktop, tablet, or mobile?
6. **Screenshot**: If applicable
7. **Console errors**: Press F12, copy any red errors

**Email to:** tech@answer24.nl

### Feature Requests

Have an idea for a new feature?

**Submit via:**

- Email: feedback@answer24.nl
- Dashboard: Settings → Feedback
- Or tell us in live chat!

We review all suggestions and implement popular requests.

---

## Appendix

### Glossary

**API**: Application Programming Interface - allows programmatic control of the widget

**Embed Code**: HTML code snippet that loads the widget on your website

**Live Preview**: Instant visual updates when changing settings

**Public Key**: Unique identifier for your widget instance

**Widget**: The chat interface that appears on your website

**z-index**: CSS property controlling layering (which elements appear on top)

### Version History

**Version 2.0.0** (Current)

- Live preview for color changes
- Improved embed code
- Better mobile responsiveness
- Enhanced customization options
- JavaScript API
- Demo page

**Version 1.0.0**

- Initial release
- Basic chat functionality
- Color customization
- Position control

### System Requirements

**For Website Owners:**

- Access to website HTML
- Modern web browser
- Internet connection

**For Website Visitors:**

- Modern web browser with JavaScript enabled
- Internet connection

**No server-side requirements!**

---

## Quick Reference Card

### Installation

```html
<script
  src="http://localhost:3000/widget/answer24-widget.js"
  data-public-key="YOUR_KEY"
></script>
```

Place before `</body>` tag

### Dashboard URL

```
http://localhost:3000/nl/dashboard/admin/widget
```

### JavaScript API

```javascript
Answer24Widget.open(); // Open chat
Answer24Widget.close(); // Close chat
Answer24Widget.sendMessage(""); // Send message
```

### Support Email

```
support@answer24.nl
```

### Demo Page

```
http://localhost:3000/widget/demo.html
```

---

**End of Documentation**

_This document is regularly updated. For the latest version, visit your Answer24 Dashboard._

**Document Version:** 2.0  
**Last Updated:** January 2025  
\*_© 2025 Answer24. All rights reserved._
