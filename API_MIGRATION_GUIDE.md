# API URL Migration Guide

## Overview

This guide helps you migrate from hardcoded API URLs to a centralized configuration using environment variables.

## What I've Done

### 1. Created Centralized API Configuration

- **File**: `lib/api-config.ts`
- **Purpose**: Centralized configuration for all API endpoints
- **Features**:
  - Environment variable support (`NEXT_PUBLIC_API_BASE_URL`)
  - Fallback to default URL
  - Helper functions for common operations
  - Organized endpoint definitions

### 2. Updated Key Files

I've already updated these files to use the centralized configuration:

- ✅ `app/[locale]/actions/avatar.ts`
- ✅ `app/[locale]/actions/faq.ts`
- ✅ `app/[locale]/actions/blog.ts`
- ✅ `app/actions/notificationActions.ts`

### 3. Created Migration Script

- **File**: `scripts/update-api-urls.js`
- **Purpose**: Automatically update remaining files

## How to Complete the Migration

### Step 1: Set Your Environment Variable

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api/v1
```

### Step 2: Run the Migration Script

```bash
node scripts/update-api-urls.js
```

### Step 3: Manual Updates (if needed)

Some files may need manual updates. Here are the patterns to look for:

#### Replace hardcoded URLs:

```typescript
// OLD
const API_BASE_URL = "https://kring.answer24.nl/api/v1";
const response = await fetch(`${API_BASE_URL}/endpoint`);

// NEW
import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";
const response = await fetch(getApiUrl("/endpoint"));
```

#### Replace environment variable usage:

```typescript
// OLD
process.env.NEXT_PUBLIC_API_BASE_URL || "https://kring.answer24.nl/api/v1";

// NEW
API_CONFIG.BASE_URL;
```

## Files That Need Updates

Based on my analysis, these files still have hardcoded URLs:

### Components

- `components/pricing/Pricing.tsx`
- `components/plans/PaymentModal.tsx`
- `components/dashboard/account/Security.tsx`
- `components/dashboard/account/Profile.tsx`
- `components/dashboard/account/Billing.tsx`
- `components/dashboard/Container.tsx`

### Pages

- `auth/google/callback/page.tsx`
- `app/[locale]/wallet/page.tsx`
- `app/[locale]/signup/page.tsx`
- `app/[locale]/login/page.tsx`
- `app/[locale]/reset-password/page.tsx`
- `app/[locale]/signup /page.tsx`
- `app/[locale]/forgot-password/page.tsx`
- `app/[locale]/dashboard/wallet/page.tsx`
- `app/[locale]/dashboard/admin/users/page.tsx`
- `app/[locale]/(cashback)/webshop/page.tsx`

### Actions

- `app/[locale]/actions/blog-utils.ts`

## Benefits of This Approach

1. **Single Source of Truth**: All API URLs in one place
2. **Environment Flexibility**: Easy to switch between dev/staging/prod
3. **Type Safety**: TypeScript support for endpoints
4. **Maintainability**: Easy to update URLs across the entire app
5. **Consistency**: Standardized headers and error handling

## Testing Your Changes

1. **Set your environment variable**:

   ```bash
   echo "NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api/v1" > .env.local
   ```

2. **Restart your development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Test API calls** to ensure they're using your new URL

## Troubleshooting

### Common Issues:

1. **Import errors**: Make sure the import path is correct: `@/lib/api-config`
2. **TypeScript errors**: Check that you're using the correct types
3. **Environment variable not loading**: Restart your dev server after adding `.env.local`

### Verification:

Check that your API calls are using the new URL by:

1. Opening browser dev tools
2. Going to Network tab
3. Making API calls
4. Verifying the requests go to your configured URL

## Next Steps

1. Run the migration script
2. Test your application thoroughly
3. Update your deployment environment variables
4. Remove any remaining hardcoded URLs manually

## Support

If you encounter issues:

1. Check the console for TypeScript errors
2. Verify your environment variable is set correctly
3. Ensure all imports are correct
4. Test API calls in the browser dev tools
