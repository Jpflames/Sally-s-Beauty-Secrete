import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={cn(
          "bg-background w-full max-w-md rounded-xl shadow-lg border animate-in fade-in zoom-in-95 duration-200", 
          className
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
