import { SpeedInsights } from '@vercel/speed-insights/react';
import { 
  Brain, 
  Sparkles, 
  Trophy, 
  Zap,
  Smartphone,
  Globe,
  Heart,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Mic,
  BookOpen,
  Target
} from 'lucide-react';

function App() {
  const currentYear = new Date().getFullYear();

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
      description: "Detailed analytics, streaks, and achievements to keep you motivated",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Mic,
      title: "Voice Practice",
      description: "Practice pronunciation with speech recognition and get instant feedback",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Document Import",
      description: "Upload any document and extract vocabulary automatically with AI",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set daily goals and track your learning journey with smart reminders",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const languages = [
    "German", "Spanish", "French", "Italian", "Portuguese", 
    "Dutch", "Japanese", "Chinese", "Korean"
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
              <a
                href="#download"
                className="bg-gradient-to-r from-primary-highlight to-orange-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Download App
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="space-y-6">
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
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                AI-powered vocabulary learning with spaced repetition, voice practice, 
                and smart document import. Learn {languages.length} languages the smart way.
              </p>

              {/* App Store Buttons */}
              <div id="download" className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <a
                  href="https://apps.apple.com/app/learndeck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-105 transition-all duration-200"
                >
                  <img 
                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" 
                    alt="Download on the App Store" 
                    className="h-14"
                  />
                </a>
                <div className="flex items-center text-gray-500 bg-gray-100 px-6 py-3 rounded-xl">
                  <Smartphone className="h-5 w-5 mr-2" />
                  <span className="font-medium">Android Coming Soon</span>
                </div>
              </div>

              {/* Platform Badges */}
              <div className="flex items-center justify-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">{languages.length} Languages</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mic className="h-5 w-5" />
                  <span className="text-sm font-medium">Voice Practice</span>
                </div>
              </div>
            </div>

            {/* App Preview */}
            <div className="mt-16 relative">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Today's Progress</h3>
                    <div className="flex items-center text-green-600">
                      <Trophy className="h-5 w-5 mr-1" />
                      <span className="font-medium">15 day streak</span>
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

                  <p className="text-sm text-gray-500 text-center">
                    ✨ AI optimizing your learning path in real-time
                  </p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 right-1/4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 shadow-lg animate-bounce">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 left-1/4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full p-3 shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
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

      {/* Languages Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Learn {languages.length} Languages
            </h2>
            <p className="text-gray-600">
              With native language support for translations in 11 languages
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {languages.map((lang) => (
              <span
                key={lang}
                className="bg-white px-6 py-3 rounded-full text-gray-700 font-medium shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-highlight/30 transition-all duration-200"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-highlight to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Start Learning Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Download LearnDeck and join thousands of successful language learners. 
            Completely free, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://apps.apple.com/app/learndeck"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl px-2 py-2 transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
            >
              <img 
                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" 
                alt="Download on the App Store" 
                className="h-12"
              />
            </a>
          </div>
          
          <p className="text-white/80 text-sm mt-6">
            ✓ No ads ✓ No limits ✓ No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img src="/logo-horizontal.png" alt="LearnDeck Logo" className="h-12 mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Master vocabulary with intelligent spaced repetition. 
                Build your language skills efficiently with our AI-powered learning system.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="mailto:support@learndeck.online" className="hover:text-primary-highlight transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-primary-highlight transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-primary-highlight transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/ozgurbuluta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-highlight transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/ozgurbulutttt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-highlight transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ozgurakanay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-highlight transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@learndeck.online"
                  className="text-gray-400 hover:text-primary-highlight transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm text-gray-400 mb-4 md:mb-0">
              <span>© {currentYear} LearnDeck. Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>for language learners worldwide.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}

export default App;
