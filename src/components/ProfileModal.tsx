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
    <div className="modal-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>User Profile</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="profile-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleUpdate}>
            <div className="form-section">
              <h3 className="section-subtitle">Personal Information</h3>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="section-subtitle">Account Settings</h3>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="currentPassword">
                  Current Password
                  <span className="input-hint">(required only if changing email)</span>
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter password to change email"
                />
              </div>
            </div>
            

            
            <div className="modal-footer">
              <div className="footer-actions-left">
                <button 
                  type="button" 
                  className="primary-button danger-button"
                  onClick={handleDeleteAccountRequest}
                  disabled={isLoading}
                >
                  Delete Account
                </button>
                
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={handlePasswordModalOpen}
                  disabled={isLoading}
                >
                  Change Password
                </button>
              </div>
              
              <button 
                type="submit" 
                className="primary-button"
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
            <p>Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.</p>
            <div className="form-group">
              <label htmlFor="deleteConfirmPassword">Enter your password to confirm</label>
              <input
                id="deleteConfirmPassword"
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                required
                autoFocus
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
