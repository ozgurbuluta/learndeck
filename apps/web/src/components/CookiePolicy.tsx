import React from 'react';
import { ArrowLeft, Cookie, Settings, Info, Shield, BarChart3 } from 'lucide-react';

interface CookiePolicyProps {
  onNavigate: (view: string) => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onNavigate }) => {
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
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Cookie Policy</h1>
            <p className="text-primary-text/70">Last updated: December 23, 2024</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Info className="h-6 w-6 mr-2 text-primary-highlight" />
                What Are Cookies?
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                Cookies are small text files that are stored on your device when you visit LearnDeck. They help us provide you with a better learning experience by remembering your preferences, keeping you logged in, and helping us understand how you use our vocabulary learning platform.
              </p>
              <p className="text-primary-text leading-relaxed">
                This Cookie Policy explains what cookies we use, why we use them, and how you can manage your cookie preferences.
              </p>
            </section>

            {/* Types of Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Types of Cookies We Use</h2>
              
              {/* Essential Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Essential Cookies
                </h3>
                <p className="text-primary-text leading-relaxed mb-3">
                  These cookies are necessary for LearnDeck to function properly. They enable core functionality such as:
                </p>
                <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                  <li>User authentication and login sessions</li>
                  <li>Security features and fraud prevention</li>
                  <li>Basic application functionality</li>
                  <li>Remembering your language and region preferences</li>
                </ul>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    <strong>Note:</strong> Essential cookies cannot be disabled as they are required for the application to work.
                  </p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-500" />
                  Functional Cookies
                </h3>
                <p className="text-primary-text leading-relaxed mb-3">
                  These cookies enhance your learning experience by remembering your choices and preferences:
                </p>
                <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                  <li>Your study preferences and difficulty settings</li>
                  <li>Folder organization and display preferences</li>
                  <li>Theme and interface customizations</li>
                  <li>Recent study session configurations</li>
                  <li>Progress tracking and learning goals</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="mb-6">
                <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Analytics Cookies
                </h3>
                <p className="text-primary-text leading-relaxed mb-3">
                  These cookies help us understand how you use LearnDeck so we can improve our service:
                </p>
                <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                  <li>Usage patterns and feature popularity</li>
                  <li>Learning session duration and frequency</li>
                  <li>Performance metrics and error tracking</li>
                  <li>User journey and navigation patterns</li>
                  <li>Device and browser information for optimization</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Privacy Note:</strong> Analytics data is aggregated and anonymized. We cannot identify individual users from this data.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">How We Use Cookies</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                We use cookies to enhance your LearnDeck experience in several ways:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-primary-cream/50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Authentication</h4>
                  <p className="text-sm text-primary-text">Keep you logged in securely across sessions and remember your account preferences.</p>
                </div>
                <div className="bg-primary-cream/50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Personalization</h4>
                  <p className="text-sm text-primary-text">Customize your learning experience based on your study habits and preferences.</p>
                </div>
                <div className="bg-primary-cream/50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Performance</h4>
                  <p className="text-sm text-primary-text">Optimize loading times and ensure smooth operation of spaced repetition features.</p>
                </div>
                <div className="bg-primary-cream/50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Analytics</h4>
                  <p className="text-sm text-primary-text">Understand usage patterns to improve our vocabulary learning algorithms.</p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Third-Party Services</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                LearnDeck uses the following third-party services that may set their own cookies:
              </p>
              
              <div className="space-y-4">
                <div className="border border-primary-bg rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Supabase (Database & Authentication)</h4>
                  <p className="text-sm text-primary-text mb-2">
                    Provides secure user authentication and data storage for your vocabulary collections.
                  </p>
                  <p className="text-xs text-primary-text/70">
                    Purpose: Essential functionality • Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-highlight hover:underline">supabase.com/privacy</a>
                  </p>
                </div>
                
                <div className="border border-primary-bg rounded-lg p-4">
                  <h4 className="font-semibold text-primary-navy mb-2">Netlify (Hosting)</h4>
                  <p className="text-sm text-primary-text mb-2">
                    Hosts our application and provides content delivery network services.
                  </p>
                  <p className="text-xs text-primary-text/70">
                    Purpose: Performance and security • Privacy Policy: <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary-highlight hover:underline">netlify.com/privacy</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-medium text-primary-navy mb-3">Browser Settings</h3>
              <p className="text-primary-text leading-relaxed mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li>View and delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close your browser</li>
                <li>Set up notifications when cookies are being set</li>
              </ul>

              <h3 className="text-xl font-medium text-primary-navy mb-3">Browser-Specific Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border border-primary-bg rounded-lg p-3">
                  <h4 className="font-medium text-primary-navy mb-1">Chrome</h4>
                  <p className="text-sm text-primary-text">Settings → Privacy and Security → Cookies and other site data</p>
                </div>
                <div className="border border-primary-bg rounded-lg p-3">
                  <h4 className="font-medium text-primary-navy mb-1">Firefox</h4>
                  <p className="text-sm text-primary-text">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="border border-primary-bg rounded-lg p-3">
                  <h4 className="font-medium text-primary-navy mb-1">Safari</h4>
                  <p className="text-sm text-primary-text">Preferences → Privacy → Manage Website Data</p>
                </div>
                <div className="border border-primary-bg rounded-lg p-3">
                  <h4 className="font-medium text-primary-navy mb-1">Edge</h4>
                  <p className="text-sm text-primary-text">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Disabling essential cookies may prevent LearnDeck from functioning properly. Some features like login, progress tracking, and spaced repetition may not work correctly.
                </p>
              </div>
            </section>

            {/* Cookie Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Cookie Retention</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                Different types of cookies are stored for different periods:
              </p>
              <ul className="list-disc list-inside text-primary-text mb-4 space-y-1">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication Cookies:</strong> Stored for up to 30 days or until you log out</li>
                <li><strong>Preference Cookies:</strong> Stored for up to 1 year</li>
                <li><strong>Analytics Cookies:</strong> Stored for up to 2 years</li>
              </ul>
              <p className="text-primary-text leading-relaxed">
                You can clear all cookies at any time through your browser settings or by logging out of your LearnDeck account.
              </p>
            </section>

            {/* Updates to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Updates to This Policy</h2>
              <p className="text-primary-text leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. When we make significant changes, we will notify you through the application or via email. The "Last updated" date at the top of this policy indicates when it was last revised.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Questions About Cookies</h2>
              <p className="text-primary-text leading-relaxed mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-primary-cream/50 rounded-lg p-4">
                                  <p className="text-primary-text mb-2"><strong>Email:</strong> privacy@learndeck.online</p>
                  <p className="text-primary-text mb-2"><strong>Support:</strong> support@learndeck.online</p>
                <p className="text-primary-text"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};