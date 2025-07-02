import React from 'react';
import { ArrowLeft, Clock, Brain, CheckCircle, HelpCircle, Activity } from 'lucide-react';

interface SpacedRepetitionGuideProps {
  onNavigate: (view: string) => void;
}

export const SpacedRepetitionGuide: React.FC<SpacedRepetitionGuideProps> = ({ onNavigate }) => {
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
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Spaced Repetition Guide</h1>
            <p className="text-primary-text/70">Understand the science that powers LearnDeck's scheduling.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <div className="prose prose-lg max-w-none">
            {/* What is SR? */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Brain className="h-6 w-6 mr-2 text-primary-highlight" />
                What is Spaced Repetition?
              </h2>
              <p className="text-primary-text leading-relaxed">
                Spaced repetition (SR) is a learning technique where reviews are <strong>spaced</strong> at increasing intervals that match your brain's forgetting curve. You see an item again right before you would normally forget it, which reinforces memory with minimal effort.
              </p>
            </section>

            {/* How does it work? */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary-highlight" />
                How Does It Work?
              </h2>
              <ol className="list-decimal list-inside text-primary-text space-y-2">
                <li>You learn a new word for the first time.</li>
                <li>LearnDeck schedules the first review minutes or hours later.</li>
                <li>Each successful recall lengthens the interval (1 day → 3 days → 1 week → 1 month ...).</li>
                <li>If you forget, the interval shortens so the word re-enters your short-term memory.</li>
              </ol>
            </section>

            {/* Algorithm */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-primary-highlight" />
                LearnDeck Algorithm
              </h2>
              <p className="text-primary-text leading-relaxed mb-4">
                Our algorithm is inspired by the best of SM-2 and SuperMemo's later revisions but simplified for transparency. Each card has an <em>easiness factor</em> that increases with correct answers and decreases when you forget. Intervals are then calculated as:
              </p>
              <pre className="bg-primary-cream/50 p-4 rounded-lg overflow-x-auto text-sm">
{`newInterval = previousInterval * easinessFactor`}</pre>
              <p className="text-primary-text leading-relaxed">
                This dynamic system adapts to <strong>you</strong>—fast learners breeze through easy words, while tricky vocabulary appears more often until mastered.
              </p>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                Best Practices
              </h2>
              <ul className="list-disc list-inside text-primary-text space-y-1">
                <li>Study <strong>every day</strong>, even if only for 5 minutes.</li>
                <li>Be honest when grading yourself—false positives delay reviews and hurt retention.</li>
                <li>Add <em>context sentences</em> to make abstract words more memorable.</li>
                <li>Aim for 85-95% accuracy; too high means intervals could lengthen, too low means you are over-loading.</li>
              </ul>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="text-2xl font-semibold text-primary-navy mb-4 flex items-center">
                <HelpCircle className="h-6 w-6 mr-2 text-primary-highlight" />
                Frequently Asked Questions
              </h2>
              <h3 className="text-primary-navy text-lg font-medium mb-2">Do I need to finish all reviews every day?</h3>
              <p className="text-primary-text mb-4">Ideally yes—overdue cards lose accuracy—but partial reviews are still better than none. Prioritise consistency over perfection.</p>

              <h3 className="text-primary-navy text-lg font-medium mb-2">Can I manually set intervals?</h3>
              <p className="text-primary-text mb-4">LearnDeck automates scheduling so you can focus on learning, but you can reset or suspend cards in the Word List if needed.</p>

              <h3 className="text-primary-navy text-lg font-medium mb-2">What about cramming?</h3>
              <p className="text-primary-text">Cramming leads to short-term gains and quick forgetting. SR spaced across days or weeks is far superior for durable memory.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}; 