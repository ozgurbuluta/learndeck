import React from 'react';
import { Mail, Github, Twitter, Heart, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy text-white mt-24" id="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <img src="/logo-horizontal.png" alt="LearnDeck" className="h-16 w-auto" />
            <p className="text-white/70 text-sm leading-relaxed">
              A free, ad-free language learning app built for learners who want effective vocabulary practice without the paywalls.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://github.com/ozgurbuluta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/ozbwrites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ozgurakanay/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-primary-highlight transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@learndeck.online"
                className="text-white/60 hover:text-primary-highlight transition"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-4">Explore</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              <li><a href="#features" className="hover:text-primary-highlight transition">Key Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary-highlight transition">How It Works</a></li>
              <li><a href="#faq" className="hover:text-primary-highlight transition">FAQ</a></li>
              <li><a href="#waitlist" className="hover:text-primary-highlight transition">Join the Waitlist</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              <li><span className="block">support@learndeck.online</span></li>
              <li><span className="block">Munich</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wide text-sm mb-4">Stay Updated</h4>
            <p className="text-white/70 text-sm mb-4">
              Follow along on social media while I build LearnDeck in public. Share your feedback and help shape the product.
            </p>
            <div className="flex space-x-3 text-sm text-white/80">
              <span className="inline-flex items-center space-x-1">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Built by a learner, for learners</span>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>© {currentYear} LearnDeck. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="mailto:support@learndeck.online" className="hover:text-primary-highlight transition">Contact</a>
            <a href="https://www.learndeck.online/privacy" className="hover:text-primary-highlight transition" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="https://www.learndeck.online/terms" className="hover:text-primary-highlight transition" target="_blank" rel="noopener noreferrer">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
