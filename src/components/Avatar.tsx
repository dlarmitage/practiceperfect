import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ size = 'md' }) => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
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
  
  return (
    <>
      <button 
        className={`avatar ${sizeClass}`}
        style={{ backgroundColor: getBackgroundColor() }}
        onClick={() => setShowProfileModal(true)}
        aria-label="User profile"
      >
        {getInitials()}
      </button>
      
      {showProfileModal && (
        <ProfileModal 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </>
  );
};

export default Avatar;
