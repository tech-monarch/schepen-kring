import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { WIDGET_CONFIG } from '@/lib/widget-config';
import fs from 'fs';
import path from 'path';

// PLACEHOLDER: Replace with your actual database/models
interface WidgetSettings {
  id: string;
  company_id: string;
  public_key: string;
  allowed_domains: string[];
  theme: {
    mode: 'auto' | 'light' | 'dark';
    primary: string;
    foreground: string;
    background: string;
    radius: number;
    fontFamily: string;
    logoUrl?: string;
  };
  behavior: {
    position: 'right' | 'left';
    openOnLoad: boolean;
    openOnExitIntent: boolean;
    openOnInactivityMs: number;
    zIndex: number;
  };
  features: {
    chat: boolean;
    wallet: boolean;
    offers: boolean;
    leadForm: boolean;
  };
  i18n: {
    default: string;
    strings: Record<string, string>;
  };
  integrations: {
    ga4?: {
      measurementId: string;
    };
    mollie?: {
      apiKey: string;
    };
  };
  visibility_rules: {
    includePaths: string[];
    excludePaths: string[];
    minCartValue: number;
  };
  rate_limit_per_min: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// File system storage path
const SETTINGS_DIR = path.join(process.cwd(), 'public', 'widget', 'settings');

/**
 * Load settings from file system by public key
 */
function loadSettingsByPublicKey(publicKey: string): WidgetSettings | null {
  try {
    // Read all settings files and find matching public key
    if (fs.existsSync(SETTINGS_DIR)) {
      const files = fs.readdirSync(SETTINGS_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(SETTINGS_DIR, file);
          const data = fs.readFileSync(filePath, 'utf-8');
          const settings: WidgetSettings = JSON.parse(data);
          if (settings.public_key === publicKey) {
            return settings;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading settings by public key:', error);
  }
  return null;
}

// PLACEHOLDER: Demo settings for testing
const demoWidgetSettings: WidgetSettings = {
  id: '1',
  company_id: 'cmp_demo',
  public_key: 'PUB_abc123',
  allowed_domains: ['shop.nl', '*.shop.nl', 'localhost:3000'],
  theme: {
    mode: 'auto',
    primary: '#0059ff',
    foreground: '#0f172a',
    background: '#ffffff',
    radius: 14,
    fontFamily: 'Inter, ui-sans-serif',
    logoUrl: 'https://cdn.answer24.nl/assets/tenants/123/logo.svg'
  },
  behavior: {
    position: 'right',
    openOnLoad: false,
    openOnExitIntent: true,
    openOnInactivityMs: 0,
    zIndex: 2147483000
  },
  features: {
    chat: true,
    wallet: true,
    offers: false,
    leadForm: false
  },
  i18n: {
    default: 'nl-NL',
    strings: {
      'cta.open': 'Vraag & Spaar',
      'cta.close': 'Sluiten',
      'placeholder': 'Typ je bericht...',
      'welcome': 'Hoi! Hoe kan ik je helpen?'
    }
  },
  integrations: {
    ga4: {
      measurementId: 'G-XXXX'
    }
  },
  visibility_rules: {
    includePaths: ['/', '/checkout'],
    excludePaths: ['/account*'],
    minCartValue: 0
  },
  rate_limit_per_min: 60,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

/**
 * Generate HMAC signature for response
 */
function generateSignature(body: string, publicKey: string): string {
  const secret = WIDGET_CONFIG.SIGNING_SECRET + publicKey;
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Validate allowed domains
 */
function validateDomain(request: NextRequest, allowedDomains: string[]): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const referer = request.headers.get('referer');
  
  const requestDomain = origin || host || (referer ? new URL(referer).hostname : null);
  
  if (!requestDomain) return false;
  
  return allowedDomains.some(domain => {
    if (domain.startsWith('*.')) {
      const baseDomain = domain.substring(2);
      return requestDomain.endsWith(baseDomain) || requestDomain === baseDomain;
    }
    return requestDomain === domain;
  });
}

/**
 * Check rate limiting
 */
function checkRateLimit(publicKey: string, ip: string): boolean {
  // PLACEHOLDER: Implement actual rate limiting
  // This should check against Redis or similar
  // For now, we'll allow all requests
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('key');
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }

    // Get widget settings from file system
    let settings = loadSettingsByPublicKey(publicKey);
    
    // Fallback to demo settings if not found
    if (!settings) {
      settings = demoWidgetSettings;
      console.warn(`[Widget Config] Using demo settings for public key: ${publicKey}`);
    }
    
    if (!settings || settings.public_key !== publicKey) {
      return NextResponse.json(
        { error: 'Invalid public key' },
        { status: 404 }
      );
    }

    // Validate domain
    if (!validateDomain(request, settings.allowed_domains)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Check rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(publicKey, clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Build response
    const response = {
      company: {
        id: settings.company_id,
        name: 'Shop BV', // PLACEHOLDER: Get from company table
        brand: 'Shop'
      },
      theme: settings.theme,
      behavior: settings.behavior,
      features: settings.features,
      i18n: settings.i18n,
      integrations: settings.integrations,
      visibility_rules: settings.visibility_rules,
      cdn: {
        assetsVersion: settings.version
      }
    };

    const responseBody = JSON.stringify(response);
    const signature = generateSignature(responseBody, publicKey);

    // Check if client has cached version
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = `"${settings.version}-${signature.substring(0, 8)}"`;
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Don't cache in development
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': etag,
        'X-Answer24-Signature': signature,
        'X-Answer24-Version': settings.version.toString(),
        'Access-Control-Allow-Origin': '*', // PLACEHOLDER: Restrict to validated domains
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Answer24-Version'
      }
    });

  } catch (error) {
    console.error('Widget Config API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Answer24-Version',
      'Access-Control-Max-Age': '86400'
    }
  });
}
