"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    isLoading = false,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const btnColor = variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                  variant === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                  'bg-accent hover:bg-accent/90 text-black';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-surface border border-divider/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
                    ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}
                `}>
                    <i className={`fa-solid ${variant === 'danger' ? 'fa-triangle-exclamation' : 'fa-info'} text-xl`}></i>
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
                <p className="text-sm text-secondary mb-6">{message}</p>
                
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 text-secondary transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${btnColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading && <i className="fa-solid fa-circle-notch fa-spin"></i>}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
