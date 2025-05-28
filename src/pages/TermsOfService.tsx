import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Terms of Service page component
 */
const TermsOfService: React.FC = () => {
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 inline-block p-4 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-indigo-100">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 -mt-8">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
          
          <div className="prose prose-blue max-w-none">
            <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-100 mb-8">
              <p className="text-gray-700 text-lg">
                Welcome to Practice Perfect. Please read these Terms of Service ("Terms") carefully as they contain important information about your legal rights, remedies, and obligations. By accessing or using Practice Perfect, you agree to be bound by these Terms and our Privacy Policy.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">1. Acceptance of Terms</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    By creating an account, accessing, or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our services.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">2. Description of Services</h2>
              </div>
              <div className="ml-16">
                <p className="text-gray-700">
                  Practice Perfect provides tools for tracking practice goals, recording practice sessions, and analyzing practice data. Our services include:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center p-2">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <span>Goal tracking and management</span>
                  </div>
                  <div className="flex items-center p-2">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span>Practice session recording and timing</span>
                  </div>
                  <div className="flex items-center p-2">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <span>Progress analytics and visualization</span>
                  </div>
                  <div className="flex items-center p-2">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <span>User account management</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">3. User Accounts</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    To use certain features of our services, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">4. User Content</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    Our services may allow you to create, upload, store, and share content. You retain ownership of any intellectual property rights that you hold in that content. By uploading content to our services, you grant Practice Perfect a worldwide, royalty-free license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display, and distribute that content for the limited purpose of operating, promoting, and improving our services.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">5. Prohibited Conduct</h2>
              </div>
              <div className="ml-16">
                <p className="text-gray-700">
                  You agree not to:
                </p>
                <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <li className="flex items-center py-2">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Use our services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying our services</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Use our services in any way that could damage, disable, overburden, or impair the functioning of our services</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Attempt to circumvent any filtering, security measures, or other features designed to protect our services or third parties</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Use our services for any illegal or unauthorized purpose</span>
                  </li>
                  <li className="flex items-center py-2">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Violate any applicable law or regulation in connection with your use of our services</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">6. Intellectual Property Rights</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    Our services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Practice Perfect, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">7. Termination</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    We may terminate or suspend your account and access to our services at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use our services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">8. Disclaimer of Warranties</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0 font-medium">
                    OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, THAT DEFECTS WILL BE CORRECTED, OR THAT OUR SERVICES OR THE SERVER(S) THAT MAKES OUR SERVICES AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">9. Limitation of Liability</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0 font-medium">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PRACTICE PERFECT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE OUR SERVICES; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON OUR SERVICES; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">10. Changes to Terms</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    We may revise these Terms from time to time. The most current version will always be posted on our website. If a revision, in our sole discretion, is material, we will notify you via email to the email address associated with your account or through our services. By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised Terms.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">11. Governing Law</h2>
              </div>
              <div className="ml-16">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 m-0">
                    These Terms and any action related thereto will be governed by the laws of the State of California without regard to its conflict of law provisions. The exclusive jurisdiction and venue of any action with respect to the subject matter of these Terms will be the state and federal courts located in San Francisco County, California, and you waive any objection to jurisdiction and venue in such courts.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0">12. Contact Information</h2>
              </div>
              <div className="ml-16">
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 text-center">
                  <p className="text-gray-700 mb-2">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <a href="mailto:support@practiceperfect.com" className="text-indigo-600 font-semibold text-lg hover:underline">
                    support@practiceperfect.com
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

export default TermsOfService;
