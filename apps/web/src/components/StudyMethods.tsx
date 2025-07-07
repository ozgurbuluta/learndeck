import React from 'react';
import { ArrowLeft, BookOpen, Repeat, Brain, Lightbulb, Globe } from 'lucide-react';

interface StudyMethodsProps {
  onNavigate: (view: string) => void;
}

export const StudyMethods: React.FC<StudyMethodsProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
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
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Study Methods</h1>
            <p className="text-primary-text/70">Find the right mix of techniques to super-charge your vocabulary learning.</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            {/* Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4">Why Multiple Methods?</h2>
              <p className="text-primary-text leading-relaxed">
                No single technique works for every learner or every word. Combining several complementary approaches keeps study sessions engaging and ensures words are stored in long-term memory. Below are the time-tested methods that LearnDeck encourages.
              </p>
            </section>

            {/* Flashcards & Active Recall */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <Repeat className="h-5 w-5 mr-2 text-primary-highlight" />
                Flashcards &amp; Active Recall
              </h3>
              <p className="text-primary-text leading-relaxed mb-4">
                Flashcards force you to <strong>actively recall</strong> a meaning rather than simply recognise it. This active struggle is what strengthens memory pathways. Keep cards short (one word or phrase per card) and test yourself in both directions: <em>word → definition</em> and <em>definition → word</em>.
              </p>
            </section>

            {/* Spaced Repetition */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary-highlight" />
                Spaced Repetition
              </h3>
              <p className="text-primary-text leading-relaxed mb-4">
                Re-reviewing material just before you are about to forget it multiplies retention while minimising study time. LearnDeck's algorithm automatically schedules each review so you can focus on learning, not logistics.
              </p>
            </section>

            {/* Mnemonics */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-primary-highlight" />
                Mnemonics &amp; Imagery
              </h3>
              <p className="text-primary-text leading-relaxed mb-4">
                Creating vivid stories, images or word associations provides extra "hooks" for your brain. The more unusual and personal the mnemonic, the more likely you'll remember the word weeks later.
              </p>
            </section>

            {/* Contextual Learning */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-highlight" />
                Contextual Learning
              </h3>
              <p className="text-primary-text leading-relaxed mb-4">
                Encountering vocabulary inside authentic sentences teaches nuance and typical collocations. Add sample sentences to cards and read articles, books or subtitles that naturally recycle new words.
              </p>
            </section>

            {/* Immersive Practice */}
            <section>
              <h3 className="text-xl font-medium text-primary-navy mb-3 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary-highlight" />
                Immersive Practice
              </h3>
              <p className="text-primary-text leading-relaxed">
                Use new words in writing, conversation and thinking. Real-world usage cements long-term mastery far better than passive review alone. Challenge yourself to weave target vocabulary into journal entries or language-exchange chats.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}; 