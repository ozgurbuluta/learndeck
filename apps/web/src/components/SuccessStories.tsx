import React from 'react';
import { ArrowLeft, Users, Star } from 'lucide-react';

interface SuccessStoriesProps {
  onNavigate: (view: string) => void;
}

const testimonials = [
  {
    name: 'Mia (Germany)',
    quote: 'LearnDeck helped me add 3,000 English words to my active vocabulary in six months. The spaced repetition reminders were addictive!',
  },
  {
    name: 'Kenji (Japan)',
    quote: 'I used to forget new words within days. Now I review on the train every morning and my JLPT N2 reading score jumped 20%.',
  },
  {
    name: 'Sara (Brazil)',
    quote: 'The AI chatbot turned my word list into realistic dialogues. I feel way more confident speaking Spanish at work.',
  },
  {
    name: 'Liam (Canada)',
    quote: 'From scattered sticky notes to a single dashboard—LearnDeck keeps everything organised and tells me exactly what to study each day.',
  },
];

export const SuccessStories: React.FC<SuccessStoriesProps> = ({ onNavigate }) => {
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">Success Stories</h1>
            <p className="text-primary-text/70">Real learners, real results. Get inspired!</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border border-primary-bg rounded-xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-primary-highlight mr-2" />
                <h3 className="font-semibold text-primary-navy">{t.name}</h3>
              </div>
              <p className="text-primary-text leading-relaxed flex-1">“{t.quote}”</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}; 