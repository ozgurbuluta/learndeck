import React from 'react';
import { Mail, Github, Twitter, Heart, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-3 mb-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center hover:opacity-80 transition-opacity duration-200 self-start"
              >
                <img src="/logo-horizontal.png" alt="LearnDeck Logo" className="h-16 w-auto" />
              </button>
              <p className="text-sm text-white/70">Vocabulary Mastery</p>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Master vocabulary with intelligent spaced repetition. Build your language skills efficiently with our scientifically-backed learning system.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://github.com/ozgurbuluta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/ozgurbulutttt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ozgurakanay/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@learndeck.online"
                className="text-white/60 hover:text-primary-highlight transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('add-word')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Add Words
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('progress')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Progress Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('word-list')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Word Collection
                </button>
              </li>
            </ul>
          </div>

          {/* Learning Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Learning</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('study-methods')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Study Methods
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('spaced-repetition-guide')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Spaced Repetition Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('language-tips')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Language Tips
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('success-stories')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Success Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms-of-service')}
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@learndeck.online"
                  className="text-white/70 hover:text-primary-highlight transition-colors duration-200 text-sm"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm text-white/70 mb-4 md:mb-0">
              <span>© {currentYear} LearnDeck. Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for language learners worldwide.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <button
                onClick={() => onNavigate('privacy-policy')}
                className="text-white/70 hover:text-primary-highlight transition-colors duration-200"
              >
                Privacy
              </button>
              <button
                onClick={() => onNavigate('terms-of-service')}
                className="text-white/70 hover:text-primary-highlight transition-colors duration-200"
              >
                Terms
              </button>
              <span className="text-white/50">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};