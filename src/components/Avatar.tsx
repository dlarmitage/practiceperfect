import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import HelpfulHintsModal from './HelpfulHintsModal';
import { signOut } from '../services/supabase';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ size = 'md' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpfulHintsModal, setShowHelpfulHintsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get the display name or email to show initials
  const displayName = user?.user_metadata?.display_name || user?.email || '';
  
  // Get initials (first letter of first name and last name, or first two letters of email)
  const getInitials = () => {
    if (!displayName) return '?';
    
    if (displayName.includes('@')) {
      // It's an email
      return displayName.substring(0, 2).toUpperCase();
    } else {
      // It's a name, get first letter of each word
      return displayName
        .split(' ')
        .map((part: string) => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  };
  
  // Use a medium grey for the avatar background
  const getBackgroundColor = () => {
    return '#6B7280'; // Medium grey (Tailwind gray-500)
  };
  
  // Determine size class based on the size prop
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }[size];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        style={{ backgroundColor: getBackgroundColor() }}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User profile"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {getInitials()}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5 animate-fadeIn">
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setShowDropdown(false);
              setShowProfileModal(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setShowDropdown(false);
              setShowHelpfulHintsModal(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="17" x2="12" y2="17"></line>
            </svg>
            Helpful Hints
          </button>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setShowDropdown(false);
              handleSignOut();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      )}
      
      {showProfileModal && (
        <ProfileModal 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
      
      {showHelpfulHintsModal && (
        <HelpfulHintsModal
          onClose={() => setShowHelpfulHintsModal(false)}
        />
      )}
    </div>
  );
};

export default Avatar;
