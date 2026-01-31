# 🧪 API Testing Guide - Cashback System

## Quick Overview

The cashback system has 3 key API endpoints to test:

1. **Backend:** `GET /api/v1/wallet/balance` - Get current wallet balance
2. **Backend:** `POST /api/v1/wallet/add-money` - Add money to wallet (THIS IS KEY!)
3. **Frontend:** `POST /api/v1/widget/track-purchase` - Track purchase and credit wallet

---

## Test 1: Check Backend Wallet Balance

### Command:
```bash
curl -X GET \
  "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -k
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "balance": 0.00
  }
}
```

### Possible Errors:
- **401 Unauthorized:** Token is invalid
- **404 Not Found:** Endpoint doesn't exist
- **500 Server Error:** Backend issue

---

## Test 2: Check if Backend `/wallet/add-money` Endpoint Exists

### Command:
```bash
curl -X POST \
  "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "balance": 10.00
  }
}
```

### Possible Errors:
- **404 Not Found:** ⚠️ This means the endpoint is NOT implemented!
- **400 Bad Request:** Missing required fields
- **401 Unauthorized:** Token issue
- **500 Server Error:** Backend issue

### What the Response Status Means:

| Status | Meaning | Action |
|--------|---------|--------|
| 200 ✅ | OK, working | Continue to next test |
| 201 ✅ | Created, working | Continue to next test |
| 400 ⚠️ | Bad request | Check payload format |
| 401 ❌ | Unauthorized | Check token/auth |
| 404 ❌ | Not found | **Endpoint needs to be created!** |
| 500 ❌ | Server error | Check backend logs |

---

## Test 3: Check Frontend Track Purchase Endpoint

### Command:
```bash
curl -X POST \
  "http://localhost:3000/api/v1/widget/track-purchase" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "190",
    "order_value": 29.99,
    "order_id": "TEST_'$(date +%s)'",
    "shop_name": "Test Shop",
    "public_key": "webshop-key",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "product_name": "Test Product",
    "product_id": 1
  }'
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "message": "Purchase tracked successfully",
    "balance": 32.99
  }
}
```

### Possible Errors:
- **400 Bad Request:** Missing fields
- **500 Server Error:** Backend not responding
- **"Invalid signature":** Signature validation failed (but should be bypassed in dev)

---

## 🎯 Testing Strategy

### Step 1: Test Backend Endpoints FIRST
Before testing the frontend, make sure the backend endpoints work:

```bash
# Check if wallet endpoints exist
curl -X GET "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Authorization: Bearer test" -k

# Try to add money
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "user_id": 190}' -k
```

**If you get 404:** The endpoint doesn't exist and needs to be created in Laravel.

### Step 2: Check Backend Logs
```bash
# In your Laravel backend directory
tail -f storage/logs/laravel.log
```

Then run the curl commands above and watch for errors.

### Step 3: Test Frontend Route
Once backend works, test the frontend integration:

```bash
curl -X POST "http://localhost:3000/api/v1/widget/track-purchase" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "190",
    "order_value": 10.00,
    "order_id": "TEST_'$(date +%s)'",
    "shop_name": "Test",
    "public_key": "webshop-key",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

---

## 🔍 Debugging Checklist

- [ ] Backend `/api/v1/wallet/balance` returns 200
- [ ] Backend `/api/v1/wallet/add-money` returns 200 (NOT 404)
- [ ] Backend `/api/v1/wallet/add-money` updates database
- [ ] Frontend `/api/v1/widget/track-purchase` returns 200
- [ ] Frontend calls backend endpoint successfully
- [ ] Wallet balance increases after purchase

---

## 📊 What Each Response Tells Us

### Backend `/wallet/add-money` returns 404
**Problem:** Endpoint doesn't exist in Laravel
**Solution:** Create the endpoint in routes/api.php and the controller

### Backend `/wallet/add-money` returns 401
**Problem:** Authentication token is invalid
**Solution:** Use valid Bearer token

### Backend `/wallet/add-money` returns 200 but balance doesn't update
**Problem:** Endpoint exists but doesn't actually update database
**Solution:** Check the controller logic

### Frontend `/api/v1/widget/track-purchase` returns 500
**Problem:** Frontend can't reach or communicate with backend
**Solution:** Check CORS, check backend URL, check backend running

### Frontend `/api/v1/widget/track-purchase` returns 200 but wallet doesn't update
**Problem:** Frontend succeeds but backend endpoint fails
**Solution:** Check backend logs for `/wallet/add-money` errors

---

## 🚀 Run the Test Script

```bash
cd /Users/tg/Herd/answer24_frontend
bash TEST_API_MANUALLY.sh
```

Then send me the output!

