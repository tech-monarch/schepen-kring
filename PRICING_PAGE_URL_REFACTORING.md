# Pricing Page URL Refactoring Summary

## Overview

Successfully refactored the pricing page and payment modal to use centralized API configuration from `NEXT_PUBLIC_API_BASE_URL` instead of hardcoded URLs.

## Issues Found

### 1. **Pricing Component** (`components/pricing/Pricing.tsx`)

- **Issue**: Hardcoded URL on line 55
  ```typescript
  const pricingEndpoint = "https://api.answer24.nl/api/v1/plan";
  ```

### 2. **Payment Modal** (`components/plans/PaymentModal.tsx`)

- **Issue**: Hardcoded URL on line 73
  ```typescript
  const response = await fetch(
    "https://api.answer24.nl/api/v1/wallet/deposit"
    // ...
  );
  ```

## Changes Made

### 1. Pricing Component (`components/pricing/Pricing.tsx`)

**Added Import:**

```typescript
import { getApiUrl, API_CONFIG } from "@/lib/api-config";
```

**Replaced Hardcoded URL:**

```typescript
// BEFORE
const pricingEndpoint = "https://api.answer24.nl/api/v1/plan";
const response = await fetch(pricingEndpoint, {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// AFTER
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PLAN.LIST), {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
```

### 2. Payment Modal (`components/plans/PaymentModal.tsx`)

**Added Import:**

```typescript
import { getApiUrl, API_CONFIG } from "@/lib/api-config";
```

**Replaced Hardcoded URL:**

```typescript
// BEFORE
const response = await fetch("https://api.answer24.nl/api/v1/wallet/deposit", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(requestPayload),
});

// AFTER
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.WALLET.DEPOSIT), {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(requestPayload),
});
```

## API Endpoints Used

### From API Config (`lib/api-config.ts`)

1. **PLAN.LIST** → `/plan`

   - Used for: Fetching pricing tiers
   - Method: GET
   - Component: Pricing.tsx

2. **WALLET.DEPOSIT** → `/wallet/deposit`
   - Used for: Creating payment/deposit
   - Method: POST
   - Component: PaymentModal.tsx

## Benefits

✅ **Centralized Configuration**: All URLs now come from `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
✅ **Environment Flexibility**: Easy to switch between dev/staging/production
✅ **Consistency**: All API calls follow the same pattern
✅ **Maintainability**: Single source of truth for API endpoints
✅ **Type Safety**: TypeScript autocomplete for endpoints
✅ **No Hardcoded URLs**: Removed all static backend URLs from the pricing page

## Testing Checklist

- [ ] Visit `/en/pricing` page
- [ ] Verify pricing plans load correctly
- [ ] Click on a plan (logged in)
- [ ] Verify payment modal opens
- [ ] Check browser network tab to confirm API calls use correct base URL
- [ ] Test with different `NEXT_PUBLIC_API_BASE_URL` values
- [ ] Verify fallback pricing data works if API fails
- [ ] Test plan selection flow for logged-in users
- [ ] Test plan selection flow for non-logged-in users

## Files Modified

1. ✅ `components/pricing/Pricing.tsx`
2. ✅ `components/plans/PaymentModal.tsx`

## Linting Status

✅ No linting errors found in both files

## Environment Variable Required

Ensure `.env.local` contains:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.answer24.nl/api/v1
```

Or for local development:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Complete API Flow

```
User visits /en/pricing
       ↓
Pricing.tsx calls getApiUrl(API_CONFIG.ENDPOINTS.PLAN.LIST)
       ↓
API Config reads process.env.NEXT_PUBLIC_API_BASE_URL
       ↓
Constructs: ${NEXT_PUBLIC_API_BASE_URL}/plan
       ↓
Fetches pricing data from backend
       ↓
User selects plan → PaymentModal opens
       ↓
PaymentModal calls getApiUrl(API_CONFIG.ENDPOINTS.WALLET.DEPOSIT)
       ↓
Constructs: ${NEXT_PUBLIC_API_BASE_URL}/wallet/deposit
       ↓
Creates payment on backend
```

## Summary

✨ **All hardcoded URLs on the pricing page have been successfully removed and replaced with centralized API configuration!**

The pricing page (`http://localhost:3000/en/pricing`) now correctly uses `NEXT_PUBLIC_API_BASE_URL` from your environment variables for all API calls.
