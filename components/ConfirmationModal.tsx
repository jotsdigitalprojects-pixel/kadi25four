import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 p-6 sm:p-8 rounded-xl shadow-2xl text-center text-gray-800 max-w-md w-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">{title}</h2>
                <p className="text-base sm:text-lg text-gray-700 mb-8">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-32 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-32 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;