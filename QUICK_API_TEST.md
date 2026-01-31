# ⚡ Quick API Test Commands

Copy and paste these commands to test the cashback API:

---

## 🔴 CRITICAL TEST: Backend Wallet Add-Money Endpoint

This is the MOST IMPORTANT test. If this returns 404, the endpoint doesn't exist!

```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k -v
```

### What to Look For:
- `< HTTP/1.1 200` = ✅ Endpoint exists and works
- `< HTTP/1.1 404` = ❌ Endpoint NOT implemented
- `< HTTP/1.1 401` = ⚠️ Auth issue
- `< HTTP/1.1 500` = ⚠️ Server error

---

## Test: Backend Balance Endpoint

```bash
curl -X GET "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -k -v
```

---

## Test: Frontend Track Purchase (If frontend is running)

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

## 📊 Expected Responses

### Success Response (200):
```json
{
  "success": true,
  "data": {
    "balance": 10.00,
    "transaction_id": "tx_123456"
  }
}
```

### Error Response (404):
```json
{
  "message": "Not Found"
}
```

### Error Response (401):
```json
{
  "message": "Unauthenticated"
}
```

---

## 🎯 What To Do

1. **Run the CRITICAL TEST first**
2. **Tell me the HTTP status code** (200, 404, 401, 500, etc)
3. **Tell me the response body** (success message or error)
4. **Based on that, I'll know exactly what to fix**

---

## ⚠️ Common Issues

| Status | Problem | Solution |
|--------|---------|----------|
| 404 | Endpoint doesn't exist | Create `/wallet/add-money` route in Laravel |
| 401 | Token invalid | Use correct Bearer token |
| 500 | Server error | Check backend logs with `tail -f storage/logs/laravel.log` |
| 200 but wallet shows €0 | Endpoint exists but not updating DB | Check controller logic |

