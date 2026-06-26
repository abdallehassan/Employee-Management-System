import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  key?: string;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    },
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-800 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-500" />,
    },
  };

  const current = config[type] || config.info;

  return (
    <div
      id="toast-notification"
      className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl border shadow-lg max-w-sm w-80 animate-fade-in-up transition-all duration-300 ${current.bg}`}
    >
      <div className="flex-shrink-0 mr-3">{current.icon}</div>
      <div className="flex-1 text-sm font-medium leading-relaxed break-words">{message}</div>
      <button
        id="toast-close-btn"
        onClick={onClose}
        className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
