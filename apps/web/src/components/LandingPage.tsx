import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  Trophy, 
  Users, 
  Shield, 
  Smartphone, 
  Monitor, 
  Star,
  Check,
  ChevronRight,
  Play,
  Zap,
  Heart,
  Globe,
  Rocket,
  Target,
  ArrowRight
} from 'lucide-react';
import { Footer } from './Footer';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSignUp }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced algorithms adapt to your learning style and optimize retention",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Spaced Repetition",
      description: "Scientifically-proven method to maximize long-term memory retention",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Detailed analytics and achievements to keep you motivated",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Learn from thousands of successful language learners worldwide",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "100% Free & Ad-Free",
      description: "No hidden costs, no annoying ads. Pure learning experience.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Instant Import",
      description: "Upload any document and extract vocabulary automatically with AI",
      color: "from-yellow-500 to-orange-500"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo-horizontal.png" alt="LearnDeck Logo" className="h-16" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-600 hover:text-primary-highlight transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={onSignUp}
                className="bg-gradient-to-r from-primary-highlight to-orange-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Sign Up / Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-4 py-2 text-sm font-medium text-green-800 border border-green-200">
                  <Sparkles className="h-4 w-4 mr-2" />
                  100% Free • No Ads • No Limits
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold">
                  <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                    Master Any
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-highlight via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    Vocabulary
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  The best free alternative to premium flashcard apps. 
                  Supercharge your language learning with AI-powered spaced repetition.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onSignUp}
                  className="group bg-gradient-to-r from-primary-highlight to-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Platform Icons */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm font-medium">Web App</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-sm font-medium">iOS App</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className={`relative ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
              <div className="relative z-10">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Today's Progress</h3>
                      <div className="flex items-center text-green-600">
                        <Trophy className="h-5 w-5 mr-1" />
                        <span className="font-medium">Streak: 15 days</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Words Learned</span>
                          <span className="text-xl font-bold text-blue-600">24/30</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-4/5"></div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Retention Rate</span>
                          <span className="text-xl font-bold text-purple-600">94%</span>
                        </div>
                        <div className="w-full bg-purple-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-11/12"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-gray-500 text-center">
                        ✨ AI optimizing your learning path in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 shadow-lg animate-bounce">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full p-3 shadow-lg animate-bounce animation-delay-1000">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Why Choose LearnDeck?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to master vocabulary efficiently, beautifully designed and completely free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* iOS App Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-highlight/20 to-orange-500/20"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Learn On The Go
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Take your vocabulary learning anywhere with our beautifully designed iOS app. 
                  Sync seamlessly across all your devices.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#"
                    className="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on App Store" className="h-12" />
                  </a>
                  <div className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 mr-2 text-green-400" />
                    <span>Coming to Android Soon</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-r from-primary-highlight to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Smartphone className="h-32 w-32 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 animate-bounce">
                    <Star className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-highlight to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Ready to Master Vocabulary?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful learners. Start your journey today - completely free, no credit card required.
          </p>
          <button
            onClick={onSignUp}
            className="group bg-white text-primary-highlight px-12 py-4 rounded-2xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto"
          >
            Get Started Free Now
            <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <p className="text-white/80 text-sm mt-4">
            ✓ No ads ✓ No limits ✓ No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />

    </div>
  );
};