# ⚡ Quick Start - Test Your Cashback System NOW

## 🎯 What You Need to Do (5 Minutes)

### Step 1: Test Backend Wallet Endpoint (2 minutes)

Open your terminal and run:

```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k -v
```

**Look for the HTTP status line that says:**

- `< HTTP/1.1 200` or `< HTTP/1.1 201` = ✅ Good!
- `< HTTP/1.1 404` = ❌ Endpoint doesn't exist
- `< HTTP/1.1 401` = ⚠️ Auth issue
- `< HTTP/1.1 500` = ⚠️ Server error

---

### Step 2: Copy the Entire Output

From terminal, copy everything you see (including headers and response).

---

### Step 3: Tell Me What You See

Send me:

1. The **HTTP status** (e.g., `< HTTP/1.1 200`)
2. The **response body** (the JSON at the bottom)
3. Any **error messages** (in red)

---

## 📝 Example Outputs

### Good Response (HTTP 200):

```
< HTTP/1.1 200 OK
< Content-Type: application/json

{
  "success": true,
  "data": {
    "balance": 10.00,
    "transaction_id": "tx_123456"
  }
}
```

### Bad Response (HTTP 404):

```
< HTTP/1.1 404 Not Found
< Content-Type: application/json

{
  "message": "Not Found"
}
```

### Bad Response (HTTP 401):

```
< HTTP/1.1 401 Unauthorized
< Content-Type: application/json

{
  "message": "Unauthenticated"
}
```

---

## 🚀 What Happens After You Test

### If Status is 200 ✅

- The endpoint exists and works
- The issue is likely something else
- I'll help debug the next steps

### If Status is 404 ❌

- The endpoint is **NOT IMPLEMENTED** in your Laravel backend
- You need to create it in `routes/api.php` and the controller
- I'll provide the exact code to add

### If Status is 401 ⚠️

- Your Bearer token is invalid or expired
- Check your backend authentication setup
- Or we need to use the correct token

### If Status is 500 ⚠️

- Backend has an error
- Check backend logs: `tail -f storage/logs/laravel.log`
- Send me the error from logs

---

## 📞 Send Me This:

Just reply with:

```
HTTP Status: 200 (or 404, 401, 500, etc.)
Response: [paste the JSON response]
```

That's it! I'll know exactly what to fix.

---

## 🆘 Can't Run curl?

No problem, try one of these:

### Using Postman

1. Open Postman
2. Create new POST request
3. URL: `https://answer24_backend.test/api/v1/wallet/add-money`
4. Headers:
   - Authorization: `Bearer test-token`
   - Content-Type: `application/json`
5. Body (raw JSON):

```json
{
  "amount": 10.0,
  "user_id": 190
}
```

6. Click Send
7. Tell me the response status and body

### Using Browser (Advanced)

1. Open DevTools (F12)
2. Go to Network tab
3. Go to Console tab
4. Paste this:

```javascript
fetch("https://answer24_backend.test/api/v1/wallet/add-money", {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: "Bearer test-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 10, user_id: 190 }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

5. Press Enter
6. Copy what you see

---

## ⏰ Timeline

| Time  | What Happens                     |
| ----- | -------------------------------- |
| Now   | You run the test                 |
| 1 min | You get the result               |
| 2 min | You tell me                      |
| 3 min | I tell you exactly how to fix it |

Let's go! 🚀
