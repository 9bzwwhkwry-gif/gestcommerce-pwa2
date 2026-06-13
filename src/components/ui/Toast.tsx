"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import type React from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
    error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
    warning: <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />,
  };

  const borders = {
    success: "border-green-500/30",
    error: "border-red-500/30",
    warning: "border-yellow-500/30",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-slate-800 border ${borders[toast.type]} rounded-2xl px-4 py-3 shadow-2xl max-w-sm w-full`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-500 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
