import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div
          className={`relative w-full ${maxWidthClasses} transform overflow-hidden rounded-2xl bg-[#121A2B] p-6 text-left shadow-2xl transition-all border border-[#2B3850] my-8`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#2B3850] mb-5">
            <h3 className="text-lg font-bold text-[#F1F5F9]">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-[#F1F5F9] transition p-1.5 rounded-lg hover:bg-[#182338] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-[#F1F5F9]">{children}</div>
        </div>
      </div>
    </div>
  );
};
