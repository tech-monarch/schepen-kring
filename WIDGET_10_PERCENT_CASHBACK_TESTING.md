# 🎉 Widget 10% Cashback Testing Guide

## Quick Start - Test in 5 Minutes!

### Step 1: Open Test Page

```
https://localhost:3000/widget/test-purchase-tracking.html
```

### Step 2: Make Sure You're Logged In

- Check the badge at the top - should show your User ID
- If not logged in, go to: `https://localhost:3000/nl/login`
- Login, then come back to the test page

### Step 3: Make a Test Purchase

- Click "Buy Now" on any product
- Watch the tracking log on the right
- See the API response in browser console (F12)

### Step 4: Verify Wallet Credit

- Go to: `https://localhost:3000/nl/dashboard/wallet`
- Check your A-Points balance
- Should see the 10% cashback added

---

## 🛒 How It Works

### Purchase Flow

```
User clicks "Buy Now" on Test Page
           ↓
Widget tracks purchase automatically
           ↓
POST /api/v1/widget/track-purchase
           ↓
Backend calculates 10% cashback
           ↓
User wallet credited with cashback
           ↓
User sees notification + updated balance
```

### Example Purchases

| Product            | Price   | 10% Cashback  |
| ------------------ | ------- | ------------- |
| Premium Headphones | €99.99  | €10.00        |
| Smart Watch        | €249.00 | €24.90        |
| Laptop Bag         | €45.50  | €4.55         |
| Custom Amount      | Any     | 10% of amount |

---

## 📊 What Gets Tracked

### Purchase Data Sent to API

```json
{
  "user_id": "190",
  "order_value": 99.99,
  "order_id": "ORDER_1705XXX",
  "shop_name": "Test Webshop",
  "public_key": "test-key-123",
  "timestamp": "2025-01-24T10:30:00Z",
  "product_name": "Premium Headphones",
  "product_id": "PROD-001"
}
```

### API Response

```json
{
  "success": true,
  "message": "Purchase tracked and wallet credited",
  "data": {
    "purchase_id": "ORDER_1705XXX",
    "cashback_amount": 10.0,
    "wallet_balance": 135.5,
    "transaction_id": "tx_abc123"
  }
}
```

---

## 🧪 Testing Scenarios

### Test 1: Standard Product Purchase

**Steps:**

1. Open test page
2. Click "Buy Now" on "Premium Headphones" (€99.99)
3. Verify tracking log shows success
4. Check wallet - should have +€10.00

**Expected Result:**

- ✅ Log shows: "Purchase tracked successfully"
- ✅ Log shows: "Cashback credited: €10.00"
- ✅ Stats update: Total Purchases +1, Total Cashback +€10.00
- ✅ Wallet balance increases by €10.00

### Test 2: Multiple Purchases

**Steps:**

1. Buy "Premium Headphones" (€99.99)
2. Buy "Smart Watch" (€249.00)
3. Buy "Laptop Bag" (€45.50)
4. Check wallet

**Expected Result:**

- ✅ 3 purchases tracked
- ✅ Total spent: €394.49
- ✅ Total cashback: €39.45
- ✅ Wallet balance increased by €39.45

### Test 3: Custom Amount

**Steps:**

1. Enter "100.00" in custom amount field
2. Click "Make Custom Purchase"
3. Verify cashback calculation

**Expected Result:**

- ✅ €100.00 purchase tracked
- ✅ €10.00 cashback (exactly 10%)
- ✅ Wallet credited correctly

### Test 4: Edge Cases

**Test decimal amounts:**

- €0.99 → €0.10 cashback (rounded)
- €15.75 → €1.58 cashback (rounded to 2 decimals)
- €999.99 → €100.00 cashback

---

## 🔍 Debugging

### Check Browser Console

Press `F12` and look for:

```javascript
// Successful purchase
📥 API Response: {
  success: true,
  message: "Purchase tracked and wallet credited",
  data: { ... }
}

// Or error
❌ API Response: {
  success: false,
  error: "User not found"
}
```

### Common Issues & Solutions

#### Issue: "User not logged in"

**Solution:**

1. Go to `https://localhost:3000/nl/login`
2. Login with your credentials
3. Return to test page
4. Badge should now show your User ID

#### Issue: "Purchase tracking failed"

**Check:**

1. API endpoint is running (backend server)
2. User has valid auth token
3. Network tab (F12) shows 200 response
4. Console shows detailed error

#### Issue: "Wallet not updated"

**Possible causes:**

1. Backend wallet service not connected
2. Database not configured
3. User ID mismatch

**Debug:**

```javascript
// In browser console:
localStorage.getItem("user_data");
// Should show: {"id": 190, "name": "...", ...}
```

---

## 📝 Manual Testing Checklist

### Before Testing

- [ ] Backend server is running
- [ ] Frontend is running on localhost:3000
- [ ] User is logged in
- [ ] Database is accessible
- [ ] Wallet service is configured

### During Testing

- [ ] Open test page successfully
- [ ] User status badge shows logged in
- [ ] Can click "Buy Now" buttons
- [ ] Log shows tracking attempts
- [ ] Console shows API responses
- [ ] No JavaScript errors

### After Purchase

- [ ] Log shows "Purchase tracked successfully"
- [ ] Log shows cashback amount
- [ ] Stats are updated correctly
- [ ] Wallet balance increases
- [ ] Transaction appears in wallet history
- [ ] No duplicate transactions

---

## 🎯 Integration with Real Webshop

### How to Track Real Purchases

When a user completes a purchase on your actual webshop, call the tracking API:

```javascript
// On checkout success page
async function trackPurchase(orderData) {
  const user = JSON.parse(localStorage.getItem("user_data"));

  const response = await fetch(
    "https://localhost:3000/api/v1/widget/track-purchase",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id.toString(),
        order_value: orderData.total,
        order_id: orderData.orderId,
        shop_name: "Your Webshop Name",
        public_key: "YOUR_PUBLIC_KEY",
        timestamp: new Date().toISOString(),
        product_name: orderData.productName,
        product_id: orderData.productId,
      }),
    },
  );

  const result = await response.json();

  if (result.success) {
    // Show success message to user
    alert(
      `Congratulations! You earned €${result.data.cashback_amount} cashback!`,
    );
  }
}

// Call on order completion
trackPurchase({
  total: 99.99,
  orderId: "WEB-123456",
  productName: "Product Name",
  productId: "SKU-001",
});
```

### Auto-tracking with Widget

The widget can automatically detect purchases by monitoring:

- URL changes to `/checkout/success`
- LocalStorage for order completion
- PostMessage from webshop

**Example auto-tracking:**

```javascript
// In your webshop checkout success page
window.addEventListener("load", () => {
  // Check if order was completed
  const orderData = localStorage.getItem("last_order");

  if (orderData) {
    const order = JSON.parse(orderData);

    // Dispatch event for widget
    window.dispatchEvent(
      new CustomEvent("order-completed", {
        detail: {
          order_value: order.total,
          order_id: order.id,
          product_name: order.items.map((i) => i.name).join(", "),
        },
      }),
    );

    // Clear order data
    localStorage.removeItem("last_order");
  }
});
```

---

## 📈 Analytics

### View Tracking Statistics

**In Test Page:**

- Total Purchases count
- Total Spent amount
- Total Cashback earned

**In Dashboard:**
Go to `https://localhost:3000/nl/dashboard/wallet` to see:

- Wallet balance
- Transaction history
- Cashback earnings

### API Analytics Endpoint

```
GET /api/v1/widget/analytics?public_key=test-key-123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_interactions": 1250,
      "purchases_completed": 45,
      "total_cashback_given": 1250.75,
      "conversion_rate": 3.6,
      "average_order_value": 89.5
    }
  }
}
```

---

## 🔒 Security

### Signature Validation

All purchases are validated with HMAC signatures to prevent fraud:

```javascript
// Signature generation
const crypto = require("crypto");
const signature = crypto
  .createHmac("sha256", SIGNING_SECRET)
  .update(JSON.stringify(purchaseData))
  .digest("hex");
```

### Protection Against

- ✅ **Fake purchases** - Signature validation
- ✅ **Duplicate credits** - Order ID uniqueness check
- ✅ **Replay attacks** - Timestamp validation
- ✅ **Unauthorized access** - Public key verification

---

## 🎉 Success Indicators

### You Know It's Working When:

1. **Test Page:**
   - ✅ Log shows successful tracking
   - ✅ Stats update correctly
   - ✅ No errors in console

2. **Wallet:**
   - ✅ Balance increases by exact 10%
   - ✅ Transaction appears in history
   - ✅ Correct amounts displayed

3. **Backend Logs:**
   - ✅ "Purchase tracked" message
   - ✅ "Wallet credited" message
   - ✅ Transaction saved to database

4. **User Experience:**
   - ✅ Instant feedback
   - ✅ Accurate calculations
   - ✅ Smooth integration

---

## 📞 Support

### Need Help?

1. **Check Console** (F12) - Most errors are logged there
2. **Review Logs** - Backend server logs show processing
3. **Test API Directly** - Use Postman/curl to test endpoint
4. **Check Documentation** - See PURCHASE_TRACKING_IMPLEMENTATION.md

### Report Issues

Include:

- Browser used
- Error messages (console + network)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots of test page and console

---

## ✅ Quick Verification

**Run this in browser console:**

```javascript
// Test purchase tracking
async function testPurchase() {
  const response = await fetch(
    "https://localhost:3000/api/v1/widget/track-purchase",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "190",
        order_value: 100,
        order_id: "TEST_" + Date.now(),
        shop_name: "Test Shop",
        public_key: "test-key-123",
        timestamp: new Date().toISOString(),
      }),
    },
  );

  const result = await response.json();
  console.log("✅ Test Result:", result);
  return result.success;
}

testPurchase();
```

**Expected output:**

```javascript
✅ Test Result: {
  success: true,
  message: "Purchase tracked and wallet credited",
  data: {
    purchase_id: "TEST_1705XXX",
    cashback_amount: 10,
    wallet_balance: 145.50,
    transaction_id: "tx_abc123"
  }
}
```

---

## 🎯 Next Steps

1. **✅ Test on test page** - Verify basic functionality
2. **✅ Integrate with webshop** - Add tracking to checkout
3. **✅ Monitor analytics** - Track performance
4. **✅ Gather feedback** - Improve user experience
5. **✅ Scale up** - Deploy to production

---

**Your 10% cashback system is ready to test!** 🚀

Open `https://localhost:3000/widget/test-purchase-tracking.html` and start testing!
