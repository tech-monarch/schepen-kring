# 🔄 Complete Cashback Flow Diagram

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
│                   http://localhost:3000                         │
└─────────────────────────────────────────────────────────────────┘

1. User opens webshop product page
   http://localhost:3000/nl/webshop/1

                       ⬇️

2. User clicks "Buy Now" button
   File: app/[locale]/(cashback)/webshop/[id]/WebshopDetailClient.tsx
   Function: handleBuyNow()

                       ⬇️

3. Frontend calculates cashback (10% of price)
   Example: €100 × 10% = €10

                       ⬇️

4. Frontend sends POST to track-purchase
   🌐 http://localhost:3000/api/v1/widget/track-purchase
   
   Request Body:
   {
     "user_id": "190",
     "order_value": 100.00,
     "order_id": "WEBSHOP_1234567890",
     "shop_name": "AliExpress",
     "public_key": "webshop-key",
     "timestamp": "2024-10-24T12:34:56Z",
     "product_name": "Red Shirt - Size M",
     "product_id": 1
   }

                       ⬇️

5. Frontend Route Processes Request
   File: app/api/v1/widget/track-purchase/route.ts
   
   ✅ Validates required fields
   ✅ Skips signature validation (dev mode)
   ✅ Calculates 10% cashback
   ✅ Calls: creditUserWallet()

                       ⬇️

6. Frontend Calls Backend Wallet Endpoint
   🌐 POST https://answer24_backend.test/api/v1/wallet/add-money
   
   Headers:
   - Authorization: Bearer {serverToken}
   - Content-Type: application/json
   
   Body:
   {
     "amount": 10.00,
     "description": "cashback: Cashback from AliExpress purchase",
     "user_id": "190",
     "order_id": "WEBSHOP_1234567890",
     "shop_name": "AliExpress"
   }

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel)                            │
│              https://answer24_backend.test                      │
└─────────────────────────────────────────────────────────────────┘

7. Backend Wallet Endpoint Processes
   Route: POST /api/v1/wallet/add-money
   
   ⚠️ THIS ENDPOINT MUST EXIST!
   
   Expected Actions:
   ✅ Authenticate request with Bearer token
   ✅ Find user by user_id (190)
   ✅ Update user wallet_balance in database
   ✅ Create transaction record
   ✅ Return success response

                       ⬇️

8. Backend Returns Response
   {
     "success": true,
     "data": {
       "balance": 10.00,
       "transaction_id": "tx_123456"
     }
   }

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
└─────────────────────────────────────────────────────────────────┘

9. Frontend Receives Success Response
   ✅ Shows toast: "🎉 Purchase confirmed! You earned €10 cashback!"
   ✅ Shows toast: "💰 €10 has been added to your wallet!"

                       ⬇️

10. User Navigates to Wallet Page
    http://localhost:3000/nl/dashboard/wallet

                       ⬇️

11. Wallet Page Fetches Balance
    GET https://answer24_backend.test/api/v1/wallet/balance
    
    Expected Response:
    {
      "success": true,
      "data": {
        "balance": 10.00
      }
    }

                       ⬇️

12. ✅ SUCCESS: Wallet Shows €10.00
```

---

## 🔍 Where The Problem Is (Wallet Still Shows €0)

### Scenario A: No Console Errors at All
- ❌ Backend endpoint `/api/v1/wallet/add-money` doesn't exist (returns 404)
- ❌ Backend returns success but doesn't actually update database
- ✅ Fix: Check if route exists in `routes/api.php`

### Scenario B: Console Shows "Invalid signature"
- ❌ Signature validation is failing in development mode
- ✅ Fix: Already fixed in code, but verify `isDevelopment` check works

### Scenario C: Console Shows "Backend not reachable"
- ❌ Backend server not running or wrong URL
- ❌ CORS issue between frontend and backend
- ✅ Fix: Ensure backend running, check CORS headers

### Scenario D: Frontend returns 200 but wallet is €0
- ❌ Response from backend shows 200 but balance doesn't change
- ❌ Endpoint exists but controller doesn't update database
- ✅ Fix: Check the controller logic in Laravel

---

## 📁 Files Involved in Cashback Flow

### Frontend Files

| File | Function |
|------|----------|
| `app/[locale]/(cashback)/webshop/[id]/WebshopDetailClient.tsx` | Displays product, handles "Buy Now" click |
| `app/api/v1/widget/track-purchase/route.ts` | Receives purchase event, calls backend wallet endpoint |
| `app/[locale]/dashboard/wallet/WalletPageClient.tsx` | Displays wallet balance by calling `/wallet/balance` |
| `lib/api-config.ts` | API configuration and endpoints |

### Backend Files (Laravel)

| File | Function |
|------|----------|
| `routes/api.php` | Must have: `POST /api/v1/wallet/add-money` route |
| `WalletController.php` | Must implement: `addMoney()` method |
| `User` Model | Must have: `wallet_balance` column |
| `Transaction` Model | Track all wallet transactions |

---

## ✅ Debugging Checklist

- [ ] Frontend `/api/v1/widget/track-purchase` route exists and responds with 200
- [ ] Frontend route calls backend with correct headers and auth
- [ ] Backend `/api/v1/wallet/add-money` route exists
- [ ] Backend route is authenticated (checks Bearer token)
- [ ] Backend route updates `users.wallet_balance` in database
- [ ] Backend returns `{"success": true}` response
- [ ] Frontend `/dashboard/wallet` calls `GET /api/v1/wallet/balance`
- [ ] Wallet balance shows updated amount (€10 instead of €0)

---

## 🎯 Most Likely Problem

**The backend endpoint `/api/v1/wallet/add-money` is probably NOT IMPLEMENTED**

If you run:
```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "user_id": 190}' -k -v
```

And you get:
```
< HTTP/1.1 404 Not Found
```

Then the endpoint needs to be created in Laravel.

---

## 🚀 How to Test

### Step 1: Test Backend Endpoint Exists
```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' -k -v
```

### Step 2: Check HTTP Status
- 200/201 = ✅ Endpoint exists
- 404 = ❌ Endpoint doesn't exist
- 401 = ⚠️ Auth issue
- 500 = ⚠️ Server error

### Step 3: Check Backend Logs
```bash
tail -f storage/logs/laravel.log
```

### Step 4: Verify Database Update
Check if `users` table `wallet_balance` column was updated.

