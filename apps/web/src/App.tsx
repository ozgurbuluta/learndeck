import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { ResetPassword } from './components/ResetPassword';
import { Dashboard } from './components/Dashboard';
import { AddWord } from './components/AddWord';
import { ImportWords } from './components/ImportWords';
import { StudySession } from './components/StudySession';
import { Quiz } from './components/Quiz';
import { WordList } from './components/WordList';
import { Progress } from './components/Progress';
import { Profile } from './components/Profile';
import { About } from './components/About';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookiePolicy } from './components/CookiePolicy';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingChatbot } from './components/FloatingChatbot';
import { useAuth } from './hooks/useAuth';
import { useWords } from './hooks/useWords';
import { useState, useEffect } from 'react';
import { StudyMethods } from './components/StudyMethods';
import { SpacedRepetitionGuide } from './components/SpacedRepetitionGuide';
import { LanguageTips } from './components/LanguageTips';
import { SuccessStories } from './components/SuccessStories';
import { SpeedInsights } from '@vercel/speed-insights/react';

type View =
  | 'dashboard'
  | 'add-word'
  | 'import-words'
  | 'study'
  | 'quiz'
  | 'progress'
  | 'word-list'
  | 'profile'
  | 'about'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'cookie-policy'
  | 'study-methods'
  | 'spaced-repetition-guide'
  | 'language-tips'
  | 'success-stories';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { words, loading: wordsLoading, addWord, updateWord, deleteWord } = useWords(user);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Scroll to top on view change to ensure expected UX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Unified navigation handler to satisfy component prop types
  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    // If navigating to a page from auth, close auth
    if (showAuth && view !== 'dashboard') {
      setShowAuth(false);
    }
  };

  // Handle navigation back to home (landing page if logged out, dashboard if logged in)
  const handleNavigateHome = () => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('dashboard'); // This will show landing page for logged out users
      setShowAuth(false);
    }
  };

  // Check if this is a password reset page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'recovery') {
      // This is a password reset link, show the reset password component
      return;
    }
  }, []);

  // Check if this is a password reset page
  const urlParams = new URLSearchParams(window.location.search);
  const isPasswordReset = urlParams.get('type') === 'recovery';

  if (isPasswordReset) {
    return <ResetPassword />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-highlight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <Auth onNavigate={handleNavigate} onBack={handleNavigateHome} />;
    }
    
    // Handle navigation for logged-out users
    if (currentView === 'about') {
      return <About onNavigate={handleNavigate} />;
    }
    if (currentView === 'privacy-policy') {
      return <PrivacyPolicy onNavigate={handleNavigate} />;
    }
    if (currentView === 'terms-of-service') {
      return <TermsOfService onNavigate={handleNavigate} />;
    }
    if (currentView === 'cookie-policy') {
      return <CookiePolicy onNavigate={handleNavigate} />;
    }
    if (currentView === 'study-methods') {
      return <StudyMethods onNavigate={handleNavigate} />;
    }
    if (currentView === 'spaced-repetition-guide') {
      return <SpacedRepetitionGuide onNavigate={handleNavigate} />;
    }
    if (currentView === 'language-tips') {
      return <LanguageTips onNavigate={handleNavigate} />;
    }
    if (currentView === 'success-stories') {
      return <SuccessStories onNavigate={handleNavigate} />;
    }
    
    return (
      <LandingPage 
        onNavigate={handleNavigate} 
        onSignUp={() => setShowAuth(true)} 
      />
    );
  }

  if (wordsLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-highlight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddWordsFromAI = async (words: Array<{ word: string; definition: string }>, folderIds: string[]) => {
    for (const wordData of words) {
      await addWord(wordData, folderIds);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'add-word':
        return <AddWord onAddWord={addWord} onNavigate={handleNavigate} currentView={currentView} />;
      case 'import-words':
        return <ImportWords onNavigate={handleNavigate} currentView={currentView} />;
      case 'study':
        return <StudySession words={words} onUpdateWord={updateWord} onNavigate={handleNavigate} currentView={currentView} />;
      case 'quiz':
        return <Quiz words={words} onUpdateWord={updateWord} onNavigate={handleNavigate} currentView={currentView} />;
      case 'word-list':
        return <WordList words={words} onNavigate={handleNavigate} onDeleteWord={deleteWord} onUpdateWord={updateWord} currentView={currentView} />;
      case 'progress':
        return <Progress words={words} onNavigate={handleNavigate} currentView={currentView} />;
      case 'profile':
        return <Profile words={words} onNavigate={handleNavigate} currentView={currentView} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={handleNavigate} />;
      case 'cookie-policy':
        return <CookiePolicy onNavigate={handleNavigate} />;
      case 'study-methods':
        return <StudyMethods onNavigate={handleNavigate} />;
      case 'spaced-repetition-guide':
        return <SpacedRepetitionGuide onNavigate={handleNavigate} />;
      case 'language-tips':
        return <LanguageTips onNavigate={handleNavigate} />;
      case 'success-stories':
        return <SuccessStories onNavigate={handleNavigate} />;
      default:
        return <Dashboard words={words} onNavigate={handleNavigate} currentView={currentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Header onNavigate={handleNavigate} currentView={currentView} words={words} />
      <div className="flex-1">
        {renderCurrentView()}
      </div>
      <Footer onNavigate={handleNavigate} />
      
      {/* Floating AI Chatbot */}
      <FloatingChatbot
        onAddWords={handleAddWordsFromAI}
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}

export default App;