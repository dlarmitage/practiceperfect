import React from 'react';
import { Link } from 'react-router-dom';

// Utility placeholder for screenshots
const Placeholder = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 text-xl rounded-lg w-full h-full min-h-[200px] min-w-[200px]">
    {label}
  </div>
);

const LandingPageMockup: React.FC = () => (
  <div className="bg-white min-h-screen w-full text-gray-900">
    {/* Hero Section */}
    <header className="relative w-full h-[520px] flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500">
      <nav className="w-full flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-white tracking-tight">Practice Perfect</div>
        <div className="space-x-4">
          <Link to="/login" className="text-white hover:underline">Login</Link>
          <Link to="/signup" className="text-white bg-white/20 px-4 py-2 rounded hover:bg-white/30 font-semibold">Sign Up</Link>
        </div>
      </nav>
      <div className="flex flex-col items-center mt-10">
        <div className="w-[340px] h-[220px] md:w-[600px] md:h-[340px] mb-6 rounded-lg shadow-2xl overflow-hidden relative">
          <Placeholder label="[Hero Image with App UI Overlay]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Master Your Skills with Deliberate Practice</h1>
        <p className="text-xl text-white/90 mb-6 text-center max-w-xl">Track your goals, monitor your progress, and improve faster with data-driven insights.</p>
        <div className="flex gap-4">
          <Link to="/signup" className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow transition">Get Started Free</Link>
          <a href="#features" className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-lg shadow transition">Learn More</a>
        </div>
      </div>
    </header>

    {/* Features Section */}
    <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Features designed for effective practice</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="w-full h-48 mb-4">
            <Placeholder label="[Screenshot: Colorful Goal Cards]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Goal Tracking</h3>
          <p className="text-center text-gray-700">Track goals with custom targets and deadlines. Visual feedback with colorful cards for each state.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-48 mb-4">
            <Placeholder label="[Screenshot: Session Timer]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Session Timer</h3>
          <p className="text-center text-gray-700">Time your practice sessions and record notes for each session with ease.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full h-48 mb-4">
            <Placeholder label="[Screenshot: Practice Count Chart]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Analytics View</h3>
          <p className="text-center text-gray-700">Visualize your progress with detailed analytics, including Practice Count and completed goals.</p>
        </div>
      </div>
    </section>

    {/* App Demo Section */}
    <section className="py-20 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 w-full h-[320px] md:h-[400px]">
          <Placeholder label="[Animated GIF or Video: App Demo]" />
        </div>
        <div className="flex-1">
          <blockquote className="italic text-lg text-gray-700 border-l-4 border-blue-400 pl-4 mb-4">“The analytics feature helps me understand my practice patterns and improve faster.”</blockquote>
          <div className="text-gray-600 font-semibold">– Alex, Musician</div>
        </div>
      </div>
    </section>

    {/* Feature Highlight Section */}
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Powerful Analytics</h2>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 w-full h-64">
          <Placeholder label="[Screenshot: Analytics - Practice Count Chart]" />
        </div>
        <ul className="flex-1 space-y-4 text-lg text-gray-700">
          <li>• Track active and completed goals</li>
          <li>• Filter by time period</li>
          <li>• Visualize practice count and duration</li>
          <li>• Monitor past due goals</li>
        </ul>
      </div>
    </section>

    {/* Pricing Section */}
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Start Practicing Today</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>• 3 active goals</li>
            <li>• Basic analytics</li>
            <li>• Session tracking</li>
          </ul>
          <Link to="/signup" className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow">Get Started</Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center border-2 border-blue-400">
          <h3 className="text-2xl font-bold mb-4">Premium Plan</h3>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>• Unlimited goals</li>
            <li>• Advanced analytics</li>
            <li>• Goal templates</li>
            <li>• Data export</li>
          </ul>
          <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow">Upgrade Now</Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} Practice Perfect. All rights reserved.
    </footer>
  </div>
);

export default LandingPageMockup;
