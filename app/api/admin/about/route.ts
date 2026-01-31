import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

// Path to translation files
const translationsPath = path.join(process.cwd(), 'messages');

// Helper function to read translation file
async function readTranslationFile(locale: string) {
  try {
    const filePath = path.join(translationsPath, `${locale}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${locale} translation file:`, error);
    return null;
  }
}

// Helper function to write to translation file
async function writeTranslationFile(locale: string, data: any) {
  try {
    const filePath = path.join(translationsPath, `${locale}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${locale} translation file:`, error);
    return false;
  }
}

export async function GET() {
  try {
    // Default to English for the admin interface
    const locale = 'en';
    const translations = await readTranslationFile(locale);
    
    if (!translations || !translations.AboutPage) {
      return NextResponse.json(
        { error: 'About page content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(translations.AboutPage);
  } catch (error) {
    console.error('Error fetching about page content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about page content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json();
    const locale = 'en'; // For now, we'll only update English translations
    
    // Read current translations
    const translations = await readTranslationFile(locale);
    if (!translations) {
      return NextResponse.json(
        { error: 'Failed to load translations' },
        { status: 500 }
      );
    }
    
    // Update the AboutPage section
    translations.AboutPage = {
      ...translations.AboutPage, // Keep any existing fields we're not updating
      ...content // Override with the new content
    };
    
    // Save back to file
    const success = await writeTranslationFile(locale, translations);
    
    if (!success) {
      throw new Error('Failed to save translations');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'About page content updated successfully' 
    });
    
  } catch (error) {
    console.error('Error saving about page content:', error);
    return NextResponse.json(
      { error: 'Failed to save about page content' },
      { status: 500 }
    );
  }
}
