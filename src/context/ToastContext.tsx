import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
        warning: (message: string) => void;
    };
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context.toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
        warning: (message: string) => addToast(message, 'warning'),
    };

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                    <AnimatePresence>
                        {toasts.map((t) => (
                            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

function ToastItem({
    toast,
    onRemove,
}: { toast: Toast; onRemove: (id: string) => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    };

    const bgColors = {
        success: 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/30',
        error: 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/30',
        info: 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30',
        warning: 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-900/30',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[toast.type]} min-w-[300px] max-w-sm backdrop-blur-sm`}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors"
                title="Dismiss Notification"
                aria-label="Dismiss Notification"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
