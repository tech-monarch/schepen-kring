# 🔍 Cashback Not Adding - Debugging Guide

**Status:** Comprehensive logging added to identify the issue

---

## 🧪 Step 1: Test and Check Console

### 1. Open Browser Developer Tools

- Press: **F12**
- Click: **Console** tab
- Clear console (click trash icon)

### 2. Go to Webshop

```
https://answer24.nl/nl/webshop/1
```

### 3. Click "Buy Now"

### 4. Watch Console Output

You should see **EXACTLY** this sequence:

```
🛒 BUY NOW CLICKED!
Buy now: {quantity: 1, size: "M", color: "blue"}
💰 Price calculation: €299.99 × 10% = €30.00
👤 User data: {id: 190, name: "..."}
📤 Sending purchase tracking request...
Order details: {
  orderId: "WEBSHOP_1705...",
  userId: 190,
  totalPrice: 299.99,
  cashbackAmount: 30.00,
  shop: "TechStore Pro"
}
📥 API Response Status: 200
📥 Full API Response: {success: true, data: {...}}
✅ SUCCESS! Cashback tracked and wallet should be credited
Response data: {...}
✅ Cashback tracked: {...}
```

---

## 🐛 Troubleshooting By Error

### Issue 1: Console Shows "BUY NOW CLICKED" But Then Nothing

**Problem:** API call might be failing silently

**Check:**

1. Network tab (F12 → Network)
2. Look for "track-purchase" request
3. Check the response

**Expected:**

- Request URL: `/api/v1/widget/track-purchase`
- Method: `POST`
- Status: `200`

**If Status is Not 200:**

```
❌ 400 Bad Request → Check user_id format
❌ 401 Unauthorized → Authentication issue
❌ 500 Server Error → Backend issue
❌ Network Failed → Backend not running
```

---

### Issue 2: "❌ No user data found in localStorage"

**Problem:** Not logged in or localStorage cleared

**Solution:**

1. Make sure you're logged in
2. Refresh page
3. Try again

**Check:**

```javascript
// In console, type:
localStorage.getItem("user_data");
// Should show your user data JSON, not null
```

---

### Issue 3: API Response Shows Error

**Example Error Output:**

```
❌ API returned failure: {
  success: false,
  error: "Invalid signature"
}
```

**Common Errors:**

| Error                     | Cause                  | Solution                             |
| ------------------------- | ---------------------- | ------------------------------------ |
| "Invalid signature"       | Development mode issue | Check if public_key is 'webshop-key' |
| "Missing required fields" | Invalid request body   | Check console logs for Order details |
| "Backend not available"   | Backend server down    | Make sure backend is running         |
| "User not found"          | Wrong user ID          | Check user_id in localStorage        |

---

## 🔧 What to Check

### Check 1: User ID

```javascript
// In console:
let userData = JSON.parse(localStorage.getItem("user_data"));
console.log(userData.id);
// Should show a number like: 190
```

### Check 2: Price Calculation

```javascript
// Should be: 299.99 * 0.10 = 29.999 → rounds to 30.00
```

### Check 3: API Call

```javascript
// In Network tab, look for POST request to:
// /api/v1/widget/track-purchase
```

### Check 4: Backend Response

```javascript
// In Network tab, click the request
// Go to "Response" tab
// Should show: {"success": true, "data": {...}}
```

---

## 📝 Complete Debugging Checklist

- [ ] Browser console open (F12)
- [ ] Console cleared (trash icon)
- [ ] Logged in to system
- [ ] Went to product page
- [ ] Clicked "Buy Now"
- [ ] Saw "🛒 BUY NOW CLICKED!" in console
- [ ] Saw all logging messages (price, user, request, response)
- [ ] API Response Status is 200
- [ ] Response shows `success: true`
- [ ] Checked wallet - balance increased?
- [ ] Checked wallet - transaction in history?

---

## 📊 Expected Flow with Logs

```
User clicks "Buy Now"
  ↓
Console: 🛒 BUY NOW CLICKED!
  ↓
Console: 💰 Price calculation: €299.99 × 10% = €30.00
  ↓
Console: 📤 Sending purchase tracking request...
  ↓
Console: 📥 API Response Status: 200
  ↓
Console: ✅ SUCCESS! Cashback tracked
  ↓
Toast: 🎉 You earned €30.00 cashback!
  ↓
2 seconds later...
  ↓
Toast: 💰 €30.00 added to wallet!
  ↓
🔄 Check Wallet → Balance increased ✓
```

---

## 🎯 Next Steps

### Step 1: Run the Test

1. Open console (F12)
2. Go to product
3. Click "Buy Now"
4. Watch console output

### Step 2: Report What You See

**Send me:**

- The full console output (copy & paste)
- Network tab response (if error)
- Whether wallet balance changed
- Any error messages shown

### Step 3: Common Issues to Report

```
Tell me if you see:
1. ✅ All console messages (means frontend working)
2. ❌ Error in console (frontend issue)
3. ❌ No console messages (frontend not running)
4. ❌ Console shows error in API response (backend issue)
5. ❌ Console looks good but wallet didn't increase (backend not crediting)
```

---

## 💡 What the Logs Mean

| Log                         | Meaning                        |
| --------------------------- | ------------------------------ |
| 🛒 BUY NOW CLICKED!         | Button clicked                 |
| 💰 Price calculation        | Math is working                |
| 👤 User data                | User ID found                  |
| 📤 Sending...               | Request being sent to backend  |
| 📥 API Response Status: 200 | Backend responded successfully |
| ✅ SUCCESS!                 | Cashback tracked               |
| 💰 €30.00 added to wallet!  | Notification shown             |

---

## 🔴 Critical Issues & Solutions

### If No Logs Appear

**Solution:**

1. Refresh page (Ctrl+R)
2. Make sure logged in
3. Open console BEFORE clicking Buy Now
4. Try again

---

### If You See "❌ API returned failure"

**Check 1:** Look at the error message

- Copy it exactly
- This tells us what went wrong

**Check 2:** Network tab

- Right-click "track-purchase" request
- Click "Copy as cURL"
- Send to support with exact error

---

### If Console Shows Success But Wallet Didn't Increase

**This means:**

1. Frontend working ✅
2. API call made ✅
3. Backend not crediting ❌

**What to check:**

1. Backend logs (look for /wallet/add-money errors)
2. Database - did transaction get created?
3. User balance in database

---

## 🚀 Ready to Test?

1. **Open Console:** F12
2. **Navigate:** https://answer24.nl/nl/webshop/1
3. **Click:** "Buy Now"
4. **Read:** Console output
5. **Report:** What you see

---

**Document Version:** 1.0  
**Created:** January 2025  
**Purpose:** Debug why cashback isn't being added to wallet
