import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (view: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-highlight rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Privacy Policy</h1>
            <p className="text-primary-text/70">Last updated: December 23, 2024</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-primary-highlight" />
                Introduction
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                At LearnDeck, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our vocabulary learning application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
              <p className="text-primary-text leading-relaxed">
                We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2 text-primary-highlight" />
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-primary-navy mb-3">Personal Information</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Register for an account</li>
                <li>Use our vocabulary learning features</li>
                <li>Contact us for support</li>
                <li>Participate in surveys or feedback</li>
              </ul>

              <h3 className="text-xl font-medium text-primary-navy mb-3">Study Data</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                To provide our spaced repetition learning system, we collect and store:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Words and definitions you add to your collection</li>
                <li>Study session data and progress metrics</li>
                <li>Learning preferences and settings</li>
                <li>Performance statistics and accuracy rates</li>
              </ul>

              <h3 className="text-xl font-medium text-primary-navy mb-3">Automatically Collected Information</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                We may automatically collect certain information about your device and usage patterns:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Device information and browser type</li>
                <li>IP address and general location</li>
                <li>Usage patterns and feature interactions</li>
                <li>Session duration and frequency</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary-highlight" />
                How We Use Your Information
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Provide and maintain our vocabulary learning service</li>
                <li>Personalize your learning experience with spaced repetition</li>
                <li>Track your progress and provide performance insights</li>
                <li>Send you important updates about your account</li>
                <li>Improve our application and develop new features</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Prevent fraudulent or unauthorized access</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-primary-highlight" />
                Data Security
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting infrastructure with Supabase</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                However, please note that no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Data Sharing and Disclosure</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>With service providers who assist in operating our application (e.g., Supabase for database services)</li>
                <li>When required by law or to protect our rights and safety</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Your Privacy Rights</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Access and review your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of certain communications</li>
                <li>Restrict or object to certain processing activities</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our application. These technologies help us:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Remember your login status and preferences</li>
                <li>Analyze usage patterns to improve our service</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                You can control cookie settings through your browser preferences. However, disabling cookies may affect the functionality of our application.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Children's Privacy</h2>
              <p className="text-primary-text leading-relaxed">
                Our application is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Mail className="h-6 w-6 mr-2 text-primary-highlight" />
                Contact Us
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-primary-cream/50 rounded-lg p-4">
                                  <p className="text-primary-text mb-2"><strong>Email:</strong> privacy@learndeck.online</p>
                  <p className="text-primary-text mb-2"><strong>Support:</strong> support@learndeck.online</p>
                <p className="text-primary-text"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Policy Updates</h2>
              <p className="text-primary-text leading-relaxed">
                We may update this Privacy Policy from time to time. When we make changes, we will update the "Last updated" date at the top of this policy and notify you through the application or via email. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};