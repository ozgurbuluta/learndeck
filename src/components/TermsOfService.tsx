import React from 'react';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (view: string) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
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
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Terms of Service</h1>
            <p className="text-primary-text/70">Last updated: December 23, 2024</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-primary-highlight" />
                Agreement to Terms
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                These Terms of Service ("Terms") govern your use of LearnDeck, a vocabulary learning application that uses spaced repetition techniques to help you master new languages. By accessing or using our service, you agree to be bound by these Terms.
              </p>
              <p className="text-primary-text leading-relaxed">
                If you do not agree to these Terms, please do not use our service. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Service Description</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                LearnDeck is a vocabulary learning platform that provides:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Spaced repetition learning algorithms for optimal retention</li>
                <li>Personal vocabulary collection management</li>
                <li>Progress tracking and performance analytics</li>
                <li>Customizable study sessions and folder organization</li>
                <li>Cross-device synchronization of your learning data</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                We strive to provide a reliable and effective learning experience, but we do not guarantee specific learning outcomes or results.
              </p>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary-highlight" />
                User Accounts and Registration
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                To use LearnDeck, you must create an account by providing accurate and complete information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and up-to-date information</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                You must be at least 13 years old to create an account. If you are under 18, you represent that you have parental consent to use our service.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                Acceptable Use Policy
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                You agree to use LearnDeck only for lawful purposes and in accordance with these Terms. You may:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-6 space-y-1">
                <li>Create and manage your personal vocabulary collections</li>
                <li>Use our spaced repetition learning features</li>
                <li>Track your learning progress and statistics</li>
                <li>Organize words into folders and categories</li>
                <li>Export your personal data when requested</li>
              </ul>

              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                Prohibited Activities
              </h3>
              <p className="text-primary-text leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Create multiple accounts to circumvent limitations</li>
                <li>Share copyrighted content without permission</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated tools to access the service without permission</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-primary-navy mb-3">Your Content</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                You retain ownership of the vocabulary words, definitions, and other content you create or upload to LearnDeck. By using our service, you grant us a limited license to store, process, and display your content solely for the purpose of providing our learning services.
              </p>

              <h3 className="text-xl font-medium text-primary-navy mb-3">Our Content</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                LearnDeck and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our service without our express written permission.
              </p>
            </section>

            {/* Privacy and Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Privacy and Data Protection</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using LearnDeck, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              <p className="text-primary-text leading-relaxed">
                We implement appropriate security measures to protect your data, but you acknowledge that no internet transmission is completely secure. You use our service at your own risk regarding data security.
              </p>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Service Availability and Modifications</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We strive to provide continuous access to LearnDeck, but we do not guarantee uninterrupted service. We may:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Temporarily suspend service for maintenance or updates</li>
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Implement usage limits to ensure fair access for all users</li>
                <li>Update our algorithms and learning methodologies</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                We will provide advance notice of significant changes when possible, but reserve the right to make immediate changes for security or legal reasons.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
                Disclaimers and Limitations
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                LearnDeck is provided "as is" and "as available" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Accuracy or completeness of content</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data transmission or storage</li>
                <li>Specific learning outcomes or results</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                Your use of LearnDeck is at your own risk. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Account Termination</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature in your profile settings. Upon termination:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>Your access to LearnDeck will be immediately revoked</li>
                <li>Your personal data will be deleted according to our Privacy Policy</li>
                <li>You may request a data export before deletion</li>
                <li>Some information may be retained for legal or security purposes</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                We may terminate or suspend your account immediately if you violate these Terms or engage in prohibited activities.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Governing Law and Disputes</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of LearnDeck will be resolved through:
              </p>
              <ol className="list-decimal list-inside text-primary-text mb-4 space-y-1">
                <li>Good faith negotiation between the parties</li>
                <li>Mediation if negotiation fails</li>
                <li>Binding arbitration as a last resort</li>
              </ol>
              <p className="text-primary-text leading-relaxed">
                You agree to resolve disputes individually and waive any right to participate in class action lawsuits.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Contact Information</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-primary-cream/50 rounded-lg p-4">
                                  <p className="text-primary-text mb-2"><strong>Email:</strong> legal@learndeck.com</p>
                  <p className="text-primary-text mb-2"><strong>Support:</strong> support@learndeck.com</p>
                <p className="text-primary-text"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};