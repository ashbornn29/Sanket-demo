import React, { useState, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle size={16} className="text-red-400 flex-shrink-0" />,
    info: <Info size={16} className="text-amber-400 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-800/60 bg-[#121f19]',
    error: 'border-red-800/60 bg-[#241316]',
    info: 'border-amber-800/60 bg-[#211a14]'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl min-w-[280px] max-w-[400px] text-xs text-[#eef0f6] font-sans ${borders[toast.type] || borders.info}`}>
      {icons[toast.type] || icons.info}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button onClick={onClose} className="text-[#6b7194] hover:text-[#eef0f6] transition-colors p-0.5">
        <X size={13} />
      </button>
    </div>
  );
}
