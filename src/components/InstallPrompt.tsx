import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt if not already installed (checked by event firing)
            // and maybe wait a bit to not be intrusive
            setTimeout(() => setIsVisible(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] md:w-auto"
            >
                <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 dark:border-slate-200/20">
                    <div className="bg-indigo-500 rounded-xl p-2">
                        <Download className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-sm">Install App</h4>
                        <p className="text-xs text-slate-300 dark:text-slate-600">Add to home screen for better experience</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDismiss}
                            className="p-2 hover:bg-white/10 dark:hover:bg-slate-200/50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg active:scale-95 transition-transform"
                        >
                            Install
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
