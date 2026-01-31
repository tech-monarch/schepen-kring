"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import NETHERLANDLOGO from "@/public/netherlands.png"
import ENGLANDLOGO from "@/public/united-kingdom.png"
import Image from 'next/image';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'en', name: '🇬🇧', icon: ENGLANDLOGO.src }, // Placeholder for flag icon
    { code: 'nl', name: '🇳🇱', icon: NETHERLANDLOGO.src }, // Placeholder for flag icon
  ];

  const currentLang = languages.find(lang => lang.code === t('locale'));

  const changeLanguage = (lng: string) => {
    const newPath = `/${lng}${pathname.substring(3)}`; // Adjust path for locale prefix
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-6xl flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <Image src={currentLang?.icon || ""} width={20} height={20} alt={`${currentLang?.name} icon`}/>

      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-16 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex items-center space-x-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Image src={lang.icon} width={20} height={20} alt={`${lang.code} icon`}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
