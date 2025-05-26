import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

/**
 * A reusable confirmation modal component
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-header">
          <h3 className="confirmation-title">{title}</h3>
        </div>
        <div className="confirmation-body">
          <p className="confirmation-message">{message}</p>
        </div>
        <div className="confirmation-footer">
          <button 
            onClick={onCancel} 
            className="confirmation-button cancel-button"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`confirmation-button ${isDanger ? 'danger-button' : 'confirm-button'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
