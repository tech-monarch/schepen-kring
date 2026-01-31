# 🔧 Step-by-Step Cashback Debugging

## The Issue: Wallet Shows €0 After Purchase

This means:
- Frontend is NOT showing the error ❌
- Frontend IS making the API call (probably) ✓
- Backend is NOT crediting the wallet ❌

## Where The Problem Is

The cashback flow:
```
Frontend "Buy Now" clicked
    ↓
POST /api/v1/widget/track-purchase
    ↓
Backend calls /api/v1/wallet/add-money
    ↓
Should credit user wallet
    ↓
Wallet balance should increase
```

**If wallet is still €0, the problem is in step 3 or 4**

---

## 🧪 Test 1: Frontend Is Working?

**Step 1:** Open http://localhost:3000/nl/webshop/1

**Step 2:** Open Developer Tools (F12)

**Step 3:** Go to Console tab

**Step 4:** Clear it (click trash)

**Step 5:** Click "Buy Now"

**Step 6:** Look for messages starting with 🛒

### What You Should See:

```
🛒 BUY NOW CLICKED!
💰 Price calculation: €299.99 × 10% = €30.00
👤 User data: {id: 190, ...}
📤 Sending purchase tracking request...
```

**If you see these:** Frontend is working ✓
**If you don't:** Frontend issue - refresh and try again

---

## 🧪 Test 2: API Is Being Called?

**Step 1:** Keep DevTools open

**Step 2:** Click "Network" tab

**Step 3:** Refresh page

**Step 4:** Click "Buy Now"

**Step 5:** Look for "track-purchase" request

### What You Should See:

- Request to: `/api/v1/widget/track-purchase`
- Method: `POST`
- Status: `200` (or check if error)

**If Status is 200:**
- Click the request
- Click "Response" tab
- You should see: `{"success": true, "data": {...}}`

**If Status is NOT 200:**
- Take a screenshot
- Send me the error response

---

## 🧪 Test 3: Backend Endpoint Works?

The real issue is probably that the backend endpoint is not implemented.

**Check the backend:**

Is the endpoint `/api/v1/wallet/add-money` implemented in Laravel?

### Laravel Check:

```bash
# In your Laravel backend, check routes:
php artisan route:list | grep wallet
```

Should show something like:
```
POST  /api/v1/wallet/add-money   Endpoint\Controller@addMoney
```

**If you don't see it:** The endpoint needs to be created!

---

## 🔍 What To Check in Backend

The backend needs:

1. **Route:** POST `/api/v1/wallet/add-money`
2. **Controller Method:** That accepts `amount` and `user_id`
3. **Logic:** Updates user wallet balance in database
4. **Response:** Returns `{"success": true, "data": {...}}`

### Example Laravel Code:

```php
// In routes/api.php
Route::post('/wallet/add-money', [WalletController::class, 'addMoney']);

// In WalletController.php
public function addMoney(Request $request) {
    $amount = $request->input('amount');
    $userId = $request->input('user_id');
    
    // Update wallet in database
    $user = User::find($userId);
    $user->wallet_balance += $amount;
    $user->save();
    
    return response()->json([
        'success' => true,
        'data' => ['balance' => $user->wallet_balance]
    ]);
}
```

---

## ✅ Complete Debugging Checklist

- [ ] Opened console and saw 🛒 BUY NOW CLICKED!
- [ ] Opened Network tab and saw track-purchase request
- [ ] track-purchase request status is 200
- [ ] Backend endpoint `/api/v1/wallet/add-money` exists (check with `route:list`)
- [ ] Backend endpoint is being called (check backend logs)
- [ ] Backend is updating the database (check wallet_balance column)
- [ ] Frontend `/wallet/balance` endpoint returns updated balance
- [ ] Wallet page refreshes and shows new balance

---

## 🎯 Most Likely Problem

**The backend endpoint `/api/v1/wallet/add-money` is probably NOT IMPLEMENTED**

### How to Fix:

1. Check if the endpoint exists in Laravel routes
2. If not, create it
3. Make sure it:
   - Accepts `amount` and `user_id`
   - Updates user wallet in database
   - Returns JSON response with success and new balance
   - Is properly authenticated

---

## 🚀 What To Do Now

### OPTION A: Check Frontend (Quick)

1. Open F12 Console
2. Click "Buy Now"
3. Copy the console output
4. Send to me

### OPTION B: Check Backend (If Frontend Works)

1. Check if `/api/v1/wallet/add-money` endpoint exists
2. Check Laravel routes: `php artisan route:list | grep wallet`
3. Tell me what you see

### OPTION C: Check Backend Logs

1. Run: `tail -f storage/logs/laravel.log`
2. Click "Buy Now" on frontend
3. Check what error appears in backend logs

---

## 📝 Send Me This Info:

1. **Console Output:** Full text with all 🛒 💰 📤 messages
2. **Network Status:** What is the status of track-purchase request? (200, 400, 500?)
3. **Backend Routes:** Output of `php artisan route:list | grep wallet`
4. **Backend Logs:** Any errors when you click "Buy Now"?
5. **Current Balance:** What does wallet show? (€0?)

This will help me pinpoint exactly where the issue is!

