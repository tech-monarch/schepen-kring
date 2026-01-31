# ✅ API Testing with Correct Base URL

## Your Actual Environment Configuration

From your `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=https://answer24_backend.test/api/v1
```

---

## 🎯 Correct API Test Commands

### Test 1: Check Backend Wallet Add-Money Endpoint (CRITICAL!)

```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k -v
```

**Look for the HTTP status line:**
- `< HTTP/1.1 200` ✅ Success - endpoint exists
- `< HTTP/1.1 404` ❌ Not found - endpoint doesn't exist
- `< HTTP/1.1 401` ⚠️ Unauthorized - auth issue
- `< HTTP/1.1 500` ⚠️ Server error

---

### Test 2: Check Backend Wallet Balance Endpoint

```bash
curl -X GET "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -k -v
```

---

### Test 3: Check Frontend Track Purchase Endpoint (on localhost)

```bash
curl -X POST "http://localhost:3000/api/v1/widget/track-purchase" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "190",
    "order_value": 50.00,
    "order_id": "TEST_'$(date +%s)'",
    "shop_name": "Test Shop",
    "public_key": "webshop-key",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' -v
```

---

## 📊 Complete Flow Using Your URLs

```
1. User clicks "Buy Now" on http://localhost:3000/nl/webshop/1
   ↓
2. Frontend POST to: http://localhost:3000/api/v1/widget/track-purchase
   ↓
3. Frontend Route then calls: https://answer24_backend.test/api/v1/wallet/add-money
   ↓
4. If successful, wallet is credited
   ↓
5. User checks: http://localhost:3000/nl/dashboard/wallet
   ↓
6. Wallet page fetches: https://answer24_backend.test/api/v1/wallet/balance
```

---

## 🚀 Quick Reference

| Endpoint | URL |
|----------|-----|
| Add Money to Wallet | `https://answer24_backend.test/api/v1/wallet/add-money` |
| Get Wallet Balance | `https://answer24_backend.test/api/v1/wallet/balance` |
| Track Purchase | `http://localhost:3000/api/v1/widget/track-purchase` |

---

## 🎯 What To Do Now

Run Test 1 (the critical one):

```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k -v
```

Then tell me:
1. **HTTP Status** (the line like `< HTTP/1.1 200`)
2. **Response Body** (the JSON at the end)

This will immediately tell us if the backend endpoint exists! 🎯

