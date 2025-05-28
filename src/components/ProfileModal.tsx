import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updateEmail, deleteAccount } from '../services/supabase';
import ConfirmationModal from './ConfirmationModal';
import PasswordChangeModal from './PasswordChangeModal';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.display_name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update profile information
      await updateProfile({ firstName });
      
      // Update email if password is provided
      if (currentPassword) {
        await updateEmail({ email, password: currentPassword });
        setCurrentPassword('');
      }
      
      // Update the user in context
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            display_name: firstName
          }
        });
      }
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. If you tried to change your email, please check your password.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordModalOpen = () => {
    setShowPasswordModal(true);
  };
  
  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };
  
  const handleDeleteAccountRequest = () => {
    setDeleteConfirmPassword('');
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await deleteAccount({ password: deleteConfirmPassword });
      onClose();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account. Please check your password and try again.');
      console.error(err);
      setShowDeleteConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
          <button 
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
          
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">Personal Information</h3>
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">Account Settings</h3>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                  <span className="ml-2 text-xs text-gray-500">(required only if changing email)</span>
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter password to change email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  className="btn btn-danger text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteAccountRequest}
                  disabled={isLoading}
                >
                  Delete Account
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePasswordModalOpen}
                  disabled={isLoading}
                >
                  Change Password
                </button>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Account"
        message={
          <>
            <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.</p>
            <div className="space-y-2">
              <label htmlFor="deleteConfirmPassword" className="block text-sm font-medium text-gray-700">Enter your password to confirm</label>
              <input
                id="deleteConfirmPassword"
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        }
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirmation(false)}
        isDanger={true}
      />
      
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={handlePasswordModalClose} 
        />
      )}
    </div>
  );
};

export default ProfileModal;
