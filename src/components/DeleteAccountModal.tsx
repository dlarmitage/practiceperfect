import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { deleteAccount } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setIsDeleting(true);
      const result = await deleteAccount!(password);
      setSuccessMessage(result.message);
      // The user will be automatically signed out by the deleteAccount function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting your account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
        
        {successMessage ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
              {successMessage}
            </div>
            <p className="text-gray-600">
              You will be redirected to the login page shortly.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              This action <span className="font-bold">cannot be undone</span>. All your goals, sessions, and personal data will be permanently deleted.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm your password to continue
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your password"
                  disabled={isDeleting}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
