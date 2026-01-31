#!/usr/bin/env node

/**
 * Script to update hardcoded API URLs to use the centralized configuration
 * Run this script to automatically update all files with hardcoded URLs
 */

const fs = require("fs");
const path = require("path");

// Files that need to be updated (based on the grep results)
const filesToUpdate = [
  "components/pricing/Pricing.tsx",
  "components/plans/PaymentModal.tsx",
  "components/dashboard/account/Security.tsx",
  "components/dashboard/account/Profile.tsx",
  "components/dashboard/account/Billing.tsx",
  "components/dashboard/Container.tsx",
  "auth/google/callback/page.tsx",
  "app/[locale]/wallet/page.tsx",
  "app/[locale]/signup/page.tsx",
  "app/[locale]/login/page.tsx",
  "app/[locale]/reset-password/page.tsx",
  "app/[locale]/signup /page.tsx",
  "app/[locale]/forgot-password/page.tsx",
  "app/[locale]/dashboard/wallet/page.tsx",
  "app/[locale]/dashboard/admin/users/page.tsx",
  "app/[locale]/(cashback)/webshop/page.tsx",
  "app/[locale]/actions/blog-utils.ts",
];

// Import statement to add
const importStatement = `import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";`;

// Patterns to replace
const replacements = [
  {
    pattern:
      /const\s+API_BASE_URL\s*=\s*process\.env\.NEXT_PUBLIC_API_BASE_URL\s*\|\|\s*"https:\/\/answer24\.laravel\.cloud\/api\/v1";?/g,
    replacement: "",
  },
  {
    pattern:
      /const\s+BASE_URL\s*=\s*"https:\/\/answer24\.laravel\.cloud\/api\/v1";?/g,
    replacement: "",
  },
  {
    pattern:
      /process\.env\.NEXT_PUBLIC_API_BASE_URL\s*\|\|\s*"https:\/\/answer24\.laravel\.cloud\/api\/v1"/g,
    replacement: "API_CONFIG.BASE_URL",
  },
  {
    pattern: /"https:\/\/answer24\.laravel\.cloud\/api\/v1"/g,
    replacement: "API_CONFIG.BASE_URL",
  },
  {
    pattern: /`\$\{process\.env\.NEXT_PUBLIC_API_BASE_URL\}/g,
    replacement: "`${API_CONFIG.BASE_URL}",
  },
  {
    pattern:
      /`\$\{process\.env\.NEXT_PUBLIC_API_BASE_URL\|\|"https:\/\/answer24\.laravel\.cloud\/api\/v1"\}/g,
    replacement: "`${API_CONFIG.BASE_URL}",
  },
];

function updateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let hasChanges = false;

  // Check if import already exists
  if (!content.includes('from "@/lib/api-config"')) {
    // Add import at the top after other imports
    const importRegex = /(import\s+.*?from\s+["'].*?["'];?\s*\n)+/g;
    const importMatch = content.match(importRegex);

    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + importStatement + "\n",
      );
    } else {
      // Add at the very beginning
      content = importStatement + "\n" + content;
    }
    hasChanges = true;
  }

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

function main() {
  console.log("🚀 Starting API URL migration...\n");

  let updatedCount = 0;

  filesToUpdate.forEach((file) => {
    if (updateFile(file)) {
      updatedCount++;
    }
  });

  console.log(`\n✨ Migration complete! Updated ${updatedCount} files.`);
  console.log("\n📝 Next steps:");
  console.log(
    "1. Create a .env.local file with: NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api/v1",
  );
  console.log("2. Review the updated files and test your application");
  console.log("3. Remove any remaining hardcoded URLs manually if needed");
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, replacements };
