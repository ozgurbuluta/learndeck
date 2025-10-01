import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  Check,
  Clock,
  Mail,
  Rocket,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Footer } from './Footer';

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [status, setStatus] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);

  const languageOptions = [
    'Arabic',
    'Chinese (Mandarin)',
    'Chinese (Cantonese)',
    'Dutch',
    'English',
    'French',
    'German',
    'Greek',
    'Hebrew',
    'Hindi',
    'Indonesian',
    'Italian',
    'Japanese',
    'Korean',
    'Polish',
    'Portuguese',
    'Russian',
    'Spanish',
    'Swedish',
    'Turkish',
    'Vietnamese',
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setStatus('error');
      setErrorMessage('Please enter your email so we can reach out.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.from('waiting_list_signups').insert({
        email: trimmedEmail,
        source: 'web_waiting_list',
        metadata: {
          languages: selectedLanguages,
        },
      });

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setEmail('');
          setSelectedLanguages([]);
          setLanguageSearch('');
          return;
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
      setSelectedLanguages([]);
      setLanguageSearch('');
    } catch (err: unknown) {
      console.error('Waitlist submission failed', err);
      setStatus('error');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again or email support@learndeck.online.');
      }
    }
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((item) => item !== language)
        : [...prev, language]
    );
  };

  const handleLanguageSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && languageSearch.trim()) {
      event.preventDefault();
      const normalized = languageSearch.trim();
      setSelectedLanguages((prev) =>
        prev.includes(normalized) ? prev : [...prev, normalized]
      );
      setLanguageSearch('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguagePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguageOptions = languageOptions.filter((option) =>
    option.toLowerCase().includes(languageSearch.toLowerCase())
  );

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
                <span>LearnDeck 2.0 is in private build</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Build a language habit that actually sticks.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                We are reimagining spaced repetition with AI coaching, conversational practice, and a calmer learning interface. Join the waiting list to help steer the launch and get early access first.
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

            <div id="waitlist" className="bg-white/90 backdrop-blur-lg rounded-3xl border border-white shadow-xl p-8">
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-semibold">Join the private beta list</h2>
                <p className="text-sm text-slate-500">Share your focus language and we will be in touch as soon as invites open.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm font-medium text-slate-600">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-primary-highlight focus:outline-none focus:ring-2 focus:ring-primary-highlight/40"
                  />
                </label>

                <div className="text-sm font-medium text-slate-600">
                  What language are you focused on?
                  <div className="mt-2" ref={languageDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsLanguagePickerOpen((prev) => !prev)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-base shadow-sm focus:border-primary-highlight focus:outline-none focus:ring-2 focus:ring-primary-highlight/40 flex flex-wrap items-center gap-2"
                    >
                      {selectedLanguages.length === 0 ? (
                        <span className="text-slate-400">Select one or more languages</span>
                      ) : (
                        selectedLanguages.map((language) => (
                          <span
                            key={language}
                            className="inline-flex items-center rounded-full bg-primary-highlight/10 text-primary-highlight px-3 py-1 text-sm"
                          >
                            {language}
                          </span>
                        ))
                      )}
                    </button>

                    {isLanguagePickerOpen && (
                      <div className="relative">
                        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl">
                          <div className="p-3 border-b border-slate-100">
                            <input
                              type="text"
                              value={languageSearch}
                              onChange={(event) => setLanguageSearch(event.target.value)}
                              onKeyDown={handleLanguageSearchKeyDown}
                              placeholder="Search languages or press Enter to add"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-highlight focus:outline-none focus:ring-2 focus:ring-primary-highlight/30"
                            />
                          </div>
                          <div className="max-h-56 overflow-y-auto p-3 space-y-2">
                            {filteredLanguageOptions.length === 0 && languageSearch && (
                              <button
                                type="button"
                                onClick={() => {
                                  const normalized = languageSearch.trim();
                                  if (!normalized) return;
                                  setSelectedLanguages((prev) =>
                                    prev.includes(normalized) ? prev : [...prev, normalized]
                                  );
                                  setLanguageSearch('');
                                }}
                                className="w-full rounded-lg border border-dashed border-primary-highlight/40 px-3 py-2 text-left text-sm text-primary-highlight hover:bg-primary-highlight/10"
                              >
                                Add “{languageSearch.trim()}”
                              </button>
                            )}

                            {filteredLanguageOptions.map((option) => {
                              const checked = selectedLanguages.includes(option);
                              return (
                                <label
                                  key={option}
                                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                  <span>{option}</span>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleLanguage(option)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-highlight focus:ring-primary-highlight"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-highlight to-orange-500 text-white font-semibold py-3.5 shadow-lg hover:shadow-xl transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      <span>Saving you to the list...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Join the waiting list</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>

                {status === 'success' && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    🎉 Thanks! You're on the list. Check your inbox for a quick hello and we will reach out before the next milestone.
                  </div>
                )}

                {status === 'error' && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage || 'We could not save your request. Please retry in a moment.'}
                  </div>
                )}

                <p className="text-xs text-slate-400 flex items-start space-x-2">
                  <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>We respect your inbox. Unsubscribe any time with one click.</span>
                </p>
              </form>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">The toolkit behind LearnDeck 2.0</h2>
              <p className="text-lg text-slate-500">Everything we are building is ruthlessly focused on non-native speakers who need consistent, motivating vocabulary practice.</p>
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
              }, {
                icon: Sparkles,
                title: 'Focus mode interface',
                description: 'Minimal UI, ambient soundscapes, and “done for the day” clarity that makes daily review sustainable.'
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

        <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold">What happens after you join?</h2>
                <p className="text-lg text-white/70">We are releasing LearnDeck 2.0 in cohorts so we can keep feedback loops tight. Joining the waitlist keeps you in the loop at every stage.</p>

                <ul className="space-y-4">
                  {[{
                    title: '1. Welcome email',
                    description: 'You receive a short overview with our current roadmap and can tell us more about your learning setup.'
                  }, {
                    title: '2. Sneak peeks & feedback calls',
                    description: 'We share design previews, research notes, and invite you to optional user interviews.'
                  }, {
                    title: '3. Early access wave',
                    description: 'When your learning goals line up with a feature wave, we send you a private beta invite.'
                  }].map((item) => (
                    <li key={item.title} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <Clock className="h-5 w-5 text-primary-highlight" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary-highlight/30 blur-3xl rounded-full" />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold mb-4">Why a waitlist?</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    LearnDeck started as a personal project to organise vocabulary from real-life conversations. The new version doubles down on this — smaller cohorts mean we can keep talking directly to learners and ship at the speed of insight. Your responses shape feature priority and onboarding.
                  </p>
                </div>
              </div>
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
            <h2 className="text-3xl sm:text-4xl font-bold">You bring the curiosity. We handle the structure.</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Get early access updates, behind-the-scenes product notes, and priority onboarding when we open LearnDeck 2.0. It takes less than 30 seconds to join the list.
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
