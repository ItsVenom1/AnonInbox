import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedPath } from '@/lib/i18n';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-nord-green rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-black rounded" />
              </div>
              <h3 className="text-xl font-bold nord-green">NordMail</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The most advanced temporary email service. Protect your privacy with unlimited disposable email addresses.
            </p>
            <div className="text-sm text-gray-500">
              © 2024 NordMail. All rights reserved.
            </div>
          </div>

          {/* Legal Pages */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={getLocalizedPath('/privacy', language)}
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  href={getLocalizedPath('/terms', language)}
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link 
                  href={getLocalizedPath('/disclaimer', language)}
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={getLocalizedPath('/blog', language)}
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link 
                  href={getLocalizedPath('/support', language)}
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  {t('footer.support')}
                </Link>
              </li>
              <li>
                <a 
                  href="/admin"
                  className="text-gray-400 hover:text-nord-green transition-colors"
                >
                  Admin Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            Built with privacy and security in mind. All temporary emails are automatically deleted after 30 days.
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Service Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};