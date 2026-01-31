# 🎯 Cashback Testing & Debugging Index

## 🚨 Problem
Your wallet shows €0 even after successful purchases. Cashback is not being credited.

---

## 📚 Documentation Files Created

### 🌟 START HERE (Pick One)

**Option 1: Quick Test (5 minutes)**
- **File:** `TESTING_GUIDE_QUICK_START.md`
- **What it does:** One curl command to confirm the problem
- **Best for:** Getting immediate diagnosis

**Option 2: Issue Analysis (10 minutes)**
- **File:** `CASHBACK_ISSUE_SUMMARY.md`
- **What it does:** Root cause analysis + solution with code
- **Best for:** Understanding the problem and exact fix

**Option 3: Complete Walkthrough (30 minutes)**
- **File:** `CASHBACK_FLOW_DIAGRAM.md`
- **What it does:** Visual flow of entire cashback system
- **Best for:** Understanding how everything works

---

### 🔧 Testing & Debugging

| File | Purpose |
|------|---------|
| `QUICK_API_TEST.md` | 3 simple curl commands to test endpoints |
| `API_TEST_GUIDE.md` | Comprehensive API reference with all details |
| `DEBUG_CASHBACK_STEP_BY_STEP.md` | Step-by-step debugging guide |
| `TEST_API_MANUALLY.sh` | Bash script to test all endpoints (run: `bash TEST_API_MANUALLY.sh`) |

### 📖 Reference & Documentation

| File | Purpose |
|------|---------|
| `CASHBACK_SYSTEM_DOCUMENTATION.md` | Complete system documentation |
| `CASHBACK_DEBUGGING_GUIDE.md` | Debugging guide for common issues |
| `WIDGET_10_PERCENT_CASHBACK_TESTING.md` | Widget-specific cashback testing |
| `WEBSHOP_CASHBACK_TESTING_GUIDE.md` | Webshop cashback testing |
| `WIDGET_TESTING_GUIDE.md` | Complete widget testing guide |

---

## 🎯 Recommended Action Path

```
1. Read: TESTING_GUIDE_QUICK_START.md
   ↓
2. Run: curl command (takes 1 minute)
   ↓
3. Check HTTP Status:
   
   ✅ HTTP 200? → Read: DEBUG_CASHBACK_STEP_BY_STEP.md
   ❌ HTTP 404? → Read: CASHBACK_ISSUE_SUMMARY.md (endpoint missing!)
   ⚠️ HTTP 401? → Check authentication
   ⚠️ HTTP 500? → Check backend logs
```

---

## 📊 What Each HTTP Status Means

| Status | Meaning | Action |
|--------|---------|--------|
| 200 ✅ | Endpoint exists and works | Dig deeper, might be DB issue |
| 201 ✅ | Created successfully | Same as 200 |
| 400 ⚠️ | Bad request | Check request payload format |
| 401 ❌ | Unauthorized | Check Bearer token |
| 404 ❌ | Endpoint doesn't exist | **CREATE IT!** (See CASHBACK_ISSUE_SUMMARY.md) |
| 500 ❌ | Server error | Check backend logs |

---

## 🔴 Most Likely Problem (95% Probability)

**Backend endpoint `/api/v1/wallet/add-money` is NOT IMPLEMENTED**

### Quick Fix Steps:

1. Run this curl command:
```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "user_id": 190}' \
  -k -v 2>&1 | grep "< HTTP"
```

2. If you see `< HTTP/1.1 404`:
   - Read `CASHBACK_ISSUE_SUMMARY.md`
   - Follow the "Solution" section
   - Copy the Laravel code provided
   - Add it to your backend

3. If you see `< HTTP/1.1 200`:
   - Read `DEBUG_CASHBACK_STEP_BY_STEP.md`
   - Check console logs, network tab, backend database

---

## 📞 Before You Ask For Help

Make sure you've:

1. ✅ Read: `TESTING_GUIDE_QUICK_START.md`
2. ✅ Run the curl command
3. ✅ Told me the HTTP status
4. ✅ Told me the response body

With this info, I can give you the exact fix in minutes!

---

## 🚀 Quick Commands

### Test Backend Wallet Endpoint
```bash
curl -X POST "https://answer24_backend.test/api/v1/wallet/add-money" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "user_id": 190}' \
  -k -v
```

### Test Backend Balance
```bash
curl -X GET "https://answer24_backend.test/api/v1/wallet/balance" \
  -H "Authorization: Bearer test-token" -k -v
```

### Test Frontend Track Purchase
```bash
curl -X POST "http://localhost:3000/api/v1/widget/track-purchase" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "190", "order_value": 50, "order_id": "TEST123", "shop_name": "Test"}'
```

---

## ✅ Quick Checklist

- [ ] Read `TESTING_GUIDE_QUICK_START.md`
- [ ] Run the curl command
- [ ] Got HTTP status (200, 404, 401, 500)
- [ ] Have response body
- [ ] Ready to tell me results

**Next:** Message me with your findings!

