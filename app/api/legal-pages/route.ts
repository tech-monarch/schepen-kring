import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Mock legal pages data
const legalPages = {
  en: [
    {
      id: '1',
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: `<h1>Privacy Policy</h1>
        <p>Last updated: January 1, 2025</p>
        <p>This Privacy Policy describes how Answer24 ("we", "our", or "us") collects, uses, and shares your personal information when you use our service.</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>`,
      language: 'en',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    },
    {
      id: '2',
      slug: 'terms-of-service',
      title: 'Terms of Service',
      content: `<h1>Terms of Service</h1>
        <p>Last updated: January 1, 2025</p>
        <p>Please read these Terms of Service ("Terms") carefully before using Answer24.</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h2>Use License</h2>
        <p>Permission is granted to temporarily download one copy of Answer24 materials for personal, non-commercial transitory viewing only.</p>
        <h2>Disclaimer</h2>
        <p>The materials on Answer24 are provided on an 'as is' basis. Answer24 makes no warranties, expressed or implied.</p>`,
      language: 'en',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    },
    {
      id: '3',
      slug: 'cookie-policy',
      title: 'Cookie Policy',
      content: `<h1>Cookie Policy</h1>
        <p>Last updated: January 1, 2025</p>
        <p>This Cookie Policy explains how Answer24 uses cookies and similar technologies when you visit our website.</p>
        <h2>What are Cookies</h2>
        <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website.</p>
        <h2>How We Use Cookies</h2>
        <p>We use cookies to improve your experience on our website, analyze traffic, and for advertising purposes.</p>
        <h2>Managing Cookies</h2>
        <p>You can control and/or delete cookies as you wish through your browser settings.</p>`,
      language: 'en',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    }
  ],
  nl: [
    {
      id: '1',
      slug: 'privacy-policy',
      title: 'Privacybeleid',
      content: `<h1>Privacybeleid</h1>
        <p>Laatst bijgewerkt: 1 januari 2025</p>
        <p>Dit Privacybeleid beschrijft hoe Answer24 ("wij", "ons", of "onze") uw persoonlijke informatie verzamelt, gebruikt en deelt wanneer u onze service gebruikt.</p>
        <h2>Informatie die We Verzamelen</h2>
        <p>We verzamelen informatie die u direct aan ons verstrekt, bijvoorbeeld wanneer u een account aanmaakt, onze services gebruikt, of contact met ons opneemt voor ondersteuning.</p>
        <h2>Hoe We Uw Informatie Gebruiken</h2>
        <p>We gebruiken de informatie die we verzamelen om onze services te leveren, onderhouden en verbeteren, transacties te verwerken en met u te communiceren.</p>
        <h2>Informatie Delen</h2>
        <p>We verkopen, verhandelen of dragen uw persoonlijke informatie niet over aan derden zonder uw toestemming, behalve zoals beschreven in dit beleid.</p>`,
      language: 'nl',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    },
    {
      id: '2',
      slug: 'terms-of-service',
      title: 'Algemene Voorwaarden',
      content: `<h1>Algemene Voorwaarden</h1>
        <p>Laatst bijgewerkt: 1 januari 2025</p>
        <p>Lees deze Algemene Voorwaarden ("Voorwaarden") zorgvuldig door voordat u Answer24 gebruikt.</p>
        <h2>Acceptatie van Voorwaarden</h2>
        <p>Door toegang te krijgen tot en gebruik te maken van onze service, accepteert en gaat u akkoord om gebonden te zijn aan de voorwaarden van deze overeenkomst.</p>
        <h2>Gebruikslicentie</h2>
        <p>Toestemming wordt verleend om tijdelijk één kopie van Answer24 materialen te downloaden voor persoonlijk, niet-commercieel tijdelijk bekijken alleen.</p>
        <h2>Disclaimer</h2>
        <p>De materialen op Answer24 worden geleverd op een 'zoals ze zijn' basis. Answer24 geeft geen garanties, uitdrukkelijk of impliciet.</p>`,
      language: 'nl',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    },
    {
      id: '3',
      slug: 'cookie-policy',
      title: 'Cookiebeleid',
      content: `<h1>Cookiebeleid</h1>
        <p>Laatst bijgewerkt: 1 januari 2025</p>
        <p>Dit Cookiebeleid legt uit hoe Answer24 cookies en vergelijkbare technologieën gebruikt wanneer u onze website bezoekt.</p>
        <h2>Wat zijn Cookies</h2>
        <p>Cookies zijn kleine tekstbestanden die op uw computer of mobiele apparaat worden geplaatst wanneer u een website bezoekt.</p>
        <h2>Hoe We Cookies Gebruiken</h2>
        <p>We gebruiken cookies om uw ervaring op onze website te verbeteren, verkeer te analyseren en voor reclamedoeleinden.</p>
        <h2>Cookies Beheren</h2>
        <p>U kunt cookies controleren en/of verwijderen zoals u wilt via uw browserinstellingen.</p>`,
      language: 'nl',
      last_updated_at: '2025-01-01T00:00:00Z',
      last_updated_by: 'admin',
      is_active: true
    }
  ]
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  
  if (legalPages[lang as keyof typeof legalPages]) {
    return NextResponse.json(legalPages[lang as keyof typeof legalPages]);
  }
  
  return NextResponse.json({ error: 'Language not found' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, content, language } = body;
    
    // Mock creation logic
    const newPage = {
      id: Date.now().toString(),
      slug,
      title,
      content,
      language,
      last_updated_at: new Date().toISOString(),
      last_updated_by: 'admin',
      is_active: true
    };
    
    // Add to mock data
    if (legalPages[language as keyof typeof legalPages]) {
      legalPages[language as keyof typeof legalPages].push(newPage);
    }
    
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create legal page' }, { status: 500 });
  }
}
