import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import { signOut } from '../services/supabase';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ size = 'md' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
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
  
  // Generate a consistent background color based on the user's ID
  const getBackgroundColor = () => {
    if (!user?.id) return '#3b82f6'; // Default blue
    
    // Simple hash function to generate a color
    const hash = user.id.split('').reduce((acc: number, char: string) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Convert to HSL color with good saturation and lightness
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 60%)`;
  };
  
  // Determine size class
  const sizeClass = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg'
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
    <div className="avatar-container" ref={dropdownRef}>
      <button 
        className={`avatar ${sizeClass}`}
        style={{ backgroundColor: getBackgroundColor() }}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User profile"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {getInitials()}
      </button>
      
      {showDropdown && (
        <div className="avatar-dropdown">
          <button 
            className="dropdown-item"
            onClick={() => {
              setShowDropdown(false);
              setShowProfileModal(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>
          <button 
            className="dropdown-item"
            onClick={() => {
              setShowDropdown(false);
              handleSignOut();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    </div>
  );
};

export default Avatar;
