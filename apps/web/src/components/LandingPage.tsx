import React, { useEffect } from 'react';
import {
  ArrowRight,
  Brain,
  Check,
  Rocket,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Load Tally.so embed script
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center" aria-label="LearnDeck home">
            <img src="/logo-horizontal.png" alt="LearnDeck" className="h-12 w-auto" />
          </a>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#waitlist" className="hover:text-primary-highlight transition">Join waitlist</a>
            <a href="#features" className="hover:text-primary-highlight transition">Why LearnDeck</a>
            <a href="#how-it-works" className="hover:text-primary-highlight transition">How it works</a>
            <a href="#faq" className="hover:text-primary-highlight transition">FAQ</a>
          </nav>
          <a
            href="#waitlist"
            className="inline-flex items-center bg-gradient-to-r from-primary-highlight to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition"
          >
            Request access
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-gradient-to-br from-primary-highlight/20 via-pink-400/10 to-blue-500/20 blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center space-x-2 bg-white border border-primary-highlight/20 rounded-full px-4 py-1.5 text-sm text-primary-highlight font-medium shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span>LearnDeck is in private build</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Build a language habit that actually sticks.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                A free, ad-free language learning app built by a learner, for learners. Join the waitlist to get early access and help shape the product.
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span className="inline-flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>No spam — we only email with product updates.</span>
                </span>
                <span className="inline-flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Early input shapes the roadmap.</span>
                </span>
              </div>
            </div>

            <div id="waitlist" className="bg-white/90 backdrop-blur-lg rounded-3xl border border-white shadow-xl overflow-hidden">
              <div className="p-8 pb-6">
                <h2 className="text-2xl font-semibold mb-2">Join the private beta list</h2>
                <p className="text-sm text-slate-500">We will be in touch as soon as invites open.</p>
              </div>
              
              {/* Tally.so embed */}
              <div className="px-8 pb-8">
                <iframe
                  data-tally-src="https://tally.so/embed/w20qxM?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                  loading="lazy"
                  width="100%"
                  height="200"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Join the waitlist"
                  style={{ border: 0 }}
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-center">What is LearnDeck?</h2>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="space-y-6 text-lg text-white/80 leading-relaxed">
                  <p>
                    Hi, I'm Ozgur. I live in Munich, Germany, and I'm learning German. As I dove deeper into language learning, I realized something frustrating: you either need to pay a lot of money for premium apps or watch endless ads just to practice vocabulary effectively.
                  </p>
                  
                  <p>
                    Most language learning apps also suffer from the same problem — they're not sticky. You use them for a few days, then life gets busy, and you forget about them. The gamification feels forced, and the content doesn't always match what you actually need to learn.
                  </p>
                  
                  <p>
                    So I decided to build something different — something for myself and people like me. LearnDeck is completely free, with no ads, no premium tiers, and no paywalls. I designed it to be genuinely useful from day one, focusing on spaced repetition that actually works and vocabulary that matters to you.
                  </p>
                  
                  <p className="text-primary-highlight font-semibold">
                    I'm building this in public and would love your input. Join the waitlist to get early access, share feedback, and help shape what LearnDeck becomes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">The toolkit behind LearnDeck</h2>
              <p className="text-lg text-slate-500">Everything I'm building is focused on learners who need consistent, motivating vocabulary practice without paying for expensive apps or watching ads.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[{
                icon: Brain,
                title: 'Adaptive review engine',
                description: 'Custom scheduling for every term you collect. No generic intervals — your memory curve drives the timing.'
              }, {
                icon: Users,
                title: 'AI conversation partners',
                description: 'Practice speaking with voices tuned to your dialect level. Real-time feedback on pronunciation and flow.'
              }, {
                icon: Target,
                title: 'Goal-first dashboards',
                description: 'Weekly focus, gentle nudges, and a lightweight interface that celebrates streaks without the noise.'
              }, {
                icon: Rocket,
                title: 'Lightning-fast importing',
                description: 'Drop a PDF, book excerpt, or transcript — we surface the vocabulary that matters and auto-generate cards.'
              }, {
                icon: Check,
                title: 'Proof-based progress',
                description: 'See how recall speed and confidence shift over time. Designed for coaches, tutors, and solo learners alike.'
              }].map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                  <div className="inline-flex items-center justify-center rounded-xl bg-primary-highlight/10 text-primary-highlight w-12 h-12 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Questions we hear often</h2>
              <p className="text-base text-slate-500">Have more? Email <a href="mailto:support@learndeck.online" className="text-primary-highlight underline">support@learndeck.online</a>.</p>
            </div>

            <div className="space-y-6">
              {[{
                question: 'Is there a cost to join the waitlist?',
                answer: 'No. Joining is free and helps us understand demand. When paid plans arrive you will get the lowest lifetime price we ever offer.'
              }, {
                question: 'When will invites go out?',
                answer: 'We are shipping in waves during the coming months. Our first focus is daily review and speaking practice for intermediate learners. As soon as we cover your use case we will reach out.'
              }, {
                question: 'Will the current LearnDeck remain available?',
                answer: 'Yes. The existing app stays live for current users. The new experience builds on that foundation with a calmer interface, deeper analytics, and AI-guided sessions.'
              }, {
                question: 'Can teams or classrooms join?',
                answer: 'Absolutely. Mention it in the form — we are piloting team dashboards and shared decks with a handful of schools already.'
              }].map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-br from-primary-highlight/10 via-orange-100/40 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold">You bring the curiosity. I'll handle the structure.</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Get early access, behind-the-scenes updates, and help shape what LearnDeck becomes. It takes less than 30 seconds to join.
            </p>
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center space-x-2 rounded-full bg-primary-navy text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition"
            >
              <span>Join the waiting list</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
