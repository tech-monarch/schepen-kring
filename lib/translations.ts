// Translation service for dynamic loading and caching
class TranslationService {
  private cache: Map<string, Record<string, string>> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getTranslations(language: string): Promise<Record<string, string>> {
    const cacheKey = `translations_${language}`;
    
    // Check if we have cached data
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`/api/translations?lang=${language}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch translations for ${language}`);
      }

      const translations = await response.json();
      
      // Cache the translations
      this.cache.set(cacheKey, translations);
      
      // Set timeout to clear cache
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.cacheTimeout);

      return translations;
    } catch (error) {
      console.error('Error fetching translations:', error);
      
      // Fallback to other language if available
      const fallbackLang = language === 'en' ? 'nl' : 'en';
      const fallbackKey = `translations_${fallbackLang}`;
      
      if (this.cache.has(fallbackKey)) {
        console.warn(`Falling back to ${fallbackLang} translations`);
        return this.cache.get(fallbackKey)!;
      }
      
      // Return empty object if all fails
      return {};
    }
  }

  async updateTranslation(key: string, language: string, text: string): Promise<boolean> {
    try {
      const response = await fetch('/api/translations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, language, text }),
      });

      if (!response.ok) {
        throw new Error('Failed to update translation');
      }

      // Clear cache to force refresh
      this.cache.delete(`translations_${language}`);
      
      return true;
    } catch (error) {
      console.error('Error updating translation:', error);
      return false;
    }
  }

  // Method to preload translations for better performance
  async preloadTranslations(languages: string[]): Promise<void> {
    const promises = languages.map(lang => this.getTranslations(lang));
    await Promise.all(promises);
  }

  // Method to clear all cached translations
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Type definitions
export interface TranslationKey {
  key: string;
  en: string;
  nl: string;
}

export interface TranslationUpdate {
  key: string;
  language: string;
  text: string;
}
