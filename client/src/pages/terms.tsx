import React from 'react';
import { Link } from 'wouter';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedPath } from '@/lib/i18n';

export default function Terms() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-nord-green rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold nord-green">NordMail</h1>
          </div>
          
          <Link href={getLocalizedPath('/', language)}>
            <Button variant="outline" size="sm" className="border-[#b7ff00] text-[#b7ff00] hover:bg-[#b7ff00] hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-8">
            Last updated: January 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Acceptance of Terms</h2>
            <p className="text-gray-300 mb-4">
              By accessing and using NordMail, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily use NordMail for personal and commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
            </p>
            <p className="text-gray-300 mb-4">Under this license you may not:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use the service for illegal activities</li>
              <li>Attempt to compromise the security of the service</li>
              <li>Use the service to send spam or malicious content</li>
              <li>Reverse engineer or attempt to extract the source code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Service Description</h2>
            <p className="text-gray-300 mb-4">
              NordMail provides temporary email addresses for receiving emails. The service includes:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Creation of temporary email addresses</li>
              <li>Receiving emails to temporary addresses</li>
              <li>Automatic deletion of emails after 30 days</li>
              <li>No registration required for basic usage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Service Limitations</h2>
            <p className="text-gray-300 mb-4">
              Please be aware of the following limitations:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Temporary emails are automatically deleted after 30 days</li>
              <li>Service availability is not guaranteed 100% of the time</li>
              <li>Some senders may block temporary email domains</li>
              <li>Large attachments may be filtered or blocked</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Excludes all representations and warranties relating to this service</li>
              <li>Excludes all liability for damages arising out of or in connection with your use of this service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Governing Law</h2>
            <p className="text-gray-300 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which our company is registered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Contact Information</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <span className="nord-green font-semibold">legal@nordmail.app</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}