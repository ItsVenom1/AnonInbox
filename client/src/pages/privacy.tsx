import React from 'react';
import { Link } from 'wouter';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedPath } from '@/lib/i18n';

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-8">
            Last updated: January 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              NordMail is designed with privacy as our top priority. We collect minimal information to provide our temporary email service:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Temporary email addresses you create (automatically deleted after 30 days)</li>
              <li>Messages received to your temporary addresses (automatically deleted after 30 days)</li>
              <li>Basic usage analytics (anonymous, no personal data)</li>
              <li>Optional account recovery email (if provided voluntarily)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">
              We use the collected information solely to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and maintain our temporary email service</li>
              <li>Deliver messages to your temporary email addresses</li>
              <li>Improve our service through anonymous analytics</li>
              <li>Provide customer support when requested</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>All data is encrypted in transit and at rest</li>
              <li>Automatic deletion of all temporary emails after 30 days</li>
              <li>No permanent storage of email content</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              We use minimal third-party services to operate our platform:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Mail.tm API for email functionality (temporary data only)</li>
              <li>CloudFlare for security and CDN services</li>
              <li>Anonymous analytics for service improvement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Your Rights</h2>
            <p className="text-gray-300 mb-4">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Right to access your temporary email data</li>
              <li>Right to delete your temporary emails at any time</li>
              <li>Right to data portability (export your emails)</li>
              <li>Right to withdraw consent for optional data collection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 nord-green">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <span className="nord-green font-semibold">privacy@nordmail.app</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}