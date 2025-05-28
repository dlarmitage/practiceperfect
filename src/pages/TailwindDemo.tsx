import React from 'react';
import TailwindButton from '../components/TailwindButton';

const TailwindDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tailwind CSS Demo</h1>
        
        <section className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <TailwindButton variant="primary">Primary Button</TailwindButton>
            <TailwindButton variant="secondary">Secondary Button</TailwindButton>
            <TailwindButton variant="danger">Danger Button</TailwindButton>
          </div>
        </section>
        
        <section className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <TailwindButton size="sm">Small Button</TailwindButton>
            <TailwindButton size="md">Medium Button</TailwindButton>
            <TailwindButton size="lg">Large Button</TailwindButton>
          </div>
        </section>
        
        <section className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Button States</h2>
          <div className="flex flex-wrap gap-4">
            <TailwindButton>Normal Button</TailwindButton>
            <TailwindButton disabled>Disabled Button</TailwindButton>
          </div>
        </section>
        
        <section className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
            <h2 className="text-3xl font-bold text-gray-800">Heading 2</h2>
            <h3 className="text-2xl font-semibold text-gray-800">Heading 3</h3>
            <h4 className="text-xl font-semibold text-gray-700">Heading 4</h4>
            <p className="text-base text-gray-600">This is a paragraph with <span className="font-medium text-blue-600">highlighted text</span> and <a href="#" className="text-blue-500 underline hover:text-blue-700">a link</a>.</p>
          </div>
        </section>
        
        <section className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                id="message" 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message"
              ></textarea>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <div>
              <TailwindButton type="submit">Submit</TailwindButton>
            </div>
          </div>
        </section>
        
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Card Title {item}</h3>
                  <p className="text-gray-600 text-sm mb-4">This is a sample card description that demonstrates how to use Tailwind CSS for card layouts.</p>
                  <TailwindButton size="sm">View Details</TailwindButton>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TailwindDemo;
