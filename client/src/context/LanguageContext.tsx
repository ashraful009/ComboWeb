import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { bn } from '../i18n/bn';

type Language = 'en' | 'bn';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  pickField: <T>(obj: Record<string, unknown>, baseKey: string) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('freshagro_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  useEffect(() => {
    localStorage.setItem('freshagro_lang', lang);
    document.body.className = `bg-background text-slate-800 antialiased font-${lang}`;
  }, [lang]);

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'bn' : 'en'));

  const t = (path: string, params?: Record<string, string | number>): string => {
    const dict = lang === 'en' ? en : bn;
    const keys = path.split('.');
    let result: unknown = dict;
    
    for (const key of keys) {
      if ((result as Record<string, unknown>)[key] === undefined) return path;
      result = (result as Record<string, unknown>)[key];
    }

    if (typeof result !== 'string') return path;

    if (params) {
      return Object.entries(params).reduce((str, [k, value]) => {
        const valStr = typeof value === 'number' ? formatNumber(value) : String(value);
        return str.replace(new RegExp(`{${k}}`, 'g'), valStr);
      }, result as string);
    }
    return result as string;
  };

  const formatNumber = (num: number): string => {
    if (lang === 'en') return num.toString();
    return num.toString().replace(/\d/g, d => banglaDigits[parseInt(d)]);
  };

  const formatCurrency = (amount: number): string => {
    if (lang === 'en') return `৳${amount}`;
    return `৳${formatNumber(amount)}`;
  };

  const pickField = <T,>(obj: Record<string, unknown>, baseKey: string): T => {
    const key = `${baseKey}_${lang}`;
    return (obj[key] !== undefined ? obj[key] : obj[`${baseKey}_en`]) as T;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, formatCurrency, formatNumber, pickField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
