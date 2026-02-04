# 💰 Schepenkring.nlWidget - 10% Cashback System Documentation

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Support:** support@answer24.nl

---

## Table of Contents

1. [System Overview](#system-overview)
2. [How It Works](#how-it-works)
3. [Testing the System](#testing-the-system)
4. [Integration Guide](#integration-guide)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)
7. [Security](#security)
8. [Examples](#examples)

---

## System Overview

### What is the 10% Cashback System?

The Schepenkring.nlWidget automatically tracks user purchases made through partner webshops and credits 10% of the purchase value back to the user's wallet as A-Points (cashback).

### Key Features

- ✅ **Automatic Tracking**: Purchases are tracked automatically when users buy through the widget
- ✅ **10% Cashback**: Users earn 10% of their purchase value back
- ✅ **Instant Credit**: Cashback is credited to wallet immediately
- ✅ **Real-time Notifications**: Users are notified instantly of their earnings
- ✅ **Secure**: HMAC signature validation prevents fraud
- ✅ **Fallback System**: Works even if backend is temporarily unavailable

### How Users Benefit

```
User makes €100 purchase → Earns €10 cashback → Can spend in wallet
```

**Example:**

- Purchase €99.99 headphones → Earn €10.00 cashback
- Purchase €249.00 watch → Earn €24.90 cashback
- Purchase €45.50 bag → Earn €4.55 cashback

---

## How It Works

### Purchase Flow Diagram

```
┌─────────────────┐
│ User visits     │
│ Webshop with    │
│ Widget          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User makes      │
│ Purchase        │
│ (€100)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Widget tracks   │
│ purchase        │
│ automatically   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST to         │
│ /api/v1/widget/ │
│ track-purchase  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend         │
│ calculates 10%  │
│ = €10 cashback  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Wallet credited │
│ +€10            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User notified   │
│ "🎉 You earned  │
│  €10 cashback!" │
└─────────────────┘
```

### Technical Architecture

**Components:**

1. **Widget (Frontend)**
   - Detects purchases
   - Sends tracking data to API
   - Shows notifications

2. **Tracking API (Next.js)**
   - Validates purchase data
   - Calculates 10% cashback
   - Calls wallet service

3. **Wallet Service (Laravel Backend)**
   - Credits user wallet
   - Stores transaction history
   - Updates user balance

4. **Database**
   - Stores purchases
   - Stores wallet transactions
   - Tracks user balances

---

## Testing the System

### Quick Test (5 Minutes)

#### Step 1: Open Test Page

```
https://localhost:3000/widget/test-purchase-tracking.html
```

#### Step 2: Check Login Status

Look at the badge at the top of the page:

- ✅ **Green**: "✓ Logged in (User ID: XXX)" → Ready!
- ❌ **Red**: "✗ Not logged in" → Need to login

**If not logged in:**

```
1. Open: https://localhost:3000/nl/login
2. Login with credentials
3. Return to test page
4. Refresh page
```

#### Step 3: Make Test Purchase

Click **"Buy Now"** on any product:

**Available Test Products:**

| Product            | Price   | Cashback (10%) |
| ------------------ | ------- | -------------- |
| Premium Headphones | €99.99  | €10.00         |
| Smart Watch        | €249.00 | €24.90         |
| Laptop Bag         | €45.50  | €4.55          |
| Custom Amount      | Any     | 10% of amount  |

#### Step 4: Verify Results

**What You Should See:**

**Activity Log (right side):**

```
✓ Purchase initiated: Premium Headphones (€99.99)
✓ Purchase tracked successfully!
✓ Cashback credited: €10.00 (10% of €99.99)
✓ Order ID: ORDER_1705...
```

**Statistics Dashboard:**

```
Total Purchases: 1
Total Spent: €99.99
Total Cashback: €10.00
```

**Browser Console (F12):**

```javascript
📥 API Response: {
  success: true,
  message: "Purchase tracked and wallet credited",
  data: {
    purchase_id: "ORDER_1705...",
    cashback_amount: 10.00,
    wallet_balance: 135.50,
    transaction_id: "tx_abc123"
  }
}
```

#### Step 5: Check Wallet

```
https://localhost:3000/nl/dashboard/wallet
```

Verify:

- ✅ Balance increased by cashback amount
- ✅ New transaction in history
- ✅ Transaction shows correct details

---

## Integration Guide

### For Webshop Owners

#### Option 1: Manual Tracking (Simple)

Add this code to your checkout success page:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Order Confirmed</title>
  </head>
  <body>
    <h1>Thank you for your order!</h1>
    <p>Order ID: #12345</p>
    <p>Total: €99.99</p>

    <!-- Add this script -->
    <script>
      // Get order details (from your backend)
      const orderData = {
        order_id: "ORDER_12345",
        order_value: 99.99,
        product_name: "Premium Headphones",
        product_id: "SKU_001",
      };

      // Track purchase
      async function trackPurchase() {
        try {
          // Get user data
          const userData = localStorage.getItem("user_data");
          if (!userData) {
            console.log("User not logged in, skipping cashback");
            return;
          }

          const user = JSON.parse(userData);

          // Send to tracking API
          const response = await fetch(
            "https://localhost:3000/api/v1/widget/track-purchase",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.id.toString(),
                order_value: orderData.order_value,
                order_id: orderData.order_id,
                shop_name: "Your Webshop Name",
                public_key: "YOUR_PUBLIC_KEY", // Get from dashboard
                timestamp: new Date().toISOString(),
                product_name: orderData.product_name,
                product_id: orderData.product_id,
              }),
            },
          );

          const result = await response.json();

          if (result.success) {
            // Show success message
            alert(
              `🎉 Congratulations! You earned €${result.data.cashback_amount} cashback!`,
            );
            console.log("✅ Cashback tracked:", result);
          }
        } catch (error) {
          console.error("❌ Tracking error:", error);
        }
      }

      // Track on page load
      window.addEventListener("load", trackPurchase);
    </script>
  </body>
</html>
```

#### Option 2: Automatic Tracking (Advanced)

The widget can automatically detect purchases by monitoring events:

**In your checkout success page:**

```javascript
// Dispatch order completed event
window.addEventListener("load", () => {
  const orderData = {
    order_value: 99.99,
    order_id: "ORDER_12345",
    product_name: "Premium Headphones",
    product_id: "SKU_001",
  };

  // Widget will listen for this event
  window.dispatchEvent(
    new CustomEvent("answer24-order-completed", {
      detail: orderData,
    }),
  );
});
```

**The widget automatically listens and tracks!**

#### Option 3: Server-Side Tracking (Most Secure)

Call the API from your backend after order is completed:

**PHP Example:**

```php
<?php
// After order is successfully completed

$orderData = [
    'user_id' => $userId,
    'order_value' => 99.99,
    'order_id' => 'ORDER_12345',
    'shop_name' => 'Your Webshop',
    'public_key' => 'YOUR_PUBLIC_KEY',
    'timestamp' => date('c'),
    'product_name' => 'Premium Headphones',
    'product_id' => 'SKU_001'
];

$response = file_get_contents(
    'https://localhost:3000/api/v1/widget/track-purchase',
    false,
    stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($orderData)
        ]
    ])
);

$result = json_decode($response, true);

if ($result['success']) {
    // Cashback credited successfully
    $cashback = $result['data']['cashback_amount'];
    echo "User earned €{$cashback} cashback!";
}
?>
```

**Node.js Example:**

```javascript
const axios = require("axios");

async function trackPurchase(orderData) {
  try {
    const response = await axios.post(
      "https://localhost:3000/api/v1/widget/track-purchase",
      {
        user_id: orderData.userId,
        order_value: orderData.total,
        order_id: orderData.orderId,
        shop_name: "Your Webshop",
        public_key: "YOUR_PUBLIC_KEY",
        timestamp: new Date().toISOString(),
        product_name: orderData.productName,
        product_id: orderData.productId,
      },
    );

    if (response.data.success) {
      console.log("✅ Cashback credited:", response.data.data.cashback_amount);
      return response.data;
    }
  } catch (error) {
    console.error("❌ Tracking error:", error);
  }
}

// Call after order completion
trackPurchase({
  userId: "190",
  total: 99.99,
  orderId: "ORDER_12345",
  productName: "Premium Headphones",
  productId: "SKU_001",
});
```

---

## API Reference

### Track Purchase Endpoint

**Endpoint:**

```
POST /api/v1/widget/track-purchase
```

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "190",
  "order_value": 99.99,
  "order_id": "ORDER_12345",
  "shop_name": "Your Webshop",
  "public_key": "YOUR_PUBLIC_KEY",
  "timestamp": "2025-01-24T10:30:00Z",
  "product_name": "Premium Headphones",
  "product_id": "SKU_001",
  "signature": "optional_in_dev"
}
```

**Field Descriptions:**

| Field          | Type   | Required | Description                             |
| -------------- | ------ | -------- | --------------------------------------- |
| `user_id`      | string | Yes      | User ID from authentication             |
| `order_value`  | number | Yes      | Total order value in EUR                |
| `order_id`     | string | Yes      | Unique order identifier                 |
| `shop_name`    | string | Yes      | Name of the webshop                     |
| `public_key`   | string | Yes      | Widget public key                       |
| `timestamp`    | string | Yes      | ISO 8601 timestamp                      |
| `product_name` | string | No       | Product name(s)                         |
| `product_id`   | string | No       | Product SKU/ID                          |
| `signature`    | string | No\*     | HMAC signature (required in production) |

\*Signature is optional in development mode or with test keys

**Success Response (200):**

```json
{
  "success": true,
  "message": "Purchase tracked and wallet credited",
  "data": {
    "purchase_id": "ORDER_12345",
    "cashback_amount": 10.0,
    "wallet_balance": 135.5,
    "transaction_id": "tx_1705_abc123"
  }
}
```

**Error Responses:**

**400 - Missing Required Fields:**

```json
{
  "error": "Missing required fields"
}
```

**401 - Invalid Signature:**

```json
{
  "error": "Invalid signature"
}
```

**500 - Server Error:**

```json
{
  "error": "Internal server error"
}
```

### Cashback Calculation

**Formula:**

```
cashback_amount = Math.round(order_value * 0.10 * 100) / 100
```

**Examples:**

| Order Value | Calculation  | Cashback |
| ----------- | ------------ | -------- |
| €10.00      | €10 × 10%    | €1.00    |
| €99.99      | €99.99 × 10% | €10.00   |
| €249.00     | €249 × 10%   | €24.90   |
| €15.75      | €15.75 × 10% | €1.58    |
| €0.99       | €0.99 × 10%  | €0.10    |

All amounts are rounded to 2 decimal places.

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: "User not logged in"

**Symptom:**

```
❌ Purchase tracking failed - user not logged in
```

**Solution:**

1. Ensure user is logged in to Answer24
2. Check `localStorage.getItem('user_data')` exists
3. Verify auth token is valid
4. Login at: `https://localhost:3000/nl/login`

**Debug:**

```javascript
// In browser console:
const userData = localStorage.getItem("user_data");
console.log("User data:", userData ? JSON.parse(userData) : "Not logged in");
```

#### Issue 2: "Invalid signature"

**Symptom:**

```
❌ Purchase tracking failed: Invalid signature
```

**Solution:**

- **Development:** Use test public key (e.g., "test-key-123")
- **Production:** Generate proper HMAC signature

**For Testing:**
System automatically skips signature validation when:

- Running in development mode (`NODE_ENV=development`)
- Using a test key (key contains "test")

**For Production:**
Generate signature:

```javascript
const crypto = require("crypto");

function generateSignature(data, secret) {
  const payload = JSON.stringify(data);
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Use:
const signature = generateSignature(purchaseData, SIGNING_SECRET);
```

#### Issue 3: "Wallet not updated"

**Symptom:**

- Purchase tracked successfully
- But wallet balance doesn't increase

**Possible Causes:**

1. Backend wallet service not running
2. Database not configured
3. User ID mismatch

**Debug Steps:**

1. **Check backend logs:**

```bash
# Look for wallet credit logs
tail -f storage/logs/laravel.log | grep wallet
```

2. **Test backend API directly:**

```bash
curl -X POST https://localhost:8000/api/v1/wallet/credit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "190",
    "amount": 10.00,
    "type": "cashback",
    "description": "Test credit"
  }'
```

3. **Check user ID:**

```javascript
// In browser console:
const userData = JSON.parse(localStorage.getItem("user_data"));
console.log("User ID:", userData.id);
```

#### Issue 4: "API endpoint not found"

**Symptom:**

```
404 Not Found: /api/v1/widget/track-purchase
```

**Solution:**

1. Ensure Next.js server is running
2. Check file exists: `app/api/v1/widget/track-purchase/route.ts`
3. Restart development server

```bash
# Stop server (Ctrl+C) then:
npm run dev
```

#### Issue 5: "CORS Error"

**Symptom:**

```
Access to fetch at 'https://localhost:3000/...' from origin '...' has been blocked by CORS
```

**Solution:**
This happens when testing from external domains. The API needs CORS headers configured.

**Fix:** Add to `app/api/v1/widget/track-purchase/route.ts`:

```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

---

## Security

### Development vs Production

**Development Mode:**

- ✅ Signature validation skipped
- ✅ Easy testing
- ✅ Detailed logging
- ⚠️ Not secure for production

**Production Mode:**

- 🔒 Signature required
- 🔒 Domain validation
- 🔒 Rate limiting
- 🔒 Fraud prevention

### HMAC Signature Validation

**Purpose:**
Prevents fake purchases and ensures data integrity.

**How it works:**

1. **Generate signature (client):**

```javascript
const crypto = require("crypto");

const purchaseData = {
  user_id: "190",
  order_value: 99.99,
  order_id: "ORDER_12345",
  // ... other fields
};

const signature = crypto
  .createHmac("sha256", SIGNING_SECRET)
  .update(JSON.stringify(purchaseData))
  .digest("hex");

// Include signature in request
purchaseData.signature = signature;
```

2. **Validate signature (server):**

```typescript
function validatePurchaseSignature(data: any, secret: string): boolean {
  const { signature, ...payload } = data;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  return signature === expectedSignature;
}
```

### Security Best Practices

1. **Never expose signing secret** - Keep it server-side only
2. **Use HTTPS** - Encrypt data in transit
3. **Validate timestamps** - Prevent replay attacks
4. **Check order uniqueness** - Prevent duplicate credits
5. **Rate limiting** - Prevent abuse
6. **Domain whitelisting** - Control where widget can be used

---

## Examples

### Example 1: Simple E-commerce Integration

**Scenario:** User buys a product on your online store

**checkout-success.php:**

```php
<?php
// After successful payment

$order = [
    'id' => 'ORD_' . time(),
    'total' => 99.99,
    'customer_id' => $_SESSION['user_id'],
    'product' => 'Premium Headphones'
];

// Track purchase
$trackingData = [
    'user_id' => $order['customer_id'],
    'order_value' => $order['total'],
    'order_id' => $order['id'],
    'shop_name' => 'My Store',
    'public_key' => getenv('WIDGET_PUBLIC_KEY'),
    'timestamp' => date('c'),
    'product_name' => $order['product']
];

$ch = curl_init('https://localhost:3000/api/v1/widget/track-purchase');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($trackingData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);

if ($result['success']) {
    $cashback = $result['data']['cashback_amount'];
    echo "<p>🎉 You earned €{$cashback} cashback!</p>";
}
?>
```

### Example 2: WordPress WooCommerce Integration

**functions.php:**

```php
<?php
// Hook into order completion
add_action('woocommerce_order_status_completed', 'track_answer24_purchase');

function track_answer24_purchase($order_id) {
    $order = wc_get_order($order_id);

    // Get user ID (from Schepenkring.nlsession/cookie)
    $answer24_user_id = get_user_meta(
        $order->get_customer_id(),
        'answer24_user_id',
        true
    );

    if (!$answer24_user_id) {
        return; // User not linked to Answer24
    }

    // Track purchase
    $data = [
        'user_id' => $answer24_user_id,
        'order_value' => floatval($order->get_total()),
        'order_id' => $order->get_order_number(),
        'shop_name' => get_bloginfo('name'),
        'public_key' => get_option('answer24_public_key'),
        'timestamp' => date('c'),
        'product_name' => implode(', ', array_map(function($item) {
            return $item->get_name();
        }, $order->get_items()))
    ];

    $response = wp_remote_post(
        'https://localhost:3000/api/v1/widget/track-purchase',
        [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode($data)
        ]
    );

    if (!is_wp_error($response)) {
        $result = json_decode(wp_remote_retrieve_body($response), true);
        if ($result['success']) {
            // Add order note
            $cashback = $result['data']['cashback_amount'];
            $order->add_order_note(
                "Schepenkring.nlcashback credited: €{$cashback}"
            );
        }
    }
}
?>
```

### Example 3: React/Next.js Integration

**CheckoutSuccess.tsx:**

```typescript
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CheckoutSuccess() {
  const router = useRouter();
  const { orderId, total, productName } = router.query;

  useEffect(() => {
    async function trackPurchase() {
      try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

        if (!userData.id) {
          console.log("User not logged in");
          return;
        }

        // Track purchase
        const response = await fetch("/api/v1/widget/track-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData.id.toString(),
            order_value: parseFloat(total as string),
            order_id: orderId,
            shop_name: "My Next.js Store",
            public_key: process.env.NEXT_PUBLIC_WIDGET_KEY,
            timestamp: new Date().toISOString(),
            product_name: productName,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Show success toast
          alert(`🎉 You earned €${result.data.cashback_amount} cashback!`);
        }
      } catch (error) {
        console.error("Tracking error:", error);
      }
    }

    if (orderId && total) {
      trackPurchase();
    }
  }, [orderId, total, productName]);

  return (
    <div className="success-page">
      <h1>Thank You!</h1>
      <p>Your order has been confirmed</p>
      <p>Order ID: {orderId}</p>
      <p>Total: €{total}</p>
    </div>
  );
}
```

---

## Support & Resources

### Documentation Files

- **`CASHBACK_SYSTEM_DOCUMENTATION.md`** (this file) - Complete guide
- **`WIDGET_10_PERCENT_CASHBACK_TESTING.md`** - Testing guide
- **`PURCHASE_TRACKING_IMPLEMENTATION.md`** - Technical implementation
- **`WIDGET_USER_DOCUMENTATION.md`** - Widget user guide

### Test Page

```
https://localhost:3000/widget/test-purchase-tracking.html
```

### API Endpoints

**Track Purchase:**

```
POST /api/v1/widget/track-purchase
```

**Widget Settings:**

```
GET /api/v1/widget/settings?public_key=YOUR_KEY
```

**Analytics:**

```
GET /api/v1/widget/analytics?public_key=YOUR_KEY
```

### Contact Support

- **Email:** support@answer24.nl
- **Technical Support:** tech@answer24.nl
- **Documentation:** Check project documentation folder

### Reporting Issues

When reporting issues, include:

1. **Description:** What's happening?
2. **Expected:** What should happen?
3. **Steps:** How to reproduce?
4. **Browser/Environment:** Chrome? Safari? Production?
5. **Console Errors:** Press F12, copy errors
6. **API Response:** What did the API return?
7. **Screenshots:** If applicable

---

## Quick Reference

### Testing Checklist

- [ ] Server running on port 3000
- [ ] User logged in
- [ ] Test page opens
- [ ] Can make purchase
- [ ] Log shows success
- [ ] Wallet balance increases
- [ ] Transaction appears in history

### Integration Checklist

- [ ] Widget embedded on site
- [ ] Public key configured
- [ ] Tracking code added to checkout
- [ ] Tested with real purchase
- [ ] Wallet credits correctly
- [ ] User receives notification
- [ ] Analytics tracking works

### Support Checklist

- [ ] Check console for errors (F12)
- [ ] Verify user is logged in
- [ ] Test API endpoint directly
- [ ] Check backend logs
- [ ] Verify public key is correct
- [ ] Check database for transactions
- [ ] Review network tab (F12)

---

## Conclusion

The Schepenkring.nl10% Cashback System provides:

✅ **For Users:**

- Automatic cashback on purchases
- Instant wallet credits
- Easy to use

✅ **For Merchants:**

- Increased customer loyalty
- Higher conversion rates
- Simple integration

✅ **For Developers:**

- Well-documented API
- Multiple integration options
- Comprehensive testing tools

**Start testing now:**

```
https://localhost:3000/widget/test-purchase-tracking.html
```

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**© 2025 Answer24. All rights reserved.**
