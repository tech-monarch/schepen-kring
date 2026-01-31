# 🛒 Webshop 10% Cashback - Complete Testing Guide

**Version:** 1.0  
**Created:** January 2025  
**Status:** ✅ READY TO TEST

---

## 📋 Quick Checklist - What Should Work

- ✅ Webshop page loads with demo products
- ✅ "View My Wallet" button works (no 404)
- ✅ Can click on any product to see details
- ✅ Can select Size, Color, Quantity
- ✅ "Buy Now" button tracks purchase
- ✅ See cashback notifications after purchase
- ✅ Wallet balance increases
- ✅ Transaction appears in wallet history

---

## 🚀 STEP-BY-STEP TESTING

### STEP 1: Open Webshop
**URL:** https://answer24.nl/en/webshop

**You should see:**
- Webshop list with logos
- "Up to X% Cashback" badges on each store
- Search/filter options
- Sign in button (top right)

✅ If visible → Continue!

---

### STEP 2: Login Check
**Top right corner:**
- See your name/profile? → ✅ Logged in!
- See "Sign In"? → Click to login first

---

### STEP 3: Test "View My Wallet" Button
**Location:** Below "Cashback Webshops" heading

**Click it:**
1. Should go to wallet page
2. URL should be: https://answer24.nl/en/dashboard/wallet
3. Should NOT show 404 error

✅ If works → No 404!

---

### STEP 4: Click a Demo Product
**Pick any product:**
- AliExpress
- Alibaba  
- 500Cosmetics
- Emma Mattress
- Webshopvoorhonden.nl

**Example: Click AliExpress**

**You should see:**
- Product details page
- Price: €299.99
- Badge: "10% Cashback"
- Size/Color/Quantity options
- "Buy Now" button

✅ If visible → Product page loaded!

---

### STEP 5: Select Options
1. **Size:** Click "M" (should highlight)
2. **Color:** Click "Blue" (should highlight)
3. **Quantity:** Keep at 1 (or click + to increase)

---

### STEP 6: Click "Buy Now"
**The most important step!**

**After clicking, watch for notifications...**

---

### STEP 7: See Notifications 🔔

**You should see TWO notifications:**

#### Notification 1 (Green):
```
🎉 Purchase confirmed! You earned €30.00 cashback!
```

#### Notification 2 (Blue):
```
💰 €30.00 has been added to your wallet!
```

✅ If you see both → CASHBACK WORKING! 🎊

---

## 💰 Expected Cashback Amounts

| Product | Price | Quantity | Cashback |
|---------|-------|----------|----------|
| AliExpress | €299.99 | 1 | **€30.00** |
| AliExpress | €299.99 | 2 | **€60.00** |
| Alibaba | €249.00 | 1 | **€24.90** |
| 500Cosmetics | €199.99 | 1 | **€20.00** |
| Emma Mattress | €399.99 | 1 | **€40.00** |

---

## ✅ Verify Wallet

**After purchase:**

1. Go to: https://answer24.nl/en/dashboard/wallet
2. Check balance increased
3. Look for new transaction in history
4. Should show purchase details

✅ If balance increased → SUCCESS!

---

## 📝 Summary

**This is what should happen:**

1. Open webshop → ✅ See products
2. Click product → ✅ See details
3. Select options → ✅ Buttons highlighted
4. Click "Buy Now" → ✅ No errors
5. See green notification → ✅ Cashback amount shown
6. See blue notification → ✅ Wallet credit confirmed
7. Open wallet → ✅ Balance increased
8. Check history → ✅ Transaction recorded

---

**Test URL:** https://answer24.nl/en/webshop

**Go test it now! 🚀**
