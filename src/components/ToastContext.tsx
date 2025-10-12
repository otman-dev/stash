import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastContextProps {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  visible: boolean;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastIdCounter = 0;

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = toastIdCounter++;
    setToasts(prev => [...prev, { id, message, type, duration, visible: true }]);
    
    // Automatically remove toast after it's hidden
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 500); // Add 500ms buffer for exit animation
  };

  const closeToast = (id: number) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={() => closeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  );
}