import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>{title}</h3>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-600">{message}</div>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={isDanger 
              ? 'btn btn-danger text-sm' 
              : 'btn btn-primary text-sm'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
