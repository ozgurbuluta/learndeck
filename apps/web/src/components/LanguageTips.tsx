import React from 'react';
import { ArrowLeft, MessageSquare, BookOpen, Headphones, PenLine, Mic, Globe } from 'lucide-react';

interface LanguageTipsProps {
  onNavigate: (view: string) => void;
}

export const LanguageTips: React.FC<LanguageTipsProps> = ({ onNavigate }) => {
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
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Language Learning Tips</h1>
            <p className="text-primary-text/70">Practical advice to accelerate your journey from beginner to fluent.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-primary-highlight" />
                Read Widely
              </h2>
              <p className="text-primary-text leading-relaxed">Books, articles and graded readers expose you to new vocabulary in context—an essential complement to flashcards. Choose content that is <em>just</em> above your comfort level for maximum comprehension and growth.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Headphones className="h-6 w-6 mr-2 text-primary-highlight" />
                Listen Actively
              </h2>
              <p className="text-primary-text leading-relaxed">Podcasts, music and movies train your ear for pronunciation, rhythm and everyday expressions. Try <strong>shadowing</strong>: repeat sentences out loud as you hear them to improve accent and intonation.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Mic className="h-6 w-6 mr-2 text-primary-highlight" />
                Speak From Day 1
              </h2>
              <p className="text-primary-text leading-relaxed">Conversation drives real progress. Use language-exchange apps, online tutors or local meet-ups. Making mistakes early builds confidence and highlights knowledge gaps for future review.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <PenLine className="h-6 w-6 mr-2 text-primary-highlight" />
                Write Consistently
              </h2>
              <p className="text-primary-text leading-relaxed">Keep a short daily journal, tweet or blog in your target language. Writing reinforces spelling, grammar and vocabulary retrieval. Ask native speakers to correct you via language forums.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-primary-highlight" />
                Think in the Language
              </h2>
              <p className="text-primary-text leading-relaxed">Try to label objects around you or describe what you see internally. Transitioning from translation to direct thinking speeds up comprehension and fluency.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-2 text-primary-highlight" />
                Immerse Yourself
              </h2>
              <p className="text-primary-text leading-relaxed">If possible, travel or create a digital immersion environment (change phone/computer language, follow social media accounts, watch live streams) so the language surrounds you daily.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}; 