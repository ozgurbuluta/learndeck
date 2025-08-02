import React from 'react';
import { ArrowLeft, BookOpen, Brain, Target, Users, Sparkles, Trophy, Heart, Mail, Github, Twitter, Linkedin } from 'lucide-react';

interface AboutProps {
  onNavigate: (view: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <div className="bg-white border-b border-primary-bg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-highlight rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-4">About LearnDeck</h1>
            <p className="text-xl text-primary-text max-w-3xl mx-auto">
              Empowering language learners worldwide with intelligent vocabulary mastery through scientifically-backed spaced repetition.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Target className="h-6 w-6 text-primary-highlight" />
              </div>
              <h2 className="text-3xl font-bold text-primary-navy mb-4">Our Mission</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-primary-text leading-relaxed mb-4">
                  At LearnDeck, we believe that mastering vocabulary shouldn't be a tedious memorization exercise. 
                  Our platform combines cutting-edge cognitive science with intuitive design to make language learning 
                  both effective and enjoyable.
                </p>
                <p className="text-primary-text leading-relaxed mb-4">
                  We're passionate about breaking down language barriers and helping people unlock new opportunities 
                  through the power of vocabulary mastery. Whether you're a student, professional, or lifelong learner, 
                  LearnDeck adapts to your unique learning style and pace.
                </p>
                <p className="text-primary-text leading-relaxed">
                  Join thousands of learners who have already transformed their language skills with our 
                  scientifically-proven spaced repetition system.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80" 
                    alt="Team collaboration" 
                    className="rounded-lg shadow-md w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-navy mb-4">Why Choose LearnDeck?</h2>
            <p className="text-primary-text max-w-2xl mx-auto">
              We've built a comprehensive learning platform that addresses every aspect of vocabulary acquisition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Brain className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">AI-Powered Learning</h3>
              <p className="text-primary-text">
                Our intelligent algorithms analyze your learning patterns and adapt to optimize retention and recall.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Sparkles className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">Spaced Repetition</h3>
              <p className="text-primary-text">
                Based on proven cognitive science, our system presents words at optimal intervals for maximum retention.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Trophy className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">Progress Tracking</h3>
              <p className="text-primary-text">
                Detailed analytics and achievements help you stay motivated and see your improvement over time.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">Smart Import</h3>
              <p className="text-primary-text">
                Upload documents and let our AI extract vocabulary automatically, making learning from any content effortless.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">Community Driven</h3>
              <p className="text-primary-text">
                Learn from a global community of language enthusiasts and share your own learning journey.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Heart className="h-6 w-6 text-primary-highlight" />
              </div>
              <h3 className="text-xl font-semibold text-primary-navy mb-3">Made with Care</h3>
              <p className="text-primary-text">
                Every feature is thoughtfully designed with learners in mind, ensuring an intuitive and delightful experience.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-highlight/10 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary-highlight" />
              </div>
              <h2 className="text-3xl font-bold text-primary-navy mb-4">Meet Our Team</h2>
              <p className="text-primary-text max-w-2xl mx-auto">
                We're a passionate team of educators, developers, and language enthusiasts dedicated to revolutionizing how people learn vocabulary.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Team member" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-primary-navy">Alex Thompson</h3>
                <p className="text-sm text-primary-highlight mb-2">Founder & CEO</p>
                <p className="text-sm text-primary-text">
                  Former linguistics professor with 15+ years in educational technology.
                </p>
              </div>
              
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" 
                  alt="Team member" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-primary-navy">Sarah Chen</h3>
                <p className="text-sm text-primary-highlight mb-2">CTO</p>
                <p className="text-sm text-primary-text">
                  AI researcher specializing in natural language processing and machine learning.
                </p>
              </div>
              
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" 
                  alt="Team member" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-primary-navy">Michael Rodriguez</h3>
                <p className="text-sm text-primary-highlight mb-2">Head of Design</p>
                <p className="text-sm text-primary-text">
                  UX designer passionate about creating intuitive learning experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-primary-highlight rounded-xl shadow-lg p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? We'd love to hear from you. 
              Our team is always here to help make your learning journey even better.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
              <a
                href="mailto:support@learndeck.online"
                className="bg-white text-primary-highlight px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200"
              >
                Contact Support
              </a>
              <button
                onClick={() => onNavigate('dashboard')}
                className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors duration-200"
              >
                Start Learning
              </button>
            </div>
            
            {/* Social Media Links */}
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/ozgurbuluta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/ozgurbulutttt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/ozgurakanay/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};