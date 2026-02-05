// src/lib/translations/translationService.ts
import axios from "axios";

export interface TranslationKey {
  key: string;
  [lang: string]: string; // dynamic keys for languages like en, nl, es, etc.
}

const API_BASE = "https://schepen-kring.nl/api/v1";

export const translationService = {
  // Fetch translations for a specific language
  async getTranslations(language: string): Promise<Record<string, string>> {
    try {
      const res = await axios.get(`${API_BASE}/translations`);
      const allTranslations: TranslationKey[] = res.data;

      const translations: Record<string, string> = {};
      allTranslations.forEach((item) => {
        translations[item.key] = item[language] || "";
      });

      return translations;
    } catch (error) {
      console.error("Failed to fetch translations:", error);
      return {};
    }
  },

  // Update a translation for a specific key and language
  async updateTranslation(key: string, langCode: string, text: string) {
    const response = await fetch(
      `https://schepen-kring.nl/api/v1/admin/translations/${key}/${langCode}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure admin token is sent
        },
        body: JSON.stringify({ text }),
      },
    );
    return response.ok;
  },

  // Add a new translation key
  async addTranslationKey(key: string): Promise<boolean> {
    try {
      await axios.post(`${API_BASE}/translations/key`, { key });
      return true;
    } catch (error) {
      console.error("Failed to add translation key:", error);
      return false;
    }
  },

  // Fetch available languages
  async getLanguages(): Promise<{ code: string; name: string }[]> {
    try {
      const res = await axios.get(`${API_BASE}/translations/languages`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      return [];
    }
  },

  // Add a new language
  async addLanguage(code: string, name: string): Promise<boolean> {
    try {
      await axios.post(`${API_BASE}/translations/languages`, { code, name });
      return true;
    } catch (error) {
      console.error("Failed to add language:", error);
      return false;
    }
  },
};
