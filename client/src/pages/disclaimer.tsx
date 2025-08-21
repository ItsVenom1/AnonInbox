import React from 'react';
import { Link } from 'wouter';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedPath } from '@/lib/i18n';

export default function Disclaimer() {
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
        <h1 className="text-4xl font-bold mb-8">Email Disclaimer</h1>
        
        <Card className="bg-yellow-900/20 border-yellow-500/50 p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Important Notice</h3>
              <p className="text-yellow-100">
                NordMail provides temporary email addresses for legitimate purposes only. Please read this disclaimer carefully before using our service.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Intended Use</h2>
            <p className="text-gray-300 mb-4">
              NordMail is designed for legitimate purposes including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Testing websites and applications</li>
              <li>Protecting your personal email from spam</li>
              <li>One-time registrations for services</li>
              <li>Avoiding unwanted marketing emails</li>
              <li>Maintaining privacy when required to provide an email</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Prohibited Uses</h2>
            <p className="text-gray-300 mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Using temporary emails for illegal activities</li>
              <li>Creating multiple accounts to circumvent service limits</li>
              <li>Using the service to harass or spam others</li>
              <li>Attempting to use temporary emails for financial services without proper verification</li>
              <li>Any activity that violates local, national, or international laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Data Retention and Deletion</h2>
            <p className="text-gray-300 mb-4">
              Important information about your temporary emails:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>All temporary emails are automatically deleted after 30 days</li>
              <li>No permanent backup or recovery is available after deletion</li>
              <li>We cannot restore emails once they have been automatically deleted</li>
              <li>Download important emails before the expiration period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Service Reliability</h2>
            <p className="text-gray-300 mb-4">
              Please understand the following about our service:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Service availability is not guaranteed 100% of the time</li>
              <li>Some email providers may block emails from temporary domains</li>
              <li>Large attachments may not be delivered successfully</li>
              <li>Critical communications should not rely solely on temporary emails</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              NordMail and its operators:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Are not responsible for missed emails or failed deliveries</li>
              <li>Cannot be held liable for any consequences of using temporary emails</li>
              <li>Do not guarantee the security of emails in transit</li>
              <li>Are not responsible for actions taken by third parties based on temporary email usage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Best Practices</h2>
            <p className="text-gray-300 mb-4">
              For the best experience with temporary emails:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use temporary emails only for non-critical communications</li>
              <li>Keep your real email address for important accounts</li>
              <li>Regularly check your temporary inbox for important messages</li>
              <li>Download important emails before they expire</li>
              <li>Do not use temporary emails for account recovery purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Contact Us</h2>
            <p className="text-gray-300">
              If you have questions about this disclaimer or need clarification on acceptable use:
              <br />
              <span className="nord-green font-semibold">legal@nordmail.app</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}