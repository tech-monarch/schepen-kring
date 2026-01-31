// Legal pages service for dynamic loading and caching
export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  language: string;
  last_updated_at: string;
  last_updated_by: string;
  is_active: boolean;
}

class LegalPagesService {
  private cache: Map<string, LegalPage[]> = new Map();
  private pageCache: Map<string, LegalPage> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getAllPages(language: string): Promise<LegalPage[]> {
    const cacheKey = `legal_pages_${language}`;
    
    // Check if we have cached data
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`/api/legal-pages?lang=${language}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch legal pages for ${language}`);
      }

      const pages = await response.json();
      
      // Cache the pages
      this.cache.set(cacheKey, pages);
      
      // Set timeout to clear cache
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.cacheTimeout);

      return pages;
    } catch (error) {
      console.error('Error fetching legal pages:', error);
      return [];
    }
  }

  async getPageBySlug(slug: string, language: string): Promise<LegalPage | null> {
    const cacheKey = `legal_page_${slug}_${language}`;
    
    // Check if we have cached data
    if (this.pageCache.has(cacheKey)) {
      return this.pageCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`/api/legal-pages/${slug}?lang=${language}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch legal page ${slug}`);
      }

      const page = await response.json();
      
      // Cache the page
      this.pageCache.set(cacheKey, page);
      
      // Set timeout to clear cache
      setTimeout(() => {
        this.pageCache.delete(cacheKey);
      }, this.cacheTimeout);

      return page;
    } catch (error) {
      console.error('Error fetching legal page:', error);
      return null;
    }
  }

  async createPage(pageData: Omit<LegalPage, 'id' | 'last_updated_at' | 'last_updated_by' | 'is_active'>): Promise<LegalPage | null> {
    try {
      const response = await fetch('/api/legal-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error('Failed to create legal page');
      }

      const newPage = await response.json();
      
      // Clear cache to force refresh
      this.clearCache();
      
      return newPage;
    } catch (error) {
      console.error('Error creating legal page:', error);
      return null;
    }
  }

  async updatePage(slug: string, language: string, updates: { title: string; content: string }): Promise<boolean> {
    try {
      const response = await fetch(`/api/legal-pages/${slug}?lang=${language}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update legal page');
      }

      // Clear cache to force refresh
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error updating legal page:', error);
      return false;
    }
  }

  async deletePage(slug: string, language: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/legal-pages/${slug}?lang=${language}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete legal page');
      }

      // Clear cache to force refresh
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error deleting legal page:', error);
      return false;
    }
  }

  // Method to clear all cached legal pages
  clearCache(): void {
    this.cache.clear();
    this.pageCache.clear();
  }
}

// Export singleton instance
export const legalPagesService = new LegalPagesService();
