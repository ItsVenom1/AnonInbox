import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages, Language } from '@/lib/i18n';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-[#b7ff00] text-[#b7ff00] hover:bg-[#b7ff00] hover:text-black"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t('nav.language')}</span>
          <span className="sm:hidden">{language.toUpperCase()}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black border-gray-800">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={`cursor-pointer hover:bg-gray-800 ${
              language === code ? 'bg-gray-800 text-[#b7ff00]' : 'text-white'
            }`}
          >
            <span className="mr-3 text-lg">{flag}</span>
            <span>{name}</span>
            {language === code && (
              <span className="ml-auto text-[#b7ff00]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};