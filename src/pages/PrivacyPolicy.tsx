import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy page component
 */
const PrivacyPolicy: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/">
                <img src="/Logo.webp" alt="Practice Perfect Logo" className="h-8 w-auto" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 inline-block p-4 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-8">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
          
          <div className="prose prose-blue max-w-none">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 mb-8">
              <p className="text-gray-700 text-lg">
                At Practice Perfect, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Information We Collect</h2>
              </div>
              <div className="ml-16">
                <p className="text-gray-700">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Create an account</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Set up your profile</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Create and track goals</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Record practice sessions</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Provide feedback or contact customer support</span>
                  </li>
                </ul>
                
                <p className="text-gray-700 mt-4">
                  This information may include:
                </p>
                <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Name and contact information (such as email address)</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Account credentials</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Profile information</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Goal and practice session data</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Device information and usage data</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">How We Use Your Information</h2>
              </div>
              <div className="ml-16">
                <p className="text-gray-700">
                  We use the information we collect to:
                </p>
                <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Provide, maintain, and improve our services</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Process and complete transactions</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Send you technical notices and support messages</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Respond to your comments and questions</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Develop new products and services</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Monitor and analyze trends and usage</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Detect, investigate, and prevent fraudulent transactions</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Personalize your experience</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">How We Share Your Information</h2>
              </div>
              <div className="ml-16">
                <p className="text-gray-700">
                  We may share your information with:
                </p>
                <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Service providers who perform services on our behalf</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>In response to legal process or when we believe it necessary to comply with the law</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>To protect the rights, property, or safety of Practice Perfect, our users, or others</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>In connection with a merger, sale of company assets, financing, or acquisition</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Your Choices</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    You can access and update certain information about yourself through your account settings. You may also unsubscribe from promotional communications by following the instructions in those messages. Note that even if you opt out, we may still send you non-promotional messages, such as those about your account or our ongoing business relations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Data Security</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Children's Privacy</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    Our services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information as quickly as possible.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Changes to this Privacy Policy</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the app or by other means, such as email. Your continued use of our services after the changes are made constitutes your acceptance of the changes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">Contact Us</h2>
              </div>
              <div className="ml-16">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
                  <p className="text-gray-700 mb-2">
                    If you have any questions or concerns about this Privacy Policy, please contact us at:
                  </p>
                  <a href="mailto:privacy@practiceperfect.com" className="text-blue-600 font-semibold text-lg hover:underline">
                    privacy@practiceperfect.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <img src="/Logo.webp" alt="Practice Perfect Logo" className="h-6 w-auto" />
            </div>
            <p className="mt-4 md:mt-0 text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Practice Perfect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
