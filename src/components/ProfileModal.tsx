import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updateEmail, updatePassword, deleteAccount, signOut } from '../services/supabase';
import ConfirmationModal from './ConfirmationModal';

interface ProfileModalProps {
  onClose: () => void;
}

type FormTab = 'profile' | 'email' | 'password' | 'danger';

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<FormTab>('profile');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  
  const handleTabChange = (tab: FormTab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateProfile({ firstName });
      setSuccess('Profile updated successfully!');
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
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateEmail({ email, password: currentPassword });
      setSuccess('Email update initiated. Please check your new email for confirmation.');
    } catch (err) {
      setError('Failed to update email. Please check your password and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      await updatePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please check your current password and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccountRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteAccount = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await deleteAccount({ password: deleteConfirmPassword });
      // Sign out and redirect to login page
      await signOut();
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
  
  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
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
        
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
          <button 
            className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => handleTabChange('email')}
          >
            Email
          </button>
          <button 
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => handleTabChange('password')}
          >
            Password
          </button>
          <button 
            className={`profile-tab danger-tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => handleTabChange('danger')}
          >
            Danger Zone
          </button>
        </div>
        
        <div className="profile-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'email' && (
            <form onSubmit={handleUpdateEmail}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="currentPasswordForUpdate">Current Password</label>
                <input
                  id="currentPasswordForUpdate"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'danger' && (
            <div className="danger-zone">
              <div className="danger-section">
                <h3>Sign Out</h3>
                <p>Sign out from this device.</p>
                <button 
                  className="danger-button"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  Sign Out
                </button>
              </div>
              
              <div className="danger-section">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all your data. This action cannot be undone.</p>
                <form onSubmit={handleDeleteAccountRequest}>
                  <div className="form-group">
                    <label htmlFor="deleteConfirmPassword">Enter your password to confirm</label>
                    <input
                      id="deleteConfirmPassword"
                      type="password"
                      value={deleteConfirmPassword}
                      onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="danger-button"
                    disabled={isLoading}
                  >
                    Delete My Account
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirmation(false)}
        isDanger={true}
      />
    </div>
  );
};

export default ProfileModal;
