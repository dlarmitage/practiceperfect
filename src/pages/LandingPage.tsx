import React from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';

/**
 * Landing page component for Practice Perfect
 */
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/Logo.webp" alt="Practice Perfect Logo" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                Log in
              </Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="relative">
          {/* Hero Slider */}
          <HeroSlider interval={7000} />
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Master Your Skills with <span className="text-blue-400">Deliberate Practice</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90 drop-shadow-md">
              Track your goals, monitor your progress, and improve faster with data-driven insights.
            </p>
            <div className="mt-10 flex justify-center gap-3 sm:gap-4">
              <Link 
                to="/signup" 
                className="px-5 py-2 sm:px-8 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors"
              >
                Get Started Free
              </Link>
              <a 
                href="#features" 
                className="px-5 py-2 sm:px-8 sm:py-3 text-sm sm:text-base bg-white text-blue-600 border border-blue-200 hover:border-blue-300 font-medium rounded-md shadow-sm transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        {/* App Screenshot */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 bg-opacity-10 rounded-3xl w-full h-full max-w-4xl mx-auto"></div>
          </div>
          <img 
            src="/app-screenshot.png" 
            alt="Practice Perfect App Screenshot" 
            className="relative rounded-xl shadow-xl mx-auto max-w-4xl"
            onError={(e) => {
              // If image doesn't exist, use a placeholder
              e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Practice+Perfect+App';
            }}
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Features designed for effective practice</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Everything you need to track, analyze, and improve your practice sessions.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Tracking</h3>
              <p className="text-gray-600">
                Create custom practice goals with targets and deadlines. Track your progress with a simple tap or long press.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Tracking</h3>
              <p className="text-gray-600">
                Record detailed practice sessions with duration, mood, and notes. Get insights into your practice habits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analysis</h3>
              <p className="text-gray-600">
                Visualize your practice data with interactive charts. Identify trends and areas for improvement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Subjective Feedback</h3>
              <p className="text-gray-600">
                Record how you felt during practice sessions. Track your mood and motivation over time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Reminders</h3>
              <p className="text-gray-600">
                Get notified when you're falling behind on your practice goals. Stay consistent with helpful reminders.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">
                Access your practice data anywhere. Works on all devices with a responsive, intuitive interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How Practice Perfect works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              A simple process to improve your skills through deliberate practice.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Goals</h3>
              <p className="text-gray-600">
                Set up practice goals with targets and deadlines. Organize them by priority.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Sessions</h3>
              <p className="text-gray-600">
                Log your practice sessions with detailed information about duration and quality.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze & Improve</h3>
              <p className="text-gray-600">
                Review your practice data and insights to continuously improve your approach.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What our users say</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Practice Perfect has helped thousands improve their skills.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">JM</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Jamie M.</h4>
                  <p className="text-sm text-gray-500">Musician</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Practice Perfect has transformed how I approach my piano practice. I can see my progress over time and identify which techniques need more work."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">SK</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sarah K.</h4>
                  <p className="text-sm text-gray-500">Language Learner</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I've tried many apps to track my language learning, but Practice Perfect is the only one that helps me understand which study methods are actually working."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">DR</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">David R.</h4>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The session tracking feature has been a game-changer for my coding practice. I can now see which areas I'm spending time on and optimize my learning."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Ready to perfect your practice?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-100">
            Join thousands of users who are improving their skills with deliberate practice.
          </p>
          <div className="mt-8">
            <Link to="/signup" className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md shadow-md hover:bg-blue-50 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <img src="/Logo.webp" alt="Practice Perfect Logo" className="h-8 w-auto" />
              </div>
              <p className="mt-2 text-gray-500 text-sm">
                The ultimate tool for tracking and improving your practice sessions.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="text-gray-500 hover:text-blue-600">Goal Tracking</a></li>
                <li><a href="#features" className="text-gray-500 hover:text-blue-600">Session Tracking</a></li>
                <li><a href="#features" className="text-gray-500 hover:text-blue-600">Data Analysis</a></li>
                <li><a href="#features" className="text-gray-500 hover:text-blue-600">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="text-gray-500 hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/privacy-policy" className="text-gray-500 hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-gray-500 hover:text-blue-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Practice Perfect. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
