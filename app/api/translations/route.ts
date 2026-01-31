import { NextRequest, NextResponse } from 'next/server';

// Mock translation data
const translations = {
  en: {
    'header.title': 'Welcome to Answer24',
    'faq.button_label': 'View the answer',
    'chat.welcome_message': 'How can I help you today?',
    'admin.title': 'Translation Management',
    'admin.search_placeholder': 'Search translation key...',
    'admin.add_key': 'Add New Key',
    'admin.save': 'Save Changes',
    'admin.key': 'Key',
    'admin.english': 'English',
    'admin.dutch': 'Dutch',
    'footer.pages_title': 'Legal Pages',
    'footer.no_pages': 'No legal pages available',
    'footer.support_title': 'Support',
    'footer.faq': 'FAQ',
    'footer.pricing': 'Pricing'
  },
  nl: {
    'header.title': 'Welkom bij Answer24',
    'faq.button_label': 'Bekijk het antwoord',
    'chat.welcome_message': 'Waarmee kan ik je helpen vandaag?',
    'admin.title': 'Vertalingenbeheer',
    'admin.search_placeholder': 'Zoek vertalingssleutel...',
    'admin.add_key': 'Nieuwe sleutel toevoegen',
    'admin.save': 'Wijzigingen opslaan',
    'admin.key': 'Sleutel',
    'admin.english': 'Engels',
    'admin.dutch': 'Nederlands',
    'footer.pages_title': 'Juridische Pagina\'s',
    'footer.no_pages': 'Geen juridische pagina\'s beschikbaar',
    'footer.support_title': 'Ondersteuning',
    'footer.faq': 'Veelgestelde Vragen',
    'footer.pricing': 'Prijzen'
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang');
  
  if (lang && translations[lang as keyof typeof translations]) {
    return NextResponse.json(translations[lang as keyof typeof translations]);
  }
  
  return NextResponse.json({ error: 'Language not found' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, language, text } = body;
    
    // Mock update logic - in real implementation, this would update the database
    if (translations[language as keyof typeof translations] && key in translations[language as keyof typeof translations]) {
      (translations[language as keyof typeof translations] as any)[key] = text;
    }
    
    return NextResponse.json({ success: 'Translation updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 });
  }
}
